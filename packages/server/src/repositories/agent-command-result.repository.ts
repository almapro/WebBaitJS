import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {AgentCommandResult, AgentCommandResultRelations} from '../models';

export class AgentCommandResultRepository extends DefaultCrudRepository<
  AgentCommandResult,
  typeof AgentCommandResult.prototype.id,
  AgentCommandResultRelations
> {
  constructor(
    @inject('datasources.Db') dataSource: DbDataSource,
  ) {
    super(AgentCommandResult, dataSource);
  }
}
