import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WizardFormComponent } from './wizard-form.component';
import { WizardStepConfig } from '../../../interfaces/wizard/wizard-step-config';

describe('WizardFormComponent', () => {
  let component: WizardFormComponent;
  let fixture: ComponentFixture<WizardFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WizardFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WizardFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should disable submit button when form is invalid in linear mode', () => {
    const steps: WizardStepConfig[] = [
      {
        key: 'step1',
        title: 'Step 1',
        fields: [
          {type: 'text', name: 'field1', label: 'Field 1', validators: {required: true}}
        ]
      }
    ];
    
    component.steps = steps;
    component.linear = true;
    component.initialStep = 0;
    fixture.detectChanges();

    // Navigate to last step (which is the only step)
    component.currentIndex.set(0);
    fixture.detectChanges();

    // Get the submit button
    const compiled = fixture.nativeElement;
    const submitButton = compiled.querySelector('button[type="submit"]');
    
    expect(submitButton).toBeTruthy();
    expect(submitButton.disabled).toBe(true);
  });

  it('should enable submit button when form is valid in linear mode', () => {
    const steps: WizardStepConfig[] = [
      {
        key: 'step1',
        title: 'Step 1',
        fields: [
          {type: 'text', name: 'field1', label: 'Field 1', validators: {required: true}}
        ]
      }
    ];
    
    component.steps = steps;
    component.linear = true;
    component.initialStep = 0;
    fixture.detectChanges();

    // Fill in the required field
    const stepGroup = component.getStepGroup(0);
    stepGroup?.get('field1')?.setValue('test value');
    fixture.detectChanges();

    // Get the submit button
    const compiled = fixture.nativeElement;
    const submitButton = compiled.querySelector('button[type="submit"]');
    
    expect(submitButton).toBeTruthy();
    expect(submitButton.disabled).toBe(false);
  });

  it('should not disable submit button when form is invalid in non-linear mode', () => {
    const steps: WizardStepConfig[] = [
      {
        key: 'step1',
        title: 'Step 1',
        fields: [
          {type: 'text', name: 'field1', label: 'Field 1', validators: {required: true}}
        ]
      }
    ];
    
    component.steps = steps;
    component.linear = false;
    component.initialStep = 0;
    fixture.detectChanges();

    // Get the submit button
    const compiled = fixture.nativeElement;
    const submitButton = compiled.querySelector('button[type="submit"]');
    
    expect(submitButton).toBeTruthy();
    expect(submitButton.disabled).toBe(false);
  });
});
