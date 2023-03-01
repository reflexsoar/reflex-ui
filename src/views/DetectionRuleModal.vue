<template>
  <div>
    <link
      rel="stylesheet"
      href="https://unpkg.com/vue-multiselect@2.1.0/dist/vue-multiselect.min.css"
    />
    <CModal
      title="Create Event Rule"
      :centered="false"
      size="xl"
      :show.sync="modalStatus"
      :closeOnBackdrop="false"
    >
      <template #header>
        <h5 style="text-transform: capitalize">{{ mode }} Detection Rule</h5>
        <span class="text-right">
          <button type="button" aria-label="Close" class="close" @click="dismiss()">
            ×
          </button>
          <button
            type="button"
            class="kb"
            aria-label="Documentation"
            onclick="window.open('https://docs.reflexsoar.com/en/latest/detections')"
          >
            <CIcon name="cil-book" size="lg" />
          </button>
        </span>
      </template>
      <div>
        <CRow>
          <CCol>
            <CAlert :show.sync="error" color="danger" closeButton>
              {{ error_message }}
            </CAlert>
          </CCol>
        </CRow>
        <CRow>
          <CCol>
            <CTabs
              :fade="false"
              variant="pills"
              :activeTab.sync="step"
              :vertical="{ navs: 'col-md-2', content: 'col-md-10' }"
            >
              <CTab title="Sigma Import" v-if="show_sigma">
                <h5>Sigma Configuration</h5>
                <label>Import from Sigma?</label><br />
                <CSwitch
                  :checked.sync="show_sigma"
                  label="From Sigma?"
                  label-on="Yes"
                  label-off="No"
                  color="success"
                /><br />
                <CSelect
                  label="Organization"
                  placeholder="Select an organization"
                  @change="updateOrganization"
                  v-if="current_user.role.permissions.view_organizations"
                  :value.sync="rule.organization"
                  :options="organizations"
                />
                <label for="input">Input</label><br />
                <multiselect
                  id="input"
                  @search-change="searchInputs"
                  v-model="rule.source"
                  placeholder="Select the input to be used for this detection"
                  track-by="uuid"
                  label="name"
                  :options="input_list"
                /><br />

                <label>Rule</label>
                <prism-editor
                  class="my-editor"
                  v-model="sigma_rule"
                  :highlight="highlighter"
                  line-numbers
                  aria-label="Sigma Rule"
                  style="height: 250px"
                ></prism-editor
                ><br />
                <CRow>
                  <CCol
                    ><CSelect
                      :value.sync="sigma_backend"
                      :options="['opensearch', 'elasticsearch']"
                      placeholder="Select a backend"
                      label="Backend"
                    ></CSelect
                  ></CCol>
                  <CCol
                    ><CSelect
                      :value.sync="sigma_pipeline"
                      :options="['ecs_windows']"
                      placeholder="Select a pipeline"
                      label="Pipeline"
                    ></CSelect
                  ></CCol>
                </CRow>
                <CButton color="primary" @click="convertRule()">Convert</CButton>
              </CTab>
              <CTab title="Details" v-if="!show_sigma">
                <h5>Rule Details</h5>
                <label>Import from Sigma?</label><br />
                <CSwitch
                  :checked.sync="show_sigma"
                  label="From Sigma?"
                  label-on="Yes"
                  label-off="No"
                  color="success"
                />
                <CSelect
                  label="Organization"
                  placeholder="Select an organization"
                  @change="updateOrganization"
                  v-if="current_user.role.permissions.view_organizations"
                  :value.sync="rule.organization"
                  :options="organizations"
                />
                <CInput v-model="rule.name" label="Name" placeholder="Rule Name" />
                <CTextarea
                  v-model="rule.description"
                  label="Description"
                  placeholder="A friendly description of the rule"
                  :rows="5"
                />
                <label for="input">Input</label><br />
                <multiselect
                  id="input"
                  @search-change="searchInputs"
                  v-model="rule.source"
                  placeholder="Select the input to be used for this detection"
                  track-by="uuid"
                  label="name"
                  :options="input_list"
                /><br />
                <label>Tags</label>
                <multiselect
                  v-model="rule.tags"
                  placeholder="Select tags to apply to this detection"
                  :taggable="true"
                  @tag="addTag"
                  tag-placeholder="Add new tag"
                  :options="tag_list"
                  :multiple="true"
                  :close-on-select="false"
                /><br />
              </CTab>
              <CTab title="Configuration" v-bind:disabled="rule.source['uuid'] === null">
                <h5>Rule Configuration</h5>
                <CSelect
                  label="Rule Type"
                  :value.sync="rule.rule_type"
                  :options="rule_types"
                />
                <CRow>
                  <CCol col="3">
                    <CSelect
                      label="Severity"
                      :value.sync="rule.severity"
                      :options="severities"
                      @change="setRiskScore()"
                    />
                  </CCol>
                  <CCol>
                    <div class="slidecontainer">
                      <label for="risk_score">Risk Score</label><br />
                      <input
                        type="range"
                        min="0"
                        max="50000"
                        value="10000"
                        id="risk_score"
                        label="Risk Score"
                        v-model="rule.risk_score"
                        class="slider"
                        @change="setSeverity()"
                      />
                    </div>
                  </CCol>
                  <CCol col="3"
                    ><CInput
                      v-model="rule.risk_score"
                      label="Risk Score"
                      placeholder="Risk Score"
                      @change="setSeverity()"
                    >
                    </CInput
                  ></CCol>
                </CRow>
                <label for="base_query">Base Query</label><br /><prism-editor
                  id="base_query"
                  class="my-editor"
                  v-model="rule.query.query"
                  :highlight="highlighter"
                  line-numbers
                  aria-label="Reflex Query"
                ></prism-editor
                ><br />
                <div v-if="rule.rule_type == 1">
                  <h5>Threshold Configuration</h5>
                  <p>
                    A Threshold rule allows for alerting when the number of documents
                    exceeds or is below a threshold
                  </p>
                  <CRow>
                    <CCol>
                      <CInput
                        v-model="rule.threshold_config.key_field"
                        label="Group By"
                        placeholder="Optional"
                        description="Optional - When supplied the threshold will apply to the count of total distinct values of this field."
                      />
                    </CCol>
                    <CCol col="2">
                      <CSelect
                        :value.sync="rule.threshold_config.operator"
                        label="Operator"
                        :options="['==', '!=', '>', '<', '>=', '<=']"
                      />
                    </CCol>
                    <CCol>
                      <CInput
                        v-model.number="rule.threshold_config.threshold"
                        v-bind:disabled="rule.threshold_config.dynamic"
                        label="Threshold"
                        description="The number of items that required for the detection to fire"
                      />
                    </CCol>
                  </CRow>
                  <CRow>
                    <CCol col="3">
                      <label for="per_field">Alarm per Field Value</label><br />
                      <CSwitch
                        v-bind:disabled="rule.threshold_config.key_field == ''"
                        id="per_field"
                        label-on="Yes"
                        label-off="No"
                        color="success"
                        v-bind:checked.sync="rule.threshold_config.per_field"
                        label="Per Field"
                        description="Should the number of hits per value of the value field be compared to the threshold?"
                      /><br />
                      <small class="form-text text-muted w-100"
                        >When active, changes the group by field to count of hits per
                        distinct field value.</small
                      >
                    </CCol>
                    <CCol col="3">
                      <label for="dynamic_threshold">Dynamic Threshold</label><br />
                      <CSwitch
                        id="dynamic_threshold"
                        label-on="Yes"
                        label-off="No"
                        color="success"
                        v-bind:checked.sync="rule.threshold_config.dynamic"
                        label="Dynamic Threshold"
                        description="Should the detection determine a threshold automatically based on a discovery period?"
                      /><br />
                      <small class="form-text text-muted w-100"
                        >Should the detection determine a threshold automatically based on
                        a discovery period?</small
                      >
                    </CCol>
                    <CCol v-if="rule.threshold_config.dynamic">
                      <CInput
                        v-model.number="rule.threshold_config.discovery_period"
                        label="Discovery Period"
                        description="How far back to compute the threshold value (in days)"
                      />
                    </CCol>
                    <CCol v-if="rule.threshold_config.dynamic">
                      <CInput
                        v-model.number="rule.threshold_config.recalculation_period"
                        label="Recalculation Period"
                        description="How ofter to recalculate the dynamic threshold (in hours)"
                      />
                    </CCol>
                  </CRow>
                  <CRow>
                    <CCol col="3">
                      <CInput
                        v-model.number="rule.threshold_config.max_events"
                        label="Max Events"
                        description="The number of events to return when a threshold is crossed"
                      />
                    </CCol>
                  </CRow>
                </div>
                <div v-else-if="rule.rule_type == 2">
                  <h5>Metric Change Configuration</h5>
                  {{ rule.metric_change_config }}
                  <CRow>
                    <CCol col="2">
                      <label for="metric_increase">Metric Increase</label><br />
                      <CSwitch
                        id="metric_increase"
                        label-on="Yes"
                        label-off="No"
                        color="success"
                        v-bind:checked.sync="rule.metric_change_config.increase"
                        label="Metric Increase"
                        description="Does this rule detect metric increases or decreases"
                      />
                    </CCol>
                    <CCol>
                      <CSelect
                        :value.sync="rule.metric_change_config.threshold_format"
                        :options="['Percentage', 'Numeric']"
                        label="Metric Format"
                      />
                    </CCol>
                    <CCol>
                      <CInput
                        v-model.number="rule.metric_change_config.threshold"
                        label="Metric Threshold"
                      />
                    </CCol>
                  </CRow>
                </div>
                <div v-else-if="rule.rule_type == 3">
                  <h5>Field Comparison Configuration</h5>
                  <CRow>
                    <CCol col="5">
                      <CInput
                        v-model="rule.field_mismatch_config.source_field"
                        label="Source Field"
                        placeholder="The source field to compare against"
                      />
                    </CCol>
                    <CCol col="2">
                      <CSelect
                        :value.sync="rule.field_mismatch_config.operator"
                        label="Operator"
                        :options="['==', '!=', '>', '<', '>=', '<=']"
                      />
                    </CCol>
                    <CCol col="5">
                      <CInput
                        v-model="rule.field_mismatch_config.target_field"
                        label="Target Field"
                        placeholder="The target field to compare against"
                      />
                    </CCol>
                  </CRow>
                </div>
                <div v-else-if="rule.rule_type == 4">
                  <h5>New Terms Configuration</h5>
                  <CRow>
                    <CCol col>
                      <CInput
                        v-model="rule.new_terms_config.key_field"
                        label="Terms Field"
                        placeholder="Field Name"
                        description="The field to collect terms from and observe new terms in"
                      />
                    </CCol>
                    <CCol>
                      <CInput
                        v-model.number="rule.new_terms_config.window_size"
                        label="Windows Size"
                        description="The number of days back to look for terms"
                      />
                    </CCol>
                    <CCol>
                      <CInput
                        v-model.number="rule.new_terms_config.max_terms"
                        label="Max Terms"
                        description="The maximum number of terms to return.  Too large may have performance impacts, too low may miss terms."
                      />
                    </CCol>
                  </CRow>
                </div>
              </CTab>
              <CTab title="Schedule" v-bind:disabled="rule.source['uuid'] === null">
                <h5>Schedule</h5>
                <CRow>
                  <CCol>
                    <CInput
                      label="Run Interval"
                      v-model.number="rule.interval"
                      description="How often detection will run in minutes"
                    ></CInput>
                  </CCol>
                  <CCol>
                    <CInput
                      label="Lookbehind"
                      v-model.number="rule.lookbehind"
                      description="How far back the detection should look in minutes. By default the detection will look back to the last run time."
                    ></CInput>
                  </CCol>
                  <CCol>
                    <CInput
                      label="Mute Period"
                      v-model.number="rule.mute_period"
                      description="How long in minutes to mute all future hits on this detection"
                    ></CInput>
                  </CCol>
                </CRow>
              </CTab>
              <CTab title="Exclusions" v-bind:disabled="rule.source['uuid'] === null">
                <h5>Exclusions</h5>
                <p>
                  Exclusions allow for fine tuning a detection without modifying the
                  underlying base query
                </p>
                <CAlert color="warning"
                  ><b>NOTE:</b> If creating/editing/deleting exclusions from this window
                  you must save the detection rule when finished.</CAlert
                >
                <CDataTable
                  :items="rule.exceptions"
                  :fields="[
                    'field',
                    'condition',
                    'values',
                    { key: 'list', label: 'Intel List' },
                    { key: 'admin', label: '' },
                  ]"
                >
                  <template #admin="{ item }">
                    <td class="text-right">
                      <CButton
                        aria-label="Edit Exclusion"
                        @click="editExclusion(item.uuid)"
                        size="sm"
                        color="info"
                        v-c-tooltip="{ content: 'Edit Exclusion', placement: 'left' }"
                        ><CIcon name="cilPencil" /></CButton
                      >&nbsp;
                      <CButton
                        aria-label="Delete Exclusion"
                        @click="deleteExclusion(item.uuid)"
                        size="sm"
                        color="danger"
                        v-c-tooltip="{ content: 'Delete Exclusion', placement: 'left' }"
                        ><CIcon name="cilTrash"
                      /></CButton>
                    </td>
                  </template>
                  <template #values="{ item }">
                    <td>
                      <li
                        style="display: inline; margin-right: 2px"
                        v-for="value in item.values"
                        :key="value"
                      >
                        <CButton color="primary" size="sm" disabled>{{ value }}</CButton>
                      </li>
                    </td>
                  </template>
                  <template #list="{ item }">
                    <td>
                      <span v-if="item.list && item.list.name !== null"
                        ><CButton color="primary" size="sm" disabled>{{
                          item.list.name
                        }}</CButton></span
                      ><span v-else>None</span>
                    </td>
                  </template>
                </CDataTable>
                <CButton @click="createExclusion" color="success">New Exclusion</CButton>
              </CTab>
              <CTab
                title="Observable Mapping"
                v-bind:disabled="rule.source['uuid'] === null"
              >
                <CRow>
                  <CCol>
                    <h5>Observable Mapping</h5>
                    <p>
                      Adding observable field mappings directly on the Detection allows
                      for pulling in Observables that are otherwise not normally available
                      due to the source inputs configuration.
                    </p>
                    <p>
                      Observable mapping can be added to the Detection by selecting a
                      Mapping Template, adding individual fields or both.
                    </p>
                    <h5>Mapping Templates</h5>
                    COMING SOON<br /><br />

                    <CRow>
                      <CCol> <h5>Observable Fields</h5></CCol
                      ><CCol class="text-right"
                        ><CButton @click="addObservableField()" color="success"
                          >Add Field</CButton
                        ></CCol
                      ></CRow
                    >
                  </CCol>
                </CRow>
                <CRow style="max-height: 450px; overflow: auto">
                  <CCol>
                    <CDataTable
                      :items="rule.observable_fields"
                      :fields="[
                        'field',
                        'data_type',
                        'alias',
                        'tags',
                        'ioc',
                        'safe',
                        'spotted',
                        'tlp',
                        { key: 'admin', label: '' },
                      ]"
                      size="sm"
                      small
                    >
                      <template #field="{ item }">
                        <td>
                          <CInput
                            size="sm"
                            v-model="item.field"
                            placeholder="Field Name"
                          />
                        </td>
                      </template>
                      <template #data_type="{ item }">
                        <td>
                          <CSelect
                            size="sm"
                            v-model="item.data_type"
                            :options="data_types"
                          />
                        </td>
                      </template>
                      <template #alias="{ item }">
                        <td>
                          <CInput size="sm" v-model="item.alias" placeholder="Alias" />
                        </td>
                      </template>
                      <template #tags="{ item }">
                        <td>
                          <CInput size="sm" v-model="item.tags" placeholder="Tags" />
                        </td>
                      </template>
                      <template #ioc="{ item }">
                        <td>
                          <CSwitch
                            :checked.sync="item.ioc"
                            color="danger"
                            label-on="Yes"
                            label-off="No"
                          />
                        </td>
                      </template>
                      <template #safe="{ item }">
                        <td>
                          <CSwitch
                            :checked.sync="item.safe"
                            color="success"
                            label-on="Yes"
                            label-off="No"
                          />
                        </td>
                      </template>
                      <template #spotted="{ item }">
                        <td>
                          <CSwitch
                            :checked.sync="item.spotted"
                            color="success"
                            label-on="Yes"
                            label-off="No"
                          />
                        </td>
                      </template>
                      <template #tlp="{ item }">
                        <td>
                          <CSelect :options="[1, 2, 3, 4]" v-model="item.tlp" size="sm" />
                        </td>
                      </template>
                      <template #admin="{ item }">
                        <td>
                          <CButton
                            aria-label="Delete Field"
                            @click="
                              deleteObservableField(observable_fields.indexOf(item))
                            "
                            size="sm"
                            color="danger"
                            ><CIcon name="cilTrash"
                          /></CButton>
                        </td>
                      </template> </CDataTable
                  ></CCol>
                </CRow>
              </CTab>
              <CTab
                title="Meta Information"
                v-bind:disabled="rule.source['uuid'] === null"
              >
                <h5>MITRE ATT&CK</h5>
                <p>
                  Selecting MITRE ATT&CK Tactics and Techniques allows for mapping the
                  MITRE ATT&CK Matrix to easily determine detection coverage.
                </p>
                <label>MITRE Tactics</label>
                <multiselect
                  v-model="rule.tactics"
                  placeholder="Select tags to apply to this detection"
                  @select="updateTactic"
                  @remove="removeTactic"
                  :options="mitre_tactics"
                  label="name"
                  track-by="external_id"
                  :multiple="true"
                  :close-on-select="false"
                  :internal-search="false"
                  :searchable="true"
                  @search-change="searchTactic"
                  ><template slot="singleLabel" slot-scope="props"
                    ><span class="option__desc"
                      ><span class="option__title">{{ props.option.title }}</span></span
                    ></template
                  >
                  <template slot="option" slot-scope="props">
                    <div class="option__desc">
                      <span class="option__title">{{ props.option.external_id }}</span> -
                      <span class="option__small">{{ props.option.name }}</span>
                    </div>
                  </template> </multiselect
                ><br />
                <label>MITRE Techniques</label>
                <multiselect
                  v-model="rule.techniques"
                  placeholder="Select tags to apply to this detection"
                  @select="addTechnique"
                  :options="mitre_techniques"
                  label="name"
                  track-by="external_id"
                  :multiple="true"
                  :close-on-select="false"
                  :internal-search="false"
                  :searchable="true"
                  @search-change="findTechnique"
                >
                  <template slot="singleLabel" slot-scope="props"
                    ><span class="option__desc"
                      ><span class="option__title">{{ props.option.title }}</span></span
                    ></template
                  >
                  <template slot="option" slot-scope="props">
                    <div class="option__desc">
                      <span class="option__title">{{ props.option.external_id }}</span> -
                      <span class="option__small">{{ props.option.name }}</span>
                    </div>
                  </template> </multiselect
                ><br />
                <h5>References</h5>
                <p>
                  References are links to useful external resources that help an analyst
                  understand the detection.
                </p>
                <CButton @click="addReference" size="sm" color="success"
                  >New Reference</CButton
                ><br /><br />
                <div v-for="(fp, i) in rule.references" :key="i">
                  <CInput v-model="rule.references[i]"
                    ><template #append
                      ><CButton @click="removeReference(i)" color="danger"
                        ><CIcon name="cilTrash" size="sm" /></CButton></template
                  ></CInput>
                </div>
              </CTab>
              <CTab title="Triage Guide" v-bind:disabled="rule.source['uuid'] === null">
                <h5>Triage Guide</h5>
                <p>
                  A triage guide helps analysts reviewing events generated from this
                  detection determine the legitimacy of the event. Being as descriptive as
                  possible will help alert consumers.
                </p>
                <markdown-editor
                  height="auto"
                  theme="primary"
                  size="sm"
                  :value="rule.guide"
                  @change="rule.guide = $event"
                ></markdown-editor>

                <h5>False Positives</h5>
                <p>
                  False positives are quick indicators that an analyst can use to rule out
                  false positive activity on the detection
                </p>
                <CButton @click="addFP" size="sm" color="success"
                  >New False Positive</CButton
                ><br /><br />
                <div v-for="(fp, i) in rule.false_positives" :key="i">
                  <CInput v-model="rule.false_positives[i]"
                    ><template #append
                      ><CButton @click="removeFP(i)" color="danger"
                        ><CIcon name="cilTrash" size="sm" /></CButton></template
                  ></CInput>
                </div>
              </CTab>
              <CTab title="Review" v-bind:disabled="rule.source['uuid'] === null"
                >{{ rule }}
              </CTab>
            </CTabs>
          </CCol>
        </CRow>
      </div>
      <template #footer>
        <CButton @click="dismiss()" color="secondary">Dismiss</CButton>
        <CButton v-if="step != 0" @click="previousStep()" color="info">Previous</CButton>
        <CButton
          v-if="step != final_step"
          @click="nextStep()"
          :disabled="rule.source['uuid'] === null"
          color="primary"
          >Next</CButton
        >
        <CButton
          v-if="step == final_step && (mode == 'Create' || mode == 'Clone')"
          @click="createDetectionRule()"
          color="primary"
          :disabled="submitted"
          ><span v-if="submitted"><CSpinner size="sm" />&nbsp;</span>Create</CButton
        >
        <CButton
          v-if="step == final_step && mode == 'Edit'"
          @click="editDetectionRule()"
          color="primary"
          :disabled="submitted"
          ><span v-if="submitted"><CSpinner size="sm" />&nbsp;</span>Save</CButton
        >
      </template>
    </CModal>
    <DetectionExclusionModal
      :exclusion.sync="exclusion"
      :rule.sync="rule"
      :show.sync="show_exclusion_modal"
      :mode="exclusion_modal_mode"
    />
  </div>
