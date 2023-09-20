<template>
  <CRow>
    <CCol col>
      <h1 class="page-heading page-heading-no-nav">
        Create Input<button
          type="button"
          class="kb"
          onclick="window.open('https://docs.reflexsoar.com/en/latest/inputs')"
        >
          <CIcon name="cil-book" size="lg" />
        </button>
      </h1>

      <CForm @submit.prevent="createInput">
        <CCard
          ><link
            rel="stylesheet"
            href="https://unpkg.com/vue-multiselect@2.1.0/dist/vue-multiselect.min.css"
          />
          <CCardBody>
            <CRow>
              <CCol>
                <CTabs
                  variant="pills"
                  :active-tab.sync="current_step"
                  :vertical="{ navs: 'col-md-2', content: 'col-md-10' }"
                >
                  <CTab title="1. Input Overview">
                    <h2>Input Overview</h2>
                    <CAlert :show.sync="from_source_input" color="warning">
                      <b>WARNING: </b>This input has been cloned from another input.
                      Please verify all fields before submitting. The following fields are
                      not copied:<br />
                      <ul style="margin-bottom: 0px">
                        <li>Organization</li>
                        <li>Credential</li>
                      </ul>
                    </CAlert>
                    <CSelect
                      v-if="current_user.permissions.view_organizations"
                      placeholder="Select an Organization..."
                      required
                      :value.sync="organization"
                      :options="formattedOrganizations()"
                      @change="refreshCredentials($event)"
                      label="Organization"
                    />
                    <CInput
                      placeholder="Input Name"
                      required
                      v-model="name"
                      label="Input Name"
                    >
                    </CInput>

                    <CRow>
                      <CCol>
                        <CTextarea
                          placeholder="Enter a description for the input.  The more detail the better."
                          required
                          v-model="description"
                          label="Description"
                          rows="5"
                        >
                        </CTextarea>
                      </CCol>
                    </CRow>
                    <CRow>
                      <CCol>
                        <label>Used for Detections</label><br />
                        <CSwitch
                          :checked.sync="detections_only"
                          color="success"
                          label-on="Yes"
                          label-off="No"
                        />
                        <p class="text-muted">
                          If this input is used for detections, Reflex Agents will not
                          attempt to poll it for events like a standard Input.
                        </p>
                      </CCol>
                    </CRow>
                    <CRow>
                      <CCol>
                        <h3>Tags</h3>
                        <multiselect
                          v-model="selected"
                          :close-on-select="false"
                          placeholder="Select tags to apply to this input"
                          :taggable="true"
                          tag-placeholder="Add new tag"
                          track-by="name"
                          label="name"
                          :options="tag_list"
                          :multiple="true"
                          @tag="addTag"
                        >
                        </multiselect
                        ><br />
                      </CCol>
                    </CRow>
                  </CTab>
                  <CTab title="2. Plugin Configuration">
                    <CRow>
                      <CCol>
                        <h2>Plugin Configuration</h2>
                        <p>
                          The input requires specific configurations in order for it to
                          work. Enter them below.
                        </p>
                        <CRow>
                          <CCol lg="6" sm="12">
                            <CSelect
                              label="Plugin"
                              placeholder="Select an input type"
                              :options="['Elasticsearch']"
                              v-model="plugin"
                              @change="populateConfig($event)"
                            >
                            </CSelect>
                          </CCol>
                          <CCol lg="6" sm="12">
                            <CSelect
                              label="Credential"
                              :options="credential_list"
                              :value.sync="credential"
                              placeholder="Select a credential if required by the input"
                              description="This credential will be used to connect to the target system"
                            >
                            </CSelect>
                          </CCol>
                        </CRow>
                        <CRow v-if="plugin == 'Elasticsearch'">
                          <CCol v-if="plugin == 'Elasticsearch'">
                            <CRow>
                              <CCol col="12">
                                <h5>Elasticsearch Configuration</h5>
                                <p>
                                  The below fields tells Reflex how to interact with
                                  Elasticsearch.
                                </p>
                              </CCol>
                              <CCol col="12">
                                <label>Elasticsearch Hosts</label>
                                <multiselect
                                  v-model="config['hosts']"
                                  :close-on-select="false"
                                  :options="[]"
                                  placeholder="Select hosts to add to this config"
                                  :taggable="true"
                                  tag-placeholder="Add new host"
                                  :multiple="true"
                                  @tag="addESHost(config['hosts'], $event)"
                                /><br />
                              </CCol>
                              <CCol col="4">
                                <CSelect
                                  :value.sync="config['distro']"
                                  :options="['opensearch', 'elasticsearch']"
                                  label="Distro"
                                />
                              </CCol>
                              <CCol col="4">
                                <CInput
                                  v-model="config['index']"
                                  label="Alert Index"
                                  description="The target index where Reflex should look for events"
                                />
                              </CCol>
                              <CCol col="4">
                                <CInput
                                  v-model="config['lucene_filter']"
                                  label="Lucene Filter"
                                  description="Provide a lucene filter to further limit what events are pulled in to Reflex"
                                />
                              </CCol>
                              <CCol col="4">
                                <CSelect
                                  :options="['http', 'https']"
                                  :value.sync="config['scheme']"
                                  label="HTTP Scheme"
                                  description="Connect to Elasticsearch over TLS/SSL or plaintext"
                                />
                              </CCol>
                              <CCol col="4">
                                <CSelect
                                  :options="['http_auth', 'api_key']"
                                  :value.sync="config['auth_method']"
                                  label="Auth Method"
                                  description="api_key: Elastic API key | http_auth: Basic Auth"
                                />
                              </CCol>
                              <CCol col="4">
                                <CInput
                                  v-model="config['cafile']"
                                  placeholder="/etc/ssl/certs/cacert"
                                  label="CA Cert Path"
                                  description="The path to your clusters CA public certificate"
                                />
                              </CCol>
                              <CCol col="2">
                                <label>Verify Hostname</label><br />
                                <CSwitch
                                  v-bind:checked.sync="config['check_hostname']"
                                  color="success"
                                  label-on="Yes"
                                  label-off="No"
                                />
                              </CCol>
                              <CCol col="2">
                                <CSelect
                                  :options="['none', 'certificate', 'required']"
                                  :value.sync="config['cert_verification']"
                                  label="TLS Verification Mode"
                                />
                              </CCol>
                            </CRow>
                            <CRow>
                              <CCol col="12">
                                <h5>Event Base Configuration</h5>
                                <p>
                                  The below fields will determine what data is included on
                                  an Event shipped by the Reflex agent.
                                </p>
                              </CCol>
                              <CCol col="4">
                                <CInput
                                  v-model="config['rule_name']"
                                  label="Event Title Field"
                                />
                              </CCol>
                              <CCol col="4">
                                <CInput
                                  v-model="config['description_field']"
                                  label="Description Field"
                                  description="This field will extract a description for the Event"
                                />
                              </CCol>
                              <CCol col="4">
                                <CInput
                                  v-model="config['source_reference']"
                                  label="Reference Field"
                                  description="This should be a field that provides a unique value per event"
                                />
                              </CCol>
                              <CCol col="4">
                                <CInput
                                  v-model="config['severity_field']"
                                  label="Severity Field"
                                  description="This should be a field that provides a numeric severity between 1-4"
                                />
                              </CCol>
                              <CCol col="4">
                                <CInput
                                  v-model="config['original_date_field']"
                                  label="Original Date Field"
                                  description="This field is used to pull the original log events datetime. .e.g @timestamp"
                                />
                              </CCol>
                              <CCol col="4">
                                <label>Tag Fields</label><br />
                                <multiselect
                                  v-model="config['tag_fields']"
                                  :close-on-select="false"
                                  :options="[]"
                                  placeholder="Select the fields from which tags will be derived"
                                  :taggable="true"
                                  tag-placeholder="Add new field"
                                  :multiple="true"
                                  @tag="addESHost(config['tag_fields'], $event)"
                                /><br />
                              </CCol>
                              <CCol col="4">
                                <label>Signature Fields</label><br />
                                <multiselect
                                  v-model="config['signature_fields']"
                                  :close-on-select="false"
                                  :options="[]"
                                  placeholder="Select the fields used to compute the events signature"
                                  :taggable="true"
                                  tag-placeholder="Add new field"
                                  :multiple="true"
                                  @tag="addESHost(config['signature_fields'], $event)"
                                /><br />
                              </CCol>
                              <CCol col="4">
                                <CInput
                                  v-model.number="config['search_size']"
                                  label="Search Size"
                                  description="How many events to return on each poll"
                                />
                              </CCol>
                              <CCol col="4">
                                <CInput
                                  v-model="config['search_period']"
                                  label="Search Period"
                                  description="How far back in time to go in the source index"
                                />
                              </CCol>
                              <CCol col="4">
                                <label>Static Tags</label><br />
                                <multiselect
                                  v-model="config['static_tags']"
                                  :close-on-select="false"
                                  :options="[]"
                                  placeholder="Select the static tags to apply to events"
                                  :taggable="true"
                                  tag-placeholder="Add new static tag"
                                  :multiple="true"
                                  @tag="addESHost(config['static_tags'], $event)"
                                /><br />
                              </CCol>
                            </CRow>
                          </CCol>
                        </CRow>
                        <CRow v-else>
                          <CCol>
                            <CTextarea
                              placeholder="{}"
                              description="The configuration tells the reflex agent what sources to poll."
                              required
                              v-model="config"
                              label="Configuration"
                              rows="8"
                            >
                            </CTextarea>
                          </CCol>
                        </CRow>
                      </CCol>
                    </CRow>
                  </CTab>
                  <CTab title="3. Field Mappings">
                    <CRow>
                      <CCol>
                        <h2>
                          Field Mappings
                          <CButton size="sm" color="success" @click="addField()"
                            >+</CButton
                          >
                        </h2>
                        <CAlert color="warning">
                          <b>Deprecation Warning:</b> Directly defining field mappings on
                          Inputs will be removed in a future release. It is recommended to
                          use
                          <a
                            target="_blank"
                            href="https://docs.reflexsoar.com/en/latest/field-templates/"
                            >Field Templates</a
                          >
                          instead.
                        </CAlert>
                        <p>
                          Field mappings control how source data is mapped to a data type
                          in Reflex. Assigning a source log field to a data type allows
                          you to leverage functionality in Reflex for that specific data
                          type. Mapping an IP address to the <b>IP</b> data type for
                          example will allow you to do CIDR notation checks on it in RQL.
                        </p>
                        <CCard>
                          <CCardBody style="padding: 0px">
                            <CRow style="padding-bottom: 10px">
                              <CCol col="12">
                                <CDataTable
                                  :responsive="true"
                                  :items="field_mapping['fields']"
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
                                >
                                  <template #tags="{ item }">
                                    <td>
                                      <CIcon name="cilTags" />&nbsp;
                                      <li
                                        style="display: inline; margin-right: 2px"
                                        v-for="tag in item['tags']"
                                        :key="tag"
                                      >
                                        <CButton color="primary" size="sm" disabled="">{{
                                          tag
                                        }}</CButton>
                                      </li>
                                    </td>
                                  </template>
                                  <template #actions="{ item }">
                                    <td class="text-right">
                                      <CButtonGroup>
                                        <!--<CButton size="sm" color="success" @click="removeField(item['field'])"><CIcon name='cil-pencil'/></CButton>-->
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
                              </CCol>
                            </CRow>
                          </CCardBody>
                        </CCard>
                      </CCol>
                    </CRow>
                  </CTab>
                  <CTab title="4. Sigma Configuration">
                    <CRow>
                      <CCol>
                        <h3>Sigma Configuration</h3>
                        <p>
                          Providing Sigma configurations allows
                          <CLink to="/detections">Detections</CLink> to automatically
                          convert Sigma rules that use this input to the target pipeline
                          and backend. The values selected here can be overriden at the
                          time of Sigma to Detection conversion.
                        </p>
                      </CCol>
                    </CRow>
                    <CRow>
                      <CCol>
                        <CSelect
                          :options="['ecs_windows', 'custom']"
                          :value.sync="sigma_pipeline"
                          label="Pipeline"
                          placeholder="Select a pipeline"
                          description="The pipeline to use when converting Sigma rules to Detections"
                        />
                      </CCol>
                    </CRow>
                    <CRow v-if="sigma_pipeline == 'custom'">
                      <CCol>
                        <CTextarea
                          label="Custom Pipeline Configuration"
                          v-model="sigma_custom_pipeline"
                          rows="5"
                          description="Custom pipelines can be configured by supplying a YAML configuration.  Refer to <a href='https://sigmahq-pysigma.readthedocs.io/en/latest/Processing_Pipelines.html'>SigmaHQ's documentation</a> for more information."
                        />
                      </CCol>
                    </CRow>
                    <CRow>
                      <CCol>
                        <CSelect
                          :options="['opensearch', 'elasticsearch']"
                          :value.sync="sigma_backend"
                          label="Backend"
                          placeholder="Select a backend"
                          description="The backend to use when converting Sigma rules to Detections"
                        />
                      </CCol>
                    </CRow>
                  </CTab>
                  <CTab title="5. MITRE Configuration">
                    <CRow>
                      <CCol>
                        <h3>MITRE Configuration</h3>
                        <p>
                          Providing MITRE configurations allows
                          <CLink to="/detections">Detections</CLink> to automatically
                          recommend detections that require specific data sources.
                        </p>
                      </CCol>
                    </CRow>
                    <CRow>
                      <CCol>
                        <label>Data Sources</label><br />
                        <multiselect
                          v-model="selected_mitre_data_sources"
                          :close-on-select="false"
                          :options="mitre_data_sources"
                          placeholder="Select the MITRE Data Sources that apply to this input"
                          :taggable="true"
                          tag-placeholder="Add MITRE Data Source"
                          :multiple="true"
                        />
                      </CCol>
                    </CRow>
                  </CTab>
                  <CTab title="6. Confirmation">
                    <CRow>
                      <CCol col="12">
                        <h3>Confirmation</h3>
                        <h5>{{ name }}</h5>
                        <CIcon name="cilTags" v-if="selected.length > 0" />&nbsp;
                        <li
                          style="display: inline; margin-right: 2px"
                          v-for="tag in selected"
                          :key="tag.name"
                        >
                          <CButton color="primary" size="sm" disabled="">{{
                            tag.name
                          }}</CButton>
                        </li>
                        <br /><br />
                        <b>Description:</b><br />{{ description }}<br />
                        <br />
                        <b>Plugin: </b>{{ plugin }}<br />
                        <!--<b>Credential: </b>{{credential_list ? credential_list.filter(item => item.value == credential)[0].label : ''}}<br><br>-->
                        <h5>Plugin Config</h5>
                        <CRow>
                          <CCol col="4">
                            <b>Hosts</b><br />
                            <li
                              style="display: inline; margin-right: 2px"
                              v-for="host in config['hosts']"
                              :key="host"
                            >
                              <CButton color="primary" size="sm" disabled>{{
                                host
                              }}</CButton>
                            </li>
                            <br /><br />
                          </CCol>
                          <CCol col="4">
                            <b>Distro</b><br />
                            {{ config["distro"] }}<br /><br />
                          </CCol>
                          <CCol col="4">
                            <b>Alert Index</b><br />
                            {{ config["index"] }}<br /><br />
                          </CCol>
                          <CCol col="4">
                            <b>Lucene Filter</b><br />
                            {{ config["lucene_filter"] }}<br /><br />
                          </CCol>
                          <CCol col="4">
                            <b>HTTP scheme</b><br />
                            {{ config["scheme"] }}<br /><br />
                          </CCol>
                          <CCol col="4">
                            <b>Auth Method</b><br />
                            {{ config["auth_method"] }}<br /><br />
                          </CCol>
                          <CCol col="4">
                            <b>Verify Hostname</b><br />
                            {{ config["check_hostname"] ? "Yes" : "No" }}<br /><br />
                          </CCol>
                          <CCol col="4">
                            <b>TLS Verification Mode</b><br />
                            {{ config["cert_verification"] }}<br /><br />
                          </CCol>
                        </CRow>
                        <CRow>
                          <CCol col="12">
                            <h5>Event Base Configuration</h5>
                          </CCol>
                          <CCol col="4">
                            <b>Event Title FIeld</b><br />
                            {{ config["rule_name"] }}<br /><br />
                          </CCol>
                          <CCol col="4">
                            <b>Description Field Field</b><br />
                            {{ config["description_field"] }}<br /><br />
                          </CCol>
                          <CCol col="4">
                            <b>Reference Field</b><br />
                            {{ config["source_reference"] }}<br /><br />
                          </CCol>
                          <CCol col="4">
                            <b>Severity Field</b><br />
                            {{ config["severity_field"] }}<br /><br />
                          </CCol>
                          <CCol col="4">
                            <b>Tag Fields</b><br />
                            <li
                              style="display: inline; margin-right: 2px"
                              v-for="field in config['tag_fields']"
                              :key="field"
                            >
                              <CButton color="primary" size="sm" disabled>{{
                                field
                              }}</CButton>
                            </li>
                            <br /><br />
                          </CCol>
                          <CCol col="4">
                            <b>Signature Fields</b><br />
                            <li
                              style="display: inline; margin-right: 2px"
                              v-for="field in config['signature_fields']"
                              :key="field"
                            >
                              <CButton color="primary" size="sm" disabled>{{
                                field
                              }}</CButton>
                            </li>
                            <br /><br />
                          </CCol>
                          <CCol col="4">
                            <b>Search Size</b><br />
                            {{ config["search_size"] }}<br /><br />
                          </CCol>
                          <CCol col="4">
                            <b>Search Period</b><br />
                            {{ config["search_period"] }}<br /><br />
                          </CCol>
                        </CRow>
                        <h5>Field Mappings</h5>
                        <CCard>
                          <CCardBody style="padding: 0px">
                            <CDataTable
                              :responsive="true"
                              :items="field_mapping['fields']"
                              :fields="['field', 'alias', 'data_type', 'tlp', 'tags']"
                              :noItemsView="{
                                noResults: 'No Fields Mapped',
                                noItems: 'No Fields Mapped',
                              }"
                            >
                              <template #tags="{ item }">
                                <td>
                                  <CIcon name="cilTags" />&nbsp;
                                  <li
                                    style="display: inline; margin-right: 2px"
                                    v-for="tag in item['tags']"
                                    :key="tag"
                                  >
                                    <CButton color="primary" size="sm" disabled="">{{
                                      tag
                                    }}</CButton>
                                  </li>
                                </td>
                              </template>
                            </CDataTable>
                          </CCardBody>
                        </CCard>
                      </CCol>
                      <CCol col="12" class="text-right"> </CCol>
                    </CRow>
                  </CTab>
                </CTabs>
              </CCol>
            </CRow>
            <CCardFooter>
              <div class="text-right">
                <CButton
                  v-if="current_step > 0"
                  color="secondary"
                  @click="current_step -= 1"
                  >Back</CButton
                >&nbsp;
                <CButton
                  v-if="current_step < last_step"
                  color="primary"
                  @click="current_step += 1"
                  >Next</CButton
                >
                <CButton
                  v-if="current_step == last_step"
                  color="primary"
                  @click="createInput()"
                  >Create</CButton
                >
              </div>
            </CCardFooter>
          </CCardBody>
        </CCard>
      </CForm>
      <CModal
        title="Add Field Mapping"
        :closeOnBackdrop="false"
        :centered="true"
        size="lg"
        :show.sync="new_mapping"
      >
        <CAlert color="warning" :show="fieldAlreadyMapped(current_field['field'])">
          <b>Duplicate Field Maps:</b> The entered field has already been mapped, check
          the existing field mappings.
        </CAlert>
        <CRow>
          <CCol>
            <CInput :value.sync="current_field['field']" label="Field" />
            <CInput
              :value.sync="current_field['alias']"
              label="Alias"
              description="Optional"
            />
            <CSelect
              :value.sync="current_field['data_type']"
              :options="data_types"
              label="Data Type"
            />
            <CSelect
              :value.sync="current_field['tlp']"
              :options="[1, 2, 3, 4]"
              label="TLP"
            />
            <label>Tags</label><br />
            <multiselect
              v-model="current_field['tags']"
              :close-on-select="false"
              :options="[]"
              placeholder="Select tags to apply to this input"
              :taggable="true"
              tag-placeholder="Add new tag"
              :multiple="true"
              @tag="addFieldTag(current_field, $event)"
            />
          </CCol>
        </CRow>
        <template #footer>
          <CButton color="secondary" @click="dismiss()">Dismiss</CButton>
          <CButton
            color="primary"
            v-bind:disabled="fieldAlreadyMapped(current_field['field'])"
            @click="saveField()"
            >Save</CButton
          >
        </template>
      </CModal>
    </CCol>
  </CRow>
