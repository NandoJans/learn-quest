import { Component } from '@angular/core';
import {MathBasicComponent} from '../../../components/interactive/math-basic/math-basic.component';
import {MathBasicConfig} from '../../../interfaces/interactive/math-basic-config';
import {Op} from '../../../types/op';

@Component({
  selector: 'app-course-registration',
  imports: [
    MathBasicComponent
  ],
  templateUrl: './course-registration.component.html',
  styleUrl: './course-registration.component.css'
})
export class CourseRegistrationComponent {
  mathBasicConfig: MathBasicConfig = {
    operations: ['+'],
    max: 10,
    min: 1,
    allowNegatives: false,
    requiredQuestions: 10,
    integerDivisionOnly: false,
    autoStart: true,
  };

  onCompleted($event: { total: number; correct: number; accuracy: number }) {
    console.log('Completed:', $event);
  }
}
