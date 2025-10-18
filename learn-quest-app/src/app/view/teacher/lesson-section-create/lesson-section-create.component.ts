import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {catchError, debounceTime, distinctUntilChanged, finalize, switchMap, tap} from 'rxjs/operators';

import {LessonSectionService} from '../../../services/entity/lesson-section.service';
import {LessonSection} from '../../../entities/lesson-section';
import {ModuleRegistryService} from '../../../services/module/module-registry.service';
import {ModuleDefinition} from '../../../interfaces/interactive/module-meta';
import {EMPTY, map} from 'rxjs';
import {HtmlFieldComponent} from '../../../components/form/html-field/html-field.component';
import {ModalService} from '../../../services/modal/modal.service';
import {InteractiveModuleLibraryComponent} from '../interactive-module-library/interactive-module-library.component';
import {ModuleHostComponent} from '../../../components/module-host/module-host.component';
import {ModuleConfigFormComponent} from '../../../components/module-config-form/module-config-form.component';
import {CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList} from '@angular/cdk/drag-drop';

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
  questionType: string | null;
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
    ModuleConfigFormComponent,
    CdkDropList,
    CdkDrag,
    CdkDragHandle
  ],
  templateUrl: './lesson-section-create.component.html',
  styleUrls: ['./lesson-section-create.component.css']
})
export class LessonSectionCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private sectionService = inject(LessonSectionService);
  lessonId!: number;
  private lessonSections: LessonSection[] = [];

  // Persisted accordion open/close states by section key
  private accordionState: Record<string, boolean> = {};

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

    // Load accordion state from localStorage
    this.loadAccordionState();

    // Load and populate sections from backend/cache
    this.loadAndPopulateSections();
  }

  private loadAndPopulateSections(): void {
    // Force a new API call to get the latest data, without relying on cached data
    this.sectionService.loadSections(
      { lesson: this.lessonId },
      sections => {
        this.lessonSections = sections;
        this.populateSectionsFromData(sections);
      },
      true // force reload from API
    );
  }

  private populateSectionsFromData(sections: LessonSection[]): void {
    console.log('Populating form with sections data', sections);

    // Clear current sections
    while (this.sections.length) this.sections.removeAt(0);

    // Push groups sorted by position
    sections
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      .forEach(s => this.sections.push(this.createSectionGroupFromEntity(s)));

    // Register autosave for each group (after creation)
    this.sections.controls.forEach(g => this.registerAutosave(g as FormGroup));

    // If no sections were received, add one empty section
    if (this.sections.length === 0) {
      this.addSection();
    }

    // Manually update form controls to ensure HTML editors receive their values
    this.refreshFormControls();
  }

  /**
   * Explicitly refresh form control values to ensure the HTML editors
   * and Bootstrap accordions are properly initialized
   */
  private refreshFormControls(): void {
    // Short timeout to ensure components are rendered first
    setTimeout(() => {
      console.log('Refreshing form controls for', this.sections.length, 'sections');

      // Process each section
      this.sections.controls.forEach((group: AbstractControl) => {
        const formGroup = group as FormGroup;

        // 1. Re-apply content to HTML editors (if type is 'text')
        if (formGroup.get('type')?.value === 'text') {
          const currentContent = formGroup.get('content')?.value;
          if (currentContent) {
            // Force a rewrite of the content value to trigger writeValue in the HTML editor
            formGroup.get('content')?.setValue(currentContent, { emitEvent: true });
          }
        }

        // 2. Apply saved accordion state (handled by template [class.show])
        const sectionId = this.getSectionElementId(formGroup);
        const collapseEl = document.getElementById(sectionId);
        if (collapseEl) {
          const open = this.isSectionOpen(formGroup);
          collapseEl.classList.toggle('show', open);
          // Sync header button attributes/classes too
          const btn = document.querySelector(`button.accordion-button[data-bs-target="#${sectionId}"]`) as HTMLElement | null;
          if (btn) {
            btn.setAttribute('aria-expanded', String(open));
            btn.classList.toggle('collapsed', !open);
          }
        }
      });

      // After applying, persist a normalized snapshot
      this.saveAccordionState();
    }, 100); // Small delay to ensure DOM is ready
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
      questionType: null,
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
      // Use the new dedicated fields instead of JSON
      base.questionPrompt = e.questionPrompt ?? '';
      base.questionType = e.questionType ?? 'radio';
      base.explanation = e.questionExplanation ?? '';

      // Convert questionOptions to answers format
      if (e.questionOptions && e.questionOptions.length > 0) {
        base.answers = e.questionOptions.map(opt => ({ text: opt.optionText }));
      } else {
        base.answers = [{ text: '' }, { text: '' }];
      }

    }

    return this.createSectionGroup(base.position!, base);
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
      questionType: new FormControl<string | null>(prefill?.questionType ?? 'radio'),
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

    // Question type changes handler
    g.get('questionType')!.valueChanges.subscribe((qt: string | null) => {
      if (g.get('type')!.value === 'question') {
        this.handleQuestionTypeChange(g, qt);
      }
    });

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

  updateTextAnswer(i: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    const g = this.sectionAt(i);
    const arr = this.answersArray(i);

    // Store the text answer in the first answer option
    if (arr.length === 0) {
      arr.push(this.fb.group({ text: this.fb.control(value, { nonNullable: true }) }));
    } else {
      arr.at(0).patchValue({ text: value });
    }

    // Set correctIndex to 0 (the first and only answer for text/number types)
    g.patchValue({ correctIndex: 0 });
  }

  handleQuestionTypeChange(group: FormGroup, questionType: string | null) {
    const arr = group.get('answers') as FormArray<FormGroup>;

    // For text/number types, ensure we have exactly one answer option
    if (questionType === 'text' || questionType === 'number') {
      // Keep only the first answer or create one
      while (arr.length > 1) {
        arr.removeAt(arr.length - 1);
      }
      if (arr.length === 0) {
        arr.push(this.fb.group({ text: this.fb.control('', { nonNullable: true }) }));
      }
      // Set correctIndex to 0 by default for text/number
      group.patchValue({ correctIndex: 0 }, { emitEvent: false });
    } else if (questionType === 'radio' || questionType === 'checkbox') {
      // For radio/checkbox, ensure at least 2 options
      while (arr.length < 2) {
        arr.push(this.fb.group({ text: this.fb.control('', { nonNullable: true, validators: [Validators.required] }) }));
      }
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
      // Keep content empty - we use dedicated fields now
      content = '';
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

    // Add question-specific fields
    if (v.type === 'question') {
      payload.questionPrompt = v.questionPrompt;
      payload.questionType = v.questionType || 'radio';
      payload.questionExplanation = v.explanation;

      // Convert answers to questionOptions
      payload.questionOptions = (v.answers || []).map((a, idx) => ({
        optionText: a.text,
        position: idx
      }));

      // Store correctIndex as correctAnswer
      payload.correctAnswer = v.correctIndex !== null ? String(v.correctIndex) : null;
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

  protected readonly JSON = JSON;
  trackByPosition(index: number, item: AbstractControl) {
    return item.get('position')?.value;
  }

  getAllowedTags() {
    return new Set(['p','br','strong','em','u','s','blockquote','pre','code','span','ul','ol','li','h2','h3','h4','a','mark','hint','callout']);
  }

  // -------- Accordion state persistence --------
  private storageKey(): string { return `lessonSectionsAccordion:${this.lessonId}`; }

  private loadAccordionState(): void {
    try {
      const raw = localStorage.getItem(this.storageKey());
      this.accordionState = raw ? JSON.parse(raw) : {};
    } catch {
      this.accordionState = {};
    }
  }

  private saveAccordionState(): void {
    try {
      localStorage.setItem(this.storageKey(), JSON.stringify(this.accordionState));
    } catch {
      // ignore
    }
  }

  private getSectionStorageKey(g: FormGroup): string {
    const id = g.get('id')?.value;
    const pos = g.get('position')?.value;
    return id ? String(id) : `new-${pos}`;
  }

  isSectionOpen(g: FormGroup): boolean {
    const key = this.getSectionStorageKey(g);
    const val = this.accordionState[key];
    return val === undefined ? true : !!val; // default open
  }

  private updateAccordionStateFromDOM(): void {
    this.sections.controls.forEach((ctrl: AbstractControl) => {
      const g = ctrl as FormGroup;
      const key = this.getSectionStorageKey(g);
      const elId = this.getSectionElementId(g);
      const el = document.getElementById(elId);
      const open = !!el?.classList.contains('show');
      this.accordionState[key] = open;
    });
    this.saveAccordionState();
  }

  toggleAllAccordions(open: boolean): void {
    // Update state map
    this.sections.controls.forEach((ctrl: AbstractControl) => {
      const g = ctrl as FormGroup;
      const key = this.getSectionStorageKey(g);
      this.accordionState[key] = open;
      const elId = this.getSectionElementId(g);
      const el = document.getElementById(elId);
      if (el) {
        el.classList.toggle('show', open);
      }
    });
    // Update header aria-expanded for buttons and their collapsed class
    document.querySelectorAll('.accordion-item .accordion-header .accordion-button').forEach(btn => {
      const el = btn as HTMLElement;
      el.setAttribute('aria-expanded', String(open));
      el.classList.toggle('collapsed', !open);
    });
    this.saveAccordionState();

    // Reflow editors when opening all
    if (open) {
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 50);
    }
  }

  parseJsonSafe(v: string) {
    try { return JSON.parse(v ?? '{}'); } catch { return null; }
  }

  getEncodedJson(target: EventTarget | null) {
    if (!(target instanceof HTMLTextAreaElement)) return '';
    return target.value;
  }

  /** Move a control inside a FormArray without recreating it */
  private moveFormArrayControl(array: FormArray, from: number, to: number) {
    if (from === to) return;
    const dir = to > from ? 1 : -1;
    const item = array.at(from);
    for (let i = from; i !== to; i += dir) {
      const next = array.at(i + dir);
      array.setControl(i, next);
    }
    array.setControl(to, item);
  }

  dropSection(event: CdkDragDrop<FormGroup[]>) {
    if (event.previousIndex === event.currentIndex) return;
    console.log(event);
    this.moveFormArrayControl(this.sections, event.previousIndex, event.currentIndex);
    // Trigger your autosave / change detection
    this.sections.markAsDirty();
    this.sections.updateValueAndValidity({ emitEvent: true });
    this.reindexPositions();
  }

  getSectionElementId(section: FormGroup): string {
    const id = section.get('id')?.value;
    const pos = section.get('position')?.value;
    return `lessonSectionContent-${ id ?? ('new-' + pos) }`;
  }

  setSectionOpen($event: PointerEvent) {
    // Ensure proper initialization of all accordions after toggling
    // Wait for Bootstrap collapse transition (~350ms) to complete before persisting state
    setTimeout(() => {
      // Persist the current accordion open/close states
      this.updateAccordionStateFromDOM();

      // Make sure HTML editors inside any visible sections are properly displayed
      document.querySelectorAll('.accordion-collapse.show app-html-field').forEach(editor => {
        const editorId = editor.getAttribute('id');
        if (editorId) {
          const editorEl = document.getElementById(editorId);
          if (editorEl) {
            // Trigger a resize/redraw event for the editor
            const event = new Event('resize');
            window.dispatchEvent(event);
          }
        }
      });
    }, 450);
  }
}
