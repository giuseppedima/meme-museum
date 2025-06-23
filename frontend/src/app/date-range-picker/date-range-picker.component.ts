import { Component, Input, Output, EventEmitter, forwardRef, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgbDatepickerModule, NgbCalendar, NgbDate, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';

export interface DateRange {
  fromDate: NgbDate | null;
  toDate: NgbDate | null;
}

@Component({
  selector: 'app-date-range-picker',
  standalone: true,
  imports: [CommonModule, NgbDatepickerModule],
  templateUrl: './date-range-picker.component.html',
  styleUrl: './date-range-picker.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateRangePickerComponent),
      multi: true
    }
  ]
})
export class DateRangePickerComponent implements ControlValueAccessor {
  @Input() placeholder: string = 'Select date range';
  @Input() label: string = 'Date Range';
  @Input() maxDate: NgbDate | null = null;
  @Input() disabled: boolean = false;
  
  @Output() dateRangeChange = new EventEmitter<DateRange>();

  calendar = inject(NgbCalendar);
  formatter = inject(NgbDateParserFormatter);

  hoveredDate: NgbDate | null = null;
  fromDate: NgbDate | null = null;
  toDate: NgbDate | null = null;

  private onChange = (value: DateRange) => {};
  private onTouched = () => {};

  constructor() {
    this.maxDate = this.calendar.getToday();
  }

  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date && (date.after(this.fromDate) || date.equals(this.fromDate))) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
    
    this.emitChange();
  }

  private emitChange() {
    const dateRange: DateRange = {
      fromDate: this.fromDate,
      toDate: this.toDate
    };
    
    this.onChange(dateRange);
    this.dateRangeChange.emit(dateRange);
  }

  isHovered(date: NgbDate) {
    return (
      this.fromDate && !this.toDate && this.hoveredDate && 
      date.after(this.fromDate) && date.before(this.hoveredDate)
    );
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return (
      date.equals(this.fromDate) ||
      (this.toDate && date.equals(this.toDate)) ||
      this.isInside(date) ||
      this.isHovered(date)
    );
  }

  get selectedDateRange(): string {
    if (this.fromDate && this.toDate) {
      return `${this.formatter.format(this.fromDate)} - ${this.formatter.format(this.toDate)}`;
    } else if (this.fromDate) {
      return this.formatter.format(this.fromDate);
    }
    return '';
  }

  clearSelection() {
    this.fromDate = null;
    this.toDate = null;
    this.emitChange();
  }

  // Metodo pubblico per gestire il focus
  handleFocus() {
    this.onTouched();
  }

  // ControlValueAccessor implementation
  writeValue(value: DateRange): void {
    if (value) {
      this.fromDate = value.fromDate;
      this.toDate = value.toDate;
    } else {
      this.fromDate = null;
      this.toDate = null;
    }
  }

  registerOnChange(fn: (value: DateRange) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}