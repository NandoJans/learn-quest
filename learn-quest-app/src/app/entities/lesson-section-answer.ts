import {Entity} from './entity';

export class LessonSectionAnswer extends Entity {
  userId: number = 0;
  lessonSectionId: number = 0;
  answer: string = '';
  isCorrect: boolean = false;
  createdAt: string = '';
}
