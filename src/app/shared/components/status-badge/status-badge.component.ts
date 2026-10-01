import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [ngClass]="getBadgeClasses()" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border">
      <span class="w-1.5 h-1.5 rounded-full" [ngClass]="getDotClasses()"></span>
      {{ label || status }}
    </span>
  `
})
export class StatusBadgeComponent {
  @Input() status: string = 'PENDIENTE';
  @Input() label?: string;

  getBadgeClasses(): string {
    const s = this.status?.toUpperCase() || '';
    switch (s) {
      case 'CORRECTO':
      case 'APROBADO':
      case 'PROCESADO':
      case 'ACTIVO':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'OBSERVADO':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'REPROCESAR':
      case 'PROCESANDO':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'ILEGIBLE':
      case 'RECHAZADO':
      case 'INACTIVO':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'PENDIENTE':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  }

  getDotClasses(): string {
    const s = this.status?.toUpperCase() || '';
    switch (s) {
      case 'CORRECTO':
      case 'APROBADO':
      case 'PROCESADO':
      case 'ACTIVO':
        return 'bg-emerald-500';
      case 'OBSERVADO':
        return 'bg-amber-500';
      case 'REPROCESAR':
      case 'PROCESANDO':
        return 'bg-blue-500';
      case 'ILEGIBLE':
      case 'RECHAZADO':
      case 'INACTIVO':
        return 'bg-rose-500';
      default:
        return 'bg-slate-400';
    }
  }
}
