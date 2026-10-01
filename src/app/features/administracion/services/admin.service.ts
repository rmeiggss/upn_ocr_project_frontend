import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Usuario } from '../../../core/models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5000/api';

  private mockUsuarios: Usuario[] = [
    {
      idUsuario: 1,
      codigoUsuario: 'analista.contable@shohin.com',
      nombres: 'María Fernández',
      correo: 'maria.fernandez@shohin.com',
      rol: 'Contable',
      estado: true,
      ultimoAcceso: '2026-02-15 09:20',
      permisos: 'Validación OCR, Conciliación, CUS-02, CUS-05'
    },
    {
      idUsuario: 2,
      codigoUsuario: 'archivo.digital@shohin.com',
      nombres: 'Carlos Mendoza',
      correo: 'carlos.mendoza@shohin.com',
      rol: 'Personal de archivo',
      estado: true,
      ultimoAcceso: '2026-02-15 08:15',
      permisos: 'Recepción Lotes, Búsqueda Almacén, CUS-01, CUS-03'
    },
    {
      idUsuario: 3,
      codigoUsuario: 'auditor.sunat@shohin.com',
      nombres: 'Roberto Campos',
      correo: 'roberto.campos@sunat.gob.pe',
      rol: 'SUNAT',
      estado: true,
      ultimoAcceso: '2026-02-14 16:45',
      permisos: 'Reportes PLE 8.1, Exportación, CUS-04'
    },
    {
      idUsuario: 4,
      codigoUsuario: 'admin.sistemas@shohin.com',
      nombres: 'Alejandro Silva',
      correo: 'admin.sistemas@shohin.com',
      rol: 'Administrador',
      estado: true,
      ultimoAcceso: '2026-02-15 10:02',
      permisos: 'Acceso Total, Logs, Gestión Usuarios, CUS-06'
    }
  ];

  obtenerUsuarios(): Observable<Usuario[]> {
    return this.http.get<any>(`${this.baseUrl}/auth/usuarios`).pipe(
      map(res => (Array.isArray(res) ? res : res?.datos || []) as Usuario[]),
      catchError(() => of(this.mockUsuarios))
    );
  }

  crearUsuario(usuario: Partial<Usuario>): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/usuarios`, usuario).pipe(
      catchError(() => {
        const nuevo: Usuario = {
          idUsuario: this.mockUsuarios.length + 1,
          codigoUsuario: usuario.correo || 'nuevo@shohin.com',
          nombres: usuario.nombres || 'Nuevo Colaborador',
          correo: usuario.correo || 'nuevo@shohin.com',
          rol: usuario.rol || 'Contable',
          estado: true,
          ultimoAcceso: 'Recién creado',
          permisos: `Permisos para ${usuario.rol}`
        };
        this.mockUsuarios.push(nuevo);
        return of({ exito: true, datos: nuevo });
      })
    );
  }
}
