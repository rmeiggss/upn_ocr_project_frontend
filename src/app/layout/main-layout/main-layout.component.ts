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
          <div class="px-3 pb-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Casos de Uso del Sistema
          </div>

          <!-- CUS-01 -->
          <a
            routerLink="/digitalizacion/tickets"
            routerLinkActive="bg-blue-600 text-white font-medium shadow-md shadow-blue-600/30"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-all group">
            <i class="fas fa-boxes-packing w-4 text-center text-slate-400 group-hover:text-blue-400"></i>
            <div class="flex-1">
              <div>CUS-01: Recepción Lotes</div>
              <div class="text-[10px] text-slate-400 font-normal opacity-75">Bandeja de escaneo</div>
            </div>
          </a>

          <!-- CUS-02 & CUS-05 -->
          <a
            routerLink="/digitalizacion/revision/1"
            routerLinkActive="bg-blue-600 text-white font-medium shadow-md shadow-blue-600/30"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-all group">
            <i class="fas fa-columns w-4 text-center text-slate-400 group-hover:text-blue-400"></i>
            <div class="flex-1">
              <div>CUS-02 / CUS-05: Revisión OCR</div>
              <div class="text-[10px] text-slate-400 font-normal opacity-75">Visor Splitscreen 50/50</div>
            </div>
            <span class="px-1.5 py-0.5 text-[9px] font-bold bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">Criterio</span>
          </a>

          <!-- CUS-03 -->
          <a
            routerLink="/archivo-historico"
            routerLinkActive="bg-blue-600 text-white font-medium shadow-md shadow-blue-600/30"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-all group">
            <i class="fas fa-archive w-4 text-center text-slate-400 group-hover:text-blue-400"></i>
            <div class="flex-1">
              <div>CUS-03: Archivo Histórico</div>
              <div class="text-[10px] text-slate-400 font-normal opacity-75">Buscador y Almacén</div>
            </div>
          </a>

          <!-- CUS-04 -->
          <a
            routerLink="/reportes"
            routerLinkActive="bg-blue-600 text-white font-medium shadow-md shadow-blue-600/30"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-all group">
            <i class="fas fa-chart-pie w-4 text-center text-slate-400 group-hover:text-blue-400"></i>
            <div class="flex-1">
              <div>CUS-04: Reportes y Auditoría</div>
              <div class="text-[10px] text-slate-400 font-normal opacity-75">SUNAT PLE 8.1</div>
            </div>
          </a>

          <!-- CUS-06 -->
          <a
            routerLink="/administracion"
            routerLinkActive="bg-blue-600 text-white font-medium shadow-md shadow-blue-600/30"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-all group">
            <i class="fas fa-users-gear w-4 text-center text-slate-400 group-hover:text-blue-400"></i>
            <div class="flex-1">
              <div>CUS-06: Seguridad y Roles</div>
              <div class="text-[10px] text-slate-400 font-normal opacity-75">Usuarios y Parámetros</div>
            </div>
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
        <!-- HEADER TOP BAR CON SELECTOR DE ROL -->
        <header class="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-10">
          <!-- Breadcrumb y Título -->
          <div class="flex items-center gap-3">
            <div class="text-xs font-medium text-slate-500 flex items-center gap-2">
              <i class="fas fa-layer-group text-blue-600"></i>
              <span>Shohin S.A.</span>
              <span class="text-slate-300">/</span>
              <span class="text-slate-700 font-semibold">{{ currentBreadcrumb }}</span>
            </div>
          </div>

          <!-- Selector Rápido de Roles para la Demostración Académica -->
          <div class="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <span class="text-[11px] font-semibold text-slate-500 px-2 flex items-center gap-1">
              <i class="fas fa-id-badge text-blue-600"></i>
              <span>Simular Rol:</span>
            </span>

            <button
              (click)="switchRole('contable')"
              [class]="currentRole() === 'Contable' ? 'bg-white text-blue-700 shadow-sm font-bold border border-slate-200/80' : 'text-slate-600 hover:text-slate-900'"
              class="px-2.5 py-1 text-xs rounded-lg transition-all flex items-center gap-1.5">
              <span>💼</span> Contable
            </button>

            <button
              (click)="switchRole('archivo')"
              [class]="currentRole() === 'Personal de archivo' ? 'bg-white text-blue-700 shadow-sm font-bold border border-slate-200/80' : 'text-slate-600 hover:text-slate-900'"
              class="px-2.5 py-1 text-xs rounded-lg transition-all flex items-center gap-1.5">
              <span>📁</span> Personal de archivo
            </button>

            <button
              (click)="switchRole('sunat')"
              [class]="currentRole() === 'SUNAT' ? 'bg-white text-blue-700 shadow-sm font-bold border border-slate-200/80' : 'text-slate-600 hover:text-slate-900'"
              class="px-2.5 py-1 text-xs rounded-lg transition-all flex items-center gap-1.5">
              <span>🔍</span> SUNAT
            </button>

            <button
              (click)="switchRole('admin')"
              [class]="currentRole() === 'Administrador' ? 'bg-white text-blue-700 shadow-sm font-bold border border-slate-200/80' : 'text-slate-600 hover:text-slate-900'"
              class="px-2.5 py-1 text-xs rounded-lg transition-all flex items-center gap-1.5">
              <span>⚙️</span> Admin
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

  constructor() {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      this.updateBreadcrumb();
    });
  }

  updateBreadcrumb(): void {
    const url = this.router.url;
    if (url.includes('/digitalizacion/tickets')) this.currentBreadcrumb = 'CUS-01: Recepción y Digitalización de Lotes';
    else if (url.includes('/digitalizacion/revision')) this.currentBreadcrumb = 'CUS-02 / CUS-05: Supervisión y Control de Calidad OCR';
    else if (url.includes('/archivo-historico')) this.currentBreadcrumb = 'CUS-03: Búsqueda y Localización en Archivo Histórico';
    else if (url.includes('/reportes')) this.currentBreadcrumb = 'CUS-04: Reportes Tributarios y Auditoría';
    else if (url.includes('/administracion')) this.currentBreadcrumb = 'CUS-06: Gestión de Seguridad y Roles';
    else this.currentBreadcrumb = 'Panel Principal';
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
