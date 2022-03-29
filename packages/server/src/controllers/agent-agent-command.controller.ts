import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import {
  Filter,
  repository,
} from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
  param,
  post,
  requestBody,
} from '@loopback/rest';
import { v4 } from 'uuid';
import {
  Agent,
  AgentCommand,
} from '../models';
import { AgentRepository } from '../repositories';

@authenticate('jwt')
@authorize({ allowedRoles: ['admin'], voters: [] })
export class AgentAgentCommandController {
  constructor(
    @repository(AgentRepository) protected agentRepository: AgentRepository,
  ) { }

  @get('/agents/{id}/commands', {
    responses: {
      '200': {
        description: 'Array of Agent has many AgentCommand',
        content: {
          'application/json': {
            schema: { type: 'array', items: getModelSchemaRef(AgentCommand) },
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<AgentCommand>,
  ): Promise<AgentCommand[]> {
    return this.agentRepository.cmds(id).find(filter);
  }

  @post('/agents/{id}/commands', {
    responses: {
      '200': {
        description: 'Agent model instance',
        content: { 'application/json': { schema: getModelSchemaRef(AgentCommand) } },
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof Agent.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(AgentCommand, {
            title: 'NewAgentCommandInAgent',
            exclude: ['id', 'agentId', 'cmdId', 'receivedAt', 'received', 'cmdAt'],
          }),
        },
      },
    }) agentCommand: Omit<AgentCommand, 'id' | 'agentId' | 'cmdId' | 'receivedAt' | 'received' | 'cmdAt'>,
  ): Promise<AgentCommand> {
    const cmdId = v4();
    return this.agentRepository.cmds(id).create({ ...agentCommand, cmdId });
  }
}
