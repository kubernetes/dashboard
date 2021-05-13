import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'kdFilterBy'})
export class FilterByPipe implements PipeTransform {
  transform(arr: string[], predicate: string): string[] {
    return arr.filter(elem => elem.includes(predicate));
  }
}
