export interface CampoExtraidoOcr {
  idCampo?: number;
  nombreCampo: string;
  valorOriginal?: string;
  valorNormalizado?: string;
  valorExtraido?: string;
  valorCorregido?: string;
  porcentajeConfianza?: number;
  nivelConfianza?: number;
  esDiscrepancia?: boolean;
  fueModificadoManualmente?: boolean;
  coordenadasBbox?: string;
}

export interface DocumentoContable {
  idDocumento: number;
  idTicket?: number;
  codigoTicket?: string;
  rucEmisor: string;
  razonSocial: string;
  tipoDocumento: string;
  serieNumero?: string;
  serieComprobante?: string;
  numeroComprobante?: string;
  fechaEmision: string;
  moneda: string;
  subtotal?: number;
  igv?: number;
  total?: number;
  montoSubTotal?: number;
  montoIgv?: number;
  montoTotal?: number;
  confianzaGeneral?: number;
  confianzaIgv?: number;
  estado: 'CORRECTO' | 'OBSERVADO' | 'REPROCESAR' | 'ILEGIBLE' | string;
  observaciones?: string;
  origenDatos?: 'LOCAL' | 'ERP_ANTIGUO';
  ubicacionAlmacen?: string;
  cajaArchivo?: string;
  estanteArchivo?: string;
  rutaArchivoPdf?: string;
  nombreArchivo?: string;
  campos?: CampoExtraidoOcr[];
}

export interface DocumentoPaginadoResponse {
  items: DocumentoContable[];
  totalRegistros: number;
  pagina: number;
  tamanoPagina: number;
  totalPaginas: number;
}

export interface ValidarDocumentoRequest {
  nuevoEstado: 'CORRECTO' | 'OBSERVADO' | 'REPROCESAR' | 'ILEGIBLE' | string;
  comentarios?: string;
}

export interface CorregirCampoRequest {
  idCampo: number;
  nuevoValor: string;
  motivoCorreccion?: string;
}

export interface SolicitudBusquedaFisica {
  idDocumento?: number;
  motivo?: string;
  solicitante?: string;
  estante?: string;
  caja?: string;
}

export interface SolicitudBusquedaFisicaRequest {
  rucEmisor: string;
  razonSocial?: string;
  serieNumero?: string;
  tipoDocumento: string; // FACTURA, BOLETA, NOTA_CREDITO
  fechaDesde?: string;
  fechaHasta?: string;
  prioridad: string; // ALTA, MEDIA, BAJA
  numeroCajaArchivador?: string;
  totalDocumentosEsperados?: number;
  motivoSolicitud: string;
}

export interface SolicitudBusquedaFisicaResponse {
  idTicket: number;
  codigoTicket: string;
  estado: string;
  totalDocumentosEsperados: number;
  observaciones: string;
  fechaCreacion: string;
}

