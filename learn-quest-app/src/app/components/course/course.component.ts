import {Component, Input} from '@angular/core';
import {Course} from '../../entities/course';
import {FooterButtonComponent} from '../buttons/footer-button/footer-button.component';
import {Router} from '@angular/router';
import {IconComponent} from '../icon/icon.component';
import {RouteService} from '../../services/core/route.service';
import {NgIf} from '@angular/common';
import {faArrowRight, faBars} from '@fortawesome/free-solid-svg-icons';
import {SideButtonComponent} from '../buttons/side-button/side-button.component';

@Component({
  selector: 'app-course',
  imports: [
    FooterButtonComponent,
    IconComponent,
    NgIf,
    SideButtonComponent
  ],
  templateUrl: './course.component.html',
  styleUrl: './course.component.css'
})
export class CourseComponent {
  @Input() course: Course = new Course();
  @Input() href: string = '';
  @Input() lite: boolean = false;

  constructor(
    public router: Router,
    private routeService: RouteService
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
    this.routeService.navigateTo(this.href, {courseId: this.course.id});
  }

  protected readonly faBars = faBars;
  protected readonly faArrowRight = faArrowRight;
}
