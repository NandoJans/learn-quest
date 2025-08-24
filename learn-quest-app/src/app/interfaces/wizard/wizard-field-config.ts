import {FormField} from '../../types/form-field';

export interface WizardFieldConfig {
  type: FormField;
  name: string;
  label: string;
  placeholder?: string;
  options?: { label: string; value: any }[];   // for selects
  disabled?: boolean;
  value?: any;
  validators?: {
    required?: boolean;
    email?: boolean;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string; // RegExp source (no slashes)
  };
}
