<template>
  <div>
  <CRow class="page-sub-header">
      <CCol>
        <h2>Field Templates</h2>
      </CCol>
      <CCol class="text-right">
        <CButton color="primary" @click="newFieldMappingTemplate()"
            >New Field Template</CButton
          >
      </CCol>
    </CRow>
    <CRow>
      <CCol>
        <div style="padding: 10px">
          <CAlert :show="true" color="info"
            ><b>Beta Feature</b>: This feature is in beta and requires specific
            conditions.</CAlert
          >
          
        </div>
        <CCard
          ><CDataTable
            :hover="hover"
            :items="field_templates"
            :fields="fields"
            :loading="loading"
            :items-per-page="small ? 25 : 10"
            :sorter="{ external: false, resetable: true }"
            column-filter
            pagination
          >
            <template #title="{ item }">
              <td>
                <b>{{ item.title }}</b>
              </td>
            </template>
            <template #organization="{ item }">
              <td>
                <OrganizationBadge :uuid="item.organization" />
              </td>
            </template>
            <template #tags="{ item }">
              <td>
                <li
                  style="display: inline; margin-right: 2px"
                  v-for="tag in item.tags"
                  :key="tag"
                >
                  <CButton color="primary" size="sm" disabled>{{ tag }}</CButton>
                </li>
              </td>
            </template>
            <template #actions="{ item }">
              <td class="text-right">
                <CButton color="info" size="sm" @click="editFieldTemplate(item.uuid)"
                  ><CIcon name="cilPencil" /></CButton
                >&nbsp;
                <CButton
                  color="secondary"
                  size="sm"
                  @click="cloneFieldTemplate(item.uuid)"
                  ><CIcon name="cilCopy"
                /></CButton>
              </td>
            </template>
          </CDataTable>
        </CCard>
      </CCol> </CRow
    ><FieldMappingModal
      :show.sync="show_modal"
      :template="template"
      :mode="modal_mode"
    ></FieldMappingModal>
  </div>
</template>

<script>
import { mapState } from "vuex";
import OrganizationBadge from "./OrganizationBadge";
import FieldMappingModal from "./FieldMappingModal";
export default {
  name: "InputFieldMappingList",
  components: {
    OrganizationBadge,
    FieldMappingModal,
  },
  props: {
    items: Array,
    fields: {
      type: Array,
      default() {
        return [
          "name",
          {
            key: "description",
            sorter: false,
          },
          "tags",
          "actions",
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
  computed: mapState([
    "current_user",
    "field_templates",
    "pagination",
    "source_field_template",
  ]),
  created: function () {
    if (this.current_user.default_org) {
      if (!this.fields.includes("organization")) {
        this.fields.splice(1, 0, { key: "organization", sorter: false });
      }
      this.organizations = this.$store.getters.organizations.map((o) => {
        return { label: o.name, value: o.uuid };
      });
    }
    this.loadData();
  },
  data() {
    return {
      organizations: Array,
      loading: false,
      template: {},
      modal_mode: "Create",
      show_modal: false,
    };
  },
  methods: {
    sort(event) {
      let sort_direction = event.asc ? "asc" : "desc";
      event.column = event.column ? event.column : "created_at";
      this.reloadFieldMappingTemplates(this.active_page, event.column, sort_direction);
    },
    newFieldMappingTemplate() {
      this.template = {};
      this.modal_mode = "Create";
      this.show_modal = true;
    },
    cloneFieldTemplate(uuid) {
      this.$store.commit(
        "clone_field_template",
        this.field_templates.find((item) => item.uuid === uuid)
      );
    },
    editFieldTemplate(uuid) {
      this.template = {}
      this.template = JSON.parse(JSON.stringify(this.field_templates.find((item) => item.uuid === uuid)))
      this.modal_mode = "Edit";
      this.show_modal = true;
    },
    mapOrgToName(uuid) {
      let org = this.$store.getters.organizations.filter((o) => o.uuid === uuid);
      if (org.length > 0) {
        return org[0].name;
      } else {
        return "Unknown";
      }
    },
    addSuccess: function () {
      if (this.$store.getters.addSuccess == "success") {
        return true;
      } else {
        return false;
      }
    },
    reloadFieldMappingTemplates(page, sort_by, sort_direction) {
      this.loading = true;
      this.$store
        .dispatch("getFieldTemplates", {
          page: page,
          sort_by: sort_by,
          sort_direction: sort_direction,
        })
        .then(() => {
          this.loading = false;
        });
    },
    loadData: function () {
      this.loading = true;

      this.$store.dispatch("getFieldTemplates", {}).then((resp) => {
        this.loading = false;
      });
    },
  },
  beforeDestroy: function () {
    clearInterval(this.refresh);
  },
};
</script>
