import Vue from 'vue'
import Router from 'vue-router'
import store from '../store'
import vSelect from 'vue-select'

// Containers
const TheContainer = () => import('@/containers/TheContainer')

// Views
const Dashboard = () => import('@/views/Dashboard')
const Organizations = () => import('@/views/Organizations')
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
const Integrations = () => import('@/views/integrations/Integrations')
const IntegrationsList = () => import('@/views/integrations/IntegrationsList')
const IntegrationDetails = () => import('@/views/integrations/IntegrationDetails')
const AssetManager = () => import('@/views/asset/AssetManager')
const AssetDetails = () => import('@/views/asset/AssetDetails')
const Cases = () => import('@/views/Cases')
const CaseManagement = () => import('@/views/CaseManagement')
const CaseDetails = () => import('@/views/CaseDetails')
const Lists = () => import('@/views/Lists')
const ListsList = () => import('@/views/ListsList')
const ListExplorer = () => import('@/views/ListExplorer')
const Settings = () => import('@/views/Settings')
const ObservableHistory = () => import('@/views/ObservableHistory')
const UserProfile = () => import('@/views/UserProfile')
const SearchWorkspace = () => import('@/views/searchworkspace/SearchWorkspace')
const DetectionManagement = () => import('@/views/DetectionManagement')
const DetectionDetails = () => import('@/views/DetectionDetails')
const MitreCoverage = () => import('@/views/detections/MitreCoverage')
const EventRuleManagement = () => import('@/views/EventRuleManagement')
const Organization = () => import('@/views/Organization')
const OrganizationSettings = () => import('@/views/OrganizationSettings')
const NotificationChannelsList = () => import('@/views/notify/NotificationChannelsList')
const InputManagement = () => import('@/views/InputManagement')
const DataSourceTemplates = () => import('@/views/data_sources/DataSourceTemplates')
const Schedule = () => import('@/views/schedule/Schedule')
const FimRules = () => import('@/views/fim/FimRules')
const Benchmarks = () => import('@/views/benchmark/Benchmarks')
const BenchmarkManagement = () => import('@/views/benchmark/BenchmarkManagement')
const BenchmarkRuleDetails = () => import('@/views/benchmark/BenchmarkRuleDetails')

// Views - Pages
const Page401 = () => import('@/views/pages/Page401')
const Page404 = () => import('@/views/pages/Page404')
const Page500 = () => import('@/views/pages/Page500')
const Login = () => import('@/views/Login')
const MFAPrompt = () => import('@/views/MFAPrompt')
const ForgotPassword = () => import('@/views/ForgotPassword')
const ResetPassword = () => import('@/views/ResetPassword')
const Register = () => import('@/views/pages/Register')

import Axios from 'axios'

Vue.use(Router)

Vue.component('v-select', vSelect)

let router = new Router({
  mode: 'hash', // https://router.vuejs.org/api/#mode
  linkActiveClass: '2',
  scrollBehavior: () => ({ y: 0 }),
  routes: configRoutes()
})

