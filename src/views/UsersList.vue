<template>
  <CRow>
    <CCol col>
      <div style="padding: 10px;" v-if="userHas('add_user')">
        <CButton  color="primary" @click="createUserModal()">New User</CButton>
      </div>
      <CDataTable
        :hover="hover"
        :striped="striped"
        :bordered="bordered"
        :small="small"
        :fixed="fixed"
        :items="users"
        :fields="fields"
        :items-per-page="small ? 25 : 10"
        :dark="dark"
        :loading="loading"
        :sorter="{external: true, resetable: true}"
        @update:sorter-value="sort($event)"
        style="border-top: 1px solid #cfcfcf; overflow-x:auto;"
      >
        <template #username="{item}">
          <td>
            {{item.username}}
          </td>
        </template>
        <template #role="{item}">
          <td>
            {{item.role.name}}
          </td>
        </template>
        <template #last_logon="{item}">
          <td v-if="!item.last_logon">
            Never
          </td>
          <td v-else>
            {{item.last_logon  | moment('from', 'now')}}
          </td>
        </template>
        <template #organization="{item}">
          <td>
            <OrganizationBadge :uuid="item.organization"/>
          </td>
        </template>
        <template #actions="{item}">
          <td style="max-width:150px" class="text-right">
            <CButton v-if="item.locked && userHas('unlock_user')" @click="unlockUserModal(item.uuid)" size="sm" color="warning" class="unlock" v-c-tooltip="{content: 'Unlock User', placement:'left'}"><CIcon name='cilLockUnlocked'/></CButton>&nbsp;
            <CButton v-if="userHas('update_user')" @click="editUserModal(item.uuid)" size="sm" color="info" v-c-tooltip="{content: 'Edit User', placement:'left'}"><CIcon name='cilPencil'/></CButton>&nbsp;
            <CButton v-if="userHas('delete_user')" @click="deleteUserModal(item.uuid)" size="sm" color="danger" v-c-tooltip="{content: 'Delete User', placement:'left'}"><CIcon name='cilTrash'/></CButton>&nbsp;
          </td>
        </template>
      </CDataTable>
      <CRow>
          <CCol>
            <CCardBody><CPagination :pages="pagination.pages" :activePage.sync="active_page"/></CCardBody>
          </CCol>
        </CRow>
    </CCol>
    
    <CModal :title="modal_title" :centered="true" size="lg" :show.sync="modal_status">
      <CAlert :show.sync="this.error" color="danger" closeButton>
            {{error_message}}
      </CAlert>
      <CForm @submit.prevent="modal_action()" id="userForm">
        <CSelect label="Organization" placeholder="Select an organization" v-if="current_user.default_org && modal_mode =='new'" :value.sync="user.organization" :options="organizations" @change="loadRoles(user.organization)"/>
        <CInput v-model="user.username" label="User Alias" placeholder="Enter a unique alias for the user" description="A user alias is used for quick referencing a user in comments, case assignment, and other places using @mentions." required/>
        <CRow>
          <CCol col="6">
            <CInput v-model="user.first_name" label="First Name" placeholder="John" required/>
          </CCol>
          <CCol col="6">
            <CInput v-model="user.last_name" label="Last Name" placeholder="Doe" required/>
          </CCol>
        </CRow>
        <CInput v-model="user.email" label="Email" placeholder="user@reflexsoar.com" required/>
        <CSelect :options="roles" required label="Role" :value.sync="user.role_uuid" placeholder="Select a role"/>
        <CInput v-model="user.password" type="password" label="Password" placeholder="Enter your desired password..." v-bind:required="modal_mode == 'new'"/>
        <CInput v-model="user.confirm_password"  type="password" label="Confirm Password" placeholder="Confirm password" v-bind:required="modal_mode == 'new'"/>
        <CRow>
          <CCol col="6">
            <label>User Locked?</label><br>
            <CSwitch color="danger" label-on="Yes" label-off="No" v-bind:checked.sync="user.locked"/>
          </CCol>
          <CCol col="6">
            <label>Multi-Factor</label><br>
            <CSwitch color="success" label-on="On" label-off="Off" @update:checked="toggleMFA(user.mfa_enabled, user.uuid)" v-bind:checked.sync="user.mfa_enabled"></CSwitch>
          </CCol>
        </CRow>
      </CForm>
      <template #footer>
        <CButton @click="dismiss()" color="secondary">Cancel</CButton>
        <CButton type="submit" form="userForm" color="primary">{{modal_submit_text}}</CButton>
      </template>
    </CModal>
    <CModal title="Unlock User" color="danger" :centered="true" :show.sync="unlock_modal">
      <CForm id="unlockForm" @submit.prevent="unlockUser(user.uuid)">
        Are you sure you want to unlock <b>{{user.username}}</b>?
      </CForm>
      <template #footer>
        <CButton @click="dismiss()" color="secondary">No</CButton>
        <CButton type="submit" form="unlockForm" color="danger">Yes</CButton>
      </template>
    </CModal>
    <CModal title="Delete User" color="danger" :centered="true" :show.sync="delete_modal">
      <CForm id="deleteForm" @submit.prevent="deleteUser(user.uuid)">
        Are you sure you want to delete <b>{{user.username}}</b>?   Type their username in the box below to confirm your intent.
        <CForm id="delete-confirm">
          <CInput
            v-model="delete_confirm"
            label="Username"
            required
          ></CInput>
        </CForm>
      </CForm>
      <template #footer>
        <CButton @click="dismiss()" color="secondary">No</CButton>
        <CButton type="submit" form="deleteForm" color="danger">Yes</CButton>
      </template>
    </CModal>
  </CRow>
  
