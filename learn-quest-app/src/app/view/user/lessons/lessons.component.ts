import {Component, Input, OnInit} from '@angular/core';
import {CourseService} from '../../../services/course.service';
import { LessonService } from '../../../services/lesson.service';
import {Course} from '../../../entities/course';
import {IconComponent} from '../../../components/icon/icon.component';
import {FooterButtonComponent} from '../../../components/buttons/footer-button/footer-button.component';
import {Lesson} from '../../../entities/lesson';
import {Router, RouterLink} from '@angular/router';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-lessons',
  imports: [
    IconComponent,
    FooterButtonComponent,
    NgForOf,
    RouterLink
  ],
  templateUrl: './lessons.component.html',
  styleUrl: './lessons.component.css'
})
export class LessonsComponent implements OnInit {
  @Input() courseId: number = 0;

  showEnrollNotification = false;

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


  ngOnInit() {
    // Load the course and lessons when the component initializes
    this.courseService.loadCourses({id: this.courseId});
    this.lessonService.loadLessons({courseId: this.courseId});
    // Load courses the user is enrolled in to update the button state
    this.courseService.loadEnrolledCourses();
  }

  isEnrolled(): boolean {
    return this.courseService
      .getEnrolledCourses()
      .some(course => course.id === this.courseId);
  }

  enroll() {
    if (this.isEnrolled()) {
      return;
    }
    this.courseService.enrollInCourse(this.courseId).subscribe({
      next: (response: any) => {
        // Reload the enrolled courses and show a confirmation
        this.courseService.loadEnrolledCourses(true);
        this.showEnrollNotification = true;
        console.log('Enrolled in course:', response);
      }
    });
  }
}
