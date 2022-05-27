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
                <CButton color="primary" @click="createDetection = !createDetection" >New Detection</CButton>
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
    <CModal title="Create Detection Rule" :centered="true" size="xl" :show.sync="createDetection">      
            <CTabs variant="tabs"><br>
              <CTab active>
                <template slot="title">
                  <CIcon name="cil-description"/> {{tabs[0]}}
                </template>
                <h4>Rule Details</h4>
                <p>Use the form below to enter information about your detection rule. Be as descriptive as possible in the description field to help others understand the logic behind the rule.</p>
                <CInput label="Rule Name" placeholder="Renamed PowerShell"></CInput>
                <CTextarea label="Rule Description" rows="5" placeholder="Detects the execution of a renamed PowerShell often used by attackers or malware."></CTextarea>
                <CSelect :options="severities" label="Severity"></CSelect>
                <CIcon name="cil-tags"/>&nbsp;<label>Tags</label><br>
                <multiselect v-model="tags" placeholder="Select tags to apply to this detection" :taggable="true" @tag="addTag" tag-placeholder="Add new tag" track-by="name" label="name" :options="tag_list" :multiple="true" :close-on-select="false">
                </multiselect>
              </CTab>
              <CTab>
                <template slot="title">
                  <CIcon name="cil-fingerprint"/> {{tabs[1]}}
                </template>
                <h3>Sigma Rule</h3>
                <p>Enter your Sigma rule below, it will be automatically converted to the desired output format.</p>
                <prism-editor class="my-editor" v-model="detection.sigma" :highlight="highlighter" line-numbers></prism-editor>
              <CSelect label="Target Backend" :options="backends"></CSelect>
              </CTab>
              <CTab>
                <template slot="title">
                  <CIcon name="cil-clock"/> {{tabs[2]}}
                </template>
                3. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore
                et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
                dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
                officia deserunt mollit anim id est laborum.
              </CTab>
              <CTab>
                <template slot="title">
                  <CIcon name="cil-book"/> {{tabs[3]}}
                </template>
                <h4>Playbooks</h4>
                <p>You can select what playbooks you want to run when this detection fires.  Playbooks can be used to automatically enrich data on the detection, investigate it, resolve it, etc.</p>
                <CSelect :options="playbook_names" label="Playbook"></CSelect>

                <label>Run Automatically?<br><small>Selecting No will associate the playbook with the detection but an analyst will have to manually run it</small></label><br>
                <CSwitch color="success"  label-on="Yes" label-off="No"></CSwitch><br>
              </CTab>
              <CTab>
                <template slot="title">
                  <CIcon name="cil-notes"/> {{tabs[4]}}
                </template>
                <h3>Triage Notes</h3>
                <p>Triage notes are helpful for analysts to understand what steps that should take to investigate the detection.</p>
                <CTextarea rows="15"></CTextarea>
              </CTab>
              <CTab>
                <template slot="title">
                  <CIcon name="cil-exit-to-app"/> {{tabs[5]}}
                </template>
                3. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore
                et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
                dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
                officia deserunt mollit anim id est laborum.
              </CTab>
            </CTabs>
    </CModal>
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
//const DetectionRules = () => import('@/views/DetectionRuleList')
export default {
    name: 'DetectionManagement',
    components: {
      //'DetectionRules': DetectionRules
      PrismEditor,
      OrganizationBadge
    },
    data () {
      return {
        detection_list_fields: ['name','organization','last_run','last_hit','total_hits',{key: 'performance', label: 'Query Time / Total Time'},'actions'],
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
        detection: {
          sigma: `title: "Renamed PowerShell"
id: "d178a2d7-129a-4ba4-8ee6-d6e1fecd5d20"
status: "experimental"
description: "Detects the execution of a renamed PowerShell often used by attackers or malware"
references:
    - "https://twitter.com/christophetd/status/1164506034720952320"
author: "Florian Roth", "frack113"
date: "2019/08/22"
modified: "2021/07/03"
tags:
    - "car.2013-05-009"
    - "attack.defense_evasion"
    - "attack.t1036" # an old one
    - "attack.t1036.003"
logsource:
    product: "windows"
    category: "process_creation"
detection:
    selection:
        Description|startswith: 
            - "Windows PowerShell"
            - 'pwsh'
        Company: "Microsoft Corporation"
    filter:
        Image|endswith: 
            - "powershell.exe"
            - "powershell_ise.exe"
            - 'pwsh.exe'
    condition: "selection and not filter"
falsepositives:
    - "Unknown"
level: "critical"`
        },
        createDetection: false
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
        console.log(uuid)
      },
      deleteDetectionModal(uuid) {
        console.log(uuid)
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
