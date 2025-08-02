import {Component, Input} from '@angular/core';
import {Course} from '../../entities/course';
import {FaIconComponent, FaIconLibrary, IconDefinition} from '@fortawesome/angular-fontawesome';
import {faQuestion} from '@fortawesome/free-solid-svg-icons/faQuestion';
import {PrimaryButtonComponent} from '../buttons/primary-button/primary-button.component';
import {FooterButtonComponent} from '../buttons/footer-button/footer-button.component';

@Component({
  selector: 'app-course',
  imports: [
    FaIconComponent,
    PrimaryButtonComponent,
    FooterButtonComponent
  ],
  templateUrl: './course.component.html',
  styleUrl: './course.component.css'
})
export class CourseComponent {
  @Input() course: Course = new Course();

  constructor(public iconLibrary: FaIconLibrary) {
  }

  getName(): string {
    return this.course.name || 'No Name';
  }

  getIcon(): IconDefinition {
    return this.iconLibrary.getIconDefinition('fas', this.course.faIcon) || faQuestion
  }

  getColor(): string {
    return this.course.primaryColor || '#000000';
  }

  getDescription() {
    return this.course.description || 'No description available.';
  }
}
