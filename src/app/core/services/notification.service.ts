import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private toastsSignal = signal<ToastMessage[]>([]);
  readonly toasts = this.toastsSignal.asReadonly();

  show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', title?: string, duration: number = 4000): void {
    const id = Math.random().toString(36).substring(2, 9);
    const toast: ToastMessage = {
      id,
      type,
      title: title || this.getDefaultTitle(type),
      message,
      timestamp: new Date()
    };

    this.toastsSignal.update(list => [...list, toast]);

    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
  }

  success(message: string, title?: string): void {
    this.show(message, 'success', title);
  }

  error(message: string, title?: string): void {
    this.show(message, 'error', title, 6000);
  }

  warning(message: string, title?: string): void {
    this.show(message, 'warning', title, 5000);
  }

  info(message: string, title?: string): void {
    this.show(message, 'info', title);
  }

  remove(id: string): void {
    this.toastsSignal.update(list => list.filter(t => t.id !== id));
  }

  private getDefaultTitle(type: string): string {
    switch (type) {
      case 'success': return 'Operación Exitosa';
      case 'error': return 'Error del Sistema';
      case 'warning': return 'Advertencia de Validación';
      case 'info': return 'Información';
      default: return 'Notificación';
    }
  }
}
