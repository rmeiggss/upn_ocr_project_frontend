import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ArchivoService } from '../../services/archivo.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { 
  DocumentoContable, 
  SolicitudBusquedaFisicaRequest 
} from '../../../../core/models/comprobante.model';
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
          <h1 class="text-lg font-extrabold text-slate-800 flex items-center gap-2">
            <span>Búsqueda en Archivo Histórico y Sistema ERP</span>
            <span class="text-blue-600 bg-blue-50 text-[11px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
              CUS-03
            </span>
          </h1>
          <p class="text-xs text-slate-500 mt-1">
            Consulta federada en Azure SQL y Sistema Antiguo (ERP Core). Si el documento no existe físicamente digitalizado, permite emitir un Ticket de Búsqueda Física hacia Archivo.
          </p>
        </div>
      </div>

      <!-- FORMULARIO DE FILTROS AVANZADOS -->
      <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
          <i class="fas fa-filter text-blue-600"></i>
          <span>Filtros de Búsqueda Tributaria</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">R.U.C. Emisor</label>
            <input
              type="text"
              [(ngModel)]="filtros.rucEmisor"
              placeholder="ej. 20100128056 o 20999999999"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:bg-white" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Serie - Número</label>
            <input
              type="text"
              [(ngModel)]="filtros.serieNumero"
              placeholder="ej. F001-00004921"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:bg-white" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Tipo de Comprobante</label>
            <select
              [(ngModel)]="filtros.tipoDocumento"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white">
              <option value="">Todos los Tipos</option>
              <option value="FACTURA">FACTURA</option>
              <option value="BOLETA">BOLETA</option>
              <option value="NOTA_CREDITO">NOTA DE CRÉDITO</option>
            </select>
          </div>

          <div class="flex items-end gap-2">
            <button
              (click)="buscar()"
              [disabled]="cargando"
              class="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-blue-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              <i class="fas" [ngClass]="cargando ? 'fa-spinner fa-spin' : 'fa-magnifying-glass'"></i>
              <span>{{ cargando ? 'Consultando...' : 'Consultar' }}</span>
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

      <!-- ESTADO 1: BANNER CUANDO NO HAY RESULTADOS (FLUJO EXACTO DE CUS-03) -->
      <div *ngIf="busquedaRealizada && documentos.length === 0" 
           class="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-6 rounded-2xl shadow-sm space-y-4">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-lg flex-shrink-0 shadow-md shadow-amber-500/20">
            <i class="fas fa-triangle-exclamation"></i>
          </div>
          <div class="flex-1">
            <h3 class="text-sm font-bold text-amber-900">
              Comprobante No Encontrado en el Archivo Digital ni en el ERP Antiguo
            </h3>
            <p class="text-xs text-amber-700 mt-1 leading-relaxed">
              La consulta en Azure SQL y la base histórica del ERP Core no arrojó ningún registro con los criterios ingresados.
              De acuerdo al procedimiento contable oficial, debe generarse una <strong>Solicitud de Búsqueda Física (Ticket)</strong> para que el <strong>Personal de archivo</strong> localice el lote en almacén y proceda con el escaneo y digitalización (CUS-01).
            </p>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2 border-t border-amber-200/60">
          <span class="text-[11px] text-amber-800 font-medium">¿Desea ordenar la búsqueda en el almacén físico?</span>
          <button
            type="button"
            (click)="abrirModalSolicitudDesdeFiltros()"
            class="py-2.5 px-5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md shadow-amber-600/30 transition-all flex items-center gap-2">
            <i class="fas fa-file-circle-plus"></i>
            <span>Registrar Solicitud de Búsqueda Física (Crear Ticket)</span>
          </button>
        </div>
      </div>

      <!-- ESTADO 2: TABLA DE RESULTADOS ENCONTRADOS -->
      <div *ngIf="documentos.length > 0" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Tabla de Documentos (2 Columnas) -->
        <div class="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
          <div class="p-4 border-b border-slate-100 flex items-center justify-between">
            <div class="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <span>Comprobantes Encontrados</span>
              <span class="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px]">
                {{ documentos.length }}
              </span>
            </div>
            <div class="text-[11px] text-slate-400">Seleccione una fila para inspeccionar metadatos</div>
          </div>

          <div class="overflow-x-auto flex-1">
            <table class="w-full text-left text-xs text-slate-600">
              <thead class="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/60">
                <tr>
                  <th class="py-3 px-4">Comprobante</th>
                  <th class="py-3 px-4">Emisor</th>
                  <th class="py-3 px-4">Origen</th>
                  <th class="py-3 px-4 text-right">Total</th>
                  <th class="py-3 px-4 text-center">Estado</th>
                  <th class="py-3 px-4 text-center">Acción</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr
                  *ngFor="let doc of documentos"
                  (click)="seleccionarDocumento(doc)"
                  [class]="docSeleccionado?.idDocumento === doc.idDocumento ? 'bg-blue-50/80 ring-1 ring-blue-300' : 'hover:bg-slate-50/80'"
                  class="cursor-pointer transition-colors">
                  <td class="py-3.5 px-4 font-mono font-bold text-blue-600">{{ doc.serieNumero || (doc.serieComprobante ? doc.serieComprobante + '-' + doc.numeroComprobante : 'S/N') }}</td>
                  <td class="py-3.5 px-4">
                    <div class="font-medium text-slate-800 truncate max-w-[180px]">{{ doc.razonSocial }}</div>
                    <div class="text-[10px] text-slate-400 font-mono">{{ doc.rucEmisor }}</div>
                  </td>
                  <td class="py-3.5 px-4">
                    <span *ngIf="doc.origenDatos === 'ERP_ANTIGUO'" 
                          class="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-md text-[10px] font-bold">
                      <i class="fas fa-server mr-1"></i> ERP Antiguo
                    </span>
                    <span *ngIf="doc.origenDatos !== 'ERP_ANTIGUO'" 
                          class="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-[10px] font-bold">
                      <i class="fas fa-cloud mr-1"></i> Azure SQL
                    </span>
                  </td>
                  <td class="py-3.5 px-4 text-right font-mono font-bold text-slate-800">
                    {{ (doc.total || doc.montoTotal || 0) | currencyFormat }}
                  </td>
                  <td class="py-3.5 px-4 text-center">
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

        <!-- Panel Lateral de Detalles (1 Columna) -->
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
          <div class="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div class="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
              <i class="fas fa-file-invoice"></i>
            </div>
            <div>
              <h3 class="text-xs font-bold text-slate-800">Ficha de Comprobante</h3>
              <p class="text-[10px] text-slate-400">Detalles tributarios recuperados</p>
            </div>
          </div>

          <div *ngIf="docSeleccionado" class="space-y-3">
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Número de Serie</div>
              <div class="text-sm font-bold font-mono text-blue-700">{{ docSeleccionado.serieNumero || (docSeleccionado.serieComprobante ? docSeleccionado.serieComprobante + '-' + docSeleccionado.numeroComprobante : 'S/N') }}</div>
              <div class="text-xs font-medium text-slate-800">{{ docSeleccionado.razonSocial }}</div>
              <div class="text-[10px] font-mono text-slate-500">RUC: {{ docSeleccionado.rucEmisor }}</div>
            </div>

            <div class="space-y-1 text-xs">
              <div class="flex justify-between py-1 border-b border-slate-100">
                <span class="text-slate-500">Fecha de Emisión:</span>
                <span class="font-medium text-slate-800">{{ docSeleccionado.fechaEmision }}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-slate-100">
                <span class="text-slate-500">Subtotal:</span>
                <span class="font-mono text-slate-800">{{ (docSeleccionado.subtotal || docSeleccionado.montoSubTotal || 0) | currencyFormat }}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-slate-100">
                <span class="text-slate-500">I.G.V. (18%):</span>
                <span class="font-mono text-slate-800">{{ (docSeleccionado.igv || docSeleccionado.montoIgv || 0) | currencyFormat }}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-slate-100">
                <span class="text-slate-500 font-bold">Total:</span>
                <span class="font-mono font-bold text-slate-900">{{ (docSeleccionado.total || docSeleccionado.montoTotal || 0) | currencyFormat }}</span>
              </div>
            </div>

            <div *ngIf="docSeleccionado.rutaArchivoPdf" class="pt-2">
              <a [href]="docSeleccionado.rutaArchivoPdf" target="_blank"
                 class="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2">
                <i class="fas fa-file-pdf text-red-400"></i>
                <span>Ver Documento Digitalizado</span>
              </a>
            </div>
          </div>

          <div *ngIf="!docSeleccionado" class="text-center py-12 text-slate-400">
            <i class="fas fa-arrow-pointer text-3xl mb-2 opacity-40"></i>
            <div class="text-xs">Seleccione un comprobante de la lista para ver sus detalles</div>
          </div>
        </div>
      </div>

      <!-- MODAL OFICIAL DE SOLICITUD DE BÚSQUEDA FÍSICA (CUS-03) -->
      <div *ngIf="mostrarModalSolicitud" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
          
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">
                <i class="fas fa-box-archive"></i>
              </div>
              <div>
                <h3 class="text-sm font-bold text-slate-800">Emitir Solicitud de Búsqueda Física</h3>
                <p class="text-[10px] text-slate-400">Creación de Ticket para Personal de Archivo (CUS-03 a CUS-01)</p>
              </div>
            </div>
            <button (click)="mostrarModalSolicitud = false" class="text-slate-400 hover:text-slate-600">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- FORMULARIO ESTRUCTURADO DE SOLICITUD -->
          <div class="space-y-3 text-xs">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">R.U.C. Proveedor *</label>
                <input
                  type="text"
                  [(ngModel)]="solicitudForm.rucEmisor"
                  placeholder="20100128056"
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-amber-500 focus:bg-white" />
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Razón Social</label>
                <input
                  type="text"
                  [(ngModel)]="solicitudForm.razonSocial"
                  placeholder="Nombre de la empresa"
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Tipo de Comprobante *</label>
                <select
                  [(ngModel)]="solicitudForm.tipoDocumento"
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white">
                  <option value="FACTURA">FACTURA</option>
                  <option value="BOLETA">BOLETA</option>
                  <option value="NOTA_CREDITO">NOTA DE CRÉDITO</option>
                </select>
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Prioridad del Requerimiento *</label>
                <select
                  [(ngModel)]="solicitudForm.prioridad"
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white">
                  <option value="ALTA">ALTA (Fiscalización SUNAT)</option>
                  <option value="MEDIA">MEDIA (Cierre Contable)</option>
                  <option value="BAJA">BAJA (Regularización)</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Fecha Desde (Rango) *</label>
                <input
                  type="date"
                  [(ngModel)]="solicitudForm.fechaDesde"
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white" />
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Fecha Hasta (Rango) *</label>
                <input
                  type="date"
                  [(ngModel)]="solicitudForm.fechaHasta"
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Folios Físicos *</label>
                <input
                  type="number"
                  min="1"
                  [(ngModel)]="solicitudForm.totalDocumentosEsperados"
                  placeholder="ej. 1"
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-amber-500 focus:bg-white" />
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Serie-Número (Aprox.)</label>
                <input
                  type="text"
                  [(ngModel)]="solicitudForm.serieNumero"
                  placeholder="ej. F001-XXXXX"
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-amber-500 focus:bg-white" />
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">N° Caja / Archivador</label>
                <input
                  type="text"
                  [(ngModel)]="solicitudForm.numeroCajaArchivador"
                  placeholder="ej. CJ-2023-A4"
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-amber-500 focus:bg-white" />
              </div>
            </div>

            <div>
              <label class="block font-semibold text-slate-700 mb-1">Motivo del Requerimiento / Observaciones *</label>
              <textarea
                [(ngModel)]="solicitudForm.motivoSolicitud"
                rows="2"
                placeholder="Indique el motivo de la búsqueda física para orientar al Personal de Archivo..."
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white"></textarea>
            </div>
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
              (click)="confirmarEmisionTicket()"
              [disabled]="guardandoTicket || !solicitudForm.rucEmisor"
              class="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md shadow-amber-600/30 disabled:opacity-50 flex items-center gap-2">
              <i class="fas" [ngClass]="guardandoTicket ? 'fa-spinner fa-spin' : 'fa-paper-plane'"></i>
              <span>{{ guardandoTicket ? 'Generando Ticket...' : 'Emitir Orden de Búsqueda' }}</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  `
})
export class BuscadorComponent implements OnInit {
  private archivoService = inject(ArchivoService);
  private notificationService = inject(NotificationService);

  documentos: any[] = [];
  docSeleccionado: any = null;
  cargando: boolean = false;
  busquedaRealizada: boolean = false;
  mostrarModalSolicitud: boolean = false;
  guardandoTicket: boolean = false;

  filtros = {
    rucEmisor: '',
    serieNumero: '',
    tipoDocumento: '',
    estado: ''
  };

  solicitudForm: SolicitudBusquedaFisicaRequest = {
    rucEmisor: '',
    razonSocial: '',
    serieNumero: '',
    tipoDocumento: 'FACTURA',
    fechaDesde: '2023-01-01',
    fechaHasta: '2023-12-31',
    prioridad: 'ALTA',
    numeroCajaArchivador: '',
    totalDocumentosEsperados: 1,
    motivoSolicitud: 'Requerimiento de auditoría tributaria SUNAT - Ejercicio 2023'
  };

  ngOnInit(): void {
    // Carga inicial
    this.buscar();
  }

  buscar(): void {
    this.cargando = true;
    this.busquedaRealizada = true;
    this.docSeleccionado = null;

    this.archivoService.buscarDocumentos(this.filtros).subscribe({
      next: (docs) => {
        this.documentos = docs || [];
        this.cargando = false;
        if (this.documentos.length > 0) {
          this.docSeleccionado = this.documentos[0];
        }
      },
      error: () => {
        this.documentos = [];
        this.cargando = false;
        this.notificationService.error('Error al conectar con los servicios de archivo histórico y ERP.');
      }
    });
  }

  limpiarFiltros(): void {
    this.filtros = {
      rucEmisor: '',
      serieNumero: '',
      tipoDocumento: '',
      estado: ''
    };
    this.buscar();
  }

  seleccionarDocumento(doc: any): void {
    this.docSeleccionado = doc;
  }

  abrirModalSolicitudDesdeFiltros(): void {
    // Precarga datos ingresados en los filtros de búsqueda hacia la solicitud
    this.solicitudForm.rucEmisor = this.filtros.rucEmisor || '';
    this.solicitudForm.serieNumero = this.filtros.serieNumero || '';
    this.solicitudForm.tipoDocumento = this.filtros.tipoDocumento || 'FACTURA';
    this.solicitudForm.totalDocumentosEsperados = 1;
    this.mostrarModalSolicitud = true;
  }

  confirmarEmisionTicket(): void {
    if (!this.solicitudForm.rucEmisor) {
      this.notificationService.warning('Debe ingresar el RUC del emisor.');
      return;
    }

    this.solicitudForm.totalDocumentosEsperados = Number(this.solicitudForm.totalDocumentosEsperados) || 1;
    this.guardandoTicket = true;
    this.archivoService.solicitarBusquedaFisica(this.solicitudForm).subscribe({
      next: (ticketCreado) => {
        this.guardandoTicket = false;
        this.mostrarModalSolicitud = false;
        const codigo = ticketCreado?.codigoTicket || 'TK-PENDIENTE';
        this.notificationService.success(`Ticket ${codigo} generado exitosamente en estado PENDIENTE para el Personal de Archivo.`);
      },
      error: () => {
        this.guardandoTicket = false;
        this.notificationService.error('Ocurrió un error al registrar la solicitud de búsqueda física.');
      }
    });
  }
}
