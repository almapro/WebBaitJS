import { Entity, model, property, hasOne } from '@loopback/repository';
import { AgentCommandResult } from './agent-command-result.model';

@model()
export class AgentCommand extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
  })
  cmd: string;

  @property({
    type: 'string',
    required: true,
  })
  cmdId: string;

  @property({
    type: 'date',
    defaultFn: 'now',
  })
  cmdAt?: string;

  @property({
    type: 'boolean',
    default: false,
  })
  received: boolean;

  @property({
    type: 'date',
  })
  receivedAt?: string;

  @hasOne(() => AgentCommandResult, { keyTo: 'cmdId' })
  result: AgentCommandResult;

  @property({
    type: 'number',
  })
  agentId?: number;

  constructor(data?: Partial<AgentCommand>) {
    super(data);
  }
}

export interface AgentCommandRelations {
  // describe navigational properties here
}

export type AgentCommandWithRelations = AgentCommand & AgentCommandRelations;
