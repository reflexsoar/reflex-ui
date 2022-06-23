<template>
  <div><link rel="stylesheet" href="https://unpkg.com/vue-multiselect@2.1.0/dist/vue-multiselect.min.css"><CCol xs="12" lg="12">
    <h2>Detection Management</h2><br>
     <CAlert :show.sync="alert.show" :color="alert.type" closeButton>
      {{alert.message}}
    </CAlert>
    <CCard>
      <CCardBody class="tabbed">
        <CTabs>
          <CTab title="Detection Rules" active>
            <CRow style="padding: 10px;">
              <CCol>
                <CButton color="primary" @click="createDetectionModal()" >New Detection</CButton>
              </CCol>
              <CCol col="3" class='text-right'>
                <CButton aria-label="Export Detections" disabled color="secondary"><CIcon name='cilCloudDownload' size="sm"></CIcon>&nbsp; Export Detections</CButton>
                &nbsp;<CButton aria-label="Import Detections" disabled color="secondary"><CIcon name='cilCloudUpload' size="sm"></CIcon>&nbsp; Import Detections</CButton>
              </CCol>
            </CRow>
            <CCardBody>
              <CDataTable
                :items="detections"
                :fields="detection_list_fields"
                items-per-page-select
                :items-per-page="25"
                table-filter
                :sorter='{external: true, resetable: true}'
                :sorterValue='{column: "name", asc: true}'
                :loading="loading"
              >
              <template #name="{item}">
                <td>
                  <b>{{item.name}}</b><br>
                  <span v-if="item.warnings && item.warnings.length > 0">
                    <li style="display: inline; margin-right: 2px;" v-for="warning,i in item.warnings" :key="i"><CButton color="warning" class="tag" size="sm">{{ warning }}</CButton></li>
                  </span>
                </td>
              </template>
              <template #organization="{item}">
                <td>
                  <OrganizationBadge :uuid="item.organization"/>
                </td>
              </template>
              <template #last_run="{item}">
                <td>
                  {{item.last_run | moment('from','now')}}
                </td>
              </template>
              <template #last_hit="{item}">
                <td>
                  {{ item.last_hit ? item.last_hit : 'Never' | moment('from','now')}}
                </td>
              </template>
              <template #total_hits="{item}">
                <td>
                  {{ item.total_hits ? item.total_hits : 0 }}
                </td>
              </template>
              <template #performance="{item}">
                <td>
                  {{item.query_time_taken ? item.query_time_taken.toLocaleString() : 0 }} ms / {{item.time_taken ? item.time_taken.toLocaleString(): 0 }} ms
                </td>
              </template>
              <template #actions="{item}">
                <td style="min-width:25px" class="text-right">
                  <CButton aria-label="Edit Detection" @click="editDetectionModal(item.uuid)" size="sm" color="info" v-c-tooltip="{content:'Edit Detection', placement:'left'}"><CIcon name='cilPencil'/></CButton>
                  <span v-if="item.active">&nbsp;<CButton aria-label="Disable Detection" @click="disableDetection(item.uuid)" size="sm" color="warning" v-c-tooltip="{content:'Disable Detection', placement:'left'}"><CIcon name='cilBan'/></CButton></span>
                  <span v-if="!item.active">&nbsp;<CButton aria-label="Enable Detection" @click="enableDetection(item.uuid)" size="sm" color="success" v-c-tooltip="{content:'Enable Detection', placement:'left'}"><CIcon name='cilCheck'/></CButton></span>
                  <span v-if="!item.active">&nbsp;<CButton aria-label="Delete Detection" @click="deleteDetectionModal(item.uuid)" size="sm" color="danger" v-c-tooltip="{content:'Delete Detection', placement:'left'}"><CIcon name='cilTrash'/></CButton></span>
                </td>
              </template>
              </CDataTable>
            </CCardBody>
            <!--<DetectionRules></DetectionRules>-->
          </CTab>
          <CTab title="Detection Repositories">
          </Ctab>
          <CTab title="Detection Bundles">
          </CTab>
        </CTabs>
      </CCardBody>
    </CCard>
    <DetectionRuleModal :show.sync="show_detecion_rule_modal" :rule.sync="rule" :mode="modal_mode"/>
  </CCol>
  </div>
</template>

