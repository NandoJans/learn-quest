import {JwtPayload} from 'jwt-decode';
import {AppRole} from '../types/role';

export interface UserJwtPayload extends JwtPayload {
  id: number;
  username: string;
  roles: AppRole[];
}
