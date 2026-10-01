import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { DocumentoContable, SolicitudBusquedaFisica } from '../../../core/models/comprobante.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ArchivoService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

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
      igv: 180.00,
      total: 1180.00,
      confianzaGeneral: 99,
      confianzaIgv: 100,
      estado: 'CORRECTO',
      ubicacionAlmacen: 'Almacén Central Lurín',
      estanteArchivo: 'Estante E-04',
      cajaArchivo: 'Caja CJ-2023-B4'
    },
    {
      idDocumento: 2,
      idTicket: 2,
      codigoTicket: 'TK-2026-0083',
      rucEmisor: '20100128056',
      razonSocial: 'SERVICIOS GRAFICOS NACIONALES S.A.',
      tipoDocumento: 'FACTURA',
      serieNumero: 'F002-00012984',
      fechaEmision: '2023-12-18',
      moneda: 'PEN',
      subtotal: 2500.00,
      igv: 450.00,
      total: 2950.00,
      confianzaGeneral: 98,
      confianzaIgv: 99,
      estado: 'CORRECTO',
      ubicacionAlmacen: 'Almacén Central Lurín',
      estanteArchivo: 'Estante E-02',
      cajaArchivo: 'Caja CJ-2023-A1'
    },
    {
      idDocumento: 3,
      idTicket: 3,
      codigoTicket: 'TK-2026-0082',
      rucEmisor: '20498765432',
      razonSocial: 'TRANSPORTES LOGISTICOS DEL SUR S.A.',
      tipoDocumento: 'FACTURA',
      serieNumero: 'F003-00088712',
      fechaEmision: '2023-11-20',
      moneda: 'PEN',
      subtotal: 800.00,
      igv: 144.00,
      total: 944.00,
      confianzaGeneral: 75,
      confianzaIgv: 72,
      estado: 'OBSERVADO',
      ubicacionAlmacen: 'Almacén Central Lurín',
      estanteArchivo: 'Estante E-05',
      cajaArchivo: 'Caja CJ-2023-C3'
    },
    {
      idDocumento: 4,
      idTicket: 2,
      codigoTicket: 'TK-2026-0083',
      rucEmisor: '20334455667',
      razonSocial: 'SOLUCIONES DIGITALES Y TI S.A.C.',
      tipoDocumento: 'FACTURA',
      serieNumero: 'F001-00003412',
      fechaEmision: '2023-12-05',
      moneda: 'PEN',
      subtotal: 4200.00,
      igv: 756.00,
      total: 4956.00,
      confianzaGeneral: 99,
      confianzaIgv: 100,
      estado: 'CORRECTO',
      ubicacionAlmacen: 'Almacén Central Lurín',
      estanteArchivo: 'Estante E-03',
      cajaArchivo: 'Caja CJ-2023-A9'
    }
  ];

  buscarDocumentos(filtros: any): Observable<DocumentoContable[]> {
    let params = new HttpParams();
    if (filtros.rucEmisor) params = params.set('rucEmisor', filtros.rucEmisor);
    if (filtros.serieNumero) params = params.set('serieNumero', filtros.serieNumero);
    if (filtros.estado) params = params.set('estado', filtros.estado);

    return this.http.get<any>(`${this.baseUrl}/historico/buscar`, { params }).pipe(
      map(res => (Array.isArray(res) ? res : res?.datos || []) as DocumentoContable[]),
      catchError(() => {
        let docs = [...this.mockDocumentos];
        if (filtros.rucEmisor) {
          docs = docs.filter(d => d.rucEmisor.includes(filtros.rucEmisor));
        }
        if (filtros.serieNumero) {
          docs = docs.filter(d => d.serieNumero.toLowerCase().includes(filtros.serieNumero.toLowerCase()));
        }
        if (filtros.estado) {
          docs = docs.filter(d => d.estado === filtros.estado);
        }
        return of(docs);
      })
    );
  }

  solicitarBusquedaFisica(solicitud: SolicitudBusquedaFisica): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/historico/solicitud-busqueda`, solicitud).pipe(
      catchError(() => of({
        exito: true,
        mensaje: 'Solicitud de desarchivamiento físico registrada con éxito para personal de almacén'
      }))
    );
  }
}
