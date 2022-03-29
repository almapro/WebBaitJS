import { repository } from '@loopback/repository';
import _ from 'lodash';
import { Socket } from 'socket.io';
import { ws } from '../decorators';
import { AgentActivity } from '../models';
import { AgentRepository } from '../repositories';

export type AgentCommandResult = {
  agentId: string;
  cmdId: string;
  result: string;
  executedAt?: string;
}

@ws('/agents/ws')
export class AgentsWebSocketController {
  constructor(
    @ws.socket()
    private socket: Socket,
    @repository(AgentRepository)
    private agentRepository: AgentRepository,
  ) { }

  /**
   * The method is invoked when a client connects to the server
   * @param socket
   */
  @ws.connect()
  connect(socket: Socket) {
    console.log('Client connected: %s', this.socket.id);
    const agentId = socket.handshake.auth.agentId;
    const userAgent = socket.handshake.headers['user-agent'] as string;
    const mac = socket.handshake.auth.mac;
    const token = socket.handshake.auth.token;
    console.log('agentId: %s, token: %s', agentId, token);
    if (agentId && token) {
      this.agentRepository.findOne({ where: { agentId }, include: [{ relation: 'tokens' }] }).then(agent => {
        if (agent) {
          agent.tokens.forEach(t => {
            if (t.expiresAt <= new Date().toISOString()) {
              agent.tokens = _.without(agent.tokens, t);
            }
          });
          const foundToken = _.find(agent.tokens, { token });
          if (foundToken) {
            this.agentRepository.tokens(agent.id).patch({ used: true, usedAt: foundToken.usedAt ? foundToken.usedAt : new Date().toISOString() }, { token });
            const activity: Partial<AgentActivity> = {
              agentId: +`${agent.id}`,
              ip: socket.handshake.address,
              userAgent,
              type: 'websocket-connect',
            };
            if (mac) activity.mac = mac;
            this.agentRepository.activities(agent.id).create(activity);
            socket.join(agentId);
            socket.emit('connected', agentId);
          } else {
            socket.emit('error', `Invalid token: ${token}`);
            socket.disconnect();
          }
        } else {
          socket.emit('error', `Invalid agent id: ${agentId}`);
          socket.disconnect();
        }
      });
    } else {
      socket.emit('error', `Missing agent id or token: {agentId: ${agentId}, token: ${token}}`);
      socket.disconnect();
    }
  }

  /**
   * Register a handler for 'result' events
   * @param result
   */
  @ws.subscribe('result')
  handleResult(result: AgentCommandResult) {
    console.log('result: %s', result);
    this.socket.to(result.agentId).emit('result', result);
  }

  /**
   * The method is invoked when a client disconnects from the server
   * @param socket
   */
  @ws.disconnect()
  disconnect() {
    console.log('Client disconnected: %s', this.socket.id);
  }
}
