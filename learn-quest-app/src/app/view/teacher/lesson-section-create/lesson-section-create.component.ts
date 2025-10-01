import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { debounceTime, distinctUntilChanged, filter, switchMap, tap } from 'rxjs/operators';

import { LessonSectionService } from '../../../services/entity/lesson-section.service';
import { LessonSection } from '../../../entities/lesson-section';
import { PrimaryButtonComponent } from '../../../components/buttons/primary-button/primary-button.component';

// OPTIONAL: If you have the MathPractice author component available, you can import it and show it conditionally.
// import { MathPracticeComponent, MathPracticeConfig } from '../../widgets/math-practice/math-practice.component';

type SectionType = 'text' | 'widget' | 'question';

interface SectionFormValue {
  id: number | null;
  type: SectionType;
  // Shared:
  position: number;
  // Text:
  content: string;
  // Widget:
  widgetType: string | null;
  widgetConfig: any; // store JSONable config
  // Question:
  questionPrompt: string;
  questionInputType: 'text' | 'number' | 'checkbox' | 'radio';
  questionAnswers: string[];
  questionCorrectAnswer: string;
  questionExplanation: string;
}

@Component({
  selector: 'app-lesson-section-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PrimaryButtonComponent, FormsModule, /*, MathPracticeComponent*/],
  templateUrl: './lesson-section-create.component.html',
  styleUrls: ['./lesson-section-create.component.css']
})
export class LessonSectionCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private sectionService = inject(LessonSectionService);
  lessonId!: number;

  sectionsForm = this.fb.group({
    sections: this.fb.array<FormGroup>([])
  });

  // For widget type selector (extend as you add widgets)
  widgetTypes = [
    { value: 'math-practice', label: 'Math Practice' },
    { value: 'simulator', label: 'Simulator' },
    { value: 'custom', label: 'Custom (JSON config)' }
  ];

  ngOnInit(): void {
    this.lessonId = Number(this.route.snapshot.paramMap.get('lessonId'));
    // Ensure at least one section
    if (this.sections.length === 0) this.addSection();
  }

  // --------- getters ----------
  get sections(): FormArray<FormGroup> {
    return this.sectionsForm.get('sections') as FormArray<FormGroup>;
  }

  sectionAt(i: number): FormGroup {
    return this.sections.at(i) as FormGroup;
  }

  // --------- add / remove ----------
  addSection(prefill?: Partial<SectionFormValue>): void {
    const group = this.createSectionGroup(this.sections.length, prefill);
    this.sections.push(group);
    this.registerAutosave(group);
  }

  removeSection(i: number): void {
    const group = this.sectionAt(i);
    const id = group.get('id')?.value as number | null;

    // Optimistically remove
    const removedSection = this.sections.at(i);
    this.sections.removeAt(i);
    this.reindexPositions();

    // Delete on backend if persisted
    if (id) {
      this.sectionService.deleteSection(id).subscribe({
        error: (err) => {
          // Restore the section in the UI
          this.sections.insert(i, removedSection);
          this.reindexPositions();
          window.alert('Failed to delete section. Please try again.');
        }
      });
    }
  }

  // --------- form factory ----------
  private createSectionGroup(position: number, prefill?: Partial<SectionFormValue>): FormGroup {
    const g = this.fb.group({
      id: new FormControl<number | null>(prefill?.id ?? null),
      type: new FormControl<SectionType>(prefill?.type ?? 'text', { nonNullable: true }),
      position: new FormControl<number>(position, { nonNullable: true }),

      // Text
      content: new FormControl<string>(prefill?.content ?? '', { nonNullable: true }),

      // Widget
      widgetType: new FormControl<string | null>(prefill?.widgetType ?? null),
      widgetConfig: new FormControl<any>(prefill?.widgetConfig ?? null),

      // Question
      questionPrompt: new FormControl<string>(prefill?.questionPrompt ?? '', { nonNullable: true }),
      questionInputType: new FormControl<'text' | 'number' | 'checkbox' | 'radio'>(prefill?.questionInputType ?? 'radio', { nonNullable: true }),
      questionAnswers: new FormControl<string[]>(prefill?.questionAnswers ?? ['', ''], { nonNullable: true }),
      questionCorrectAnswer: new FormControl<string>(prefill?.questionCorrectAnswer ?? '', { nonNullable: true }),
      questionExplanation: new FormControl<string>(prefill?.questionExplanation ?? '', { nonNullable: true })
    });

    // Type-driven validators
    g.get('type')!.valueChanges.subscribe((t: SectionType) => this.applyTypeValidators(g, t));
    this.applyTypeValidators(g, g.get('type')!.value as SectionType);

    return g;
  }

  private applyTypeValidators(group: FormGroup, type: SectionType) {
    // Clear all first
    group.get('content')!.clearValidators();
    group.get('questionPrompt')!.clearValidators();
    group.get('questionCorrectAnswer')!.clearValidators();
    group.get('widgetType')!.clearValidators();

    switch (type) {
      case 'text':
        group.get('content')!.addValidators([Validators.required, Validators.minLength(3)]);
        break;

      case 'widget':
        group.get('widgetType')!.addValidators([Validators.required]);
        // widgetConfig can be nullable; enforce in UI if specific widget chosen
        break;

      case 'question':
        group.get('questionPrompt')!.addValidators([Validators.required, Validators.minLength(3)]);
        group.get('questionCorrectAnswer')!.addValidators([Validators.required]);
        break;
    }

    group.get('content')!.updateValueAndValidity({ emitEvent: false });
    group.get('questionPrompt')!.updateValueAndValidity({ emitEvent: false });
    group.get('questionCorrectAnswer')!.updateValueAndValidity({ emitEvent: false });
    group.get('widgetType')!.updateValueAndValidity({ emitEvent: false });
  }

  // --------- answers helpers ----------
  getQuestionAnswers(i: number): string[] {
    return this.sectionAt(i).get('questionAnswers')!.value as string[];
  }

  addAnswer(i: number) {
    const current = this.getQuestionAnswers(i);
    this.sectionAt(i).patchValue({ questionAnswers: [...current, ''] });
  }

  removeAnswer(i: number, j: number) {
    const current = this.getQuestionAnswers(i);
    if (current.length > 1) {
      const updated = current.filter((_, idx) => idx !== j);
      this.sectionAt(i).patchValue({ questionAnswers: updated });
    }
  }

  updateAnswer(i: number, j: number, value: string) {
    const current = this.getQuestionAnswers(i);
    const updated = [...current];
    updated[j] = value;
    this.sectionAt(i).patchValue({ questionAnswers: updated });
  }

  toggleCheckboxAnswer(i: number, answer: string, checked: boolean) {
    const g = this.sectionAt(i);
    const current = g.get('questionCorrectAnswer')!.value as string;
    const currentAnswers = current ? current.split(',').filter(a => a) : [];
    
    if (checked && !currentAnswers.includes(answer)) {
      currentAnswers.push(answer);
    } else if (!checked) {
      const idx = currentAnswers.indexOf(answer);
      if (idx !== -1) {
        currentAnswers.splice(idx, 1);
      }
    }
    
    g.patchValue({ questionCorrectAnswer: currentAnswers.join(',') });
  }

  // --------- autosave ----------
  private registerAutosave(group: FormGroup): void {
    group.valueChanges
      .pipe(
        debounceTime(350),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        filter(() => group.valid),
        switchMap(value => {
          const payload = this.toPayload(value as SectionFormValue);
          // create or update
          if (!payload.id) {
            return this.sectionService.createSection(payload).pipe(
              tap(created => {
                group.patchValue({ id: created.id }, { emitEvent: false });
              })
            );
          } else {
            return this.sectionService.updateSection(payload);
          }
        })
      )
      .subscribe();
  }

  private toPayload(v: SectionFormValue): LessonSection {
    const payload: LessonSection = {
      id: v.id ?? undefined,
      lessonId: this.lessonId,
      type: v.type,
      content: '',
      position: v.position,
      questionPrompt: '',
      questionInputType: 'radio',
      questionAnswers: [],
      questionCorrectAnswer: '',
      questionExplanation: ''
    } as LessonSection;

    if (v.type === 'text') {
      payload.content = v.content;
    } else if (v.type === 'widget') {
      payload.content = JSON.stringify({ widgetType: v.widgetType, config: v.widgetConfig ?? null });
    } else if (v.type === 'question') {
      payload.questionPrompt = v.questionPrompt;
      payload.questionInputType = v.questionInputType;
      payload.questionAnswers = v.questionAnswers;
      payload.questionCorrectAnswer = v.questionCorrectAnswer;
      payload.questionExplanation = v.questionExplanation;
    }

    return payload;
  }

  private reindexPositions() {
    this.sections.controls.forEach((g, idx) => {
      g.patchValue({ position: idx }, { emitEvent: false });
      // Ideally: call updateSection with new position; you can also batch reorder on save.
      const id = g.get('id')?.value;
      if (id) {
        const payload = this.toPayload(g.value as SectionFormValue);
        this.sectionService.updateSection(payload).subscribe();
      }
    });
  }

  // --------- UI short-hands ----------
  trackByIndex = (_: number, __: unknown) => _;
  asAny(x: unknown) { return x as any; }

  protected readonly JSON = JSON;
}
