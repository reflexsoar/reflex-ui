<template>
  <CRow>
    <link
      rel="stylesheet"
      href="https://unpkg.com/vue-multiselect@2.1.0/dist/vue-multiselect.min.css"
    />
    <CCol col v-if="loading">
      <div style="margin: auto; text-align: center; verticle-align: middle">
        <CSpinner color="dark" style="width: 6rem; height: 6rem" />
      </div>
    </CCol>
    <CCol col v-if="!loading">
      <CRow class="page-heading page-heading-row">
        <CCol>
          <h1>{{ input.name }}</h1>
        </CCol>
      </CRow>
      <CTabs
        :activeTab.sync="activeTab"
        addNavWrapperClasses="page-nav"
        addTabClasses="page-nav-tab-body"
        addNavClasses="page-nav-tab"
      >
        <CTab title="Overview">
          <h2 class="page-sub-header">Overview</h2>
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
                    v-for="(tag, i) in input.tags"
                    :key="i"
                  >
                    <CBadge class="tag tag-list" color="info" size="sm" disabled>{{
                      tag
                    }}</CBadge>
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
        </CTab>
        <CTab title="Configuration">
          <CRow class="page-sub-header">
            <CCol>
              <h2>Configuration</h2>
            </CCol>
            <CCol>
              <CAlert
                        :show.sync="config_json_error"
                        color="danger"
                        closeButton
                        class="text-left"
                      >
                        Invalid JSON. Please check your config before submitting.
                      </CAlert>
                      </CCol>
            <CCol class="text-right">
              <CButton
                v-bind:disabled="config_json_error"
                color="primary"
                @click="editConfig()"
                >{{ edit_config ? "Save" : "Edit" }} Config</CButton
              ><span v-if="edit_config"
                >&nbsp;
                <CButton
                  color="danger"
                  @click="
                    edit_config = !edit_config;
                    config_json_error = false;
                  "
                  >Discard Changes</CButton
                ></span
              >
            </CCol>
          </CRow>

          <CCard>
            <CCardBody>
              <CTabs
                :fade="false"
                variant="pills"
                :vertical="{ navs: 'col-md-2', content: 'col-md-10' }"
              >
                <CTab title="Host Configuration"
                  ><CRow
                    ><CCol>
                      
                      <h3>Host Configuration</h3></CCol
                    ></CRow
                  ><CRow>
                    <CCol col="4">
                      <label>Hosts</label><br />
                      <div v-if="!edit_config">
                        <li
                          style="display: inline; margin-right: 2px"
                          v-for="(host, i) in input.config['hosts']"
                          :key="i"
                        >
                          <CBadge class="tag tag-list" color="info" size="sm">{{
                            host
                          }}</CBadge>
                        </li>
                        <br /><br />
                      </div>
                      <div v-else>
                        <multiselect
                          v-model="input.config['hosts']"
                          :taggable="true"
                          @tag="addMultiSelectValue(input.config['hosts'], $event)"
                          :options="hosts"
                          :multiple="true"
                          :close-on-select="false"
                          placeholder="Select"
                          :preselect-first="true"
                        ></multiselect
                        ><br />
                      </div>
                    </CCol>
                    <CCol col="4">
                      <label>Distro</label><br />
                      <div v-if="!edit_config">
                        {{ input.config["distro"] }}<br /><br />
                      </div>
                      <div v-else>
                        <CSelect :value.sync="input.config['distro']" :options="distros">
                        </CSelect>
                      </div>
                    </CCol>
                    <CCol col="4">
                      <label>Alert Index</label><br />
                      <div v-if="!edit_config">
                        {{ input.config["index"] }}<br /><br />
                      </div>
                      <div v-else>
                        <CInput v-model="input.config['index']" />
                      </div>
                    </CCol>
                    <CCol col="4">
                      <label>Lucene Filter</label><br />
                      <div v-if="!edit_config">
                        {{ input.config["lucene_filter"] }}<br /><br />
                      </div>
                      <div v-else>
                        <CInput v-model.str="input.config['lucene_filter']" />
                      </div>
                      
                    </CCol>
                    <CCol col="4">
                      <label>HTTP scheme</label><br />
                      <div v-if="!edit_config">
                        {{ input.config["scheme"] }}<br /><br />
                      </div>
                      <div v-else>
                        <CSelect :value.sync="input.config['scheme']" :options="['http', 'https']">
                        </CSelect>
                      </div>
                    </CCol>
                    <CCol col="4">
                      <label>Auth Method</label><br />
                      <div v-if="!edit_config">
                        {{ input.config["auth_method"] }}<br /><br />
                      </div>
                      <div v-else>
                        <CSelect :value.sync="input.config['auth_method']" :options="['http_auth', 'api_key']">
                        </CSelect>
                      </div>
                    </CCol>
                    <CCol col="4">
                      <label>Verify Hostname</label><br />
                      <div v-if="!edit_config">
                        {{ input.config["check_hostname"] ? "Yes" : "No" }}<br /><br />
                      </div>
                      <div v-else>
                        <CSwitch
                                  v-bind:checked.sync="input.config['check_hostname']"
                                  color="success"
                                  label-on="Yes"
                                  label-off="No"
                                />
                      </div>
                    </CCol>
                    <CCol col="4">
                      <label>TLS Verification Mode</label><br />
                      <div v-if="!edit_config">
                        {{ input.config["cert_verification"] }}<br /><br />
                      </div>
                      <div v-else>
                        <CSelect :value.sync="input.config['cert_verification']" :options="['none', 'certificate', 'required']">
                        </CSelect>
                      </div>
                      
                    </CCol>
                  </CRow>
              </CTab>
              <CTab title="Event Base Configuration">
                  <CRow
                    ><CCol>
                      
                      <h3>Event Base Configuration</h3></CCol
                    ></CRow
                  ><CRow>
                    <CCol col="12">
                      <h5>Event Base Configuration</h5>
                    </CCol>
                    <CCol col="4">
                      <label>Event Title Field</label><br />
                      <div v-if="!edit_config">
                        {{ input.config["rule_name"] }}<br /><br />
                      </div>
                      <div v-else>
                        <CInput v-model="input.config['rule_name']" />
                      </div>
                      
                    </CCol>
                    <CCol col="4">
                      <label>Description Field</label><br />
                      <div v-if="!edit_config">
                        {{ input.config["description_field"] }}<br /><br />
                      </div>
                      <div v-else>
                        <CInput v-model="input.config['description_field']" />
                      </div>

                      
                      
                    </CCol>
                    <CCol col="4">
                      <label>Reference Field</label><br />
                      <div v-if="!edit_config">
                        {{ input.config["source_reference"] }}<br /><br />
                      </div>
                      <div v-else>
                        <CInput v-model="input.config['source_reference']" />
                      </div>
                    </CCol>
                    <CCol col="4">
                      <label>Severity Field</label><br />
                      <div v-if="!edit_config">
                        {{ input.config["severity_field"] }}<br /><br />
                      </div>
                      <div v-else>
                        <CInput v-model="input.config['severity_field']" />
                      </div>
                    </CCol>
                    <CCol col="4">
                      <label>Original Date Field</label><br />
                      <div v-if="!edit_config">
                        {{ input.config["original_date_field"] }}<br /><br />
                      </div>
                      <div v-else>
                        <CInput v-model="input.config['original_date_field']" />
                      </div>
                    </CCol>
                    <CCol col="4">
                      <label>Search Size</label><br />
                      <div v-if="!edit_config">
                        {{ input.config["search_size"] }} events<br /><br />
                      </div>
                      <div v-else>
                        <CInput v-model.number="input.config['search_size']" />
                      </div>
                    </CCol>
                    <CCol col="4">
                      <label>Search Period</label><br />
                      <div v-if="!edit_config">
                        {{ input.config["search_period"] }}<br /><br />
                      </div>
                      <div v-else>
                        <CInput v-model.str="input.config['search_period']" />
                      </div>
                    </CCol>
                    <CCol col=12>
                      <label>Tag Fields</label><br />
                      <div v-if="!edit_config">
                      <li
                        style="display: inline; margin-right: 2px"
                        v-for="(field, i) in input.config['tag_fields']"
                        :key="i"
                      >
                        <CBadge class="tag tag-list" color="info" size="sm">{{
                          field
                        }}</CBadge>
                      </li>
                      <br /><br />
                      </div>
                      <div v-else>
                        <multiselect
                          v-model="input.config['tag_fields']"
                          :taggable="true"
                          @tag="addMultiSelectValue(input.config['tag_fields'], $event)"
                          :options="[]"
                          :multiple="true"
                          :close-on-select="false"
                          placeholder="Select"
                          :preselect-first="true"
                        ></multiselect
                        ><br />
                        </div>
                    </CCol>
                    <CCol col=12>
                      <label>Signature Fields</label><br />
                      <div v-if="!edit_config">
                      <li
                        style="display: inline; margin-right: 2px"
                        v-for="(field, i) in input.config['signature_fields']"
                        :key="i"
                      >
                        <CBadge class="tag tag-list" color="info" size="sm">{{
                          field
                        }}</CBadge>
                      </li>
                      <br /><br />
                      </div>
                      <div v-else>
                        <multiselect
                          v-model="input.config['signature_fields']"
                          :taggable="true"
                          @tag="addMultiSelectValue(input.config['signature_fields'], $event)"
                          :options="[]"
                          :multiple="true"
                          :close-on-select="false"
                          placeholder="Select"
                          :preselect-first="true"
                        ></multiselect
                        ><br />
                        </div>
                        
                    </CCol>
                    
                  </CRow>
                  <CRow>
                    <CCol>
                      <label>Static Tags</label><br />
                      <div v-if="!edit_config">
                        <li
                          style="display: inline; margin-right: 2px"
                          v-for="(field, i) in input.config['static_tags']"
                          :key="i"
                        >
                          <CBadge class="tag tag-list" color="info" size="sm">{{
                            field
                          }}</CBadge>
                        </li>
                        <br /><br />
                      </div>
                      <div v-else>
                        <multiselect
                          v-model="input.config['static_tags']"
                          :taggable="true"
                          @tag="addMultiSelectValue(input.config['static_tags'], $event)"
                          :options="[]"
                          :multiple="true"
                          :close-on-select="false"
                          placeholder="Select"
                          :preselect-first="true"
                        ></multiselect
                        ><br />
                      </div>
                    </CCol>
                  </CRow>
                </CTab>
                <CTab title="Data Source Mapping">
                <CRow
                    ><CCol>
                      
                      <h3>Data Source Mapping</h3>
                      <p>Data Sources provide a mechanism for establishing exactly what data an input may contain.  Detection rules will automatically target inputs to run against by the data sources available within the input.</p></CCol
                    ></CRow
                  >
                    <CRow>
                      <CCol>
                        <h4>Data Source Templates</h4>
                        <p>Data Source Templates provide a mechanism for automatically discovering what data sources are available in the input.  More than one Data Source Template can be selected.  Periodically the index will be queried to see if the criteria is met for each Data Source and the data sources will be updated.</p>
                        <label>Data Source Templates</label><br />
                        
                        <div v-if="!edit_config">
                          <div v-if="input.data_source_templates.length == 0">
                            <p>No data source templates mapped to this input.</p>
                          </div>
                          <li
                            style="display: inline; margin-right: 2px"
                            v-for="(field, i) in input.data_source_templates"
                            :key="i"
                          >
                            <CBadge class="tag tag-list" color="info" size="sm">{{
                              field
                            }}</CBadge>
                          </li>
                          <br /><br />
                        </div>
                        <div v-else>
                          <multiselect
                            v-model="input.data_source_templates"
                            :taggable="true"
                            @tag="addMultiSelectValue(input.data_source_templates, $event)"
                            :options="data_source_templates"
                            :multiple="true"
                            :close-on-select="false"
                            placeholder="Select"
                            :preselect-first="true"
                          ></multiselect
                          ><br />
                        </div>
                      </CCol>
                    </CRow>
                    <CRow>
                    <CCol>
                      <h4>Manual Data Sources</h4>
                      <label>Data Sources</label><br />
                      
                      <div v-if="!edit_config">
                        <div v-if="input.mitre_data_sources.length == 0">
                        <p>No data sources mapped to this input.</p>
                      </div>
                        <li
                          style="display: inline; margin-right: 2px"
                          v-for="(field, i) in input.mitre_data_sources"
                          :key="i"
                        >
                          <CBadge class="tag tag-list" color="info" size="sm">{{
                            field
                          }}</CBadge>
                        </li>
                        <br /><br />
                      </div>
                      <div v-else>
                        <multiselect
                          v-model="input.mitre_data_sources"
                          :taggable="true"
                          @tag="addMultiSelectValue(input.mitre_data_sources, $event)"
                          :options="mitre_data_sources"
                          :multiple="true"
                          :close-on-select="false"
                          placeholder="Select one"
                        ></multiselect
                        ><br />
                      </div>
                    </CCol>
                  </CRow>

                </CTab>
                <CTab title="Advanced Editing"
                  ><CRow
                    ><CCol
                      >
                      <h3>Advanced Editing - JSON View</h3></CCol
                    ></CRow
                  ><CRow
                    ><CCol
                      v-if="edit_config"
                      style="overflow-y: scroll; height: calc(100vh - 300px)"
                    >
                      <CCardBody v-if="edit_config">
                        <CTextarea
                          :value="jsonToString(input.config)"
                          @change="convertConfig($event)"
                          style="height: 100%"
                          rows="20"
                        />
                      </CCardBody>
                    </CCol>
                    <CCol v-else style="overflow-y: scroll; height: calc(100vh - 300px)">
                      <div>
                        <pre> {{ input.config }}</pre>
                      </div>
                    </CCol></CRow
                  >
                </CTab>
              </CTabs>
            </CCardBody>
          </CCard>
        </CTab>
        
        <CTab title="Field Mapping">
          <CRow class="page-sub-header">
            <CCol>
              <h2>Field Mapping</h2>
            </CCol>
            <CCol class="text-right"
              ><CButton size="sm" color="success" @click="addField()">New Field</CButton
              >&nbsp;
              <CButton
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
              ></CCol
            >
          </CRow>

          <CCard>
            <CCardBody style="padding: 0px">
              <CDataTable
                :items="input.field_mapping['fields']"
                :key="input.field_mapping['fields']"
                :fields="[
                  'field',
                  'alias',
                  'data_type',
                  { key: 'tlp', label: 'TLP' },
                  'tags',
                  'actions',
                ]"
                :noItemsView="{
                  noResults: 'No Fields Mapped',
                  noItems: 'No Fields Mapped',
                }"
                :itemsPerPage="10"
                :pagination="true"
                :sorter="true"
                :columnFilter="true"
                size="sm"
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
                      <CSelect :options="data_types" :value.sync="item['data_type']" />
                    </div>
                    <div v-else>{{ item["data_type"] }}</div>
                  </td>
                </template>
                <template #tlp="{ item }">
                  <td>
                    <div v-if="edit_field == itemIndex(item['field'])">
                      <CSelect :options="[1, 2, 3, 4]" :value.sync="item['tlp']" />
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
                        <CButton color="primary" size="sm" disabled="">{{ tag }}</CButton>
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
        </CTab>
      </CTabs>

      <CRow>
        <CCol col="12"> </CCol>
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
            <CButton type="submit" form="deleteForm" color="danger">Yes</CButton>
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
      hosts: [],
      distros: ["elasticsearch", "opensearch"],
      activeTab: 0,
      data_source_templates: []
    };
  },
  computed: mapState(["input", "mitre_data_sources"]),
  created() {
    this.$store.dispatch("getMitreDataSources");
    this.$store.dispatch("getInput", this.$route.params.uuid).then((resp) => {
      this.loading = false;
      this.hosts = this.input.config["hosts"];
    });
    this.$store
      .dispatch("getDataTypes", { organization: this.input.organization })
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
      this.editFieldMapping(field["field"]);
    },
    saveField(field) {
      this.edit_field = null;
      this.changes_made = true;
    },
    removeField(field) {
      this.input.field_mapping["fields"] = this.input.field_mapping["fields"].filter(
        (item) => item["field"] != field
      );
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
    addMultiSelectValue(field, val) {
      if (field.includes(val)) {
        field = field.filter((t) => t != val);
      } else {
        field.push(val);
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
    editConfig() {
      console.log(this.edit_config);
      if (this.edit_config) {
        this.updateConfig();
      }
      this.edit_config = !this.edit_config;
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

      let update_payload = {
        config: this.input.config,
        mitre_data_sources: this.input.mitre_data_sources
      };

      if (config) {
        this.$store
          .dispatch("updateInput", { uuid: uuid, data: update_payload })
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
            console.log(this.input);
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
    addHost(host) {
      this.hosts.push(host);
      this.input.config["hosts"].push(host);
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
