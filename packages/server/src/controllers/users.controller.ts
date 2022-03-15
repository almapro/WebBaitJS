import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import { checkSelfOrHigherPrivilegeAction } from '../authorizers';
import { User } from '../models';
import { UserRepository } from '../repositories';

@authenticate('jwt')
export class UsersController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) { }

  @authorize({ allowedRoles: ['admin'] })
  @post('/users')
  @response(200, {
    description: 'User model instance',
    content: { 'application/json': { schema: getModelSchemaRef(User) } },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {
            title: 'NewUser',
            exclude: ['id', 'role'],
          }),
        },
      },
    })
    user: Omit<User, 'id' | 'role'>,
  ): Promise<Omit<User, 'password'>> {
    return this.userRepository.create(user);
  }

  @authorize({ allowedRoles: ['admin'] })
  @get('/users/count')
  @response(200, {
    description: 'User model count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async count(
    @param.where(User) where?: Where<User>,
  ): Promise<Count> {
    return this.userRepository.count(where);
  }

  @authorize({ allowedRoles: ['admin'] })
  @get('/users')
  @response(200, {
    description: 'Array of User model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(User, { includeRelations: true, exclude: ['password'] }),
        },
      },
    },
  })
  async find(
    @param.filter(User) filter?: Filter<Omit<User, 'password'>>,
  ): Promise<Omit<User, 'password'>[]> {
    return this.userRepository.find(filter);
  }

  @authorize({ allowedRoles: ['admin'] })
  @patch('/users')
  @response(200, {
    description: 'User PATCH success count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, { partial: true, exclude: ['id'] }),
        },
      },
    })
    user: Omit<User, 'id'>,
    @param.where(User) where?: Where<User>,
  ): Promise<Count> {
    return this.userRepository.updateAll(user, where);
  }

  @authorize({ allowedRoles: ['admin', 'user'], voters: [checkSelfOrHigherPrivilegeAction] })
  @get('/users/{id}')
  @response(200, {
    description: 'User model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(User, { includeRelations: true, exclude: ['password'] }),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(User, { exclude: 'where' }) filter?: FilterExcludingWhere<User>
  ): Promise<Omit<User, 'password'>> {
    return this.userRepository.findById(id, filter);
  }

  @authorize({ allowedRoles: ['admin', 'user'], voters: [checkSelfOrHigherPrivilegeAction] })
  @patch('/users/{id}')
  @response(204, {
    description: 'User PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, { partial: true, exclude: ['id'] }),
        },
      },
    })
    user: Omit<User, 'id'>,
  ): Promise<void> {
    await this.userRepository.updateById(id, user);
  }

  @authorize({ allowedRoles: ['admin'] })
  @del('/users/{id}')
  @response(204, {
    description: 'User DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.userRepository.deleteById(id);
  }
}
