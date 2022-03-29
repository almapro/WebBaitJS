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
import { AgentCommandResult } from './agents-websocket.controller';

export type AgentCommand = {
  agentId: string;
  cmd: string;
}

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
      const userProfile = await this.jwtService.verifyToken(token);
      const foundAdmin = await this.userRepository.findOne({ where: { username: userProfile.username } });
      if (foundAdmin) {
        const agents = await this.agentRepository.find();
        agents.forEach(agent => {
          socket.join(agent.agentId);
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
      this.socket.to(cmd.agentId).emit('cmd', { cmd: cmd.cmd, cmdId });
    }
  }

  /**
   * Register a handler for 'result' events
   * @param result
   */
  @ws.subscribe('result')
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
        await this.agentCommandRepository.result(cmd.id).create(cmdResult);
        this.socket.emit('result', { result: result.result, cmdId });
      }
    }
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
