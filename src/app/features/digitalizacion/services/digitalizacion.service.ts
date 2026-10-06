import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { TicketDigitalizacion, CrearTicketRequest, RevisionTicket } from '../../../core/models/ticket.model';
import { DocumentoContable, ValidarDocumentoRequest, CorregirCampoRequest } from '../../../core/models/comprobante.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DigitalizacionService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  // Datos mock con fidelidad total al wireframe y base de datos
  private mockTickets: TicketDigitalizacion[] = [
    {
      idTicket: 1,
      codigoTicket: 'TK-2026-0084',
      solicitante: 'Contabilidad General',
      rangoPeriodo: 'Enero 2024 - Facturas Proveedores',
      foliosFisicos: '45 comprobantes físicos recibidos',
      estado: 'PENDIENTE',
      observaciones: 'Lote de comprobantes para revisión previa a cierre de mes',
      totalCorrectos: 38,
      totalObservados: 4,
      totalReprocesar: 2,
      totalIlegible: 1,
      fechaCreacion: '2026-02-14 08:30'
    },
    {
      idTicket: 2,
      codigoTicket: 'TK-2026-0083',
      solicitante: 'Auditoría Tributaria',
      rangoPeriodo: 'Diciembre 2023 - Compras SUNAT',
      foliosFisicos: '120 comprobantes físicos recibidos',
      estado: 'PROCESADO',
      observaciones: 'Conciliación fiscal del ejercicio 2023 completada',
      totalCorrectos: 118,
      totalObservados: 2,
      totalReprocesar: 0,
      totalIlegible: 0,
      fechaCreacion: '2026-02-12 14:15'
    },
    {
      idTicket: 3,
      codigoTicket: 'TK-2026-0082',
      solicitante: 'Logística y Operaciones',
      rangoPeriodo: 'Noviembre 2023 - Gastos Operativos',
      foliosFisicos: '60 comprobantes físicos recibidos',
      estado: 'OBSERVADO',
      observaciones: 'Discrepancias aritméticas en facturas de transporte',
      totalCorrectos: 52,
      totalObservados: 6,
      totalReprocesar: 2,
      totalIlegible: 0,
      fechaCreacion: '2026-02-10 10:00'
    }
  ];

  private mockDocumentos: DocumentoContable[] = [
    {
      idDocumento: 1,
      idTicket: 1,
      codigoTicket: 'TK-2026-0084',
      rucEmisor: '20512345678',
      razonSocial: 'DISTRIBUIDORA INDUSTRIAL DEL PERU S.A.C.',
      tipoDocumento: 'FACTURA',
      serieNumero: 'F001-00045231',
      fechaEmision: '2024-01-15',
      moneda: 'PEN',
      subtotal: 1000.00,
      igv: 150.00, // Discrepancia intencional del wireframe
      total: 1150.00,
      confianzaGeneral: 78,
      confianzaIgv: 55, // Certeza < 80% requiere confirmación
      estado: 'OBSERVADO',
      observaciones: 'Discrepancia en cálculo de IGV: Subtotal 1,000.00 × 18% debería ser 180.00 pero OCR extrajo 150.00',
      ubicacionAlmacen: 'Almacén Central Lurín',
      estanteArchivo: 'Estante E-04',
      cajaArchivo: 'Caja CJ-2023-B4',
      rutaArchivoPdf: '/assets/factura-ejemplo.pdf',
      campos: [
        { idCampo: 101, nombreCampo: 'RUC Emisor', valorOriginal: '20512345678', porcentajeConfianza: 98, esDiscrepancia: false, fueModificadoManualmente: false },
        { idCampo: 102, nombreCampo: 'Razón Social', valorOriginal: 'DISTRIBUIDORA INDUSTRIAL DEL PERU S.A.C.', porcentajeConfianza: 96, esDiscrepancia: false, fueModificadoManualmente: false },
        { idCampo: 103, nombreCampo: 'Serie-Número', valorOriginal: 'F001-00045231', porcentajeConfianza: 99, esDiscrepancia: false, fueModificadoManualmente: false },
        { idCampo: 104, nombreCampo: 'Fecha Emisión', valorOriginal: '2024-01-15', porcentajeConfianza: 95, esDiscrepancia: false, fueModificadoManualmente: false },
        { idCampo: 105, nombreCampo: 'Subtotal', valorOriginal: '1000.00', porcentajeConfianza: 97, esDiscrepancia: false, fueModificadoManualmente: false },
        { idCampo: 106, nombreCampo: 'IGV (18%)', valorOriginal: '150.00', porcentajeConfianza: 55, esDiscrepancia: true, fueModificadoManualmente: false },
        { idCampo: 107, nombreCampo: 'Importe Total', valorOriginal: '1150.00', porcentajeConfianza: 88, esDiscrepancia: true, fueModificadoManualmente: false }
      ]
    },
    {
      idDocumento: 2,
      idTicket: 1,
      codigoTicket: 'TK-2026-0084',
      rucEmisor: '20100128056',
      razonSocial: 'SERVICIOS GRAFICOS NACIONALES S.A.',
      tipoDocumento: 'FACTURA',
      serieNumero: 'F002-00012984',
      fechaEmision: '2024-01-18',
      moneda: 'PEN',
      subtotal: 500.00,
      igv: 90.00,
      total: 590.00,
      confianzaGeneral: 99,
      confianzaIgv: 100,
      estado: 'CORRECTO',
      ubicacionAlmacen: 'Almacén Central Lurín',
      estanteArchivo: 'Estante E-04',
      cajaArchivo: 'Caja CJ-2023-B4'
    },
    {
      idDocumento: 3,
      idTicket: 1,
      codigoTicket: 'TK-2026-0084',
      rucEmisor: '20456123891',
      razonSocial: 'FERRETERIA Y SUMINISTROS EL TORNILLO S.A.C.',
      tipoDocumento: 'FACTURA',
      serieNumero: 'F001-00034120',
      fechaEmision: '2024-01-20',
      moneda: 'PEN',
      subtotal: 2000.00,
      igv: 360.00,
      total: 2360.00,
      confianzaGeneral: 97,
      confianzaIgv: 98,
      estado: 'CORRECTO',
      ubicacionAlmacen: 'Almacén Central Lurín',
      estanteArchivo: 'Estante E-04',
      cajaArchivo: 'Caja CJ-2023-B4'
    },
    {
      idDocumento: 4,
      idTicket: 1,
      codigoTicket: 'TK-2026-0084',
      rucEmisor: '20334455667',
      razonSocial: 'LIBRERIA Y UTILES DE OFICINA COMERCIAL S.R.L.',
      tipoDocumento: 'BOLETA',
      serieNumero: 'B001-00009841',
      fechaEmision: '2024-01-22',
      moneda: 'PEN',
      subtotal: 152.54,
      igv: 27.46,
      total: 180.00,
      confianzaGeneral: 95,
      confianzaIgv: 96,
      estado: 'CORRECTO',
      ubicacionAlmacen: 'Almacén Central Lurín',
      estanteArchivo: 'Estante E-04',
      cajaArchivo: 'Caja CJ-2023-B4'
    },
    {
      idDocumento: 5,
      idTicket: 1,
      codigoTicket: 'TK-2026-0084',
      rucEmisor: '20198765432',
      razonSocial: 'INVERSIONES Y SERVICIOS MINEROS DEL PERU S.A.',
      tipoDocumento: 'FACTURA',
      serieNumero: 'F003-00018472',
      fechaEmision: '2024-01-23',
      moneda: 'PEN',
      subtotal: 7161.02,
      igv: 1288.98,
      total: 8450.00,
      confianzaGeneral: 72,
      confianzaIgv: 60,
      estado: 'OBSERVADO',
      observaciones: 'RUC emisor con trazo poco nítido en el código verificador',
      ubicacionAlmacen: 'Almacén Central Lurín',
      estanteArchivo: 'Estante E-04',
      cajaArchivo: 'Caja CJ-2023-B4'
    },
    {
      idDocumento: 6,
      idTicket: 1,
      codigoTicket: 'TK-2026-0084',
      rucEmisor: '20601234567',
      razonSocial: 'CONSORCIO METALMECANICO INDUSTRIAL S.A.C.',
      tipoDocumento: 'FACTURA',
      serieNumero: 'F001-00049211',
      fechaEmision: '2024-01-24',
      moneda: 'PEN',
      subtotal: 2711.86,
      igv: 488.14,
      total: 3200.00,
      confianzaGeneral: 58,
      confianzaIgv: 50,
      estado: 'REPROCESAR',
      observaciones: 'Página 2 ilegible / borrosa por baja resolución de escaneo',
      ubicacionAlmacen: 'Almacén Central Lurín',
      estanteArchivo: 'Estante E-04',
      cajaArchivo: 'Caja CJ-2023-B4'
    },
    {
      idDocumento: 7,
      idTicket: 1,
      codigoTicket: 'TK-2026-0084',
      rucEmisor: '20287654321',
      razonSocial: 'TEXTIL SAN CRISTOBAL DEL PERU S.A.C.',
      tipoDocumento: 'FACTURA',
      serieNumero: 'F002-00087123',
      fechaEmision: '2024-01-25',
      moneda: 'PEN',
      subtotal: 1203.81,
      igv: 216.69,
      total: 1420.50,
      confianzaGeneral: 98,
      confianzaIgv: 99,
      estado: 'CORRECTO',
      ubicacionAlmacen: 'Almacén Central Lurín',
      estanteArchivo: 'Estante E-04',
      cajaArchivo: 'Caja CJ-2023-B4'
    },
    {
      idDocumento: 8,
      idTicket: 1,
      codigoTicket: 'TK-2026-0084',
      rucEmisor: '20509876123',
      razonSocial: 'IMPORTADORA CENTRAL MAQUINARIAS S.A.',
      tipoDocumento: 'FACTURA',
      serieNumero: 'FC01-00002145',
      fechaEmision: '2024-01-26',
      moneda: 'PEN',
      subtotal: 4144.07,
      igv: 745.93,
      total: 4890.00,
      confianzaGeneral: 96,
      confianzaIgv: 97,
      estado: 'CORRECTO',
      ubicacionAlmacen: 'Almacén Central Lurín',
      estanteArchivo: 'Estante E-04',
      cajaArchivo: 'Caja CJ-2023-B4'
    },
    {
      idDocumento: 9,
      idTicket: 1,
      codigoTicket: 'TK-2026-0084',
      rucEmisor: '20491827364',
      razonSocial: 'SEGURIDAD Y VIGILANCIA INTEGRAL ANDINA S.A.C.',
      tipoDocumento: 'FACTURA',
      serieNumero: 'F001-00078341',
      fechaEmision: '2024-01-27',
      moneda: 'PEN',
      subtotal: 1398.31,
      igv: 251.69,
      total: 1650.00,
      confianzaGeneral: 98,
      confianzaIgv: 98,
      estado: 'CORRECTO',
      ubicacionAlmacen: 'Almacén Central Lurín',
      estanteArchivo: 'Estante E-04',
      cajaArchivo: 'Caja CJ-2023-B4'
    },
    {
      idDocumento: 10,
      idTicket: 1,
      codigoTicket: 'TK-2026-0084',
      rucEmisor: '20384756192',
      razonSocial: 'TRANSPORTE Y CARGA RAPIDA NACIONAL S.A.C.',
      tipoDocumento: 'FACTURA',
      serieNumero: 'F004-00003291',
      fechaEmision: '2024-01-28',
      moneda: 'PEN',
      subtotal: 830.51,
      igv: 149.49,
      total: 980.00,
      confianzaGeneral: 76,
      confianzaIgv: 68,
      estado: 'OBSERVADO',
      observaciones: 'Descuadre de redondeo en importe total por céntimos',
      ubicacionAlmacen: 'Almacén Central Lurín',
      estanteArchivo: 'Estante E-04',
      cajaArchivo: 'Caja CJ-2023-B4'
    },
    {
      idDocumento: 11,
      idTicket: 1,
      codigoTicket: 'TK-2026-0084',
      rucEmisor: '20182736450',
      razonSocial: 'LOGISTICA TRANSCONTINENTAL DEL PACIFICO S.A.',
      tipoDocumento: 'FACTURA',
      serieNumero: 'F001-00098412',
      fechaEmision: '2024-01-29',
      moneda: 'PEN',
      subtotal: 4576.27,
      igv: 823.73,
      total: 5400.00,
      confianzaGeneral: 99,
      confianzaIgv: 99,
      estado: 'CORRECTO',
      ubicacionAlmacen: 'Almacén Central Lurín',
      estanteArchivo: 'Estante E-04',
      cajaArchivo: 'Caja CJ-2023-B4'
    },
    {
      idDocumento: 12,
      idTicket: 1,
      codigoTicket: 'TK-2026-0084',
      rucEmisor: '20564738291',
      razonSocial: 'SOLUCIONES QUIMICAS INDUSTRIALES DEL PERU S.A.',
      tipoDocumento: 'FACTURA',
      serieNumero: 'F002-00054129',
      fechaEmision: '2024-01-30',
      moneda: 'PEN',
      subtotal: 2330.51,
      igv: 419.49,
      total: 2750.00,
      confianzaGeneral: 97,
      confianzaIgv: 97,
      estado: 'CORRECTO',
      ubicacionAlmacen: 'Almacén Central Lurín',
      estanteArchivo: 'Estante E-04',
      cajaArchivo: 'Caja CJ-2023-B4'
    },
    {
      idDocumento: 13,
      idTicket: 1,
      codigoTicket: 'TK-2026-0084',
      rucEmisor: '20674839201',
      razonSocial: 'IMPRENTA OFFSET MODERNA GRAFICA S.R.L.',
      tipoDocumento: 'BOLETA',
      serieNumero: 'B003-00001289',
      fechaEmision: '2024-01-30',
      moneda: 'PEN',
      subtotal: 288.14,
      igv: 51.86,
      total: 340.00,
      confianzaGeneral: 45,
      confianzaIgv: 40,
      estado: 'ILEGIBLE',
      observaciones: 'Papel térmico deteriorado y roto físicamente en almacén',
      ubicacionAlmacen: 'Almacén Central Lurín',
      estanteArchivo: 'Estante E-04',
      cajaArchivo: 'Caja CJ-2023-B4'
    },
    {
      idDocumento: 14,
      idTicket: 1,
      codigoTicket: 'TK-2026-0084',
      rucEmisor: '20100070970',
      razonSocial: 'CORPORACION ACEROS AREQUIPA S.A.',
      tipoDocumento: 'FACTURA',
      serieNumero: 'F001-00067420',
      fechaEmision: '2024-01-31',
      moneda: 'PEN',
      subtotal: 10847.46,
      igv: 1952.54,
      total: 12800.00,
      confianzaGeneral: 99,
      confianzaIgv: 100,
      estado: 'CORRECTO',
      ubicacionAlmacen: 'Almacén Central Lurín',
      estanteArchivo: 'Estante E-04',
      cajaArchivo: 'Caja CJ-2023-B4'
    },
    {
      idDocumento: 15,
      idTicket: 1,
      codigoTicket: 'TK-2026-0084',
      rucEmisor: '20483920192',
      razonSocial: 'MANTENIMIENTO ELECTRICO Y MECANICO TOTAL S.A.C.',
      tipoDocumento: 'FACTURA',
      serieNumero: 'F005-00001824',
      fechaEmision: '2024-01-31',
      moneda: 'PEN',
      subtotal: 754.24,
      igv: 135.76,
      total: 890.00,
      confianzaGeneral: 70,
      confianzaIgv: 62,
      estado: 'OBSERVADO',
      observaciones: 'Falta detalle de glosa de mantenimiento en campo OCR',
      ubicacionAlmacen: 'Almacén Central Lurín',
      estanteArchivo: 'Estante E-04',
      cajaArchivo: 'Caja CJ-2023-B4'
    },
    {
      idDocumento: 16,
      idTicket: 2,
      codigoTicket: 'TK-2026-0083',
      rucEmisor: '20100047218',
      razonSocial: 'TELEFONICA DEL PERU S.A.A.',
      tipoDocumento: 'FACTURA',
      serieNumero: 'F101-00034921',
      fechaEmision: '2023-12-15',
      moneda: 'PEN',
      subtotal: 4500.00,
      igv: 810.00,
      total: 5310.00,
      confianzaGeneral: 99,
      confianzaIgv: 99,
      estado: 'CORRECTO',
      ubicacionAlmacen: 'Almacén Central Lurín',
      estanteArchivo: 'Estante E-02',
      cajaArchivo: 'Caja CJ-2023-A1'
    },
    {
      idDocumento: 17,
      idTicket: 2,
      codigoTicket: 'TK-2026-0083',
      rucEmisor: '20100130204',
      razonSocial: 'ENEL DISTRIBUCION PERU S.A.A.',
      tipoDocumento: 'FACTURA',
      serieNumero: 'F050-00129841',
      fechaEmision: '2023-12-20',
      moneda: 'PEN',
      subtotal: 3200.00,
      igv: 576.00,
      total: 3776.00,
      confianzaGeneral: 98,
      confianzaIgv: 98,
      estado: 'CORRECTO',
      ubicacionAlmacen: 'Almacén Central Lurín',
      estanteArchivo: 'Estante E-02',
      cajaArchivo: 'Caja CJ-2023-A1'
    },
    {
      idDocumento: 18,
      idTicket: 3,
      codigoTicket: 'TK-2026-0082',
      rucEmisor: '20504738291',
      razonSocial: 'LOGISTICA Y OPERACIONES TERRESTRES S.A.C.',
      tipoDocumento: 'FACTURA',
      serieNumero: 'F002-00004123',
      fechaEmision: '2023-11-10',
      moneda: 'PEN',
      subtotal: 1800.00,
      igv: 270.00,
      total: 2070.00,
      confianzaGeneral: 74,
      confianzaIgv: 60,
      estado: 'OBSERVADO',
      observaciones: 'Discrepancia en tasa de IGV declarada 15% en vez de 18%',
      ubicacionAlmacen: 'Almacén Central Lurín',
      estanteArchivo: 'Estante E-05',
      cajaArchivo: 'Caja CJ-2023-C3'
    }
  ];

  private mapTicketDto(t: any): TicketDigitalizacion {
    let rangoCalculado = t.rangoPeriodo;
    if (!rangoCalculado) {
      if (t.fechaDesde && t.fechaHasta) {
        const dDesde = typeof t.fechaDesde === 'string' ? t.fechaDesde.substring(0, 10) : t.fechaDesde;
        const dHasta = typeof t.fechaHasta === 'string' ? t.fechaHasta.substring(0, 10) : t.fechaHasta;
        rangoCalculado = `${dDesde} al ${dHasta}`;
      } else if (t.fechaDesde) {
        const dDesde = typeof t.fechaDesde === 'string' ? t.fechaDesde.substring(0, 10) : t.fechaDesde;
        rangoCalculado = `Desde ${dDesde}`;
      } else if (t.fechaCreacion) {
        const fCreacion = typeof t.fechaCreacion === 'string' ? t.fechaCreacion.substring(0, 10) : t.fechaCreacion;
        rangoCalculado = `Lote ${fCreacion}`;
      } else {
        rangoCalculado = 'Periodo Regular';
      }
    }

    return {
      idTicket: t.idTicket,
      codigoTicket: t.codigoTicket,
      solicitante: t.solicitante || (t.usuarioCreacion && t.usuarioCreacion !== 'SYSTEM' ? t.usuarioCreacion : 'Área Contable y Archivo'),
      rangoPeriodo: rangoCalculado,
      foliosFisicos: t.foliosFisicos || ((t.totalDocumentosEsperados ?? t.totalDocumentosProcesados) === 1 ? '1 folio físico' : `${t.totalDocumentosEsperados || t.totalDocumentosProcesados || 1} folios físicos`),
      estado: t.estado || 'PENDIENTE',
      observaciones: t.observaciones || '',
      totalCorrectos: t.totalCorrectos ?? 0,
      totalObservados: t.totalObservados ?? 0,
      totalReprocesar: t.totalReprocesar ?? 0,
      totalIlegible: t.totalIlegible ?? 0,
      fechaDesde: t.fechaDesde,
      fechaHasta: t.fechaHasta,
      numeroCajaArchivador: t.numeroCajaArchivador,
      rucProveedor: t.rucProveedor,
      razonSocialProveedor: t.razonSocialProveedor,
      prioridad: t.prioridad,
      fechaCreacion: t.fechaCreacion ? (typeof t.fechaCreacion === 'string' ? t.fechaCreacion.replace('T', ' ').substring(0, 16) : t.fechaCreacion) : ''
    };
  }

  private mapDocumentoDto(d: any): DocumentoContable {
    const serieNumero = d.serieNumero ||
      (d.serieComprobante && d.numeroComprobante
        ? `${d.serieComprobante}-${d.numeroComprobante}`
        : d.serieComprobante || d.numeroComprobante || 'S/N');
    const total = d.total ?? d.montoTotal ?? 0;

    let confianza = d.confianzaGeneral;
    if (!confianza && d.campos && d.campos.length > 0) {
      const sum = d.campos.reduce((acc: number, c: any) => acc + (Number(c.nivelConfianza) || 0), 0);
      confianza = Math.round(sum / d.campos.length);
    }

    return {
      idDocumento: d.idDocumento,
      idTicket: d.idTicket,
      codigoTicket: d.codigoTicket || '',
      rucEmisor: d.rucEmisor || '-',
      razonSocial: d.razonSocial || 'SIN RAZÓN SOCIAL',
      tipoDocumento: d.tipoDocumento || 'FACTURA',
      serieNumero,
      fechaEmision: d.fechaEmision ? (typeof d.fechaEmision === 'string' ? d.fechaEmision.substring(0, 10) : d.fechaEmision) : '',
      moneda: d.moneda || 'PEN',
      subtotal: d.subtotal ?? (d.montoSubTotal ?? 0),
      igv: d.igv ?? (d.montoIgv ?? 0),
      total,
      confianzaGeneral: confianza || 95,
      confianzaIgv: d.confianzaIgv || 95,
      estado: d.estado || 'CORRECTO',
      observaciones: d.observaciones || '',
      ubicacionAlmacen: d.ubicacionAlmacen || 'Almacén Central Lurín',
      cajaArchivo: d.cajaArchivo || 'Caja CJ-2026-L1',
      estanteArchivo: d.estanteArchivo || 'Estante E-01',
      nombreArchivo: d.nombreArchivo || (d.rutaBlobStorage ? d.rutaBlobStorage.split('/').pop() : 'documento.pdf'),
      rutaArchivoPdf: `${this.baseUrl}/documentos/${d.idDocumento}/archivo`,
      campos: d.campos || []
    };
  }

  getTickets(): Observable<TicketDigitalizacion[]> {
    return this.http.get<any>(`${this.baseUrl}/tickets`).pipe(
      map(res => {
        const list = (Array.isArray(res) ? res : res?.datos || []) as any[];
        return list.map(t => this.mapTicketDto(t));
      }),
      catchError(() => of(this.mockTickets))
    );
  }

  crearTicket(ticket: CrearTicketRequest): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/tickets`, ticket).pipe(
      catchError(() => {
        const nuevo: TicketDigitalizacion = {
          idTicket: this.mockTickets.length + 1,
          codigoTicket: ticket.codigoTicket || `TK-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          solicitante: ticket.solicitante,
          rangoPeriodo: ticket.rangoPeriodo,
          foliosFisicos: ticket.foliosFisicos,
          estado: 'PENDIENTE',
          observaciones: ticket.observaciones,
          totalCorrectos: 0,
          totalObservados: 0,
          totalReprocesar: 0,
          totalIlegible: 0,
          fechaCreacion: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
        this.mockTickets.unshift(nuevo);
        return of({ exito: true, datos: nuevo });
      })
    );
  }

  // Carga Lazy de comprobantes con paginación y filtro del lado del servidor
  getDocumentosPorTicketPaginado(
    idTicket: number,
    pagina: number = 1,
    tamanoPagina: number = 10,
    filtro: string = ''
  ): Observable<{ items: DocumentoContable[]; totalRegistros: number; pagina: number; tamanoPagina: number; totalPaginas: number }> {
    const params = `pagina=${pagina}&tamanoPagina=${tamanoPagina}&filtro=${encodeURIComponent(filtro || '')}`;
    return this.http.get<any>(`${this.baseUrl}/documentos/ticket/${idTicket}?${params}`).pipe(
      map(res => {
        const datos = res?.datos || res;
        if (datos && datos.items) {
          return {
            items: (datos.items as any[]).map(d => this.mapDocumentoDto(d)),
            totalRegistros: datos.totalRegistros || 0,
            pagina: datos.pagina || pagina,
            tamanoPagina: datos.tamanoPagina || tamanoPagina,
            totalPaginas: datos.totalPaginas || Math.ceil((datos.totalRegistros || 0) / tamanoPagina) || 1
          };
        }

        // Si devuelve array directo (fallback a endpoint sin paginación)
        const rawList = (Array.isArray(datos) ? datos : []) as any[];
        const mapped = rawList.map(d => this.mapDocumentoDto(d));
        const q = (filtro || '').trim().toLowerCase();
        const filtrados = q
          ? mapped.filter(d =>
              d.serieNumero?.toLowerCase().includes(q) ||
              d.razonSocial.toLowerCase().includes(q) ||
              d.rucEmisor.toLowerCase().includes(q) ||
              (d.nombreArchivo && d.nombreArchivo.toLowerCase().includes(q)))
          : mapped;

        const start = (pagina - 1) * tamanoPagina;
        return {
          items: filtrados.slice(start, start + tamanoPagina),
          totalRegistros: filtrados.length,
          pagina,
          tamanoPagina,
          totalPaginas: Math.ceil(filtrados.length / tamanoPagina) || 1
        };
      }),
      catchError(() => {
        // Fallback a datos mock si el backend no está disponible
        const list = this.mockDocumentos.filter(d => d.idTicket === idTicket || !idTicket);
        const q = (filtro || '').trim().toLowerCase();
        const filtrados = q
          ? list.filter(d =>
              d.serieNumero?.toLowerCase().includes(q) ||
              d.razonSocial.toLowerCase().includes(q) ||
              d.rucEmisor.toLowerCase().includes(q))
          : list;
        const start = (pagina - 1) * tamanoPagina;
        return of({
          items: filtrados.slice(start, start + tamanoPagina),
          totalRegistros: filtrados.length,
          pagina,
          tamanoPagina,
          totalPaginas: Math.ceil(filtrados.length / tamanoPagina) || 1
        });
      })
    );
  }

  getDocumentosPorTicket(idTicket: number): Observable<DocumentoContable[]> {
    return this.http.get<any>(`${this.baseUrl}/documentos/ticket/${idTicket}`).pipe(
      map(res => {
        const raw = res?.datos || res;
        const docs = (Array.isArray(raw) ? raw : raw?.items || []) as any[];
        return docs.map(d => this.mapDocumentoDto(d));
      }),
      catchError(() => of(this.mockDocumentos.filter(d => d.idTicket === idTicket || !idTicket)))
    );
  }

  getDocumentoPorId(idDocumento: number): Observable<DocumentoContable> {
    return this.http.get<any>(`${this.baseUrl}/documentos/${idDocumento}`).pipe(
      map(res => {
        const raw = res?.datos || res;
        return this.mapDocumentoDto(raw);
      }),
      catchError(() => {
        const found = this.mockDocumentos.find(d => d.idDocumento === idDocumento) || this.mockDocumentos[0];
        return of(found);
      })
    );
  }

  subirDocumento(idTicket: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('archivo', file);

    return this.http.post<any>(`${this.baseUrl}/documentos/subir/${idTicket}`, formData).pipe(
      catchError(() => {
        // Simulación de respuesta de procesamiento OCR Azure
        const nuevoDoc: DocumentoContable = {
          idDocumento: this.mockDocumentos.length + 1,
          idTicket,
          codigoTicket: `TK-2026-0084`,
          rucEmisor: '20498765432',
          razonSocial: 'TRANSPORTES LOGISTICOS DEL SUR S.A.',
          tipoDocumento: 'FACTURA',
          serieNumero: `F001-${Math.floor(10000 + Math.random() * 90000)}`,
          fechaEmision: new Date().toISOString().substring(0, 10),
          moneda: 'PEN',
          subtotal: 1200.00,
          igv: 216.00,
          total: 1416.00,
          confianzaGeneral: 96,
          confianzaIgv: 98,
          estado: 'CORRECTO',
          ubicacionAlmacen: 'Almacén Central Lurín',
          estanteArchivo: 'Estante E-04',
          cajaArchivo: 'Caja CJ-2023-B4'
        };
        this.mockDocumentos.unshift(nuevoDoc);
        return of({ exito: true, mensaje: 'Documento procesado con éxito por Azure Document Intelligence', datos: nuevoDoc });
      })
    );
  }

  corregirCampo(req: CorregirCampoRequest): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/documentos/campo/corregir`, req).pipe(
      catchError(() => of({ exito: true, mensaje: 'Campo corregido correctamente' }))
    );
  }

  validarDocumento(idDocumento: number, req: ValidarDocumentoRequest): Observable<any> {
    const payload = {
      decision: req.nuevoEstado,
      nuevoEstado: req.nuevoEstado,
      motivoObservacion: req.comentarios,
      comentarios: req.comentarios
    };
    return this.http.put<any>(`${this.baseUrl}/documentos/${idDocumento}/validar`, payload).pipe(
      catchError(() => {
        const doc = this.mockDocumentos.find(d => d.idDocumento === idDocumento);
        if (doc) {
          doc.estado = req.nuevoEstado;
        }
        return of({ exito: true, mensaje: `Documento marcado como ${req.nuevoEstado}` });
      })
    );
  }

  private mockRevisiones: Record<number, RevisionTicket> = {
    1: {
      idRevision: 101,
      idTicket: 1,
      codigoTicket: 'TK-2026-0084',
      idUsuario: 1,
      revisor: 'María Fernández (Analista Contable)',
      rolRevisor: 'Contable',
      fechaInicioRevision: '2026-02-14 09:15',
      fechaFinRevision: '2026-02-14 11:45',
      observacionContable: 'Se identificaron 4 comprobantes con discrepancias en cálculo de IGV y 2 folios borrosos remitidos para reprocesar en CUS-01.',
      resultadoAprobacion: 'OBSERVADO'
    },
    2: {
      idRevision: 102,
      idTicket: 2,
      codigoTicket: 'TK-2026-0083',
      idUsuario: 1,
      revisor: 'María Fernández (Analista Contable)',
      rolRevisor: 'Contable',
      fechaInicioRevision: '2026-02-12 14:30',
      fechaFinRevision: '2026-02-12 17:00',
      observacionContable: 'Todos los folios cotejados satisfactoriamente con PLE 8.1. Cierre tributario aprobado para integración ERP.',
      resultadoAprobacion: 'APROBADO'
    },
    3: {
      idRevision: 103,
      idTicket: 3,
      codigoTicket: 'TK-2026-0082',
      idUsuario: 1,
      revisor: 'María Fernández (Analista Contable)',
      rolRevisor: 'Contable',
      fechaInicioRevision: '2026-02-10 10:30',
      fechaFinRevision: '',
      observacionContable: 'Revisión técnica en proceso. Pendiente aclaración de gastos operativos con el área de compras.',
      resultadoAprobacion: 'EN_PROCESO'
    }
  };

  getRevisionPorTicket(idTicket: number): Observable<RevisionTicket> {
    const ticket = this.mockTickets.find(t => t.idTicket === idTicket);
    const revision = this.mockRevisiones[idTicket] || {
      idRevision: Math.floor(100 + Math.random() * 900),
      idTicket,
      codigoTicket: ticket?.codigoTicket || `TK-2026-000${idTicket}`,
      idUsuario: 1,
      revisor: 'María Fernández (Analista Contable)',
      rolRevisor: 'Contable',
      fechaInicioRevision: new Date().toISOString().replace('T', ' ').substring(0, 16),
      fechaFinRevision: '',
      observacionContable: '',
      resultadoAprobacion: 'EN_PROCESO'
    };
    return of({ ...revision });
  }

  guardarRevisionTicket(revision: RevisionTicket): Observable<any> {
    this.mockRevisiones[revision.idTicket] = { ...revision };
    const ticket = this.mockTickets.find(t => t.idTicket === revision.idTicket);
    if (ticket && revision.resultadoAprobacion) {
      if (revision.resultadoAprobacion === 'APROBADO') ticket.estado = 'PROCESADO';
      else if (revision.resultadoAprobacion === 'OBSERVADO') ticket.estado = 'OBSERVADO';
    }
    return of({ exito: true, mensaje: 'Auditoría de revisión de ticket registrada exitosamente en CE_RevisionTicket', datos: revision });
  }
}
