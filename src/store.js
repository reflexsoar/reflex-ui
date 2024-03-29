import Vue from 'vue'
import Vuex from 'vuex'
import Axios from 'axios'
import createPersistedState from "vuex-persistedstate";
Vue.use(Vuex)

const state = {
  eventDrawerShow: 'responsive',
  eventDrawerMinimize: true,
  sidebarShow: 'responsive',
  sidebarMinimize: false,
  status: '',
  access_token: localStorage.getItem('access_token') || '',
  refresh_token: localStorage.getItem('refresh_token') || '',
  current_user: {
    'permissions': [],
    'default_org': false
  },
  global_tenant: false,
  show_tenant_controls: false,
  mfa_enabled: false,
  audit_logs: [],
  dashboard_metrics: {},
  credentials: [],
  credential: {},
  events: [],
  event: {},
  cases: [],
  case: {},
  tags: {},
  tag: [],
  case_task_notes: [],
  case_templates: [],
  case_template: {},
  case_statuses: [],
  case_status: {},
  case_tasks: [],
  case_task: {},
  case_history: [],
  case_files: [],
  case_file: {},
  related_cases: [],
  observables: [],
  observable: {},
  data_types: [],
  data_type: {},
  event_rules: [],
  event_rule: {},
  case_template_list: [],
  unread_event_count: 0,
  agents: [],
  agent: {},
  agent_groups: [],
  agent_group: {},
  close_reasons: [],
  close_reason: {},
  pairing_token: "",
  organizations: [],
  organization: {},
  users: [],
  user: {},
  related_events: [],
  user_groups: [],
  user_group: {},
  roles: [],
  role: {},
  playbooks: [],
  playbook: {},
  plugins: [],
  plugin: {},
  comments: [],
  comment: {},
  event_rules: [],
  plugin_configs: [],
  plugin_config: {},
  inputs:[],
  input:{},
  orguuid: '',
  tag_list: [],
  list: {},
  lists: [],
  pagination: {},
  credential_list: [],
  intel_filters: [],
  observable_filters: [{'filter_type':'status','data_type':'status','value':'New'}],
  case_filters: [{'filter_type':'status','data_type':'status','value':'New'}],
  alert: {
    'show': false,
    'message': '',
    'type': 'success'
  },
  settings: {
    'email_secret': {
      'uuid': '',
      'name': '',
      'description': ''
    },
    'require_case_templates': false
  },
  event_stats: {},
  event_rule_stats: {},
  list_stats: {},
  case_stats: {},
  network_data: {},
  loading: false,
  quick_filters: true,
  source_input: {},
  input_list: [],
  list_values: [],
  list_names: [],
  toasts: [],
  toasted: [],
  running_tasks: []
}

