<template>
  <CRightDrawer
    fixed
    :minimize="minimize"
    :show="show"
    :aside="true"
    :narrow="true"
    colorScheme="light"
    @update:show="(value) => $store.commit('set', ['eventDrawerShow', value])"
  >
    <CRow>
      <CCol>
        <CRow style="padding: 10px 10px 0px 10px">
          <CCol>
            <h2>{{ event_data.title }}</h2>
            <TagBucket :tags="event_data.tags" />
          </CCol>
          <CCol col="2" style="border-left: 1px solid #cfcfcf" class="text-right">
            <CButton
              color="secondary"
              @click="$store.commit('set', ['eventDrawerMinimize', true])"
              >Minimize</CButton
            >
          </CCol>
        </CRow>
        <hr style="margin-bottom: 0px" />
        <CRow class="metrics">
          <CCol>
            <CCardBody class="metrics-card-body">
              STATUS
              <h4>{{ event_data.status ? event_data.status.name : "Unknown" }}</h4>
            </CCardBody>
          </CCol>
          <CCol>
            <CCardBody class="metrics-card-body">
              CREATED
              <h4>{{ event_data.created_at | moment("from", "now") }}</h4>
            </CCardBody>
          </CCol>
          <CCol v-if="event_data.dismissed_at">
            <CCardBody class="metrics-card-body">
              DISMISSED AT
              <h4>{{ event_data.dismissed_at | moment("from", "now") }}</h4>
            </CCardBody>
          </CCol>
          <CCol v-if="event_data.dismissed_at">
            <CCardBody class="metrics-card-body">
              DURATION
              <h4>
                {{ minutesBetween(event_data.created_at, event_data.dismissed_at) }}
              </h4>
            </CCardBody>
          </CCol>
        </CRow>
        <hr style="margin-bottom: 0px; margin-top: 0px" />
        <CTabs :activeTab.sync="activeTab" class="tabbed">
          <CTab title="Overview" active>
            <CCardBody class="tab-container">
              <h3>Description</h3>
              {{ event_data.description }}

              <hr />

              <h3>Observables</h3>
              <CDataTable
                :hover="true"
                :items="event_data.observables"
                :fields="observable_fields"
                :items-per-page="10"
                bordered
                striped
                pagination
              >
                <template #value="{ item }">
                  <td class="observable-value">
                    <b>{{ item.value }}</b
                    ><br /><small
                      >{{
                        item.source_field ? item.source_field.toLowerCase() : "none"
                      }}
                      | {{ item.data_type }}</small
                    >
                  </td>
                </template>
                <template #ioc="{ item }">
                  <td>
                    <CSwitch
                      style="padding-top: 3px"
                      color="danger"
                      label-on="Yes"
                      label-off="No"
                      :checked.sync="item.ioc"
                      :disabled.sync="item.safe"
                      v-on:change.native="
                        toggleISS(event_data.uuid, item.value, 'ioc', item.ioc)
                      "
                    />
                  </td>
                </template>
                <template #spotted="{ item }">
                  <td>
                    <CSwitch
                      style="padding-top: 3px"
                      color="danger"
                      label-on="Yes"
                      label-off="No"
                      :checked.sync="item.spotted"
                      v-on:change.native="
                        toggleISS(event_data.uuid, item.value, 'spotted', item.spotted)
                      "
                    />
                  </td>
                </template>
                <template #safe="{ item }">
                  <td>
                    <CSwitch
                      style="padding-top: 3px"
                      color="success"
                      label-on="Yes"
                      label-off="No"
                      :checked.sync="item.safe"
                      :disabled.sync="item.ioc"
                      v-on:change.native="
                        toggleISS(event_data.uuid, item.value, 'safe', item.safe)
                      "
                    />
                  </td>
                </template>
                <template #tags="{ item }">
                  <td>
                    <TagBucket :tags="item.tags" />
                  </td>
                </template>
              </CDataTable>
            </CCardBody>
          </CTab>
          <CTab title="Raw Log">
            <CCardBody class="tab-container">
              <vue-json-pretty
                :data="jsonify(event_data.raw_log)"
                :showLength="true"
                :showIcon="true"
                :deep="1"
                :showDoubleQuotes="false"
              />
              <!--<vue-json-pretty :showLength="true" selectableType="multiple" :path="'res'"
                :data="jsonify(event_data.raw_log)"></vue-json-pretty><br>-->
            </CCardBody>
          </CTab>
          <CTab title="Table">
            <CCardBody class="tab-container">
              <CDataTable
                :items="event_index"
                :fields="['Field', 'Value']"
                :items-per-page="25"
                items-per-page-select
                hover
                sorter
                column-filter
                bordered
                striped
                pagination
                cleaner
                table-filter
                size="sm"
              >
                <template #Field="{ item }">
                  <td class="col-4">
                    <b>{{ item.Field }}</b>
                  </td>
                </template>
                <template #Value="{ item }">
                  <td class="table-view-value" v-if="!Array.isArray(item.Value)">
                    {{ item.Value }}
                  </td>
                  <td v-else>
                    <ul class="no-bullets">
                      <li v-for="value in item.Value" :key="value">
                        {{ value }}
                      </li>
                    </ul>
                  </td>
                </template>
                <template #caption><br /></template>
              </CDataTable>
            </CCardBody>
          </CTab>
          <CTab title="Tuning Advice" v-if="this.event_data.tuning_advice">
            <CRow>
              <CCol>
                <CCardBody>
                  <h3>Tuning Advice</h3>
                  <vue-markdown>{{ event_data.tuning_advice }}</vue-markdown>
                </CCardBody>
              </CCol>
            </CRow>
          </CTab>
          <CTab v-if="this.event_data.event_rules">
            <template #title>
              Matched Event Rules&nbsp;<CBadge
                color="info"
                class="tag"
                size="sm"
                v-if="event_data.event_rules.length > 0"
                >{{ event_data.event_rules.length }}</CBadge
              >
            </template>
            <CCardBody class="tab-container">
              <CRow>
                <CCol>
                  <h3>Matched Event Rules</h3>
                  <p>
                    The rules listed below have acted on this event at some point in time.
                  </p>
                  <div v-if="!rules_loading">
                    <CRow v-for="rule in rules" :key="rule.uuid">
                      <CCol>
                        <MatchedEventRule :rule="rule" />
                      </CCol>
                    </CRow>
                  </div>
                  <div v-else class="text-center">
                    <CSpinner color="primary" size="xl"></CSpinner>
                  </div>
                </CCol>
              </CRow>
            </CCardBody>
          </CTab>
          <CTab title="Detection" v-if="this.event_data.detection_id">
            <CCardBody class="tab-container" v-if="!this.detection_loading">
              <h3>Detection</h3>
              {{ detection.description }}<br /><br />
              <div>
                <h4>Base Query</h4>
                <pre class="detection-query">{{
                  detection.query ? detection.query.query : ""
                }}</pre>
              </div>
              <div v-if="detection.guide">
                <h4>Investigation Guide</h4>
                <viewer
                  :initialValue="detection.guide"
                  height="100px"
                  style="
                    min-height: 100px;
                    max-height: 550px;
                    overflow-y: scroll;
                    overflow-x: hidden;
                  "
                />

                <span
                  v-if="detection.false_positives && detection.false_positives.length > 0"
                >
                  <h4>False Positives</h4>
                  <li v-for="(fp, i) in detection.false_positives" :key="i">
                    {{ fp }}
                  </li>
                  <br />
                </span>

                <span v-if="detection.references && detection.references.length > 0">
                  <h4>References</h4>
                  <li v-for="(ref, i) in detection.references" :key="i">
                    <span v-if="ref.startsWith('http')"
                      >{{ ref }}&nbsp;<a _target="_child" :href="ref" target="_blank"
                        ><CIcon name="cil-external-link" size="sm" /></a
                    ></span>
                    <span v-else-if="ref.toLowerCase().startsWith('cve-')"
                      >{{ ref }}
                      <ol>
                        <li>
                          <a
                            _target="_child"
                            :href="
                              'https://cve.mitre.org/cgi-bin/cvename.cgi?name=' + ref
                            "
                            target="_blank"
                            >https://cve.mitre.org/cgi-bin/cvename.cgi?name={{ ref }}</a
                          >
                        </li>
                        <li>
                          <a
                            _target="_child"
                            :href="'https://nvd.nist.gov/vuln/detail/' + ref"
                            target="_blank"
                            >https://nvd.nist.gov/vuln/detail/{{ ref }}</a
                          >
                        </li>
                        <li>
                          <a
                            _target="_child"
                            :href="'https://www.cvedetails.com/cve/' + ref"
                            target="_blank"
                            >https://www.cvedetails.com/cve/{{ ref }}</a
                          >
                        </li>
                      </ol></span
                    >
                    <span v-else>{{ ref }}</span>
                  </li>
                  <br />
                </span>
              </div>

              <h4>MITRE ATT&CK</h4>
              <p>
                <b>MITRE ATT&CK Tactics</b>
                <li
                  style="display: inline; margin-right: 2px"
                  v-for="t in detection.tactics"
                  :key="t.name"
                >
                  <CBadge class="tag" color="info" size="sm" disabled="">{{
                    t.name
                  }}</CBadge>
                </li>
              </p>
              <p>
                <b>MITRE ATT&CK Techniques</b>
                <li
                  style="display: inline; margin-right: 2px"
                  v-for="t in detection.techniques"
                  :key="t.name"
                >
                  <CBadge class="tag" color="info" size="sm" disabled="">{{
                    t.name
                  }}</CBadge>
                </li>
              </p>

              <div v-if="detection.exceptions">
                <h4>Exceptions</h4>
                <CDataTable
                  :items="detection.exceptions"
                  :fields="[
                    'field',
                    'condition',
                    'values',
                    { key: 'list', label: 'Intel List' },
                    //{ key: 'admin', label: '' },
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
                      >
                        <CIcon name="cilPencil" />
                      </CButton>
                    </td>
                  </template>
                  <template #values="{ item }">
                    <td>
                      <TagBucket :tags="item.values" label="Exclusions" />
                    </td>
                  </template>
                  <template #list="{ item }">
                    <td>
                      <span v-if="item.list !== null">
                        <CBadge class="tag" color="dark" size="sm" disabled>{{
                          item.list.name
                        }}</CBadge>
                      </span>
                    </td>
                  </template>
                </CDataTable>
              </div>
            </CCardBody>
            <CCardBody v-else  class="text-center">
              <CSpinner color="primary" size="lg"></CSpinner>
            </CCardBody>
          </CTab>
          <CTab title="Integration Output">
            <CRow>
              <CCol><CCardBody class="tab-container">
                <CCard v-for="output,i in event_data.integration_output" :key="i">
                  <CCardHeader>
                    <CRow>
                      <CCol>
                        {{ output.integration_name }} - {{ output.action }} - {{ output.created_at | moment("from") }}
                      </CCol>
                      <CCol>
                        <CButton
                          color="info"
                          class="float-right"
                          @click="toggleOutputShow(output)"
                          size="sm"
                        >
                          <CIcon
                            :name="output.show !== undefined && output.show != false ? 'cil-chevron-top' : 'cil-chevron-bottom'"
                          />
                        </CButton>
                      </CCol>
                    </CRow>
                  </CCardHeader>
                    <CCollapse :show.sync="(output.show !== undefined && output.show != false) || output.show">
                      <CCardBody class="tab-container">
                        <vue-markdown v-if="output.output_format == 'markdown'">
                          {{ output.output }}
                        </vue-markdown>
                      </CCardBody>
                    </CCollapse>
                  </CCard>
                  </CCardBody>
              </CCol>
            </CRow>
          </CTab>
          <CTab :title="`Comments (${this.event_data.total_comments})`">
            <template #title>
              Comments&nbsp;<CBadge
                color="info"
                class="tag"
                size="sm"
                v-if="event_data.total_comments > 0"
                >{{ event_data.total_comments }}</CBadge
              >
            </template>
            
            <CCardBody class="tab-container">
              <div v-if="!comments_loading">
                <CommentList :event_uuid="event_data.uuid"/>
              </div>
              <div v-else class="text-center">
                <CSpinner color="primary" size="xl"></CSpinner>
              </div>
            </CCardBody>
          </CTab>
        </CTabs>
      </CCol>
    </CRow>
    <DetectionExclusionModal
      :exclusion.sync="exclusion"
      :rule.sync="detection"
      :show.sync="show_exclusion_modal"
      :mode="exclusion_modal_mode"
    />
  </CRightDrawer>