<style>
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
    max-height: 400px;
    overflow: scroll;
    overflow-x: hidden;
  }

  /* optional class for removing the outline */
  .prism-editor__textarea:focus {
    outline: none;
    
  }
</style>
<script>
import {mapState} from 'vuex';
import { PrismEditor } from 'vue-prism-editor'
import { highlight, languages } from 'prismjs/components/prism-core';
import 'vue-prism-editor/dist/prismeditor.min.css'; // import the styles somewhere
import 'prismjs/components/prism-yaml';
import '../assets/js/prism-rql';
import '../assets/css/prism-reflex.css'; // import syntax highlighting styles
import OrganizationBadge from './OrganizationBadge'
import DetectionRuleModal from './DetectionRuleModal'
//const DetectionRules = () => import('@/views/DetectionRuleList')
export default {
    name: 'DetectionManagement',
    components: {
      //'DetectionRules': DetectionRules
      PrismEditor,
      OrganizationBadge,
      DetectionRuleModal
    },
    data () {
      return {
        
        detection_list_fields: ['name','organization','last_run','last_hit','total_hits',{key: 'performance', label: 'Query Time / Total Time'},'actions'],
        modal_mode: "Create",
        show_detecion_rule_modal: false,
        tabs: [
          '1. Rule Details',
          '2. Sigma Rule',
          '3. Interval',
          '4. Playbooks',
          '5. Triage Notes',
          '6. Outputs'
        ],
        severities: [
          'Critical',
          'High',
          'Medium',
          'Low'
        ],
        playbook_names: [
          'Phishing Analysis',
          'Threat Enrichment',
          'Cuckoo Sandbox'
        ],
        backends: [
          'Elasticsearch',
          'Sysmon',
          'Crowdstrike',
          'SentinelOne',
          'Splunk'
        ],
        tags: [
          {'name':'car.2013-05-009'},
          {'name':'attack.defense_evastion'},
          {'name':'attack.t1036'},
          {'name':'attack.t1036.003'}],
        tag_list: [],
        createDetection: false,
        rule: {
          tags: [],
          query: {
            query: "okay",
            language:""
          },
          techniques: [],
          tactics: [],
          lookbehind: 5,
          interval: 5,
          rule_type: 0,
          severity: 1,
          risk_score: 50,
          mute_period: 0,
          exceptions: [],
          threshold_config: {
            threshold: 0,
            key_field: null
          },
          field_mismatch_config: {
            source_field: '',
            target_field: '',
            operator:'=='
          },
          metric_change_config: {
            increase: false
          }
        }
      }
    },
    methods: {
      disableDetection(uuid) {
        this.$store.dispatch('updateDetection', {uuid: uuid, data: {'active': false}})
      },
      enableDetection(uuid) {
        this.$store.dispatch('updateDetection', {uuid: uuid, data: {'active': true}})
      },
      editDetectionModal(uuid) {
        this.modal_mode = "Edit"
        Object.assign(this.rule, this.detections.find(detection => detection.uuid === uuid))
        this.show_detecion_rule_modal = true
      },
      createDetectionModal() {
        this.modal_mode = "Create"
        this.rule = {
          tags: [],
          query: {
            query: "okay",
            language:""
          },
          techniques: [],
          tactics: [],
          lookbehind: 5,
          interval: 5,
          rule_type: 0,
          severity: 1,
          risk_score: 50,
          mute_period: 0,
          exceptions: [],
          threshold_config: {
            threshold: 0,
            key_field: null
          },
          field_mismatch_config: {
            source_field: '',
            target_field: '',
            operator:'=='
          },
          metric_change_config: {
            increase: false,
            threshold_format: 0,
            threshold: 0
          }
        }
        this.show_detecion_rule_modal = true
      },
      deleteDetectionModal(uuid) {
        this.$store.dispatch('deleteDetection', {uuid: uuid}).then(resp => {})
      },
      highlighter(code) {
        return highlight(code, languages.yaml);
      },
      addTag (newTag) {
        const tag = {
          name: newTag
        }
        this.tag_list.push(tag)
        this.tags.push(tag)
      }
    },
    computed: mapState(['alert','detections','loading']),
    created() {
      this.$store.commit('add_start') // Stop the success/fail add from showing up when changing from other pages
      this.$store.dispatch('getDetections', {})
    }
}
</script>
