import {Entity} from './entity';
import {QuestionOption} from './question-option';
import {LessonSectionAnswer} from './lesson-section-answer';

export class LessonSection extends Entity {
  lessonId: number = 0;
  type: string = '';
  content: string = '';
  position: number = 0;
  moduleSlug: string | null = null;
  moduleConfig: any = null;
  questionPrompt: string | null = null;
  questionType: string | null = null;
  questionExplanation: string | null = null;
  questionOptions: QuestionOption[] = [];
  lessonSectionAnswer: LessonSectionAnswer | null = null;
  lessonSectionAnswers: LessonSectionAnswer[] = [];
  givenAnswer?: string | null;

  _submitting: boolean = false;
  _answerStatus: 'correct' | 'incorrect' | null = null;

  update() {
    this._submitting = false;
    this.givenAnswer = this.lessonSectionAnswer?.answer ?? null;

    if (this.questionType === 'multiple-choice') {
      // Do this for multiple choice questions, go over every answer and check if it's correct
      // Every answer needs to be correct to be considered correct
      for (const answer of this.lessonSectionAnswers) {
        if (answer.isCorrect) {
          this._answerStatus = 'correct';
        } else if (answer.isCorrect === false) {
          this._answerStatus = 'incorrect';
          break;
        } else {
          this._answerStatus = null;
          break;
        }
      }
    } else {
      switch (this.lessonSectionAnswer?.isCorrect) {
        case true:
          this._answerStatus = 'correct';
          break;
        case false:
          this._answerStatus = 'incorrect';
          break;
        default:
          this._answerStatus = null;
      }
    }
  }
}
