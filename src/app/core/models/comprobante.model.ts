export interface CampoExtraidoOcr {
  idCampo?: number;
  nombreCampo: string;
  valorOriginal: string;
  valorNormalizado?: string;
  porcentajeConfianza: number;
  esDiscrepancia: boolean;
  fueModificadoManualmente: boolean;
  coordenadasBbox?: string;
}

export interface DocumentoContable {
  idDocumento: number;
  idTicket?: number;
  codigoTicket?: string;
  rucEmisor: string;
  razonSocial: string;
  tipoDocumento: string;
  serieNumero: string;
  fechaEmision: string;
  moneda: string;
  subtotal: number;
  igv: number;
  total: number;
  confianzaGeneral: number;
  confianzaIgv: number;
  estado: 'CORRECTO' | 'OBSERVADO' | 'REPROCESAR' | 'ILEGIBLE' | string;
  observaciones?: string;
  ubicacionAlmacen?: string;
  cajaArchivo?: string;
  estanteArchivo?: string;
  rutaArchivoPdf?: string;
  campos?: CampoExtraidoOcr[];
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
  idDocumento: number;
  motivo: string;
  solicitante: string;
  estante: string;
  caja: string;
}
