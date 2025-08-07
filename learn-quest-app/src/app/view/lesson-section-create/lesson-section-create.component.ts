import {Component, ViewChild} from '@angular/core';
import {FormsModule, NgForm} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {LessonSection} from '../../entities/lesson-section';
import {LessonSectionService} from '../../services/lesson-section.service';
import {PrimaryButtonComponent} from '../../components/buttons/primary-button/primary-button.component';

@Component({
  selector: 'app-lesson-section-create',
  imports: [FormsModule, CommonModule, PrimaryButtonComponent],
  templateUrl: './lesson-section-create.component.html',
  styleUrl: './lesson-section-create.component.css'
})
export class LessonSectionCreateComponent {
  section: LessonSection = new LessonSection();
  @ViewChild('sectionForm') sectionForm?: NgForm;

  constructor(private lessonSectionService: LessonSectionService) {}

  submit() {
    this.lessonSectionService.createSection(this.section).subscribe({
      next: () => {
        this.section = new LessonSection();
      }
    });
  }

  getInnerBorderColor() {
    if (!this.sectionForm) {
      return 'border-color-2';
    }

    if (this.sectionForm.invalid && (this.sectionForm.dirty || this.sectionForm.touched)) {
      return 'border-color-1';
    }

    return 'border-color-2';
  }

  getOuterBorderColor() {
    if (!this.sectionForm) {
      return 'border-color-3';
    }

    if (this.sectionForm.invalid && (this.sectionForm.dirty || this.sectionForm.touched)) {
      return 'border-color-5';
    }

    return 'border-color-3';
  }
}
