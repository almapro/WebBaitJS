import { Paper } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useTitle } from "react-use";
import { AgentActivities, AgentCommandResults, AgentCommands, Agents } from "../models";
import { FETCH_AGENTS_ACTION, RootState, UPDATE_AGENT, UPDATE_AGENT_COMMAND } from "../redux";
import { connectAdminWebsocket, websocketService } from "../services";
import { DataGrid, GridColDef, GridEventListener, GridEvents, GridSortItem } from '@mui/x-data-grid';
import { useNavigate } from "react-router-dom";
import _ from "lodash";
import { AgentCmdReceived, AgentConnection } from "./agent.view";
import {
  Circle as CircleIcon,
} from "@mui/icons-material";
import moment from "moment";

export const AgentsView = () => {
  const { t } = useTranslation();
  useTitle(`WebBait - ${t('titles.agents')}`);
  const dispatch = useDispatch();
  const [agents, cmds, activities] = useSelector<RootState, [Agents[], AgentCommands[], AgentActivities[]]>(state => [state.agents, state.agent_commands, state.agent_activities], _.isEqual);
  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70, type: 'number' },
    { field: 'agentId', headerName: 'Agent ID', flex: 1 },
    { field: 'domain', headerName: 'Domain', flex: 1 },
    { field: 'url', headerName: 'URL', flex: 1 },
    { field: 'lastSeen', headerName: 'Last Seen', flex: 1, renderCell: ({ value }) => value ? moment(value).format('MMMM Do YYYY, h:mm:ss a') : '????' },
    { field: 'connected', headerName: 'Connected', flex: 1, renderCell: ({ value }) => <CircleIcon color={value ? 'success' : 'disabled'} /> },
  ];
  const [pageSize, setPageSize] = useState(15);
  useEffect(() => {
    dispatch(FETCH_AGENTS_ACTION({ include: [{ relation: 'activities', scope: { limit: 1, order: ['activityDate DESC'] } }] }));
    connectAdminWebsocket();
  }, [dispatch]);
  useEffect(() => {
    if (websocketService) {
      websocketService.on('agent connection', (agentConnection: AgentConnection) => {
        const foundAgent = _.find(agents, { agentId: agentConnection.agentId });
        if (foundAgent) dispatch(UPDATE_AGENT({ ...foundAgent, connected: agentConnection.connected }));
      });
      websocketService.on('cmd received', (cmdReceived: AgentCmdReceived) => {
        const cmd = _.find(cmds, { cmdId: cmdReceived.cmdId });
        if (cmd) {
          dispatch(UPDATE_AGENT_COMMAND({ ...cmd, received: true, receivedAt: cmdReceived.receivedAt }));
        }
      });
      websocketService.on('result', (result: AgentCommandResults) => {
        const cmd = _.find(cmds, { id: result.cmdId });
        if (cmd) {
          dispatch(UPDATE_AGENT_COMMAND({ ...cmd, result }));
        }
      });
    }
    return () => {
      websocketService && websocketService.off('agent connection');
      websocketService && websocketService.off('cmd received');
      websocketService && websocketService.off('result');
    }
  }, [agents, cmds, dispatch]);
  const agentsWithLastSeen = agents.map(agent => {
    const activity = _.find(activities, { agentId: agent.id });
    return { ...agent, lastSeen: activity ? activity.activityDate : undefined }
  });
  const navigate = useNavigate();
  const handleRowClick: GridEventListener<GridEvents.rowClick> = (row) => {
    navigate(`/agents/${row.row.agentId}`);
  }
  const [sortModel, setSortModel] = useState<GridSortItem[]>([{ field: 'lastSeen', sort: 'desc' }]);
  return (
    <Paper elevation={3} sx={{ p: 2, m: 2, height: '90vh' }}>
      <DataGrid
        rows={agentsWithLastSeen}
        columns={columns}
        sortModel={sortModel}
        onSortModelChange={setSortModel}
        checkboxSelection
        onRowClick={handleRowClick}
        onCellClick={(__, e) => { e.defaultMuiPrevented = true; }}
        rowsPerPageOptions={[5, 10, 15, 20, 25]}
        onPageSizeChange={setPageSize}
        pageSize={pageSize} />
    </Paper>
  );
}
