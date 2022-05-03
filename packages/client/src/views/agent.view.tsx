import { Button, ButtonGroup, ClickAwayListener, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Grow, IconButton, MenuItem, MenuList, Paper, Popper, Stack, Table, TableBody, TableCell, TableContainer, TableRow, Tooltip, Typography, useTheme } from '@mui/material';
import _ from 'lodash';
import React, { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowDropDown as ArrowDropDownIcon,
  Check as CheckIcon,
  Clear as ClearIcon,
  ArrowBack as ArrowBackIcon,
  Launch as LaunchIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useTitle } from 'react-use';
import { AgentCommandResults, AgentCommands, Agents } from '../models';
import { FETCH_AGENTS_ACTION, FETCH_AGENT_COMMANDS_ACTION, RootState, UPDATE_AGENT, UPDATE_AGENT_COMMAND } from '../redux';
import { connectAdminWebsocket, websocketService } from '../services';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import moment from "moment";

export type AgentConnection = {
  agentId: string;
  connected: boolean;
}

export type AgentCmdReceived = {
  cmdId: string;
  receivedAt: Date;
}

export type ActionsButtonOption = {
  label: string;
  action: () => void;
}

export const ActionsButton: FC<{ options: ActionsButtonOption[] }> = ({ options }) => {
  if (options.length === 0) return null;
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const handleClick = () => {
    options[selectedIndex].action();
  };
  const handleMenuItemClick = (
    __: any,
    index: number,
  ) => {
    setSelectedIndex(index);
    setOpen(false);
  };
  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };
  const handleClose = (event: Event) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }
    setOpen(false);
  };
  return (
    <>
      <ButtonGroup variant="contained" ref={anchorRef} aria-label="split button">
        <Button onClick={handleClick}>{options[selectedIndex].label}</Button>
        <Button
          size="small"
          aria-controls={open ? 'split-button-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-label="select merge strategy"
          aria-haspopup="menu"
          onClick={handleToggle}
        >
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper sx={{ zIndex: 99 }} >
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="split-button-menu" autoFocusItem>
                  {options.map((option, index) => (
                    <MenuItem
                      key={option.label}
                      selected={index === selectedIndex}
                      onClick={(event) => handleMenuItemClick(event, index)}
                    >
                      {option.label}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
}

export const AgentView = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [agent, agents, fetching, cmds] = useSelector<RootState, [Agents | undefined, Agents[], boolean, AgentCommands[]]>(state => {
    const foundAgent = _.find(state.agents, { agentId });
    const foundCmds = foundAgent ? state.agent_commands.filter(cmd => cmd.agentId === foundAgent.id) : [];
    return [foundAgent, state.agents, state.app.fetching, foundCmds];
  }, _.isEqual);
  const [shownResult, setShownResult] = useState<AgentCommandResults | null>(null);
  useEffect(() => {
    dispatch(FETCH_AGENTS_ACTION());
    connectAdminWebsocket();
  }, []);
  useEffect(() => {
    agent && dispatch(FETCH_AGENT_COMMANDS_ACTION({ include: ['result'] }, { id: agent.id }));
  }, [agent]);
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
          dispatch(UPDATE_AGENT_COMMAND({ ...cmd, received: true, receivedAt: cmd.receivedAt ? cmd.receivedAt : result.executedAt, result }));
        }
      });
    }
    return () => {
      websocketService && websocketService.off('agent connection');
      websocketService && websocketService.off('cmd received');
      websocketService && websocketService.off('result');
    }
  }, [cmds]);
  useTitle(`WebBait - ${t('titles.agent')} ${agent && agent.id}`);
  const actionOptions: ActionsButtonOption[] = [
    {
      label: 'Test command',
      action: () => {
        if (websocketService) {
          websocketService.emit('cmd', {
            cmd: 'test',
            agentId,
          });
          agent && dispatch(FETCH_AGENT_COMMANDS_ACTION({ include: ['result'] }, { id: agent.id }));
        }
      },
    },
  ];
  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 50 },
    { field: "cmdId", headerName: "Command ID", flex: 1 },
    { field: "cmd", headerName: "Command", flex: 1 },
    { field: "cmdAt", headerName: "Command At", width: 225, renderCell: ({ value }) => moment(value).format('MMMM Do YYYY, h:mm:ss a'), type: 'date' },
    {
      field: "received", headerName: "Received", width: 100, renderCell: ({ value, id }) => {
        const found = _.find(cmds, { id: +id });
        return value ? <Tooltip title={found && found.receivedAt ? moment(found.receivedAt).format('MMMM Do YYYY, h:mm:ss a') : ''}><CheckIcon /></Tooltip> : <ClearIcon />
      }, disableColumnMenu: true
    },
    { field: "result", headerName: "Result", width: 100, renderCell: ({ value }) => (<>{value ? <IconButton color='primary' onClick={() => setShownResult(value)}><LaunchIcon /></IconButton> : <ClearIcon />}</>), hideSortIcons: true, disableColumnMenu: true },
  ];
  const [pageSize, setPageSize] = useState(15);
  return (
    <Paper elevation={3} sx={{ p: 2, m: 2, height: '90vh' }}>
      <Grid container spacing={2} direction='column' sx={{ height: '100%' }}>
        {!!!agent && !fetching && t('messages.agents.errors.no_such_agent')}
        {agent && <>
          <Grid item sx={{ zIndex: 99 }}>
            <Stack spacing={2} direction='row' justifyContent='space-between'>
              <Button color='inherit' startIcon={<ArrowBackIcon />} onClick={() => navigate('/agents')}>{t('titles.back')}</Button>
              <Typography>
                {t('titles.status')}: <Typography component='b' color={agent.connected ? theme.palette.success.main : theme.palette.grey[500]}>
                  {agent.connected ? t('titles.connected') : t('titles.disconnected')}
                </Typography>
              </Typography>
              <ActionsButton options={actionOptions} />
            </Stack>
          </Grid>
          <Grid item sx={{ flexGrow: 1 }}>
            <DataGrid
              columns={columns}
              rows={cmds.map(cmd => _.omit(cmd, ['receivedAt', 'agentId']))}
              checkboxSelection
              onCellClick={(__, e) => { e.defaultMuiPrevented = true; }}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
              rowsPerPageOptions={[5, 10, 15, 20, 25]} />
          </Grid>
        </>}
      </Grid>
      <Dialog open={!!shownResult} maxWidth='md' fullWidth>
        <DialogTitle>Result: {shownResult && shownResult.cmdId}</DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell width='20%' sx={{ borderBottom: 'none' }}>Result</TableCell>
                  <TableCell width='80%'>{shownResult && shownResult.result}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell width='20%' sx={{ borderBottom: 'none' }}>Executed At</TableCell>
                  <TableCell width='80%'>{shownResult && moment(shownResult.executedAt).format('MMMM Do YYYY, h:mm:ss a')}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShownResult(null)} color='inherit' startIcon={<ClearIcon />}>{t('titles.close')}</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}