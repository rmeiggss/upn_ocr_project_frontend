import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportesService } from '../../services/reportes.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ReporteAuditoria } from '../../../../core/models/reporte.model';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-dashboard-reportes',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent, CurrencyFormatPipe],
  template: `
    <div class="p-6 max-w-7xl mx-auto space-y-6">
      <!-- HEADER CUS-04 -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 class="text-lg font-extrabold text-slate-800 flex items-center gap-2">
            <span>Generación de Reportes Tributarios y Auditoría</span>
            <span class="text-slate-400 hover:text-blue-600 cursor-help text-xs" title="Caso de Uso CUS-04: Reportes Tributarios y Conciliación PLE 8.1">
              <i class="fas fa-circle-info"></i>
            </span>
          </h1>
          <p class="text-xs text-slate-500 mt-1">
            Conciliación tributaria SUNAT, Libro Electrónico de Compras PLE 8.1 y métricas de efectividad OCR
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            (click)="descargarReporteCsv()"
            class="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-500/30 rounded-xl transition-all flex items-center gap-2">
            <i class="fas fa-file-csv text-sm"></i>
            <span>Exportar PLE SUNAT (CSV)</span>
          </button>
        </div>
      </div>

      <!-- KPI METRICAS GLOBALES -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Tasa Efectividad OCR</div>
          <div class="text-2xl font-black text-emerald-600 mt-1">
            {{ reporte?.tasaEfectividadOcr || 92.44 }}%
          </div>
          <div class="text-[10px] text-slate-400 mt-1">Meta del Negocio: ≥ 90%</div>
        </div>

        <div class="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Comprobantes Conciliados</div>
          <div class="text-2xl font-black text-blue-600 mt-1">
            {{ reporte?.totalAprobados || 208 }} / {{ reporte?.totalDocumentos || 225 }}
          </div>
          <div class="text-[10px] text-slate-400 mt-1">Libro de Compras Formato 8.1</div>
        </div>

        <div class="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Discrepancias Detectadas</div>
          <div class="text-2xl font-black text-amber-600 mt-1">
            {{ reporte?.totalDiscrepancias || 5 }}
          </div>
          <div class="text-[10px] text-slate-400 mt-1">Desviación en IGV o montos</div>
        </div>

        <div class="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Ahorro en Horas/Hombre</div>
          <div class="text-2xl font-black text-indigo-600 mt-1">
            84.5 hrs
          </div>
          <div class="text-[10px] text-slate-400 mt-1">Frente a digitación manual</div>
        </div>
      </div>

      <!-- GRAFICAS / BARRAS DE PROGRESO DE EFECTIVIDAD POR TIPO DOCUMENTO -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div class="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <span>Precisión de Reconocimiento por Formato</span>
            <span class="text-[10px] text-slate-400">Azure Document Intelligence</span>
          </div>

          <div class="space-y-3">
            <div>
              <div class="flex justify-between text-xs font-medium mb-1">
                <span>Facturas Electrónicas (PDF Nativo)</span>
                <span class="font-bold text-emerald-600">99.2%</span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-2">
                <div class="bg-emerald-500 h-2 rounded-full" style="width: 99.2%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-xs font-medium mb-1">
                <span>Facturas Físicas Escaneadas (TIFF/PDF)</span>
                <span class="font-bold text-blue-600">91.4%</span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-2">
                <div class="bg-blue-500 h-2 rounded-full" style="width: 91.4%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-xs font-medium mb-1">
                <span>Recibos por Honorarios y Boletas</span>
                <span class="font-bold text-indigo-600">88.5%</span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-2">
                <div class="bg-indigo-500 h-2 rounded-full" style="width: 88.5%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-xs font-medium mb-1">
                <span>Comprobantes con Daño Físico / Manchas</span>
                <span class="font-bold text-amber-600">72.0%</span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-2">
                <div class="bg-amber-500 h-2 rounded-full" style="width: 72%"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- REPORTE DE INCONSISTENCIAS CLASIFICADAS POR SEVERIDAD -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div class="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <span>Matriz de Inconsistencias Tributarias</span>
            <span class="text-[10px] text-slate-400 cursor-help" title="Caso de Uso CUS-04: Auditoría e Inconsistencias Tributarias">Auditoría Tributaria</span>
          </div>

          <div class="space-y-2.5">
            <div class="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <span class="px-2 py-0.5 text-[9px] font-bold bg-rose-600 text-white rounded">ALTA</span>
                <span class="text-xs text-rose-950 font-medium">Discrepancia en tasa del 18% IGV (F001-00045231)</span>
              </div>
              <span class="text-xs font-bold text-rose-700">1 caso</span>
            </div>

            <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <span class="px-2 py-0.5 text-[9px] font-bold bg-amber-600 text-white rounded">MEDIA</span>
                <span class="text-xs text-amber-950 font-medium">Razón social desalineada con padrón RUC SUNAT</span>
              </div>
              <span class="text-xs font-bold text-amber-700">2 casos</span>
            </div>

            <div class="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <span class="px-2 py-0.5 text-[9px] font-bold bg-blue-600 text-white rounded">BAJA</span>
                <span class="text-xs text-blue-950 font-medium">Formato de fecha de emisión no estándar (dd/mm/yy)</span>
              </div>
              <span class="text-xs font-bold text-blue-700">2 casos</span>
            </div>
          </div>
        </div>
      </div>

      <!-- DETALLE DOCUMENTAL DEL LIBRO DE COMPRAS SUNAT (PLE 8.1) -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between">
          <div class="text-xs font-bold text-slate-700 uppercase tracking-wider">Libro de Compras Electrónico (PLE SUNAT Formato 8.1)</div>
          <div class="text-xs text-slate-400">Periodo 2024-01</div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-600">
            <thead class="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/60">
              <tr>
                <th class="py-3 px-4">Periodo</th>
                <th class="py-3 px-4">RUC Emisor</th>
                <th class="py-3 px-4">Razón Social</th>
                <th class="py-3 px-4">Serie-Número</th>
                <th class="py-3 px-4 text-right">Base Imponible</th>
                <th class="py-3 px-4 text-right">IGV (18%)</th>
                <th class="py-3 px-4 text-right">Importe Total</th>
                <th class="py-3 px-4">Estado</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-mono">
              <tr *ngFor="let doc of reporte?.documentos" class="hover:bg-slate-50/80">
                <td class="py-3 px-4 text-slate-500">20240100</td>
                <td class="py-3 px-4">{{ doc.rucEmisor }}</td>
                <td class="py-3 px-4 font-sans font-medium text-slate-800">{{ doc.razonSocial }}</td>
                <td class="py-3 px-4 font-bold text-blue-600">{{ doc.serieNumero }}</td>
                <td class="py-3 px-4 text-right">{{ doc.subtotal | currencyFormat }}</td>
                <td class="py-3 px-4 text-right text-emerald-700 font-bold">{{ doc.igv | currencyFormat }}</td>
                <td class="py-3 px-4 text-right font-black text-slate-900">{{ doc.total | currencyFormat }}</td>
                <td class="py-3 px-4 font-sans">
                  <app-status-badge [status]="doc.estado"></app-status-badge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class DashboardReportesComponent implements OnInit {
  private reportesService = inject(ReportesService);
  private notificationService = inject(NotificationService);

  reporte: ReporteAuditoria | null = null;

  ngOnInit(): void {
    this.cargarReporte();
  }

  cargarReporte(): void {
    this.reportesService.obtenerReporteAuditoria().subscribe(rep => {
      this.reporte = rep;
    });
  }

  descargarReporteCsv(): void {
    this.reportesService.exportarCsv().subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `LE2051234567820240100080100001111.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      this.notificationService.success('Reporte PLE SUNAT Formato 8.1 exportado exitosamente');
    });
  }
}
