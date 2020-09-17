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
      <div style="padding: 10px;"><CButton color="primary" @click="showModal">New Agent Group</CButton></div>
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
    </CDataTable>

    </CCol>
    <CModal
      title="New Agent Group"
      color="dark"
      :centered="true"
      size="lg"
      :show.sync="agentGroupModal"
    >
      <div>
        <CForm @submit.prevent="createAgentGroup" >
                <p class="text-muted">Fill out the form below to create a new agent group. Agent Groups allow you to group agents into collections that plugins can use to target certain agents.</p>
                <CInput
                  placeholder="Group Name"
                  required
                  v-model="name"
                  label="Group Name"
                >
                </CInput>
                <CTextarea
                  placeholder="Enter a description for the input.  The more detail the better."
                  required
                  v-model="description"
                  label="Description"
                  rows=5
                >
                </CTextarea>
                <CRow>
                  <CCol col="12" class="text-right">
                    
                  </CCol>
                </CRow>
                
        </CForm>
      </div>
      <template #footer>
        <CButton @click="agentGroupModal = false" color="danger">Discard</CButton>
        <CButton @click="createAgentGroup" class="px-4" type="submit" color="primary">Create</CButton>
      </template>
    </CModal>
  </CRow>  
</template>

<script>
import {mapState} from "vuex";
export default {
    name: 'AgentGroups',
    props: {
    items: Array,
    fields: {
      type: Array,
      default () {
        return ['name', 'description', 'agent_count']
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
        this.loadData()
        this.refresh = setInterval(function() {
          this.loadData()
        }.bind(this), 60000)
    },
    data(){
      return {
        name: "",
        description: "",
        url: "",
        agentGroupModal: false,
        dismissCountDown: 10,
        loading: true
      }
    },
    methods: {
      createAgentGroup: function () {
        let name = this.name
        let description = this.description
        this.$store.dispatch('createAgentGroup', { name, description })
        .then(resp => {
          this.agentGroupModal = false
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
        this.loading = true
        this.$store.dispatch('getAgentGroups').then(resp => {
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
      showModal() {
        this.agentGroupModal = true
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
