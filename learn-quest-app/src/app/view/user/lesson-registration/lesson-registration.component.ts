import {Component, Input, OnInit} from '@angular/core';
import {LessonRegistrationService} from '../../../services/entity/lesson-registration.service';
import {LessonRegistration} from '../../../entities/lesson-registration';
import {Lesson} from '../../../entities/lesson';
import {LessonSection} from '../../../entities/lesson-section';
import { LessonSectionService } from '../../../services/entity/lesson-section.service';
import { QuestionOptionService } from '../../../services/entity/question-option.service';
import {NgForOf, NgIf} from '@angular/common';
import {ModuleHostComponent} from '../../../components/module-host/module-host.component';

@Component({
  selector: 'app-lesson-registration',
  imports: [
    NgForOf,
    NgIf,
    ModuleHostComponent
  ],
  templateUrl: './lesson-registration.component.html',
  styleUrl: './lesson-registration.component.css'
})
export class LessonRegistrationComponent implements OnInit {
  @Input() lessonRegistrationId: number = 0;
  lessonRegistration: LessonRegistration = new LessonRegistration();
  lessonSections: LessonSection[] = [];
  constructor(
    private lessonRegistrationService: LessonRegistrationService,
    private lessonSectionService: LessonSectionService,
    private questionOptionService: QuestionOptionService
  ) { }

  ngOnInit() {
    this.lessonRegistrationService.loadSections({id: this.lessonRegistrationId}, (registrations) => {
      if (registrations.length > 0) {
        this.lessonRegistration = registrations[0] as LessonRegistration;

        this.lessonSectionService.loadSections({lesson: this.lessonRegistration.lesson.id}, (sections) => {
          this.lessonSections = (sections as LessonSection[]).sort(this.sortByPosition.bind(this));
          
          // Fetch question options separately for each question section
          this.lessonSections.forEach(section => {
            if (section.type === 'question' && section.id) {
              this.questionOptionService.fetchQuestionOptions(section.id).subscribe(options => {
                section.questionOptions = options;
              });
            }
          });
        });
      }
    });
  }

  private sortByPosition(a: LessonSection, b: LessonSection): number {
    return (a.position ?? 0) - (b.position ?? 0);
  }

  getLesson(): Lesson {
    return this.lessonRegistration.lesson;
  }

  onWidgetConfigChange(section: LessonSection, $event: any) {

  }
}
