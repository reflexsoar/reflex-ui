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
  user: {},
  credentials: [],
  credential: {},
  events: [],
  event: {},
  cases: [],
  case: {},
  case_templates: [],
  case_template: {},
  unread_event_count: 0,
  agents: [],
  agent: {},
  agent_groups: [],
  agent_group: {},
  pairing_token: "",
  users: [],
  user: {},
  roles: [],
  role: {},
  playbooks: [],
  playbook: {},
  plugins: [],
  plugin: {},
  plugin_configs: [],
  plugin_config: {},
  inputs:[],
  input:{},
  orguuid: '',
  tag_list: [],
  credential_list: []
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
  auth_success(state, access_token, refresh_token, user) {
    state.status = 'success'
    state.access_token = access_token
    state.refresh_token = refresh_token
    state.user = user
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
  refresh_success(state, access_token, refresh_token) {
    state.status = 'success'
    state.access_token = access_token
    state.refresh_token = refresh_token
  },
  save_credentials(state, credentials){
    state.credentials = credentials
  },
  save_playbooks(state, credentials){
    state.playbooks = credentials
  },
  save_events(state, events) {
    state.events = events
    state.unread_event_count = events.length
  },
  save_event(state, event) {
    state.event = event
  },
  save_agents(state, agents) {
    state.agents = agents
  },
  save_agent(state, agent) {
    state.agent = agent
  },
  save_agent_group(state, agent_group) {
    state.agent_group = agent_group
  },
  save_agent_groups(state, agent_groups) {
    state.agent_groups = agent_groups
  },
  save_users(state, users) {
    state.users = users
  },
  save_user(state, user) {
    state.user = user
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
  addStatus: state => state.status
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
        const user = resp.data.user
        localStorage.setItem('access_token', access_token)
        localStorage.setItem('refresh_token', refresh_token)
        Axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
        commit('auth_success', access_token, refresh_token, user)
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
        const user = resp.data.user
        localStorage.setItem('access_token', access_token)
        localStorage.setItem('refresh_token', refresh_token)
        Axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
        commit('refresh_success', access_token, refresh_token)
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
  getTags({commit}) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/tag`, method: 'GET'})
      .then(resp => {
        commit('tags_success', resp.data)
        resolve(resp)
      })
      .catch(err => {
        commit('tags_error')
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
  getEvents({commit}) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/event`, method: 'GET'})
      .then(resp => {
        commit('save_events', resp.data)
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
  }
}

export default new Vuex.Store({
  state,
  mutations,
  actions,
  getters
})