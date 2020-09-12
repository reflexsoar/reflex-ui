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
      {
        _name: 'CSidebarNavItem',
        name: 'Cases',
        to: '/cases',
        icon: 'cil-briefcase'
      },
      {
        _name: 'CSidebarNavItem',
        name: 'Events',
        to: '/alerts',
        icon: 'cil-bell'
      },
      {
        _name: 'CSidebarNavItem',
        name: 'Playbooks',
        to: '/playbooks',
        icon: 'cil-book'
      },
      {
        _name: 'CSidebarNavItem',
        name: 'Plugins',
        to: '/plugins',
        icon: 'cil-layers'
      },
      {
        _name: 'CSidebarNavItem',
        name: 'Inputs',
        to: '/inputs',
        icon: 'cil-input'
      },
      {
        _name: 'CSidebarNavItem',
        name: 'Reports',
        to: '/reports',
        icon: 'cil-chart'
      },
      {
        _name: 'CSidebarNavItem',
        name: 'Credentials',
        to: '/credentials',
        icon: 'cil-fingerprint'
      },
      {
        _name: 'CSidebarNavItem',
        name: 'Agents',
        to: '/agents',
        icon: 'cil-terminal'
      },
      {
        _name: 'CSidebarNavItem',
        name: 'Settings',
        to: '/settings',
        icon: 'cil-settings'
      }
      
    ]
  }
]