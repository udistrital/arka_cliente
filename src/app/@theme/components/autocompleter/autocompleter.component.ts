import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable } from 'rxjs';
import { debounceTime, map, startWith } from 'rxjs/operators';

interface AutocompleterOption {
  value: number | string;
  name: string;
}

@Component({
  selector: 'ngx-autocompleter',
  templateUrl: './autocompleter.component.html',
  styleUrls: ['./autocompleter.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutocompleterComponent),
      multi: true,
    },
  ],
})
class AutocompleterComponent implements OnInit, ControlValueAccessor {

  onChange: (_: any) => void;
  onTouched: () => void;

  filteredOptions: Observable<AutocompleterOption[]>;

  control = new FormControl();
  @Input() options: AutocompleterOption[] = [];
  @Input()
  set disabled(disabled: boolean) {
    this.setDisabledState(disabled);
  }

  constructor() { }

  ngOnInit() {
    this.filteredOptions = this.control.valueChanges.pipe(
      debounceTime(250),
      startWith(''),
      map(value => typeof value === 'string' ? value : value.text),
      map(name => name ? this.filter(name) : this.options.slice()),
    );

    this.control.valueChanges
    .pipe(
      debounceTime(250),
    )
    .subscribe(val => {
      // console.debug({val});
      if (val.value) {
        this.onChange(val);
      }
    });
  }

  private filter(name: string): AutocompleterOption[] {
    return this.options
    .filter(val => val.name.toLowerCase().includes(name.toLowerCase()));
  }

  showOption(option: AutocompleterOption): string {
    return (option && option.name) ? option.name : '';
  }

  writeValue(obj: AutocompleterOption): void {
    if (obj.value) {
      this.control.setValue(obj);
    }
  }
  registerOnChange(fn: (_: any) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.control.disable();
    } else {
      this.control.enable();
    }
  }
}

export {
  AutocompleterOption,
  AutocompleterComponent,
};