</template>

<style scoped>
.unlock {
  font-weight: 700;
}
</style>

<script>
import { mapState } from "vuex";
import OrganizationBadge from './OrganizationBadge'
export default {
  name: "UsersList",
  components: {
    OrganizationBadge
  },
  props: {
    items: Array,
    fields: {
      type: Array,
      default() {
        return [
          {key:"username", label: "User Alias"},
          "first_name",
          "last_name",
          "email",
          {key: "role", sorter:false},
          "last_logon",
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
    alert: false
  },
  created: function () {
    this.loadData();
    this.loadRoles(this.current_user.organization);
  },
  data() {
    return {
      loading: true,
      newUserModal: false,
      delete_modal: false,
      modal_action: null,
      modal_status: false,
      modal_title: "",
      modal_submit_text: 'Create',
      modal_mode: 'new',
      delete_confirm: "",
      user: {
        'username': '',
        'organization': null,
        'first_name': '',
        'last_name': '',
        'email': '',
        'locked': false,
        'password': '',
        'role_uuid': '',
        'confirm_password': ''
      },
      roles: [],
      empty_user: {
        'username': '',
        'first_name': '',
        'last_name': '',
        'email': '',
        'locked': false,
        'password': '',
        'role_uuid': '',
        'confirm_password': ''
      },
      user_original_data: {},
      error: false,
      error_message: null,
      user_loading: false,
      unlock_modal: false,
      organization: "",
      organizations: [],
      active_page: 1,
      pagination: {}
    };
  },
  watch: {
    modal_status: function () {
      if(!this.modal_status) {
        this.reset()
      }
    },
    active_page: function() {
      this.loadUsers(this.active_page)
    }
  },
  computed: mapState(['current_user','users']),
  methods: {
    sort(event) {
      let sort_direction = event.asc ? 'asc' : 'desc'
      event.column = event.column ? event.column : 'created_at'
      this.loadUsers(this.active_page, this.organization, event.column, sort_direction)
    },
    toggleMFA(mfa_status, user_uuid) {
      let data = {}
      if(mfa_status == true) {
        console.log(`Turning off MFA for ${user_uuid}`)
        data = {
          users: [user_uuid],
          mfa_enabled: false
        }
      } else {
        console.log(`Turning on MFA for ${user_uuid}`)
        data = {
          users: [user_uuid],
          mfa_enabled: true
        }        
      }
      this.$store.dispatch('toggleMFA', data)
    },
    userHas(permission) {
      return this.current_user.role.permissions[permission];
    },
    createUserModal() {
      this.modal_title = "Create User"
      this.modal_submit_text = 'Create'
      this.modal_status = true
      this.modal_mode = 'new'
      this.modal_action = this.createUser      
    },
    editUserModal(uuid) {
      this.modal_title = "Edit User"
      this.modal_submit_text = 'Edit'
      this.modal_mode = 'edit'
      this.modal_action = this.editUser
      Object.assign(this.user, this.users.find(user => user.uuid === uuid))
      this.loadRoles(this.user.organization)
      this.user.role_uuid = this.user.role.uuid
      this.modal_status = true
    },
    unlockUserModal(uuid) {
      this.user = this.users.find(user => user.uuid === uuid)
      this.unlock_modal = true
    },
    deleteUserModal(uuid) {
      this.user = this.users.find(user => user.uuid === uuid)
      this.delete_modal = true
    },
    createUser() {
      let user = this.user

      if (user['confirm_password'] != user['password']) {
        this.error = true
        this.error_message = "Passwords do not match."
        return
      }

      // Remove unneeded properties, they are only used for
      // edit activity
      delete user['confirm_password']
      delete user['locked']

      this.$store.dispatch('createUser', user).then(resp => {
        this.modal_status = false
        this.lists = this.$store.getters.lists
      }).catch(err => {
        this.error = true
        this.error_message = err.response.data.message
      })
    },
    editUser() {
      let user = {
        username: this.user.username,
        first_name: this.user.first_name,
        last_name: this.user.last_name,
        email: this.user.email,
        role_uuid: this.user.role_uuid,
        locked: this.user.locked
      }
      if(this.user.password != '' && this.user.confirm_password == this.user.password) {
        user['password'] = this.user.password
      }     

      let uuid = this.user.uuid
      this.$store.dispatch('updateUser', {uuid, user}).then(resp => {
        let userIndex = this.users.findIndex((user => user.uuid == uuid))
        Object.assign(this.users[userIndex], resp.data)
        this.modal_status = false
      }).catch(err => {
        this.error = true
        this.error_message = err.response.data.message
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
    unlockUser(uuid) {
      this.$store.dispatch('unlockUser', uuid).then(resp => {
        this.unlock_modal = false
        this.user.locked = false
      }).catch(err => {
        this.error = true
        this.error_message = err.response.data.message
      })
    },
    deleteUser(uuid) {
      let confirm = this.delete_confirm
      if (this.user.username == confirm) {
        this.$store.dispatch('deleteUser', uuid).then(resp => {
          let userIndex = this.users.findIndex((user => user.uuid == uuid))
          this.users.splice(userIndex, 1)
          this.delete_modal = false
        })
      }
    },
    addSuccess: function () {
      if (this.$store.getters.addSuccess == "success") {
        return true;
      } else {
        return false;
      }
    },
    loadData: function () {
      this.loading = true;
      if(this.current_user.default_org) {
        this.fields.splice(1,0,'organization')
        this.$store.dispatch('getOrganizations', {}).then(resp => {
          this.organizations = this.$store.getters.organizations.map((o) => { return {label: o.name, value: o.uuid}})
          this.user.organization = this.current_user.organization
        })        
      }
      this.loadUsers()
    },
    reset() {
      this.user = {}
      this.error = false
      this.error_message = ""
    },
    dismiss(modal) {
      this.reset()
      this.modal_status = false
      this.unlock_modal = false
      this.delete_modal = false
    },
    loadUsers(page=1, organization=null, sort_by="created_at", sort_direction="asc") {
      this.loading = true
      this.$store.dispatch('getUsers', {page:page, organization:organization, sort_by: sort_by, sort_direction: sort_direction}).then(resp => {
        this.pagination = resp.data.pagination
        this.loading = false
      })
    },
    loadRoles(organization=null) {
      this.$store.dispatch("getRoles", {organization: organization}).then(resp => {
        this.roles = this.$store.getters.roles.map(item => { return {'label': item.name, 'value': item.uuid}})
      })
    }
  }
};
</script>
