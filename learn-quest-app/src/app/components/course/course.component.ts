import {Component, Input} from '@angular/core';
import {Course} from '../../entities/course';
import {FooterButtonComponent} from '../buttons/footer-button/footer-button.component';
import {Router} from '@angular/router';
import {IconComponent} from '../icon/icon.component';

@Component({
  selector: 'app-course',
  imports: [
    FooterButtonComponent,
    IconComponent
  ],
  templateUrl: './course.component.html',
  styleUrl: './course.component.css'
})
export class CourseComponent {
  @Input() course: Course = new Course();
  @Input() href: string = '';

  constructor(
    public router: Router,
  ) {
  }

  getName(): string {
    return this.course.name || 'No Name';
  }

  getColor(): string {
    return this.course.primaryColor || '#000000';
  }

  getDescription() {
    return this.course.description || 'No description available.';
  }

  navigate() {
    if (this.href) {
      this.router.navigate([this.href, {courseId: this.course.id}]);
    } else {
      this.router.navigate(['/courses', {courseId: this.course.id}]);
    }
  }
}