const mutations = {
  add_task (state, task) {
    state.running_tasks.push(task)
  },
  delete_task (state, task) {
    state.running_tasks = state.running_tasks.filter(item => item != task)
  },
  add_toast (state, toast) {
    if(!state.toasts.find(o => o.key === toast.key))  {
      state.toasts.push(toast)
    }
  },
  toggleSidebarDesktop (state) {
    const sidebarOpened = [true, 'responsive'].includes(state.sidebarShow)
    state.sidebarShow = sidebarOpened ? false : 'responsive'
  },
  toggleSidebarMobile (state) {
    const sidebarClosed = [false, 'responsive'].includes(state.sidebarShow)
    state.sidebarShow = sidebarClosed ? true : 'responsive'
  },
  set (state, [variable, value]) {
    state[variable] = value
  },
  auth_request(state){
    state.status = 'loading'
  },
  loading_status(state, status) {
    state.loading = status
  },
  auth_success(state, data) {
    state.status = 'success'
    state.access_token = data['access_token']
    state.refresh_token = data['refresh_token']
  },
  auth_mfa_check(state) {
    state.status = 'mfa_check'
  },
  auth_error(state){
    state.status = 'error'
  },
  refresh_error(state) {
    state.status = 'error'
  },
  refresh_request(state) {
    state.status = 'loading'
  },
  refresh_success(state, data) {
    state.status = 'success'
    state.access_token = data['access_token']
    state.refresh_token = data['refresh_token']
  },
  save_current_user(state, user) {
    state.current_user = user
    state.success ='success'
  },
  save_credentials(state, credentials){
    state.credentials = credentials
  },
  save_case_template_list(state, templates) {
    state.case_template_list = templates
  },
  save_playbooks(state, credentials){
    state.playbooks = credentials
  },
  save_events(state, events) {
    state.events = events
  },
  save_multiple_events(state, events) {
    for(let evt in events) {
      state.events = [...state.events.filter(e => e.uuid != evt.uuid)]
    }
  },
  save_event(state, event) {
    state.event = event
    if(state.events.length > 0) {
      state.events = [...state.events.filter(e => e.uuid != event.uuid), event]
    } else {
      state.events = [event]
    }    
  },
  save_list_values(state, values) {
    state.list_values = values
  },
  save_list_stats(state, stats) {
    state.list_names = stats['lists']
    delete stats['lists']
    state.list_stats = stats
  },
  save_event_stats(state, stats) {
    state.event_stats = stats
  },
  save_event_rule_stats(state, stats) {
    state.event_rule_stats = stats
  },
  save_case_stats(state, stats) {
    state.case_stats = stats
  },
  save_audit_logs(state, logs) {
    state.audit_logs = logs
  },
  save_lists(state, lists) {
    state.lists = lists
  },
  save_list(state, list) {
    state.list = list
    if(state.lists.length > 0 ){
      state.lists = [...state.lists.filter(l => l.uuid != list.uuid), list]
    } else {
      state.lists = [list]
    }    
  },
  add_list(state, list) {
    if(state.lists.length == 0) {
      state.lists = [list]
    } else {
      state.lists.push(list)
    }    
    state.list = list
  },
  save_case_task_notes(state, notes) {
    state.case_task_notes = notes
  },
  add_case_task_note(state, note) {
    if(state.case_task_notes.length == 0) {
      state.case_task_notes = [note]
    } else {
      state.case_task_notes.push(note)
    }
  },
  save_comments(state, comments) {
    state.comments = comments
  },
  save_comment(state, comment) {
    state.comment = comment
  },
  add_comment(state, comment) {
    state.comments.push(comment)
    state.comment = comment
  },
  update_observable_filters(state, filters) {
    state.observable_filters = filters
  },
  update_case_filters(state, filters) {
    state.case_filters = filters
  },
  update_intel_filters(state, filters) {
    state.intel_filters = filters
  },
  update_case_comment(state, comment) {
    state.comment = comment
    state.comments = state.comments.map(c => c.uuid == comment.uuid ? comment : c)
  },
  remove_comment(state, uuid) {
    state.comments = state.comments.filter(comment => comment.uuid !== uuid)
  },
  save_close_reasons(state, reasons) {
    state.close_reasons = reasons
  },
  save_close_reason(state, reason) {
    state.close_reason = reason
  },
  add_close_reason(state, reason) {
    state.close_reasons.push(reason)
    state.close_reason = reason
  },
  save_data_types(state, data) {
    state.data_types = data
  },
  save_data_type(state, data) {
    state.data_type = data
  },
  add_data_type(state, data) {
    state.data_types.push(data)
    state.data_type = data
  },
  save_event_rules(state, data) {
    state.event_rules = data
  },
  save_event_rule(state, event_rule) {
    state.event_rule = event_rule
    state.event_rules = [...state.event_rules.filter(e => e.uuid != event_rule.uuid), event_rule]
  },
  update_event_rule(state, event_rule) {
    state.event_rule = event_rule
    state.event_rules = state.event_rules.map(e => e.uuid == event_rule.uuid ? event_rule : e)
  },
  add_event_rule(state, data) {
    state.event_rules.push(data)
    state.event_rule = data
  },
  save_agents(state, agents) {
    state.agents = agents
  },
  save_agent(state, agent) {
    state.agent = agent
  },
  save_case_statuses(state, statuses) {
    state.case_statuses = statuses
  },
  save_case_status(state, status) {
    state.status = status
  },
  save_cases(state, cases) {
    state.cases = cases
  },
  save_case_history(state, history) {
    state.case_history = history
  },
  save_case_files(state, case_files) {
    state.case_files = case_files
  },
  save_case_file(state, case_file) {
    state.case_file = case_file
    state.case_files.push(case_file)
  },
  remove_case_file(state, uuid) {
    state.case_file = {}
    state.case_files = state.case_files.filter(c => c.uuid !== uuid)
  },
  save_tags(state, tags) {
    state.tags = tags
  },
  save_case_templates(state, templates) {
    state.case_templates = templates
  },
  save_case(state, c) {
    state.case = c
  },
  update_case(state, c) {
    state.case = c
    state.cases = state.cases.map(x => x.uuid == c.uuid ? c : x )
  },
  save_related_cases(state, data) {
    state.related_cases = data
  },
  save_dashboard_metrics(state, metrics) {
    state.dashboard_metrics = metrics
  },
  save_observables(state, observables) {
    state.observables = observables
  },
  save_observable(state, observable) {
    state.observable = observable
  },
  add_observable(state, observable) {
    state.observables.push(observable)
    state.observable = observable
  },
  update_observable(state, observable) {
    state.observable = observable
    state.observables = state.observables.map(o => o.value == observable.value ? observable : o)
  },
  update_observables(state, observables) {
    for(let obs in observables) {
      let observable = observables[obs]
      state.observables = state.observables.map(o => o.value == observable.value ? observable : o)
    }    
  },
  save_agent_group(state, agent_group) {
    state.agent_group = agent_group
  },
  update_agent_group(state, agent_group) {
    state.agent_group = agent_group
    state.agent_groups = state.agent_groups.map(ag => ag.uuid == agent_group.uuid ? agent_group : ag)
  },
  update_agent(state, agent) {
    state.agent = agent
    state.agents = state.agents.map(a => a.uuid == agent.uuid ? agent : a )
  },
  remove_agent(state, uuid) {
    state.agents = state.agents.filter(a => a.uuid !== uuid)
  },
  remove_agent_group(state, uuid) {
    state.agent_groups = state.agent_groups.filter(a => a.uuid !== uuid)
  },
  save_settings(state, settings) {
    state.settings = settings
  },
  save_agent_groups(state, agent_groups) {
    state.agent_groups = agent_groups
  },
  save_users(state, users) {
    state.users = users
  },
  save_user_groups(state, groups) {
    state.user_groups = groups
  },
  save_user(state, user) {
    state.user = user
  },
  add_organization(state, organization) {
    state.organizations.push(organization)
    state.organization = organization
  },
  save_organizations(state, organizations) {
    state.organizations = organizations
  },
  save_organization(state, organization) {
    state.organization = organization
  },
  update_organization(state, org) {
    state.organizations = state.organizations.map(x => x.uuid == org.uuid ? org : x )
    state.organization = org
  },
  remove_list(state, uuid) {
    state.list = {}
    state.lists = state.lists.filter(a => a.uuid !== uuid)
  },
  remove_user(state, user) {
    state.user = {}
  },
  save_roles(state, roles) {
    state.roles = roles
  },
  save_role(state, role) {
    state.role = role
  },
  remove_role(state, uuid) {
    state.roles = state.roles.filter(role => role.uuid !== uuid)
  },
  save_credential(state, credential) {
    state.credential = credential
  },
  update_credential(state, cred) {
    state.credential = cred
    state.credentials = state.credentials.map(c => c.uuid == cred.uuid ? cred : c)
  },
  remove_credential(state, uuid) {
    state.credentials = state.credentials.filter(c => c.uuid != uuid)
  },
  save_playbook(state, playbook) {
    state.playbook = playbook
  },
  save_plugin(state, plugin) {
    state.plugin = plugin
  },
  save_plugins(state, plugins) {
    state.plugins = plugins
  },
  save_plugin_config(state, plugin_config) {
    state.plugin_config = plugin_config
  },
  save_plugin_configs(state, plugin_configs) {
    state.plugin_configs = plugin_configs
  },
  save_inputs(state, inputs) {
    state.inputs = inputs
  },
  save_inputs_list(state, inputs) {
    state.input_list = inputs.map(item => { return {'name': item.name, 'uuid': item.uuid}})
  },
  save_input(state, input) {
    state.input = input
  },
  remove_input(state, uuid) {
    state.inputs = state.inputs.filter(a => a.uuid !== uuid)
  },
  update_input(state, input) {
    state.input = input
    state.inputs = state.inputs.map(i => i.uuid == input.uuid ? input : i)
  },
  save_pairing_token(state, token) {
    state.pairing_token = token
  },
  add_plugin(state, plugin) {
    state.plugins.push(plugin)
    state.plugin = plugin
    state.stats = 'success'
  },
  add_plugin_config(state, plugin_config) {
    state.plugin_configs.push(plugin_config)
    state.plugin_config = plugin_config
    state.state = 'success'
  },
  add_agent_group(state, agent_group) {
    if (state.agent_groups.length == 0) {
      state.agent_groups = [agent_group]
    } else {
      state.agent_groups.push(agent_group)
    }    
    state.agent_group = agent_group
    state.status = 'success'
  },
  add_credential(state, credential){
    if (state.credentials.length == 0) {
      state.credentials = [credential]
    } else {
      state.credentials.push(credential)
    }    
    state.credential = credential
    state.status = 'success'
  },
  add_case(state, data) {
    state.cases.push(data)
    state.case = data
    state.status = 'success'
  },
  save_case_tasks(state, tasks) {
    state.case_tasks = tasks
  },
  save_case_task(state, task) {
    state.case_task
  },
  update_case_task(state, task) {
    state.case_task = task
    state.case_tasks = state.case_tasks.map(t => t.uuid == task.uuid ? task : t)
  },
  remove_case_task(state, uuid) {
    state.case_task = {}
    state.case_tasks = state.case_tasks.filter(t => t.uuid !== uuid)
  },
  remove_case_template(state, uuid) {
    state.case_template = {}
    state.case_templates = state.case_templates.filter(t => t.uuid !== uuid)
  },
  remove_case(state, uuid) {
    state.cases = state.cases.filter(c => c.uuid != uuid)
    state.case = {}
  },
  remove_agent(state, uuid) {
    state.agents = state.agents.filter(a => a.uuid != uuid)
    state.agent = {}
  },
  remove_event(state, uuid) {
    state.events = state.events.filter(e => e.uuid != uuid)
    state.event = {}
  },
  remove_events(state, events) {
    for(let event in events) {
      state.events = state.events.filter(e => e.uuid != event)
    }
  },
  save_related_events(state, events) {
    state.related_events = events
  },
  add_case_task(state, task) {
    state.case_tasks.push(task)
    state.status = 'success'
  },
  add_case_template(state, data) {
    if(state.case_templates.length == 0) {
      state.case_templates = [data]
    } else {
      state.case_templates.push(data)
    }
    state.case_template = data
    state.status = 'success'
    state.case_template_list.push({title:data.title, description:data.description, uuid:data.uuid, tags:data.tags, severity:data.severity, task_count: data.task_count, tlp:data.tlp})
    state.tags.concat(data.tags)
  },
  update_case_template(state, data) {
    state.case_template = data
    state.case_templates = state.case_templates.map(t => t.uuid == data.uuid ? data : t)
  },
  add_case_status(state, data) {
    state.case_statuses.push(data)
    state.case_status = data
    state.status = 'success'
  },
  add_case_comment(state, data) {
    state.comments.push(data)
  },
  add_case_observables(state, data) {
    state.case.observables = data
  },
  add_playbook(state, playbook){
    state.playbooks.push(playbook)
    state.playbook = playbook
    state.status = 'success'
  },
  add_input(state, input){
    if(state.inputs.lenght == 0) {
      state.inputs = [input]
    } else {
      state.inputs.push(input)
    }    
    state.input = input
    state.status = 'success'
  },
  add_event(state, event) {
    state.events.push(event)
    state.event = event
    state.status = 'success'
  },
  add_user(state, user) {
    state.users.push(user)
    state.user = user
    state.status = 'success'
  },
  add_role(state, role) {
    state.roles.push(role)
    state.role = role
    state.status = 'success'
  },
  update_role(state, role) {
    state.role = role
    state.roles = state.roles.map(r => r.uuid == role.uuid ? role : r)
  },
  add_success(state) {
    state.status = 'success'
  },
  add_start(state) {
    state.status = 'loading'
  },
  tags_success(state, tags) {
    state.tag_list = tags
  },
  creds_success(state, creds) {
    state.credential_list = creds
  },
  inputs_success(state, inputs) {
    state.inputs_list = inputs
  },
  show_alert(state, data) {
    state.alert.message = data['message']
    state.alert.show = true
    state.alert.type = data['type']
  },
  clear_alert(state) {
    state.alert.show = false
    state.alert_message = ''
  },
  tags_error(state) {
    state.tag_list = []
  },
  logout(state){
    state.status = ''
    state.access_token = ''
  },
  mfa_enabled(state, status){
    state.mfa_enabled = status
  },
  save_network_data(state, data) {
    state.network_data = data
  },
  set_quick_filter_state(state, data) {
    state.quick_filters = data
  },
  save_pagination(state, pagination) {
    state.pagination = pagination
  },
  clone_input(state, input) {
    state.source_input = input
  }
}

