import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DigitalizacionService } from '../../services/digitalizacion.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { DocumentoContable } from '../../../../core/models/comprobante.model';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';
import { ScoreBadgePipe } from '../../../../shared/pipes/score-badge.pipe';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-revision-split',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, StatusBadgeComponent, ScoreBadgePipe],
  template: `
    <div class="h-[calc(100vh-4rem)] flex flex-col overflow-hidden bg-slate-100">
      <!-- HEADER BAR SUPERIOR DE REVISIÓN SPLIT -->
      <div class="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-xs z-10">
        <div class="flex items-center gap-3">
          <a
            routerLink="/digitalizacion/tickets"
            class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors">
            <i class="fas fa-arrow-left text-xs"></i>
          </a>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>Supervisión OCR y Control de Calidad:</span>
                <span class="font-mono text-blue-600">{{ documento.serieNumero }}</span>
                <span class="text-slate-400 hover:text-amber-600 cursor-help text-xs" title="Casos de Uso CUS-02 (Supervisión OCR) y CUS-05 (Corrección de Comprobantes)">
                  <i class="fas fa-circle-info"></i>
                </span>
              </h1>
            </div>
            <div class="text-[10px] text-slate-400">
              Ticket: <strong class="text-slate-600">{{ documento.codigoTicket }}</strong> | Lote: {{ documento.razonSocial }}
            </div>
          </div>
        </div>

        <!-- Estado Actual y Acciones Principales -->
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <span class="text-slate-500 font-medium">Estado:</span>
            <app-status-badge [status]="documento.estado"></app-status-badge>
          </div>

          <!-- Selector de Modo Splitscreen / Full -->
          <div class="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              (click)="splitscreenMode = true"
              [class]="splitscreenMode ? 'bg-white shadow-xs font-bold text-blue-700' : 'text-slate-500'"
              class="px-2.5 py-1 rounded-md transition-all flex items-center gap-1">
              <i class="fas fa-columns"></i>
              <span>50 / 50</span>
            </button>
            <button
              (click)="splitscreenMode = false"
              [class]="!splitscreenMode ? 'bg-white shadow-xs font-bold text-blue-700' : 'text-slate-500'"
              class="px-2.5 py-1 rounded-md transition-all flex items-center gap-1">
              <i class="fas fa-maximize"></i>
              <span>Formulario</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ÁREA DE CONTENIDO DIVIDIDO (SPLIT SCREEN 50/50) -->
      <div class="flex-1 flex overflow-hidden">
        <!-- ======================================================== -->
        <!-- LADO IZQUIERDO (50%): VISOR DEL DOCUMENTO ORIGINAL ESCANEADO -->
        <!-- ======================================================== -->
        <section
          *ngIf="splitscreenMode"
          class="w-1/2 bg-slate-900 border-r border-slate-800 flex flex-col relative select-none">
          <!-- Toolbar del Visor PDF -->
          <div class="h-11 bg-slate-950/80 backdrop-blur-xs border-b border-slate-800 px-4 flex items-center justify-between text-slate-300 text-xs shrink-0">
            <div class="flex items-center gap-2">
              <i class="fas fa-file-pdf text-rose-500"></i>
              <span class="font-mono text-[11px] truncate max-w-[240px]" [title]="documento.nombreArchivo || 'documento.pdf'">
                {{ documento.nombreArchivo || 'documento.pdf' }}
              </span>
              <span class="px-1.5 py-0.5 text-[9px] bg-slate-800 text-slate-400 rounded">Storage Account</span>
            </div>

            <!-- Controles y Selector de Vista -->
            <div class="flex items-center gap-2">
              <div class="flex items-center bg-slate-800/90 rounded-lg p-0.5 text-[10px]">
                <button
                  type="button"
                  (click)="modoVisor = 'pdf'"
                  [class]="modoVisor === 'pdf' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'"
                  class="px-2 py-0.5 rounded transition-all flex items-center gap-1">
                  <i class="fas fa-file-pdf text-[10px]"></i>
                  <span>PDF Original</span>
                </button>
                <button
                  type="button"
                  (click)="modoVisor = 'ocr'"
                  [class]="modoVisor === 'ocr' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'"
                  class="px-2 py-0.5 rounded transition-all flex items-center gap-1">
                  <i class="fas fa-vector-square text-[10px]"></i>
                  <span>Bounding Boxes</span>
                </button>
              </div>

              <!-- Enlace para abrir o descargar el PDF original directamente -->
              <a
                [href]="pdfUrlRaw"
                target="_blank"
                title="Abrir comprobante original cargado en Azure Blob Storage en nueva pestaña"
                class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-white transition-colors flex items-center gap-1 text-[11px]">
                <i class="fas fa-arrow-up-right-from-square text-[10px]"></i>
                <span class="hidden sm:inline">Ver PDF</span>
              </a>

              <!-- Controles de Zoom (para modo OCR) -->
              <div *ngIf="modoVisor === 'ocr'" class="flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-700">
                <button (click)="zoomOut()" class="hover:text-white px-1"><i class="fas fa-minus text-[10px]"></i></button>
                <span class="text-[10px] font-mono px-1 font-bold">{{ zoomLevel }}%</span>
                <button (click)="zoomIn()" class="hover:text-white px-1"><i class="fas fa-plus text-[10px]"></i></button>
                <button (click)="resetZoom()" class="hover:text-white px-1 border-l border-slate-700 pl-1.5"><i class="fas fa-arrows-rotate text-[10px]"></i></button>
              </div>
            </div>
          </div>

          <!-- MODO 1: VISOR DEL PDF REAL DE AZURE BLOB STORAGE -->
          <div *ngIf="modoVisor === 'pdf'" class="flex-1 w-full h-full relative bg-slate-950 overflow-hidden flex flex-col">
            <iframe
              *ngIf="pdfUrlSegura"
              [src]="pdfUrlSegura"
              class="w-full h-full border-0 bg-slate-900"
              title="Visor del Documento Original de Azure Storage">
            </iframe>
            <div *ngIf="!pdfUrlSegura" class="flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center">
              <i class="fas fa-cloud-arrow-down text-4xl mb-3 text-slate-600"></i>
              <div class="text-xs font-semibold">Cargando archivo original desde Azure Blob Storage...</div>
            </div>
          </div>

          <!-- MODO 2: Lienzo con Bounding Boxes Interactivos (Metadatos OCR) -->
          <div *ngIf="modoVisor === 'ocr'" class="flex-1 overflow-auto p-6 flex items-center justify-center bg-slate-900/90 relative">
            <div
              [style.transform]="'scale(' + zoomLevel / 100 + ')'"
              class="origin-center transition-transform duration-150 bg-white text-slate-800 shadow-2xl rounded-lg w-[480px] min-h-[640px] p-6 text-[10px] relative border border-slate-300">
              
              <!-- Cabecera de la Factura Dinámica -->
              <div class="flex justify-between items-start border-b pb-3 mb-3">
                <div>
                  <div class="font-extrabold text-xs text-slate-900">{{ documento.razonSocial || 'SIN RAZÓN SOCIAL' }}</div>
                  <div class="text-[9px] text-slate-500">Documento analizado mediante Azure Document Intelligence</div>
                  <div class="text-[9px] text-slate-400 font-mono mt-0.5">{{ documento.nombreArchivo }}</div>
                </div>
                <div class="border-2 border-slate-800 p-2 text-center rounded bg-slate-50 w-36">
                  <div class="font-bold text-[10px]">R.U.C. {{ documento.rucEmisor || '-' }}</div>
                  <div class="font-extrabold text-blue-800 text-[11px] my-0.5">{{ documento.tipoDocumento || 'COMPROBANTE' }}</div>
                  <div class="font-mono font-bold text-[10px]">{{ documento.serieNumero || 'S/N' }}</div>
                </div>
              </div>

              <!-- Metadatos de Factura -->
              <div class="grid grid-cols-2 gap-2 p-2 bg-slate-50 rounded border border-slate-200 mb-3 text-[9px]">
                <div><span class="font-bold text-slate-600">Fecha de Emisión:</span> {{ documento.fechaEmision || '-' }}</div>
                <div><span class="font-bold text-slate-600">Moneda:</span> {{ documento.moneda || 'PEN' }}</div>
                <div><span class="font-bold text-slate-600">Ticket Lote:</span> {{ documento.codigoTicket }}</div>
                <div><span class="font-bold text-slate-600">Estado OCR:</span> {{ documento.estado }}</div>
              </div>

              <!-- Lista de Campos Extraídos OCR -->
              <div class="mb-4">
                <div class="font-bold text-slate-700 uppercase text-[9px] mb-1.5 border-b pb-1">Campos OCR Mapeados</div>
                <div *ngIf="documento.campos && documento.campos.length > 0" class="space-y-1">
                  <div *ngFor="let c of documento.campos" class="flex justify-between items-center py-1 px-1.5 bg-slate-50 rounded border border-slate-100">
                    <span class="font-medium text-slate-600">{{ c.nombreCampo }}</span>
                    <span class="font-mono font-bold text-slate-800">{{ c.valorCorregido || c.valorExtraido || '-' }}</span>
                    <span class="text-[8px] px-1 rounded bg-emerald-100 text-emerald-700 font-bold">{{ c.nivelConfianza }}%</span>
                  </div>
                </div>
                <div *ngIf="!documento.campos || documento.campos.length === 0" class="text-slate-400 text-center py-4">
                  Visualice la pestaña "PDF Original" para auditar el contenido completo del folio.
                </div>
              </div>

              <!-- Totales e Impuestos con Bounding Boxes -->
              <div class="w-48 ml-auto space-y-1 text-[9px] border-t pt-2">
                <div class="flex justify-between items-center px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-400">
                  <span class="font-semibold text-slate-600">Op. Gravada:</span>
                  <span class="font-mono font-bold">S/ {{ (documento.subtotal || 0) | number:'1.2-2' }}</span>
                </div>

                <div
                  [ngClass]="isIgvCorrected ? 'bg-emerald-50 border-emerald-400' : 'bg-rose-50 border-rose-500 animate-pulse'"
                  class="flex justify-between items-center px-1.5 py-0.5 rounded border-2 relative">
                  <span class="font-bold" [ngClass]="isIgvCorrected ? 'text-emerald-800' : 'text-rose-800'">
                    I.G.V. (18%):
                  </span>
                  <span class="font-mono font-black" [ngClass]="isIgvCorrected ? 'text-emerald-700' : 'text-rose-700'">
                    S/ {{ (documento.igv || 0) | number:'1.2-2' }}
                  </span>
                </div>

                <div class="flex justify-between items-center px-1.5 py-0.5 rounded bg-slate-100 font-bold border border-slate-300">
                  <span>Importe Total:</span>
                  <span class="font-mono font-black text-slate-900">S/ {{ (documento.total || 0) | number:'1.2-2' }}</span>
                </div>
              </div>

              <!-- Marca de Agua de Auditoría -->
              <div class="absolute bottom-4 left-6 text-[8px] text-slate-400 font-mono">
                Shohin Archivo Digital | ID Comprobante: #{{ documento.idDocumento }}
              </div>
            </div>
          </div>
        </section>

        <!-- ======================================================== -->
        <!-- LADO DERECHO (50%): FORMULARIO OCR Y CORRECCIÓN (CUS-05) -->
        <!-- ======================================================== -->
        <section
          [class]="splitscreenMode ? 'w-1/2' : 'w-full max-w-4xl mx-auto'"
          class="bg-white flex flex-col overflow-y-auto">
          
          <!-- Banner de Discrepancia Crítica (CUS-05) -->
          <div *ngIf="!isIgvCorrected" class="m-5 p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-3 shadow-xs">
            <div class="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 text-sm font-bold">
              <i class="fas fa-triangle-exclamation"></i>
            </div>
            <div class="flex-1">
              <div class="text-xs font-bold text-amber-900">Discrepancia Aritmética Detectada por Azure Document Intelligence</div>
              <div class="text-xs text-amber-800 mt-0.5">
                El valor OCR para IGV fue <strong class="font-mono">S/ 150.00</strong> (Certeza 55%). El cálculo matemático del 18% sobre la base imponible <strong class="font-mono">S/ 1,000.00</strong> debe ser exactamente <strong class="font-mono text-emerald-700">S/ 180.00</strong>.
              </div>
              <div class="mt-2.5">
                <button
                  type="button"
                  (click)="corregirIgvAutomatico()"
                  title="Caso de Uso CUS-05: Corrección de Comprobantes con Discrepancia Aritmética"
                  class="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm shadow-blue-500/30 transition-all flex items-center gap-2">
                  <i class="fas fa-wand-magic-sparkles"></i>
                  <span>Recalcular IGV Automático al 18% (S/ 180.00)</span>
                </button>
              </div>
            </div>
          </div>

          <div *ngIf="isIgvCorrected" class="m-5 p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3">
            <i class="fas fa-circle-check text-emerald-600 text-lg"></i>
            <div class="text-xs text-emerald-800 font-semibold">
              ✅ Campo IGV corregido y conciliado satisfactoriamente. Nivel de certeza elevado al 100%.
            </div>
          </div>

          <!-- Formulario de Campos Extraídos -->
          <div class="p-6 space-y-4 flex-1">
            <div class="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between pb-2 border-b">
              <span>Campos Extraídos por el Servicio Cognitivo</span>
              <span class="text-[10px] text-slate-400 font-normal">Algoritmo: prebuilt-invoice (Azure AI)</span>
            </div>

            <!-- Campo: RUC Emisor -->
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div class="flex items-center justify-between mb-1">
                <label class="text-[11px] font-bold text-slate-700">R.U.C. Emisor</label>
                <span class="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {{ 98 | scoreBadge }}
                </span>
              </div>
              <input
                type="text"
                [(ngModel)]="documento.rucEmisor"
                class="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-semibold" />
            </div>

            <!-- Campo: Razón Social -->
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div class="flex items-center justify-between mb-1">
                <label class="text-[11px] font-bold text-slate-700">Razón Social</label>
                <span class="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {{ 96 | scoreBadge }}
                </span>
              </div>
              <input
                type="text"
                [(ngModel)]="documento.razonSocial"
                class="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold" />
            </div>

            <!-- Fila: Serie/Número y Fecha -->
            <div class="grid grid-cols-2 gap-3">
              <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div class="flex items-center justify-between mb-1">
                  <label class="text-[11px] font-bold text-slate-700">Serie - Número</label>
                  <span class="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {{ 99 | scoreBadge }}
                  </span>
                </div>
                <input
                  type="text"
                  [(ngModel)]="documento.serieNumero"
                  class="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-blue-700" />
              </div>

              <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div class="flex items-center justify-between mb-1">
                  <label class="text-[11px] font-bold text-slate-700">Fecha de Emisión</label>
                  <span class="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {{ 95 | scoreBadge }}
                  </span>
                </div>
                <input
                  type="date"
                  [(ngModel)]="documento.fechaEmision"
                  class="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono" />
              </div>
            </div>

            <!-- Fila de Montos: Subtotal, IGV y Total -->
            <div class="grid grid-cols-3 gap-3">
              <!-- Subtotal -->
              <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div class="flex items-center justify-between mb-1">
                  <label class="text-[11px] font-bold text-slate-700">Op. Gravada</label>
                  <span class="text-[9px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                    {{ 97 | scoreBadge }}
                  </span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  [(ngModel)]="documento.subtotal"
                  class="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold" />
              </div>

              <!-- IGV con Criterio de Advertencia 4.B -->
              <div
                [ngClass]="isIgvCorrected ? 'border-emerald-300 bg-emerald-50/40' : 'border-rose-400 bg-rose-50/50 ring-2 ring-rose-200'"
                class="p-3 rounded-xl border transition-all">
                <div class="flex items-center justify-between mb-1">
                  <label class="text-[11px] font-bold" [ngClass]="isIgvCorrected ? 'text-emerald-800' : 'text-rose-800'">
                    IGV (18%)
                  </label>
                  <span
                    [ngClass]="isIgvCorrected ? 'text-emerald-700 bg-emerald-100' : 'text-rose-700 bg-rose-100 font-bold'"
                    class="text-[9px] px-1.5 py-0.5 rounded-full">
                    {{ documento.confianzaIgv | scoreBadge }}
                  </span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  [(ngModel)]="documento.igv"
                  [ngClass]="isIgvCorrected ? 'border-emerald-300 text-emerald-800' : 'border-rose-400 text-rose-800 font-bold'"
                  class="w-full px-3 py-1.5 bg-white border rounded-lg text-xs font-mono" />
                <div *ngIf="!isIgvCorrected" class="text-[10px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                  <i class="fas fa-exclamation-circle text-[9px]"></i> Requiere confirmación manual
                </div>
              </div>

              <!-- Total -->
              <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div class="flex items-center justify-between mb-1">
                  <label class="text-[11px] font-bold text-slate-700">Total Factura</label>
                  <span class="text-[9px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                    {{ isIgvCorrected ? 99 : 88 | scoreBadge }}
                  </span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  [(ngModel)]="documento.total"
                  class="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900" />
              </div>
            </div>

            <!-- Ficha de Almacén Físico (Comentado temporalmente por requerimiento: campos no persistidos en BD) -->
            <!--
            <div class="p-3 bg-blue-50/50 rounded-xl border border-blue-200/80 text-xs">
              <div class="font-bold text-blue-900 flex items-center gap-2 mb-1">
                <i class="fas fa-box-archive text-blue-600"></i>
                <span>Trazabilidad Física en Almacén</span>
                <span class="text-blue-400 hover:text-blue-600 cursor-help text-xs" title="Caso de Uso CUS-03: Ubicación y Archivo Histórico">
                  <i class="fas fa-circle-info"></i>
                </span>
              </div>
              <div class="grid grid-cols-3 gap-2 text-[11px] text-slate-600">
                <div>Almacén: <strong class="text-slate-800">{{ documento.ubicacionAlmacen }}</strong></div>
                <div>Estante: <strong class="text-slate-800">{{ documento.estanteArchivo }}</strong></div>
                <div>Caja: <strong class="text-slate-800">{{ documento.cajaArchivo }}</strong></div>
              </div>
            </div>
            -->
          </div>

          <!-- BARRA INFERIOR DE DECISIÓN Y TRANSICIÓN DE ESTADOS -->
          <div class="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div class="text-xs text-slate-500">
              Confirmar validación técnica:
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                (click)="cambiarEstado('ILEGIBLE')"
                class="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors">
                Declarar Ilegible
              </button>

              <!-- <button
                type="button"
                (click)="cambiarEstado('REPROCESAR')"
                class="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors">
                Reprocesar OCR
              </button> -->

              <button
                type="button"
                (click)="cambiarEstado('OBSERVADO')"
                class="px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors">
                Mantener Observado
              </button>

              <button
                type="button"
                (click)="cambiarEstado('CORRECTO')"
                title="Caso de Uso CUS-02: Control de Calidad y Aprobación Contable"
                class="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-500/30 rounded-lg transition-all flex items-center gap-1.5">
                <i class="fas fa-check"></i>
                <span>Aprobar Documento</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  `
})
export class RevisionSplitComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private digitalizacionService = inject(DigitalizacionService);
  private notificationService = inject(NotificationService);
  private sanitizer = inject(DomSanitizer);

  splitscreenMode: boolean = true;
  modoVisor: 'pdf' | 'ocr' = 'pdf';
  zoomLevel: number = 100;
  isIgvCorrected: boolean = false;

  documento: DocumentoContable = {
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
    igv: 150.00,
    total: 1150.00,
    confianzaGeneral: 78,
    confianzaIgv: 55,
    estado: 'OBSERVADO',
    ubicacionAlmacen: 'Almacén Central Lurín',
    estanteArchivo: 'Estante E-04',
    cajaArchivo: 'Caja CJ-2023-B4',
    nombreArchivo: 'factura_F001-00045231.pdf'
  };

  get pdfUrlRaw(): string {
    return `${environment.apiUrl}/documentos/${this.documento.idDocumento}/archivo`;
  }

  get pdfUrlSegura(): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.pdfUrlRaw);
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id')) || 1;
    this.digitalizacionService.getDocumentoPorId(id).subscribe(doc => {
      if (doc) {
        this.documento = doc;
        this.isIgvCorrected = doc.estado === 'CORRECTO' || ((doc.subtotal || 0) > 0 && Math.abs((doc.igv || 0) - ((doc.subtotal || 0) * 0.18)) < 0.05);
      }
    });
  }

  zoomIn(): void {
    if (this.zoomLevel < 180) this.zoomLevel += 15;
  }

  zoomOut(): void {
    if (this.zoomLevel > 60) this.zoomLevel -= 15;
  }

  resetZoom(): void {
    this.zoomLevel = 100;
  }

  corregirIgvAutomatico(): void {
    const subtotal = this.documento.subtotal || 1000.00;
    const igvCalculado = Number((subtotal * 0.18).toFixed(2));
    const totalCalculado = Number((subtotal + igvCalculado).toFixed(2));

    this.documento.igv = igvCalculado;
    this.documento.total = totalCalculado;
    this.documento.confianzaIgv = 100;
    this.documento.confianzaGeneral = 99;
    this.isIgvCorrected = true;
    this.documento.estado = 'CORRECTO';

    this.digitalizacionService.corregirCampo({
      idCampo: 106,
      nuevoValor: igvCalculado.toString(),
      motivoCorreccion: 'Recálculo aritmético de tasa IGV 18% conforme a Ley Tributaria'
    }).subscribe(() => {
      this.notificationService.success('✅ [CUS-05]: IGV recalculado a S/ 180.00 con 100% de confianza. Estado actualizado a CORRECTO.');
    });
  }

  cambiarEstado(nuevoEstado: 'CORRECTO' | 'OBSERVADO' | 'REPROCESAR' | 'ILEGIBLE'): void {
    this.documento.estado = nuevoEstado;
    this.digitalizacionService.validarDocumento(this.documento.idDocumento, {
      nuevoEstado,
      comentarios: `Transición de estado ejecutada en módulo de revisión: ${nuevoEstado}`
    }).subscribe(() => {
      this.notificationService.success(`[CUS-02]: Comprobante ${this.documento.serieNumero} clasificado como [${nuevoEstado}]`);
    });
  }
}
