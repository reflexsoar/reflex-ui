<template>
  <CRow>
    <link rel="stylesheet" href="https://unpkg.com/vue-multiselect@2.1.0/dist/vue-multiselect.min.css">
    <CCol col v-if="loading">
      <div style="margin: auto; text-align:center; verticle-align:middle;">
        <CSpinner color="dark" style="width:6rem;height:6rem;" />
      </div>
    </CCol>
    <CCol col v-else>
      <div style="padding: 10px;">
        <CButton color="primary" @click="createGroupModal()">New Group</CButton>
      </div>
      <CDataTable
        :hover="hover"
        :striped="striped"
        :bordered="bordered"
        :small="small"
        :fixed="fixed"
        :items="groups"
        :fields="fields"
        :items-per-page="small ? 25 : 10"
        :dark="dark"
        :sorter="{external: true, resetable: true}"
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
    <CModal :title="modal_title" :centered="true" size="lg" :show.sync="modal_status">
      <CAlert :show.sync="this.error" color="danger" closeButton>
            {{error_message}}
      </CAlert>
      <CForm @submit.prevent="modal_action()" id="groupForm">
        <CInput v-model="group.name" label="Name" placeholder="Enter a name for the group" required/>
        <CTextarea v-model="group.description" label="Description" rows="5" placeholder="Enter a description for the group" required/>
          <multiselect 
                    v-model="group.members"
                    :options="['a','b','c']"
                    multiple
                    :close-on-select="false"
                    :optionHeight="200">
                </multiselect>
      </CForm>
      <template #footer>
        <CButton @click="dismiss()" color="secondary">Dismiss</CButton>
        <CButton type="submit" form="groupForm" color="primary">{{modal_submit_text}}</CButton>
      </template>
    </CModal>
    <CModal title="Delete Group" color="danger" :centered="true" :show.sync="delete_modal">
      <CForm id="deleteGroupForm" @submit.prevent="deleteUser(group.uuid)">
        Are you sure you want to delete <b>{{group.name}}</b>?   Type the group name in the box below to confirm your intent.
        <CForm>
          <CInput
            v-model="delete_confirm"
            label="Group"
            required
          ></CInput>
        </CForm>
      </CForm>
      <template #footer>
        <CButton @click="dismiss()" color="secondary">No</CButton>
        <CButton type="submit" form="deleteGroupForm" color="danger">Yes</CButton>
      </template>
    </CModal>
  </CRow>
</template>

<script>
import { mapState } from "vuex";
export default {
  name: "GrouPlist",
  props: {
    items: Array,
    fields: {
      type: Array,
      default() {
        return [
          "name",
          "description",
          "user_count"
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
    this.loadData();
  },
  data() {
    return {
      loading: true,
      create_modal: false,
      delete_modal: false,
      delete_confirm: '',
      modal_action: null,
      modal_status: false,
      modal_submit_text: '',
      group: {},
      modal_title: "",
      error: false,
      error_message: ""
    };
  },
  methods: {
    createGroupModal() {
      this.modal_status = true
      this.modal_submit_text = 'Create'
      this.modal_title = "Create Group"
      this.modal_action = this.createGroup
    },
    createGroup() {
      console.log('CREATE GROUP')
    },
    loadData: function () {
      this.loading = true;
      this.$store.dispatch("getGroups").then((resp) => {
        this.groups = resp.data;
        this.loading = false;
      });
    }
  }
};
</script>
