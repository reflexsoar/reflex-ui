<template>
  <CRow>
    <CCol col v-if="loading">
      <div style="margin: auto; text-align: center; verticle-align: middle">
        <CSpinner color="dark" style="width: 6rem; height: 6rem" />
      </div>
    </CCol>
    <CCol col v-if="!loading">
      <link
        rel="stylesheet"
        href="https://unpkg.com/vue-multiselect@2.1.0/dist/vue-multiselect.min.css"
      />
      <CCard class="shadow-sm bg-white rounded">
        <CCardHeader>
          <CRow>
            <CCol col="12" lg="6" sm="12" class="text-left">
              <h1>{{ input.name }}</h1>
            </CCol>
            <CCol col="12" lg="6" sm="12" class="text-right">
              <template #tags="{ tag }">
                {{ tag.name }}
              </template>
              <li
                style="display: inline; margin-right: 2px"
                v-for="tag in input.tags"
                :key="tag"
              >
                <CButton color="primary" size="sm" disabled>{{ tag }}</CButton>
              </li>
            </CCol>
          </CRow>
          <CRow>
            <CCol col="12" lg="6" sm="12">
              {{ input.description }}
            </CCol>
            <CCol col="12" lg="6" sm="12" class="text-right">
              <CButton color="danger" @click="delete_modal = true"
                ><CIcon name="cil-trash"
              /></CButton>
            </CCol>
          </CRow>
        </CCardHeader>
        <CCardBody>
          <CRow>
            <CCol col="6">
              <b>Enabled: </b> True<br />
              <b>Plugin: </b> Elasticsearch<br />
            </CCol>
            <CCol col="6">
              <b>Date Created: </b>{{ input.created_at | moment("LLLL") }}<br />
              <b>Last Updated: </b>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>
      <CRow>
        <CCol v-if="edit_config">
          <CCard
            class="shadow-sm bg-white rounded"
            @mouseover="config_hover = true"
            @mouseleave="config_hover = false"
          >
            <CCardHeader>
              <CRow>
                <CCol col="12" lg="6" sm="12" class="text-left">
                  <b>Configuration</b>&nbsp;<a
                    v-if="config_hover && !edit_config"
                    @click="edit_config = !edit_config"
                    ><CIcon name="cilPencil" size="sm"
                  /></a>
                </CCol>
              </CRow>
            </CCardHeader>
            <CCardBody
              class="bg-dark"
              v-if="!edit_config"
              style="overflow: scroll; min-height: 300px; max-height: 300px"
            >
              <CRow class="bg-dark">
                <CCol col="12" class="bg-dark pre-formatted raw_log">
                  {{ input.config }}
                </CCol>
              </CRow>
            </CCardBody>
            <CCardBody v-if="edit_config">
              <CAlert
                :show.sync="config_json_error"
                color="danger"
                closeButton
                class="text-left"
              >
                Invalid JSON. Please check your config before submitting.
              </CAlert>
              <CTextarea
                :value="jsonToString(input.config)"
                @change="convertConfig($event)"
                rows="10"
              />
              <CButton
                color="danger"
                @click="
                  edit_config = !edit_config;
                  config_json_error = false;
                "
                size="sm"
                ><CIcon name="cilXCircle" /></CButton
              >&nbsp;
              <CButton
                color="primary"
                @click="updateConfig()"
                size="sm"
                v-bind:disabled="config_json_error"
                ><CIcon name="cilSave"
              /></CButton>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol v-else col="12">
          <CCard>
            <CCardHeader>
            <CRow>
                <CCol><b>Configuration</b></CCol>
                <CCol class="text-right"
                  ><CButton
                    size="sm"
                    color="primary"
                    @click="edit_config = !edit_config"
                    >Edit Config</CButton
                  ></CCol>
              </CRow>
            </CCardHeader>
            <CCardBody>
              <CRow>
                <CCol col="4">
                  <b>Hosts</b><br />
                  <li
                        style="display: inline; margin-right: 2px"
                        v-for="host in input.config['hosts']"
                        :key="host"
                      >
                        <CButton color="primary" size="sm" disabled>{{
                          host
                        }}</CButton>
                      </li><br/><br/>
                </CCol>
                <CCol col="4">
                  <b>Distro</b><br />
                  {{ input.config["distro"] }}<br /><br />
                </CCol>
                <CCol col="4">
                  <b>Alert Index</b><br />
                  {{ input.config["index"] }}<br /><br />
                </CCol>
                <CCol col="4">
                  <b>Lucene Filter</b><br />
                  {{ input.config["lucene_filter"] }}<br /><br />
                </CCol>
                <CCol col="4">
                  <b>HTTP scheme</b><br />
                  {{ input.config["scheme"] }}<br /><br />
                </CCol>
                <CCol col="4">
                  <b>Auth Method</b><br />
                  {{ input.config["auth_method"] }}<br /><br />
                </CCol>
                <CCol col="4">
                  <b>Verify Hostname</b><br />
                  {{ input.config["check_hostname"] ? "Yes" : "No"
                  }}<br /><br />
                </CCol>
                <CCol col="4">
                  <b>TLS Verification Mode</b><br />
                  {{ input.config["cert_verification"] }}<br /><br />
                </CCol>
              </CRow>
              <CRow>
                <CCol col="12">
                  <h5>Event Base Configuration</h5>
                </CCol>
                <CCol col="4">
                  <b>Event Title FIeld</b><br />
                  {{ input.config["rule_name"] }}<br /><br />
                </CCol>
                <CCol col="4">
                  <b>Description Field Field</b><br />
                  {{ input.config["description_field"] }}<br /><br />
                </CCol>
                <CCol col="4">
                  <b>Reference Field</b><br />
                  {{ input.config["source_reference"] }}<br /><br />
                </CCol>
                <CCol col="4">
                  <b>Severity Field</b><br />
                  {{ input.config["severity_field"] }}<br /><br />
                </CCol>
                <CCol col="4">
                  <b>Tag Fields</b><br />
                  <li
                        style="display: inline; margin-right: 2px"
                        v-for="field in input.config['tag_fields']"
                        :key="field"
                      >
                        <CButton color="primary" size="sm" disabled>{{
                          field
                        }}</CButton>
                      </li><br /><br />
                </CCol>
                <CCol col="4">
                  <b>Signature Fields</b><br />
                  <li
                        style="display: inline; margin-right: 2px"
                        v-for="field in input.config['signature_fields']"
                        :key="field"
                      >
                        <CButton color="primary" size="sm" disabled>{{
                          field
                        }}</CButton>
                      </li><br /><br />
                </CCol>
                <CCol col="4">
                  <b>Search Size</b><br />
                  {{ input.config["search_size"] }} events<br /><br />
                </CCol>
                <CCol col="4">
                  <b>Search Period</b><br />
                  {{ input.config["search_period"] }}<br /><br />
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol col="12">
          <CCard>
            <CCardHeader style="border-bottom: 0px">
              <CRow>
                <CCol
                  ><b
                    >Field Mapping
                    <CButton size="sm" color="success" @click="addField()"
                      >+</CButton
                    ></b
                  ></CCol
                >
                <CCol class="text-right"
                  ><CButton
                    v-bind:disabled="!changes_made"
                    size="sm"
                    color="primary"
                    @click="updateFieldMapping()"
                    >Save Changes</CButton
                  >&nbsp;<CButton
                    v-bind:disabled="!changes_made"
                    size="sm"
                    color="secondary"
                    @click="discardChanges()"
                    >Discard Changes</CButton
                  ></CCol>
              </CRow>
            </CCardHeader>
            <CCardBody style="padding: 0px">
              <CDataTable
                :items="input.field_mapping['fields']"
                :fields="[
                  'field',
                  'alias',
                  'data_type',
                  'tlp',
                  'tags',
                  'actions',
                ]"
                :noItemsView="{
                  noResults: 'No Fields Mapped',
                  noItems: 'No Fields Mapped',
                }"
              >
                <template #field="{ item }">
                  <td>
                    <div v-if="edit_field == itemIndex(item['field'])">
                      <CInput :value.sync="item['field']" />
                    </div>
                    <div v-else>{{ item["field"] }}</div>
                  </td>
                </template>
                <template #alias="{ item }">
                  <td>
                    <div v-if="edit_field == itemIndex(item['field'])">
                      <CInput :value.sync="item['alias']" />
                    </div>
                    <div v-else>{{ item["alias"] }}</div>
                  </td>
                </template>
                <template #data_type="{ item }">
                  <td>
                    <div v-if="edit_field == itemIndex(item['field'])">
                      <CSelect
                        :options="data_types"
                        :value.sync="item['data_type']"
                      />
                    </div>
                    <div v-else>{{ item["data_type"] }}</div>
                  </td>
                </template>
                <template #tlp="{ item }">
                  <td>
                    <div v-if="edit_field == itemIndex(item['field'])">
                      <CSelect
                        :options="[1, 2, 3, 4]"
                        :value.sync="item['tlp']"
                      />
                    </div>
                    <div v-else>{{ item["tlp"] }}</div>
                  </td>
                </template>
                <template #tags="{ item }">
                  <td v-if="edit_field == itemIndex(item['field'])">
                    <multiselect
                      v-model="item['tags']"
                      :close-on-select="false"
                      :options="[]"
                      placeholder="Select tags to apply to this input"
                      :taggable="true"
                      tag-placeholder="Add new tag"
                      :multiple="true"
                      @tag="addFieldTag(item, $event)"
                    />
                  </td>
                  <td v-else>
                    <div v-if="item['tags'].length > 0">
                      <li
                        style="display: inline; margin-right: 2px"
                        v-for="tag in item['tags']"
                        :key="tag"
                      >
                        <CButton color="primary" size="sm" disabled="">{{
                          tag
                        }}</CButton>
                      </li>
                    </div>
                    <div v-else>None</div>
                  </td>
                </template>
                <template #actions="{ item }">
                  <td class="text-right">
                    <CButtonGroup>
                      <CButton
                        v-if="edit_field != itemIndex(item['field'])"
                        size="sm"
                        color="success"
                        @click="editFieldMapping(item['field'])"
                        ><CIcon name="cil-pencil"
                      /></CButton>
                      <CButton
                        v-if="edit_field == itemIndex(item['field'])"
                        size="sm"
                        color="primary"
                        @click="saveField(item)"
                        ><CIcon name="cil-save"
                      /></CButton>
                      <CButton
                        size="sm"
                        color="danger"
                        @click="removeField(item['field'])"
                        ><CIcon name="cil-trash"
                      /></CButton>
                    </CButtonGroup>
                  </td>
                </template>
              </CDataTable>
            </CCardBody>
          </CCard>
        </CCol>
        <CModal
          title="Delete Input"
          :closeOnBackdrop="false"
          color="danger"
          :centered="true"
          :show.sync="delete_modal"
        >
          <CForm id="deleteForm" @submit.prevent="deleteInput()">
            Are you sure you want to delete the input <b>{{ input.name }}</b
            >? Agents using this input will stop working.
            <CForm id="delete-input-confirm">
              <CInput
                v-model="delete_confirm"
                label="Input Name"
                v-bind:description="delete_error"
                required
              ></CInput>
            </CForm>
          </CForm>
          <template #footer>
            <CButton @click="dismiss()" color="secondary">No</CButton>
            <CButton type="submit" form="deleteForm" color="danger"
              >Yes</CButton
            >
          </template>
        </CModal>
      </CRow>
    </CCol>
  </CRow>
