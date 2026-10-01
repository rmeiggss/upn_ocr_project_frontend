export interface Usuario {
  idUsuario: number;
  codigoUsuario: string;
  nombres: string;
  correo: string;
  rol: 'Contable' | 'Personal de archivo' | 'SUNAT' | 'Administrador' | string;
  tipoUsuario?: string;
  estado: boolean;
  ultimoAcceso?: string;
  permisos?: string;
}

export interface LoginRequest {
  codigoUsuario: string;
  password?: string;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

export interface ApiResponse<T> {
  exito: boolean;
  mensaje: string;
  datos: T;
  errores?: string[];
}
