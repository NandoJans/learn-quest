import {JwtPayload} from 'jwt-decode';

export interface UserJwtPayload extends JwtPayload {
  id: number;
  username: string;
  roles: string[];
}
