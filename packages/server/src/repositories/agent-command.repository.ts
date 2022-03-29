import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasOneRepositoryFactory} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {AgentCommand, AgentCommandRelations, AgentCommandResult} from '../models';
import {AgentCommandResultRepository} from './agent-command-result.repository';

export class AgentCommandRepository extends DefaultCrudRepository<
  AgentCommand,
  typeof AgentCommand.prototype.id,
  AgentCommandRelations
> {

  public readonly result: HasOneRepositoryFactory<AgentCommandResult, typeof AgentCommand.prototype.id>;

  constructor(
    @inject('datasources.Db') dataSource: DbDataSource, @repository.getter('AgentCommandResultRepository') protected agentCommandResultRepositoryGetter: Getter<AgentCommandResultRepository>,
  ) {
    super(AgentCommand, dataSource);
    this.result = this.createHasOneRepositoryFactoryFor('result', agentCommandResultRepositoryGetter);
    this.registerInclusionResolver('result', this.result.inclusionResolver);
  }
}
