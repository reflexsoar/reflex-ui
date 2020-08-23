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
  organizations: [],
  organization: {},
  playbooks: [],
  playbook: {},
  orguuid: '',
  tags: []
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
  save_organizations(state, organizations){
    state.organizations = organizations
  },
  save_playbooks(state, organizations){
    state.playbooks = organizations
  },
  save_organization(state, organization) {
    state.organization = organization
  },
  save_playbook(state, playbook) {
    state.playbook = playbook
  },
  add_organization(state, organization){
    state.organizations.push(organization)
    state.organization = organization
    state.status = 'success'
  },
  add_playbook(state, playbook){
    state.playbooks.push(playbook)
    state.playbook = playbook
    state.status = 'success'
  },
  add_success(state) {
    state.status = 'success'
  },
  add_start(state) {
    state.status = 'loading'
  },
  tags_success(state, tags) {
    state.tags = tags
  },
  tags_error(state) {
    state.tags = []
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

const BASE_URL = 'http://localhost:5000'

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
  getOrganizations({commit}) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/organization`, method: 'GET'})
      .then(resp => {
        commit('save_organizations', resp.data)
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
        commit('add_organization', organization)
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
  addTagsToOrganization({commit}, postData) {
    return new Promise((resolve, reject) => {
      Axios({url: `${BASE_URL}/organization/${postData.uuid}/bulktag`, data: postData.data, method: 'POST'})
      .then(resp => {
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