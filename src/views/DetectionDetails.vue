<template>
  <div>
    <CRow>
      <CCol>
        <CAlert
          :show="show_alert"
          :color="alert_type"
          :dismissible="true"
          @dismissed="show_alert = false"
        >
          {{ alert_message }}
        </CAlert>
        <div v-if="loading">
          <CSpinner color="primary" />
        </div>
        <div v-else>
        <CRow class="page-heading page-heading-no-nav">
          <CCol col=6>
            <h1>{{ detection.name }}</h1>
          </CCol>
          <CCol>
            <label class="text-muted">Last Run</label>
            <h4>
              <RMoment :date="detection.last_run" /><br>
              <small style="font-size: .5em"><RMoment :date="detection.last_run" format="MMMM Do YYYY, h:mm:ss a" /></small>
            </h4>
          </CCol>
          <CCol>
            <label class="text-muted">Severity</label>
            <h4><CBadge
              :color="$store.getters.severity_color(detection.severity)"
              >{{ $store.getters.severity_text(detection.severity) }}</CBadge></h4>
              </CCol
          >
          <CCol>
            <label class="text-muted">Risk Score</label>
            <h4>{{ detection.risk_score }} / 100</h4>
              </CCol
          >
        </CRow>
        <CRow>
          <CCol col="8">
            <CRow>
              <CCol>
                <CCard>
                  <CCardHeader>
                    <b>About</b>
                  </CCardHeader>
                  <CCardBody>
                    <CTabs
              :fade="false"
              variant="pills"
              :vertical="{ navs: 'col-md-2', content: 'col-md-10' }"
              :activeTab.sync="activeTab"
            >
                      <CTab title="Overview">
                        <CRow>
                          <CCol>
                            <ObjectAttribute label="Description" :value="detection.description"/>
                          </CCol>
                        </CRow>
                        <CRow>
                          <CCol>
                            <ObjectAttribute label="Created By">
                              <template #value>
                                {{ detection.created_by ? detection.created_by.username : "N/A" }} on <RMoment :date="detection.created_at" format="MMMM Do YYYY, h:mm:ss a" />
                              </template>
                            </ObjectAttribute>
                          </CCol>
                          <CCol>
                            <ObjectAttribute label="Updated By">
                            <template #value>
                            {{ detection.updated_by.username ? detection.updated_by.username : "System" }} on <RMoment :date="detection.updated_at" />
                            </template>
                            </ObjectAttribute>
                          </CCol>
                        </CRow>
                        <CRow v-if="detection.false_positives && detection.false_positives.length > 0">
                          <CCol>
                            <ObjectAttribute label="False Positives">
                              <template #value>
                                <li v-for="fp in detection.false_positives" :key="fp">
                                  {{ fp }}
                                </li>
                              </template>
                            </ObjectAttribute>
                          </CCol>
                        </CRow>

                        <CRow v-if="detection.references && detection.references.length > 0">
                          <CCol>
                            <ObjectAttribute label="References">
                              <template #value>
                                <li v-for="ref in detection.references" :key="ref">
                                  <span v-if="ref.startsWith('http')">{{ ref }}&nbsp;<a _target="_child" :href="ref" target="_blank"><CIcon name="cil-external-link" size="sm" /></a></span>
                                  <span v-else-if="ref.toLowerCase().startsWith('cve-')">{{ ref }}
                                    <ol>
                                      <li>
                                        <a
                                          _target="_child"
                                          :href="
                                            'https://cve.mitre.org/cgi-bin/cvename.cgi?name=' + ref
                                          "
                                          target="_blank"
                                          >https://cve.mitre.org/cgi-bin/cvename.cgi?name={{
                                            ref
                                          }}</a
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
                                    </ol></span>
                                  <span v-else>{{ ref }}</span>
                                </li>
                              </template>
                            </ObjectAttribute>
                          </CCol>
                        </CRow>

                        <CRow>
                          <CCol>
                            <ObjectAttribute label="MITRE ATT&CK Tactics">
                              <template #value>
                                <TagList :tags="tactic_names" :tagIcon="false" />
                              </template>
                            </ObjectAttribute>
                          </CCol>
                          <CCol>
                            <ObjectAttribute label="MITRE ATT&CK Techniques">
                              <template #value>
                                <TagList :tags="technique_names" :tagIcon="false" />
                                </template>
                            </ObjectAttribute>
                          </CCol>
                        </CRow>
                        <CRow>
                        
                          
                          <CCol>
                            <ObjectAttribute label="Kill Chain Phases">
                              <template #value>
                                <TagList :tags="detection.kill_chain_phase" :tagIcon="false" />
                              </template>
                            </ObjectAttribute>
                          </CCol>
                          </CRow>
                        <CRow>
                          <CCol>
                            <ObjectAttribute label="Authors">
                              <template #value>
                                <TagList :tags="detection.author" :tagIcon="false"/>
                              </template>
                            </ObjectAttribute>
                          </CCol>
                        </CRow>
                        <CRow>
                          <CCol>
                            <ObjectAttribute label="Tags">
                              <template #value>
                                <TagList :tags="detection.tags" :tagIcon="false"/>
                              </template>
                            </ObjectAttribute>
                          </CCol>
                        </CRow>
                        <CRow>
                          <CCol>
                            <ObjectAttribute label="Last Rule Assessment">
                              <template #value>
                                <CBadge class="tag" color="info" v-if="detection.assess_rule">Pending - Previously <RMoment :date="detection.last_assessed" /></CBadge><RMoment v-else :date="detection.last_assessed" />
                              </template>
                            </ObjectAttribute>
                          </CCol>
                        </CRow>
                      </CTab>
                      <CTab title="Schedule">
                        <CRow>
                          <CCol>
                            <ObjectAttribute label="Runs Every">
                              <template #value>
                                {{ detection.interval }} minutes
                              </template>
                            </ObjectAttribute>
                          </CCol>
                          <CCol>
                            <ObjectAttribute label="Lookbehind">
                              <template #value>
                                {{ detection.lookbehind }} minutes
                              </template>
                            </ObjectAttribute>
                          </CCol>
                          <CCol>
                            <ObjectAttribute label="Mute Period">
                              <template #value>
                                {{ detection.mute_period }} minutes
                              </template>
                            </ObjectAttribute>
                          </CCol>
                        </CRow>
                    </CTab>
                      <CTab title="Triage Guide">
                      <h3>Triage Guide</h3>
                        <viewer :initialValue="detection.guide" height="550px" style="min-height:400px; max-height: 550px; overflow-y: scroll; overflow-x: hidden;" />
                      </CTab>
                      <CTab title="Setup Guide">
                      <h3>Setup Guide</h3>
                        <viewer :initialValue="detection.setup_guide" height="550px" style="min-height:400px; max-height: 550px; overflow-y: scroll; overflow-x: hidden;" />
                      </CTab>
                      <CTab title="Testing Guide">
                        <h3>Testing Guide</h3>
                        <viewer :initialValue="detection.testing_guide" height="550px" style="min-height:400px; max-height: 550px; overflow-y: scroll; overflow-x: hidden;" />
                      </CTab>
                      <CTab title="Testing Automation">
                        <h3>Testing Automation</h3>
                        <pre class="query">{{detection.test_script}}</pre>
                        <label>Script Safe:</label>&nbsp;{{ detection.test_script_safe ? "Yes" : "No" }}<br>
                        <label>Script Language:</label>&nbsp;{{ detection.test_script_language }}
                      </CTab>
                      <CTab title="Email Template">
                        <h3>Email Template</h3>
                        <pre class="query">{{detection.email_template}}</pre>
                      </CTab>
                      
        <CTab title="Source Sigma Rule" v-if="detection.from_sigma">
          <CRow>
            <CCol>
              <pre style="white-space: pre-wrap" class="sigma">{{ detection.sigma_rule ? detection.sigma_rule : "" }}</pre>         
            </CCol>
          </CRow>
        </CTab>
                      <CTab title="Rule Quality">
                        <h3>Predicted Hits</h3>
                        <p>The below chart shows how many hits this rule would have generated over the last 30 days.  This is an estimate based on the last time the rule was assessed.  Rules are automatically assessed when they are synchronized from a repository and the query has changed, or if they are edited directly.</p>
                        <div v-if="detection.hits_over_time !== null">
          <apexchart width="100%"
            :options="chart_options()"
            :series="chart_series()">
          </apexchart>
          
        </div><h4>Query Performance</h4>
          <CRow>
            <CCol col=4>

          <CCard>
            <CCardHeader>
              <b>Predicted Query Time (ms)</b>
            </CCardHeader>
            <CCardBody>
              <center style="font-size: 3rem">{{ detection.average_query_time ? detection.average_query_time.toLocaleString() : "Unknown" }}</center>
              <center><small>Last Assessed: {{ detection.last_assessed | moment('from','now') }}</small></center>
              </CCardBody>
            </CCard>
            </CCol>
            <CCol col=4>
             <CCard>
            <CCardHeader>
              <b>Last Query Time (ms)</b>
            </CCardHeader>
            <CCardBody>
              <center style="font-size: 3rem">{{ detection.query_time_taken ? detection.query_time_taken.toLocaleString() : "Unknown" }}</center>
              <center><small>Last Reported: {{ detection.last_run | moment('from','now') }}</small></center>
              </CCardBody>
              </CCard>
              </CCol>
              <CCol col=4>
             <CCard>
            <CCardHeader>
              <b>Total Execution Time (ms)</b>
            </CCardHeader>
            <CCardBody>
              <center style="font-size: 3rem">{{ detection.time_taken ? detection.time_taken.toLocaleString() : "Unknown" }}</center>
              <center><small>Last Reported: {{ detection.last_run | moment('from','now') }}</small></center>
              </CCardBody>
              </CCard>
              </CCol>
            </CRow>     
        </CTab>
        <CTab title="Field Analysis">
          <CRow>
            <CCol>
            <h3>Field Analysis</h3>
            <p>During rule assessment the following values were highlighted as potentially significant values, for the purpose of providing tuning opportunities.</p>
            <CRow>
              <CCol>
                <CCard v-for="field,i in detection.field_metrics" :key="i" style="margin-bottom: 5px;">
                  <CCardHeader @click="toggleField(field.field)" style="cursor:pointer">
                    <CRow>
                      <CCol col=6>
                        {{ field.field }}
                      </CCol>
                      <CCol>
                        {{ sumDocCount(field.top_ten) }} hits
                      </CCol>
                      <CCol>
                        {{ field.cardinality }} values
                        </CCol>
                      <CCol>
                        <CProgress :value="getTopPercentage(field.top_ten)" :max="100" :showValue="true" :showPercentage="true" color="info"/>
                      </CCol>
                    </CRow> </CCardHeader>
                      <CCollapse :show.sync="show_field[field.field]">
                        <CCardBody>
                        <h5>Top 10 Values</h5>
                        <table style="width: 100%">
                          <tr><th><label>Value</label></th><th><label>Hits</label></th><th><label>Percentage of Hits</label></th></tr>
                          <tr v-for="value,i in field.top_ten" :key="i">
                            <td>{{ value.key }}</td>
                            <td>{{ value.doc_count }}</td>
                            <td><CProgress :value="value.pct" :max="100" :showValue="true" :showPercentage="true" color="info"/></td>
                          </tr>
                        </table>
                      </CCardBody>
                    </CCollapse>
                  </CCard>
              </CCol>
            </CRow>
            </CCol>
          </CRow>
          
        </CTab>
        <CTab title="Change Log">
          <CRow>
            <CCol>
              <h4>Change Log</h4>
            </CCol>
          </CRow>
          <CRow>
            <CCol style="max-height: 450px; overflow: auto" v-if="!change_log_loading">
              <!-- timeline -->
              <timeline>
                <timeline-item bg-color="#9dd8e0" style="padding-bottom:5px;" v-for="log in change_log['changes']" :hollow="true" :key="log.uuid">
                <b>{{ log.updated_by.username }}</b> changed the property <code>{{ log.field}}</code> {{ log.updated_at | moment('from','now')}}<br>
                
                  <i>Old Value</i><pre style="white-space: pre-wrap;" class="query">{{ log.old_value.join(", ") }}</pre>
                  <i>New Value</i><pre style="white-space: pre-wrap;" class="query">{{ log.new_value.join(", ") }}</pre>
                </timeline-item>
              </timeline>
            </CCol>
            <CCol v-else>
              <CSpinner v-if="change_log_loading" color="primary" />
            </CCol>
          </CRow>
        </CTab>
                    </CTabs>
                    
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>
          </CCol>
          <CCol>
            <CRow>
              <CCol>
                <CCard>
                  <CCardHeader>
                    <b>Configuration</b>
                  </CCardHeader>
                  <CCardBody>
                    <CRow>
                      <CCol>
                      <ObjectAttribute label="Organization">
                        <template #value>
                          <OrganizationBadge :uuid="detection.organization"/>
                        </template>
                      </ObjectAttribute>
                      </CCol>
                      </CRow>
                      <CRow>
                        <CCol>
                          <ObjectAttribute label="Source Input" :value="detection.source ? detection.source.name : 'Unknown'"/>
                        </CCol>
                        <CCol>
                          <ObjectAttribute label="Detection Type" :value="detectionType(detection.rule_type)"/>
                        </CCol>
                      </CRow>
                      <CRow>
                        <CCol>
                        <ObjectAttribute label="Query">
                          <template #value>
                            <pre style="white-space: pre-wrap;" class="query">{{ detection.query ? detection.query.query : "" }}</pre>
                          </template>
                        </ObjectAttribute>
                        </CCol>
                      </CRow>
                      
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>
          </CCol> </CRow
        >
        <CRow>
          <CCol>
            <CCard>
              <CCardBody class="tabbed">
                <CTabs :activeTab.sync="activeTab">
                  <CTab title="Hits">
                    <CCardBody>
                      <CDataTable
                        :items="detection_hits"
                        :fields="[
                          'title',
                          'tags',
                          'reference',
                          'severity',
                          'risk_score',
                          'created_at',
                          'updated_at',
                          'original_date',
                        ]"
                        :responsive="false"
                        
                      >
                        <template #severity="{ item }">
                          <td>
                            <CButton
                              class="tag"
                              size="sm"
                              :color="$store.getters.severity_color(item.severity)"
                              >{{ $store.getters.severity_text(item.severity) }}</CButton
                            >
                          </td>
                        </template>
                        <template #risk_score="{ item }">
                          <td>
                            <CProgress
                              v-if="item.risk_score"
                              :max="max_risk"
                              :value="parseInt(item.risk_score)"
                              :color="riskScoreColor(detection.risk_score)"
                              show-value
                            />
                          </td>
                        </template>
                        <template #created_at="{ item }">
                          <td>
                            <RMoment :date="item.created_at"/>                            
                          </td>
                        </template>
                        <template #updated_at="{ item }">
                          <td>
                            <RMoment :date="item.updated_at"/>
                          </td>
                        </template>
                        <template #original_date="{ item }">
                          <td>
                            <RMoment :date="item.original_date"/>
                          </td>
                        </template>
                        <template #tags="{ item }">
                          <td>
                            <TagBucket :tags="item.tags" label="Tags" />
                          </td>
                        </template>
                      </CDataTable>
                    </CCardBody>
                  </CTab>
                  <CTab title="Exclusions">
                    <CDataTable
                      :items="detection.exceptions"
                      :fields="[
                        'field',
                        'condition',
                        'values',
                        { key: 'list', label: 'Intel List' },
                        { key: 'admin', label: '' },
                      ]"
                      :responsive="false"
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
                            @click="deleteExclusionWarn(item.uuid)"
                            size="sm"
                            color="danger"
                            v-c-tooltip="{
                              content: 'Delete Exclusion',
                              placement: 'left',
                            }"
                            ><CIcon name="cilTrash"
                          /></CButton>
                        </td>
                      </template>
                      <template #values="{ item }">
                        <td>
                          <TagBucket :tags="item.values" label="Exclusions" />
                        </td>
                      </template>
                      <template #list="{ item }">
                        <td>
                          <span v-if="item.list.name !== null"
                            ><CButton color="primary" size="sm" disabled>{{
                              item.list.name
                            }}</CButton></span
                          >
                        </td>
                      </template>
                    </CDataTable>
                  </CTab>
                  <CTab title="Log">
                    <CCardBody> Coming Soon </CCardBody>
                  </CTab>
                </CTabs>
              </CCardBody>
            </CCard>
          </CCol>
        
        </CRow></div>
      </CCol>
    </CRow>
    
    <DetectionExclusionModal
      :exclusion.sync="exclusion"
      :rule.sync="detection"
      :show.sync="show_exclusion_modal"
      :mode="exclusion_modal_mode"
      @exclusion_saved="saveExceptions"
    />
    <CModal
      :show.sync="delete_exclusion_warning"
      :closeOnBackdrop="false"
      title="Delete Exclusion"
    >
      Are you sure you want to delete this exclusion?

      <template #footer>
        <CButton color="secondary" @click="delete_exclusion_warning = false"
          >Cancel</CButton
        >
        <CButton color="danger" @click="deleteExclusion">Delete</CButton>
      </template>
    </CModal>
  </div>
