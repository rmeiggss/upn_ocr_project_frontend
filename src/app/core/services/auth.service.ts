import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Usuario, LoginRequest, LoginResponse, ApiResponse } from '../models/usuario.model';
import { NotificationService } from './notification.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseUrl = environment.apiUrl;
  private readonly TOKEN_KEY = 'shohin_auth_token';
  private readonly USER_KEY = 'shohin_auth_user';

  private currentUserSignal = signal<Usuario | null>(this.getStoredUser());
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.currentUserSignal());
  readonly userRole = computed(() => this.currentUserSignal()?.rol || 'Contable');

  // Usuarios predeterminados para la demostración académica
  readonly demoUsers: Record<string, Usuario> = {
    contable: {
      idUsuario: 1,
      codigoUsuario: 'analista.contable@shohin.com',
      nombres: 'María Fernández (Analista Contable)',
      correo: 'maria.fernandez@shohin.com',
      rol: 'Contable',
      estado: true,
      permisos: 'Validación OCR, Conciliación, CUS-02, CUS-05'
    },
    archivo: {
      idUsuario: 2,
      codigoUsuario: 'archivo.digital@shohin.com',
      nombres: 'Carlos Mendoza (Personal de archivo)',
      correo: 'carlos.mendoza@shohin.com',
      rol: 'Personal de archivo',
      estado: true,
      permisos: 'Recepción Lotes, Búsqueda Almacén, CUS-01, CUS-03'
    },
    sunat: {
      idUsuario: 3,
      codigoUsuario: 'auditor.sunat@shohin.com',
      nombres: 'Dr. Roberto Campos (Auditor Tributario)',
      correo: 'roberto.campos@sunat.gob.pe',
      rol: 'SUNAT',
      estado: true,
      permisos: 'Reportes Tributarios, PLE 8.1, Inconsistencias, CUS-04'
    },
    admin: {
      idUsuario: 4,
      codigoUsuario: 'admin.sistemas@shohin.com',
      nombres: 'Ing. Alejandro Silva (Admin General TI)',
      correo: 'admin.sistemas@shohin.com',
      rol: 'Administrador',
      estado: true,
      permisos: 'Gestión Usuarios, Roles RBAC, Auditoría Total, CUS-06'
    }
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private notificationService: NotificationService
  ) {
    if (!this.currentUserSignal()) {
      // Iniciar sesión con el usuario de demostración Contable por defecto
      this.setUserSession(this.demoUsers['contable'], 'demo-jwt-token-shohin-enterprise-2026');
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  login(request: LoginRequest): Observable<ApiResponse<LoginResponse> | any> {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.baseUrl}/auth/login`, request).pipe(
      tap(res => {
        if (res && res.exito && res.datos) {
          this.setUserSession(res.datos.usuario, res.datos.token);
          this.notificationService.success(`Bienvenido al sistema, ${res.datos.usuario.nombres}`);
        }
      }),
      catchError(() => {
        // Fallback inteligente para demostración sin backend encendido
        const roleKey = request.codigoUsuario.includes('archivo') ? 'archivo' :
                        request.codigoUsuario.includes('sunat') ? 'sunat' :
                        request.codigoUsuario.includes('admin') ? 'admin' : 'contable';
        const user = this.demoUsers[roleKey] || this.demoUsers['contable'];
        const mockToken = 'mock-jwt-token-offline-mode-2026';
        this.setUserSession(user, mockToken);
        this.notificationService.success(`Sesión iniciada (Modo Demostración): ${user.nombres}`);
        return of({
          exito: true,
          mensaje: 'Autenticación exitosa (Fallback Local)',
          datos: { token: mockToken, usuario: user }
        });
      })
    );
  }

  // Permite al evaluador docente conmutar de rol en tiempo real desde el header
  switchRole(roleKey: 'contable' | 'archivo' | 'sunat' | 'admin'): void {
    const user = this.demoUsers[roleKey] || this.demoUsers['contable'];
    this.setUserSession(user, this.getToken() || 'demo-token');
    this.notificationService.info(`Rol activo conmutado a: [${user.rol}]`);

    // Redirigir a la vista nativa de cada rol
    switch (roleKey) {
      case 'archivo':
        this.router.navigate(['/digitalizacion/tickets']);
        break;
      case 'contable':
        this.router.navigate(['/digitalizacion/revision/1']);
        break;
      case 'sunat':
        this.router.navigate(['/reportes']);
        break;
      case 'admin':
        this.router.navigate(['/administracion']);
        break;
    }
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSignal.set(null);
    this.notificationService.info('Sesión cerrada correctamente');
    this.router.navigate(['/login']);
  }

  private setUserSession(user: Usuario, token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSignal.set(user);
  }

  private getStoredUser(): Usuario | null {
    try {
      const data = localStorage.getItem(this.USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }
}
