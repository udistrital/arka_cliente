import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
    selector: '[ngxSelectDirective]',
})
export class SelectDirective {

    constructor(private element: ElementRef) {}

    @HostListener('mouseenter')
    public onMouseEnter() {
        this.element.nativeElement.style.backgroundColor = '#5dcfe3';
    }

    @HostListener('mouseleave')
    public onMouseLeave() {
        this.element.nativeElement.style.backgroundColor = '';
    }

}
