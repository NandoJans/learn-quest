import {Entity} from './entity';

export class QuestionOption extends Entity {
  lessonSectionId: number = 0;
  optionText: string = '';
  position: number = 0;
}
