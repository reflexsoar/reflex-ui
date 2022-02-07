<template>
  <CRow><link rel="stylesheet" href="https://unpkg.com/vue-multiselect@2.1.0/dist/vue-multiselect.min.css">
    <CCol col>
      <div style="padding: 10px;"><CButton color="primary" @click="newAgentGroup()">New Agent Group</CButton></div>
      <CDataTable
          :hover="hover"
          :striped="striped"
          :bordered="bordered"
          :small="small"
          :fixed="fixed"
          :items="agent_groups"
          :fields="fields"
          :items-per-page="small ? 25 : 10"
          :dark="dark"
          :loading="loading"
          :sorter='{external: true, resetable: true}'
          style="border-top: 1px solid #cfcfcf;"
      >
      <template #name="{item}">
          <td>
              {{item.name}}
          </td>
      </template>
      <template #organization="{item}">
                <td>
                  <CButton class="tag" size="lg" color="secondary">{{mapOrgToName(item.organization)}}</CButton>
                </td>
              </template>
      <template #actions="{item}">
        <td>
          <CButton @click="editAgentGroup(item.uuid)" color="secondary" size="sm"><CIcon name='cilPencil'/></CButton>
        </td>
      </template>
    </CDataTable>
    <CRow>
      <CCol>
        <CCardBody>
          <CPagination :activePage.sync="active_page" :pages="pagination.pages"/>
        </CCardBody>
      </CCol>
    </CRow>
    </CCol>
    <CModal
      :title="modal_title"
      color="dark"
      :centered="true"
      size="lg"
      :show.sync="agentGroupModal"
    >
      <div>
        <CForm @submit.prevent="modal_action" >
            <p class="text-muted">Fill out the form below to create a new agent group. Agent Groups allow you to group agents into collections that plugins can use to target certain agents.</p>
            <CSelect
              v-if="current_user.default_org"
              placeholder="Select an Organization..."
              required
              :value.sync="organization"
              :options="formattedOrganizations()"
              @change="refreshInputs($event)"
              label="Organization"
            />
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
            
            <div v-if="modal_button_text == 'Edit'"><multiselect :close-on-select="false" v-model="inputs" placeholder="Select inputs to be used by this agent" track-by="uuid" label="name" :options="input_list" :multiple="true"></multiselect></div>
            <div v-else><multiselect :close-on-select="false" v-model="inputs" placeholder="Select inputs to be used by this agent" track-by="uuid" label="name" :options="input_list" :multiple="true"></multiselect></div>
            <CRow>
              <CCol col="12" class="text-right">
                
              </CCol>
            </CRow>
        </CForm>
      </div>
      <template #footer>
        <CButton @click="agentGroupModal = false" color="secondary">Dismiss</CButton>
        <CButton @click="modal_action" class="px-4" type="submit" color="primary">{{modal_button_text}}</CButton>
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
        return ['name', 'description', 'agent_count','actions']
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
    computed: mapState(['current_user','agent_group','agent_groups','organizations', 'pagination']),
    created: function () {
        if(this.current_user.default_org) {
          if (!this.fields.includes('organization')) {
            this.fields.splice(1,0,'organization')
            
          }
          //this.organizations = this.$store.getters.organizations.map((o) => { return {label: o.name, value: o.uuid}})
        }
        this.loadData()
    },
    data(){
      return {
        name: "",
        description: "",
        url: "",
        organization: "",
        inputs: [],
        agentGroupModal: false,
        dismissCountDown: 10,
        loading: true,
        modal_title: "New Agent Group",
        modal_action: this.createAgentGroup,
        modal_button_text: "Create",
        target_agent_group: "",
        input_list: [],
        active_page: 1
      }
    },
    watch: {
      active_page: function() {
        this.reloadGroups(this.active_page)
      }
    },
    methods: {
      reloadGroups(page){
        this.loading = true
        this.$store.dispatch('getAgentGroups', {page: page}).then(() => {
          this.loading = false
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
      refreshInputs(event) {
        let organization = this.organization
        
        if (event) {
          let organization = event.target.value
        }
          
        this.$store.dispatch('getInputList', {organization: organization}).then(resp => {
          this.input_list = this.$store.getters.inputs.map(item => { return {'name': item.name, 'uuid': item.uuid }})
        })
      },
      formattedOrganizations() {
        return this.organizations.map((o) => { return {label: o.name, value: o.uuid}})
      },
      newAgentGroup() {
          this.modal_title = "New Agent Group"
          this.modal_action = this.createAgentGroup
          this.modal_button_text = "Create"
          this.name = ""
          this.description = ""
          this.organization = null
          this.inputs = []
          this.agentGroupModal = true
      },
      createAgentGroup: function () {
        let name = this.name
        let description = this.description
        let organization = this.organization
        let inputs = this.inputs
        this.$store.dispatch('createAgentGroup', { name, description, organization, inputs })
        .then(resp => {
          this.agentGroupModal = false
        })
      },
      updateAgentGroup() {
        let uuid = this.target_agent_group
        let data = {
          name: this.name,
          description: this.description,
          organization: this.organization,
          inputs: this.inputs

        }
        this.$store.dispatch('updateAgentGroup', {uuid, data}).then(resp => {
          this.agentGroupModal = false
        })
      },
      editAgentGroup(uuid) {         
        this.$store.dispatch('getAgentGroup', uuid).then(resp => {
          this.modal_title = "Edit Agent Group"
          this.modal_action = this.updateAgentGroup
          this.modal_button_text = "Edit"
          this.name = this.agent_group.name
          this.organization = this.agent_group.organization
          this.description = this.agent_group.description
          this.inputs = this.agent_group.inputs
          this.target_agent_group = uuid
          this.refreshInputs()
          this.agentGroupModal = true
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
        this.$store.dispatch('getAgentGroups', {}).then(resp => {
          this.loading = false
        })
      },
      getStatus(status) { 
        switch (status) {
          case true: return 'success'
          case false: return 'danger'
          default: 'primary'
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
    }
}
</script>
