import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {AgentActivity, AgentActivityRelations} from '../models';

export class AgentActivityRepository extends DefaultCrudRepository<
  AgentActivity,
  typeof AgentActivity.prototype.id,
  AgentActivityRelations
> {
  constructor(
    @inject('datasources.Db') dataSource: DbDataSource,
  ) {
    super(AgentActivity, dataSource);
  }
}
