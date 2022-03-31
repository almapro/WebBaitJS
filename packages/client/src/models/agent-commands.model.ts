import { AgentCommandResults } from "./agent-command-results.model";

export type AgentCommands = {
  id: number;
  cmd: string;
  cmdId: string;
  cmdAt: Date;
  received: boolean;
  receivedAt?: Date;
  agentId: number;
  result?: AgentCommandResults;
}
