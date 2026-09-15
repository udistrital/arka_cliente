import { AfterViewInit, Directive, EventEmitter, Host, Input, OnDestroy, Optional, Output } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { Subscription } from 'rxjs';
import { PopUpManager } from '../../managers/popUpManager';

@Directive({
  selector: '[ngxConfirmSelection]',
})
export class ConfirmSelectionDirective implements AfterViewInit, OnDestroy {

  @Input('ngxConfirmSelection') confirmSelection: string;
  @Input() confirmSelectionControl: AbstractControl;
  @Input() confirmSelectionDisplay: (value: any) => string;
  @Output() selectionConfirmed = new EventEmitter<any>();

  private subscription: Subscription;

  constructor(
    private popUpManager: PopUpManager,
    @Optional() @Host() private autocomplete: MatAutocomplete,
    @Optional() @Host() private select: MatSelect,
  ) { }

  ngAfterViewInit(): void {
    if (this.autocomplete) {
      this.subscription = this.autocomplete.optionSelected.subscribe((event: MatAutocompleteSelectedEvent) => {
        this.confirm(event.option.value);
      });
    } else if (this.select) {
      this.subscription = this.select.selectionChange.subscribe((event: MatSelectChange) => {
        this.confirm(event.value);
      });
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private confirm(value: any): void {
    const displayValue = this.confirmSelectionDisplay ? this.confirmSelectionDisplay(value) : this.defaultDisplay(value);
    const field = this.confirmSelection || 'valor';

    this.popUpManager.showAlertWithOptions({
      type: 'question',
      title: 'Confirmar selección',
      text: `¿Confirma la selección de ${field}: ${displayValue}?`,
      showCancelButton: true,
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar',
      allowOutsideClick: false,
      allowEscapeKey: false,
    }).then((result: any) => {
      if (result.value) {
        this.selectionConfirmed.emit(value);
        return;
      }

      if (this.confirmSelectionControl) {
        this.confirmSelectionControl.reset('');
        this.confirmSelectionControl.markAsTouched();
      }
    });
  }

  private defaultDisplay(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }
    if (typeof value !== 'object') {
      return `${value}`;
    }

    return value.NombreCompleto || value.Nombre || value.Codigo || value.Numero || `${value.Id || ''}`;
  }
}
