<template>
  <div>
    <CModal
      :title="title"
      :show.sync="modal_status"
      class="modal-wide"
      size="xl"
      :close-on-backdrop="false"
      style="width: 800px"
    >
      <CTabs
        variant="pills"
        :activeTab.sync="step"
        :fade="true"
        :vertical="{ navs: 'col-md-2', content: 'col-md-10' }"
      >
        <CTab title="General Settings">
          <h3>General Settings</h3>
          <p>Define the name and description of the data source template.</p>
          <CRow v-if="current_user.default_org">
            <CCol col="9">
              <SelectInput
                :options="formatted_organizations"
                label="Organization"
                placeholder="Select an organization"
                :value.sync="template.organization"
                description="Select an organization related to this item."
              />
            </CCol>
            <CCol>
              <label>Global Template</label><br />
              <CSwitch
                :checked.sync="template.is_global"
                label-on="Yes"
                label-off="No"
                color="success"
              ></CSwitch>
            </CCol>
          </CRow>
          <CRow>
            <CCol>
              <CInput
                label="Template Name"
                v-model="template.name"
                placeholder="Name"
              ></CInput>
            </CCol>
          </CRow>
          <CRow>
            <CCol>
              <CTextarea
                label="Description"
                v-model="template.description"
                placeholder="Description"
              ></CTextarea>
            </CCol>
          </CRow>
        </CTab>
        <CTab title="Data Source Definitions">
          <CRow>
            <CCol col="9"
              >
              <h3>Data Sources</h3>
              <p>
                Each data source defined in this template will evaluate an input to see if
                the data source exists.
              </p>
            </CCol>
            <CCol class="text-right">
              <CButton @click="add_source" color="primary">Add Data Source</CButton>
            </CCol>
          </CRow>
          <CRow>
            <CCol>
              <CRow v-for="(source, i) in template.sources" :key="i">
                <CCol>
                  <CRow>
                    <CCol col="4">
                      <SelectInput
                        :value.sync="source.name"
                        :options="mitre_data_sources"
                        placeholder="Select a Data Source"
                      />
                    </CCol>
                    <CCol>
                      <CRow>
                        <CCol>
                          <CInput v-model="source.query" placeholder="Query"></CInput>
                        </CCol>
                      </CRow>
                    </CCol>
                    <CCol col="1">
                      <CButton color="danger" @click="template.sources.splice(i, 1)"
                        ><i class="fas fa-trash-can"></i
                      ></CButton>
                    </CCol>
                  </CRow>
                  <CRow style="margin-top: -15px; margin-bottom: 10px;">
                    <CCol>
                      <span style="cursor: pointer; font-size: 80%;" @click="toggleCollapse(i)"
                        >Additional Settings
                        <i
                          v-if="source_collapse[i]"
                          class="fas fa-chevron-down"
                        ></i>
                        <i v-else class="fas fa-chevron-up"></i>
                      </span>
                      <CCollapse :show="source_collapse[i]" style="padding-top: 10px">
                        <CRow>
                            <CCol>
                                <CTextarea
                                v-model="source.description"
                                placeholder="Description"
                                ></CTextarea>
                            </CCol>
                            <CCol>
                                <CTextarea
                                    v-model="source.prequisites"
                                    placeholder="Prerequisites"
                                    description="Prerequisites describe what steps are necessary to configure this data source."
                                ></CTextarea>
                            </CCol>
                        </CRow>
                      </CCollapse>
                    </CCol>
                  </CRow>
                </CCol>
              </CRow>
            </CCol>
          </CRow>
        </CTab>
        <CTab title="Review">
          <CRow>
            <CCol>
              <CAlert color="danger" v-if="error">{{ error_message }}</CAlert>
            </CCol>
          </CRow>
          <CRow>
            <CCol>
              <h3>Confirm Settings</h3>
              <p>
                Review the settings below and click "{{ capitalize(mode) }}" to create the
                data source template.
              </p>
            </CCol>
          </CRow>
          <CRow>
            <CCol col="5">
              <ObjectAttribute label="Name" :value="template.name"></ObjectAttribute>
              <ObjectAttribute
                label="Description"
                :value="template.description"
              ></ObjectAttribute>
              <ObjectAttribute
                v-if="current_user.default_org"
                label="Organization"
                :value="getOrganizationName(template.organization)"
              ></ObjectAttribute>
              <ObjectAttribute
                label="Global Template"
                :value="template.is_global ? 'Yes' : 'No'"
              ></ObjectAttribute>
            </CCol>
            <CCol>
              <h4>Data Sources</h4>
              <div style="max-height: 400px; overflow-y: auto; overflow-x: hidden">
                <ul class="data-source-list">
                  <li class="data-source-query" v-for="source in template.sources">
                    <ObjectAttribute
                      :label="source.name"
                      :value="source.query"
                    ></ObjectAttribute>
                  </li>
                </ul>
              </div>
            </CCol>
          </CRow>
        </CTab>
      </CTabs>
      <template #footer>
        <CRow>
          <CCol class="text-right">
            <CButton @click="dismiss" color="secondary">Dismiss</CButton>
            <span v-if="step > 0"
              >&nbsp;<CButton @click="step--" color="info">Back</CButton></span
            >
            <span v-if="step < 2"
              >&nbsp;<CButton v-if="step < 2" @click="step++" color="info"
                >Next</CButton
              ></span
            >
            <span v-if="step == 2"
              >&nbsp;<CButton color="primary" @click="save">{{
                capitalize(mode)
              }}</CButton></span
            >
          </CCol>
        </CRow>
      </template>
    </CModal>
  </div>
