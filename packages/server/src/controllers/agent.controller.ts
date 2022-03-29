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
  param,
  get,
  getModelSchemaRef,
  response,
} from '@loopback/rest';
import { Agent } from '../models';
import { AgentRepository } from '../repositories';

@authenticate('jwt')
@authorize({ allowedRoles: ['admin'] })
export class AgentController {
  constructor(
    @repository(AgentRepository)
    public agentRepository: AgentRepository,
  ) { }

  @get('/agents/count')
  @response(200, {
    description: 'Agent model count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async count(
    @param.where(Agent) where?: Where<Agent>,
  ): Promise<Count> {
    return this.agentRepository.count(where);
  }

  @get('/agents')
  @response(200, {
    description: 'Array of Agent model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Agent, { includeRelations: true }),
        },
      },
    },
  })
  async find(
    @param.filter(Agent) filter?: Filter<Agent>,
  ): Promise<Agent[]> {
    return this.agentRepository.find(filter);
  }

  @get('/agents/{id}')
  @response(200, {
    description: 'Agent model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Agent, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Agent, { exclude: 'where' }) filter?: FilterExcludingWhere<Agent>
  ): Promise<Agent> {
    return this.agentRepository.findById(id, filter);
  }
}
