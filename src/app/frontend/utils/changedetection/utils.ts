import {MonoTypeOperatorFunction} from 'rxjs';
import {map} from 'rxjs/operators';

export function changeDetectionSafeUpdate<T>(): MonoTypeOperatorFunction<T> {
  let currentData: T;
  return sourceObservable =>
    sourceObservable.pipe(
      map(source => {
        if (currentData) {
          currentData = safeReplace(currentData, source);
        } else {
          currentData = source;
        }
        return currentData;
      }),
    );
}

function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}

function safeReplace(target: any, source: any) {
  let sourceKeys: string[];

  switch (true) {
    // Safely replace array items to keep old memory references
    case Array.isArray(target) && Array.isArray(source):
      // Update all indexes from source
      source.forEach((item: any, index: number) => {
        target[index] = safeReplace(target[index], item);
      });
      // Delete old indexes
      if (target.length !== source.length) {
        target.splice(source.length, target.length - source.length);
      }

      return target;

    // Safely replace objects to keep old memory references
    case isObject(target) && isObject(source):
      sourceKeys = Object.keys(source);
      // Add all source keys
      sourceKeys.forEach((key: string) => {
        target[key] = safeReplace(target[key], source[key]);
      });
      // Remove old target keys not included in source
      Object.keys(target)
        .filter(key => sourceKeys.indexOf(key) === -1)
        .forEach(key => {
          delete target[key];
        });

      return target;

    // Return in case source is primitive value
    default:
      return source;
  }
}
