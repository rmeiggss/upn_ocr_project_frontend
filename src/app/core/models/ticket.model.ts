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
