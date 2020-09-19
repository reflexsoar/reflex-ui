<template>
  <CRow>
    <CCol col v-if="loading">
        <div style="margin: auto; text-align:center; verticle-align:middle;">
           <CSpinner
                color="dark"
                style="width:6rem;height:6rem;"
            />  
        </div>
    </CCol>
    <CCol col v-else>
          <div style="padding: 10px;"><CButton color="primary" @click="generateToken()">New Agent</CButton></div>
              <CDataTable
                  :hover="hover"
                  :striped="striped"
                  :bordered="bordered"
                  :small="small"
                  :fixed="fixed"
                  :items="inputs"
                  :fields="fields"
                  :items-per-page="small ? 25 : 10"
                  :dark="dark"
                  :sorter='{external: true, resetable: true}'
                  pagination
                  style="border-top: 1px solid #cfcfcf;"
              >
              <template #name="{item}">
                  <td>
                      <router-link :to="`${item.uuid}`">{{item.name}}</router-link>
                  </td>
              </template>
              <template #inputs="{item}">
                  <td>
                    {{item.inputs.length}}
                  </td>
              </template>
              <template #roles="{item}">
                  <td>
                    <li style="display: inline; margin-right: 2px;" v-for="role in item.roles" :key="role.name"><CButton color="primary" size="sm" disabled>{{ role.name }}</CButton></li>
                  </td>
              </template>
              <template #active="{item}">
                <td>
                  <CButton :color="getStatus(item.active)" size="sm" disabled>{{item.active | getStatusText }}</CButton>
                </td>
              </template>
              <template #last_heartbeat="{item}">
                <td>
                  {{item.last_heartbeat | moment('from', 'now')}}
                </td>
              </template>
              
              </CDataTable>

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
export default {
    name: 'Agents',
    props: {
    items: Array,
    fields: {
      type: Array,
      default () {
        return ['name', 'roles', 'inputs', 'ip_address', 'active', 'last_heartbeat']
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
    created: function () {
      this.current_url = window.location.origin;
      this.loadData()
      this.refresh = setInterval(function() {
        this.loadData()
      }.bind(this), 60000)
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
        loading: true
      }
    },
    methods: {
      addSuccess: function() {
        if (this.$store.getters.addSuccess == 'success') {
          return true
        } else {
          return false
        }
      },
      loadData: function() {
        this.loading = true
        this.$store.dispatch('getAgents').then(resp => {
            this.inputs = resp.data
            this.loading = false
        })
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
      clearInterval(this.refresh)
    }
}
</script>
