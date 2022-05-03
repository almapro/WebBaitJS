import { inject } from '@loopback/core';
import { repository } from '@loopback/repository';
import _ from 'lodash';
import { Subject } from 'rxjs';
import { Socket } from 'socket.io';
import { ws } from '../decorators';
import { MediasoupBindings, MediasoupJWT } from '../mediasoup';
import { AgentActivity } from '../models';
import { AgentCommandRepository, AgentRepository, AgentWebSocketTokenRepository } from '../repositories';
import { AgentCommand, AgentConnection } from './admins-websocket.controller';

export type AgentCmdReceived = {
  cmdId: string;
  receivedAt?: Date;
  data?: any;
}

export type AgentCommandResult = {
  agentId: string;
  cmdId: string;
  result: string;
  executedAt?: string;
  data?: any;
}

@ws('/agents/ws')
export class AgentsWebSocketController {
  constructor(
    @ws.socket()
    private socket: Socket,
    @repository(AgentRepository)
    private agentRepository: AgentRepository,
    @repository(AgentCommandRepository)
    private agentCommandRepository: AgentCommandRepository,
    @repository(AgentWebSocketTokenRepository)
    private agentWebSocketTokenRepository: AgentWebSocketTokenRepository,
    @inject('rxjs.agent-connection')
    private agentConnection: Subject<AgentConnection>,
    @inject('rxjs.agent-commands')
    private agentCommands: Subject<AgentCommand & { cmdId: string }>,
    @inject('rxjs.agent-command-received')
    private agentCommandReceived: Subject<AgentCmdReceived>,
    @inject('rxjs.agent-command-results')
    private agentCommandResults: Subject<AgentCommandResult>,
    @inject(MediasoupBindings.jwt)
    private mediasoupJwt: MediasoupJWT,
  ) { }

  /**
   * The method is invoked when a client connects to the server
   * @param socket
   */
  @ws.connect()
  async connect(socket: Socket) {
    console.log('Client connected: %s', this.socket.id);
    const userAgent = socket.handshake.headers['user-agent'] as string;
    const mac = socket.handshake.auth.mac;
    const token = socket.handshake.auth.token;
    console.log('token: %s', token);
    if (token) {
      const foundToken = await this.agentWebSocketTokenRepository.findOne({
        where: {
          token,
        },
      });
      if (foundToken && new Date(foundToken.expiresAt) > new Date()) {
        const foundAgent = await this.agentRepository.findOne({
          where: {
            id: foundToken.agentId,
          },
        });
        if (foundAgent) {
          this.agentConnection.next({
            agentId: foundAgent.agentId,
            connected: true
          });
          await this.agentRepository.tokens(foundAgent.id).patch({ used: true, usedAt: foundToken.usedAt ? foundToken.usedAt : new Date().toISOString() }, { token });
          const activity: Partial<AgentActivity> = {
            agentId: +`${foundAgent.id}`,
            ip: socket.handshake.address,
            userAgent,
            type: 'websocket-connect',
          };
          if (mac) activity.mac = mac;
          await this.agentRepository.activities(foundAgent.id).create(activity);
          const cmds = await this.agentRepository.cmds(foundAgent.id).find({ include: [{ relation: 'result' }] });
          cmds.forEach(async cmd => {
            if (!cmd.received || !cmd.result) {
              const token = await this.mediasoupJwt.generateToken({ roomId: foundAgent.agentId, peerId: foundAgent.agentId, admin: false });
              socket.emit('cmd', {
                cmdId: cmd.cmdId,
                cmd: cmd.cmd,
                data: { token: cmd.cmd === 'init-webrtc-device' ? token : undefined, },
              });
            }
          });
          this.agentCommands.subscribe({
            next: (cmd: AgentCommand & { cmdId: string }) => {
              socket.emit('cmd', cmd);
            },
          });
        }
      } else {
        socket.emit('error', `Invalid token`);
        socket.disconnect();
      }
    } else {
      socket.emit('error', `Missing token: ${token}`);
      socket.disconnect();
    }
  }

  /**
   * Register a handler for 'cmd received' events
   * @param cmd received
   */
  @ws.subscribe('cmd received')
  async handleCmdReceived(cmdReceived: AgentCmdReceived) {
    console.log('cmd received: %s', cmdReceived);
    this.agentCommandReceived.next(cmdReceived);
  }

  /**
   * Register a handler for 'result' events
   * @param result
   */
  @ws.subscribe('result')
  async handleResult(result: AgentCommandResult) {
    console.log('result: %s', result);
    this.agentCommandResults.next(result);
    const cmd = await this.agentCommandRepository.findOne({ where: { cmdId: result.cmdId } });
    if (cmd) {
      switch (cmd.cmd) {
        case 'init-webrtc-device':
          this.socket.emit(`result-ack:${result.cmdId}`);
          break;
      }
    }
  }

  /**
   * The method is invoked when a client disconnects from the server
   * @param socket
   */
  @ws.disconnect()
  async disconnect() {
    console.log('Client disconnected: %s', this.socket.id);
    const foundToken = await this.agentWebSocketTokenRepository.findOne({
      where: {
        token: this.socket.handshake.auth.token,
      },
    });
    if (foundToken && new Date(foundToken.expiresAt) > new Date()) {
      const foundAgent = await this.agentRepository.findOne({
        where: {
          id: foundToken.agentId,
        },
      });
      if (foundAgent) {
        this.agentConnection.next({
          agentId: foundAgent.agentId,
          connected: false
        });
      }
    }
  }
}
