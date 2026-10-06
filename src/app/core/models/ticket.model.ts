export interface TicketDigitalizacion {
  idTicket: number;
  codigoTicket: string;
  solicitante: string;
  rangoPeriodo: string;
  foliosFisicos: string;
  estado: 'PENDIENTE' | 'PROCESANDO' | 'PROCESADO' | 'OBSERVADO' | string;
  observaciones?: string;
  totalCorrectos: number;
  totalObservados: number;
  totalReprocesar: number;
  totalIlegible: number;
  fechaDesde?: string;
  fechaHasta?: string;
  numeroCajaArchivador?: string;
  rucProveedor?: string;
  razonSocialProveedor?: string;
  prioridad?: string;
  fechaCreacion?: string;
  fechaCierre?: string;
}

export interface CrearTicketRequest {
  codigoTicket?: string;
  solicitante: string;
  rangoPeriodo: string;
  foliosFisicos: string;
  observaciones?: string;
}

export interface RevisionTicket {
  idRevision: number;
  idTicket: number;
  codigoTicket: string;
  idUsuario: number;
  revisor: string;
  rolRevisor: string;
  fechaInicioRevision: string;
  fechaFinRevision?: string;
  observacionContable: string;
  resultadoAprobacion: 'APROBADO' | 'OBSERVADO' | 'RECHAZADO' | 'EN_PROCESO' | string;
}

