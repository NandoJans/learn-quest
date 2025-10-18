import {Entity} from './entity';
import {Lesson} from './lesson';

export class LessonRegistration extends Entity {
  lessonId: number = 0;
  userId: number = 0;
  currentLessonSectionId: number | null = null;
  completed: boolean = false;
  lesson: Lesson = new Lesson();
}
