export type AgentActivities = {
  id: number;
  ip: string;
  mac?: string;
  userAgent: string;
  type: string;
  activityDate: Date;
  agentId: number;
}
