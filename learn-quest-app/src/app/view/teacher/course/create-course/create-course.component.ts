import {Component} from '@angular/core';
import {WizardFormComponent} from '../../../../components/form/wizard-form/wizard-form.component';
import {JsonPipe, NgIf} from '@angular/common';
import {WizardStepConfig} from '../../../../interfaces/wizard/wizard-step-config';
import {WizardSubmitEvent} from '../../../../interfaces/wizard/wizard-submit-event';
import {CourseService} from '../../../../services/entity/course.service';
import {Course} from '../../../../entities/course';
import {RouteService} from '../../../../services/core/route.service';

@Component({
  selector: 'app-create-course',
  imports: [
    WizardFormComponent
  ],
  templateUrl: './create-course.component.html',
  styleUrl: './create-course.component.css'
})
export class CreateCourseComponent {
  last: any;

  constructor(
    private courseService: CourseService,
    private routeService: RouteService
  ) {
  }

  steps: WizardStepConfig[] = [
    {
      key: 'course',
      title: 'Course',
      description: 'Details about the course',
      fields: [
        {type: 'text', name: 'code', label: 'Code', placeholder: 'c2', validators: {required: true, minLength: 2}},
        {type: 'text', name: 'name', label: 'Course name', placeholder: 'Calculus 2', validators: {required: true}},
        {type: 'textarea', name: 'description', label: 'Course description', placeholder: 'Calculus is a complex course...', validators: {required: false}},
      ]
    },
    {
      key: 'settings',
      title: 'Settings',
      description: 'Course settings',
      fields: [
        {type: 'color', name: 'primaryColor', label: 'Primary color', value: '#0000ff'},
        {
          type: 'select', name: 'faIcon', label: 'Icon', value: 'book', options: [
            {label: 'Book', value: 'book'}
          ]
        }
      ]
    }
  ];

  onSubmit(e: WizardSubmitEvent) {
    this.last = e;
    const course = new Course();
    Object.assign(course, e.value);

    this.courseService.createCourse(course).subscribe({
      next: (response) => {
        this.routeService.navigateTo(`courses`);
        console.log('Course created', response);
      }
    });
  }
}
