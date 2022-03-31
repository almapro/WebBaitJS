import { Agents } from '../models';
import { ServiceBase } from './base.service';

export class AgentsService extends ServiceBase<Agents, number> {
  constructor() {
    super('/agents');
  }
}

export const agentsService = new AgentsService();
