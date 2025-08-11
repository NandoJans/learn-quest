import {Entity} from './entity';
import {AppRole} from '../types/role';

export class User extends Entity {
  username: string = '';
  roles: AppRole[] = [];
}
