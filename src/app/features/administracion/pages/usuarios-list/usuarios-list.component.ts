import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Usuario } from '../../../../core/models/usuario.model';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-usuarios-list',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent],
  template: `
    <div class="p-6 max-w-7xl mx-auto space-y-6">
      <!-- HEADER CUS-06 -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 class="text-lg font-extrabold text-slate-800 flex items-center gap-2">
            <span>Gestión de Seguridad y Roles (RBAC)</span>
            <span class="text-slate-400 hover:text-blue-600 cursor-help text-xs" title="Caso de Uso CUS-06: Mantenimiento de Usuarios y Roles RBAC">
              <i class="fas fa-circle-info"></i>
            </span>
          </h1>
          <p class="text-xs text-slate-500 mt-1">
            Administración de usuarios, control de accesos por rol y registro de auditoría transversal
          </p>
        </div>

        <button
          (click)="mostrarModalNuevo = true"
          class="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/30 rounded-xl transition-all flex items-center gap-2">
          <i class="fas fa-user-plus"></i>
          <span>Nuevo Usuario</span>
        </button>
      </div>

      <!-- MATRIZ DE ROLES Y USUARIOS -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between">
          <div class="text-xs font-bold text-slate-700 uppercase tracking-wider">Usuarios y Perfiles del Sistema</div>
          <div class="text-xs text-slate-400">{{ usuarios.length }} usuarios activos</div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-600">
            <thead class="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/60">
              <tr>
                <th class="py-3 px-4">Usuario / Colaborador</th>
                <th class="py-3 px-4">Correo Institucional</th>
                <th class="py-3 px-4">Rol Asignado</th>
                <th class="py-3 px-4">Permisos Clave</th>
                <th class="py-3 px-4">Último Acceso</th>
                <th class="py-3 px-4">Estado</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let u of usuarios" class="hover:bg-slate-50/80 transition-colors">
                <td class="py-3.5 px-4">
                  <div class="font-bold text-slate-800">{{ u.nombres }}</div>
                  <div class="text-[10px] text-slate-400 font-mono">ID: #{{ u.idUsuario }}</div>
                </td>
                <td class="py-3.5 px-4 font-mono text-slate-600">{{ u.correo }}</td>
                <td class="py-3.5 px-4">
                  <span [ngClass]="getRoleBadgeClasses(u.rol)" class="px-2.5 py-1 rounded-full text-[11px] font-bold border">
                    {{ u.rol }}
                  </span>
                </td>
                <td class="py-3.5 px-4 text-slate-500 text-[11px]">{{ u.permisos }}</td>
                <td class="py-3.5 px-4 text-slate-400 font-mono text-[11px]">{{ u.ultimoAcceso || 'Hoy' }}</td>
                <td class="py-3.5 px-4">
                  <app-status-badge [status]="u.estado ? 'ACTIVO' : 'INACTIVO'"></app-status-badge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- TRAZABILIDAD DE AUDITORIA TRANSVERSAL -->
      <!-- <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
        <div class="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between pb-2 border-b">
          <span>Pista de Auditoría Automática (AuditableEntity)</span>
          <span class="text-[10px] text-slate-400">SaveChangesAsync() Hook</span>
        </div>

        <div class="space-y-2 font-mono text-xs">
          <div class="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span class="text-slate-800">UPDATE DocumentoContable #1: IGV corregido a S/ 180.00</span>
            </div>
            <span class="text-slate-400 text-[10px]">maria.fernandez | 2026-02-15 09:25:12</span>
          </div>

          <div class="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-blue-500"></span>
              <span class="text-slate-800">INSERT TicketDigitalizacion #1: TK-2026-0084 creado</span>
            </div>
            <span class="text-slate-400 text-[10px]">carlos.mendoza | 2026-02-14 08:30:00</span>
          </div>

          <div class="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-amber-500"></span>
              <span class="text-slate-800">SELECT SolicitudBusqueda #1: Desarchivamiento de Caja CJ-2023-B4</span>
            </div>
            <span class="text-slate-400 text-[10px]">roberto.campos | 2026-02-14 16:50:33</span>
          </div>
        </div>
      </div> -->

      <!-- MODAL CREAR USUARIO (CUS-06) -->
      <div *ngIf="mostrarModalNuevo" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div class="flex items-center gap-2">
              <h3 class="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <span>Crear Usuario del Sistema</span>
                <span class="text-slate-400 hover:text-blue-600 cursor-help text-xs" title="Caso de Uso CUS-06: Registro de Nuevos Usuarios y Asignación de Roles">
                  <i class="fas fa-circle-info"></i>
                </span>
              </h3>
            </div>
            <button (click)="mostrarModalNuevo = false" class="text-slate-400 hover:text-slate-600">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <form (ngSubmit)="guardarUsuario()" class="space-y-4 mt-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Nombres y Apellidos</label>
              <input
                type="text"
                [(ngModel)]="nuevoUsuario.nombres"
                name="nombres"
                required
                placeholder="ej. Juan Pérez"
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white" />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Correo Institucional</label>
              <input
                type="email"
                [(ngModel)]="nuevoUsuario.correo"
                name="correo"
                required
                placeholder="juan.perez@shohin.com"
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white" />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Rol en el Sistema (RBAC)</label>
              <select
                [(ngModel)]="nuevoUsuario.rol"
                name="rol"
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white">
                <option value="Contable" title="Acceso a Supervisión OCR y Archivo Histórico">Contable</option>
                <option value="Personal de archivo" title="Acceso a Recepción de Lotes y Archivo Histórico">Personal de archivo</option>
                <option value="SUNAT" title="Acceso a Reportes Tributarios y Archivo Histórico">SUNAT (Auditor)</option>
                <option value="Administrador" title="Acceso Integral a Todos los Módulos">Administrador</option>
              </select>
            </div>

            <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                (click)="mostrarModalNuevo = false"
                class="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl">
                Cancelar
              </button>
              <button
                type="submit"
                class="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm">
                Guardar Usuario
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class UsuariosListComponent implements OnInit {
  private adminService = inject(AdminService);
  private notificationService = inject(NotificationService);

  usuarios: Usuario[] = [];
  mostrarModalNuevo: boolean = false;

  nuevoUsuario: Partial<Usuario> = {
    nombres: '',
    correo: '',
    rol: 'Contable'
  };

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.adminService.obtenerUsuarios().subscribe(users => {
      this.usuarios = users || [];
    });
  }

  guardarUsuario(): void {
    if (!this.nuevoUsuario.nombres || !this.nuevoUsuario.correo) {
      this.notificationService.warning('Complete todos los campos requeridos');
      return;
    }

    this.adminService.crearUsuario(this.nuevoUsuario).subscribe(() => {
      this.notificationService.success(`Usuario ${this.nuevoUsuario.nombres} creado satisfactoriamente`);
      this.mostrarModalNuevo = false;
      this.nuevoUsuario = { nombres: '', correo: '', rol: 'Contable' };
      this.cargarUsuarios();
    });
  }

  getRoleBadgeClasses(rol: string): string {
    switch (rol) {
      case 'Contable': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Personal de archivo': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'SUNAT': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Administrador': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  }
}
