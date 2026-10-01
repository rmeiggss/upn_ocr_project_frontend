import { DocumentoContable } from './comprobante.model';

export interface ReporteAuditoria {
  totalDocumentos: number;
  totalAprobados: number;
  totalObservados: number;
  totalDiscrepancias: number;
  tasaEfectividadOcr: number;
  documentos: DocumentoContable[];
}

export interface ReporteFiltro {
  fechaDesde?: string;
  fechaHasta?: string;
  idTicket?: number;
  estado?: string;
}
