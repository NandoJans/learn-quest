import {Entity} from './entity';
import {QuestionOption} from './question-option';

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
  correctAnswer: string | null = null;
  questionOptions: QuestionOption[] = [];
  givenAnswer?: string | null;

  _submitting: boolean = false;
  _answerStatus: 'correct' | 'incorrect' | null = null;
}
