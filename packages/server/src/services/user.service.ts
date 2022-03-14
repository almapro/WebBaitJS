import { UserService } from '@loopback/authentication';
import { securityId } from '@loopback/security';
import { injectable, inject, BindingScope, BindingKey } from '@loopback/core';
import { User } from '../models';
import { PasswordHasherBindings, PasswordHasherService } from './password-hasher.service';
import { HttpErrors } from '@loopback/rest';
import { UserRepository } from '../repositories';
import { repository } from '@loopback/repository';

export namespace AdminAuthenticationBindings {
  export const SERVICE = BindingKey.create<UserAuthenticationService>('services.UserAuthenticationService');
}

export type Credentials = {
  username: string;
  password: string;
};

export type UserProfile = { username: string, [securityId]: string };

@injectable({ scope: BindingScope.TRANSIENT })
export class UserAuthenticationService implements UserService<User, Credentials> {
  constructor(
    @repository(UserRepository) public userRepository: UserRepository,
    @inject(PasswordHasherBindings.SERVICE) public passwordHasherService: PasswordHasherService,
  ) { }
  async verifyCredentials(credentials: Credentials): Promise<User> {
    const foundUser = await this.userRepository.findOne({ where: { username: credentials.username } });
    if (foundUser) {
      const passwordMatched = await this.passwordHasherService.verify(credentials.password, foundUser.password);
      if (passwordMatched) {
        return foundUser;
      }
    }
    throw new HttpErrors.Unauthorized('Incorrect username or password');
  }
  convertToUserProfile(user: User): UserProfile {
    return { username: user.username, [securityId]: user.id ?? '' };
  }
}
