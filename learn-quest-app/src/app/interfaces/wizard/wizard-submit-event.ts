export interface WizardSubmitEvent {
  value: any;           // flattened object with all steps
  rawValue: any;        // form.getRawValue()
  valid: boolean;
}