const getters = {
  running_tasks: state => { return state.running_tasks },
  list_values: state => { return state.list_values },
  pagination: state => { return state.pagination },
  list_name: state => function(uuid) {
    return state.list_names[uuid]
  },
  org_name: state => function(uuid) {
    let org = state.organizations.filter(o => o.uuid === uuid)
    if (org.length > 0) {
      return org[0].name
    } else {
      return "Unknown"
    }
  },
  event_rules: state => { return state.event_rules },
  source_input: state => { return state.source_input },
  lists: state => { return state.lists },
  quick_filters: state => { return state.quick_filters },
  loading: state => {return state.loading},
  intel_filters: state => { return state.intel_filters },
  case_filters: state => { return state.case_filters },
  observable_filters: state => { return state.observable_filters },
  organization: state => { return state.organization },
  organizations: state => {return state.organizations},
  formatted_organizations: state => {return state.organizations.map((o) => { return {label: o.name, value: o.uuid}})},
  network_data: state => { return state.network_data },
  case_stats: state => { return state.case_stats },
  event_stats: state => { return state.event_stats },
  list_stats: state => { return state.list_stats },
  eventDrawerShow: state => { return state.eventDrawerShow},
  eventDrawerMinimize: state => { return state.eventDrawerMinimize},
  mfa_enabled: state => { return state.mfa_enabled },
  isLoggedIn: state => !!state.access_token,
  authStatus: state => state.status,
  addStatus: state => state.status,
  status: state => state.status,
  current_user: state => { return state.current_user },
  alert: state => state.alert,
  agents: state => { return state.agents },
  agent: state => { return state.agent },
  agent_groups: state => { return state.agent_groups },
  case_templates: state => state.case_templates,
  case_template_list: state => { return state.case_template_list },
  date_types: state => state.data_types,
  case_history: state => { return state.case_history },
  comments: state => { return state.comments},
  comment: (state) => function (uuid) { state.comments.find(comment => comment.uuid == uuid) },
  task_notes: (state) => { return state.case_task_notes },
  case_tasks: state => { return state.case_tasks },
  case_task: state => { return state.case_task },
  case_data: state => { return state.case },
  cases: state => { return state.cases },
  users: state => { return state.users },
  roles: state => { return state.roles },
  input: state => { return state.input },
  inputs: state => { return state.inputs },
  observables: state => { return state.observables },
  credentials: state => { return state.credentials },
  credential: state => { return state.credential },
  case_files: state => { return state.case_files },
  related_cases: state => { return state.related_cases },
  events: state => { return state.events },
  close_reasons: state => { return state.close_reasons },
  agent_group : state => { return state.agent_group },
  event: state => { return state.event },
  events: state =>  { return state.events },
  event_rule: state => { return state.event_rule },
  event_rules: state => { return state.event_rules },
  related_events: state => {return state.related_events },
  related_cases: state => { return state.related_cases },
  audit_logs: state => { return state.audit_logs },
  data_types_list: function() { return state.data_types.map(item => { return {'label': item.name, 'value': item.uuid}}) },
  user_has_permission: state => function(permission) {
    if(Object.keys(state.current_user.role.permissions).includes(permission)) {
      
      if(!state.current_user.role.permissions[permission] || state.current_user.role.permissions[permission] === null) {
        return false
      }
      return true
      
    } else {
      return false
    }
    
  },
  user_has: state => function(permission) {
    return Object.keys(state.current_user.permissions).includes(permission)
  },
  tags: state => state.tags
}

let BASE_URL = ""
if (process.env.NODE_ENV == 'development') {
  BASE_URL = location.protocol+'//'+window.location.hostname+'/api/v2.0'
} else {
  BASE_URL = location.protocol+'//'+window.location.host+'/api/v2.0'
}

