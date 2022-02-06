<template>
  <div>
    <CRow>
      <CCol col>
        <div style="padding: 10px;">
          <CRow>
            <CCol>
              <CButton v-if="current_user.role.permissions.add_role" color="primary" @click="newRole()">New Role</CButton>
            </CCol>
            <CCol col=4>
              <CSelect v-if="current_user.default_org" :horizontal="{label: 'col-sm-4', input: 'col-sm-8'}" label="Filter by Organization:" class="text-right" :options="organizationList(false)" @change="filterByOrganization($event)"/>
            </CCol>
          </CRow>
        </div>
        <CDataTable
          :hover="hover"
          :striped="striped"
          :bordered="bordered"
          :small="small"
          :fixed="fixed"
          :items="roles"
          :fields="fields"
          :items-per-page="small ? 25 : 10"
          :dark="dark"
          :sorter="{external: false, resetable: true}"
          :loading="loading"
          pagination
          style="border-top: 1px solid #cfcfcf;"
        >
          <template #name="{item}">
            <td>
              {{item.name}}
            </td>
          </template>
          <template #organization="{item}">
            <td>
              <OrganizationBadge :uuid="item.organization"></OrganizationBadge>            
            </td>
          </template>
          <template #user_count="{item}">
            <td>
              {{item.members ? item.members.length : 0}}
            </td>
          </template>
          <template #created_by="{item}">
            <td>
              {{item.created_by.username ? item.created_by.username : 'System'}}<OrganizationBadge v-if="current_user.default_org" :uuid="item.created_by.organization"/>
            </td>
          </template>
          <template #created_at="{item}">
            <td>
              {{ item.created_at | moment('from','now')}}
            </td>
          </template>
          <template #actions="{item}">
            <td class="text-right">
              <CButton :disabled="!current_user.role.permissions.add_role" size="sm" color="secondary" @click="cloneRole(item.uuid)"><CIcon name="cil-copy"/></CButton>&nbsp;
              <CButton :disabled="!current_user.role.permissions.update_role" size="sm" color="primary" @click="editRole(item.uuid)"><CIcon name="cilPencil"/></CButton>&nbsp;
              <CButton :disabled="!current_user.role.permissions.delete_role" size="sm" color="danger" @click="promptDelete(item.uuid)"><CIcon name="cilTrash"/></CButton>
            </td>
          </template>
        </CDataTable>
      </CCol>
    </CRow>
    <CModal size="xl" :closeOnBackdrop="false" :centered="true" :title="modal_mode == 'create' ? 'Create Role' : 'Edit Role'" :show.sync="role_modal">
        <h3>Role Details</h3>
        <CSelect v-if="current_user.default_org" label="Organization" :options="organizationList()" :value.sync="role.organization"/>
        <CInput label="Role Name" placeholder="Enter a name for this role" :value.sync="role.name"/>
        <CTextarea rows="3" label="Description" placeholder="Enter a description for the role so it is understood what it is used for" :value.sync="role.description"/>
        <h3>Role Permissions</h3>
        <div v-if="role.permissions" >
          <CRow v-for="permissions, category in filteredPermissionMap" :key="category">
            <CCol col="12">
              <h5>{{category}}</h5>
            </CCol>
            <CCol col="3" v-for="permission in permissions" :key="permission">
              <CRow>
                <CCol col="3">
                  <CSwitch size="sm" :checked.sync="role.permissions[permission]" label-on="Yes" label-off="No" color="success"/>
                </CCol>
                <CCol>
                  <label style="text-transform: capitalize;">{{permission.replaceAll('_',' ')}}</label>
                </CCol>
              </CRow>
            </CCol>
            <br><br>
          </CRow>
        </div>
        <!--<CRow>
          <CCol col="3" v-for="value, permission in role.permissions" :key="permission">
            <CRow v-if="['add_organization','view_organizations','update_organization','delete_organization'].includes(permission) && role.organization === current_user.organization && current_user.default_org">
              <CCol col=3>
                <CSwitch size="sm" :checked.sync="role.permissions[permission]" label-on="Yes" label-off="No" color="success"/>
              </CCol>
              <CCol>
                <label style="text-transform: capitalize;">{{permission.replaceAll('_',' ')}}</label>
              </CCol>              
            </CRow>
            <CRow v-else-if="!['add_organization','view_organizations','update_organization','delete_organization'].includes(permission)">
              <CCol col=3>
                <CSwitch size="sm" :checked.sync="role.permissions[permission]" label-on="Yes" label-off="No" color="success"/>
              </CCol>
              <CCol>
                <label style="text-transform: capitalize;">{{permission.replaceAll('_',' ')}}</label>
              </CCol>              
            </CRow>
          </CCol>
        </CRow>-->
      <template #footer>
        <CButton @click="dismiss()" color="secondary">Dismiss</CButton>
        <CButton v-if="modal_mode === 'edit'" @click="updateRole()" color="primary">Edit</CButton>
        <CButton v-if="modal_mode === 'create'" @click="createRole()" color="primary">Create</CButton>
      </template>
    </CModal>
  </div>
