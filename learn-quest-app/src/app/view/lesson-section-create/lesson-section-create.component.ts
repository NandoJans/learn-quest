import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {LessonSectionService} from '../../services/lesson-section.service';
import {LessonSection} from '../../entities/lesson-section';
import {PrimaryButtonComponent} from '../../components/buttons/primary-button/primary-button.component';

@Component({
  selector: 'app-lesson-section-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PrimaryButtonComponent],
  templateUrl: './lesson-section-create.component.html',
  styleUrl: './lesson-section-create.component.css'
})
export class LessonSectionCreateComponent implements OnInit {
  lessonId!: number;
  sectionsForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private sectionService: LessonSectionService
  ) {
    this.sectionsForm = this.fb.group({
      sections: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.lessonId = Number(this.route.snapshot.paramMap.get('lessonId'));
    this.addSection();
  }

  get sections(): FormArray {
    return this.sectionsForm.get('sections') as FormArray;
  }

  private createSectionGroup(): FormGroup {
    return this.fb.group({
      id: null,
      type: ['text'],
      content: ['']
    });
  }

  addSection(): void {
    const group = this.createSectionGroup();
    this.sections.push(group);
    this.registerAutosave(group, this.sections.length - 1);
  }

  private registerAutosave(group: FormGroup, index: number): void {
    group.valueChanges.subscribe(value => {
      const payload: LessonSection = {
        id: value.id,
        lessonId: this.lessonId,
        type: value.type,
        content: value.content,
        position: index
      } as LessonSection;

      if (payload.id) {
        this.sectionService.updateSection(payload).subscribe();
      } else if (value.type || value.content) {
        this.sectionService.createSection(payload).subscribe(created => {
          group.patchValue({id: created.id}, {emitEvent: false});
        });
      }
    });
  }
}

