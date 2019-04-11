import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'trim'})
export class TrimPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) {
      return '';
    }

    console.log(value);

    return value.trim();
  }
}
