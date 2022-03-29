import { Entity, model, property } from '@loopback/repository';

@model()
export class AgentActivity extends Entity {
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
  ip: string;

  @property({
    type: 'string',
  })
  mac?: string;

  @property({
    type: 'string',
    required: true,
  })
  userAgent: string;

  @property({
    type: 'number',
  })
  agentId: number;

  @property({
    type: 'string',
  })
  type: string;

  @property({
    type: 'date',
    defaultFn: 'now',
  })
  activityDate: string;

  constructor(data?: Partial<AgentActivity>) {
    super(data);
  }
}

export interface AgentActivityRelations {
  // describe navigational properties here
}

export type AgentActivityWithRelations = AgentActivity & AgentActivityRelations;
