import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyFormat',
  standalone: true
})
export class CurrencyFormatPipe implements PipeTransform {
  transform(value: number | string | null | undefined, currencyCode: string = 'S/'): string {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return `${currencyCode} 0.00`;
    }
    const num = Number(value);
    return `${currencyCode} ${num.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}
