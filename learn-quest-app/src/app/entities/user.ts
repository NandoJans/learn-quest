import {Entity} from './entity';

export class User extends Entity {
  username: string = '';
  roles: string[] = [];
}
