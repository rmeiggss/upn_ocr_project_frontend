import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DigitalizacionService } from '../../services/digitalizacion.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { TicketDigitalizacion, CrearTicketRequest } from '../../../../core/models/ticket.model';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-bandeja-tickets',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, StatusBadgeComponent],
  template: `
    <div class="p-6 max-w-7xl mx-auto space-y-6">
      <!-- HEADER CON TÍTULO Y ACCIONES CUS-01 -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded-md">CUS-01</span>
            <h1 class="text-lg font-extrabold text-slate-800">Recepción y Digitalización de Lotes</h1>
          </div>
          <p class="text-xs text-slate-500 mt-1">
            Gestión de tickets de digitalización, verificación de folios físicos y recepción de comprobantes contables
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            (click)="abrirModalSubida()"
            class="px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all flex items-center gap-2">
            <i class="fas fa-file-arrow-up"></i>
            <span>Subir Comprobante PDF</span>
          </button>

          <button
            (click)="abrirModalNuevoTicket()"
            class="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/30 rounded-xl transition-all flex items-center gap-2">
            <i class="fas fa-plus"></i>
            <span>Nuevo Ticket de Lote</span>
          </button>
        </div>
      </div>

      <!-- TARJETAS DE RESUMEN METRICAS -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold shrink-0">
            <i class="fas fa-ticket"></i>
          </div>
          <div>
            <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Lotes</div>
            <div class="text-xl font-bold text-slate-800">{{ tickets.length }}</div>
          </div>
        </div>

        <div class="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-bold shrink-0">
            <i class="fas fa-check-double"></i>
          </div>
          <div>
            <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Aprobados / Correctos</div>
            <div class="text-xl font-bold text-emerald-600">{{ totalCorrectos }}</div>
          </div>
        </div>

        <div class="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-sm font-bold shrink-0">
            <i class="fas fa-triangle-exclamation"></i>
          </div>
          <div>
            <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Observados (OCR)</div>
            <div class="text-xl font-bold text-amber-600">{{ totalObservados }}</div>
          </div>
        </div>

        <div class="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-bold shrink-0">
            <i class="fas fa-file-invoice"></i>
          </div>
          <div>
            <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Folios Totales</div>
            <div class="text-xl font-bold text-indigo-600">225</div>
          </div>
        </div>
      </div>

      <!-- TABLA DE TICKETS (CUS-01) -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between">
          <div class="text-xs font-bold text-slate-700 uppercase tracking-wider">Bandeja de Control de Digitalización</div>
          <div class="text-xs text-slate-400">{{ tickets.length }} tickets registrados</div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-600">
            <thead class="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/60">
              <tr>
                <th class="py-3 px-4">Código Ticket</th>
                <th class="py-3 px-4">Solicitante</th>
                <th class="py-3 px-4">Rango / Periodo</th>
                <th class="py-3 px-4">Folios Físicos</th>
                <th class="py-3 px-4 text-center">Correctos</th>
                <th class="py-3 px-4 text-center">Observados</th>
                <th class="py-3 px-4">Estado</th>
                <th class="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let ticket of tickets" class="hover:bg-slate-50/80 transition-colors">
                <td class="py-3.5 px-4 font-mono font-bold text-blue-600">{{ ticket.codigoTicket }}</td>
                <td class="py-3.5 px-4 font-medium text-slate-800">{{ ticket.solicitante }}</td>
                <td class="py-3.5 px-4">{{ ticket.rangoPeriodo }}</td>
                <td class="py-3.5 px-4 text-slate-500">
                  <span class="inline-flex items-center gap-1 font-medium text-slate-700">
                    <i class="fas fa-file-lines text-slate-400"></i>
                    {{ ticket.foliosFisicos }}
                  </span>
                </td>
                <td class="py-3.5 px-4 text-center font-bold text-emerald-600">{{ ticket.totalCorrectos }}</td>
                <td class="py-3.5 px-4 text-center font-bold text-amber-600">{{ ticket.totalObservados }}</td>
                <td class="py-3.5 px-4">
                  <app-status-badge [status]="ticket.estado"></app-status-badge>
                </td>
                <td class="py-3.5 px-4 text-right">
                  <a
                    [routerLink]="['/digitalizacion/revision', ticket.idTicket]"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                    <i class="fas fa-columns"></i>
                    <span>Revisar Split</span>
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- MODAL CREAR NUEVO TICKET (CUS-01) -->
      <div *ngIf="mostrarModalNuevoTicket" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded">CUS-01</span>
              <h3 class="text-sm font-bold text-slate-800">Registrar Nuevo Lote de Digitalización</h3>
            </div>
            <button (click)="mostrarModalNuevoTicket = false" class="text-slate-400 hover:text-slate-600">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <form (ngSubmit)="guardarNuevoTicket()" class="space-y-4 mt-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Área Solicitante</label>
              <input
                type="text"
                [(ngModel)]="nuevoTicket.solicitante"
                name="solicitante"
                required
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white" />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Rango / Periodo Fiscal</label>
              <input
                type="text"
                [(ngModel)]="nuevoTicket.rangoPeriodo"
                name="rangoPeriodo"
                required
                placeholder="ej. Febrero 2024 - Facturas Proveedores"
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white" />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Conteo Físico de Folios Recibidos</label>
              <input
                type="text"
                [(ngModel)]="nuevoTicket.foliosFisicos"
                name="foliosFisicos"
                required
                placeholder="ej. 50 comprobantes contables recibidos"
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white" />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Observaciones Iniciales</label>
              <textarea
                [(ngModel)]="nuevoTicket.observaciones"
                name="observaciones"
                rows="2"
                placeholder="Observaciones de recepción física del lote..."
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"></textarea>
            </div>

            <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                (click)="mostrarModalNuevoTicket = false"
                class="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl">
                Cancelar
              </button>
              <button
                type="submit"
                class="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm">
                Guardar Ticket
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- MODAL SUBIR DOCUMENTO PDF / OCR (CUS-01) -->
      <div *ngIf="mostrarModalSubida" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded">CUS-01</span>
              <h3 class="text-sm font-bold text-slate-800">Cargar Archivo PDF a Azure Storage</h3>
            </div>
            <button (click)="mostrarModalSubida = false" class="text-slate-400 hover:text-slate-600">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="mt-4 space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Ticket Destino</label>
              <select
                [(ngModel)]="ticketSeleccionadoId"
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white">
                <option *ngFor="let t of tickets" [value]="t.idTicket">{{ t.codigoTicket }} - {{ t.solicitante }}</option>
              </select>
            </div>

            <!-- Área Dropzone -->
            <div class="border-2 border-dashed border-blue-300 bg-blue-50/40 rounded-2xl p-6 text-center hover:bg-blue-50/70 transition-colors">
              <i class="fas fa-cloud-arrow-up text-3xl text-blue-500 mb-2"></i>
              <div class="text-xs font-bold text-slate-700">Seleccione o arrastre su factura en formato PDF</div>
              <div class="text-[10px] text-slate-400 mt-1">Disparará automáticamente el análisis con Azure Document Intelligence</div>
              <input
                type="file"
                accept=".pdf,image/*"
                (change)="onArchivoSeleccionado($event)"
                class="mt-3 block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700" />
            </div>

            <div *ngIf="procesandoSubida" class="p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-3">
              <i class="fas fa-spinner fa-spin text-blue-600"></i>
              <div class="text-xs text-blue-800 font-medium">Procesando extracción OCR con IA...</div>
            </div>

            <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                (click)="mostrarModalSubida = false"
                class="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BandejaTicketsComponent implements OnInit {
  private digitalizacionService = inject(DigitalizacionService);
  private notificationService = inject(NotificationService);

  tickets: TicketDigitalizacion[] = [];
  mostrarModalNuevoTicket: boolean = false;
  mostrarModalSubida: boolean = false;
  ticketSeleccionadoId: number = 1;
  procesandoSubida: boolean = false;

  nuevoTicket: CrearTicketRequest = {
    solicitante: 'Contabilidad General',
    rangoPeriodo: 'Enero 2024 - Facturas Proveedores',
    foliosFisicos: '50 comprobantes contables recibidos',
    observaciones: 'Lote ingresado para digitalización y conciliación'
  };

  get totalCorrectos(): number {
    return this.tickets.reduce((acc, t) => acc + (t.totalCorrectos || 0), 0);
  }

  get totalObservados(): number {
    return this.tickets.reduce((acc, t) => acc + (t.totalObservados || 0), 0);
  }

  ngOnInit(): void {
    this.cargarTickets();
  }

  cargarTickets(): void {
    this.digitalizacionService.getTickets().subscribe(res => {
      this.tickets = res || [];
    });
  }

  abrirModalNuevoTicket(): void {
    this.mostrarModalNuevoTicket = true;
  }

  abrirModalSubida(): void {
    this.mostrarModalSubida = true;
  }

  guardarNuevoTicket(): void {
    this.digitalizacionService.crearTicket(this.nuevoTicket).subscribe(() => {
      this.notificationService.success('Nuevo lote de digitalización registrado con éxito');
      this.mostrarModalNuevoTicket = false;
      this.cargarTickets();
    });
  }

  onArchivoSeleccionado(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      this.procesandoSubida = true;
      this.digitalizacionService.subirDocumento(this.ticketSeleccionadoId, file).subscribe(() => {
        this.procesandoSubida = false;
        this.mostrarModalSubida = false;
        this.notificationService.success(`Archivo [${file.name}] subido y analizado con éxito mediante Azure Document Intelligence`);
        this.cargarTickets();
      });
    }
  }
}