const actions = {
  login({commit}, user) {
    return new Promise((resolve, reject) => {
      commit('auth_request')
      Axios({url: `${BASE_URL}/auth/login`, data: user, method: 'POST'})
      .then(resp => {
        if(resp.data['mfa_challenge_token'] !== undefined) {
          const mfa_challenge_token = resp.data['mfa_challenge_token']
          localStorage.setItem('mfa_challenge_token', mfa_challenge_token)
          commit('auth_mfa_check')
          resolve(resp)
        } else {
          const access_token = resp.data['access_token']
          const refresh_token = resp.data['refresh_token']
          localStorage.setItem('access_token', access_token)
          localStorage.setItem('refresh_token', refresh_token)
          Axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
          commit('auth_success', {access_token, refresh_token})
          resolve(resp)
        }
      })
      .catch(err => {
        commit('auth_error')
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')        
        reject(err)
      })
    })
  },
  checkMFA({commit}, user) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/auth/mfa`, data: user, method: 'POST'})
      .then(resp => {
          const access_token = resp.data['access_token']
          const refresh_token = resp.data['refresh_token']
          localStorage.setItem('access_token', access_token)
          localStorage.setItem('refresh_token', refresh_token)
          Axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
          commit('auth_success', {access_token, refresh_token})
          resolve(resp)
      })
      .catch(err => {
        commit('auth_error')
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')        
        reject(err)
      })
    })
  },
  forgotPassword({commit}, username) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/auth/forgot_password`, data: username, method: 'POST'})
      .then(resp => {
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  resetPassword({commit}, {token, data}) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/auth/reset_password/${token}`, data, method: 'POST'})
      .then(resp => {
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  refresh_token({commit}) {
    data = {'refresh_token': this.$store.refresh_token}
    commit('refresh_request')
    Axios({url: `${BASE_URL}/auth/refresh`, data: data, method: 'POST'})
    .then(resp => {
        const access_token = resp.data['access_token']
        const refresh_token = resp.data['refresh_token']
        const user = resp.data['user']
        localStorage.setItem('access_token', access_token)
        localStorage.setItem('refresh_token', refresh_token)
        Axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
        commit('refresh_success', {access_token, refresh_token})
        resolve(resp)
    })
    .catch(err => {
        commit('refresh_error')
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        reject(err)
    })
  },
  logout({commit}) {
    return new Promise((resolve, reject) => {
      commit('logout')
      localStorage.removeItem('access_token')
      localStorage.removeItem('mfa_challenge_token')
      delete Axios.defaults.headers.common['Authorization']
      resolve()      
    })
  },
  getMe({commit}) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/user/me`, method: 'GET'})
      .then(resp => {
        commit('add_start')
        commit('save_current_user', resp.data)
        commit('add_success')
        resolve(resp)
      })
      .catch(err => {
        commit('tags_error')
        reject(err)
      })
    })
  },
  getTags({commit}) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/tag`, method: 'GET'})
      .then(resp => {
        commit('save_tags', resp.data)
        resolve(resp)
      })
      .catch(err => {
        commit('tags_error')
        reject(err)
      })
    })
  },
  getDataTypes({commit}, {organization}) {
    return new Promise((resolve, reject) => {

      let url = `${BASE_URL}/data_type`
      if(organization){
        url += `?organization=${organization}`
      }
      Axios({url: url, method: 'GET'})
      .then(resp => {
        commit('save_data_types', resp.data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getLists({commit}, {data_type=[], organization=null, page=1, page_size=10}) {
    return new Promise((resolve, reject) => {

      let base_url = `${BASE_URL}/list?page=${page}&page_size=${page_size}`

      if (data_type.length > 0) {
        base_url += `&data_type=${data_type}`
      }

      if(organization) {
        base_url += `&organization=${organization}`
      }

      Axios({url: base_url, method: 'GET'})
      .then(resp => {
        commit('save_lists', resp.data.lists)
        commit('save_pagination', resp.data.pagination)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  createList({commit}, data) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/list`, data: data, method: 'POST'})
      .then(resp => {
        commit('add_list', resp.data)
        commit('show_alert', {message: 'Successfully created list.', 'type': 'success'})
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  updateList({commit}, {uuid, data}) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/list/${uuid}`, data: data, method: 'PUT'})
      .then(resp => {
        commit('save_list', resp.data)
        commit('show_alert', {message: 'Successfully updated list.', 'type': 'success'})
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  deleteList({commit}, uuid) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/list/${uuid}`, method: 'DELETE'})
      .then(resp => {
        commit('remove_list', uuid)
        commit('show_alert', {message: 'Successfully deleted list.', 'type': 'success'})
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  addItemToList({commit}, {uuid, value}) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/list/${uuid}/add_value`, data: value, method: 'PUT'})
      .then(resp => {
        commit('show_alert', {message: 'Successfully added value to list.', 'type': 'success'})
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  removeItemFromList({commit}, {uuid, value}) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/list/${uuid}/remove_value`, data: value, method: 'PUT'})
      .then(resp => {
        commit('show_alert', {message: 'Successfully removed value from list.', 'type': 'success'})
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getIntelListValues({commit}, {page=1, page_size=25, list=[], value=[], data_type=[], from_poll=null, record_id=null, sort_by='created_at', list_name__like=null, sort_direction='desc', start=null, end=null, organization=null}) {
    return new Promise((resolve, reject) => {

      let url = `${BASE_URL}/list/values?page=${page}&page_size=${page_size}&sort_by=${sort_by}&sort_direction=${sort_direction}`

      if(list.length > 0) {
        url = url+`&list=${list}`
      }

      if(value.length > 0) {
        url = url+`&value=${value}`
      }

      if(data_type.length > 0) {
        url = url+`&data_type=${data_type}`
      }
      
      if(start && end) {
        url = url+`&start=${start}&end=${end}`
      }

      if(organization) {
        url = url+`&organization=${organization}`
      }

      if(record_id) {
        url = url+`&record_id=${record_id}`
      }

      if(list_name__like) {
        url = url+`&list_name__like=${list_name__like}`
      }

      Axios({url: url, method: 'GET'})
      .then(resp => {
        commit('save_list_values', resp.data.values)
        commit('save_pagination', resp.data.pagination)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getIntelListStats({commit}, {list_name__like=null, value__like=null, top=10, list=[], value=[], from_poll=null, record_id=null, data_type=[], metrics=['list','value','data_type','from_poll'],start=null, end=null, organization=[]}) {
    commit('loading_status',true)
    return new Promise((resolve, reject) => {

      let url = `${BASE_URL}/list/stats?q=`

      if(list.length > 0) {
        url = url+`&list=${list}`
      }

      if(value.length > 0) {
        url = url+`&value=${value}`
      }

      if(data_type.length > 0) {
        url = url+`&data_type=${data_type}`
      }

      if(from_poll === true) {
        url = url+`&from_poll=true`
      }

      if(from_poll === false) {
        url = url+`&from_poll=false`
      }

      if(record_id) {
        url = url+`&record_id=${record_id}`
      }

      if(list_name__like) {
        url = url+`&list_name__like=${list_name__like}`
      }

      if(value__like) {
        url = url+`&value__like=${value__like}`
      }

      if(top) {
        url = url+`&top=${top}`
      }

      if(metrics) {
        url = url+`&metrics=${metrics}`
      }

      if(start && end) {
        url = url+`&start=${start}&end=${end}`
      }
      if(organization && organization.length > 0) {
        url = url+`&organization=${organization}`
      }      

      Axios({url: url, method: 'GET'})
      .then(resp => {
        commit('save_list_stats', resp.data)
        commit('loading_status',false)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getInputs({commit}, {page=1, page_size=10, sort_by="created_at", sort_direction="asc"}) {
    return new Promise((resolve, reject) => {
      let url = `${BASE_URL}/input?page=${page}&page_size=${page_size}&sort_by=${sort_by}&sort_direction=${sort_direction}`
      Axios({url: url, method: 'GET'})
      .then(resp => {
        commit('save_inputs', resp.data.inputs)
        commit('save_pagination', resp.data.pagination)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getAgents({commit}, {page=1, page_size=10, sort_by="created_at", sort_direction="asc"}) {

    let url = `${BASE_URL}/agent?page=${page}&page_size=${page_size}&sort_by=${sort_by}&sort_direction=${sort_direction}`
    return new Promise((resolve, reject) => {
      Axios({url: url, method: 'GET'})
      .then(resp => {
        commit('save_agents', resp.data.agents)
        commit('save_pagination', resp.data.pagination)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getAgentGroups({commit}, {page=1, page_size=10, sort_by="created_at", sort_direction="asc"}) {

    let url = `${BASE_URL}/agent_group?page=${page}&page_size=${page_size}&sort_by=${sort_by}&sort_direction=${sort_direction}`
    return new Promise((resolve, reject) => {
      Axios({url: url, method: 'GET'})
      .then(resp => {
        commit('save_agent_groups', resp.data.groups)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getAgentGroup({commit}, uuid) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/agent_group/${uuid}`, method: 'GET'})
      .then(resp => {
        commit('save_agent_group', resp.data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  deleteAgent({commit}, uuid) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/agent/${uuid}`, method: 'DELETE'})
      .then(resp => {
        commit('remove_agent', uuid)
        commit('show_alert', {message: `Successfully deleted agent.`, 'type': 'success'})
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  updateAgent({commit}, {uuid, data}) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/agent/${uuid}`, data: data, method: 'PUT'})
      .then(resp => {
        commit('update_agent', resp.data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  updateAgentGroup({commit}, {uuid, data}) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/agent_group/${uuid}`, data: data, method: 'PUT'})
      .then(resp => {
        commit('update_agent_group', resp.data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getPairingToken({commit}) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/agent/pair_token`, method: 'GET'})
      .then(resp => {
        commit('save_pairing_token', resp.data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  createInput({commit}, input) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/input`, data: input, method: 'POST'})
      .then(resp => {
        commit('add_input', input)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  createAgentGroup({commit}, agent_group) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/agent_group`, data: agent_group, method: 'POST'})
      .then(resp => {
        commit('add_agent_group', resp.data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  deleteInput({commit}, uuid) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/input/${uuid}`, method: 'DELETE'})
      .then(resp => {
        commit('remove_input', uuid)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getInput({commit}, uuid) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/input/${uuid}`, method: 'GET'})
      .then(resp => {
        commit('save_input', resp.data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  updateInput({commit}, {uuid, data}) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/input/${uuid}`, data: data, method: 'PUT'})
      .then(resp => {
        commit('update_input', resp.data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getAgent({commit}, uuid) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/agent/${uuid}`, method: 'GET'})
      .then(resp => {
        commit('save_agent', resp.data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  setAgentGroups({commit}, {uuid, groups}) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/agent/${uuid}`, data: groups, method: 'PUT'})
      .then(resp => {
        commit('save_agent_groups', resp.data)
        resolve(resp)
      })
      .catch(err => { 
        reject(err)
      })
    })
  },
  setAgentGroupInputs({commit}, {uuid, inputs}) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/agent_group/${uuid}`, data: inputs, method: 'PUT'})
      .then(resp => {
        //commit('save_inputs', resp.data)
        resolve(resp)
      })
      .catch(err => { 
        reject(err)
      })
    })
  },
  setAgentInputs({commit}, {uuid, inputs}) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/agent/${uuid}`, data: inputs, method: 'PUT'})
      .then(resp => {
        commit('save_inputs', resp.data)
        resolve(resp)
      })
      .catch(err => { 
        reject(err)
      })
    })
  },
  addTagsToInput({commit}, postData) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/input/${postData.uuid}/bulktag`, data: postData.data, method: 'POST'})
      .then(resp => {
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getCredentialList({commit}, {organization}) {
    return new Promise((resolve, reject) => {

      let base_url = `${BASE_URL}/credential`

      if (organization) {
        base_url += `?organization=${organization}`
      }

      Axios({url: base_url, method: 'GET'})
      .then(resp => {
        let credentials = []
        resp.data.credentials.forEach(cred => credentials.push({'value':cred.uuid, 'label':cred.name+" - "+cred.description}))
        commit('creds_success', credentials)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getInputList({commit}, {organization=null, name=null}) {
    return new Promise((resolve, reject) => {

      let url = `${BASE_URL}/input`
      if(organization) {
        url += `?organization=${organization}`
      }
      if(name) {
        url += `&name=${name}`
      }
      Axios({url: url, method: 'GET'})
      .then(resp => {
        let credentials = []
        commit('save_inputs_list', resp.data.inputs)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getDashboardMetrics({commit}) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/dashboard`, method: 'GET'})
      .then(resp => {
        commit('save_dashboard_metrics', resp.data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getCredentials({commit}, {page=1, page_size=10, sort_by="created_at", sort_direction="asc"}) {
    return new Promise((resolve, reject) => {

      let url = `${BASE_URL}/credential?page=${page}&page_size=${page_size}&sort_by=${sort_by}&sort_direction=${sort_direction}`
      Axios({url: url, method: 'GET'})
      .then(resp => {
        commit('save_credentials', resp.data.credentials)
        commit('save_pagination', resp.data.pagination)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getCredential({commit}, uuid) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/credential/${uuid}`, method: 'GET'})
      .then(resp => {
        commit('save_credential', resp.data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  deleteCredential({commit}, uuid) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/credential/${uuid}`, method: 'DELETE'})
      .then(resp => {
        commit('remove_credential', uuid)
        commit('show_alert', {'message':'Successfully deleted credential', 'type': 'success'})
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  updateCredential({commit}, {uuid, credential}) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/credential/${uuid}`, data: credential, method: 'PUT'})
      .then(resp => {
        commit('update_credential', resp.data)
        commit('show_alert', {'message':'Successfully updated credential', 'type': 'success'})
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  createCredential({commit}, credential) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/credential/encrypt`, data: credential, method: 'POST'})
      .then(resp => {
        commit('add_credential', resp.data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getPlaybooks({commit}) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/playbook`, method: 'GET'})
      .then(resp => {
        commit('save_playbooks', resp.data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getCaseFiles({commit}, {uuid, page=1, page_size=25}) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/case/${uuid}/files?page=${page}&page_size=${page_size}`})
      .then(resp => {
        commit('add_start')
        commit('save_case_files', resp.data.files)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getRelatedEvents({commit}, uuid) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/event/${uuid}/new_related_events`, method:'GET'})
      .then(resp => {
        commit('save_related_events', resp.data.events)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getObservableNetwork({commit}) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/observable/network`, method: 'GET'})
      .then(resp => {
        commit('save_network_data', resp.data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getBulkEvents({commit}, {signature=null, status=[], severity=[], source=[], tags=[], title=[], observables=[], start=null, end=null, organization=[], title__like=null}) {
    return new Promise((resolve, reject) => {

      let url = `${BASE_URL}/event/bulk_select_all?q=`

      if(signature) {
        url = url+`&signature=${signature}`
      } 
      if(status) {
        url = url+`&status=${status}`
      }
      if(severity.length > 0) {
        url = url+`&severity=${severity}`
      } 
      if(tags.length > 0) {
        url = url+`&tags=${tags}`
      }
      if(title.length > 0) {
        url = url+`&title=${title}`
      }
      if(source.length >0) {
        url = url+`&source=${source}`
      }
      if(observables.length > 0) {
        url = url+`&observables=${observables}`
      }
      if(start && end) {
        url = url+`&start=${start}&end=${end}`
      }
      if(organization && organization.length > 0) {
        url = url+`&organization=${organization}`
      }
      if(title__like) {
        url = url+`&title__like=${title__like}`
      }
      Axios({url: url, method: 'GET'})
      .then(resp => {
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getEventStats({commit}, {title__like=null, signature=null, status=[], severity=[], source=[], tags=[], title=[], observables=[], top=null, metrics=['title','observable','source','tag','status','severity','data_type','organization','event_rule','signature'],start=null, end=null, organization=[], event_rules=[]}) {
    commit('loading_status',true)
    return new Promise((resolve, reject) => {

      let url = `${BASE_URL}/event/stats?q=`

      if(signature) {
        url = url+`&signature=${signature}`
      } 
      if(status) {
        url = url+`&status=${status}`
      }
      if(severity.length > 0) {
        url = url+`&severity=${severity}`
      } 
      if(tags.length > 0) {
        url = url+`&tags=${tags}`
      }
      if(title.length > 0) {
        url = url+`&title=${title}`
      }
      if(source.length >0) {
        url = url+`&source=${source}`
      }
      if(observables.length > 0) {
        url = url+`&observables=${observables}`
      }
      if(top) {
        url = url+`&top=${top}`
      }
      if(metrics) {
        url = url+`&metrics=${metrics}`
      }
      if(start && end) {
        url = url+`&start=${start}&end=${end}`
      }
      if(organization && organization.length > 0) {
        url = url+`&organization=${organization}`
      }
      if(event_rules && event_rules.length > 0) {
        url = url+`&event_rule=${event_rules}`
      }
      if(title__like) {
        url = url+`&title__like=${title__like}`
      }

      Axios({url: url, method: 'GET'})
      .then(resp => {
        commit('save_event_stats', resp.data)
        commit('loading_status',false)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getCaseEvents({commit}, {uuid, title__like=null, signature=null, status=[], search, rql, severity=[], page, source=[], tags=[], title=[], observables=[], page_size=25, sort_by='created_at', grouped=true, fields='', sort_direction='desc', start=null, end=null, organization=null}) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/event/case_events/${uuid}`, method: 'GET'})
      .then(resp => {
        commit('save_events', resp.data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getEvents({commit}, {title__like=null, signature=null, case_uuid, status=[], search, rql, severity=[], page, source=[], tags=[], title=[], observables=[], page_size=25, sort_by='created_at', grouped=true, fields='', sort_direction='desc', start=null, end=null, organization=null, event_rules=null}) {
    return new Promise((resolve, reject) => {

      let url = `${BASE_URL}/event?grouped=${grouped}&sort_by=${sort_by}&sort_direction=${sort_direction}`

      if(signature) {
        url = url+`&signature=${signature}`
      } 
      if(status) {
        url = url+`&status=${status}`
      } 
      if(case_uuid) {
        url = url+`&case_uuid=${case_uuid}`
      } 
      if(search) {
        url = url+`&search=${search}`
      }
      if(rql) {
        url = url+`&rql=${rql}`
      }
      if(severity.length > 0) {
        url = url+`&severity=${severity}`
      } 
      if(page) {
        url = url+`&page=${page}`
      }
      if(page_size) {
        url = url+`&page_size=${page_size}`
      }
      if(tags.length > 0) {
        url = url+`&tags=${tags}`
      }
      if(observables.length > 0) {
        url = url+`&observables=${observables}`
      }
      if(title.length > 0) {
        url = url+`&title=${title}`
      }
      
      if(source.length >0) {
        url = url+`&source=${source}`
      }

      if(organization && organization.length > 0) {
        url = url+`&organization=${organization}`
      }

      if(event_rules && event_rules.length > 0) {
        url = url+`&event_rule=${event_rules}`
      }

      if(start && end) {
        url = url+`&start=${start}&end=${end}`
      }

      if(title__like) {
        url = url+`&title__like=${title__like}`
      }

      Axios({url: url, method: 'GET', headers:{'X-Fields': fields}})
      .then(resp => {
        commit('add_start')
        commit('save_events', resp.data.events)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getEvent({commit}, uuid) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/event/${uuid}`, method: 'GET'})
      .then(resp => {
        commit('save_event', resp.data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  updateEvent({commit}, {uuid, data}) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/event/${uuid}`, data: data, method: 'PUT'})
      .then(resp => {
        commit('save_event', resp.data)
        commit('show_alert', {message: `Successfully updated Event.`, 'type': 'success'})
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  dismissEventsByFilter({commit}, data) {
    return new Promise((resolve, reject) => {
      console.log(data)
      Axios({url: `${BASE_URL}/event/dismiss_by_filter`, data: data, method: 'PUT'})
      .then(resp => {
        commit('save_multiple_events', resp.data)
        //commit('add_toast', {message:`Dismiss task submitted.`, header:'Bulk Dismiss', color: 'success', key: resp.data.task_id, refresh: false})
        //commit('add_task', resp.data.task_id)
        resolve(resp)
      })
      .catch(err => {
        console.log(err)
        reject(err)
      })
    })
  },
  dismissEvents({commit}, data) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/event/bulk_dismiss`, data: data, method: 'PUT'})
      .then(resp => {
        commit('save_multiple_events', resp.data)
        //commit('show_alert', {message: `Successfully updated ${data.events.length} Events.`, 'type': 'success'})
        commit('add_toast', {message:`Dismiss task submitted.`, header:'Bulk Dismiss', color: 'success', key: resp.data.task_id, refresh: false})
        commit('add_task', resp.data.task_id)
        resolve(resp)
      })
      .catch(err => {
        console.log(err)
        reject(err)
      })
    })
  },
  createEventRule({commit}, rule) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/event_rule`, data: rule, method: 'POST'})
      .then(resp => {
        commit('save_event_rule', resp.data)
        commit('show_alert', {message: 'Successfully created the Event Rule.', 'type': 'success'})
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  editEventRule({commit}, {uuid, rule}) {
    commit('loading_status',true)
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/event_rule/${uuid}`, data: rule, method: 'PUT'})
      .then(resp => {
        commit('update_event_rule', resp.data)
        commit('show_alert', {message: 'Successfully updated the Event Rule.', 'type': 'success'})
        commit('loading_status',false)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getPlugins({commit}) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/plugin`, method: 'GET'})
      .then(resp => {
        commit('save_plugins', resp.data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getPlugin({commit}, uuid) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/plugin/${uuid}`, method: 'GET'})
      .then(resp => {
        commit('save_plugin', resp.data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  uploadPlugin({commit}, formData) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/plugin/upload`, data: formData, method: 'POST', config:{headers: {'Content-Type': 'multipart/form-data'}}})
      .then(resp => resp.data)
      .then(resp => resp.map(plugin => Object.assign({}, plugin, { name: plugin.name })))
      .then(resp => {
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getPluginConfig({commit}, uuid) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/plugin_config/${uuid}`, method: 'GET'})
      .then(resp => {
        commit('save_plugin_config', resp.data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getPluginConfigs({commit}, uuid) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/plugin_config`, method: 'GET'})
      .then(resp => {
        commit('save_plugin_configs', resp.data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  createPluginConfig({commit}, config) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/plugin_config`, data: config, method: 'POST'})
      .then(resp => {
        commit('add_plugin_config', resp.data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getOrganization({commit}, uuid) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/organization/${uuid}`, method: 'GET'})
      .then(resp => {
        commit('save_organization', resp.data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  updateOrganization({commit}, {uuid, data}) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/organization/${uuid}`, data: data, method: 'PUT'})
      .then(resp => {
        commit('update_organization', resp.data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  createOrganization({commit}, organization) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/organization`, data: organization, method: 'POST'})
      .then(resp => {
        commit('add_organization', resp.data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getOrganizations({commit}, {page=1, page_size=50, sort_by="created_at", sort_direction="asc"}) {
    return new Promise((resolve, reject) => {
      let base_url = `${BASE_URL}/organization?page=${page}&page_size=${page_size}&sort_by=${sort_by}&sort_direction=${sort_direction}`
      Axios({url: base_url, method: 'GET'})
      .then(resp => {
        commit('save_organizations', resp.data.organizations)
        commit('save_pagination', resp.data.pagination)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getUsers({commit}, {page=1,page_size=10,organization=null,sort_by="created_at",sort_direction="asc"}) {
    return new Promise((resolve, reject) => {

      let base_url = `${BASE_URL}/user?page=${page}&page_size=${page_size}&sort_by=${sort_by}&sort_direction=${sort_direction}`
      if(organization) {
        base_url += `&organization=${organization}`
      }
      Axios({url: base_url, method: 'GET'})
      .then(resp => {
        commit('save_users', resp.data.users)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getGroups({commit}) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/user_group`, method: 'GET'})
      .then(resp => {
        commit('save_users', resp.data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getUserGroupsByName({commit}, name) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/user_groups?name={name}`, method: 'GET'})
      .then(resp => {
        commit('save_user_groups', resp.data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  unlockUser({commit}, uuid) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/user/${uuid}/unlock`, method: 'PUT'})
      .then(resp => {
        commit('save_user', resp.data.user)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  updateUser({commit}, {uuid, user}) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/user/${uuid}`, data: user, method: 'PUT'})
      .then(resp => {
        commit('save_user', resp.data.user)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  updateUserPassword({commit}, data) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/user/set_password`, data: data, method: 'PUT'})
      .then(resp => {
        commit('save_user', resp.data.user)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  deleteUser({commit}, uuid) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/user/${uuid}`, method: 'DELETE'})
      .then(resp => {
        commit('remove_user', resp.data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getUser({commit}, uuid) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/user/${uuid}`, method: 'GET'})
      .then(resp => {
        commit('save_user', resp.data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  createUser({commit}, user) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/user`, data: user, method: 'POST'})
      .then(resp => {
        commit('add_user', resp.data.user)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getRoles({commit}, {organization=null, page=1, page_size=10, sort_by="created_at",sort_direction="asc"}) {

    let url =`${BASE_URL}/role?page=${page}&page_size=${page_size}&sort_by=${sort_by}&sort_direction=${sort_direction}`

    if (organization) {
      url += `&organization=${organization}`
    }

    return new Promise((resolve, reject) => {
      Axios({url: url, method: 'GET'})
      .then(resp => {
        commit('save_roles', resp.data.roles)
        commit('save_pagination', resp.data.pagination)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  createPlaybook({commit}, playbook) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/playbook`, data: playbook, method: 'POST'})
      .then(resp => {
        commit('add_playbook', playbook)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getPlaybook({commit}, uuid) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/playbook/${uuid}`, method: 'GET'})
      .then(resp => {
        commit('save_playbook', resp.data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  addTagsToPlaybook({commit}, postData) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/playbook/${postData.uuid}/bulktag`, data: postData.data, method: 'POST'})
      .then(resp => {
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getCaseTemplates({commit}) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/case_template`, method: 'GET'})
      .then(resp => {
        commit('save_case_templates', resp.data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  createCaseTemplate({commit}, data) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/case_template`, data: data, method: 'POST'})
      .then(resp => {
        commit('add_case_template', data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  updateCaseTemplate({commit}, {uuid, data}) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/case_template/${uuid}`, data: data, method: 'PUT'})
      .then(resp => {
        commit('update_case_template', data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getCaseTemplateList({commit}, {title, organization}) {
    return new Promise((resolve, reject) => {

      let base_url = `${BASE_URL}/case_template?title=${title}`

      if(organization) {
        base_url += `&organization=${organization}`
      }

      Axios({url: base_url, method: 'GET', headers: {'X-Fields': 'uuid,title,description,tlp,severity,tags,task_count'}})
      .then(resp => {
        commit('save_case_template_list', resp.data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getCases({commit}, {status=[], search=[], severity=[], tag=[], owner=[], organization=[], close_reason=[], my_cases=false, my_tasks=false, page=1, page_size=25, start=null, end=null, sort_by="created_at", sort_direction="asc", escalated=null}) {
    return new Promise((resolve, reject) => {

      let base_url = `${BASE_URL}/case?page=${page}&page_size=${page_size}&sort_by=${sort_by}&sort_direction=${sort_direction}`

      if(status.length > 0 ) {
        base_url += `&status=${status}`
      }

      if(search.length > 0 ) {
        base_url += `&search=${search}`
      }

      if(severity.length > 0 ) {
        base_url += `&severity=${severity}`
      }

      if(owner.length > 0 ) {
        base_url += `&owner=${owner}`
      }

      if(tag.length > 0 ) {
        base_url += `&tag=${tag}`
      }

      if(my_tasks) {
        base_url += `&my_tasks=${my_tasks}`
      }

      if(my_cases) {
        base_url += `&my_cases=${my_cases}`
      }

      if(organization.length > 0) {
        base_url += `&organization=${organization}`
      }

      if(close_reason.length > 0) {
        base_url += `&close_reason=${close_reason}`
      }

      if(start && end) {
        base_url += `&start=${start}&end=${end}`
      }

      if(escalated != null) {
        base_url += `&escalated=${escalated}`
      }

      Axios({url: base_url, method: 'GET', headers: {'Content-Type': 'application/json'}})
      .then(resp => {
        commit('save_cases', resp.data.cases)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getCaseStats({commit}, {status=[], severity=[], tags=[], title=[], close_reason=[], owner=[], top=null, my_cases=false, metrics=['title','tag','status','severity','close_reason','organization','escalated'], start=null, end=null, organization=[], escalated=null}) {
    return new Promise((resolve, reject) => {

      let url = `${BASE_URL}/case/stats?q=`

      if(status) {
        url = url+`&status=${status}`
      }
      if(severity.length > 0) {
        url = url+`&severity=${severity}`
      } 
      if(tags.length > 0) {
        url = url+`&tags=${tags}`
      }
      if(title.length > 0) {
        url = url+`&title=${title}`
      }
      if(top) {
        url = url+`&top=${top}`
      }
      if(metrics) {
        url = url+`&metrics=${metrics}`
      }
      if(start && end) {
        url = url+`&start=${start}&end=${end}`
      }
      if(organization && organization.length > 0) {
        url = url+`&organization=${organization}`
      }
      if(close_reason.length > 0) {
        url = url+`&close_reason=${close_reason}`
      }
      if(owner.length > 0) {
        url += `&owner=${owner}`
      }
      if(my_cases) {
        url += `&my_cases=${my_cases}`
      }
      if(escalated != null) {
        url += `&escalated=${escalated}`
      }

      Axios({url: url, method: 'GET'})
      .then(resp => {
        commit('save_case_stats', resp.data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getRelatedCases({commit}, uuid) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/case/${uuid}/relate_cases`, method: 'GET'})
      .then(resp => {
        commit('save_related_cases', resp.data.related_cases)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  relateCases({commit}, {uuid, data}) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/case/${uuid}/relate_cases`, data:data, method: 'PUT'})
      .then(resp => {
        commit('save_related_cases', resp.data.related_cases)
        commit('show_alert', {message:'Successfully linked cases.', type:'success'})
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  unlinkCases({commit}, {uuid, data}) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/case/${uuid}/relate_cases`, data:data, method: 'DELETE'})
      .then(resp => {
        commit('save_related_cases', resp.data.related_cases)
        commit('show_alert', {message:'Successfully unlinked cases.', type:'success'})
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getCaseObservablesFromEvents({commit}, {uuid, page=1, page_size=25}) {
    return new Promise((resolve, reject) => {
      let base_url = `${BASE_URL}/event/observables_by_case/${uuid}?page=${page}&page_size=${page_size}`

      Axios({url: base_url, method: 'GET'}).then(resp => {
        commit('save_observables', resp.data.observables)
        resolve(resp)
      }).catch(err => {
        reject(err)
      })
    })
  },
  getCaseObservables({commit}, {uuid, page=1, page_size=25, observable=[], dataType=[], search=[], tags=[]}) {
    return new Promise((resolve, reject) => {
      
      let base_url = `${BASE_URL}/case/${uuid}/observables?page=${page}&page_size=${page_size}`

      if(observable.length > 0) {
        base_url += `&observables=${observables}`
      }

      if(dataType.length > 0) {
        base_url += `&dataType=${dataType}`
      }

      if(search.length > 0) {
        base_url += `&search=${search}`
      }

      if(tags.length > 0) {
        base_url += `&tags=${tag}`
      }

      Axios({url: base_url, method: 'GET'})
      .then(resp => {
        commit('save_observables', resp.data.observables)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  updateObservable({commit}, {uuid, observable_value, data}) {
    return new Promise((resolve, reject) => {
      observable_value = Buffer.from(observable_value).toString('base64')
      Axios({url: `${BASE_URL}/case/${uuid}/observables/${observable_value}`, data: data, method: 'PUT'})
      .then(resp => {
        commit('update_observable', resp.data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  updateEventObservable({commit}, {uuid, observable_value, data}) {
    return new Promise((resolve, reject) => {
      observable_value = Buffer.from(observable_value).toString('base64')
      Axios({url: `${BASE_URL}/event/${uuid}/observables/${observable_value}`, data: data, method: 'PUT'})
      .then(resp => {
        commit('update_observable', resp.data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  bulkUpdateObservables({commit}, data) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/observable/_bulk`, data: data, method: 'PUT'})
      .then(resp => {
        commit('update_observables', resp.data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getCloseReasons({commit}, {organization=null}) {
    return new Promise((resolve, reject) => {

      let base_url = `${BASE_URL}/close_reason`

      if(organization) {        
        base_url += `?organization=${organization}`
      }

      Axios({url: base_url, method: 'GET'})
      .then(resp => {
        commit('save_close_reasons', resp.data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getCasesByTitle({commit}, {title, organization=null, fields='uuid,title,id,event_count,owner,severity'}) {
    return new Promise((resolve, reject) => {

      let base_url = `${BASE_URL}/case?title=${title}`

      if (organization) {
        base_url += `&organization=${organization}`
      }

      Axios({url: base_url, method: 'GET'})
      .then(resp => {
        commit('save_cases', resp.data.cases)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getCaseComments({commit}, uuid) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/case_comment?case_uuid=${uuid}`, method: 'GET'})
      .then(resp => {
        commit('save_comments', resp.data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getCaseHistory({commit}, uuid) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/case_history?case_uuid=${uuid}`, method: 'GET'})
      .then(resp => {
        commit('save_case_history', resp.data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getCaseTasks({commit}, uuid) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/case_task?case_uuid=${uuid}`, method: 'GET'})
      .then(resp => {
        commit('save_case_tasks', resp.data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  addTaskNote({commit}, {uuid, data}) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/case_task/${uuid}/add_note`, data: data, method: 'POST'})
      .then(resp => {
        commit('add_case_task_note', resp.data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getTaskNotes({commit}, uuid) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/task_note?task_uuid=${uuid}`, method: 'GET'})
      .then(resp => {
        commit('save_case_task_notes', resp.data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getCaseStatus({commit}, {organization=null}) {

    let base_url = `${BASE_URL}/case_status`

    if (organization) {
      base_url += `?organization=${organization}`
    }

    return new Promise((resolve, reject) => {
      Axios({url: base_url, method: 'GET'})
      .then(resp => {
        commit('save_case_status', resp.data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getUsersByName({commit}, {username, organization=null}) {
    return new Promise((resolve, reject) => {

      let base_url = `${BASE_URL}/user?username=${username}`

      if (organization) {
        base_url += `&organization=${organization}`
      }

      Axios({url: base_url, method: 'GET'})
      .then(resp => {
        commit('save_users', resp.data.users)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getGroupsByName({commit}, name) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/user_group?name=${name}`, method: 'GET'})
      .then(resp => {
        commit('save_user_groups', resp.data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getCase({commit}, uuid) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/case/${uuid}`, method: 'GET', headers: {'X-Fields':'id,uuid,organization,case_template_uuid,title,tlp,description,status,owner,severity,observable_count,event_count,tags,case_template,created_at,created_by,modified_at,updated_by,close_reason,total_tasks,open_tasks,escalated'}})
      .then(resp => {
        commit('save_case', resp.data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  createCase({commit}, data) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/case`, data: data, method: 'POST'})
      .then(resp => {
        commit('add_case', data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  createCaseTask({commit}, data) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/case_task`, data: data, method: 'POST'})
      .then(resp => {
        commit('add_case_task', resp.data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  addEventsToCase({commit}, {uuid, include_related_events=false, events}) {

    let data = {
      'events': events,
      'include_related_events': include_related_events
    }
    
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/case/${uuid}/add_events`, data: data, method: 'PUT'})
      .then(resp => {
        commit('save_case', resp.data.case)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  updateComment({commit}, {uuid, data}) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/case_comment/${uuid}`, data: data, method: 'PUT'})
      .then(resp => {
        commit('update_case_comment', resp.data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  updateCaseTask({commit}, {uuid, data}) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/case_task/${uuid}`, data: data, method: 'PUT'})
      .then(resp => {
        commit('update_case_task', resp.data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  deleteCaseTask({commit}, uuid) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/case_task/${uuid}`,method: 'DELETE'})
      .then(resp => {
        commit('remove_case_task', uuid)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  deleteCaseTemplate({commit}, uuid) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/case_template/${uuid}`,method: 'DELETE'})
      .then(resp => {
        commit('remove_case_template', uuid)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  updateCase({commit}, {uuid, data}) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/case/${uuid}`, data: data, method: 'PUT'})
      .then(resp => {
        commit('update_case', resp.data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  createCaseComment({commit}, data) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/case_comment`, data: data, method: 'POST'})
      .then(resp => {
        commit('add_case_comment', resp.data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  deleteAgent({commit}, uuid) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/agent/${uuid}`, method: 'DELETE'})
      .then(resp => {
        commit('remove_agent', uuid)
        commit('show_alert', {message: 'Successfully deleted the agent.', 'type': 'success'})
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  deleteAgentGroup({commit}, uuid) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/agent_group/${uuid}`, method: 'DELETE'})
      .then(resp => {
        commit('remove_agent_group', uuid)
        commit('show_alert', {message: 'Successfully deleted the agent group.', 'type': 'success'})
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  deleteEvent({commit}, uuid) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/event/${uuid}`, method: 'DELETE'})
      .then(resp => {
        commit('remove_event', uuid)
        commit('show_alert', {message: 'Successfully deleted the event.', 'type': 'success'})
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  deleteEvents({commit}, events) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/event/bulk_delete`, data: {events: events}, method: 'DELETE'})
      .then(resp => {
        commit('remove_events', events)
        commit('show_alert', {message: 'Successfully deleted the events.', 'type': 'success'})
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  deleteCase({commit}, uuid) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/case/${uuid}`, method: 'DELETE'})
      .then(resp => {
        commit('remove_case', uuid)
        commit('show_alert', {message: 'Successfully deleted the case.', 'type': 'success'})
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  deleteCaseComment({commit}, uuid) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/case_comment/${uuid}`, method: 'DELETE'})
      .then(resp => {
        commit('remove_comment', uuid)
        commit('show_alert', {message: 'Successfully deleted the comment.', 'type': 'success'})
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  bulkAddObservablesToCase({commit}, {uuid, data}) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/case/${uuid}/add_observables/_bulk`, data: data, method: 'POST'})
      .then(resp => {
        //commit('add_case_observables', resp.data.observables)
        commit('save_observables', resp.data.observables)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getSettings({commit}, {uuid=null, store=true}) {
    return new Promise((resolve, reject) => {
      let url = `${BASE_URL}/settings`
      if(uuid) {
        url += `?organization=${uuid}`
      }
      Axios({url: url, method: 'GET'})
      .then(resp => {
        commit('add_start')
        if(store) {
          commit('save_settings', resp.data)
        }
        commit('add_success')
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  updateSettings({commit}, data) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/settings`, data: data, method: 'PUT'})
      .then(resp => {
        commit('show_alert', {message: 'Successfully updated config', 'type': 'success'})
        resolve(resp)
      })
      .catch(err => {
        commit('show_alert', {message: err.response.data.message, 'type': 'danger'})
        reject(err)
      })
    })
  },
  getPersistentPairingToken({commit}, organization=null) {

    let url = `${BASE_URL}/settings/generate_persistent_pairing_token`
    if(organization) {
      url += `?organization=${organization}`
    }
    return new Promise((resolve, reject) => {
      Axios({url: url, method: 'GET'})
      .then(resp => {
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getAuditLogs({commit}, {selected_status,selected_event_type, page}) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/audit_log?status=${selected_status}&event_type=${selected_event_type}&page=${page}`, method: 'GET'})
      .then(resp => {
        commit('save_audit_logs', resp.data.logs)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  fetchObservableHistory({commit}, value) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/observable/history/${value}`, method: 'GET'})
      .then(resp => {
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  fetchMFAQRCode({commit}) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/user/generate_mfa_qr`, method: 'GET'})
      .then(resp => {
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  validateMFASetup({commit}, token) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/user/validate_mfa_setup`, data: token, method: 'POST'})
      .then(resp => {
        commit('mfa_enabled', true)
        resolve(resp)
      })
      .catch(err => {
        commit('mfa_enabled', false)
        reject(err)
      })
    })
  },
  enableMFA({commit}) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/user/enable_mfa`, method: 'GET'})
      .then(resp => {
        commit('mfa_enabled', true)
        resolve(resp)
      })
      .catch(err => {
        commit('mfa_enabled', false)
        reject(err)
      })
    })
  },
  disableMFA({commit}) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/user/disable_mfa`, method: 'GET'})
      .then(resp => {
        if (resp.status == 200) {
          commit('mfa_enabled', false)
          resolve(resp)
        } else {
          commit('mfa_enabled', true)
          resolve(resp)
        }                
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  toggleMFA({commit}, data) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/user/toggle_mfa`, data: data, method: 'PUT'})
      .then(resp => {
        if (resp.status == 200) {
          resolve(resp)
        } else {
          resolve(resp)
        }                
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  runThreatHunt({commit}, query) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/hunting/query`, data: query, method: 'POST'})
      .then(resp => {
        if (resp.status == 200) {
          resolve(resp)
        } else {
          resolve(resp)
        }                
      })
      .catch(err => {
        console.log(err)
        reject(err)
      })
    })
  },
  testEventRuleQuery({commit}, data) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/event_rule/test_rule_rql`, data: data, method: 'POST'})
      .then(resp => {
          resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getEventRuleStats({commit}, {metrics=['hits'], rules=[], save=false}) {

    return new Promise((resolve, reject) => {

      let base_url = `${BASE_URL}/event_rule/stats?metrics=${metrics}`

      if(rules) {
        base_url += `&rules=${rules}`
      }

      Axios({url: base_url, method: 'GET'})
      .then(resp => {
        if(save) {
          commit('save_event_rule_stats', resp.data)
        }
        commit('loading_status', false)
          resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  loadEventRules({commit}, {page=1, page_size=25, sort_by="created_at", sort_direction="asc", rules=null, save=true}) {
    commit('loading_status', true)
    return new Promise((resolve, reject) => {

      let base_url = `${BASE_URL}/event_rule?page=${page}&page_size=${page_size}&sort_by=${sort_by}&sort_direction=${sort_direction}`

      if(rules) {
        base_url += `&rules=${rules}`
      }

      Axios({url: base_url, method: 'GET'})
      .then(resp => {
        if(save) {
          commit('save_event_rules', resp.data.event_rules)
        }
        commit('loading_status', false)
          resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  updateEventRule({commit}, {uuid, data}) {
    commit('loading_status', true)
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/event_rule/${uuid}`, data: data, method: 'PUT'})
      .then(resp => {
        commit('update_event_rule', resp.data)
        commit('loading_status', false)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  deleteEventRule({commit}, {uuid}) {
    commit('loading_status', true)
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/event_rule/${uuid}`, method: 'DELETE'})
      .then(resp => {
        commit('loading_status', false)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  createRole({commit}, data) {
    commit('loading_status', true)
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/role`, data: data, method: 'POST'})
      .then(resp => {
        commit('add_role', resp.data)
        commit('loading_status', false)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  updateRole({commit}, {uuid, data}) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/role/${uuid}`, data: data, method: 'PUT'})
      .then(resp => {
        commit('update_role', resp.data)
        commit('loading_status', false)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  deleteRole({commit}, {uuid}) {
    commit('loading_status', true)
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/role/${uuid}`, method: 'DELETE'})
      .then(resp => {
        commit('remove_role', uuid)
        commit('loading_status', false)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  checkTaskStatus({commit}, {uuid=null, complete=true, broadcast=false}) {
    return new Promise((resolve, reject) => {

      let base_url = `${BASE_URL}/task?complete=${complete}`

      if(uuid) {
        base_url += `&uuid=${uuid}`
      }

      if(broadcast) {
        base_url += `&broadcast=${broadcast}`
      }

      Axios({url: base_url, method: 'GET'})
      .then(resp => {
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  }
}

export default new Vuex.Store({
  state,
  mutations,
  actions,
  getters,
  plugins: [createPersistedState({
    key: 'reflex-state',
    paths: ['observable_filters','case_filters','intel_filters','current_user','case_templates','quick_filters']
  })]
})