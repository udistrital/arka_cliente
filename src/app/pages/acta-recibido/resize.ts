import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
    selector: 'textarea[autoresize]'
})
export class AutoResizeDirective {

    constructor(private elementRef: ElementRef) { }

    @HostListener('input', ['$event.target'])
    onInput(textarea: HTMLTextAreaElement): void {
        this.adjust();
    }

    ngAfterViewInit(): void {
        this.adjust();
    }

    adjust(): void {
        const element = this.elementRef.nativeElement as HTMLTextAreaElement;
        element.style.overflow = 'hidden';
        element.style.height = 'auto';

        // Get the total height of the content including padding
        const totalHeight = element.scrollHeight +
            parseInt(window.getComputedStyle(element).getPropertyValue('padding-top'), 10) +
            parseInt(window.getComputedStyle(element).getPropertyValue('padding-bottom'), 10);

        element.style.height = `${totalHeight}px`;
    }
}