</template>
<style scoped>
.sigma {
  background: #0e0e0e;
  color: #ccc !important;
  border: 1px solid rgb(216, 219, 224);
  border-radius: 0.25rem;
  box-shadow: inset 0 1px 1px rgb(0 0 21 / 8%);
  max-height: 100%;
  overflow-y: auto;

  /* you must provide font-family font-size line-height. Example: */
  font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  padding: 5px;
  padding-left: 10px;
}
.query {
  background: #0e0e0e;
  color: #ccc !important;
  border: 1px solid rgb(216, 219, 224);
  border-radius: 0.25rem;
  box-shadow: inset 0 1px 1px rgb(0 0 21 / 8%);

  max-height: 200px;
  overflow-y: auto;

  /* you must provide font-family font-size line-height. Example: */
  font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  padding: 5px;
  padding-left: 10px;
}
.properties-table td {
  padding: 5px;
  border: 5px solid #fff;
  border-spacing: 5px;
  /* Vertically align the text in the middle of the td*/
}

.properties-table td:first-child {
  padding-right: 20px;
  width: 28%;
  font-weight: bold;
  vertical-align: top;
  background-color: #efefef;
}

.properties-table td:nth-child(2) {
  text-align: left;
  vertical-align: top;
}
</style>
<script>
import { mapState } from "vuex";
import moment from "moment";

