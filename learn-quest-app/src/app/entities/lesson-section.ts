import {Entity} from './entity';

export class LessonSection extends Entity {
  lessonId: number = 0;
  type: string = '';
  content: string = '';
  position: number = 0;
}
