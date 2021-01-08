<template>
  <CRow>
    <CCol col v-if="loading">
      <div style="margin: auto; text-align:center; verticle-align:middle;">
        <CSpinner color="dark" style="width:6rem;height:6rem;" />
      </div>
    </CCol>
    <CCol col v-else>
      <div style="padding: 10px;">
        <CButton color="primary" @click="generateToken()">New Role</CButton>
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
  </CRow>
</template>

<script>
import { mapState } from "vuex";
export default {
  name: "RoleList",
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
      this.$store.dispatch("getRoles").then((resp) => {
        this.roles = resp.data;
        this.loading = false;
      });
    }
  }
};
</script>
