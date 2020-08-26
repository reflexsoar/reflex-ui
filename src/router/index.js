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
const Settings = () => import('@/views/Settings')

// Views - Pages
const Page404 = () => import('@/views/pages/Page404')
const Page500 = () => import('@/views/pages/Page500')
const Login = () => import('@/views/Login')
const Register = () => import('@/views/pages/Register')

Vue.use(Router)

Vue.component('v-select', vSelect)

let router = new Router({
  mode: 'hash', // https://router.vuejs.org/api/#mode
  linkActiveClass: 'active',
  scrollBehavior: () => ({ y: 0 }),
  routes: configRoutes()
})

router.beforeEach((to, from, next) => {
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
                requiresAuth: true
              }
            },
            {
              path: 'list',
              name: '',
              component: CredentialsList,
              meta: {
                requiresAuth: true
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
          path: 'settings',
          name: 'Settings',
          component: Settings,
          meta: {
            requiresAuth: true
          }
        }
      ]
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/pages',
      redirect: '/pages/404',
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

