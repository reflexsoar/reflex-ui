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
            <b>{{item.name}}</b>
          </td>
        </template>
        <template #actions="{item}">
          <td style="max-width:150px" class="text-right">
            <CButton @click="editOrganization(item.uuid)" size="sm" color="primary">Edit</CButton>
            <CButton :to="`/organization/${item.uuid}`" size="sm" color="primary">Change Settings</CButton>
          </td>
        </template>
      </CDataTable>
      <CreateOrganizationWizard :show.sync="organizationModal"/>
      <EditOrganizationWizard :show.sync="editOrganizationModal" :uuid="target_organization"/>
    </CCol>
  </CRow>
</template>

<script>
import { mapState } from "vuex";
import CreateOrganizationWizard from './CreateOrganizationWizard'
import EditOrganizationWizard from './EditOrganizationWizard'

export default {
  name: "OrganizationList",
  components: {
    CreateOrganizationWizard,
    EditOrganizationWizard
  },
  props: {
    items: Array,
    fields: {
      type: Array,
      default() {
        return [
          "name",
          "description",
          "url",
          "logon_domains",
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
    this.loadData();
  },
  data() {
    return {
      loading: true,
      organizationModal: false,
      editOrganizationModal: false,
      target_organization: ''
    };
  },
  computed: mapState(['organizations']),
  methods: {
    showOrganizationModal() {
      this.organizationModal = true
    },
    editOrganization(uuid) {
      this.target_organization = uuid
      this.editOrganizationModal = true
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
        this.loading = false;
      });
    }
  }
};
</script>
