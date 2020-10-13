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
          :sorter='{external: true, resetable: true}'
          style="border-top: 1px solid #cfcfcf;"
      >
      <template #name="{item}">
          <td>
              {{item.name}}
          </td>
      </template>
      <template #actions="{item}">
        <td>
          <CButton @click="editAgentGroup(item.uuid)" color="secondary" size="sm"><CIcon name='cilPencil'/></CButton>
        </td>
      </template>
    </CDataTable>
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
    computed: mapState(['agent_group','agent_groups']),
    created: function () {
        this.loadData()
    },
    data(){
      return {
        name: "",
        description: "",
        url: "",
        agentGroupModal: false,
        dismissCountDown: 10,
        loading: true,
        modal_title: "New Agent Group",
        modal_action: this.createAgentGroup,
        modal_button_text: "Create",
        target_agent_group: "",
        pagination: {}
      }
    },
    methods: {
      newAgentGroup() {
          this.modal_title = "New Agent Group"
          this.modal_action = this.createAgentGroup
          this.modal_button_text = "Create"
          this.name = ""
          this.description = ""
          this.agentGroupModal = true
      },
      createAgentGroup: function () {
        let name = this.name
        let description = this.description
        this.$store.dispatch('createAgentGroup', { name, description })
        .then(resp => {
          this.agentGroupModal = false
        })
      },
      updateAgentGroup() {
        console.log(this.name, this.description, this.target_agent_group)
        let uuid = this.target_agent_group
        let data = {
          name: this.name,
          description: this.description
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
          this.description = this.agent_group.description
          this.target_agent_group = uuid
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
        this.$store.dispatch('getAgentGroups').then(resp => {
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
