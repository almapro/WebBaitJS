import { ServiceBase } from './base.service';

export class StatisticssService extends ServiceBase<{}, number> {
  constructor() {
    super('/statistics');
  }
  getAgentsPerMonth = () => {
    return this.client.get('/agents-per-month');
  }
  getAgentsByCountry = () => {
    return this.client.get('/agents-by-country');
  }
  getAgentsBySite = () => {
    return this.client.get('/agents-by-site');
  }
}

export const statisticsService = new StatisticssService();
