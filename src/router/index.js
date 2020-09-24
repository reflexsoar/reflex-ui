import Vue from 'vue'
import Router from 'vue-router'
import store from '../store'
import vSelect from 'vue-select'

// Containers
const TheContainer = () => import('@/containers/TheContainer')

// Views
const Dashboard = () => import('@/views/Dashboard')
const Organizations = () => import('@/views/Organizations')
const OrganizationsList = () => import('@/views/OrganizationsList')
const OrganizationDetails = () => import('@/views/OrganizationDetails')
const CreateOrganization = () => import('@/views/CreateOrganization')
const Playbooks = () => import('@/views/Playbooks')
const PlaybooksList = () => import('@/views/PlaybooksList')
const PlaybookDetails = () => import('@/views/PlaybookDetails')
const CreatePlaybook = () => import('@/views/CreatePlaybook')
const InputDetails = () => import('@/views/InputDetails')
const InputsList = () => import('@/views/InputsList')
const Inputs = () => import ('@/views/Inputs')
const Alerts = () => import ('@/views/Alerts')
const AlertsList = () => import('@/views/AlertsList')
const Credentials = () => import('@/views/Credentials')
const CredentialsList = () => import('@/views/CredentialsList')
const CreateCredential = () => import('@/views/CreateCredential')
const AlertDetails = () => import('@/views/AlertDetails')
const CreateInput = () => import ('@/views/CreateInput')
const Agents = () => import('@/views/Agents')
const AgentManagement = () => import('@/views/AgentManagement')
const AgentsList = () => import('@/views/AgentsList')
const AgentDetails = () => import('@/views/AgentDetails')
const Plugins = () => import('@/views/Plugins')
const PluginList = () => import('@/views/PluginList')
const PluginDetails = () => import('@/views/PluginDetails')
const Cases = () => import('@/views/Cases')
const CaseManagement = () => import('@/views/CaseManagement')
const CaseDetails = () => import('@/views/CaseDetails')
const Lists = () => import('@/views/Lists')
const ListsList = () => import('@/views/ListsList')
const Settings = () => import('@/views/Settings')

// Views - Pages
const Page401 = () => import('@/views/pages/Page401')
const Page404 = () => import('@/views/pages/Page404')
const Page500 = () => import('@/views/pages/Page500')
const Login = () => import('@/views/Login')
const Register = () => import('@/views/pages/Register')

Vue.use(Router)

Vue.component('v-select', vSelect)

let router = new Router({
  mode: 'hash', // https://router.vuejs.org/api/#mode
  linkActiveClass: '2',
  scrollBehavior: () => ({ y: 0 }),
  routes: configRoutes()
})

router.beforeEach((to, from, next) => {

  // Clear any alerts before moving on to the next page
  store.commit('clear_alert')

  // Before each request refresh the users permissions
  store.dispatch('getMe').then(() => {
    if(to.matched.some(record => {
      let current_user = store.getters.current_user
      if(record.meta.requiresPermission && !current_user.permissions.includes(record.meta.requiresPermission)) {
        next('/401')
      } else {
        next()
        return
      }
    })) {}
  })  

  if(to.matched.some(record => record.meta.requiresAuth)) {
    if (store.getters.isLoggedIn) {
      next()
      return
    }
    next('/login')
  } else {
    next()
  }

})

export default router

