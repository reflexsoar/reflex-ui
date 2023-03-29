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
        <CRow>
          <CCol>
            <h1>{{ detection.name }}</h1>
            <p>
              <b>Last Run:</b>
              <RMoment :date="detection.last_run" format="MMMM Do YYYY, h:mm:ss a" />
              (<RMoment :date="detection.last_run" />)
            </p>
          </CCol>
          <CCol col="1" class="text-right"> BUTTONS HERE </CCol>
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
              :activeTab.sync="step"
              :vertical="{ navs: 'col-md-2', content: 'col-md-10' }"
            >
                      <CTab title="Overview">
                        <p>{{ detection.description }}</p>
                    <p>
                      <b>Created By: </b>
                      {{
                        detection.created_by ? detection.created_by.username : "N/A"
                      }}
                      on <RMoment :date="detection.created_at" format="MMMM Do YYYY, h:mm:ss a" />
                    </p>
                    <p v-if="detection.updated_by">
                      <b>Updated By: </b> {{ detection.updated_by.username }},
                      <RMoment :date="detection.updated_at" />
                    </p>
                    <p>
                      <b>False Positives</b><br />
                      <li v-for="fp in detection.false_positives" :key="fp">
                        {{ fp }}
                      </li>
                    </p>
                    <p>
                      <b>References</b><br />
                      <li v-for="ref in detection.references" :key="ref">
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
                          </ol></span
                        >
                        <span v-else>{{ ref }}</span>
                      </li>
                    </p>
                    <p>
                      <b>MITRE ATT&CK Tactics</b>
                      <TagList :tags="tactic_names" :tagIcon="false" />
                    </p>
                    <p>
                      <b>MITRE ATT&CK Techniques</b>
                      <TagList :tags="technique_names" :tagIcon="false" />
                    </p>
                    <p>
                      <b>Tags</b>
                      <TagList :tags="detection.tags" :tagIcon="false"/>
                    </p>
                    <span v-if="detection.from_sigma"
                      ><b
                        >Sigma Rule (<span
                          style="cursor: pointer"
                          @click="show_sigma = !show_sigma"
                          >{{ show_sigma ? "Hide" : "Show" }}</span
                        >)</b
                      >
                      <CCollapse :show.sync="show_sigma"
                        ><br />
                        <pre>{{ detection.sigma_rule }}</pre>
                      </CCollapse></span
                    >
                      </CTab>
                      <CTab title="Triage Guide">
                      <h3>Triage Guide</h3>
                        <viewer :initialValue="detection.guide" height="550px" style="min-height:550px; max-height: 550px; overflow-y: scroll; overflow-x: hidden;" />
                      </CTab>
                      <CTab title="Setup Guide">
                      <h3>Setup Guide</h3>
                        <viewer :initialValue="detection.setup_guide" height="550px" style="min-height:550px; max-height: 550px; overflow-y: scroll; overflow-x: hidden;" />
                      </CTab>
                      <CTab title="Testing Guide">
                        <h3>Testing Guide</h3>
                        <viewer :initialValue="detection.testing_guide" height="550px" style="min-height:550px; max-height: 550px; overflow-y: scroll; overflow-x: hidden;" />
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
                    <p>
                      <b>Source Input</b><br />{{
                        detection.source ? detection.source.name : "Unknown"
                      }}
                    </p>
                    <p>
                      <b>Detection Type</b><br />{{ detectionType(detection.rule_type) }}
                    </p>
                    <p>
                      <b>Base Query</b><br />
                      <div class="query">
                        {{ detection.query ? detection.query.query : "" }}
                      </div>
                    </p>
                    <p>
                      <b>Severity</b><br /><CButton
                        class="tag"
                        size="sm"
                        :color="$store.getters.severity_color(detection.severity)"
                        >{{ $store.getters.severity_text(detection.severity) }}</CButton
                      >
                    </p>
                    <p>
                      <b>Risk Score</b><br /><CProgress
                        :max="max_risk"
                        :value="parseInt(detection.risk_score)"
                        show-value
                        :color="riskScoreColor(detection.risk_score)"
                      />
                    </p>
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>
            <CRow>
              <CCol>
                <CCard>
                  <CCardHeader>
                    <b>Schedule</b>
                  </CCardHeader>
                  <CCardBody>
                    <p><b>Runs Every: </b> {{ detection.interval }} minutes</p>
                    <p><b>Look Behind: </b> {{ detection.lookbehind }} minutes</p>
                    <p><b>Mute Period: </b> {{ detection.mute_period }} minutes</p>
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
                            <li
                              style="display: inline; margin-right: 2px"
                              v-for="tag in item.tags"
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
                          <li
                            style="display: inline; margin-right: 2px"
                            v-for="value in item.values"
                            :key="value"
                          >
                            <CButton color="primary" size="sm" disabled>{{
                              value
                            }}</CButton>
                          </li>
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
.query {
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
  padding-left: 10px;
}
</style>
<script>
import { mapState } from "vuex";
import moment from "moment";

import '@toast-ui/editor/dist/toastui-editor-viewer.css';

import { Viewer } from '@toast-ui/vue-editor';

import DetectionExclusionModal from "./DetectionExclusionModal";
import RMoment from './components/RMoment'
import TagList from './components/TagList'

export default {
  name: "DetectionDetails",
  components: {
    DetectionExclusionModal,
    RMoment,
    TagList,
    Viewer
  },
  computed: {
    ...mapState(["detection", "detection_hits"]),
    technique_names() {
      return this.detection.techniques.map((t) => t.name);
    },
    tactic_names() {
      return this.detection.tactics.map((t) => t.name);
    },
  },
  watch: {
    activeTab(tab) {
      // If the tab is the hits tab go fetch them
      if (tab === 0) {
        this.getHits();
      }
    },
  },
  data() {
    return {
      uuid: this.$route.params.uuid,
      activeTab: 0,
      show_sigma: false,
      max_risk: 50000,
      exclusion: {},
      show_exclusion_modal: false,
      exclusion_modal_mode: "Create",
      show_alert: false,
      alert_message: "",
      alert_type: "success",
      delete_exclusion_warning: false,
      target_exclusion: null,
      loading: true,
    };
  },
  created() {
    this.getDetection(this.uuid);
    this.getHits();
  },
  methods: {
    createExclusion() {
      this.exclusion = {};
      this.exclusion_modal_mode = "Create";
      this.show_exclusion_modal = true;
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
      this.$store.dispatch("getDetection", uuid).then(() => {
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
