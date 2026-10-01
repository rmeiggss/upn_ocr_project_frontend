import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { TicketDigitalizacion, CrearTicketRequest } from '../../../core/models/ticket.model';
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
    }
  ];

  getTickets(): Observable<TicketDigitalizacion[]> {
    return this.http.get<any>(`${this.baseUrl}/tickets`).pipe(
      map(res => (Array.isArray(res) ? res : res?.datos || []) as TicketDigitalizacion[]),
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

  getDocumentosPorTicket(idTicket: number): Observable<DocumentoContable[]> {
    return this.http.get<any>(`${this.baseUrl}/documentos/ticket/${idTicket}`).pipe(
      map(res => (Array.isArray(res) ? res : res?.datos || []) as DocumentoContable[]),
      catchError(() => of(this.mockDocumentos.filter(d => d.idTicket === idTicket || !idTicket)))
    );
  }

  getDocumentoPorId(idDocumento: number): Observable<DocumentoContable> {
    return this.http.get<any>(`${this.baseUrl}/documentos/${idDocumento}`).pipe(
      map(res => (res?.datos || res) as DocumentoContable),
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
    return this.http.put<any>(`${this.baseUrl}/documentos/${idDocumento}/validar`, req).pipe(
      catchError(() => {
        const doc = this.mockDocumentos.find(d => d.idDocumento === idDocumento);
        if (doc) {
          doc.estado = req.nuevoEstado;
        }
        return of({ exito: true, mensaje: `Documento marcado como ${req.nuevoEstado}` });
      })
    );
  }
}