import '@toast-ui/editor/dist/toastui-editor-viewer.css';
import { Timeline, TimelineItem, TimelineTitle } from 'vue-cute-timeline'
import 'vue-cute-timeline/dist/index.css'

import { Viewer } from '@toast-ui/vue-editor';

import DetectionExclusionModal from "./DetectionExclusionModal";
import RMoment from './components/RMoment'
import TagList from './components/TagList'
import TagBucket from './components/TagBucket'
import OrganizationBadge from './OrganizationBadge'
import ObjectAttribute from './components/ObjectAttribute'

export default {
  name: "DetectionDetails",
  components: {
    DetectionExclusionModal,
    RMoment,
    TagList,
    Viewer,
    OrganizationBadge,
    TagBucket,
    ObjectAttribute,
    Timeline,
    TimelineItem,
    TimelineTitle
  },
  computed: {
    ...mapState(["detection", "detection_hits", "current_user"]), 
    technique_names() {
      if (this.detection.techniques) {
        return this.detection.techniques.map((t) => t.name + " (" + t.external_id + ")");
      }
      return [];
    },
    tactic_names() {
      if(this.detection.tactics) {
        // Join the tactic name and external ID together
        return this.detection.tactics.map((t) => t.name + " (" + t.external_id + ")");
      }
      return [];
      
    },
  },
  watch: {
    activeTab(tab) {
      // If the tab is the hits tab go fetch them
      if (tab === 0) {
        this.getHits();
      } else if (tab === 10) {
        this.getDetectionChangeLog();
      }
    },
  },
  data() {
    return {
      uuid: this.$route.params.uuid,
      activeTab: 0,
      show_sigma: false,
      max_risk: 100,
      exclusion: {},
      show_exclusion_modal: false,
      exclusion_modal_mode: "Create",
      show_alert: false,
      alert_message: "",
      alert_type: "success",
      delete_exclusion_warning: false,
      target_exclusion: null,
      loading: true,
      show_field: {},
      change_log: [],
      change_log_loading: false
    };
  },
  created() {
    this.getDetection(this.uuid);
    this.getHits();
  },
  methods: {
    chart_options() {
      let data = JSON.parse(this.detection.hits_over_time)
      let labels = Object.keys(data).map((d) => moment(d).format("MM-DD-YY"))
      let options = {
        chart: {
          id: 'hits_over_time',
          type: 'line',
          title: {
            text: 'Hits Over Time'
          },
          height: 250
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          curve: 'smooth',
          width: 2
        },
        labels: labels
      }
      return options
    },
    chart_series() {
      let data = JSON.parse(this.detection.hits_over_time)
      let series = [{
        name: 'Hits',
        data: Object.values(data),
      }]
      return series
    },
    createExclusion() {
      this.exclusion = {};
      this.exclusion_modal_mode = "Create";
      this.show_exclusion_modal = true;
    },
    getDetectionChangeLog() {
      this.change_log_loading = true
      this.$store.dispatch('getDetectionChangeLogs', { uuid: this.uuid }).then((resp) => {
        this.change_log = resp.data
        this.change_log_loading = false
      }).catch((error) => {
        this.change_log_loading = false
        this.change_log = []
      })
    },
    editExclusion(uuid) {
      if (this.detection.exceptions === undefined) {
        this.detection.exceptions = [];
      }
      let exclusion = this.detection.exceptions.find((e) => e.uuid === uuid);
      if (exclusion) {
        this.exclusion = exclusion;
        this.exclusion_modal_mode = "Edit";
        this.show_exclusion_modal = true;
      }
    },
    sumDocCount(top_hits) {
      let count = 0;
      for(let i in top_hits) {
        let hit = top_hits[i]
        if (hit.doc_count) {
          count += hit.doc_count
        }
      }
      return count;
    },
    getTopPercentage(top_hits) {
      if(top_hits && top_hits.length > 0) {
        return top_hits[0]['pct']
      }
    },
    toggleField(field) {
      if(field in this.show_field) {
        this.$set(this.show_field, field, !this.show_field[field])
      } else {
        this.$set(this.show_field, field, true)
      }
    },
    saveExceptions() {
      let update_data = {
        exceptions: this.detection.exceptions,
      };

      this.$store
        .dispatch("updateDetection", { uuid: this.detection.uuid, data: update_data })
        .then(() => {
          this.show_alert = true;
          this.alert_message = "Detection Updated";
          this.alert_type = "success";
          window.scrollTo(0, 0);
        })
        .catch((error) => {
          this.show_alert = true;
          this.alert_message = "Error Updating Detection." + error.response.data.message;
          this.alert_type = "danger";
          window.scrollTo(0, 0);
        });
    },
    deleteExclusionWarn(uuid) {
      this.delete_exclusion_warning = true;
      this.target_exclusion = uuid;
    },
    deleteExclusion() {
      this.detection.exceptions = this.detection.exceptions.filter(
        (e) => e.uuid !== this.target_exclusion
      );
      this.delete_exclusion_warning = false;
      this.target_exclusion = null;
      this.saveExceptions();
    },
    getDetection(uuid) {
      this.loading = true
      this.$store.dispatch("getDetection", {uuid}).then(() => {
        this.loading = false
      });
    },
    detectionType(i) {
      return ["Match", "Threshold", "Metric Change", "Field Mismatch"][i];
    },
    getHits() {
      this.$store.dispatch("getDetectionHits", { uuid: this.uuid });
    },
    riskScoreColor(score) {
      if (score === null) {
        return "info";
      }
      if (score >= 0 && score <= 12500) {
        return "info";
      }
      if (score >= 12501 && score <= 25000) {
        return "success";
      }
      if (score >= 25001 && score <= 37500) {
        return "warning";
      }
      if (score >= 37501) {
        return "danger";
      }
    },
  },
};
</script>
