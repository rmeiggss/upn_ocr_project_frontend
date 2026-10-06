import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DigitalizacionService } from '../../services/digitalizacion.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AuthService } from '../../../../core/services/auth.service';
import { TicketDigitalizacion, CrearTicketRequest, RevisionTicket } from '../../../../core/models/ticket.model';
import { DocumentoContable, SolicitudBusquedaFisicaRequest } from '../../../../core/models/comprobante.model';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { ArchivoService } from '../../../archivo-historico/services/archivo.service';


@Component({
  selector: 'app-bandeja-tickets',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, StatusBadgeComponent],
  template: `
    <div class="p-6 max-w-7xl mx-auto space-y-6">
      <!-- HEADER CON TÍTULO Y ACCIONES CUS-01 / CUS-02 -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 class="text-lg font-extrabold text-slate-800 flex items-center gap-2">
            <span>Recepción y Digitalización de Lotes</span>
            <span class="text-slate-400 hover:text-blue-600 cursor-help text-xs" title="Casos de Uso CUS-01 (Recepción y Digitalización) y CUS-02 (Supervisión Contable)">
              <i class="fas fa-circle-info"></i>
            </span>
          </h1>
          <p class="text-xs text-slate-500 mt-1">
            Gestión de tickets de digitalización, verificación de folios físicos y recepción de comprobantes contables
          </p>
        </div>

        <div class="flex items-center gap-2">
          <!-- <button
            *ngIf="authService.canAccess(['Contable', 'Administrador'])" 
            (click)="abrirModalSubida()"
            class="px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all flex items-center gap-2">
            <i class="fas fa-file-arrow-up"></i>
            <span>Subir Comprobante PDF</span>
          </button> -->

          <button
            *ngIf="authService.canAccess(['Contable', 'Administrador'])"
            (click)="abrirModalNuevoTicket()"
            class="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/30 rounded-xl transition-all flex items-center gap-2">
            <i class="fas fa-plus"></i>
            <span>Nuevo Ticket de Lote</span>
          </button>
        </div>
      </div>

      <!-- TARJETAS DE RESUMEN METRICAS -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

        <!-- <div class="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-bold shrink-0">
            <i class="fas fa-file-invoice"></i>
          </div>
          <div>
            <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Folios Totales</div>
            <div class="text-xl font-bold text-indigo-600">225</div>
          </div>
        </div> -->
      </div>

      <!-- TABLA DE TICKETS CON DESPLEGABLE INTERMEDIO -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between">
          <div class="text-xs font-bold text-slate-700 uppercase tracking-wider">Bandeja de Control de Digitalización</div>
          <div class="text-xs text-slate-400">{{ tickets.length }} tickets registrados</div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-600">
            <thead class="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/60">
              <tr>
                <th class="py-3 px-3 w-10 text-center"></th>
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
              <ng-container *ngFor="let ticket of tickets">
                <!-- Fila Principal del Ticket -->
                <tr
                  class="hover:bg-slate-50/80 transition-colors"
                  [ngClass]="ticketExpandidoId === ticket.idTicket ? 'bg-blue-50/30' : ''">
                  <!-- Botón Desplegable Chevron -->
                  <td class="py-3.5 px-3 text-center">
                    <button
                      type="button"
                      (click)="toggleExpandirTicket(ticket)"
                      [title]="ticketExpandidoId === ticket.idTicket ? 'Ocultar comprobantes del lote' : 'Desplegar comprobantes del lote'"
                      class="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                      [ngClass]="ticketExpandidoId === ticket.idTicket ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-blue-100 hover:text-blue-700'">
                      <i class="fas text-xs transition-transform duration-200" [ngClass]="ticketExpandidoId === ticket.idTicket ? 'fa-chevron-down' : 'fa-chevron-right'"></i>
                    </button>
                  </td>

                  <td class="py-3.5 px-4 font-mono font-bold text-blue-600">
                    <button
                      type="button"
                      (click)="toggleExpandirTicket(ticket)"
                      class="text-left font-mono font-bold hover:underline focus:outline-none flex items-center gap-1.5">
                      <span>{{ ticket.codigoTicket }}</span>
                    </button>
                  </td>
                  <td class="py-3.5 px-4 font-medium text-slate-800">{{ ticket.solicitante }}</td>
                  <td class="py-3.5 px-4">
                    <div class="font-medium text-slate-700">{{ ticket.rangoPeriodo }}</div>
                    <div *ngIf="ticket.numeroCajaArchivador" class="text-[10px] text-slate-400 font-mono">
                      <i class="fas fa-box-archive mr-1 text-slate-300"></i>{{ ticket.numeroCajaArchivador }}
                    </div>
                  </td>
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
                  <td class="py-3.5 px-4 text-right whitespace-nowrap">
                    <div class="flex items-center justify-end gap-2">
                      <!-- Botón Revisión de Ticket (Despliega Modal RevisionTicket) -->
                      <button
                        type="button"
                        (click)="abrirModalRevisionTicket(ticket); $event.stopPropagation()"
                        title="Auditoría y dictamen de ticket (CE_RevisionTicket)"
                        class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-all shadow-xs">
                        <i class="fas fa-clipboard-check"></i>
                        <span>Revisión de Ticket</span>
                      </button>

                      <!-- Toggle Detalle Comprobantes -->
                      <button
                        type="button"
                        (click)="toggleExpandirTicket(ticket)"
                        class="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all"
                        [ngClass]="ticketExpandidoId === ticket.idTicket ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'">
                        <i class="fas" [ngClass]="ticketExpandidoId === ticket.idTicket ? 'fa-eye-slash' : 'fa-list-check'"></i>
                        <span>{{ ticketExpandidoId === ticket.idTicket ? 'Ocultar' : 'Comprobantes' }}</span>
                      </button>
                    </div>
                  </td>
                </tr>

                <!-- SUB-FILA EXPANDIBLE: DESPLEGABLE DE COMPROBANTES CON FILTRO Y PAGINADO -->
                <tr *ngIf="ticketExpandidoId === ticket.idTicket" class="bg-slate-50/70">
                  <td colspan="9" class="p-3 sm:p-5 border-y border-blue-200 bg-gradient-to-b from-blue-50/30 to-slate-50">
                    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4">
                      <!-- Cabecera del Desplegable -->
                      <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                        <div class="flex items-center gap-2.5">
                          <div class="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                            <i class="fas fa-layer-group"></i>
                          </div>
                          <div>
                            <div class="text-xs font-bold text-slate-800 flex items-center gap-2">
                              <span>Comprobantes Asignados al Lote:</span>
                              <span class="font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{{ ticket.codigoTicket }}</span>
                            </div>
                            <div class="text-[11px] text-slate-400 mt-0.5">
                              {{ ticket.solicitante }} • {{ ticket.rangoPeriodo }}
                            </div>
                          </div>
                        </div>

                        <!-- Filtro por coincidencia y Configuración de Paginado -->
                        <div class="flex flex-wrap items-center gap-2.5">
                          <!-- Input de búsqueda / coincidencia -->
                          <div class="relative min-w-[260px]">
                            <i class="fas fa-magnifying-glass absolute left-3 top-2.5 text-slate-400 text-xs"></i>
                            <input
                              type="text"
                              [ngModel]="filtroDocumento"
                              (ngModelChange)="onFiltrarDocumentos($event)"
                              placeholder="Buscar por serie, RUC, emisor o estado..."
                              class="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white" />
                            <button
                              *ngIf="filtroDocumento"
                              (click)="limpiarFiltro()"
                              class="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs">
                              <i class="fas fa-times"></i>
                            </button>
                          </div>

                          <!-- Configuración de Paginado (Configurable: 10 o 15) -->
                          <div class="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200 text-xs text-slate-600">
                            <span class="text-[11px] font-medium text-slate-500">Por página:</span>
                            <select
                              [ngModel]="itemsPorPagina"
                              (ngModelChange)="cambiarItemsPorPagina($event)"
                              class="bg-transparent font-bold text-slate-800 text-xs focus:outline-none cursor-pointer">
                              <option [value]="10">10</option>
                              <option [value]="15">15</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <!-- Estado de carga -->
                      <div *ngIf="cargandoDocumentos" class="p-8 text-center text-slate-400">
                        <i class="fas fa-spinner fa-spin text-xl text-blue-600 mb-2"></i>
                        <div class="text-xs font-medium">Cargando folios del lote...</div>
                      </div>

                      <!-- Tabla Interna de Comprobantes -->
                      <div *ngIf="!cargandoDocumentos" class="overflow-x-auto rounded-xl border border-slate-200/80">
                        <table class="w-full text-left text-xs text-slate-600">
                          <thead class="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/60">
                            <tr>
                              <th class="py-2.5 px-3">Serie - Número</th>
                              <th class="py-2.5 px-3">Tipo</th>
                              <th class="py-2.5 px-3">Emisor / RUC</th>
                              <th class="py-2.5 px-3">Fecha Emisión</th>
                              <th class="py-2.5 px-3 text-right">Importe Total</th>
                              <th class="py-2.5 px-3 text-center">Certeza OCR</th>
                              <th class="py-2.5 px-3">Estado</th>
                              <th class="py-2.5 px-3 text-right">Acción</th>
                            </tr>
                          </thead>
                          <tbody class="divide-y divide-slate-100 text-xs">
                            <tr *ngFor="let doc of documentosPaginados" class="hover:bg-blue-50/40 transition-colors">
                              <td class="py-2.5 px-3 font-mono font-bold text-blue-700">{{ doc.serieNumero }}</td>
                              <td class="py-2.5 px-3 font-semibold text-slate-700">
                                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">{{ doc.tipoDocumento }}</span>
                              </td>
                              <td class="py-2.5 px-3">
                                <div class="font-medium text-slate-800 truncate max-w-[220px]">{{ doc.razonSocial }}</div>
                                <div class="text-[10px] text-slate-400 font-mono">{{ doc.rucEmisor }}</div>
                              </td>
                              <td class="py-2.5 px-3 text-slate-500 font-mono">{{ doc.fechaEmision }}</td>
                              <td class="py-2.5 px-3 text-right font-mono font-bold text-slate-800">
                                S/ {{ doc.total | number:'1.2-2' }}
                              </td>
                              <td class="py-2.5 px-3 text-center">
                                <span
                                  class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                                  [ngClass]="doc.confianzaGeneral >= 85 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'">
                                  {{ doc.confianzaGeneral }}%
                                </span>
                              </td>
                              <td class="py-2.5 px-3">
                                <app-status-badge [status]="doc.estado"></app-status-badge>
                              </td>
                              <td class="py-2.5 px-3 text-right">
                                <!-- Botón Revisar Split dirigido a la pantalla de Revision OCR con su número de documento -->
                                <a
                                  [routerLink]="['/digitalizacion/revision', doc.idDocumento]"
                                  title="Auditar comprobante individual en Visor OCR Splitscreen"
                                  class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all shadow-xs">
                                  <i class="fas fa-columns"></i>
                                  <span>Revisar Split</span>
                                </a>
                              </td>
                            </tr>

                            <!-- Mensaje si no hay coincidencias con el filtro -->
                            <tr *ngIf="documentosPaginados.length === 0">
                              <td colspan="8" class="text-center py-6 text-slate-400">
                                <i class="fas fa-file-circle-question text-2xl mb-1 opacity-50 block"></i>
                                <span>No se encontraron comprobantes que coincidan con "{{ filtroDocumento }}"</span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <!-- Barra de Paginado Inferior -->
                      <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 text-xs text-slate-500">
                        <div>
                          Mostrando <strong class="text-slate-700">{{ primerIndiceMostrado }}</strong> a <strong class="text-slate-700">{{ ultimoIndiceMostrado }}</strong> de <strong class="text-slate-700">{{ totalDocumentosFiltrados }}</strong> comprobantes en este lote
                        </div>

                        <div *ngIf="totalPaginas > 1" class="flex items-center gap-1">
                          <button
                            type="button"
                            (click)="cambiarPagina(paginaActual - 1)"
                            [disabled]="paginaActual === 1"
                            class="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors">
                            &larr; Anterior
                          </button>

                          <button
                            *ngFor="let p of paginasArray"
                            type="button"
                            (click)="cambiarPagina(p)"
                            class="w-7 h-7 rounded-lg text-xs font-bold transition-all"
                            [ngClass]="paginaActual === p ? 'bg-blue-600 text-white shadow-xs' : 'border border-slate-200 text-slate-600 hover:bg-slate-100'">
                            {{ p }}
                          </button>

                          <button
                            type="button"
                            (click)="cambiarPagina(paginaActual + 1)"
                            [disabled]="paginaActual === totalPaginas"
                            class="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors">
                            Siguiente &rarr;
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </ng-container>
            </tbody>
          </table>
        </div>
      </div>

      <!-- MODAL REVISIÓN DE TICKET (CE_RevisionTicket) -->
      <div *ngIf="mostrarModalRevision && ticketParaRevision" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div class="flex items-center gap-2">
              <div class="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">
                <i class="fas fa-clipboard-check"></i>
              </div>
              <div>
                <h3 class="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <span>Revisión de Ticket: {{ ticketParaRevision.codigoTicket }}</span>
                </h3>
                <p class="text-[10px] text-slate-400 font-mono">Tabla Asociativa: CE_RevisionTicket (Auditoría RUP / SoD)</p>
              </div>
            </div>
            <button (click)="mostrarModalRevision = false" class="text-slate-400 hover:text-slate-600">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <form (ngSubmit)="guardarAuditoriaRevision()" class="space-y-4 mt-4 text-xs">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Ticket / Lote</label>
                <input
                  type="text"
                  [value]="revisionActual.codigoTicket"
                  disabled
                  class="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-mono font-bold text-blue-700" />
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Resultado de Aprobación</label>
                <select
                  [(ngModel)]="revisionActual.resultadoAprobacion"
                  name="resultadoAprobacion"
                  required
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500">
                  <option value="EN_PROCESO">EN PROCESO</option>
                  <option value="APROBADO">APROBADO</option>
                  <option value="OBSERVADO">OBSERVADO</option>
                  <option value="RECHAZADO">RECHAZADO</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Usuario Revisor</label>
                <input
                  type="text"
                  [(ngModel)]="revisionActual.revisor"
                  name="revisor"
                  required
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Rol Revisor</label>
                <input
                  type="text"
                  [(ngModel)]="revisionActual.rolRevisor"
                  name="rolRevisor"
                  class="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-semibold text-slate-600" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Fecha Inicio Revisión</label>
                <input
                  type="text"
                  [(ngModel)]="revisionActual.fechaInicioRevision"
                  name="fechaInicioRevision"
                  required
                  placeholder="YYYY-MM-DD HH:mm"
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Fecha Fin / Cierre</label>
                <input
                  type="text"
                  [(ngModel)]="revisionActual.fechaFinRevision"
                  name="fechaFinRevision"
                  placeholder="YYYY-MM-DD HH:mm"
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Observación Contable (Dictamen)</label>
              <textarea
                [(ngModel)]="revisionActual.observacionContable"
                name="observacionContable"
                rows="3"
                required
                placeholder="Detalle de observaciones de folios, inconsistencias de OCR o motivos de reproceso..."
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white"></textarea>
            </div>

            <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                (click)="mostrarModalRevision = false"
                class="px-4 py-2 font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl">
                Cancelar
              </button>
              <button
                type="submit"
                [disabled]="guardandoRevision"
                class="px-4 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm flex items-center gap-2">
                <i *ngIf="guardandoRevision" class="fas fa-spinner fa-spin"></i>
                <span>Guardar Auditoría de Revisión</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- MODAL OFICIAL DE SOLICITUD DE BÚSQUEDA FÍSICA Y NUEVO LOTE (CUS-03 / CUS-01) -->
      <div *ngIf="mostrarModalNuevoTicket" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
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
            <button (click)="mostrarModalNuevoTicket = false" class="text-slate-400 hover:text-slate-600">
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
                  placeholder="ej. 50"
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
              (click)="mostrarModalNuevoTicket = false"
              class="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl">
              Cancelar
            </button>
            <button
              type="button"
              (click)="guardarNuevoTicket()"
              [disabled]="guardandoTicket || !solicitudForm.rucEmisor"
              class="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md shadow-amber-600/30 disabled:opacity-50 flex items-center gap-2">
              <i class="fas" [ngClass]="guardandoTicket ? 'fa-spinner fa-spin' : 'fa-paper-plane'"></i>
              <span>{{ guardandoTicket ? 'Generando Ticket...' : 'Emitir Orden de Búsqueda' }}</span>
            </button>
          </div>
        </div>
      </div>


      <!-- MODAL SUBIR DOCUMENTO PDF / OCR (CUS-01) -->
      <div *ngIf="mostrarModalSubida" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div class="flex items-center gap-2">
              <h3 class="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <span>Cargar Archivo PDF a Azure Storage</span>
                <span class="text-slate-400 hover:text-blue-600 cursor-help text-xs" title="Caso de Uso CUS-01: Carga y Procesamiento OCR Asíncrono">
                  <i class="fas fa-circle-info"></i>
                </span>
              </h3>
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
  public authService = inject(AuthService);
  private archivoService = inject(ArchivoService);

  tickets: TicketDigitalizacion[] = [];
  mostrarModalNuevoTicket: boolean = false;
  mostrarModalSubida: boolean = false;
  ticketSeleccionadoId: number = 1;
  procesandoSubida: boolean = false;
  guardandoTicket: boolean = false;

  // Formulario estructurado unificado (CUS-01 / CUS-03)
  solicitudForm: SolicitudBusquedaFisicaRequest = {
    rucEmisor: '',
    razonSocial: '',
    serieNumero: '',
    tipoDocumento: 'FACTURA',
    fechaDesde: '2023-01-01',
    fechaHasta: '2023-12-31',
    prioridad: 'ALTA',
    numeroCajaArchivador: '',
    totalDocumentosEsperados: 50,
    motivoSolicitud: 'Recepción de lote físico para digitalización y conciliación (CUS-01)'
  };

  // Estado del desplegable de comprobantes (Carga Lazy bajo demanda)
  ticketExpandidoId: number | null = null;
  documentosTicket: DocumentoContable[] = [];
  cargandoDocumentos: boolean = false;
  filtroDocumento: string = '';
  paginaActual: number = 1;
  itemsPorPagina: number = 10; // Configurable: 10 o 15 por página
  totalDocumentosServidor: number = 0;
  totalPaginasServidor: number = 1;

  // Estado del modal Revisión de Ticket (CE_RevisionTicket)
  mostrarModalRevision: boolean = false;
  ticketParaRevision: TicketDigitalizacion | null = null;
  guardandoRevision: boolean = false;

  revisionActual: RevisionTicket = {
    idRevision: 0,
    idTicket: 0,
    codigoTicket: '',
    idUsuario: 1,
    revisor: 'María Fernández (Analista Contable)',
    rolRevisor: 'Contable',
    fechaInicioRevision: '',
    fechaFinRevision: '',
    observacionContable: '',
    resultadoAprobacion: 'EN_PROCESO'
  };

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

  // Paginado Lazy bajo demanda
  get totalDocumentosFiltrados(): number {
    return this.totalDocumentosServidor;
  }

  get totalPaginas(): number {
    return this.totalPaginasServidor || 1;
  }

  get paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  get documentosPaginados(): DocumentoContable[] {
    return this.documentosTicket;
  }

  get primerIndiceMostrado(): number {
    if (this.totalDocumentosFiltrados === 0) return 0;
    return (this.paginaActual - 1) * this.itemsPorPagina + 1;
  }

  get ultimoIndiceMostrado(): number {
    return Math.min(this.paginaActual * this.itemsPorPagina, this.totalDocumentosFiltrados);
  }

  ngOnInit(): void {
    this.cargarTickets();
  }

  cargarTickets(): void {
    this.digitalizacionService.getTickets().subscribe(res => {
      this.tickets = res || [];
    });
  }

  toggleExpandirTicket(ticket: TicketDigitalizacion): void {
    if (this.ticketExpandidoId === ticket.idTicket) {
      this.ticketExpandidoId = null;
      this.documentosTicket = [];
      return;
    }
    this.ticketExpandidoId = ticket.idTicket;
    this.paginaActual = 1;
    this.filtroDocumento = '';
    this.cargarDocumentosLazy(ticket.idTicket, 1);
  }

  cargarDocumentosLazy(idTicket: number, pagina: number = 1): void {
    this.cargandoDocumentos = true;
    this.digitalizacionService.getDocumentosPorTicketPaginado(
      idTicket,
      pagina,
      this.itemsPorPagina,
      this.filtroDocumento
    ).subscribe(res => {
      this.documentosTicket = res.items || [];
      this.totalDocumentosServidor = res.totalRegistros;
      this.totalPaginasServidor = res.totalPaginas;
      this.paginaActual = res.pagina;
      this.cargandoDocumentos = false;
    });
  }

  onFiltrarDocumentos(q: string): void {
    this.filtroDocumento = q;
    this.paginaActual = 1;
    if (this.ticketExpandidoId) {
      this.cargarDocumentosLazy(this.ticketExpandidoId, 1);
    }
  }

  limpiarFiltro(): void {
    this.filtroDocumento = '';
    this.paginaActual = 1;
    if (this.ticketExpandidoId) {
      this.cargarDocumentosLazy(this.ticketExpandidoId, 1);
    }
  }

  cambiarPagina(p: number): void {
    if (p >= 1 && p <= this.totalPaginas && this.ticketExpandidoId) {
      this.paginaActual = p;
      this.cargarDocumentosLazy(this.ticketExpandidoId, p);
    }
  }

  cambiarItemsPorPagina(nuevoLimite: any): void {
    this.itemsPorPagina = Number(nuevoLimite) || 10;
    this.paginaActual = 1;
    if (this.ticketExpandidoId) {
      this.cargarDocumentosLazy(this.ticketExpandidoId, 1);
    }
  }

  abrirModalRevisionTicket(ticket: TicketDigitalizacion): void {
    this.ticketParaRevision = ticket;
    const currentUser = this.authService.currentUser();
    this.digitalizacionService.getRevisionPorTicket(ticket.idTicket).subscribe(rev => {
      this.revisionActual = {
        ...rev,
        revisor: currentUser?.nombres || rev.revisor || 'María Fernández (Analista Contable)',
        rolRevisor: currentUser?.rol || rev.rolRevisor || 'Contable'
      };
      this.mostrarModalRevision = true;
    });
  }

  guardarAuditoriaRevision(): void {
    this.guardandoRevision = true;
    this.digitalizacionService.guardarRevisionTicket(this.revisionActual).subscribe(() => {
      this.guardandoRevision = false;
      this.mostrarModalRevision = false;
      this.notificationService.success(`✅ Revisión técnica registrada en CE_RevisionTicket con dictamen: [${this.revisionActual.resultadoAprobacion}]`);
      this.cargarTickets();
    });
  }

  abrirModalNuevoTicket(): void {
    if (!this.authService.canAccess(['Contable', 'Administrador'])) {
      this.notificationService.warning('Solo el área Contable o el Administrador pueden crear tickets.');
      return;
    }
    this.solicitudForm = {
      rucEmisor: '',
      razonSocial: '',
      serieNumero: '',
      tipoDocumento: 'FACTURA',
      fechaDesde: '2023-01-01',
      fechaHasta: '2023-12-31',
      prioridad: 'ALTA',
      numeroCajaArchivador: '',
      totalDocumentosEsperados: 50,
      motivoSolicitud: 'Recepción de lote físico para digitalización y conciliación (CUS-01)'
    };
    this.mostrarModalNuevoTicket = true;
  }

  abrirModalSubida(): void {
    this.mostrarModalSubida = true;
  }

  guardarNuevoTicket(): void {
    if (!this.authService.canAccess(['Contable', 'Administrador'])) {
      this.notificationService.warning('Solo el área Contable o el Administrador pueden crear tickets.');
      return;
    }
    if (!this.solicitudForm.rucEmisor) {
      this.notificationService.warning('Debe ingresar el RUC del proveedor.');
      return;
    }
    this.solicitudForm.totalDocumentosEsperados = Number(this.solicitudForm.totalDocumentosEsperados) || 1;
    this.guardandoTicket = true;
    this.archivoService.solicitarBusquedaFisica(this.solicitudForm).subscribe({
      next: (ticketCreado) => {
        this.guardandoTicket = false;
        this.mostrarModalNuevoTicket = false;
        const codigo = ticketCreado?.codigoTicket || 'TK-PENDIENTE';
        this.notificationService.success(`Ticket ${codigo} generado exitosamente en estado PENDIENTE.`);
        this.cargarTickets();
      },
      error: () => {
        this.guardandoTicket = false;
        this.notificationService.error('Ocurrió un error al registrar la solicitud del lote.');
      }
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
        if (this.ticketExpandidoId === this.ticketSeleccionadoId) {
          this.cargarDocumentosLazy(this.ticketSeleccionadoId, 1);
        }
      });
    }
  }
}
