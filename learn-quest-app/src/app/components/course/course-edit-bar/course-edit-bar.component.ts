import { Component, Input } from '@angular/core';
import { Course } from '../../../entities/course';
import { IconSelectorComponent } from '../../form/icon-selector/icon-selector';
import { NgIf } from '@angular/common';
import { CourseService } from '../../../services/entity/course.service';

@Component({
  selector: 'app-course-edit-bar',
  standalone: true,
  imports: [IconSelectorComponent, NgIf],
  templateUrl: './course-edit-bar.component.html',
  styleUrl: './course-edit-bar.component.css'
})
export class CourseEditBarComponent {
  @Input() courseId: number = 0;
  @Input() course: Course | null = null;
  @Input() disabled: boolean = false;

  constructor(private courseService: CourseService) {}

  private patch(data: Partial<Course>) {
    if (this.disabled || !this.courseId) return;
    this.courseService
      .updateCourse(this.courseId, data as { [key: string]: any })
      .subscribe(() => this.courseService.loadCourses({ id: this.courseId }, true));
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
