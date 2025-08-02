import {Component, Input, OnInit} from '@angular/core';
import {CourseService} from '../../../services/course.service';
import { LessonService } from '../../../services/lesson.service';
import {Course} from '../../../entities/course';
import {IconComponent} from '../../../components/icon/icon.component';
import {FooterButtonComponent} from '../../../components/buttons/footer-button/footer-button.component';
import {Lesson} from '../../../entities/lesson';
import {Router} from '@angular/router';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-lessons',
  imports: [
    IconComponent,
    FooterButtonComponent,
    NgForOf
  ],
  templateUrl: './lessons.component.html',
  styleUrl: './lessons.component.css'
})
export class LessonsComponent implements OnInit {
  @Input() courseId: number = 0;

  constructor(
    private courseService: CourseService,
    private lessonService: LessonService,
    private router: Router
  ) {}

  getCourse(): Course {
    const courses = this.courseService.getCourses({id: this.courseId});
    if (courses.length > 0) {
      return courses[0];
    }
    return new Course();
  }

  getLessons() {
    return this.lessonService.getLessons({courseId: this.courseId});
  }

  navigate(lesson: Lesson) {
    // Navigate to the lesson detail page
    this.router.navigate(['/courses', this.courseId, 'lessons', lesson.id]);
  }

  enroll() {

  }

  ngOnInit() {
    // Load the course and lessons when the component initializes
    this.courseService.loadCourses({id: this.courseId});
    this.lessonService.loadLessons({courseId: this.courseId});
  }
}
