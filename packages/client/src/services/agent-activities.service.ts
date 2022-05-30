import { AgentActivities } from '../models';
import { ServiceBase } from './base.service';

export class AgentActivitiesService extends ServiceBase<AgentActivities, number> {
  constructor() {
    super('/agents/{id}/activities');
  }
}

export const agentActivitiesService = new AgentActivitiesService();
