import { Entity, model, property, hasMany } from '@loopback/repository';
import { AgentActivity } from './agent-activity.model';
import { AgentWebSocketToken } from './agent-web-socket-token.model';
import {AgentCommand} from './agent-command.model';

@model()
export class Agent extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    defaultFn: 'uuidv4',
  })
  agentId: string;

  @property({
    type: 'string',
    required: true,
  })
  domain: string;

  @property({
    type: 'string',
    required: true,
  })
  url: string;

  @hasMany(() => AgentActivity)
  activities: AgentActivity[];

  @hasMany(() => AgentWebSocketToken)
  tokens: AgentWebSocketToken[];

  @hasMany(() => AgentCommand)
  cmds: AgentCommand[];

  constructor(data?: Partial<Agent>) {
    super(data);
  }
}

export interface AgentRelations {
  // describe navigational properties here
}

export type AgentWithRelations = Agent & AgentRelations;
