export const en = {
  changeMode: 'Switch between dark and light mode',
  changeLanguage: 'Change language to Arabic',
  showSidebar: 'Show navigation sidebar',
  titles: {
    login: 'Login',
    dashboard: 'Dashboard',
    users: 'Users',
    agents: 'Agents',
    agent: 'Agent',
    test_agent: 'Test Agent',
    back: 'Back',
    cancel: 'Cancel',
    close: 'Close',
    send_result: 'Send Result',
    acknowledge_command: 'Acknowledge Command',
    status: 'Status',
    connected: 'connected',
    disconnected: 'disconnected',
    charts: {
      agents_per_month: 'Agents per month',
      agents_by_country: 'Agents by country',
      agents_by_site: 'Agents by site',
    },
    init_webrtc_device: 'Initialize WebRTC Device',
    close_webrtc_device: 'Close WebRTC Device',
    command_webrtc_session: 'Command WebRTC Session',
    join_webrtc_session: 'Join WebRTC Session',
    leave_webrtc_session: 'Leave WebRTC Session',
    request_peer_devices: 'Request Peer Devices',
    peer_devices: 'Peer Devices',
    no_peer_devices: 'No devices detected',
    select_peer_device: 'Select peer device',
    agent_status: 'Agent Status',
    peer_webrtc_status: 'Peer WebRTC Status',
  },
  descriptions: {
    login: '',
    dashboard: 'Shows statistics',
    users: 'List of users',
    agents: 'List of agents',
    test_agent: 'Perform agent communication tests',
  },
  inputs: {
    username: 'Username',
    password: 'Password',
    role: 'Role',
    c2host: 'Agents C2 host',
    result: 'Result',
  },
  actions: {
    login: {
      errors: {
        title: 'Login failed',
        invalid: 'Invalid username or password',
        timeout: 'Request timed out',
      },
      success: {
        loggedIn: 'Logged in successfully',
      },
      login: 'Login',
    },
    logout: {
      errors: {
        title: 'Logout failed',
        invalid: 'Invalid attempt to logout. Maybe you are not logged in',
        timeout: 'Request timed out',
      },
      success: {
        loggedOut: 'Logged out successfully',
      },
      logout: 'Logout',
    },
    agents: {},
  },
  messages: {
    agents: {
      errors: {
        no_such_agent: 'NO SUCH AN AGENT',
      }
    }
  }
};
