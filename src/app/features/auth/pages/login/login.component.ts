import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex items-center justify-center p-4">
      <div class="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-slate-100 relative overflow-hidden">
        <!-- Decoración de fondo -->
        <div class="absolute -top-12 -right-12 w-40 h-40 bg-blue-100 rounded-full blur-2xl pointer-events-none opacity-60"></div>
        <div class="absolute -bottom-12 -left-12 w-40 h-40 bg-indigo-100 rounded-full blur-2xl pointer-events-none opacity-60"></div>

        <!-- Encabezado -->
        <div class="text-center mb-8 relative">
          <div class="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-500/30 mb-3">
            S
          </div>
          <h1 class="text-xl font-extrabold text-slate-800 tracking-tight">SHOHIN S.A.</h1>
          <p class="text-xs text-slate-500 mt-1">Sistema Integrado de Digitalización y Archivo Contable</p>
          <div
            class="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[11px] font-semibold cursor-help"
            title="Módulo de Seguridad RUP: Caso de Uso CUS-06 Control de Acceso y Roles">
            <span class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            Control de Acceso y Seguridad RBAC
          </div>
        </div>

        <!-- Formulario de Login -->
        <form (ngSubmit)="onSubmit()" class="space-y-4 relative">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Usuario o Correo Institucional
            </label>
            <div class="relative">
              <i class="fas fa-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
              <input
                type="text"
                [(ngModel)]="codigoUsuario"
                name="codigoUsuario"
                required
                placeholder="ej. analista.contable@shohin.com"
                class="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Contraseña
            </label>
            <div class="relative">
              <i class="fas fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
              <input
                type="password"
                [(ngModel)]="password"
                name="password"
                required
                placeholder="••••••••••••"
                class="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" />
            </div>
          </div>

          <button
            type="submit"
            [disabled]="loading"
            class="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
            <i *ngIf="loading" class="fas fa-spinner fa-spin"></i>
            <span>{{ loading ? 'Autenticando en Azure...' : 'Ingresar al Sistema' }}</span>
          </button>
        </form>

        <!-- Acceso Rápido para Demostración Académica -->
        <div class="mt-6 pt-5 border-t border-slate-100 relative">
          <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
            Acceso Rápido para Demostración
          </div>
          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              (click)="quickLogin('contable')"
              title="Caso de Uso CUS-02 / CUS-05: Supervisión y Corrección OCR"
              class="p-2.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition-all group">
              <div class="text-[11px] font-bold text-slate-700 group-hover:text-blue-700 flex items-center gap-1.5">
                <span>💼</span> Contable
              </div>
              <div class="text-[9px] text-slate-400">Revisión OCR y Validación</div>
            </button>

            <button
              type="button"
              (click)="quickLogin('archivo')"
              title="Caso de Uso CUS-01 / CUS-03: Recepción de Lotes y Archivo Histórico"
              class="p-2.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition-all group">
              <div class="text-[11px] font-bold text-slate-700 group-hover:text-blue-700 flex items-center gap-1.5">
                <span>📁</span> Archivo
              </div>
              <div class="text-[9px] text-slate-400">Recepción y Búsqueda</div>
            </button>

            <button
              type="button"
              (click)="quickLogin('sunat')"
              title="Caso de Uso CUS-04: Reportes Tributarios y Auditoría PLE 8.1"
              class="p-2.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition-all group">
              <div class="text-[11px] font-bold text-slate-700 group-hover:text-blue-700 flex items-center gap-1.5">
                <span>🔍</span> SUNAT
              </div>
              <div class="text-[9px] text-slate-400">Auditoría Tributaria</div>
            </button>

            <button
              type="button"
              (click)="quickLogin('admin')"
              title="Caso de Uso CUS-06: Gestión Integral de Usuarios y Seguridad"
              class="p-2.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition-all group">
              <div class="text-[11px] font-bold text-slate-700 group-hover:text-blue-700 flex items-center gap-1.5">
                <span>⚙️</span> Admin
              </div>
              <div class="text-[9px] text-slate-400">Acceso Total TI</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  codigoUsuario: string = 'analista.contable@shohin.com';
  password: string = 'Shohin2026!';
  loading: boolean = false;

  onSubmit(): void {
    if (!this.codigoUsuario) {
      this.notificationService.warning('Por favor ingrese un usuario válido.');
      return;
    }

    this.loading = true;
    this.authService.login({ codigoUsuario: this.codigoUsuario, password: this.password }).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.redirectByRole();
      },
      error: () => {
        this.loading = false;
        this.redirectByRole();
      }
    });
  }

  quickLogin(role: 'contable' | 'archivo' | 'sunat' | 'admin'): void {
    this.authService.switchRole(role);
  }

  private redirectByRole(): void {
    const home = this.authService.getHomeRouteForRole();
    this.router.navigate([home]);
  }
}
