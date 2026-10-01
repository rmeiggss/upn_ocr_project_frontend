import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'scoreBadge',
  standalone: true
})
export class ScoreBadgePipe implements PipeTransform {
  transform(score: number | null | undefined): string {
    const val = Number(score) || 0;
    if (val >= 80) {
      return `Alta Confianza (${val}%)`;
    } else {
      return `Requiere confirmación manual (${val}%)`;
    }
  }
}
