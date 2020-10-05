import Vue from 'vue'
import Vuex from 'vuex'
import Axios from 'axios'
Vue.use(Vuex)

const state = {
  sidebarShow: 'responsive',
  sidebarMinimize: false,
  status: '',
  access_token: localStorage.getItem('access_token') || '',
  refresh_token: localStorage.getItem('refresh_token') || '',
  current_user: {
    'permissions': []
  },
  credentials: [],
  credential: {},
  events: [],
  event: {},
  cases: [],
  case: {},
  tags: {},
  tag: [],
  case_templates: [],
  case_template: {},
  case_statuses: [],
  case_status: {},
  case_tasks: [],
  case_task: {},
  case_history: [],
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
  users: [],
  user: {},
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
  plugin_configs: [],
  plugin_config: {},
  inputs:[],
  input:{},
  orguuid: '',
  tag_list: [],
  list: {},
  lists: [],
  credential_list: [],
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
  }
}

const mutations = {
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
  auth_success(state, data) {
    state.status = 'success'
    state.access_token = data['access_token']
    state.refresh_token = data['refresh_token']
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
      state.events = [...state.events.filter(e => e.uuid != evt.uuid), evt]
    }
  },
  save_event(state, event) {
    state.event = event
    state.events = [...state.events.filter(e => e.uuid != event.uuid), event]
  },
  save_lists(state, lists) {
    state.lists = lists
  },
  save_list(state, list) {
    state.list = list
  },
  add_list(state, list) {
    state.lists.push(list)
    state.list = list
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
  save_event_rule(state ,data) {
    state.event_rule = data
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
  save_tags(state, tags) {
    state.tags = tags
  },
  save_case_templates(state, templates) {
    state.case_templates = templates
  },
  save_case(state, c) {
    state.case = c
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
    state.observables = state.observables.map(o => o.uuid == observable.uuid ? observable : o)
  },
  save_agent_group(state, agent_group) {
    state.agent_group = agent_group
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
  remove_list(state, list) {
    state.list = {}
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
  save_credential(state, credential) {
    state.credential = credential
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
  save_input(state, input) {
    state.input = input
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
    state.agent_groups.push(agent_group)
    state.agent_group = agent_group
    state.status = 'success'
  },
  add_credential(state, credential){
    state.credentials.push(credential)
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
  remove_case(state, uuid) {
    state.cases = state.cases.filter(c => c.uuid != uuid)
    state.case = {}
  },
  add_case_task(state, task) {
    state.case_tasks.push(task)
    state.status = 'success'
  },
  add_case_template(state, data) {
    state.case_templates.push(data)
    state.case_template = data
    state.status = 'success'
    state.case_template_list.push({title:data.title, description:data.description, uuid:data.uuid, tags:data.tags, severity:data.severity, task_count: data.task_count, tlp:data.tlp})
    state.tags.concat(data.tags)
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
    state.inputs.push(input)
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
  }
}

const getters = {
  isLoggedIn: state => !!state.access_token,
  authStatus: state => state.status,
  addStatus: state => state.status,
  status: state => state.status,
  current_user: state => state.current_user,
  alert: state => state.alert,
  case_templates: state => state.case_templates,
  case_template_list: state => { return state.case_template_list },
  date_types: state => state.data_types,
  case_history: state => { return state.case_history },
  comments: state => { return state.comments},
  case_tasks: state => { return state.case_tasks },
  case_data: state => { return state.case },
  cases: state => { return state.cases },
  users: state => { return state.users },
  observables: state => { return state.observables },
  events: state => { return state.events },
  close_reasons: state => { return state.close_reasons },
  data_types_list: function() {
    return state.data_types.map(function(data_type) {
      var newDataType = {};
      newDataType['label'] = data_type.name;
      newDataType['value'] = data_type.uuid;
      return newDataType;
    })
  },
  user_has: function(permission) {
    return state => state.current_user.permissions.includes(permission)
  },
  tags: state => state.tags
}

const BASE_URL = location.protocol+'//'+window.location.hostname+'/api/v1.0'

const actions = {
  login({commit}, user) {
    return new Promise((resolve, reject) => {
      commit('auth_request')
      Axios({url: `${BASE_URL}/auth/login`, data: user, method: 'POST'})
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
  getDataTypes({commit}) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/data_type`, method: 'GET'})
      .then(resp => {
        commit('save_data_types', resp.data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getLists({commit}) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/list`, method: 'GET'})
      .then(resp => {
        commit('save_lists', resp.data)
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
        commit('remove_list')
        commit('show_alert', {message: 'Successfully deleted list.', 'type': 'success'})
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getInputs({commit}) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/input`, method: 'GET'})
      .then(resp => {
        commit('save_inputs', resp.data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getAgents({commit}) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/agent`, method: 'GET'})
      .then(resp => {
        commit('save_agents', resp.data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getAgentGroups({commit}) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/agent_group`, method: 'GET'})
      .then(resp => {
        commit('save_agent_groups', resp.data)
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
        commit('add_agent_group', agent_group)
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
  getCredentialList({commit}) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/credential`, method: 'GET'})
      .then(resp => {
        let credentials = []
        resp.data.forEach(cred => credentials.push({'value':cred.uuid, 'label':cred.name+" - "+cred.description}))
        commit('creds_success', credentials)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getInputList({commit}) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/input`, method: 'GET'})
      .then(resp => {
        let credentials = []
        resp.data.forEach(cred => credentials.push({'value':cred.uuid, 'label':cred.name}))
        commit('creds_success', credentials)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getCredentials({commit}, uuid) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/credential`, method: 'GET'})
      .then(resp => {
        commit('save_credentials', resp.data)
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
  createCredential({commit}, credential) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/credential/encrypt`, data: credential, method: 'POST'})
      .then(resp => {
        commit('add_credential', credential)
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
  getEvents({commit}, {signature=null, case_uuid, status=[], search, severity=[], page, tags=[], observables=[], page_size=25, grouped=true, fields=''}) {
    return new Promise((resolve, reject) => {

      let url = `${BASE_URL}/event?grouped=${grouped}`

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
        commit('show_alert', {message: `Successfully dismissed Event.`, 'type': 'success'})
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  dismissEvents({commit}, data) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/event/bulk_dismiss`, data: data, method: 'PUT'})
      .then(resp => {
        commit('save_multiple_events', resp.data)
        commit('show_alert', {message: `Successfully dismissed ${data.events.length} Events.`, 'type': 'success'})
        resolve(resp)
      })
      .catch(err => {
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
        console.log(err)
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
  getUsers({commit}) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/user`, method: 'GET'})
      .then(resp => {
        commit('save_users', resp.data)
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
      console.log(uuid)
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
      console.log(user)
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
  getRoles({commit}) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/role`, method: 'GET'})
      .then(resp => {
        commit('save_roles', resp.data)
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
  getCaseTemplateList({commit}, title) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/case_template?title=${title}`, method: 'GET', headers: {'X-Fields': 'uuid,title,description,tlp,severity,tags,task_count'}})
      .then(resp => {
        commit('save_case_template_list', resp.data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getCases({commit}, fields='') {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/case`, method: 'GET', headers: {'X-Fields': fields}})
      .then(resp => {
        commit('save_cases', resp.data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getCaseObservables({commit}, {uuid, page=1, page_size=25, observable=[], dataType=[], tags=[]}) {
    return new Promise((resolve, reject) => {
      
      let base_url = `${BASE_URL}/case/${uuid}/observables?page=${page}&page_size=${page_size}`

      if(observable.length > 0) {
        base_url += `&observables=${observables}`
      }

      if(dataType.length > 0) {
        base_url += `&dataType=${dataType}`
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
  updateObservable({commit}, {uuid, data}) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/observable/${uuid}`, data: data, method: 'PUT'})
      .then(resp => {
        commit('update_observable', resp.data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getCloseReasons({commit}) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/close_reason`, method: 'GET'})
      .then(resp => {
        commit('save_close_reasons', resp.data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getCasesByTitle({commit}, {title, fields='uuid,title,id,event_count,owner,severity'}) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/case?title=${title}`, method: 'GET', headers: {'X-Fields': fields}})
      .then(resp => {
        commit('save_cases', resp.data)
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
  getCaseStatus({commit}) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/case_status`, method: 'GET'})
      .then(resp => {
        commit('save_case_status', resp.data)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getUsersByName({commit}, username) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/user?username=${username}`, method: 'GET'})
      .then(resp => {
        commit('save_users', resp.data)
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
      Axios({url: `${BASE_URL}/case/${uuid}`, method: 'GET', headers: {'X-Fields':'id,uuid,title,tlp,description,status,owner,severity,observable_count,event_count,tags,case_template,created_at,created_by,modified_at,updated_by,close_reason,total_tasks,open_tasks'}})
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
  addEventsToCase({commit}, {uuid, events}) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/case/${uuid}/add_events`, data: events, method: 'PUT'})
      .then(resp => {
        commit('save_case', resp.data.case)
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
  updateCase({commit}, {uuid, data}) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/case/${uuid}`, data: data, method: 'PUT'})
      .then(resp => {
        commit('save_case', resp.data)
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
        commit('add_case_observables', resp.data.observables)
        resolve(resp)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  getSettings({commit}, uuid) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/settings`, method: 'GET'})
      .then(resp => {
        commit('add_start')
        commit('save_settings', resp.data)
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
  getPersistentPairingToken({commit}) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/settings/generate_persistent_pairing_token`, method: 'GET'})
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
  getters
})