router.beforeEach((to, from, next) => {

  /* Check to see if the access_token and refresh_token cookies exist
  and if they are move them to local storage */
  if (localStorage.getItem('access_token') === null) {
    if (document.cookie.split(';').some((item) => item.trim().startsWith('access_token='))) {
      let access_token = document.cookie.replace(/(?:(?:^|.*;\s*)access_token\s*\=\s*([^;]*).*$)|^.*$/, "$1")
      let refresh_token = document.cookie.replace(/(?:(?:^|.*;\s*)refresh_token\s*\=\s*([^;]*).*$)|^.*$/, "$1")
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('refresh_token', refresh_token)
      Axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
      store.commit('auth_success', {access_token, refresh_token})
      // Null out the cookies
      document.cookie = "access_token =; Max-Age=0"
      document.cookie = "refresh_token =; Max-Age=0"
      store.dispatch('getMe');
    }
  }


  // Clear any alerts before moving on to the next page
  store.commit('clear_alert')

  // Before each request refresh the users permissions
  if(to.matched.some(record => record.path != '/forgot_password' && !record.path.startsWith('/reset_password') && record.path != '/login' && record.path != '/mfa' && record.path != '/')) {
    //store.dispatch('getMe').then(() => {
    if(to.matched.some(record => {
        let current_user = store.getters.current_user
        if(record.meta.requiresPermission && !current_user.permissions[record.meta.requiresPermission]) {
          next('/401')
        } else {
          next()
          return
        }
     })) {}
    //})  
  }
  
  // Fetch the settings before each route in the event that they have changed
  if(to.matched.some(record => record.meta.fetchSettings)) {
    store.dispatch('getSettings', {})
  }

  if(to.matched.some(record => record.meta.fetchOrganizations)) {
    if(store.getters.current_user.default_org) {
      store.dispatch('getOrganizations', {page_size: 1000})
    }    
  }

  if(to.matched.some(record => record.meta.requiresMFAChallenge)) {
    if (localStorage.getItem('mfa_challenge_token') === null) {
      next('/login')
      return
    } else {
      next()
    }
  }

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
      meta: {
        requiresAuth: true
      },
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: Dashboard,
          meta: {
            fetchSettings: true,
            requiresAuth: true
          }
        },
        {
          path: 'detections',
          name: 'Detections',
          component: DetectionManagement,
          meta: {
            requiresAuth: true,
            requiresPermission: 'update_detection'
          }
        },
        {
          path: 'detections/:uuid',
          name: 'Detection Details',
          component: DetectionDetails,
          meta: {
            requiresAuth: true,
            requiresPermission: 'view_detections'
          }
        },
        {
          path: '/mitre_coverage',
          name: 'MITRE Coverage',
          component: MitreCoverage,
          meta: {
            requiresAuth: true,
            requiresPermission: 'view_detections',
            fetchOrganizations: true
          }
        },
        {
          path: '/fim',
          name: 'File Integrity Monitoring',
          component: FimRules,
          meta: {
            requiresAuth: true,
            requiresPermission: 'view_fim_rules',
            fetchOrganizations: true
          }
        },
        {
          path: 'benchmarks',
          name: 'Asset Benchmarks',
          component: Benchmarks,
          redirect: 'benchmarks/manage',
          meta: {
            requiresAuth: true,
            requiresPermission: 'view_benchmarks',
            fetchOrganizations: true
          },
          children: [
            {
              path: 'manage',
              name: '',
              component: BenchmarkManagement,
              meta: {
                fetchSettings: true,
                requiresAuth: true,
                requiresPermission: 'view_benchmarks'
              }
            },
            {
              path: ':uuid',
              name: 'View Benchmark',
              component: BenchmarkRuleDetails,
              meta: {
                requiresAuth: true,
                requiresPermission: 'view_benchmarks'
              }
            }
          ]
        },
        
        {
          path: 'search',
          name: 'Search Workspace',
          component: SearchWorkspace,
          meta: {
            requiresAuth: true
          }
        },
        {
          path: 'observables',
          name: 'Observables',
          component: ObservableHistory,
          meta: {
            requiresAuth: true
          }
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
                fetchSettings: true,
                requiresAuth: true
              }
            },
            {
              path: ':uuid',
              name: 'View Case',
              component: CaseDetails,
              meta: {
                fetchSettings: true,
                requiresAuth: true
              }
            }
          ]
        },
        {
          path: 'data_source_templates',
          name: 'Data Source Templates',
          component: DataSourceTemplates,
          meta: {
            requiresAuth: true,
            fetchOrganizations: true
          }
        },
        {
          path: 'schedules',
          name: 'Schedule',
          component: Schedule,
          meta: {
            requiresAuth: true,
            fetchOrganizations: true
          }
        },
        {
          path: 'inputs',
          name: 'Inputs',
          component: Inputs,
          redirect: 'inputs/list',
          meta: {
            requiresAuth: true,
            fetchOrganizations: true
          },
          children: [
            {
              path: 'create',
              name: 'Create Input',
              component: CreateInput,
              meta: {
                fetchSettings: true,
                requiresAuth: true
              }
            },
            {
              path: 'list',
              name: '',
              component: InputManagement,
              meta: {
                fetchSettings: true,
                requiresAuth: true
              }
            },
            {
              path: ':uuid',
              name: 'View Input',
              component: InputDetails,
              meta: {
                fetchSettings: true,
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
            requiresAuth: true,
            fetchOrganizations: true
          },
          children: [
            {
              path: 'create',
              name: 'Create Credential',
              component: CreateCredential,
              meta: {
                requiresAuth: true,
                fetchSettings: true,
                requiresPermission: 'add_credential'
              }
            },
            {
              path: 'list',
              name: '',
              component: CredentialsList,
              meta: {
                requiresAuth: true,
                fetchSettings: true,
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
          path: 'notifications',
          name: 'Notifications',
          component: NotificationChannelsList,
          meta: {
            requiresAuth: true,
            requiresPermission: 'update_notification_channel'
          }
        },
        {
          path: 'alerts',
          name: 'Alerts',
          component: Alerts,
          redirect: 'alerts/list',
          meta: {
            requiresAuth: true,
            fetchOrganizations: true,
            requiresPermission: 'view_events'
          },
          children: [
            {
              path: 'list',
              name: '',
              component: AlertsList,
              meta: {
                fetchSettings: true,
                requiresAuth: true,
                requiresPermission: 'view_events'
              }
            },
            {
              path: ':uuid',
              name: 'View Alert',
              component: AlertDetails,
              meta: {
                fetchSettings: true,
                requiresAuth: true,
                requiresPermission: 'view_events'
              }
            }
          ]
        },
        {
          path:'event_rules',
          name:'Event Rules',
          component: EventRuleManagement,
          meta: {
            requiresAuth: true,
            //fetchOrganizations: true
          }
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
                fetchSettings: true,
                requiresAuth: true,
                requiresPermission: 'view_plugins'
              }
            },
            {
              path: ':uuid',
              name: 'View Plugin',
              component: PluginDetails,
              meta: {
                fetchSettings: true,
                requiresAuth: true,
                requiresPermission: 'view_plugins'
              }
            }
          ]
        },
        {
          path: 'assets',
          name: 'Assets',
          component: AssetManager,
          meta: {
            requiresAuth: true,
            //requiresPermission: 'view_assets'
          },
          children: [
            {
              path: ':uuid',
              name: 'View Asset',
              component: AssetDetails,
              meta: {
                requiresAuth: true,
                //requiresPermission: 'view_assets'
                fetchsettings: true
              }
            }
          ]
        },
        {
          path: 'integrations',
          name: 'Integrations',
          component: Integrations,
          redirect: 'integrations/list',
          meta: {
            requiresAuth: true,
            requiresPermission: 'view_integrations'
          },
          children: [
            {
              path: 'list',
              name: '',
              component: IntegrationsList,
              meta: {
                fetchSettings: true,
                requiresAuth: true,
                requiresPermission: 'view_integrations'
              }
            },
            {
              path: ':uuid',
              name: 'View Integration',
              component: IntegrationDetails,
              meta: {
                fetchSettings: true,
                requiresAuth: true,
                requiresPermission: 'view_integrations'
              }
            }
          ]
        },
        {
          path: 'agents',
          name: 'Agents & Agent Groups',
          component: Agents,
          redirect: 'agents/list',
          meta: {
            requiresAuth: true,
            requiresPermission: 'view_agents',
            fetchOrganizations: true
          },
          children: [
            {
              path: 'list',
              name: '',
              component: AgentManagement,
              meta: {
                fetchSettings: true,
                requiresAuth: true,
                requiresPermission: 'view_agents'
              }
            },
            {
              path: ':uuid',
              name: 'View Agent',
              component: AgentDetails,
              meta: {
                fetchSettings: true,
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
                fetchSettings: true,
                requiresAuth: true
              }
            },
            {
              path: 'list',
              name: '',
              component: PlaybooksList,
              meta: {
                fetchSettings: true,
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
            requiresAuth: true,
            fetchOrganizations: true
          },
          children: [
            {
              path: 'list',
              name: 'List Manager',
              component: ListsList,
              meta: {
                fetchSettings: true,
                requiresAuth: true
              }
            },
            {
              path: 'explore',
              name: 'List Explorer',
              component: ListExplorer,
              meta: {
                fetchSettings: true,
                requiresAuth: true
              }
            }
          ]
        },
        {
          path: 'my_profile',
          name: 'My Profile',
          component: UserProfile,
          meta: {
            requiresAuth: true
          }
        },
        {
          path: 'organization',
          name: 'Organization',
          component: Organization,
          redirect: '/settings',
          meta: {
            requiresAuth: true,
            requiresPermission: 'update_settings'
          },
          children: [
            {
              path: ':uuid',
              name: 'Organization Settings',
              component: OrganizationSettings,
              meta: {
                requiresAuth: true,
                requiresPermission: 'update_settings'
              }
            }
          ]
        },
        {
          path: 'settings',
          name: 'Settings',
          component: Settings,
          meta: {
            fetchSettings: true,
            requiresAuth: true,
            requiresPermission: 'update_settings'
          }
        },
        {
          path: '401',
          name: 'Page401',
          component: Page401
        },
        {
          path: '404',
          name: 'Page404',
          component: Page404
        }
      ]
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    { 
      path: '/mfa',
      name: 'MFA',
      component: MFAPrompt,
      meta: {
        requiresMFAChallenge: true
      }
    },
    {
      path: '/forgot_password',
      name: 'ForgotPassword',
      component: ForgotPassword
    },
    {
      path: '/reset_password/:token',
      name: 'ResetPassword',
      component: ResetPassword
    },
    {
      path: '/',
      name: 'Pages',
      component: {
        render (c) { return c('router-view') }
      },
      children: [
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

