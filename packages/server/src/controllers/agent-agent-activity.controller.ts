import { inject } from '@loopback/core';
import {
  Filter,
  repository,
} from '@loopback/repository';
import {
  getModelSchemaRef,
  HttpErrors,
  post,
  Request,
  requestBody,
  RestBindings,
  get,
  param,
} from '@loopback/rest';
import {
  Agent,
  AgentActivity,
} from '../models';
import { v4 } from "uuid";
import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import { AgentRepository } from '../repositories';

export class AgentAgentActivityController {
  constructor(
    @repository(AgentRepository) protected agentRepository: AgentRepository,
    @inject(RestBindings.Http.REQUEST) protected request: Request
  ) { }

  @post('/agents', {
    responses: {
      '200': {
        description: 'Agent ID & token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                agentId: {
                  type: 'string',
                },
                token: {
                  type: 'string',
                },
              }
            }
          }
        },
      },
    },
  })
  async createAgent(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Agent, {
            title: 'NewAgent',
            exclude: ['id', 'agentId'],
          }),
        },
      },
    }) agent: Omit<Agent, 'id' | 'agentId'>,
  ): Promise<{ agentId: string, token: string }> {
    const agentId = v4();
    const token = v4();
    const newAgent = await this.agentRepository.create({ ...agent, agentId });
    await this.agentRepository.activities(newAgent.id).create({ ip: this.request.ip, userAgent: this.request.headers['user-agent'], type: 'register-agent' });
    await this.agentRepository.tokens(newAgent.id).create({ token, expiresAt: new Date(new Date().getTime() + (1000 * 60 * 60 * 24)).toISOString() });
    return { agentId, token }
  }

  @post('/agents/activity', {
    responses: {
      '200': {
        description: 'WS token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                }
              }
            }
          }
        },
      },
    },
  })
  async createActivity(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(AgentActivity, {
            title: 'NewAgentActivityInAgent',
            exclude: ['id', 'ip', 'agentId', 'type', 'activityDate', 'userAgent'],
          }),
        },
      },
    }) agentActivity: Omit<AgentActivity, 'id' | 'ip' | 'agentId' | 'type' | 'activityDate' | 'userAgent'>,
  ): Promise<{ token: string }> {
    const agentIdHeader = this.request.headers['x-agent-id'];
    if (!agentIdHeader) {
      throw new HttpErrors.BadRequest('x-agent-id header is missing');
    }
    const agentId = agentIdHeader ? agentIdHeader.toString() : '';
    const foundAgent = await this.agentRepository.findOne({ where: { agentId } });
    if (!foundAgent) {
      throw new HttpErrors.Unauthorized('Agent not found');
    }
    await this.agentRepository.activities(foundAgent.id).create({ ...agentActivity, ip: this.request.ip, userAgent: this.request.headers['user-agent'], type: 'request-token' });
    const foundUnexpiredTokens = await this.agentRepository.tokens(foundAgent.id).find({ where: { expiresAt: { gt: new Date().toISOString() } } });
    if (foundUnexpiredTokens.length > 0) {
      return { token: foundUnexpiredTokens[0].token };
    }
    const token = v4();
    await this.agentRepository.tokens(foundAgent.id).create({ token, expiresAt: new Date(new Date().getTime() + (1000 * 60 * 60 * 24)).toISOString() });
    return { token };
  }

  @authenticate('jwt')
  @authorize({ allowedRoles: ['admin'], voters: [] })
  @get('/agents/{id}/activities', {
    responses: {
      '200': {
        description: 'Array of Agent has many AgentActivity',
        content: {
          'application/json': {
            schema: { type: 'array', items: getModelSchemaRef(AgentActivity, { includeRelations: true }) },
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<AgentActivity>,
  ): Promise<AgentActivity[]> {
    return this.agentRepository.activities(id).find(filter);
  }
}
