import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ReporteAuditoria, ReporteFiltro } from '../../../core/models/reporte.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  private mockReporte: ReporteAuditoria = {
    totalDocumentos: 225,
    totalAprobados: 208,
    totalObservados: 12,
    totalDiscrepancias: 5,
    tasaEfectividadOcr: 92.44,
    documentos: [
      {
        idDocumento: 1,
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
        observaciones: 'IGV corregido manualmente por analista contable'
      },
      {
        idDocumento: 2,
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
        estado: 'CORRECTO'
      },
      {
        idDocumento: 3,
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
        observaciones: 'Firma ilegible en comprobante físico escaneado'
      }
    ]
  };

  obtenerReporteAuditoria(filtro?: ReporteFiltro): Observable<ReporteAuditoria> {
    return this.http.get<any>(`${this.baseUrl}/reportes/auditoria`).pipe(
      map(res => (res?.datos || res) as ReporteAuditoria),
      catchError(() => of(this.mockReporte))
    );
  }

  exportarCsv(filtro?: ReporteFiltro): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/reportes/auditoria/exportar`, { responseType: 'blob' }).pipe(
      catchError(() => {
        // Fallback local: Generar CSV sintético en el navegador
        const csvContent = 'ID,RUC,RazonSocial,SerieNumero,Fecha,Subtotal,IGV,Total,Estado\n' +
          '1,20512345678,DISTRIBUIDORA INDUSTRIAL DEL PERU S.A.C.,F001-00045231,2024-01-15,1000.00,180.00,1180.00,CORRECTO\n' +
          '2,20100128056,SERVICIOS GRAFICOS NACIONALES S.A.,F002-00012984,2023-12-18,2500.00,450.00,2950.00,CORRECTO\n' +
          '3,20498765432,TRANSPORTES LOGISTICOS DEL SUR S.A.,F003-00088712,2023-11-20,800.00,144.00,944.00,OBSERVADO\n';
        return of(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }));
      })
    );
  }
}
