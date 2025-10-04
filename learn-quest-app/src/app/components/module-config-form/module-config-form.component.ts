import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-module-config-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgForOf,
    NgIf
  ],
  templateUrl: './module-config-form.component.html',
  styleUrl: './module-config-form.component.css'
})
export class ModuleConfigFormComponent implements OnChanges {
  @Input() config: any = {};
  @Output() configChange = new EventEmitter<any>();

  private fb = inject(FormBuilder);
  form = this.fb.group<any>({});

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config']) {
      this.rebuildForm(this.config || {});
    }
  }

  private rebuildForm(config: any): void {
    const group: Record<string, any> = {};
    for (const k of Object.keys(config)) {
      group[k] = [config[k]];
    }
    this.form = this.fb.group(group);

    // Subscribe to form changes to emit updates
    this.form.valueChanges.subscribe(value => {
      this.configChange.emit(value);
    });
  }

  keys = Object.keys;
  isPrimitive = (v: any) => typeof v === 'string' || typeof v === 'number';
  isNumber = (v: any) => typeof v === 'number';

  // Help text for common configuration fields
  getHelpText(fieldName: string): string {
    const helpTexts: Record<string, string> = {
      min: 'Minimum value for the range',
      max: 'Maximum value for the range',
      step: 'Step increment value',
      operations: 'Mathematical operations to include',
      numberOfQuestions: 'How many questions to generate',
      difficulty: 'Level of difficulty for the module',
      timeLimit: 'Maximum time in seconds',
      title: 'Display title for the module',
      description: 'Brief description of the module purpose'
    };

    return helpTexts[fieldName] || '';
  }
}
