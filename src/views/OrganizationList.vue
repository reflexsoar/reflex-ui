<template>
  <CRow>
    <CCol col v-if="loading">
      <div style="margin: auto; text-align:center; verticle-align:middle;">
        <CSpinner color="dark" style="width:6rem;height:6rem;" />
      </div>
    </CCol>
    <CCol col v-else>
      <div style="padding: 10px;">
        <CButton color="primary" @click="showOrganizationModal()">New Organization</CButton>
      </div>
      <CDataTable
        :hover="hover"
        :striped="striped"
        :bordered="bordered"
        :small="small"
        :fixed="fixed"
        :items="organizations"
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
      <CreateOrganizationWizard :show.sync="organizationModal"/>
    </CCol>
  </CRow>
</template>

<script>
import { mapState } from "vuex";
import CreateOrganizationWizard from './CreateOrganizationWizard'

export default {
  name: "OrganizationList",
  components: {
    CreateOrganizationWizard
  },
  props: {
    items: Array,
    fields: {
      type: Array,
      default() {
        return [
          "name",
          "description",
          "url"
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
      organizations: [],
      organizationModal: false
    };
  },
  methods: {
    showOrganizationModal() {
      this.organizationModal = true
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
      this.$store.dispatch("getOrganizations").then((resp) => {
        this.organizations = this.$store.getters.organizations
        this.loading = false;
      });
    }
  }
};
</script>
