import {WizardFieldConfig} from './wizard-field-config';

export interface WizardStepConfig {
  key: string;
  title: string;
  description?: string;
  fields: WizardFieldConfig[];
}
