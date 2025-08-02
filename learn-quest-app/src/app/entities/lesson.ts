import {Entity} from './entity';

export class Lesson extends Entity {
  courseId: number = 0;
  code: string = '';
  name: string = '';
  description: string = '';
  primaryColor: string = '';
  faIcon: string = '';
}