</template>

<style scoped>
.data-source-list {
  /* Remove the UL left padding */
  padding-left: 0;
}

.data-source-query {
  /* Remove the LI bullet */
  list-style-type: none;
  margin-bottom: 5px;
}
</style>

<script>
import { mapState } from "vuex";

import SelectInput from "../components/SelectInput.vue";
import ObjectAttribute from "../components/ObjectAttribute.vue";

export default {
  name: "DataSourceTemplateWizard",
  components: {
    SelectInput,
    ObjectAttribute,
  },
  computed: {
    ...mapState(["mitre_data_sources", "current_user", "organizations"]),
    formatted_organizations: function () {
      return this.organizations.map(function (org) {
        return {
          value: org.uuid,
          label: org.name,
        };
      });
    },
  },
  props: {
    show: Boolean,
    mode: {
      type: String,
      default: "create",
    },
    source_template: {
      type: Object,
      default: function () {
        return {
          name: "",
          description: "",
          sources: [],
          organization: "",
        };
      },
    },
  },
  data() {
    return {
      uuid: "",
      template: {
        name: "",
        description: "",
        sources: [],
        organization: "",
      },
      modal_status: false,
      error: false,
      error_message: "",
      step: 0,
      title: "",
      source_collapse: {},
    };
  },
  watch: {
    show: function () {
      this.error = false;
      this.error_message = "";
      this.modal_status = this.show;
    },
    modal_status: function () {
      if (this.modal_status) {
        this.step = 0;
        this.title = this.capitalize(this.mode) + " Data Source Template";
        this.template = JSON.parse(JSON.stringify(this.source_template));
        if (this.mode == "edit") {
          this.uuid = this.template.uuid;
          delete this.template.uuid;
        }
      }
      this.$emit("update:show", this.modal_status);
      if (!this.modal_status) {
        this.dismiss();
      }
    },
  },
  methods: {
    getOrganizationName: function (uuid) {
      var org = this.organizations.find(function (org) {
        return org.uuid == uuid;
      });
      if (org) {
        return org.name;
      }
      return "";
    },
    getDataSources: function () {
      this.$store.dispatch("getMitreDataSources", {});
    },
    add_source() {
      this.template.sources.push({
        name: "",
        description: "",
        query: "",
      });
    },
    dismiss() {
      this.error = false;
      this.error_message = "";
      this.template = {
        name: "",
        description: "",
        sources: [],
        organization: "",
      };
      this.uuid = "";
      this.modal_status = false;
    },
    toggleCollapse(i) {
      if (!(i in this.source_collapse)) {
        console.log("WHAT THE!");
        this.$set(this.source_collapse, i, false);
      }

      this.source_collapse[i] = !this.source_collapse[i];
    },
    capitalize: function (value) {
      if (!value) return "";
      value = value.toString();
      return value.charAt(0).toUpperCase() + value.slice(1);
    },
    save() {
      if (this.mode == "create") {
        this.$store
          .dispatch("createDataSourceTemplate", this.template)
          .then((resp) => {
            this.dismiss();
          })
          .catch((err) => {
            this.error = true;
            this.error_message = err.response.data.message;
            this.step = 2;
          });
      } else if (this.mode == "edit") {

        let template = {}
        template.name = this.template.name
        template.description = this.template.description
        template.is_global = this.template.is_global
        template.organization = this.template.organization
        template.revision = this.template.revision
        template.sources = this.template.sources
        
        this.$store
          .dispatch("updateDataSourceTemplate", {
            uuid: this.uuid,
            template: template,
          })
          .then((resp) => {
            this.dismiss();
          })
          .catch((err) => {
            this.error = true;
            this.error_message = err.response.data.message;
            this.step = 2;
          });
      }
    },
  },
  mounted() {
    this.getDataSources();
    if (this.current_user.default_org) {
      this.$store.dispatch("getOrganizations", {});
    }
  },
};
</script>
