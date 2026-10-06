import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="flex h-screen bg-slate-50 font-sans text-slate-800 antialiased overflow-hidden">
      <!-- SIDEBAR NAVEGACIÓN -->
      <aside class="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 text-slate-300 select-none z-20">
        <!-- Logo y Marca -->
        <div class="h-16 flex items-center gap-3 px-5 border-b border-slate-800 bg-slate-950">
          <div class="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-500/20">
            S
          </div>
          <div>
            <div class="text-sm font-bold text-white tracking-wide">SHOHIN S.A.</div>
            <div class="text-[10px] text-blue-400 font-medium tracking-tight">Archivo Contable Inteligente</div>
          </div>
        </div>

        <!-- Perfil Activo en Sidebar -->
        <div class="p-4 mx-3 my-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 flex items-center justify-center font-bold text-xs">
              {{ getUserInitials() }}
            </div>
            <div class="overflow-hidden">
              <div class="text-xs font-semibold text-white truncate">{{ currentUser()?.nombres }}</div>
              <div class="text-[10px] text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>{{ currentUser()?.rol }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Menú de Navegación por CUS -->
        <nav class="flex-1 px-3 space-y-1.5 overflow-y-auto pt-2">
          <div class="px-3 pb-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Módulos del Sistema</span>
            <span class="text-[9px] text-slate-600 font-mono" title="Acceso controlado según perfil">RBAC</span>
          </div>

          <!-- Recepción Lotes / Bandeja Tickets (CUS-01 & CUS-02) -->
          <a
            *ngIf="canAccess(['Personal de archivo', 'Contable', 'Administrador'])"
            routerLink="/digitalizacion/tickets"
            routerLinkActive="bg-blue-600 text-white font-medium shadow-md shadow-blue-600/30"
            title="Bandeja de Tickets y Digitalización de Lotes"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-all group">
            <i class="fas fa-boxes-packing w-4 text-center text-slate-400 group-hover:text-blue-400"></i>
            <div class="flex-1">
              <div class="font-medium text-slate-200 group-hover:text-white">Bandeja de Tickets</div>
              <div class="text-[10px] text-slate-400 font-normal opacity-75">Recepción y seguimiento</div>
            </div>
            <span class="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-blue-300 font-mono border border-slate-700">CUS-01/02</span>
          </a>

          <!-- Revisión OCR (CUS-02 & CUS-05) -->
          <a
            *ngIf="canAccess(['Contable', 'Administrador'])"
            routerLink="/digitalizacion/revision/1"
            routerLinkActive="bg-blue-600 text-white font-medium shadow-md shadow-blue-600/30"
            title="Casos de Uso CUS-02 / CUS-05: Supervisión, Control de Calidad y Corrección OCR"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-all group">
            <i class="fas fa-columns w-4 text-center text-slate-400 group-hover:text-blue-400"></i>
            <div class="flex-1">
              <div class="font-medium text-slate-200 group-hover:text-white">Revisión OCR</div>
              <div class="text-[10px] text-slate-400 font-normal opacity-75">Visor Splitscreen 50/50</div>
            </div>
            <span class="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-amber-300 font-mono border border-slate-700">CUS-02/05</span>
          </a>

          <!-- Archivo Histórico (CUS-03) -->
          <a
            *ngIf="canAccess(['Contable', 'SUNAT', 'Administrador'])"
            routerLink="/archivo-historico"
            routerLinkActive="bg-blue-600 text-white font-medium shadow-md shadow-blue-600/30"
            title="Caso de Uso CUS-03: Búsqueda y Localización en Archivo Histórico"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-all group">
            <i class="fas fa-archive w-4 text-center text-slate-400 group-hover:text-blue-400"></i>
            <div class="flex-1">
              <div class="font-medium text-slate-200 group-hover:text-white">Archivo Histórico</div>
              <div class="text-[10px] text-slate-400 font-normal opacity-75">Buscador y Almacén</div>
            </div>
            <span class="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-blue-300 font-mono border border-slate-700">CUS-03</span>
          </a>

          <!-- Reportes y Auditoría (CUS-04) -->
          <a
            *ngIf="canAccess(['SUNAT', 'Administrador'])"
            routerLink="/reportes"
            routerLinkActive="bg-blue-600 text-white font-medium shadow-md shadow-blue-600/30"
            title="Caso de Uso CUS-04: Reportes Tributarios y Auditoría SUNAT PLE 8.1"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-all group">
            <i class="fas fa-chart-pie w-4 text-center text-slate-400 group-hover:text-blue-400"></i>
            <div class="flex-1">
              <div class="font-medium text-slate-200 group-hover:text-white">Reportes y Auditoría</div>
              <div class="text-[10px] text-slate-400 font-normal opacity-75">SUNAT PLE 8.1</div>
            </div>
            <span class="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-blue-300 font-mono border border-slate-700">CUS-04</span>
          </a>

          <!-- Seguridad y Roles (CUS-06) -->
          <a
            *ngIf="canAccess(['Administrador'])"
            routerLink="/administracion"
            routerLinkActive="bg-blue-600 text-white font-medium shadow-md shadow-blue-600/30"
            title="Caso de Uso CUS-06: Gestión de Seguridad, Usuarios y Roles RBAC"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-all group">
            <i class="fas fa-users-gear w-4 text-center text-slate-400 group-hover:text-blue-400"></i>
            <div class="flex-1">
              <div class="font-medium text-slate-200 group-hover:text-white">Seguridad y Roles</div>
              <div class="text-[10px] text-slate-400 font-normal opacity-75">Usuarios y Parámetros</div>
            </div>
            <span class="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-blue-300 font-mono border border-slate-700">CUS-06</span>
          </a>
        </nav>

        <!-- Footer Sidebar -->
        <div class="p-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>API Online (.NET 10)</span>
          </div>
          <button (click)="logout()" title="Cerrar Sesión" class="text-slate-400 hover:text-rose-400 transition-colors p-1">
            <i class="fas fa-arrow-right-from-bracket"></i>
          </button>
        </div>
      </aside>

      <!-- CONTENEDOR PRINCIPAL -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <!-- HEADER TOP BAR -->
        <header class="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-10">
          <!-- Breadcrumb y Título -->
          <div class="flex items-center gap-3">
            <div class="text-xs font-medium text-slate-500 flex items-center gap-2">
              <i class="fas fa-layer-group text-blue-600"></i>
              <span>Shohin S.A.</span>
              <span class="text-slate-300">/</span>
              <span class="text-slate-700 font-semibold cursor-help" [title]="currentCusTooltip">{{ currentBreadcrumb }}</span>
            </div>
          </div>

          <!-- Indicador del Rol Autenticado -->
          <div class="flex items-center gap-3">
            <div
              class="flex items-center gap-2.5 px-3 py-1.5 bg-slate-100/90 border border-slate-200 rounded-xl"
              title="Rol institucional activo asignado a la sesión">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span class="text-xs text-slate-500 font-medium">Rol activo:</span>
              <span class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>{{ getRoleIcon(currentRole()) }}</span>
                <span>{{ currentRole() }}</span>
              </span>
            </div>

            <!-- Botón Cerrar Sesión -->
            <button
              (click)="logout()"
              title="Cerrar Sesión Activa"
              class="px-3 py-1.5 text-xs text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-xl transition-all flex items-center gap-1.5">
              <i class="fas fa-arrow-right-from-bracket"></i>
              <span class="hidden sm:inline font-medium">Salir</span>
            </button>
          </div>
        </header>

        <!-- ÁREA DE CONTENIDO (ROUTER OUTLET) -->
        <main class="flex-1 overflow-auto bg-slate-50 relative">
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- BANNER DE TOAST NOTIFICATIONS (GLOBAL) -->
      <div class="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <div
          *ngFor="let toast of toasts()"
          [ngClass]="getToastClasses(toast.type)"
          class="pointer-events-auto p-4 rounded-xl shadow-lg border flex items-start gap-3 transform transition-all animate-bounce-in">
          <div [ngClass]="getToastIconBg(toast.type)" class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold">
            <i [class]="getToastIcon(toast.type)"></i>
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-xs font-bold text-slate-800">{{ toast.title }}</div>
            <div class="text-xs text-slate-600 mt-0.5 leading-snug">{{ toast.message }}</div>
          </div>
          <button (click)="removeToast(toast.id)" class="text-slate-400 hover:text-slate-600 text-xs p-1">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    </div>
  `
})
export class MainLayoutComponent {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  currentUser = this.authService.currentUser;
  currentRole = this.authService.userRole;
  toasts = this.notificationService.toasts;

  currentBreadcrumb = 'Digitalización y Archivo Contable';
  currentCusTooltip = 'Sistema de Digitalización Shohin S.A.';

  constructor() {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      this.updateBreadcrumb();
    });
    this.updateBreadcrumb();
  }

  updateBreadcrumb(): void {
    const url = this.router.url;
    if (url.includes('/digitalizacion/tickets')) {
      this.currentBreadcrumb = 'Recepción y Digitalización de Lotes';
      this.currentCusTooltip = 'Caso de Uso CUS-01: Recepción de Lotes';
    } else if (url.includes('/digitalizacion/revision')) {
      this.currentBreadcrumb = 'Supervisión y Control de Calidad OCR';
      this.currentCusTooltip = 'Casos de Uso CUS-02 / CUS-05: Supervisión y Corrección OCR';
    } else if (url.includes('/archivo-historico')) {
      this.currentBreadcrumb = 'Archivo Histórico y Búsqueda';
      this.currentCusTooltip = 'Caso de Uso CUS-03: Búsqueda y Almacén Físico';
    } else if (url.includes('/reportes')) {
      this.currentBreadcrumb = 'Reportes Tributarios y Auditoría';
      this.currentCusTooltip = 'Caso de Uso CUS-04: Reportes Tributarios y PLE 8.1';
    } else if (url.includes('/administracion')) {
      this.currentBreadcrumb = 'Seguridad y Gestión de Roles';
      this.currentCusTooltip = 'Caso de Uso CUS-06: Seguridad y Parámetros RBAC';
    } else {
      this.currentBreadcrumb = 'Panel Principal';
      this.currentCusTooltip = 'Sistema de Digitalización Shohin S.A.';
    }
  }

  canAccess(roles: string[]): boolean {
    return this.authService.canAccess(roles);
  }

  getRoleIcon(role: string): string {
    switch (role) {
      case 'Contable': return '💼';
      case 'Personal de archivo': return '📁';
      case 'SUNAT': return '🔍';
      case 'Administrador': return '⚙️';
      default: return '👤';
    }
  }

  getUserInitials(): string {
    const nombres = this.currentUser()?.nombres || 'Admin';
    const parts = nombres.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return nombres.substring(0, 2).toUpperCase();
  }

  switchRole(roleKey: 'contable' | 'archivo' | 'sunat' | 'admin'): void {
    this.authService.switchRole(roleKey);
  }

  logout(): void {
    this.authService.logout();
  }

  removeToast(id: string): void {
    this.notificationService.remove(id);
  }

  getToastClasses(type: string): string {
    switch (type) {
      case 'success': return 'bg-white border-emerald-200 text-slate-800';
      case 'error': return 'bg-white border-rose-200 text-slate-800';
      case 'warning': return 'bg-white border-amber-200 text-slate-800';
      default: return 'bg-white border-blue-200 text-slate-800';
    }
  }

  getToastIconBg(type: string): string {
    switch (type) {
      case 'success': return 'bg-emerald-100 text-emerald-600';
      case 'error': return 'bg-rose-100 text-rose-600';
      case 'warning': return 'bg-amber-100 text-amber-600';
      default: return 'bg-blue-100 text-blue-600';
    }
  }

  getToastIcon(type: string): string {
    switch (type) {
      case 'success': return 'fas fa-check';
      case 'error': return 'fas fa-triangle-exclamation';
      case 'warning': return 'fas fa-exclamation';
      default: return 'fas fa-info';
    }
  }
}
