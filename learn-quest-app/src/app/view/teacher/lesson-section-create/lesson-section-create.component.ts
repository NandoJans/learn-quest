import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { debounceTime, distinctUntilChanged, filter, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';

import { LessonSectionService } from '../../../services/lesson-section.service';
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
  answers: { text: string }[];
  correctIndex: number | null;
  explanation: string;
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
  private destroyRef = inject(DestroyRef);

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
    this.sections.removeAt(i);
    this.reindexPositions();

    // Delete on backend if persisted
    if (id) {
      this.sectionService.deleteSection(id).subscribe();
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
      answers: this.fb.array<FormGroup>(
        (prefill?.answers?.length ? prefill.answers : [{ text: '' }, { text: '' }]).map(a =>
          this.fb.group({ text: this.fb.control(a.text ?? '', { nonNullable: true, validators: [Validators.required] }) })
        )
      ),
      correctIndex: new FormControl<number | null>(prefill?.correctIndex ?? null),
      explanation: new FormControl<string>(prefill?.explanation ?? '', { nonNullable: true })
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
    group.get('correctIndex')!.clearValidators();
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
        group.get('correctIndex')!.addValidators([Validators.required]);
        break;
    }

    group.get('content')!.updateValueAndValidity({ emitEvent: false });
    group.get('questionPrompt')!.updateValueAndValidity({ emitEvent: false });
    group.get('correctIndex')!.updateValueAndValidity({ emitEvent: false });
    group.get('widgetType')!.updateValueAndValidity({ emitEvent: false });
  }

  // --------- answers helpers ----------
  answersArray(i: number): FormArray<FormGroup> {
    return this.sectionAt(i).get('answers') as FormArray<FormGroup>;
  }

  addAnswer(i: number) {
    this.answersArray(i).push(this.fb.group({ text: this.fb.control('', { nonNullable: true, validators: [Validators.required] }) }));
  }

  removeAnswer(i: number, j: number) {
    const arr = this.answersArray(i);
    arr.removeAt(j);
    // If correctIndex pointed to removed one, reset
    const g = this.sectionAt(i);
    const idx = g.get('correctIndex')!.value as number | null;
    if (idx !== null && idx >= arr.length) {
      g.patchValue({ correctIndex: null });
    }
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
    let content: string | null = null;

    if (v.type === 'text') {
      content = v.content;
    } else if (v.type === 'widget') {
      content = JSON.stringify({ widgetType: v.widgetType, config: v.widgetConfig ?? null });
    } else if (v.type === 'question') {
      content = JSON.stringify({
        prompt: v.questionPrompt,
        answers: (v.answers || []).map(a => a.text),
        correctIndex: v.correctIndex,
        explanation: v.explanation
      });
    }

    return {
      id: v.id ?? undefined,
      lessonId: this.lessonId,
      type: v.type,
      content: content ?? '',
      position: v.position
    } as LessonSection;
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
