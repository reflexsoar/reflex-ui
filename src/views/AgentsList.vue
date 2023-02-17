<template>
  <CRow>
    <CCol col>
          <div style="padding: 10px;"><CButton color="primary" @click="generateToken()" >New Agent</CButton></div>
              <CDataTable
                  :hover="hover"
                  :striped="striped"
                  :bordered="bordered"
                  :small="small"
                  :items="filtered_agents"
                  :fields="fields"
                  :items-per-page="small ? 25 : 10"
                  :dark="dark"
                  :sorter='{external: false, resetable: true}'
                  :loading="loading"
                  :responsive="true"
                  style="border-top: 1px solid #cfcfcf;"
                  @update:sorter-value="sort($event)"
                  column-filter
                  pagination
                  :column-filter-value.sync="column_filters"
              >
              <template #organization-filter="{item}">
                <RMultiCheck :items="organizations" @checked="filter_organizations"></RMultiCheck>
              </template>
              <template #name="{item}">
                  <td>
                      <router-link :to="`${item.uuid}`">{{item.name}}</router-link>
                  </td>
              </template>
              <template #organization="{item}">
                <td>
                  <OrganizationBadge :uuid="item.organization"/>
                </td>
              </template>
              <template #inputs="{item}">
                  <td v-if="item.inputs">
                    {{totalInputs(item)}}
                  </td>
                  <td v-else>
                    0
                  </td>
              </template>
              <template #roles="{item}">
                  <td>
                    <li style="display: inline; margin-right: 2px;" v-for="role in item.roles" :key="role"><CButton color="primary" style="cursor: auto" size="sm" disabled>{{ role }}</CButton></li>
                  </td>
              </template>
              <template #version="{item}">
                  <td>
                      {{item.version ? item.version : "Unknown"}}
                  </td>
                </template>
              <template #last_heartbeat="{item}">
                <td>
                  <span v-if="item.last_heartbeat">{{ item.last_heartbeat | moment('from','now')}}</span>
                  <span v-else>Never</span>
                </td>
              </template>
              <template #healthy="{item}">
                <td>
                  <CButton v-if="item.healthy" style="cursor: auto" color="success" size="sm">Healthy</CButton>
                  <CButton v-else style="cursor: auto" color="warning" size="sm">Unhealthy</CButton>
                </td>
              </template>
              <template #health_issues="{item}">
                <td>
                  <li style="display: inline; margin-right: 2px;text-transform: capitalize" v-for="issue in item.health_issues" :key="issue"><CBadge color="warning">{{issue}}</CBadge></li>
                </td>
              </template>              
              </CDataTable>
              <CRow>
            </CRow>

    </CCol>
    <CModal
      title="Agent Pairing Token"
      color="dark"
      :centered="true"
      size="lg"
      :show.sync="pairingModal"
    >
      <div class="text-center">
        <h4>Pairing Token</h4>
        Copy the command below to pair a new agent
        <pre class='text-white bg-dark text-left prewrap' style="padding: 10px; border-radius: 5px;">python reflex-agent.py --pair --token "{{pairingToken}}" --console {{current_url}} --roles poller,runner</pre>
      </div>
    </CModal>
  </CRow>  
</template>


<script>
import {mapState} from "vuex";
import RMultiCheck from './components/MultiCheck.vue';
import OrganizationBadge from './OrganizationBadge'
export default {
    name: 'Agents',
    components: {
      OrganizationBadge,
      RMultiCheck
    },
    props: {
    items: Array,
    fields: {
      type: Array,
      default () {
        return ['name', 'roles', 'inputs', 'ip_address', 'version', {key: 'last_heartbeat', filter: false}, 'healthy', 'health_issues']
      }
    },
    caption: {
      type: String,
      default: 'Table'
    },
    hover: Boolean,
    striped: Boolean,
    bordered: Boolean,
    small: Boolean,
    fixed: Boolean,
    dark: Boolean,
    alert: false
    },
    computed: {
      ...mapState(['current_user','agents','pagination']),
      filtered_agents() {
        if (this.org_filter.length == 0) {
          return this.agents
        } else {
          return this.agents.filter((agent) => {
            return this.org_filter.includes(agent.organization)
          })
        }
      }
    },
    created: function () {
      this.current_url = window.location.origin;
      this.loadData()
      //this.refresh = setInterval(function() {
      //  this.loadData()
      //}.bind(this), 60000)
    },
    data(){
      return {
        name: "",
        current_url: "",
        description: "",
        url: "",
        pairingModal: false,
        pairingToken: "Failed to load pairing token",
        orgs: Array,
        dismissCountDown: 10,
        loading: true,
        organizations: [],
        active_page: 1,
        sort_by: 'created_at',
        sort_direction: 'desc',
        org_filter: [],
        column_filters: {}
      }
    },
    watch: {
      active_page: function() {
        this.reloadAgents(this.active_page)
      }
    },
    methods: {
      sort(event) {
        this.sort_direction = event.asc ? 'asc' : 'desc'
        this.sort_by = event.column ? event.column : 'created_at'
        this.reloadAgents(this.active_page)
      },
      reloadAgents(page) {
        this.loading = true
        this.$store.dispatch('getAgents', {page: page, sort_by: this.sort_by, sort_direction: this.sort_direction}).then(() => {
          this.loading = false
        })
      },
      addSuccess: function() {
        if (this.$store.getters.addSuccess == 'success') {
          return true
        } else {
          return false
        }
      },
      loadData: function() {
        if(this.current_user.default_org) {
          if (!this.fields.includes('organization')) {
            this.fields.splice(1,0,{key:'organization', filterable: false, sorter: false})
          }
          if(this.$store.getters.organizations.length == 0) {
            this.$store.dispatch('getOrganizations', {}).then(() => {
              this.organizations = this.$store.getters.organizations.map((o) => { return {label: o.name, value: o.uuid}})
            })
          } else {
            this.organizations = this.$store.getters.organizations.map((o) => { return {label: o.name, value: o.uuid}})
          }
        }
        this.loading = true
        this.$store.dispatch('getAgents', {page_size: 10000}).then(() => {
            this.loading = false
        })
      },
      totalInputs(item) {

        let inputs = item.inputs.map(item => { return item.uuid })
        for(let g in item.groups) {
          let group_inputs = item.groups[g].inputs.map(item => { return item.uuid })
          inputs = [...inputs, ...group_inputs]
        }
        inputs = [...new Set(inputs)]
        return inputs.length

      },
      getStatus(status) { 
        switch (status) {
          case true: return 'success'
          case false: return 'danger'
          default: 'primary'
        }
      },
      generateToken() {
        this.pairingModal = true
        this.$store.dispatch('getPairingToken').then(resp => {
          this.pairingToken = resp.data
        })
      },
      mapOrgToName(uuid) {
        let org = this.$store.getters.organizations.filter(o => o.uuid === uuid)
        if (org.length > 0) {
          return org[0].name
        } else {
          return "Unknown"
        }
      },
      filter_organizations(val) {
        if(val === null) {
          this.org_filter = []
          return
        }        
        if (this.org_filter.includes(val)) {
          this.org_filter = this.org_filter.filter(o => o !== val)
        } else {
          this.org_filter.push(val)
        }
      }
    },
    filters: {
      getStatusText(status) {
        switch (status) {
          case true: return 'Active'
          case false: return 'Inactive'
          default: 'Inactive'
        }
      }
    },
    beforeDestroy: function() {
      //clearInterval(this.refresh)
    }
}
</script>