</template>

<script>
import { mapState } from "vuex";
export default {
  name: "InputDetails",
  data() {
    return {
      uuid: this.$route.params.uuid,
      loading: true,
      cardCollapse: true,
      collapse: {},
      toggleCollapse: true,
      edit_field_mapping: false,
      field_mapping_hover: false,
      edit_config: false,
      config_hover: false,
      json_error: false,
      config_json_error: false,
      delete_modal: false,
      delete_confirm: "",
      delete_error: "",
      edit_field: null,
      current_field: {},
      data_types: [],
      changes_made: false,
    };
  },
  computed: mapState(["input"]),
  created() {
    this.$store.dispatch("getInput", this.$route.params.uuid).then((resp) => {
      this.loading = false;
    });
    this.$store
      .dispatch("getDataTypes", { organization: this.organization })
      .then((resp) => {
        this.data_types = resp.data.map((item) => {
          return { value: item.name, label: item.name };
        });
      });
  },
  methods: {
    dismiss() {
      this.delete_modal = false;
      this.delete_confirm = "";
      this.delete_error = "";
    },
    deleteInput() {
      let uuid = this.uuid;
      this.$store.dispatch("deleteInput", uuid).then((resp) => {
        this.$router.push({ path: "/inputs" });
      });
    },
    jsonToString(data) {
      return JSON.stringify(data, undefined, 4);
    },
    editFieldMapping(field) {
      this.edit_field = this.input.field_mapping["fields"]
        .map((item) => {
          return item["field"];
        })
        .indexOf(field);
    },
    itemIndex(field) {
      return this.input.field_mapping["fields"]
        .map((item) => {
          return item["field"];
        })
        .indexOf(field);
    },
    addField() {
      let field = {
        field: "field." + Math.ceil(Math.random() * 10000),
        alias: "hostname",
        data_type: "host",
        tlp: 3,
        tags: [],
      };
      this.input.field_mapping["fields"].push(field);
      console.log(this.input.field_mapping)
      this.editFieldMapping(field["field"]);
    },
    saveField(field) {
      this.edit_field = null;
      this.changes_made = true;
    },
    removeField(field) {
      this.input.field_mapping["fields"] = this.input.field_mapping[
        "fields"
      ].filter((item) => item["field"] != field);
      this.changes_made = true;
    },
    discardChanges() {
      this.$store.dispatch("getInput", this.$route.params.uuid).then((resp) => {
        this.loading = false;
      });
      this.changes_made = false;
    },
    addFieldTag(field, tag) {
      if (field["tags"].includes(tag)) {
        field["tags"] = field["tags"].filter((t) => t != tag);
      } else {
        field["tags"].push(tag);
      }
    },
    convertFieldMapping(event) {
      try {
        this.input.field_mapping = JSON.parse(event);
        this.json_error = false;
      } catch {
        this.input.field_mapping = this.input.field_mapping;
        this.json_error = true;
      }
    },
    convertConfig(event) {
      try {
        this.input.config = JSON.parse(event);
        this.config_json_error = false;
      } catch {
        this.input.config = this.input.config;
        this.config_json_error = true;
      }
    },
    updateConfig() {
      let uuid = this.uuid;
      let config = null;
      try {
        config = JSON.parse(JSON.stringify(this.input.config));
        this.config_json_error = false;
      } catch {
        config = null;
        this.config_json_error = true;
      }
      if (config) {
        this.$store
          .dispatch("updateInput", { uuid: uuid, data: { config: config } })
          .then((resp) => {
            this.edit_config = false;
          });
      }
    },
    updateFieldMapping() {
      let uuid = this.uuid;
      let field_mapping = null;
      try {
        field_mapping = JSON.parse(JSON.stringify(this.input.field_mapping));
        this.json_error = false;
      } catch {
        field_mapping = null;
        this.json_error = true;
      }

      if (field_mapping) {
        this.$store
          .dispatch("updateInput", {
            uuid: uuid,
            data: { field_mapping: field_mapping },
          })
          .then((resp) => {
            this.edit_field_mapping = false;
            this.changes_made = false;
          });
      }
    },
    expandAll() {
      for (const c in this.collapse) {
        if (!this.collapse[c]) {
          this.collapse[c] = true;
        }
      }

      this.toggleCollapse = false;
    },
    collapseAll() {
      for (const c in this.collapse) {
        if (this.collapse[c]) {
          this.collapse[c] = false;
        }
      }
      this.toggleCollapse = true;
    },
  },
  filters: {
    firstTwo: function (value) {
      if (!value) return "";
      value = value.toString();
      return value.substring(0, 2);
    },
    capitalize: function (value) {
      if (!value) return "";
      value = value.toString();
      return value.toUpperCase();
    },
    truncate: function (value) {
      let maxLength = 250;
      if (!value) return "";
      value = value.toString();
      if (value.length > maxLength) {
        return value.substring(0, maxLength) + "...";
      } else {
        return value.substring(0, maxLength);
      }
    },
  },
};
</script>
