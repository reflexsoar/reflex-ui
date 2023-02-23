<template>
  <CRow>
    <CCol>
      <div style="padding: 10px">
        <CButton color="primary" @click="showOrganizationModal()"
          >New Organization</CButton
        >
      </div>
      <CDataTable
        :hover="hover"
        :striped="striped"
        :bordered="bordered"
        :small="small"
        :fixed="fixed"
        :items="filtered_organizations"
        :fields="fields"
        :items-per-page="small ? 25 : 10"
        :dark="dark"
        :sorter="{ external: false, resetable: true }"
        :loading="loading"
        column-filter
        style="border-top: 1px solid #cfcfcf"
      >
        <template #name-filter="{ item }">
          <RMultiCheck
            :items="names"
            @checked="set_picker_filters($event, 'name')"
            size="sm"
          ></RMultiCheck>
        </template>
        <template #name="{ item }">
          <td>
            <b>{{ item.name }}</b>
          </td>
        </template>
        <template #actions="{ item }">
          <td style="max-width: 150px" class="text-right">
            <CButton
              @click="editOrganization(item.uuid)"
              size="sm"
              color="info"
              v-c-tooltip="{ content: 'Edit Organization', placement: 'left' }"
              ><CIcon name="cilPencil" /></CButton
            >&nbsp;
            <CButton
              :to="`/organization/${item.uuid}`"
              size="sm"
              color="primary"
              v-c-tooltip="{ content: 'Edit Settings', placement: 'left' }"
              ><CIcon name="cilSettings"
            /></CButton>
          </td>
        </template>
      </CDataTable>
      <CRow>
        <CCol>
          <CCardBody
            ><CPagination :pages="pagination.pages" :activePage.sync="active_page"
          /></CCardBody>
        </CCol>
      </CRow>
      <CreateOrganizationWizard :show.sync="organizationModal" />
      <EditOrganizationWizard
        :show.sync="editOrganizationModal"
        :uuid="target_organization"
      />
    </CCol>
  </CRow>
</template>

<script>
import { mapState } from "vuex";
import CreateOrganizationWizard from "./CreateOrganizationWizard";
import EditOrganizationWizard from "./EditOrganizationWizard";
import RMultiCheck from "./components/MultiCheck.vue";

export default {
  name: "OrganizationList",
  components: {
    CreateOrganizationWizard,
    EditOrganizationWizard,
    RMultiCheck,
  },
  props: {
    items: Array,
    fields: {
      type: Array,
      default() {
        return [
          "name",
          { key: "description", sorter: false },
          "url",
          "logon_domains",
          {
            key: "actions",
            filter: false,
          },
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
      target_organization: "",
      active_page: 1,
      picker_filters: {},
    };
  },
  computed: {
    ...mapState(["organizations", "pagination"]),
    names() {
      let names = [];
      this.organizations.forEach((organization) => {
        names.push({ label: organization.name, value: organization.name });
      });
      return names;
    },
    filtered_organizations() {
      let organizations = [];
      if (Object.keys(this.picker_filters).length == 0) {
        return this.organizations;
      }
      for (let i in this.organizations) {
        let organization = this.organizations[i];
        let match = true;
        for (let key in this.picker_filters) {
          if (this.picker_filters[key].length > 0) {
            if (!this.picker_filters[key].includes(organization[key])) {
              match = false;
            }
          }
        }
        if (match) {
          organizations.push(organization);
        }
      }
      return organizations;
    },
  },
  watch: {
    active_page: function () {
      this.loadOrganizations(this.active_page);
    },
  },
  methods: {
    sort(event) {
      let sort_direction = event.asc ? "asc" : "desc";
      event.column = event.column ? event.column : "created_at";
      this.loadOrganizations(this.active_page, event.column, sort_direction);
    },
    showOrganizationModal() {
      this.organizationModal = true;
    },
    editOrganization(uuid) {
      this.target_organization = uuid;
      this.editOrganizationModal = true;
    },
    addSuccess: function () {
      if (this.$store.getters.addSuccess == "success") {
        return true;
      } else {
        return false;
      }
    },
    loadOrganizations(active_page, sort_by, sort_direction) {
      this.loading = true;
      this.$store
        .dispatch("getOrganizations", {
          page_size: 10000,
          page: active_page,
          sort_by: sort_by,
          sort_direction: sort_direction,
        })
        .then(() => {
          this.loading = false;
        });
    },
    loadData: function () {
      this.loading = true;
      this.loadOrganizations();
    },

    set_picker_filters(val, key) {
      if (!this.picker_filters.hasOwnProperty(key)) {
        this.$delete(this.picker_filters, key);
      }
      if (val.length == 0) {
        this.$set(this.picker_filters, key, []);
      } else {
        this.$set(this.picker_filters, key, val);
      }
    },
  },
};
</script>
