import { Users } from '../models';
import { ServiceBase } from './base.service';

export class UsersService extends ServiceBase<Users, number> {
  constructor() {
    super('/users');
  }
}

export const usersService = new UsersService();
