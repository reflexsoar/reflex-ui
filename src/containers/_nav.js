export default [
  {
    _name: 'CSidebarNav',
    _children: [
      {
        _name: 'CSidebarNavItem',
        name: 'Dashboard',
        to: '/dashboard',
        icon: 'cil-speedometer'
      },
      /*{
        _name: 'CSidebarNavItem',
        name: 'Hunting',
        to: '/hunter',
        icon: 'cil-magnifying-glass'
      },*/
      {
        _name: 'CSidebarNavItem',
        name: 'Cases',
        to: '/cases',
        icon: 'cil-briefcase',
        permission: 'view_cases'
      },
      { _name: 'CSidebarNavDropdown',
        name: 'Events',
        icon: 'cil-bell',
        items: [
          {
            _name: 'CSidebarNavItem',
            name: 'Queue',
            to: '/alerts/list',
            permission: 'view_events'
          },     
          /*{
            _name: 'CSidebarNavItem',
            name: 'Observables',
            to: '/observables'
          },*/
          {
            _name: 'CSidebarNavItem',
            name: 'Event Rules',
            to: '/event_rules',
            permission: 'view_events'
          }
        ]
      },
      /*{ _name: 'CSidebarNavDropdown',
        name: 'Detection',
        icon: 'cil-shield-alt',
        items: [
          {
            _name: 'CSidebarNavItem',
            name: 'Detection Rules',
            to: '/detections'
          }
        ]
      },*/
      {
        _name: 'CSidebarNavDropdown',
        name: 'Automation',
        icon: 'cil-3d',
        items: [
          /*{
            _name: 'CSidebarNavItem',
            name: 'Playbooks',
            to: '/playbooks'
          },
          {
            _name: 'CSidebarNavItem',
            name: 'Plugins',
            to: '/plugins'
          },*/
          {
            _name: 'CSidebarNavItem',
            name: 'Intel Lists',
            to: '/lists',
            permission: 'view_lists'
          }
        ]
      },
      /*{
        _name: 'CSidebarNavItem',
        name: 'Reports',
        to: '/reports',
        icon: 'cil-chart'
      },*/
      {
        _name: 'CSidebarNavDropdown',
        name: 'System',
        icon: 'cil-settings',
        items: [
          {
            _name: 'CSidebarNavItem',
            name: 'Settings',
            to: '/settings',
            permission: 'update_settings'
          },
          {
            _name: 'CSidebarNavItem',
            name: 'Agents',
            to: '/agents',
            permission: 'view_agents'
          },
          {
            _name: 'CSidebarNavItem',
            name: 'Credentials',
            to: '/credentials',
            permission: 'view_credentials'
          },
          {
            _name: 'CSidebarNavItem',
            name: 'Inputs',
            to: '/inputs',
            permission: 'view_inputs'
          }
        ]
      }
      
      
    ]
  }
]