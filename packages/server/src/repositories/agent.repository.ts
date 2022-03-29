import { inject, Getter } from '@loopback/core';
import { DefaultCrudRepository, repository, HasManyRepositoryFactory } from '@loopback/repository';
import { DbDataSource } from '../datasources';
import { Agent, AgentRelations, AgentActivity, AgentWebSocketToken, AgentCommand} from '../models';
import { AgentActivityRepository } from './agent-activity.repository';
import { AgentWebSocketTokenRepository } from './agent-web-socket-token.repository';
import { AgentCommandRepository } from './agent-command.repository';

export class AgentRepository extends DefaultCrudRepository<
  Agent,
  typeof Agent.prototype.id,
  AgentRelations
> {

  public readonly activities: HasManyRepositoryFactory<AgentActivity, typeof Agent.prototype.id>;

  public readonly tokens: HasManyRepositoryFactory<AgentWebSocketToken, typeof Agent.prototype.id>;

  public readonly cmds: HasManyRepositoryFactory<AgentCommand, typeof Agent.prototype.id>;

  constructor(
    @inject('datasources.Db') dataSource: DbDataSource, @repository.getter('AgentActivityRepository') protected agentActivityRepositoryGetter: Getter<AgentActivityRepository>, @repository.getter('AgentWebSocketTokenRepository') protected agentWebSocketTokenRepositoryGetter: Getter<AgentWebSocketTokenRepository>, @repository.getter('AgentCommandRepository') protected agentCommandRepositoryGetter: Getter<AgentCommandRepository>,
  ) {
    super(Agent, dataSource);
    this.cmds = this.createHasManyRepositoryFactoryFor('cmds', agentCommandRepositoryGetter,);
    this.registerInclusionResolver('cmds', this.cmds.inclusionResolver);
    this.tokens = this.createHasManyRepositoryFactoryFor('tokens', agentWebSocketTokenRepositoryGetter,);
    this.registerInclusionResolver('tokens', this.tokens.inclusionResolver);
    this.activities = this.createHasManyRepositoryFactoryFor('activities', agentActivityRepositoryGetter,);
    this.registerInclusionResolver('activities', this.activities.inclusionResolver);
  }
}
