import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 transform transition-all">
        <div class="flex items-center gap-3 mb-4">
          <div [ngClass]="getIconBgClasses()" class="w-10 h-10 rounded-full flex items-center justify-center shrink-0">
            <i [class]="iconClass"></i>
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-800">{{ title }}</h3>
            <p class="text-xs text-slate-500">{{ subtitle }}</p>
          </div>
        </div>

        <div class="text-sm text-slate-600 mb-6">
          <ng-content></ng-content>
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            (click)="onCancel()"
            class="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
            {{ cancelText }}
          </button>
          <button
            type="button"
            (click)="onConfirm()"
            [ngClass]="getConfirmBtnClasses()"
            class="px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-sm transition-all flex items-center gap-2">
            <span>{{ confirmText }}</span>
          </button>
        </div>
      </div>
    </div>
  `
})
export class ConfirmModalComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = 'Confirmar Acción';
  @Input() subtitle: string = 'Esta acción registrará auditoría en el sistema';
  @Input() iconClass: string = 'fas fa-exclamation-triangle text-amber-600';
  @Input() iconType: 'warning' | 'danger' | 'info' | 'success' = 'warning';
  @Input() confirmText: string = 'Confirmar';
  @Input() cancelText: string = 'Cancelar';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }

  getIconBgClasses(): string {
    switch (this.iconType) {
      case 'danger': return 'bg-rose-100 text-rose-600';
      case 'warning': return 'bg-amber-100 text-amber-600';
      case 'success': return 'bg-emerald-100 text-emerald-600';
      default: return 'bg-blue-100 text-blue-600';
    }
  }

  getConfirmBtnClasses(): string {
    switch (this.iconType) {
      case 'danger': return 'bg-rose-600 hover:bg-rose-700 shadow-rose-200';
      case 'warning': return 'bg-amber-600 hover:bg-amber-700 shadow-amber-200';
      case 'success': return 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200';
      default: return 'bg-blue-600 hover:bg-blue-700 shadow-blue-200';
    }
  }
}
