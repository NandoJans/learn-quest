import {Entity} from './entity';
import {LessonSection} from './lesson-section';
import {QuestionOption} from './question-option';

export class LessonSectionAnswer extends Entity {
  lessonSectionId: number = 0;
  questionOptionId: number | null = null;
  lessonSection?: LessonSection = undefined;
  questionOption?: QuestionOption = undefined;
  answer: string = '';
  initialCorrect: boolean | null = null;
  isCorrect: boolean | null = null;
}
