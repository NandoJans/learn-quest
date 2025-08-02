import {Entity} from './entity';

export class Course extends Entity {
  code: string = '';
  name: string = '';
  description: string = '';
  primaryColor: string = '';
  faIcon: string = '';
}
