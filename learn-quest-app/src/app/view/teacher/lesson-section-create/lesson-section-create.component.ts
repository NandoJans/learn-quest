import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {catchError, debounceTime, distinctUntilChanged, filter, finalize, switchMap, tap} from 'rxjs/operators';

import { LessonSectionService } from '../../../services/entity/lesson-section.service';
import { LessonSection } from '../../../entities/lesson-section';
import {ModuleRegistryService} from '../../../services/module/module-registry.service';
import {ModuleDefinition} from '../../../interfaces/interactive/module-meta';
import {EMPTY, map} from 'rxjs';
import {HtmlFieldComponent} from '../../../components/form/html-field/html-field.component';
import {ModalService} from '../../../services/modal/modal.service';
import {InteractiveModuleLibraryComponent} from '../interactive-module-library/interactive-module-library.component';
import {ModuleHostComponent} from '../../../components/module-host/module-host.component';
import {ModuleConfigFormComponent} from '../../../components/module-config-form/module-config-form.component';

type SectionType = 'text' | 'module' | 'question';

interface SectionFormValue {
  id: number | null;
  type: SectionType;
  // Shared:
  position: number;
  // Text:
  content: string;
  // Module:
  moduleSlug: string | null;
  moduleConfig: any;
  // Question:
  questionPrompt: string;
  answers: { text: string }[];
  correctIndex: number | null;
  explanation: string;
}

