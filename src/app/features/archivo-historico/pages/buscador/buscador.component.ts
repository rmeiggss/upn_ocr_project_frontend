import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ArchivoService } from '../../services/archivo.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { DocumentoContable } from '../../../../core/models/comprobante.model';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-buscador',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, StatusBadgeComponent, CurrencyFormatPipe],
  template: `
    <div class="p-6 max-w-7xl mx-auto space-y-6">
      <!-- HEADER CUS-03 -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded-md">CUS-03</span>
            <h1 class="text-lg font-extrabold text-slate-800">Búsqueda y Localización en Archivo Histórico</h1>
          </div>
          <p class="text-xs text-slate-500 mt-1">
            Consulta de comprobantes contables digitalizados y geolocalización en almacenes y cajas físicas
          </p>
        </div>
      </div>

      <!-- FORMULARIO DE FILTROS AVANZADOS -->
      <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
          <i class="fas fa-filter text-blue-600"></i>
          <span>Filtros de Búsqueda Tributaria y Física</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">R.U.C. Emisor</label>
            <input
              type="text"
              [(ngModel)]="filtros.rucEmisor"
              placeholder="ej. 20512345678"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:bg-white" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Serie - Número</label>
            <input
              type="text"
              [(ngModel)]="filtros.serieNumero"
              placeholder="ej. F001-00045231"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:bg-white" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Estado de Validación</label>
            <select
              [(ngModel)]="filtros.estado"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white">
              <option value="">Todos los Estados</option>
              <option value="CORRECTO">CORRECTO</option>
              <option value="OBSERVADO">OBSERVADO</option>
              <option value="REPROCESAR">REPROCESAR</option>
            </select>
          </div>

          <div class="flex items-end gap-2">
            <button
              (click)="buscar()"
              class="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-blue-500/30 transition-all flex items-center justify-center gap-2">
              <i class="fas fa-magnifying-glass"></i>
              <span>Consultar</span>
            </button>
            <button
              (click)="limpiarFiltros()"
              class="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-xl transition-all"
              title="Limpiar Filtros">
              <i class="fas fa-rotate-left"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- RESULTADOS DE BÚSQUEDA Y TABLA CUS-03 -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Tabla de Documentos (2 Columnas) -->
        <div class="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
          <div class="p-4 border-b border-slate-100 flex items-center justify-between">
            <div class="text-xs font-bold text-slate-700 uppercase tracking-wider">Comprobantes Encontrados</div>
            <div class="text-xs text-slate-400">{{ documentos.length }} resultados</div>
          </div>

          <div class="overflow-x-auto flex-1">
            <table class="w-full text-left text-xs text-slate-600">
              <thead class="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/60">
                <tr>
                  <th class="py-3 px-4">Comprobante</th>
                  <th class="py-3 px-4">Emisor</th>
                  <th class="py-3 px-4">Fecha</th>
                  <th class="py-3 px-4 text-right">Total</th>
                  <th class="py-3 px-4">Estado</th>
                  <th class="py-3 px-4 text-center">Acción</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr
                  *ngFor="let doc of documentos"
                  (click)="seleccionarDocumento(doc)"
                  [class]="docSeleccionado?.idDocumento === doc.idDocumento ? 'bg-blue-50/80 ring-1 ring-blue-300' : 'hover:bg-slate-50/80'"
                  class="cursor-pointer transition-colors">
                  <td class="py-3.5 px-4 font-mono font-bold text-blue-600">{{ doc.serieNumero }}</td>
                  <td class="py-3.5 px-4">
                    <div class="font-medium text-slate-800 truncate max-w-[180px]">{{ doc.razonSocial }}</div>
                    <div class="text-[10px] text-slate-400 font-mono">{{ doc.rucEmisor }}</div>
                  </td>
                  <td class="py-3.5 px-4 text-slate-500">{{ doc.fechaEmision }}</td>
                  <td class="py-3.5 px-4 text-right font-mono font-bold text-slate-800">
                    {{ doc.total | currencyFormat }}
                  </td>
                  <td class="py-3.5 px-4">
                    <app-status-badge [status]="doc.estado"></app-status-badge>
                  </td>
                  <td class="py-3.5 px-4 text-center">
                    <button
                      (click)="seleccionarDocumento(doc); $event.stopPropagation()"
                      class="px-2.5 py-1 text-xs text-blue-700 hover:bg-blue-100 rounded-lg">
                      <i class="fas fa-eye"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Ficha de Ubicación Física en Almacén (1 Columna) -->
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
          <div class="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div class="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
              <i class="fas fa-warehouse"></i>
            </div>
            <div>
              <h3 class="text-xs font-bold text-slate-800">Ficha de Localización Física</h3>
              <p class="text-[10px] text-slate-400">Coordenadas exactas en almacén de archivo</p>
            </div>
          </div>

          <div *ngIf="docSeleccionado" class="space-y-4">
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Comprobante Seleccionado</div>
              <div class="text-sm font-bold font-mono text-blue-700">{{ docSeleccionado.serieNumero }}</div>
              <div class="text-xs text-slate-700 mt-0.5">{{ docSeleccionado.razonSocial }}</div>
            </div>

            <!-- Coordenadas de Archivo Físico -->
            <div class="space-y-2">
              <div class="flex items-center justify-between p-2.5 bg-blue-50/50 rounded-xl border border-blue-100">
                <span class="text-xs text-slate-600 font-medium">Sede Almacén:</span>
                <span class="text-xs font-bold text-slate-800">{{ docSeleccionado.ubicacionAlmacen }}</span>
              </div>

              <div class="flex items-center justify-between p-2.5 bg-blue-50/50 rounded-xl border border-blue-100">
                <span class="text-xs text-slate-600 font-medium">Estante / Nivel:</span>
                <span class="text-xs font-bold font-mono text-blue-800">{{ docSeleccionado.estanteArchivo }}</span>
              </div>

              <div class="flex items-center justify-between p-2.5 bg-blue-50/50 rounded-xl border border-blue-100">
                <span class="text-xs text-slate-600 font-medium">Caja de Archivo:</span>
                <span class="text-xs font-bold font-mono text-indigo-800">{{ docSeleccionado.cajaArchivo }}</span>
              </div>
            </div>

            <!-- Botón de Solicitud de Desarchivamiento -->
            <button
              type="button"
              (click)="abrirModalSolicitud()"
              class="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-blue-500/30 transition-all flex items-center justify-center gap-2">
              <i class="fas fa-hand-holding-hand"></i>
              <span>Solicitar Búsqueda Física (Desarchivamiento)</span>
            </button>
          </div>

          <div *ngIf="!docSeleccionado" class="text-center py-10 text-slate-400">
            <i class="fas fa-arrow-pointer text-3xl mb-2 opacity-50"></i>
            <div class="text-xs">Seleccione un comprobante para ver su ubicación en el almacén</div>
          </div>
        </div>
      </div>

      <!-- MODAL SOLICITUD DESARCHIVAMIENTO (CUS-03) -->
      <div *ngIf="mostrarModalSolicitud" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded">CUS-03</span>
              <h3 class="text-sm font-bold text-slate-800">Solicitud de Desarchivamiento Físico</h3>
            </div>
            <button (click)="mostrarModalSolicitud = false" class="text-slate-400 hover:text-slate-600">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="mt-4 space-y-4">
            <div class="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
              Se enviará una orden de búsqueda física al <strong>Personal de archivo</strong> en el Almacén Central para extraer el documento de la <strong>{{ docSeleccionado?.cajaArchivo }}</strong>.
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Motivo del Requerimiento</label>
              <textarea
                [(ngModel)]="motivoDesarchivo"
                rows="3"
                placeholder="ej. Requerimiento de auditoría fiscal SUNAT - Fiscalización Ejercicio 2023"
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"></textarea>
            </div>

            <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                (click)="mostrarModalSolicitud = false"
                class="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl">
                Cancelar
              </button>
              <button
                type="button"
                (click)="confirmarDesarchivamiento()"
                class="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm">
                Emitir Orden de Búsqueda
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BuscadorComponent implements OnInit {
  private archivoService = inject(ArchivoService);
  private notificationService = inject(NotificationService);

  documentos: DocumentoContable[] = [];
  docSeleccionado: DocumentoContable | null = null;
  mostrarModalSolicitud: boolean = false;
  motivoDesarchivo: string = 'Requerimiento de auditoría tributaria SUNAT';

  filtros = {
    rucEmisor: '',
    serieNumero: '',
    estado: ''
  };

  ngOnInit(): void {
    this.buscar();
  }

  buscar(): void {
    this.archivoService.buscarDocumentos(this.filtros).subscribe(docs => {
      this.documentos = docs || [];
      if (this.documentos.length > 0 && !this.docSeleccionado) {
        this.docSeleccionado = this.documentos[0];
      }
    });
  }

  limpiarFiltros(): void {
    this.filtros = { rucEmisor: '', serieNumero: '', estado: '' };
    this.buscar();
  }

  seleccionarDocumento(doc: DocumentoContable): void {
    this.docSeleccionado = doc;
  }

  abrirModalSolicitud(): void {
    if (this.docSeleccionado) {
      this.mostrarModalSolicitud = true;
    }
  }

  confirmarDesarchivamiento(): void {
    if (!this.docSeleccionado) return;

    this.archivoService.solicitarBusquedaFisica({
      idDocumento: this.docSeleccionado.idDocumento,
      motivo: this.motivoDesarchivo,
      solicitante: 'Auditoría Tributaria',
      estante: this.docSeleccionado.estanteArchivo || 'E-04',
      caja: this.docSeleccionado.cajaArchivo || 'CJ-2023-B4'
    }).subscribe(() => {
      this.notificationService.success(`Orden de desarchivamiento generada para la caja ${this.docSeleccionado?.cajaArchivo}`);
      this.mostrarModalSolicitud = false;
    });
  }
}
