import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface TicketItem {
  idTicket: number;
  codigoTicket: string;
  solicitante?: string;
  rangoPeriodo?: string;
  foliosFisicos?: string;
  estado: string; // PENDIENTE, PROCESANDO, PROCESADO, OBSERVADO
  observaciones?: string;
  totalCorrectos: number;
  totalObservados: number;
  totalReprocesar: number;
  totalIlegible: number;
  fechaCreacion?: string;
}

export interface DocumentoItem {
  idDocumento: number;
  idTicket?: number;
  codigoTicket?: string;
  rucEmisor: string;
  razonSocial: string;
  serieNumero: string;
  fechaEmision: string;
  subtotal: number;
  igv: number;
  total: number;
  moneda: string;
  estado: string; // CORRECTO, OBSERVADO, REPROCESAR, ILEGIBLE
  confianzaGeneral: number;
  confianzaIgv: number;
  hashSha256?: string;
  enErp?: boolean;
}

export interface UsuarioItem {
  idUsuario: number;
  codigoUsuario: string;
  nombres: string;
  correo: string;
  rol: string;
  tipoUsuario: string;
  permisos: string;
  estado: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ShohinApiService {
  private readonly baseUrl = 'http://localhost:5000/api';

  // Datos mock reactivos de alta fidelidad alineados al Wireframe oficial
  private mockTickets: TicketItem[] = [
    {
      idTicket: 1,
      codigoTicket: 'TK-2026-0089',
      solicitante: 'Contabilidad (Auditoría SUNAT)',
      rangoPeriodo: 'Octubre 2023 - Ferreyros',
      foliosFisicos: '34 folios (Conteo Exacto)',
      estado: 'PROCESADO',
      observaciones: 'Lote prioritario para fiscalización',
      totalCorrectos: 31,
      totalObservados: 2,
      totalReprocesar: 1,
      totalIlegible: 0
    },
    {
      idTicket: 2,
      codigoTicket: 'TK-2026-0092',
      solicitante: 'Contabilidad Central',
      rangoPeriodo: 'Enero 2022 - Gastos Varios',
      foliosFisicos: 'Flag: Más de 100 docs',
      estado: 'OBSERVADO',
      observaciones: 'Volumen masivo reportado por archivo',
      totalCorrectos: 92,
      totalObservados: 14,
      totalReprocesar: 0,
      totalIlegible: 1
    },
    {
      idTicket: 3,
      codigoTicket: 'TK-2026-0084',
      solicitante: 'Contabilidad General',
      rangoPeriodo: 'Setiembre 2023 - Rímac',
      foliosFisicos: '1 folio devuelto',
      estado: 'REPROCESAR',
      observaciones: 'Página 2 ilegible / borrosa',
      totalCorrectos: 0,
      totalObservados: 0,
      totalReprocesar: 1,
      totalIlegible: 0
    },
    {
      idTicket: 4,
      codigoTicket: 'TK-2026-0095',
      solicitante: 'Almacén Central',
      rangoPeriodo: 'Enero 2024 - Boletas',
      foliosFisicos: '15 folios pendientes',
      estado: 'PENDIENTE',
      observaciones: 'En espera de conteo físico en archivo',
      totalCorrectos: 0,
      totalObservados: 0,
      totalReprocesar: 0,
      totalIlegible: 0
    }
  ];

  private mockDocumentos: DocumentoItem[] = [
    {
      idDocumento: 1,
      idTicket: 1,
      codigoTicket: 'TK-2026-0089',
      rucEmisor: '20104008891',
      razonSocial: 'FERREYROS S.A.',
      serieNumero: 'F001-00045210',
      fechaEmision: '2023-10-15',
      subtotal: 12500.00,
      igv: 2250.00,
      total: 14750.00,
      moneda: 'PEN',
      estado: 'OBSERVADO', // Disparador para Splitscreen CUS-02 & CUS-05
      confianzaGeneral: 72,
      confianzaIgv: 68,
      hashSha256: 'e8a9f44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b785231bc',
      enErp: true
    },
    {
      idDocumento: 2,
      idTicket: 1,
      codigoTicket: 'TK-2026-0089',
      rucEmisor: '20512893410',
      razonSocial: 'DISTRIBUIDORA LIMA S.A.C.',
      serieNumero: 'E001-00012903',
      fechaEmision: '2023-08-04',
      subtotal: 2898.31,
      igv: 521.69,
      total: 3420.00,
      moneda: 'PEN',
      estado: 'CORRECTO',
      confianzaGeneral: 98,
      confianzaIgv: 99,
      hashSha256: 'c410b987e492b67891fa3023e4d82b1c98034afc28903e1a8b27c3e4f5a689ee',
      enErp: true
    },
    {
      idDocumento: 3,
      idTicket: 2,
      codigoTicket: 'TK-2026-0092',
      rucEmisor: '20456123789',
      razonSocial: 'SERVICIOS GRAFICOS DEL SUR',
      serieNumero: 'F005-00000841',
      fechaEmision: '2022-03-12',
      subtotal: 754.24,
      igv: 135.76,
      total: 890.00,
      moneda: 'PEN',
      estado: 'ILEGIBLE',
      confianzaGeneral: 45,
      confianzaIgv: 30,
      hashSha256: '9f21ac87e492b67891fa3023e4d82b1c98034afc28903e1a8b27c3e4f5a60012',
      enErp: false
    }
  ];

  private mockUsuarios: UsuarioItem[] = [
    {
      idUsuario: 1,
      codigoUsuario: 'carlos.contable@shohin.com',
      nombres: 'Carlos Mendoza (Jefe de Contabilidad)',
      correo: 'carlos.contable@shohin.com',
      rol: 'Contable',
      tipoUsuario: 'INTERNO',
      permisos: 'Validar OCR, Splitscreen, Sincronizar ERP',
      estado: true
    },
    {
      idUsuario: 2,
      codigoUsuario: 'archivo.operaciones@shohin.com',
      nombres: 'Personal de Archivo Central',
      correo: 'archivo.operaciones@shohin.com',
      rol: 'Personal de archivo',
      tipoUsuario: 'INTERNO',
      permisos: 'Recepción Tickets, Conteo Físico, Ingesta',
      estado: true
    },
    {
      idUsuario: 3,
      codigoUsuario: 'auditor.sunat@sunat.gob.pe',
      nombres: 'Delegación de Auditoría SUNAT',
      correo: 'auditor.sunat@sunat.gob.pe',
      rol: 'SUNAT',
      tipoUsuario: 'AUDITOR',
      permisos: 'Consulta Histórica, Generar Reportes',
      estado: true
    },
    {
      idUsuario: 4,
      codigoUsuario: 'admin.sistemas@shohin.com',
      nombres: 'Administrador General TI',
      correo: 'admin.sistemas@shohin.com',
      rol: 'Administrador',
      tipoUsuario: 'ADMIN',
      permisos: 'Acceso Total, Logs, Gestión Usuarios',
      estado: true
    }
  ];

  constructor(private http: HttpClient) {}

  getTickets(): Observable<TicketItem[]> {
    return this.http.get<any>(`${this.baseUrl}/tickets`).pipe(
      map(res => (Array.isArray(res) ? res : res?.datos || []) as TicketItem[]),
      catchError(() => of(this.mockTickets))
    );
  }

  getDocumentos(): Observable<DocumentoItem[]> {
    return this.http.get<any>(`${this.baseUrl}/historico/buscar`).pipe(
      map(res => (Array.isArray(res) ? res : res?.datos || []) as DocumentoItem[]),
      catchError(() => of(this.mockDocumentos))
    );
  }

  getUsuarios(): Observable<UsuarioItem[]> {
    return this.http.get<any>(`${this.baseUrl}/auth/usuarios`).pipe(
      map(res => (Array.isArray(res) ? res : res?.datos || []) as UsuarioItem[]),
      catchError(() => of(this.mockUsuarios))
    );
  }

  crearTicket(ticket: Partial<TicketItem>): Observable<any> {
    const nuevo: TicketItem = {
      idTicket: this.mockTickets.length + 1,
      codigoTicket: ticket.codigoTicket || `TK-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      solicitante: ticket.solicitante || 'Contabilidad General',
      rangoPeriodo: ticket.rangoPeriodo || 'Ejercicio 2023',
      foliosFisicos: ticket.foliosFisicos || 'Pendiente de conteo',
      estado: 'PENDIENTE',
      observaciones: ticket.observaciones || 'Ticket creado desde el sistema',
      totalCorrectos: 0,
      totalObservados: 0,
      totalReprocesar: 0,
      totalIlegible: 0
    };
    this.mockTickets.unshift(nuevo);
    return of({ exito: true, datos: nuevo });
  }

  actualizarEstadoDocumento(idDoc: number, nuevoEstado: string): Observable<boolean> {
    const doc = this.mockDocumentos.find(d => d.idDocumento === idDoc);
    if (doc) {
      doc.estado = nuevoEstado;
      return of(true);
    }
    return of(false);
  }

  corregirCampo(idDoc: number, nuevoIgv: number): Observable<boolean> {
    const doc = this.mockDocumentos.find(d => d.idDocumento === idDoc);
    if (doc) {
      doc.igv = nuevoIgv;
      doc.total = doc.subtotal + nuevoIgv;
      doc.confianzaIgv = 100;
      doc.confianzaGeneral = 99;
      doc.estado = 'CORRECTO';
      return of(true);
    }
    return of(false);
  }
}
