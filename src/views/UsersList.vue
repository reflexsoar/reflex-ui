<template>
  <CRow>
    <CCol col v-if="loading">
      <div style="margin: auto; text-align:center; verticle-align:middle;">
        <CSpinner color="dark" style="width:6rem;height:6rem;" />
      </div>
    </CCol>
    <CCol col v-else>
      <div style="padding: 10px;">
        <CButton color="primary" @click="createUserModal()">New User</CButton>
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
            <CButton v-if="item.locked" @click="unlockUserModal(item.uuid)" size="sm" color="warning" class="unlock">Unlock User</CButton>&nbsp;
            <CButton @click="editUserModal(item.uuid)" size="sm" color="primary">Edit User</CButton>&nbsp;
            <CButton @click="deleteUser(item.uuid)" size="sm" color="danger">Delete User</CButton>&nbsp;            
          </td>
        </template>
      </CDataTable>
    </CCol>
    <CModal :title="modal_title" :centered="true" size="lg" :show.sync="modal_status">
      <CAlert :show.sync="this.error" color="danger" closeButton>
            {{error_message}}
      </CAlert>
      <CForm @submit.prevent="modal_action()" id="userForm">
        <CInput v-model="user.username" label="Username" required/>
        <CRow>
          <CCol col="6">
            <CInput v-model="user.first_name" label="First Name" required/>
          </CCol>
          <CCol col="6">
            <CInput v-model="user.last_name" label="Last Name" required/>
          </CCol>
        </CRow>
        <CInput v-model="user.email" label="Email" required/>
        <CSelect :options="roles" required label="Role" :value.sync="user.role_uuid" placeholder="Select a role"/>
        <CInput v-if="modal_mode == 'new'" v-model="user.password" type="password" label="Password" required/>
        <CInput v-if="modal_mode == 'new'" v-model="user.confirm_password"  type="password" label="Confirm Password" required/>
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
        Are you sure you want to unlock <b>{{user.username}}</b>? {{user.uuid}}
      </CForm>
      <template #footer>
        <CButton @click="dismiss()" color="secondary">No</CButton>
        <CButton type="submit" form="unlockForm" color="danger">Yes</CButton>
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
      modal_action: null,
      modal_status: false,
      modal_title: "",
      modal_mode: 'new',
      modal_submit_text: 'Create',
      user: {
        'username': 'netsurge',
        'first_name': 'Brian',
        'last_name': 'Carroll',
        'email': 'brian@reflexsoar.com',
        'locked': false,
        'password': 'password',
        'role_uuid': '',
        'confirm_password': 'password'
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
  methods: {
    createUserModal() {
      this.modal_title = "Create User"
      this.modal_submit_text = 'Create'
      this.modal_status = true
      this.modal_mode = 'new'
      this.modal_action = this.createUser
      this.user = this.empty_user
    },
    editUserModal(uuid) {
      this.modal_title = "Edit User"
      this.modal_submit_text = 'Edit'
      this.modal_mode = 'edit'
      this.user = this.users.find(user => user.uuid === uuid)
      this.modal_status = true
    },
    unlockUserModal(uuid) {
      this.user = this.users.find(user => user.uuid === uuid)
      this.unlock_modal = true
      
    },
    createUser() {
      let user = this.user
      console.log(user)

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
      }).catch(err => {
        this.error = true
        this.error_message = err.response.data.message
      })
    },
    editUser() {
      console.log('edit user')
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
      this.user = this.empty_user
      this.error = false
      this.error_message = ""
    },
    dismiss() {
      this.reset()
      this.modal_status = false
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
