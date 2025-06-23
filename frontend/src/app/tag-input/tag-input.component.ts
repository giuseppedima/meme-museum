import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, AbstractControl } from '@angular/forms';
import { TagInputModule } from 'ngx-chips';
import { Observable, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type TagModel = string | {
  [key: string]: any;
};

@Component({
  selector: 'app-tag-input',
  standalone: true,
  imports: [TagInputModule, CommonModule, FormsModule],
  templateUrl: './tag-input.component.html',
  styleUrl: './tag-input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TagInputComponent),
      multi: true
    }
  ]
})
export class TagInputComponent implements ControlValueAccessor {
  @Input() placeholder: string = 'Add tags...';
  @Input() cssClass: string = 'form-control';
  @Input() inputId?: string;
  @Input() separatorKeyCodes: number[] = [32, 188]; // Space and comma
  @Input() theme: string = 'bootstrap';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;

  value: any[] = [];

  readonly validators = [(control: AbstractControl) => {
    if (control.value.length < 4) {
      return { tagTooShort: true };
    }
    if (control.value.length > 16) {
      return { tagTooLong: true };
    }
    if (!/^[a-z]+$/.test(control.value)) {
      return { invalidTagFormat: true };
    }
    return null;
  }];

  readonly errorMessages = {
    'invalidTagFormat': 'Tags must contain only lowercase letters',
    'tagTooShort': 'Tags must be at least 4 characters long',
    'tagTooLong': 'Tags must be at most 16 characters long',
  };

  onChange = (value: any) => {};
  onTouched = () => {};

  writeValue(value: any): void {
    this.value = value || [];
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onTagAdding(tag: TagModel): Observable<string> {
    const lowercaseTag = typeof tag === 'string' ? tag.toLowerCase() : String(tag).toLowerCase();
    return of(lowercaseTag);
  }
}