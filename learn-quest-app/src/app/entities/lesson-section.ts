import {Entity} from './entity';

export interface QuestionOption {
  id?: number;
  optionText: string;
  position: number;
}

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
  givenAnswer?: string | null; // persisted answer for current registration (if any)

  // UI-only state fields (not persisted on backend)
  _submitting: boolean = false;
  _answerStatus: 'correct' | 'incorrect' | null = null;
}
