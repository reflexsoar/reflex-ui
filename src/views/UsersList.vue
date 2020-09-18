<template>
  <CRow>
    <CCol col v-if="loading">
      <div style="margin: auto; text-align:center; verticle-align:middle;">
        <CSpinner color="dark" style="width:6rem;height:6rem;" />
      </div>
    </CCol>
    <CCol col v-else>
      <div style="padding: 10px;">
        <CButton color="primary" @click="generateToken()">New Agent</CButton>
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
        style="border-top: 1px solid #cfcfcf;"
      >
        <template #name="{item}">
          <td>
            <router-link :to="`${item.uuid}`">{{item.username}}</router-link>
          </td>
        </template>
        <template #locked="{item}">
          <td>
            {{item.locked}}
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
      </CDataTable>
    </CCol>
  </CRow>
</template>

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
          "locked",
          "last_logon",
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
    };
  },
  methods: {
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
    }
  }
};
</script>