</template>

<script>
import { mapState } from "vuex";
import OrganizationBadge from "./OrganizationBadge"
export default {
  name: "RoleList",
  components: {
    OrganizationBadge
  },
  props: {
    items: Array,
    fields: {
      type: Array,
      default() {
        return [
          "name",
          "description",
          "user_count",
          "created_by",
          "created_at",
          "actions"
        ];
      },
    },
    caption: {
      type: String,
      default: "Table",
    },
    hover: Boolean,
    striped: Boolean,
    bordered: Boolean,
    small: Boolean,
    fixed: Boolean,
    dark: Boolean,
    alert: false,
  },
  created: function () {
    this.loading = true
    if(this.current_user.default_org) {
      this.fields.splice(1,0,'organization')
      this.$store.dispatch('getOrganizations').then(resp => {
        
      })
    }
    this.$store.dispatch('getRoles').then(resp => {
      this.loading = false
    })
    
  },
  computed: {
    filteredPermissionMap() {

      if(this.role.organization === this.current_user.organization && this.current_user.default_org) {
        return this.permission_map
      } else {
        return Object.fromEntries(Object.entries(this.permission_map).filter(([key]) => key !== "Organizations"))
        //return this.permission_map.filter(category => category !== "Organizations")
      }
    },
    ...mapState(['roles','organizations','current_user'])
  },
  methods: {
    newRole() {
      Object.assign(this.role, this.empty_role)
      this.modal_mode = 'create'
      this.role_modal = true
    },
    filterByOrganization(event) {
      this.loading = true
      this.$store.dispatch('getRoles', event.target.value).then(() => {
        this.loading = false
      })
    },
    promptDelete(uuid) {
      console.log(uuid)
    },
    cloneRole(uuid) {
      Object.assign(this.role, this.roles.find(role => role.uuid === uuid))
      this.role.uuid = ''
      this.role.organization = ''
      delete this.role.members
      delete this.role.created_at
      delete this.role.created_by
      this.role.name = '[COPY] '+this.role.name
      this.modal_mode = 'create'
      this.role_modal = true
    },
    editRole(uuid) {
      Object.assign(this.role, this.roles.find(role => role.uuid === uuid))
      this.modal_mode = 'edit'
      this.role_modal = true
    },
    createRole() {
      this.$store.dispatch('createRole', this.role).then(resp => {
        this.dismiss()
      })
    },
    updateRole() {
      let uuid = this.role.uuid
      
      delete this.role.uuid
      delete this.role.members
      delete this.role.created_at
      delete this.role.created_by
      
      this.role.permissions = Object.fromEntries(Object.entries(this.role.permissions).filter(([_, v]) => v != null));
      this.$store.dispatch('updateRole', {uuid: uuid, data: this.role}).then(resp => {
        this.dismiss()
      })
    },
    organizationList(no_all=true) {
      let org_list = this.organizations.map(item => { return {'label': item.name, 'value': item.uuid}})
      if(no_all) {
        return org_list
      }
      return [{'label':'All Organizations', 'value': null}, ...org_list]
    },
    orgName(uuid) {
      return this.$store.getters.org_name(uuid)
    },
    dismiss() {
      this.role_modal = false
      this.role = {}
    }
  },
  data() {
    return {
      loading: true,
      role_modal: false,
      modal_mode: 'create',
      role: {},
      empty_role: {
        name: '',
        description: '',
        organization: '',
        members: [],
        permissions: {
          add_user: false,
          update_user: false,
          delete_user: false,
          add_user_to_role: false,
          remove_user_from_role: false,
          reset_user_password: false,
          unlock_user: false,
          view_users: false,
          add_role: false,
          update_role: false,
          delete_role: false,
          set_role_permissions: false,
          view_roles: false,
          create_user_group: false,
          view_user_groups: false,
          update_user_groups: false,
          delete_user_group: false,
          add_event: false,
          view_events: false,
          view_case_events: false,
          update_event: false,
          delete_event: false,
          create_event_rule: false,
          view_event_rules: false,
          update_event_rule: false,
          delete_event_rule: false,
          add_observable: false,
          update_observable: false,
          delete_observable: false,
          add_tag_to_observable: false,
          remove_tag_from_observable: false,
          add_playbook: false,
          update_playbook: false,
          delete_playbook: false,
          view_playbooks: false,
          add_tag_to_playbook: false,
          remove_tag_from_playbook: false,
          add_agent: false,
          view_agents: false,
          update_agent: false,
          delete_agent: false,
          pair_agent: false,
          add_agent_group: false,
          view_agent_groups: false,
          update_agent_group: false,
          delete_agent_group: false,
          add_input: false,
          view_inputs: false,
          update_input: false,
          delete_input: false,
          add_tag: false,
          update_tag: false,
          delete_tag: false,
          view_tags: false,
          create_case: false,
          view_cases: false,
          update_case: false,
          delete_case: false,
          upload_case_files: false,
          view_case_files: false,
          delete_case_files: false,
          create_case_task: false,
          view_case_tasks: false,
          update_case_task: false,
          delete_case_task: false,
          create_case_template: false,
          view_case_templates: false,
          update_case_template: false,
          delete_case_template: false,
          create_case_template_task: false,
          view_case_template_tasks: false,
          update_case_template_task: false,
          delete_case_template_task: false,
          create_case_comment: false,
          view_case_comments: false,
          update_case_comment: false,
          delete_case_comment: false,
          create_case_status: false,
          update_case_status: false,
          delete_case_status: false,
          create_close_reason: false,
          update_close_reason: false,
          delete_close_reason: false,
          view_plugins: false,
          create_plugin: false,
          delete_plugin: false,
          update_plugin: false,
          add_credential: false,
          update_credential: false,
          decrypt_credential: false,
          delete_credential: false,
          view_credentials: false,
          add_organization: false,
          view_organizatons: false,
          update_organization: false,
          delete_organization: false,
          add_list: false,
          update_list: false,
          view_lists: false,
          delete_list: false,
          create_data_type: false,
          update_data_type: false,
          update_settings: false,
          view_settings: false,
          create_persistent_pairing_token: false,
        }
      },
      permission_map: {
        'User Administration': [
          'add_user',
          'update_user',
          'delete_user',
          'add_user_to_role',
          'remove_user_from_role',
          'reset_user_password',
          'unlock_user',
          'view_users',
        ],
        "Role Administration": [
          'add_role',
          'update_role',
          'delete_role',
          'set_role_permissions',
          'view_roles'
        ],
        "User Groups": [
          'create_user_group',
          'view_user_groups',
          'update_user_groups',
          'delete_user_group',
        ],
        "Events": [
          'add_event',
          'view_events',
          'view_case_events',
          'update_event',
          'delete_event',
        ],
        "Event Rules": [
          'create_event_rule',
          'view_event_rules',
          'update_event_rule',
          'delete_event_rule',
        ],
        "Observables": [
          'add_observable',
          'update_observable',
          'delete_observable',
          'add_tag_to_observable',
          'remove_tag_from_observable',
        ],
        /*"Playbooks": [
          'add_playbook',
          'update_playbook',
          'delete_playbook',
          'view_playbooks',
          'add_tag_to_playbook',
          'remove_tag_from_playbook',
        ],*/
        "Agents": [
          'add_agent',
          'view_agents',
          'update_agent',
          'delete_agent',
          'pair_agent',
          'add_agent_group',
          'view_agent_groups',
          'update_agent_group',
          'delete_agent_group',
        ],
        "Inputs": [
          'add_input',
          'view_inputs',
          'update_input',
          'delete_input',
        ],
        "Case Management": [
          'create_case',
          'view_cases',
          'update_case',
          'delete_case',
          'upload_case_files',
          'view_case_files',
          'delete_case_files',
          'create_case_task',
          'view_case_tasks',
          'update_case_task',
          'delete_case_task',
          'create_case_template',
          'view_case_templates',
          'update_case_template',
          'delete_case_template',
          'create_case_template_task',
          'view_case_template_tasks',
          'update_case_template_task',
          'delete_case_template_task',
          'create_case_comment',
          'view_case_comments',
          'update_case_comment',
          'delete_case_comment',
          'create_case_status',
          'update_case_status',
          'delete_case_status',
        ],
        "Closure Reasons": [
          'create_close_reason',
          'update_close_reason',
          'delete_close_reason',
        ],
        /*"Plugins": [
          'view_plugins',
          'create_plugin',
          'delete_plugin',
          'update_plugin',
        ],*/
        "Credentials": [
          'add_credential',
          'update_credential',
          'decrypt_credential',
          'delete_credential',
          'view_credentials',
        ],
        "Organizations": [
          'add_organization',
          'view_organizations',
          'update_organization',
          'delete_organization',
        ],
        "Intel Lists": [
          'add_list',
          'update_list',
          'view_lists',
          'delete_list',
        ],
        "Data Types": [
          'create_data_type',
          'update_data_type',
        ],
        "Settings": [
          'update_settings',
          'view_settings',
          'create_persistent_pairing_token',
        ],
        "API": [
          'use_api'
        ]
      }
    };
  }
};
</script>