@Component({
  selector: 'app-lesson-section-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HtmlFieldComponent,
    ModuleHostComponent,
    ModuleConfigFormComponent
  ],
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
  moduleSlugs: ModuleDefinition[];

  constructor(
    private moduleRegistryService: ModuleRegistryService,
    private modalService: ModalService,
  ) {
    this.moduleSlugs = this.moduleRegistryService.list();
  }

  async openModuleLibraryFor(index: number) {
    const res = await this.modalService.open(InteractiveModuleLibraryComponent);
    if (!res) return;
    // res: { slug, config }
    const g = this.sectionAt(index);
    g.patchValue({
      moduleSlug: res.slug,
      moduleConfig: res.config
    });
  }


  ngOnInit(): void {
    this.lessonId = Number(this.route.snapshot.paramMap.get('lessonId'));

    // Load and populate sections from backend/cache
    this.loadAndPopulateSections();
  }

  private loadAndPopulateSections(): void {
    // 1) Try to load from backend/cache
    this.sectionService.loadSections({lesson: this.lessonId}, sections => {
      this.populateSectionsFromData(sections);
    });

    // 2) If data was already cached, the callback won't be triggered,
    //    so we also check the cache directly
    const cachedSections = this.sectionService.getSections({lesson: this.lessonId});
    if (cachedSections.length > 0) {
      this.populateSectionsFromData(cachedSections);
    } else if (cachedSections.length === 0) {
      // No cached data and no callback means we need to wait for the API call
      // or there are truly no sections, so we'll add one empty section if needed
      setTimeout(() => {
        if (this.sections.length === 0) {
          this.addSection();
        }
      }, 100);
    }
  }

  private populateSectionsFromData(sections: LessonSection[]): void {
    // Clear current
    while (this.sections.length) this.sections.removeAt(0);

    // Push groups
    sections
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      .forEach(s => this.sections.push(this.createSectionGroupFromEntity(s)));

    // If none exist, start with one empty section
    if (this.sections.length === 0) this.addSection();

    // Register autosave for each group (after creation)
    this.sections.controls.forEach(g => this.registerAutosave(g as FormGroup));
  }

  private createSectionGroupFromEntity(e: LessonSection): FormGroup {
    const base: Partial<SectionFormValue> = {
      id: e.id ?? null,
      type: e.type as SectionType,
      position: e.position ?? this.sections.length,
      content: '',
      moduleSlug: null,
      moduleConfig: null,
      questionPrompt: '',
      answers: [{ text: '' }, { text: '' }],
      correctIndex: null,
      explanation: ''
    };

    if (e.type === 'text') {
      base.content = e.content ?? '';
    } else if (e.type === 'module') {
      // For module type, use the separate fields directly
      base.moduleSlug = e.moduleSlug ?? null;
      base.moduleConfig = e.moduleConfig ?? null;
    } else if (e.type === 'question') {
      try {
        const parsed = e.content ? JSON.parse(e.content) : {};
        base.questionPrompt = parsed?.prompt ?? '';
        base.answers = (parsed?.answers ?? ['']).map((t: string) => ({ text: t ?? '' }));
        base.correctIndex = Number.isInteger(parsed?.correctIndex) ? parsed.correctIndex : null;
        base.explanation = parsed?.explanation ?? '';
      } catch { /* keep defaults */ }
    }

    const g = this.createSectionGroup(base.position!, base);
    return g;
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
      moduleSlug: new FormControl<string | null>(prefill?.moduleSlug ?? null),
      moduleConfig: new FormControl<any>(prefill?.moduleConfig ?? null),

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
    group.get('moduleSlug')!.clearValidators();

    switch (type) {
      case 'text':
        group.get('content')!.addValidators([Validators.required, Validators.minLength(3)]);
        break;

      case 'module':
        group.get('moduleSlug')!.addValidators([Validators.required]);
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
    group.get('moduleSlug')!.updateValueAndValidity({ emitEvent: false });
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

  autosaving = false;

  registerAutosave(group: FormGroup): void {
    let creating = false; // closure per group

    group.valueChanges.pipe(
      debounceTime(350),
      // compare the payload, not the raw form value
      map(v => this.toPayload(v as SectionFormValue)),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      switchMap(payload => {
        if (!payload.id) {
          if (creating) return EMPTY;            // ignore until first create resolves
          creating = true;
          return this.sectionService.createSection(payload).pipe(
            tap(created => {
              console.log('Created section', created);
              group.patchValue({id: created.id}, {emitEvent: false})
            }),
            finalize(() => creating = false),
            catchError(err => { console.error(err); return EMPTY; })
          );
        }
        // updates can use switchMap normally
        return this.sectionService.updateSection(payload).pipe(
          catchError(err => { console.error(err); return EMPTY; })
        );
      })
    ).subscribe();
  }


  private isSavable(g: FormGroup): boolean {
    const t = g.get('type')!.value as SectionType;
    if (t === 'text') {
      const val = (g.get('content')!.value as string)?.trim() ?? '';
      return val.length >= 3;
    }
    if (t === 'module') {
      return !!g.get('moduleSlug')!.value; // config optional
    }
    if (t === 'question') {
      const prompt = (g.get('questionPrompt')!.value as string)?.trim() ?? '';
      const ci = g.get('correctIndex')!.value as number | null;
      const answers = (g.get('answers')!.value as { text: string }[])
        .map(a => (a.text ?? '').trim())
        .filter(Boolean);
      const hasPrompt = prompt.length >= 3;
      const hasAnswers = answers.length >= 1;
      const ciOk = ci !== null && ci >= 0 && ci < answers.length;
      return hasPrompt && hasAnswers && ciOk;
    }
    return false;
  }

  getUnsavedReasons(g: FormGroup): string[] {
    const t = g.get('type')!.value as SectionType;
    const reasons: string[] = [];
    if (t === 'text') {
      const val = (g.get('content')!.value as string)?.trim() ?? '';
      if (!val) reasons.push('Explanation is required');
      if (val.length > 0 && val.length < 3) reasons.push('Minimum 3 characters');
    } else if (t === 'module') {
      if (!g.get('moduleSlug')!.value) reasons.push('Choose a module');
    } else if (t === 'question') {
      const prompt = (g.get('questionPrompt')!.value as string)?.trim() ?? '';
      const answers = (g.get('answers')!.value as { text: string }[])
        .map(a => (a.text ?? '').trim());
      const ci = g.get('correctIndex')!.value as number | null;

      if (!prompt) reasons.push('Add a prompt');
      if (prompt && prompt.length < 3) reasons.push('Prompt must be at least 3 characters');
      if (answers.filter(Boolean).length === 0) reasons.push('Add at least one answer');
      if (ci === null) reasons.push('Mark one answer as correct');
    }
    return reasons;
  }


  private toPayload(v: SectionFormValue): LessonSection {
    let content: string | null = null;

    if (v.type === 'text') {
      content = v.content;
    } else if (v.type === 'module') {
      // For module type, keep content empty as we use separate fields
      content = '';
    } else if (v.type === 'question') {
      content = JSON.stringify({
        prompt: v.questionPrompt,
        answers: (v.answers || []).map(a => a.text),
        correctIndex: v.correctIndex,
        explanation: v.explanation
      });
    }

    const payload: any = {
      id: v.id ?? undefined,
      lessonId: this.lessonId,
      type: v.type,
      content: content ?? '',
      position: v.position
    };

    // Add module-specific fields
    if (v.type === 'module') {
      payload.moduleSlug = v.moduleSlug;
      payload.moduleConfig = v.moduleConfig;
    }

    return payload as LessonSection;
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

  getAllowedTags() {
    return new Set(['p','br','strong','em','u','s','blockquote','pre','code','span','ul','ol','li','h2','h3','h4','a','mark','hint','callout']);
  }

  parseJsonSafe(v: string) {
    try { return JSON.parse(v ?? '{}'); } catch { return null; }
  }

  getEncodedJson(target: EventTarget | null) {
    if (!(target instanceof HTMLTextAreaElement)) return '';
    return target.value;
  }
}