</template>

<style scoped>
.observable-value {
  max-width: 50ch;
  overflow-y: clip;
  text-overflow: ellipsis;
}

.observable-value:hover {
  overflow-y: visible;
  overflow-wrap: anywhere;
}

.tab-container {
  overflow-x: hidden;
  max-height: calc(100vh - 250px);
}

.c-sidebar {
  width: 60% !important;
  overflow-y: visible;
}

.c-sidebar.c-sidebar-fixed {
  z-index: 1052;
}

.metrics {
  margin: 5px;
  margin-bottom: 0px;
}

.metrics-card {
  margin-bottom: 5px;
}

.metrics-card-body {
  padding: 10px;
}

.c-sidebar-minimized.c-sidebar-fixed {
  width: 0px !important;
  z-index: 1052;
}

.overflow-guard {
  height: 100% !important;
}

.table-responsive {
  overflow-y: none;
}

.detection-query {
  white-space: pre-wrap; /* Since CSS 2.1 */
  white-space: -moz-pre-wrap; /* Mozilla, since 1999 */
  white-space: -pre-wrap; /* Opera 4-6 */
  white-space: -o-pre-wrap; /* Opera 7 */
  word-wrap: break-word; /* Internet Explorer 5.5+ */
}
</style>

<style scoped>
/* required class */
.my-editor {
  /* we dont use `language-` classes anymore so thats why we need to add background and text color manually */
  /*background: #fdfdfd;*/
  background: #0e0e0e;
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

/* optional class for removing the outline */
.prism-editor__textarea:focus {
  outline: none;
}

.modal-body {
  padding-left: 0px;
}

ul.no-bullets {
  list-style-type: none; /* Remove bullets */
  padding: 0; /* Remove padding */
  margin: 0; /* Remove margins */
}

.table-view-value {
  max-width: 100ch;
  overflow-y: clip;
  text-overflow: ellipsis;
}
</style>

<script>
import nav from "../containers/_nav";
import VueJsonPretty from "vue-json-pretty";
import "vue-json-pretty/lib/styles.css";
import CRightDrawer from "./CRightDrawer";
import { PrismEditor } from "vue-prism-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import "vue-prism-editor/dist/prismeditor.min.css"; // import the styles somewhere
import "prismjs/components/prism-python";
import "../assets/js/prism-rql";
import "../assets/css/prism-reflex.css"; // import syntax highlighting styles
import MatchedEventRule from "./event/MatchedEventRule";
import { Viewer } from "@toast-ui/vue-editor";
import TagBucket from "./components/TagBucket";
import DetectionExclusionModal from "./DetectionExclusionModal";
import CommentList from './collaboration/CommentList'
import ObjectAttribute from "./components/ObjectAttribute";

export default {
  name: "EventDrawer",
  nav,
  props: {
    event_data: {},
  },
  components: {
    VueJsonPretty,
    CRightDrawer,
    PrismEditor,
    MatchedEventRule,
    Viewer,
    TagBucket,
    DetectionExclusionModal,
    CommentList,
    ObjectAttribute
  },
  created: function () {
    if (this.$store.state.unread_alert_count > 0) {
      nav[0]._children[1]["badge"] = {
        color: "danger",
        text: this.$store.state.unread_alert_count,
      };
    }
  },
  watch: {
    minimize(val) {
      if (!val) {
        document.body.style.overflow = "hidden";

        this.event_data = this.$store.getters.event;
        this.comments_loading = true;
        this.$store.dispatch("getEventIndex", this.event_data.uuid).then((resp) => {
          let data = resp.data;
          this.event_index = [];
          for (let [key, value] of Object.entries(data)) {
            this.event_index.push({ Field: key, Value: value });
          }
        });
        this.$store.dispatch("getEventComments", this.event_data.uuid).then(() => {
          this.comments = this.$store.state.event_comments;
          if(this.event_data.dismiss_comment) {
            let dismiss_comment = {
              comment: this.event_data.dismiss_comment,
              created_at: this.event_data.dismissed_at,
              created_by: this.event_data.dismissed_by.username,
              is_closure_comment: true
            }
            this.comments.push(dismiss_comment)
          }
          this.comments_loading = false;
        }).catch(() => {
          this.comments_loading = false;
        });
        if (this.event_data.event_rules) {
          this.rules_loading = true;
          this.$store
            .dispatch("loadEventRules", {
              rules: this.event_data.event_rules,
              save: false,
            })
            .then((resp) => {
              this.rules = resp.data.event_rules;
              this.rules_loading = false;
            }).catch((err) => {
              this.rules_loading = false;
            })
        }
        if (this.event_data.detection_id) {
          this.detection_loading = true;
          this.$store
            .dispatch("getDetection", this.event_data.detection_id)
            .then((resp) => {
              this.detection = resp.data;
              this.detection_loading = false;
            }).catch((err) => {
              this.detection_loading = false;
            });
        }
      } else {
        document.body.style.overflow = "auto";
      }
    },
  },
  data() {
    return {
      observable_fields: ["value", "ioc", "spotted", "safe", "tags"],
      activeTab: 1,
      rules: [],
      detection: {},
      comments: [],
      comments_loading: false,
      rules_loading: false,
      detection_loading: false,
      event_index: [],
      exclusion: {},
      show_exclusion_modal: false,
      exclusion_modal_mode: "Create",
    };
  },
  computed: {
    show() {
      return this.$store.state.eventDrawerShow;
    },
    minimize() {
      return this.$store.state.eventDrawerMinimize;
    },
  },
  methods: {
    toggleOutputShow(output) {
      // If the output does not have a show property, create it and set it to false
      if (!output.hasOwnProperty("show")) {
        this.$set(output, "show", true);
        return
      }
      output.show = !output.show;
    },
    editExclusion(uuid) {
      this.exclusion = this.detection.exceptions.find(
        (exclusion) => exclusion.uuid === uuid
      );
      this.exclusion_modal_mode = "Edit";
      this.show_exclusion_modal = true;
    },
    toggleISS(uuid, observable_value, field, value) {
      let data = {};
      data[field] = value;
      this.$store
        .dispatch("updateEventObservable", { uuid, observable_value, data })
        .then((resp) => {
          this.observables = this.$store.getters.observables;
        });
    },
    minutesBetween(start, end) {
      start = Date.parse(start);
      end = Date.parse(end);
      let value = Math.round((end - start) / 60000);
      if (isNaN(value)) {
        return "N/A";
      }
      if (value > 60) {
        value = Math.round(value / 60);
        if (value > 24) {
          value = Math.round(value / 24);
          if (value > 30) {
            value = Math.round(value / 30);
            if (value > 12) {
              value = Math.round(value / 12);
              return value + " years";
            } else if (value == 12) {
              return "1 year";
            }
            return value + " months";
          }
          return value + " days";
        } else {
          return value + " hours";
        }
      } else {
        return value + " minutes";
      }
    },
    highlighter(code) {
      return highlight(code, languages.rql);
    },
    jsonify(s) {
      try {
        return JSON.parse(s);
      } catch (e) {
        return s;
      }
    },
  },
};
</script>