function configRoutes () {
  return [
    {
      path: '/',
      meta: {
        requiresAuth: true
      },
      redirect: '/dashboard',
      name: 'Home',
      component: TheContainer,
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: Dashboard,
          meta: {
            requiresAuth: true
          }
        },
        {
          path: 'organizations',
          name: 'Organizations',
          component: Organizations,
          redirect: 'organizations/list',
          meta: {
            requiresAuth: true
          },
          children: [
            {
              path: 'create',
              name: 'Create Organization',
              component: CreateOrganization,
              meta: {
                requiresAuth: true
              }
            },
            {
              path: 'list',
              name: '',
              component: OrganizationsList,
              meta: {
                requiresAuth: true
              }
            },
            {
              path: ':uuid',
              name: 'View Organization',
              component: OrganizationDetails,
              meta: {
                requiresAuth: true
              }
            }
          ]
        },
        {
          path: 'cases',
          name: 'Cases',
          component: Cases,
          redirect: 'cases/list',
          meta: {
            requiresAuth: true
          },
          children: [
            {
              path: 'list',
              name: '',
              component: CaseManagement,
              meta: {
                requiresAuth: true
              }
            },
            {
              path: ':uuid',
              name: 'View Case',
              component: CaseDetails,
              meta: {
                requiresAuth: true
              }
            }
          ]
        },
        {
          path: 'inputs',
          name: 'Inputs',
          component: Inputs,
          redirect: 'inputs/list',
          meta: {
            requiresAuth: true
          },
          children: [
            {
              path: 'create',
              name: 'Create Input',
              component: CreateInput,
              meta: {
                requiresAuth: true
              }
            },
            {
              path: 'list',
              name: '',
              component: InputsList,
              meta: {
                requiresAuth: true
              }
            },
            {
              path: ':uuid',
              name: 'View Input',
              component: InputDetails,
              meta: {
                requiresAuth: true
              }
            }
          ]
        },
        {
          path: 'credentials',
          name: 'Credentials',
          component: Credentials,
          redirect: 'credentials/list',
          meta: {
            requiresAuth: true
          },
          children: [
            {
              path: 'create',
              name: 'Create Credential',
              component: CreateCredential,
              meta: {
                requiresAuth: true,
                requiresPermission: 'add_credential'
              }
            },
            {
              path: 'list',
              name: '',
              component: CredentialsList,
              meta: {
                requiresAuth: true,
                requiresPermission: 'view_credentials'
              }
            }/*,
            {
              path: ':uuid',
              name: 'View Credential',
              component: CredentialDetails,
              meta: {
                requiresAuth: true
              }
            }*/
          ]
        },
        {
          path: 'alerts',
          name: 'Alerts',
          component: Alerts,
          redirect: 'alerts/list',
          meta: {
            requiresAuth: true
          },
          children: [
            {
              path: 'list',
              name: '',
              component: AlertsList,
              meta: {
                requiresAuth: true
              }
            },
            {
              path: ':uuid',
              name: 'View Alert',
              component: AlertDetails,
              meta: {
                requiresAuth: true
              }
            }
          ]
        },
        {
          path: 'plugins',
          name: 'Plugin',
          component: Plugins,
          redirect: 'plugins/list',
          meta: {
            requiresAuth: true,
            requiresPermission: 'view_plugins'
          },
          children: [
            {
              path: 'list',
              name: '',
              component: PluginList,
              meta: {
                requiresAuth: true,
                requiresPermission: 'view_plugins'
              }
            },
            {
              path: ':uuid',
              name: 'View Plugin',
              component: PluginDetails,
              meta: {
                requiresAuth: true,
                requiresPermission: 'view_plugins'
              }
            }
          ]
        },
        {
          path: 'agents',
          name: 'Agents',
          component: Agents,
          redirect: 'agents/list',
          meta: {
            requiresAuth: true,
            requiresPermission: 'view_agents'
          },
          children: [
            {
              path: 'list',
              name: '',
              component: AgentManagement,
              meta: {
                requiresAuth: true,
                requiresPermission: 'view_agents'
              }
            },
            {
              path: ':uuid',
              name: 'View Agent',
              component: AgentDetails,
              meta: {
                requiresAuth: true
              }
            }
          ]
        },
        {
          path: 'playbooks',
          name: 'Playbooks',
          component: Playbooks,
          redirect: 'playbooks/list',
          meta: {
            requiresAuth: true
          },
          children: [
            {
              path: 'create',
              name: 'Create Playbook',
              component: CreatePlaybook,
              meta: {
                requiresAuth: true
              }
            },
            {
              path: 'list',
              name: '',
              component: PlaybooksList,
              meta: {
                requiresAuth: true
              }
            },
            {
              path: ':uuid',
              name: 'View Playbook',
              component: PlaybookDetails,
              meta: {
                requiresAuth: true
              }
            }
          ]
        },
        {
          path: 'lists',
          name: 'Intel Lists',
          component: Lists,
          redirect: 'lists/list',
          meta: {
            requiresAuth: true
          },
          children: [
            {
              path: 'list',
              name: 'View Lists',
              component: ListsList,
              meta: {
                requiresAuth: true
              }
            }
          ]
        },
        {
          path: 'settings',
          name: 'Settings',
          component: Settings,
          meta: {
            requiresAuth: true,
            requiresPermission: 'update_settings'
          }
        },
        {
          path: '401',
          name: 'Page401',
          component: Page401
        }
      ]
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/',
      name: 'Pages',
      component: {
        render (c) { return c('router-view') }
      },
      children: [
        
        {
          path: '404',
          name: 'Page404',
          component: Page404
        },
        {
          path: '500',
          name: 'Page500',
          component: Page500
        },
        
        {
          path: 'register',
          name: 'Register',
          component: Register
        }
      ]
    }
  ]
}

