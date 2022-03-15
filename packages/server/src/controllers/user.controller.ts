import { inject } from '@loopback/core';
import {
  TokenServiceBindings,
  UserServiceBindings,
} from '@loopback/authentication-jwt';
import { authenticate } from '@loopback/authentication';
import { SecurityBindings } from '@loopback/security';
import { repository } from '@loopback/repository';
import { genSalt, hash } from 'bcryptjs';
import _ from 'lodash';
import { get, getModelSchemaRef, post, requestBody } from '@loopback/rest';
import { Credentials, JwtService, UserAuthenticationService, UserProfile } from '../services';
import { User } from '../models';
import { UserRepository } from '../repositories';
import { authorize } from '@loopback/authorization';

@authenticate('jwt')
@authorize({})
export class UserController {
  constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: JwtService,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: UserAuthenticationService,
    @inject(SecurityBindings.USER, { optional: true })
    public user: UserProfile,
    @repository(UserRepository) protected userRepository: UserRepository,
  ) { }

  @authenticate.skip()
  @authorize.skip()
  @post('/login', {
    responses: {
      '200': {
        description: 'Token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  })
  async login(
    @requestBody({
      description: 'The input of login function',
      required: true,
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {
            title: 'NewUser',
            exclude: ['id', 'role'],
          }),
        },
      },
    }) credentials: Credentials,
  ): Promise<{ token: string }> {
    // ensure the user exists, and the password is correct
    const user = await this.userService.verifyCredentials(credentials);
    // convert a User object into a UserProfile object (reduced set of properties)
    const userProfile = this.userService.convertToUserProfile(user);
    // create a JSON Web Token based on the user profile
    const token = await this.jwtService.generateToken(userProfile);
    return { token };
  }

  @get('/me', {
    responses: {
      '200': {
        description: 'Return current user',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                username: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  })
  async me(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
  ): Promise<{ username: string }> {
    return { username: currentUserProfile.username };
  }

  @authenticate.skip()
  @post('/signup', {
    responses: {
      '200': {
        description: 'User',
        content: {
          'application/json': {
            schema: getModelSchemaRef(User, {
              exclude: ['id', 'password', 'role'],
            }),
          },
        },
      },
    },
  })
  async signUp(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {
            title: 'New User',
            exclude: ['id'],
            optional: ['role'],
          }),
        },
      },
    })
    newUser: User,
  ): Promise<Omit<User, 'password' | 'role'>> {
    const password = await hash(newUser.password, await genSalt());
    const savedUser = await this.userRepository.create({ username: newUser.username, password, role: newUser.role });
    return savedUser;
  }
}
