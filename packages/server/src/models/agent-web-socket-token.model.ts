import { Entity, model, property } from '@loopback/repository';

@model()
export class AgentWebSocketToken extends Entity {
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
  token: string;

  @property({
    type: 'date',
    defaultFn: 'now',
  })
  generatedAt: string;

  @property({
    type: 'date',
    required: true,
  })
  expiresAt: string;

  @property({
    type: 'date',
  })
  usedAt?: string;

  @property({
    type: 'boolean',
    default: false,
  })
  used: boolean;

  @property({
    type: 'number',
  })
  agentId: number;

  constructor(data?: Partial<AgentWebSocketToken>) {
    super(data);
  }
}

export interface AgentWebSocketTokenRelations {
  // describe navigational properties here
}

export type AgentWebSocketTokenWithRelations = AgentWebSocketToken & AgentWebSocketTokenRelations;
