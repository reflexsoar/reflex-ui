<template>
  <CRow>
   
    <CCol col>
      <div style="padding: 10px">
        <CButton
          color="primary"
          @click="newCaseTemplateModal = !newCaseTemplateModal"
          >New Case Template</CButton
        >
      </div>
      <CDataTable
        :hover="hover"
        :striped="striped"
        :bordered="bordered"
        :small="small"
        :fixed="fixed"
        :items="case_templates"
        :fields="fields"
        :loading="loading"
        :items-per-page="small ? 25 : 10"
        :dark="dark"
        :sorter="{ external: true, resetable: true }"
        pagination
        style="border-top: 1px solid #cfcfcf"
      >
        <template #title="{ item }">
          <td>
            {{ item.title }}
          </td>
        </template>
        <template #organization="{item}">
        <td>
          <CButton class="tag" size="lg" color="secondary">{{mapOrgToName(item.organization)}}</CButton>
        </td>
        </template>
        <template #tasks="{ item }">
          <td>
            {{ item.tasks.length }}
          </td>
        </template>
        <template #tlp="{ item }">
          <td>
            <CButton v-if="item.tlp == 1" color="light" size="sm"
              >TLP:WHITE</CButton
            >
            <CButton v-if="item.tlp == 2" color="success" size="sm"
              >TLP:GREEN</CButton
            >
            <CButton v-if="item.tlp == 3" color="warning" size="sm"
              >TLP:AMBER</CButton
            >
            <CButton v-if="item.tlp >= 4" color="danger" size="sm"
              >TLP:RED</CButton
            >
          </td>
        </template>
        <template #severity="{ item }">
          <td>
            <CButton v-if="item.severity == 1" color="light" size="sm"
              >Low</CButton
            >
            <CButton v-if="item.severity == 2" color="warning" size="sm"
              >Medium</CButton
            >
            <CButton v-if="item.severity == 3" color="danger" size="sm"
              >High</CButton
            >
            <CButton v-if="item.severity >= 4" color="dark" size="sm"
              >Critical</CButton
            >
          </td>
        </template>
         <template #actions="{item}"> 
              <td class="text-right"><CButton size="sm" color="info" @click="editTemplate(item.uuid)">Edit Template</CButton>&nbsp;<CButton color='danger' @click="delete_modal = true; target_template_uuid = item.uuid" size="sm">Delete</CButton></td>
            </template>
      </CDataTable>
    </CCol>
    <CreateCaseTemplateModal
      :show.sync="newCaseTemplateModal"
    ></CreateCaseTemplateModal>

    <EditCaseTemplateModal
      :show.sync="edit_case_modal"
      :template="target_template"
    />
    <CModal title="Delete Case Template" color="danger" :centered="true" size="lg" :show.sync="delete_modal">
      <div>
        <p>Deleting a Case Template is a permanent action, are you sure you want to continue?</p>
      </div>
      <template #footer>
          <CButton @click="delete_modal = !delete_modal" color="secondary">Dismiss</CButton>
          <CButton @click="deleteTemplate(target_template_uuid)" color="danger" v-bind:disabled.sync="dismiss_submitted"><CSpinner color="success" size="sm" v-if="dismiss_submitted"/><span v-else>Delete</span></CButton>
      </template>
    </CModal>
  </CRow>
</template>

<script>
import { mapState } from "vuex";
import CreateCaseTemplateModal from "./CreateCaseTemplateModal";
import EditCaseTemplateModal from "./EditCaseTemplateModal"
export default {
  name: "CaseTemplates",
  components: {
    CreateCaseTemplateModal,
    EditCaseTemplateModal
  },
  props: {
    items: Array,
    fields: {
      type: Array,
      default() {
        return ["title", "description", "tasks", "severity", "tlp", "actions"];
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
  computed: mapState(['current_user']),
  created: function () {
    if(this.current_user.default_org) {
      if (!this.fields.includes('organization')) {
        this.fields.splice(1,0,'organization')
      }
    }
    this.loadData();
    this.refresh = setInterval(
      function () {
        this.loadData();
      }.bind(this),
      60000
    );
  },
  data() {
    return {
      name: "",
      description: "",
      dismissCountDown: 10,
      loading: true,
      newCaseTemplateModal: false,
      delete_modal: false,
      target_template: {},
      target_template_uuid: '',
      dismiss_submitted: false,
      edit_case_modal: false,
      case_templates: []
    };
  },
  methods: {
    editTemplate(uuid) {
      this.target_template = this.case_templates.filter(t => t.uuid === uuid)[0]
      this.edit_case_modal = true
    },
    deleteTemplate() {

    },
    loadData: function () {
      this.loading = true;
      if(this.current_user.default_org) {
        this.organizations = this.$store.getters.organizations.map((o) => { return {label: o.name, value: o.uuid}})
      }
      this.$store.dispatch("getCaseTemplates").then((resp) => {
        this.case_templates = resp.data;
        this.loading = false;
      });
    },
    mapOrgToName(uuid) {
      let org = this.$store.getters.organizations.filter(
        (o) => o.uuid === uuid
      );
      if (org.length > 0) {
        return org[0].name;
      } else {
        return "Unknown";
      }
    },
  },
  beforeDestroy: function () {
    clearInterval(this.refresh);
  },
};
</script>