</template>

<style scoped>
/* required class */
.my-editor {
  /* we dont use `language-` classes anymore so thats why we need to add background and text color manually */
  /*background: #fdfdfd;*/
  background: #0e0e0e !important;
  color: #ccc !important;
  border: 1px solid rgb(216, 219, 224);
  border-radius: 0.25rem;
  box-shadow: inset 0 1px 1px rgb(0 0 21 / 8%);

  /* you must provide font-family font-size line-height. Example: */
  font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  padding: 5px;
}

.slidecontainer {
  width: 100%;
}

.slider {
  width: 100%;
}
/* optional class for removing the outline */
.prism-editor__textarea:focus {
  outline: none;
}

.modal-body {
  padding-left: 0px;
}
</style>
<script>
import { uuid } from "vue-uuid";
import { vSelect } from "vue-select";
import { PrismEditor } from "vue-prism-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import "vue-prism-editor/dist/prismeditor.min.css"; // import the styles somewhere
import "prismjs/components/prism-clike";
import "prismjs/components/prism-kusto";
import "prismjs/components/prism-python";
import "prismjs/components/prism-yaml";
import "../assets/js/prism-lucene";
import "../assets/css/prism-reflex.css"; // import syntax highlighting styles
import DetectionExclusionModal from "./DetectionExclusionModal.vue";
import ImportSigmaRuleWizard from "./detections/ImportSigmaRuleWizard.vue";

