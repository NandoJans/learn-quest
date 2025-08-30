import {Component, Input, OnInit} from '@angular/core';
import {WizardFormComponent} from '../../../../components/form/wizard-form/wizard-form.component';
import {RouteService} from '../../../../services/core/route.service';
import {WizardStepConfig} from '../../../../interfaces/wizard/wizard-step-config';
import {WizardSubmitEvent} from '../../../../interfaces/wizard/wizard-submit-event';
import {Course} from '../../../../entities/course';
import {LessonService} from '../../../../services/entity/lesson.service';
import {Lesson} from '../../../../entities/lesson';
import {CourseService} from '../../../../services/entity/course.service';

@Component({
  selector: 'app-create-lesson',
  imports: [
    WizardFormComponent
  ],
  templateUrl: './create-lesson.component.html',
  styleUrl: './create-lesson.component.css'
})
export class CreateLessonComponent implements OnInit {
  last: any;
  @Input() courseId: number = 0;
  course: Course | null = null;

  constructor(
    private lessonService: LessonService,
    private courseService: CourseService,
    private routeService: RouteService
  ) {

  }

  ngOnInit() {
    if (!this.course) {
      if (this.courseId < 1) {
        throw new Error('courseId input is required');
      }

      this.courseService.loadCourses({id: this.courseId});
    }
  }

  steps: WizardStepConfig[] = [
    {
      key: 'lesson',
      title: 'Lesson',
      description: 'Details about the lesson',
      fields: [
        {type: 'text', name: 'code', label: 'Code', placeholder: 'c2', validators: {required: true, minLength: 2}},
        {type: 'text', name: 'name', label: 'Lesson name', placeholder: 'Learning the basics', validators: {required: true}},
        {type: 'textarea', name: 'description', label: 'Lesson description', placeholder: 'In this lesson you will learn...', validators: {required: false}},
      ]
    },
    {
      key: 'settings',
      title: 'Settings',
      description: 'Lesson settings',
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
    const lesson = new Lesson();
    Object.assign(lesson, e.value);

    this.course = this.courseService.getCourses({id: this.courseId})[0] || null;

    if (!this.course) {
      throw new Error('Course is not set');
    }

    this.lessonService.createLesson(lesson, this.course).subscribe({
      next: (response) => {
        console.log(response);
        // this.routeService.navigateTo(`lesson//create`);
      }
    });
  }
}
