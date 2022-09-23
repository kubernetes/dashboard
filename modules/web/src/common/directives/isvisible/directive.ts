import {AfterViewInit, Directive, EventEmitter, Output, ViewContainerRef} from '@angular/core';

@Directive({
  selector: '[kdIsVisible]',
})
export class IsVisibleDirective implements AfterViewInit {
  @Output() onVisibilityChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private readonly _viewContainerRef: ViewContainerRef) {}

  ngAfterViewInit(): void {
    const observedElement = this._viewContainerRef.element.nativeElement.parentElement;
    const observer = new IntersectionObserver(([entry]) => this.onVisibilityChange.emit(entry.isIntersecting));

    observer.observe(observedElement);
  }
}