import { mapState } from "vuex";

export default {
  components: {
    PrismEditor,
    DetectionExclusionModal,
    ImportSigmaRuleWizard,
  },
  name: "DetectionRuleModal",
  props: {
    show: Boolean,
    rule: {
      type: Object,
      default: {
        tags: [],
        query: {
          query: "okay",
          language: "",
        },
        techniques: [],
        tactics: [],
        lookbehind: 5,
        interval: 5,
      },
    },
    mode: {
      type: String,
      default: "Create",
    },
  },
  computed: {
    formatted_tags: function () {
      return this.rule.tags.map((o) => {
        return { name: o, uuid: "" };
      });
    },
    ...mapState([
      "settings",
      "current_user",
      "input_list",
      "mitre_tactics",
      "mitre_techniques",
    ]),
  },
  data() {
    return {
      tabs: [
        { name: "Overview", icon: "cil-description" },
        { name: "Configuration", icon: "cil-gear" },
        { name: "Investigation Guide", icon: "cil-book" },
        { name: "Review", icon: null },
      ],
      rule_types: [
        { label: "Match", value: 0 },
        { label: "Threshold", value: 1 },
        { label: "Metric Change", value: 2 },
        { label: "Field Comparison", value: 3 },
        { label: "New Terms", value: 4 },
      ],
      severities: [
        { label: "Low", value: 1 },
        { label: "Medium", value: 2 },
        { label: "High", value: 3 },
        { label: "Critical", value: 4 },
      ],
      techniques: [],
      tactics: [],
      error: false,
      error_message: "",
      submitted: false,
      step: 0,
      final_step: 6,
      range: {
        start: this.days_ago(7),
        end: this.today(),
      },
      masks: {
        input: "YYYY-MM-DD h:mm A",
      },
      organization: "",
      organizations: [],
      show_test_results: false,
      test_result_color: "success",
      test_results: "",
      test_complete: false,
      test_failed: false,
      active: true,
      modalStatus: this.show,
      tag_list: [],
      short_names: [],
      show_exclusion_modal: false,
      exclusion_modal_mode: "Create",
      exclusion: {},
      show_sigma: false,
      saved_step: 0,
      sigma_rule: "",
      sigma_backend: "",
      sigma_pipeline: "",
      observable_fields: [],
      data_types: [
        "url",
        "user",
        "sid",
        "sha256hash",
        "sha1hash",
        "process",
        "port",
        "pid",
        "md5hash",
        "mac",
        "ip",
        "imphash",
        "host",
        "generic",
        "fqdn",
        "filepath",
        "email_subject",
        "email",
        "domain",
        "detection_id",
        "command",
      ],
    };
  },
  watch: {
    show: function () {
      this.error = false;
      this.error_message = "";
      if (this.mode == "Edit") {
        this.step = 0;
      }

      if (this.mode == "Clone") {
        this.step = 0;
        [
          "assigned_agent",
          "created_at",
          "created_by",
          "detection_id",
          "last_hit",
          "last_run",
          "query_time_taken",
          "time_taken",
          "total_hits",
          "updated_at",
          "updated_by",
          "uuid",
          "version",
          "warnings",
        ].forEach((k) => {
          delete this.rule[k];
        });
      }

      this.modalStatus = this.show;
    },
    modalStatus: function () {
      if (this.modalStatus) {
        this.$store.dispatch("getMitreTactics", {});
        this.$store.dispatch("getMitreTechniques", {});
        this.test_failed = true;
        this.loadData();
      }
      this.$emit("update:show", this.modalStatus);
      if (!this.modalStatus) {
        this.reset();
      }
    },
  },
  created() {
    //this.loadData()
    //this.$store.dispatch('getSettings')
    if (this.current_user.default_org) {
      this.$store.dispatch("getOrganizations", {}).then((resp) => {
        this.organizations = this.$store.getters.organizations.map((o) => {
          return { label: o.name, value: o.uuid };
        });
      });
    }
    this.$store.dispatch("getMitreTactics", {});
  },
  methods: {
    setRiskScore() {
      if (this.rule.severity == 1) {
        this.rule.risk_score = 1;
      } else if (this.rule.severity == 2) {
        this.rule.risk_score = 12501;
      } else if (this.rule.severity == 3) {
        this.rule.risk_score = 25001;
      } else if (this.rule.severity == 4) {
        this.rule.risk_score = 37501;
      }
    },
    setSeverity() {
      if (this.rule.risk_score <= 12500) {
        this.rule.severity = 1;
      } else if (this.rule.risk_score <= 25000 && this.rule.risk_score > 12500) {
        this.rule.severity = 2;
      } else if (this.rule.risk_score <= 37500 && this.rule.risk_score > 25000) {
        this.rule.severity = 3;
      } else {
        this.rule.severity = 4;
      }
      this.rule.risk_score = parseInt(this.rule.risk_score);
    },
    today() {
      let d = new Date();
      d.setHours(23, 59, 59, 0);
      return d;
    },
    days_ago(offset) {
      let d = new Date();
      d.setDate(d.getDate() - offset);
      d.setHours(0, 0, 0, 0);
      return d;
    },
    highlighter(code) {
      return highlight(code, languages.lucene);
    },
    addFP() {
      if (this.rule.false_positives && this.rule.false_positives.length > 0) {
        this.rule.false_positives.push("");
      } else {
        this.rule.false_positives = [""];
      }
    },
    removeFP(id) {
      this.rule.false_positives.splice(id, 1);
    },
    addReference() {
      if (this.rule.references && this.rule.references.length > 0) {
        this.rule.references.push("");
      } else {
        this.rule.references = [""];
      }
    },
    removeReference(id) {
      this.rule.references.splice(id, 1);
    },
    createExclusion() {
      this.exclusion = {
        description: "",
        condition: "is",
        values: [],
        field: "",
        uuid: uuid.v4(),
        list: null,
      };
      this.exclusion_modal_mode = "Create";
      this.show_exclusion_modal = true;
    },
    editExclusion(uuid) {
      this.exclusion = this.rule.exceptions.find((exclusion) => exclusion.uuid === uuid);
      this.exclusion_modal_mode = "Edit";
      this.show_exclusion_modal = true;
    },
    deleteExclusion(uuid) {
      this.rule.exceptions = this.rule.exceptions.filter(
        (exclusions) => exclusions.uuid !== uuid
      );
    },
    addObservableField() {
      if (this.rule.observable_fields && this.rule.observable_fields.length > 0) {
        this.rule.observable_fields.splice(0, 0, {
          field: "",
          data_type: "",
          alias: "",
          tags: [],
          ioc: false,
          safe: false,
          spotted: false,
          tlp: 1,
        });
      } else {
        console.log("YARP");
        this.rule.observable_fields.splice(0, 0, {
          field: "",
          data_type: "",
          alias: "",
          tags: [],
          ioc: false,
          safe: false,
          spotted: false,
          tlp: 1,
        });
      }
    },
    deleteObservableField(id) {
      this.rule.observable_fields.splice(id, 1);
    },
    testDetectionRule() {},
    createDetectionRule() {
      this.rule.tactics = this.rule.tactics.map((tactic) => {
        return {
          mitre_id: tactic.mitre_id,
          external_id: tactic.external_id,
          name: tactic.name,
          shortname: tactic.shortname,
        };
      });

      this.rule.techniques = this.rule.techniques.map((technique) => {
        return {
          mitre_id: technique.mitre_id,
          external_id: technique.external_id,
          name: technique.name,
        };
      });

      this.rule.risk_score = parseInt(this.rule.risk_score);

      if (this.rule.threshold_config.threshold) {
        this.rule.threshold_config.threshold = parseInt(
          this.rule.threshold_config.threshold
        );
      }

      if (this.rule.new_terms_config.max_terms) {
        this.rule.new_terms_config.max_terms = parseInt(
          this.rule.new_terms_config.max_terms
        );
      }

      if (this.rule.new_terms_config.window_size) {
        this.rule.new_terms_config.window_size = parseInt(
          this.rule.new_terms_config.window_size
        );
      }

      if (this.rule.interval) {
        this.rule.interval = parseInt(this.rule.interval);
      }

      if (this.rule.lookbehind) {
        this.rule.lookbehind = parseInt(this.rule.lookbehind);
      }

      if (this.rule.mute_period) {
        this.rule.mute_period = parseInt(this.rule.mute_period);
      }

      this.rule = this.removeNulls(this.rule);

      this.submitted = true;
      this.$store
        .dispatch("createDetection", this.rule)
        .then((resp) => {
          this.submitted = false;
          this.dismiss();
        })
        .catch((err) => {
          this.submitted = false;
          this.error = true;
          this.error_message = err.response.data.message;
          if (err.response.data.errors) {
            let errors = [];
            this.error_message += ": ";
            for (let e in err.response.data.errors) {
              errors.push(err.response.data.errors[e]);
            }
            this.error_message += errors.join(", ");
          }
        });
    },
    removeNulls(obj) {
      const isArray = Array.isArray(obj);
      for (const k of Object.keys(obj)) {
        if (obj[k] === null) {
          if (isArray) {
            obj.splice(k, 1);
          } else {
            delete obj[k];
          }
        } else if (typeof obj[k] === "object") {
          this.removeNulls(obj[k]);
        }
        if (isArray && obj.length === k) {
          this.removeNulls(obj);
        }
      }
      return obj;
    },
    editDetectionRule() {
      if (this.rule.tactics) {
        this.rule.tactics = this.rule.tactics.map((tactic) => {
          return {
            mitre_id: tactic.mitre_id,
            external_id: tactic.external_id,
            name: tactic.name,
            shortname: tactic.shortname,
          };
        });
      }

      if (this.rule.techniques) {
        this.rule.techniques = this.rule.techniques.map((technique) => {
          return {
            mitre_id: technique.mitre_id,
            external_id: technique.external_id,
            name: technique.name,
          };
        });
      }

      this.rule.risk_score = parseInt(this.rule.risk_score);

      this.submitted = true;
      this.$store
        .dispatch("updateDetection", { uuid: this.rule.uuid, data: this.rule })
        .then((resp) => {
          this.submitted = false;
          this.dismiss();
        })
        .catch((err) => {
          this.submitted = false;
          console.log(err);
        });
    },
    nextStep() {
      this.step += 1;
    },
    previousStep() {
      this.step -= 1;
    },
    loadMITRETactics() {},
    searchTactic(external_id) {
      this.$store.dispatch("getMitreTactics", {
        external_id__like: external_id,
        name__like: external_id,
      });
    },
    findTechnique(external_id) {
      /* Return a list of techniques from the API based on the tactics that are currently selected */
      this.$store.dispatch("getMitreTechniques", {
        external_id__like: external_id,
        name__like: external_id,
        phase_names: this.rule.tactics.map((t) => {
          return t.shortname;
        }),
      });
    },
    searchInputs(name) {
      this.$store.dispatch("getInputList", {
        organization: this.agent.organization,
        name: name,
      });
    },
    loadData() {
      this.$store.dispatch("getCases", {}).then((resp) => {
        this.cases = this.$store.getters.cases;
      });
    },
    reset() {
      this.sigma_rule = "";
      this.sigma_backend = "";
      this.sigma_pipeline = "";
      this.observable_fields = [];
      this.show_sigma = false;
    },
    dismiss() {
      this.step = 0;
      this.error = false;
      this.error_message = null;
      this.reset();
      this.modalStatus = false;
    },
    addTag(newTag) {
      const t = {
        name: newTag,
        uuid: "",
      };
      if (this.rule.tags) {
        this.rule.tags.push(t.name);
      } else {
        this.rule.tags = [t.name];
      }

      this.tag_list.push(t.name);
    },
    updateTactic(tactic) {
      if (!this.short_names.includes(tactic.shortname)) {
        this.short_names.push(tactic.shortname);
      }
      this.$store.dispatch("getMitreTechniques", { phase_names: this.short_names });
    },
    removeTactic(tactic) {
      if (this.short_names.includes(tactic.shortname)) {
        this.short_names = this.short_names.filter((t) => t !== tactic.shortname);
      }
      this.$store.dispatch("getMitreTechniques", { phase_names: this.short_names });
    },
    addTechnique(technique) {},
    updateOrganization() {
      this.$store.dispatch("getInputList", { organization: this.rule.organization });
      this.rule.source = { uuid: null };
    },
    loadTags: function () {
      this.tag_list = Array();
      this.$store.dispatch("getTags").then((resp) => {
        for (let i in resp.data) {
          this.tag_list.push({
            name: resp.data[i].name,
            uuid: resp.data[i].uuid,
          });
        }
      });
    },
    updateRuleType(event) {
      this.rule.rule_type = this.rule_types.indexOf(event.target.value);
    },
    searchInputs(name) {
      this.$store.dispatch("getInputList", {
        organization: this.rule.organization,
        name: name,
      });
    },
    toggleSigma() {
      this.show_sigma = !this.show_sigma;

      if (this.show_sigma) {
        this.saved_step = this.step;
        this.final_step += 1;
      } else {
        this.step = this.saved_step;
        this.final_step -= 1;
      }
    },
    convertRule() {
      let data = {
        sigma_rule: encodeURIComponent(this.sigma_rule),
        backend: this.sigma_backend,
        pipeline: this.sigma_pipeline,
      };
      let organization = this.rule.organization;
      let source = this.rule.source;
      this.$store
        .dispatch("importSigmaRule", data)
        .then((response) => {
          this.rule = Object.assign(this.rule, response.data);
          this.rule.organization = organization;
          this.rule.source = source;
          this.show_sigma = false;
          this.error = false;
          this.error_message = "";
          this.setRiskScore();
          this.setSeverity();
        })
        .catch((error) => {
          this.error = true;
          this.error_message = error.response.data.message;
        });
    },
  },
};
</script>
