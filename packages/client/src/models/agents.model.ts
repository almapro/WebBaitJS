import { AgentActivities } from "./agent-activities.model";

export type Agents = {
  id: number;
  agentId: string;
  domain: string;
  url: string;
  connected: boolean;
  lastSeen?: Date;
  activities?: AgentActivities[];
}
