import {AfterViewInit, Directive, ElementRef, Input, OnDestroy} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Directive({
  selector: '[kdAutofocus]',
})
export class AutofocusDirective implements AfterViewInit, OnDestroy {
  @Input() opened: Observable<boolean>;

  private readonly _unsubscribe = new Subject<void>();

  constructor(private readonly _el: ElementRef) {}

  ngAfterViewInit(): void {
    if (!this.opened) {
      throw new Error('[opened] event binding is undefined');
    }

    this.opened
      .pipe(takeUntil(this._unsubscribe))
      .subscribe(opened => (opened ? setTimeout(() => this._el.nativeElement.focus()) : null));
  }

  ngOnDestroy(): void {
    this._unsubscribe.next();
    this._unsubscribe.complete();
  }
}
