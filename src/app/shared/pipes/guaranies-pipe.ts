import { Pipe, type PipeTransform } from '@angular/core';

@Pipe({
  name: 'guaranies',
})
export class GuaraniesPipe implements PipeTransform {

  transform(value: number): string {
    if (value == null) return '0';
    return 'Gs. ' + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
}
