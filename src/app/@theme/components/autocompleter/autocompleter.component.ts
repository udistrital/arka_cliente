import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl } from '@angular/forms';
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
})
class AutocompleterComponent implements OnInit {

  filteredOptions: Observable<AutocompleterOption[]>;

  @Input() control: AbstractControl;
  @Input() options: AutocompleterOption[];

  @Input() value: AutocompleterOption;
  @Output() valueChanges = new EventEmitter<AutocompleterOption>();

  constructor() { }

  ngOnInit() {
    this.filteredOptions = this.control.valueChanges.pipe(
      debounceTime(250),
      startWith(''),
      map(value => typeof value === 'string' ? value : value.text),
      map(name => name ? this.filter(name) : this.options.slice()),
    );
  }

  private filter(name: string): AutocompleterOption[] {
    return this.options
    .filter(val => val.name.toLowerCase().includes(name.toLowerCase()))
  }

  showOption(option: AutocompleterOption): string {
    return (option && option.name)? option.name : '';
  }

}

export {
  AutocompleterOption,
  AutocompleterComponent,
};
