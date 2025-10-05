import {Component, Input, OnInit} from '@angular/core';
import {LessonRegistrationService} from '../../../services/entity/lesson-registration.service';
import {LessonRegistration} from '../../../entities/lesson-registration';
import {Lesson} from '../../../entities/lesson';
import {LessonSection} from '../../../entities/lesson-section';
import { LessonSectionService } from '../../../services/entity/lesson-section.service';
import { QuestionOptionService } from '../../../services/entity/question-option.service';
import {NgForOf, NgIf} from '@angular/common';
import {ModuleHostComponent} from '../../../components/module-host/module-host.component';
import { RoleService } from '../../../services/security/role.service';
import { CourseService } from '../../../services/entity/course.service';
import { Course } from '../../../entities/course';
import { CourseEditBarComponent } from '../../../components/course/course-edit-bar/course-edit-bar.component';
import { IconComponent } from '../../../components/icon/icon.component';

@Component({
  selector: 'app-lesson-registration',
  imports: [
    NgForOf,
    NgIf,
    ModuleHostComponent,
    CourseEditBarComponent,
    IconComponent
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
    private questionOptionService: QuestionOptionService,
    private roleService: RoleService,
    private courseService: CourseService
  ) { }

  ngOnInit() {
    this.lessonRegistrationService.loadSections({id: this.lessonRegistrationId}, (registrations) => {
      if (registrations.length > 0) {
        this.lessonRegistration = registrations[0] as LessonRegistration;

        // Preload the parent course so edit bar can work immediately
        try {
          const courseId = this.lessonRegistration?.lesson?.courseId;
          if (courseId) this.courseService.loadCourses({ id: courseId });
        } catch (_e) {}

        // Load sections via dedicated endpoint, including any saved answers for this registration
        this.lessonSectionService.fetchSectionsWithAnswers(this.lessonRegistration.lesson.id, this.lessonRegistrationId)
          .subscribe((sections) => {
            this.lessonSections = (sections as LessonSection[]).sort(this.sortByPosition.bind(this));
            // Apply any previously saved answers to the UI controls
            this.lessonSections.forEach((section) => {
              this.applyGivenAnswerToDom(section);
            });
          });
      }
    });
  }

  isTeacher(): boolean {
    return this.roleService.activeRole === 'ROLE_TEACHER';
  }

  getCourse(): Course {
    try {
      const lesson: Lesson | undefined = this.lessonRegistration?.lesson as Lesson;
      const id = lesson?.courseId;
      if (!id) return new Course();
      const arr = this.courseService.getCourses({ id });
      return arr.length > 0 ? arr[0] : new Course();
    } catch (_e) {
      return new Course();
    }
  }

  private sortByPosition(a: LessonSection, b: LessonSection): number {
    return (a.position ?? 0) - (b.position ?? 0);
  }

  getLesson(): Lesson {
    return this.lessonRegistration.lesson;
  }

  onWidgetConfigChange(section: LessonSection, $event: any) {

  }

  getButtonType(section: LessonSection): string {
    switch (section._answerStatus) {
      case 'correct':
        return 'btn-2';
      case 'incorrect':
        return 'btn-1';
      default:
        return 'btn-3';
    }
  }

  private getSectionAnswer(section: LessonSection): any {
    const type = section.questionType;
    const secId = (section as any).id ?? (section as any).lessonSectionId ?? section['id'];
    if (!type) return null;

    if (type === 'text' || type === 'number') {
      const el = document.getElementById('question-input-' + secId) as HTMLInputElement | null;
      if (!el) return null;
      return type === 'number' ? (el.value !== '' ? Number(el.value) : null) : el.value;
    }

    if (type === 'radio') {
      const selected = document.querySelector(`input[name="question-${secId}"]:checked`) as HTMLInputElement | null;
      return selected ? selected.value : null;
    }

    if (type === 'checkbox') {
      const nodes = document.querySelectorAll(`input[id^="question-${secId}-"]:checked`) as NodeListOf<HTMLInputElement>;
      const values: string[] = [];
      nodes.forEach(n => values.push(n.value));
      return values;
    }

    return null;
  }

  submitAnswer(section: LessonSection) {
    const anySection: any = section as any;
    const answer = this.getSectionAnswer(section);

    if (answer === null || (Array.isArray(answer) && answer.length === 0)) {
      anySection._answerStatus = null;
      return;
    }
    anySection._submitting = true;
    anySection._answerStatus = null;

    const sectionId = (section as any).id ?? section['id'];
    this.lessonSectionService.checkAnswer(sectionId, answer, this.lessonRegistrationId).subscribe({
      next: (res: { correct: boolean }) => {
        anySection._answerStatus = res.correct ? 'correct' : 'incorrect';
        // Update local givenAnswer so a reload-less UI reflects persistence
        try {
          (section as any).givenAnswer = Array.isArray(answer) ? JSON.stringify(answer) : String(answer);
        } catch (_e) {
          (section as any).givenAnswer = String(answer);
        }
      },
      error: (_err) => {
        anySection._answerStatus = 'incorrect';
      },
      complete: () => {
        anySection._submitting = false;
      }
    });
  }

  private applyGivenAnswerToDom(section: LessonSection) {
    console.log('applyGivenAnswerToDom', section);
    if (!section || section.givenAnswer === undefined || section.givenAnswer === null) return;
    const secId = (section as any).id ?? (section as any).lessonSectionId ?? section['id'];
    const type = section.questionType;
    const raw = section.givenAnswer as any;

    if (type === 'text' || type === 'number') {
      const el = document.getElementById('question-input-' + secId) as HTMLInputElement | null;
      if (el) {
        el.value = String(raw);
      }
      return;
    }

    if (type === 'radio') {
      const idx = String(raw);
      const input = document.getElementById(`question-${secId}-${idx}`) as HTMLInputElement | null;
      if (input) input.checked = true;
      return;
    }

    if (type === 'checkbox') {
      let arr: any[] = [];
      try {
        const parsed = JSON.parse(String(raw));
        if (Array.isArray(parsed)) arr = parsed;
      } catch (_e) {
        // ignore
      }
      arr.forEach((idx) => {
        const input = document.getElementById(`question-${secId}-${idx}`) as HTMLInputElement | null;
        if (input) input.checked = true;
      });
      return;
    }
  }

  getSubmitButtonText(section: LessonSection) {
    if (section._submitting) {
      return 'Submitting...';
    }
    if (section._answerStatus === 'correct') {
      return 'Correct!';
    }
    if (section._answerStatus === 'incorrect') {
      return 'Incorrect!';
    }
    return 'Submit';
  }
}
