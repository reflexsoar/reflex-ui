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
        :sorter="{external: true, resetable: true}"
        pagination
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
        <template #actions="{item}">
          <td style="max-width:150px" class="text-right">
            <CButton v-if="item.locked && item.uuid != current_user.uuid && userHas('unlock_user')" @click="unlockUserModal(item.uuid)" size="sm" color="warning" class="unlock">Unlock User</CButton>&nbsp;
            <CButton v-if="item.uuid != current_user.uuid && userHas('update_user')" @click="editUserModal(item.uuid)" size="sm" color="primary">Edit User</CButton>&nbsp;
            <CButton v-if="item.uuid != current_user.uuid  && userHas('delete_user')" @click="deleteUserModal(item.uuid)" size="sm" color="danger">Delete User</CButton>&nbsp;
          </td>
        </template>
      </CDataTable>
    </CCol>
    
    <CModal :title="modal_title" :centered="true" size="lg" :show.sync="modal_status">
      <CAlert :show.sync="this.error" color="danger" closeButton>
            {{error_message}}
      </CAlert>
      <CForm @submit.prevent="modal_action()" id="userForm">
        <CInput v-model="user.username" label="Username" placeholder="Enter a unique username for the user" required/>
        <CRow>
          <CCol col="6">
            <CInput v-model="user.first_name" label="First Name" placeholder="John" required/>
          </CCol>
          <CCol col="6">
            <CInput v-model="user.last_name" label="Last Name" placeholder="Doe" required/>
          </CCol>
        </CRow>
        <CInput v-model="user.email" label="Email" placeholder="user@reflexsoar.com" required/>
        <CSelect :options="roles" required label="Role" :value.sync="user.role_uuid" placeholder="Select a role" required/>
        <CInput v-model="user.password" type="password" label="Password" placeholder="Enter your desired password..." v-bind:requred="modal_mode == 'new'"/>
        <CInput v-model="user.confirm_password"  type="password" label="Confirm Password" placeholder="Confirm password" v-bind:requred="modal_mode == 'new'"/>
        <label>User Locked?</label><br>
        <CSwitch color="danger" label-on="Yes" label-off="No" v-bind:checked.sync="user.locked"/>
      </CForm>
      <template #footer>
        <CButton @click="dismiss()" color="secondary">Dismiss</CButton>
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
export default {
  name: "UsersList",
  props: {
    items: Array,
    fields: {
      type: Array,
      default() {
        return [
          "username",
          "first_name",
          "last_name",
          "email",
          "role",
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
    this.loadRoles();
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
        'first_name': '',
        'last_name': '',
        'email': '',
        'locked': false,
        'password': '',
        'role_uuid': '',
        'confirm_password': ''
      },
      users: [],
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
      unlock_modal: false
    };
  },
  watch: {
    modal_status: function () {
      if(!this.modal_status) {
        this.reset()
      }
    }
  },
  computed: {
    current_user: function () { 
      return this.$store.getters.current_user
    }
  },
  methods: {
    userHas(permission) {
      return this.current_user.permissions.includes(permission);
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
        console.log(user)
      }     

      let uuid = this.user.uuid
      this.$store.dispatch('updateUser', {uuid, user}).then(resp => {
        let userIndex = this.users.findIndex((user => user.uuid == uuid))
        Object.assign(this.users[userIndex], resp.data)
        this.modal_status = false
      })
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
      this.$store.dispatch("getUsers").then((resp) => {
        this.users = resp.data;
        this.loading = false;
      });
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
    loadRoles: function () {
      this.$store.dispatch("getRoles").then(resp => {
        for(let role in resp.data) {
          this.roles.push({'label': resp.data[role].name, 'value': resp.data[role].uuid})
        }
      })
    }
  }
};
</script>
