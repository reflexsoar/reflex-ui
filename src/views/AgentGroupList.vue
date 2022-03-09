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
          @update:sorter-value="sort($event)"
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
        
        <td class='text-right'>
          <CButton @click="editAgentGroup(item.uuid)" color="info" size="sm"><CIcon name='cilPencil'/></CButton>&nbsp;
          <CButton @click="deleteGroupModal(item.uuid)" color="danger" size="sm"><CIcon name='cilTrash'/></CButton>
        </td>
      </template>
      <template #agent_count="{item}">
          <td>
            {{item.members? item.members.length : 0}}
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
        <CAlert :show.sync="error" color="danger" closeButton>
            {{error_message}}
        </CAlert>
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
            <div v-if="modal_button_text == 'Edit'"><multiselect :disabled="organization === null" :close-on-select="false" v-model="inputs" placeholder="Select inputs to be used by this agent" track-by="uuid" label="name" @search-change="searchInputs" :options="input_list" :multiple="true"></multiselect></div>
            <div v-else><multiselect :disabled="organization === null" :close-on-select="false" v-model="inputs" placeholder="Select inputs to be used by this agent" track-by="uuid" label="name" @search-change="searchInputs" :options="input_list" :multiple="true"></multiselect></div>
            <CRow>
              <CCol col="12" class="text-right">
                
              </CCol>
            </CRow>
        </CForm>
      </div>
      <template #footer>
        <CButton @click="dismiss()" color="secondary">Dismiss</CButton>
        <CButton @click="modal_action" class="px-4" type="submit" color="primary">{{modal_button_text}}</CButton>
      </template>
    </CModal>
    <CModal title="Delete Group" color="danger" :centered="true" :show.sync="delete_modal">
      <CForm id="deleteForm" @submit.prevent="deleteGroup(group.uuid)">
        Are you sure you want to delete <b>{{group.name}}</b>?   Type the groups name in the box below to confirm your intent.<br><br>
        <CForm id="delete-confirm">
          <CInput
            v-model="delete_confirm"
            label="Group Name"
            required
          ></CInput>
        </CForm>
      </CForm>
      <template #footer>
        <CButton @click="dismissDelete()" color="secondary">No</CButton>
        <CButton :disabled="delete_confirm != group.name" type="submit" form="deleteForm" color="danger">Yes</CButton>
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
        return ['name', {key: 'description', sorter:false}, {key:'agent_count', sorter:false},'actions']
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
    computed: mapState(['current_user','agent_group','agent_groups','organizations','input_list']),
    created: function () {
        if(this.current_user.default_org) {
          if (!this.fields.includes('organization')) {
            this.fields.splice(1,0,{key:'organization',sorter: false})
            
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
        organization: null,
        inputs: [],
        agentGroupModal: false,
        dismissCountDown: 10,
        loading: true,
        modal_title: "New Agent Group",
        modal_action: this.createAgentGroup,
        modal_button_text: "Create",
        target_agent_group: "",
        active_page: 1,
        error: false,
        error_message: "",
        pagination: {
          'pages': 1,
          'page_size': 10
        },
        group: {},
        delete_modal: false,
        delete_confirm: ''
      }
    },
    watch: {
      active_page: function() {
        this.reloadGroups(this.active_page)
      }
    },
    methods: {
      deleteGroup(uuid) {
        let group = this.agent_groups.find(user => user.uuid === uuid)
        if(group.name == this.delete_confirm) {
          this.$store.dispatch('deleteAgentGroup', group.uuid)
          this.delete_modal = false
        }        
      },
      dismissDelete() {
        this.delete_confirm = ''
        this.delete_modal = false
      },
      deleteGroupModal(uuid) {
        this.group = this.agent_groups.find(user => user.uuid === uuid)
        this.delete_modal = true
      },
      sort(event) {
        let sort_direction = event.asc ? 'asc' : 'desc'
        event.column = event.column ? event.column : 'created_at'
        this.reloadGroups(this.active_page, event.column, sort_direction)
      },
      dismiss() {
        this.name = ""
        this.description = ""
        this.inputs = []
        this.agentGroupModal = false
        this.error = false
        this.error_message = ""
      },
      reloadGroups(page, sort_by="created_at", sort_direction="asc"){
        this.loading = true
        this.$store.dispatch('getAgentGroups', {page: page, sort_by: sort_by, sort_direction: sort_direction}).then(resp => {
          this.pagination = resp.data.pagination
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
      searchInputs(name) {
        this.$store.dispatch('getInputList', {organization: this.organization, name: name})
      },
      refreshInputs(event) {
        let organization = this.organization
        
        if (event) {
          let organization = event.target.value
        }
          
        this.$store.dispatch('getInputList', {organization: organization, page_size: 5})
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
        let inputs = this.inputs.map(item => { return item.uuid })
        this.$store.dispatch('createAgentGroup', { name, description, organization, inputs })
        .then(resp => {
          this.error = false
          this.error_message = ""
          this.agentGroupModal = false
        }).catch(err => {
          this.error = true
          this.error_message = err.response.data.message
        })
      },
      updateAgentGroup() {
        let uuid = this.target_agent_group
        let data = {
          name: this.name,
          description: this.description,
          organization: this.organization,
          inputs: this.inputs.map(item => { return item.uuid })

        }
        this.$store.dispatch('updateAgentGroup', {uuid, data}).then(resp => {
          this.error = false
          this.error_message = ""
          this.agentGroupModal = false
        }).catch(err => {
          this.error = true
          this.error_message = err.response.data.message
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
          this.inputs = this.agent_group.inputs.map(item => { return {'name': item.name, 'uuid': item.uuid}})
          this.target_agent_group = uuid
          this.refreshInputs()
          this.error_message = ""
          this.agentGroupModal = false
          this.agentGroupModal = true
          
        }).catch(err => {
          this.error = true
          this.error_message = err.response.data.message
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
          this.pagination = resp.data.pagination
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
