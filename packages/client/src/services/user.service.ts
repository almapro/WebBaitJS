import { User } from '../models';
import { ServiceBase } from './base.service';

export class UserService extends ServiceBase<User, number> {
  constructor() {
    super('/user');
  }
  login = (user: { username: string, password: string }) => {
    return this.client.post('/login', user);
  }
  logout = () => {
    return this.client.post('/logout');
  }
  checkLogged = () => {
    return this.client.get('/me');
  }
}

export const userService = new UserService();
