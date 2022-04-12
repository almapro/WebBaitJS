import { inject } from '@loopback/core';
import { repository } from '@loopback/repository';
import _ from 'lodash';
import { Socket } from 'socket.io';
import { ws } from '../decorators';
import { AgentCommandRepository, AgentRepository, UserRepository } from '../repositories';
import { AgentCommandResult as AgentCommandResultModel } from '../models';
import {
  TokenServiceBindings,
} from '@loopback/authentication-jwt';
import { JwtService } from '../services';
import { v4 } from 'uuid';
import { AgentCmdReceived, AgentCommandResult } from './agents-websocket.controller';
import { HttpErrors } from '@loopback/rest';
import { Subject } from 'rxjs';

export type AgentCommand = {
  agentId: string;
  cmd: string;
  cmdId?: string;
}

export type AgentConnection = {
  agentId: string;
  connected: boolean;
}

let agentsConnected: string[] = [];

@ws('/admins')
export class AdminsWebSocketController {
  constructor(
    @ws.socket()
    private socket: Socket,
    @repository(AgentRepository)
    private agentRepository: AgentRepository,
    @repository(AgentCommandRepository)
    private agentCommandRepository: AgentCommandRepository,
    @repository(UserRepository)
    private userRepository: UserRepository,
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    private jwtService: JwtService,
    @inject('rxjs.agent-connection')
    private agentConnection: Subject<AgentConnection>,
    @inject('rxjs.agent-commands')
    private agentCommands: Subject<AgentCommand & { cmdId: string }>,
    @inject('rxjs.agent-command-received')
    private agentCommandReceived: Subject<AgentCmdReceived>,
    @inject('rxjs.agent-command-results')
    private agentCommandResults: Subject<AgentCommandResult>,
  ) { }

  /**
   * The method is invoked when a client connects to the server
   * @param socket
   */
  @ws.connect()
  async connect(socket: Socket) {
    console.log('admin connected: %s', this.socket.id);
    const token = socket.handshake.auth.token;
    console.log('token: %s', token);
    if (token) {
      const userProfile = await this.jwtService.verifyToken(token).catch((err: HttpErrors.HttpError) => {
        if (err.status === 401) {
          socket.emit('error', `Invalid token: ${token}`);
          socket.disconnect();
        }
        return null;
      });
      if (!!!userProfile) return;
      const foundAdmin = await this.userRepository.findOne({ where: { username: userProfile.username } });
      if (foundAdmin) {
        this.agentConnection.subscribe({
          next: this.handleAgentConnection.bind(this),
        })
        this.agentCommandResults.subscribe({
          next: this.handleResult.bind(this),
        });
        this.agentCommandReceived.subscribe({
          next: this.handleCmdReceived.bind(this),
        });
        agentsConnected.forEach(agentId => {
          this.socket.emit('agent connection', { agentId, connected: true });
        });
      } else {
        socket.emit('error', `Invalid token: ${token}`);
        socket.disconnect();
      }
    } else {
      socket.emit('error', `Invalid token: ${token}`);
      socket.disconnect();
    }
  }

  /**
   * Register a handler for 'cmd' events
   * @param cmd
   */
  @ws.subscribe('cmd')
  async handleCommand(cmd: AgentCommand) {
    console.log('cmd: %s', cmd);
    const agent = await this.agentRepository.findOne({ where: { agentId: cmd.agentId } });
    if (agent) {
      const cmdId = v4();
      await this.agentRepository.cmds(+`${agent.id}`).create({ cmd: cmd.cmd, cmdId, cmdAt: new Date().toISOString() });
      this.agentCommands.next({ ...cmd, cmdId })
    }
  }

  async handleCmdReceived(cmdReceived: AgentCmdReceived) {
    console.log('cmd received: %s', cmdReceived);
    const cmdReceivedAt = cmdReceived.receivedAt ? cmdReceived.receivedAt : new Date();
    const foundCmd = await this.agentCommandRepository.findOne({
      where: {
        cmdId: cmdReceived.cmdId,
      },
    });
    if (foundCmd) {
      await this.agentCommandRepository.updateById(foundCmd.id, {
        receivedAt: cmdReceivedAt.toISOString(),
        received: true,
      });
      this.socket.emit('cmd received', { cmdId: foundCmd.cmdId, receivedAt: cmdReceivedAt.toISOString() });
    }
  }

  async handleResult(result: AgentCommandResult) {
    console.log('result: %s', result);
    const { cmdId, agentId } = result;
    const agent = await this.agentRepository.findOne({ where: { agentId } });
    if (agent) {
      const cmd = await this.agentCommandRepository.findOne({ where: { cmdId } });
      if (cmd) {
        const cmdResult: Partial<AgentCommandResultModel> = {
          result: result.result,
        };
        if (result.executedAt) cmdResult.executedAt = result.executedAt;
        await this.agentCommandRepository.updateById(cmd.id, { received: true, receivedAt: cmd.receivedAt ? cmd.receivedAt : new Date().toISOString() });
        const finalResult = await this.agentCommandRepository.result(cmd.id).create(cmdResult);
        this.socket.emit('result', finalResult);
      }
    }
  }

  async handleAgentConnection(agentConnection: AgentConnection) {
    console.log('agent connection: %s', agentConnection);
    if (agentConnection.connected) agentsConnected.push(agentConnection.agentId);
    else agentsConnected = agentsConnected.filter(agentId => agentId !== agentConnection.agentId);
    this.socket.emit('agent connection', agentConnection);
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
