import {Component, computed, effect, EventEmitter, Input, Output, signal} from '@angular/core';
import {WizardFieldConfig} from '../../../interfaces/wizard/wizard-field-config';
import {WizardStepConfig} from '../../../interfaces/wizard/wizard-step-config';
import {WizardSubmitEvent} from '../../../interfaces/wizard/wizard-submit-event';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators
} from '@angular/forms';
import {FormField} from '../../../types/form-field';
import {NgForOf, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault} from '@angular/common';

@Component({
  selector: 'app-wizard-form',
  imports: [
    ReactiveFormsModule,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    NgIf,
    NgForOf
  ],
  templateUrl: './wizard-form.component.html',
  styleUrl: './wizard-form.component.css'
})
export class WizardFormComponent {
  @Input({required: true}) steps: WizardStepConfig[] = [];

  /** Start on this step index (default 0) */
  @Input() initialStep = 0;

  /** Linear mode blocks skipping ahead until previous steps are valid */
  @Input() linear = true;

  /** Button labels */
  @Input() backLabel = 'Back';
  @Input() nextLabel = 'Next';
  @Input() submitLabel = 'Submit';

  /** Optional: prefill values per step key */
  @Input() values: Record<string, Record<string, any>> | null = null;

  /** Emits final values on submit */
  @Output() submitted = new EventEmitter<WizardSubmitEvent>();

  /** Parent form groups by step key */
  form = new FormGroup<Record<string, FormGroup>>({} as any);

  currentIndex = signal(0);

  readonly currentStep = computed(() => this.steps[this.currentIndex()]);
  readonly isFirst = computed(() => this.currentIndex() === 0);
  readonly isLast = computed(() => this.currentIndex() === Math.max(0, this.steps.length - 1));

  constructor(private fb: FormBuilder) {
    // Rebuild when steps/values change
    effect(() => {
      const _ = [this.steps, this.values]; // track
      this.buildForm();
      // set initial index safely
      const safeStart = Math.min(Math.max(0, this.initialStep), Math.max(0, this.steps.length - 1));
      this.currentIndex.set(safeStart);
    });
  }

  // ---- Build form from config ----
  private buildForm(): void {
    const group: Record<string, FormGroup> = {};
    for (const step of this.steps) {
      const stepControls: Record<string, FormControl> = {};
      for (const field of step.fields) {
        const validators = this.toValidators(field.validators);
        const v = this.values?.[step.key]?.[field.name] ?? field.value ?? this.defaultValueFor(field.type);
        stepControls[field.name] = this.fb.control(
          {value: v, disabled: !!field.disabled},
          {validators}
        );
      }
      group[step.key] = this.fb.group(stepControls);
    }
    this.form = new FormGroup(group as any);
  }

  private defaultValueFor(type: FormField) {
    if (type === 'checkbox') return false;
    return null;
  }

  private toValidators(v?: WizardFieldConfig['validators']) {
    const arr: ValidatorFn[] = [];
    if (!v) return arr;
    if (v.required) arr.push(Validators.required);
    if (v.email) arr.push(Validators.email);
    if (typeof v.min === 'number') arr.push(Validators.min(v.min));
    if (typeof v.max === 'number') arr.push(Validators.max(v.max));
    if (typeof v.minLength === 'number') arr.push(Validators.minLength(v.minLength));
    if (typeof v.maxLength === 'number') arr.push(Validators.maxLength(v.maxLength));
    if (v.pattern) arr.push(Validators.pattern(new RegExp(v.pattern)));
    return arr;
  }

  // ---- Navigation ----
  getStepGroup(idx: number): FormGroup | null {
    const step = this.steps[idx];
    if (!step) return null;
    return this.form.get(step.key) as FormGroup;
  }

  markCurrentTouched(): void {
    const g = this.getStepGroup(this.currentIndex());
    g?.markAllAsTouched();
  }

  canGoNext(): boolean {
    if (!this.linear) return true;
    const g = this.getStepGroup(this.currentIndex());
    return !!g && g.valid;
  }

  next(): void {
    this.markCurrentTouched();
    if (!this.canGoNext()) return;
    const i = this.currentIndex();
    if (i < this.steps.length - 1) {
      this.currentIndex.set(i + 1);
    }
  }

  back(): void {
    const i = this.currentIndex();
    if (i > 0) this.currentIndex.set(i - 1);
  }

  goto(idx: number): void {
    if (idx < 0 || idx > this.steps.length - 1) return;
    if (!this.linear) {
      this.currentIndex.set(idx);
      return;
    }
    // linear: only allow going to first invalid-or-next step
    for (let i = 0; i < idx; i++) {
      const g = this.getStepGroup(i);
      if (!g?.valid) {
        this.currentIndex.set(i);
        return;
      }
    }
    this.currentIndex.set(idx);
  }

  // ---- Submit ----
  submit(): void {
    // mark all touched in linear mode to show errors
    if (this.linear) {
      Object.values(this.form.controls).forEach((g: AbstractControl) => g.markAllAsTouched());
    }
    this.submitted.emit({
      value: this.flattenValue(),
      rawValue: this.form.getRawValue(),
      valid: this.form.valid
    });
  }

  private flattenValue() {
    const out: Record<string, any> = {};
    const raw = this.form.getRawValue() as Record<string, any>;
    for (const stepKey of Object.keys(raw)) {
      Object.assign(out, raw[stepKey] ?? {});
    }
    return out;
  }

  // helpers for template
  controlOf(stepKey: string, fieldName: string): AbstractControl | null {
    return (this.form.get(stepKey) as FormGroup)?.get(fieldName) ?? null;
  }

  showError(ctrl: AbstractControl | null): boolean {
    return !!ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }
}
