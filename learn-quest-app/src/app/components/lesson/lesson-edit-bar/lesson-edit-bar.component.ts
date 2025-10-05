import { Component, Input } from '@angular/core';
import { Lesson } from '../../../entities/lesson';
import { IconSelectorComponent } from '../../form/icon-selector/icon-selector';
import { NgIf } from '@angular/common';
import { LessonService } from '../../../services/entity/lesson.service';

@Component({
  selector: 'app-lesson-edit-bar',
  standalone: true,
  imports: [IconSelectorComponent],
  templateUrl: './lesson-edit-bar.component.html',
  styleUrl: './lesson-edit-bar.component.css'
})
export class LessonEditBarComponent {
  @Input() lessonId: number = 0;
  @Input() lesson: Lesson | null = null;
  @Input() disabled: boolean = false;

  constructor(private lessonService: LessonService) {}

  private patch(data: Partial<Lesson>) {
    if (this.disabled || !this.lessonId) return;
    this.lessonService
      .updateLesson(this.lessonId, data as { [key: string]: any })
      .subscribe(() => this.lessonService.loadLessons({ id: this.lessonId }, true));
  }

  onNameBlur(ev: FocusEvent) {
    const v = (ev.target as HTMLInputElement).value;
    this.patch({ name: v });
  }

  onCodeBlur(ev: FocusEvent) {
    const v = (ev.target as HTMLInputElement).value;
    this.patch({ code: v });
  }

  onDescriptionBlur(ev: FocusEvent) {
    const v = (ev.target as HTMLTextAreaElement).value;
    this.patch({ description: v });
  }

  onIconChange(icon: string) {
    this.patch({ faIcon: icon });
  }

  onColorBlur(ev: FocusEvent) {
    const v = (ev.target as HTMLInputElement).value;
    this.patch({ primaryColor: v });
  }
}
