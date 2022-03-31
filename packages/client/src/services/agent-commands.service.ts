import { AgentCommands } from '../models';
import { ServiceBase } from './base.service';

export class AgentCommandsService extends ServiceBase<AgentCommands, number> {
  constructor() {
    super('/agents/{id}/commands');
  }
}

export const agentCommandsService = new AgentCommandsService();
