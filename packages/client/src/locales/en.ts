export const en = {
  changeMode: 'Switch between dark and light mode',
  changeLanguage: 'Change language to Arabic',
  showSidebar: 'Show navigation sidebar',
  titles: {
    login: 'Login',
    dashboard: 'Dashboard',
    users: 'Users',
    charts: {
      agents_per_month: 'Agents per month',
      agents_by_country: 'Agents by country',
      agents_by_site: 'Agents by site',
    }
  },
  descriptions: {
    login: '',
    dashboard: 'Shows statistics',
    users: 'List of users',
  },
  inputs: {
    username: 'Username',
    password: 'Password',
    role: 'Role',
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
  }
};