</template>

<script>
import { mapState } from "vuex";
import { vSelect } from "vue-select";
import { required, minLength, between } from "vuelidate/lib/validators";
import { parse } from "@babel/core";
import LinkCaseModal from "./LinkCaseModal.vue";

export default {
  components: { LinkCaseModal },
  name: "CreateInput",
  created() {
    this.loadTags();
    this.getSourceInput();
    this.$store.dispatch("getCredentialList", {});
    this.$store.dispatch("getMitreDataSources");
    this.$store.commit("add_start"); // Stop the success/fail add from showing up when changing from other pages
  },
  methods: {
    getSourceInput() {
      if (this.source_input) {
        this.name = "[COPY] " + this.source_input.name;
        this.description = this.source_input.description;
        this.credential = "";
        this.config = this.source_input.config;
        this.plugin = this.source_input.plugin;
        if (!this.config.hasOwnProperty("static_tags")) {
          this.$set(this.config, "static_tags", []);
        }
        if (!this.config.hasOwnProperty("tag_fields")) {
          this.$set(this.config, "tag_fields", []);
        }
        if (!this.config.hasOwnProperty("signature_fields")) {
          this.$set(this.config, "signature_fields", []);
        }
        if (this.source_input.tags) {
          this.selected = this.source_input.tags.map((tag) => {
            return { name: tag, uuid: "", color: "#ffffff" };
          });
        } else {
          this.selected = [];
        }

        this.tags = this.source_input.tags;
        this.field_mapping = this.source_input.field_mapping;
      }
    },
    createInput: function () {
      let fm = JSON.stringify(this.field_mapping, null, 0);
      let conf = JSON.stringify(this.config, null, 0);
      let name = this.name;
      let description = this.description;
      let organization = this.organization != "" ? this.organization : null;
      let credential = this.credential;
      let config = btoa(conf);
      let field_mapping = btoa(fm);
      let plugin = this.plugin;
      let detections_only = this.detections_only;
      let mitre_data_sources = this.selected_mitre_data_sources;
      let tags = this.selected.map((tag) => {
        return tag.name;
      });
      let credential_list = this.credential_list;
      this.$store
        .dispatch("createInput", {
          name,
          organization,
          description,
          config,
          field_mapping,
          plugin,
          credential,
          tags,
          detections_only,
          mitre_data_sources,
        })
        .then((resp) => {
          this.$router.go(-1);
        });
    },
    formattedOrganizations() {
      return this.organizations.map((o) => {
        return { label: o.name, value: o.uuid };
      });
    },
    addTag(newTag) {
      const t = {
        name: newTag,
        uuid: "",
        color: "#ffffff",
      };
      if (this.tags === null) {
        this.tags = [];
      }
      this.tags.push(newTag);
      this.tag_list.push(t);
      this.selected.push(t);
    },
    addFieldTag(field, tag) {
      if (field["tags"].includes(tag)) {
        field["tags"] = field["tags"].filter((t) => t != tag);
      } else {
        field["tags"].push(tag);
      }
    },
    addStaticTag(tag) {
      if (this.config["static_tags"].includes(tag)) {
        this.config["static_tags"] = this.config["static_tags"].filter((t) => t != tag);
      } else {
        this.config["static_tags"].push(tag);
      }
    },
    addESHost(field, host) {
      if (field.includes(host)) {
        field = field.filter((t) => t != host);
      } else {
        field.push(host);
      }
    },
    selectCredential(event) {
      this.credential = event.target.value;
    },
    refreshCredentials(event) {
      let organization = event.target.value;
      this.$store
        .dispatch("getCredentialList", { organization: organization, page_size: 100 })
        .then((resp) => {});
    },
    loadTags: function () {
      this.$store.dispatch("getTags").then((resp) => {
        for (let i in resp.data) {
          this.tag_list.push({ name: resp.data[i].name, uuid: resp.data[i].uuid });
        }
      });
    },
    step(i) {
      this.current_step = i;
    },
    getFieldMapping() {
      return this.field_mapping;
    },
    addField() {
      this.$store
        .dispatch("getDataTypes", { organization: this.organization })
        .then((resp) => {
          this.data_types = resp.data.map((item) => {
            return { value: item.name, label: item.name };
          });
          this.current_field = {
            field: "field." + Math.ceil(Math.random() * 10000),
            alias: "hostname",
            data_type: "host",
            tlp: 3,
            tags: [],
          };
          this.new_mapping = true;
        });
    },
    fieldAlreadyMapped(value) {
      let fieldNames = this.field_mapping["fields"].map((item) => {
        return item["field"];
      });
      return fieldNames.includes(value);
    },
    saveField() {
      this.field_mapping["fields"].push(this.current_field);
      this.current_field = {};
      this.new_mapping = false;
    },
    removeField(field) {
      this.field_mapping["fields"] = this.field_mapping["fields"].filter(
        (item) => item["field"] != field
      );
    },
    dismiss() {
      this.new_mapping = false;
      this.current_field = {};
    },
    populateConfig(event) {
      let conf = "";
      let map = "";
      let value = event.target.value;
      this.plugin = event.target.value;
      if (value == "Elasticsearch") {
        conf = {
          hosts: ["https://localhost:9200"],
          distro: "opensearch",
          index: ".siem-signals-*",
          lucene_filter: "*",
          cafile: "",
          scheme: "https",
          rule_name: "signal.rule.name",
          auth_method: "http_auth",
          search_size: 200,
          search_period: "15m",
          check_hostname: false,
          severity_field: "signal.rule.severity",
          source_reference: "signal.parent.id",
          cert_verification: "none",
          original_date_field: "@timestamp",
          description_field: "signal.rule.description",
          static_tags: [],
          tag_fields: [],
          signature_fields: [],
        };
        map = {
          fields: [
            {
              field: "host.name",
              alias: "hostname",
              data_type: "host",
              tlp: 3,
              tags: ["workstation"],
            },
          ],
        };
      }
      if (value == "Exchange Mailbox") {
        conf = {
          hosts: ["https://ews.mydomain.com"],
          mailbox_name: "phishing@reflexsoar.com",
          poll_interval: "30m",
        };
        map = {};
      }
      if (value == "API") {
        conf = { url: "https://myapi.com" };
        map = {};
      }
      if (value == "Webhook") {
        conf = { url: "https://mywebhook.com" };
        map = {};
      }

      this.field_mapping = map;
      this.config = conf;
      return;
    },
  },
  computed: {
    from_source_input: function () {
      return this.source_input != null;
    },
    ...mapState([
      "current_user",
      "credential_list",
      "organizations",
      "source_input",
      "mitre_data_sources",
    ]),
  },
  data() {
    return {
      name: "",
      description: "",
      detections_only: false,
      config: "",
      field_mapping: { fields: [] },
      credential: "",
      plugin: "",
      type: "",
      success: false,
      errorMessage: "",
      test: 0,
      tags: [],
      selected_mitre_data_sources: [],
      organization: "",
      selected: [],
      tag_list: [],
      current_step: 0,
      new_field_mapping: { fields: [] },
      new_mapping: false,
      current_field: {},
      data_types: [],
      last_step: 5,
      sigma_backend: "",
      sigma_pipeline: "",
      sigma_custom_pipeline: "",
    };
  },
};
</script>
