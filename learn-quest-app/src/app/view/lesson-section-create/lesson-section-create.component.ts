import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {LessonSection} from '../../entities/lesson-section';
import {LessonSectionService} from '../../services/lesson-section.service';

@Component({
  selector: 'app-lesson-section-create',
  imports: [FormsModule],
  templateUrl: './lesson-section-create.component.html',
  styleUrl: './lesson-section-create.component.css'
})
export class LessonSectionCreateComponent {
  section: LessonSection = new LessonSection();

  constructor(private lessonSectionService: LessonSectionService) {}

  submit() {
    this.lessonSectionService.createSection(this.section).subscribe({
      next: () => {
        this.section = new LessonSection();
      }
    });
  }
}
