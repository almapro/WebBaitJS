import { Entity, model, property } from '@loopback/repository';

@model()
export class AgentCommandResult extends Entity {
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
  result: string;

  @property({
    type: 'date',
    defaultFn: 'now',
  })
  executedAt: string;

  @property({
    type: 'number',
  })
  cmdId?: number;

  constructor(data?: Partial<AgentCommandResult>) {
    super(data);
  }
}

export interface AgentCommandResultRelations {
  // describe navigational properties here
}

export type AgentCommandResultWithRelations = AgentCommandResult & AgentCommandResultRelations;
