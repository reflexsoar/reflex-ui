<template>
  <div>
    <link rel="stylesheet" href="https://unpkg.com/vue-multiselect@2.1.0/dist/vue-multiselect.min.css">
    <CRow><CCol xs="12" lg="12">
      <h2 id="detections-page-header">
        <CBadge color="primary">BETA</CBadge>&nbsp;Detection Management&nbsp;<button type="button" class="kb"
          onclick="window.open('https://docs.reflexsoar.com/en/latest/detections')">
          <CIcon name='cil-book' size="lg" />
        </button>
      </h2><br>
      <CAlert :show.sync="alert.show" :color="alert.type" closeButton>
        {{ alert.message }}
      </CAlert>
      <CAlert :show="true" color="info"><b>Beta Feature</b>: This feature is in beta and requires a specific agent
        version and API version.</CAlert>
      <CCard>
        <CCardBody class="tabbed">
          <CTabs>
            <CTab title="Detection Rules" active>
              <CRow style="padding: 10px;">
                <CCol>
                  <CButton color="primary" @click="createDetectionModal()">New Detection</CButton>
                </CCol>
                <CCol col="5" class='text-right'>
                  <CDropdown color="secondary" toggler-text="Actions">
                      <CDropdownItem v-bind:disabled="selected_items.length == 0"  @click="enableDetections()"><CIcon name='cilCheck'/>&nbsp;Enable {{selected_items.length}} Detections</CDropdownItem>
                      <CDropdownItem v-bind:disabled="selected_items.length == 0"  @click="disableDetections()"><CIcon name='cilBan'/>&nbsp;Disable {{selected_items.length}} Detections</CDropdownItem>
                      <CDropdownItem v-bind:disabled="selected_items.length == 0"  @click="deleteDetectionModal()"><CIcon name='cilTrash' size="sm"/>&nbsp;Delete {{selected_items.length}} Detections</CDropdownItem>
                      <CDropdownItem v-bind:disabled="selected_items.length == 0"  @click="exportDetections()"><CIcon name='cilCloudDownload' size="sm"></CIcon>&nbsp;Export {{selected_items.length}} Detections</CDropdownItem>
                      <CDropdownItem @click="import_wizard = !import_wizard"><CIcon name='cilCloudUpload' size="sm"></CIcon>&nbsp; Import Detections</CDropdownItem>
                  </CDropdown>
                </CCol>
              </CRow>
                <CDataTable :items="filtered_items" :fields="detection_list_fields"
                  :items-per-page="25" column-filter :sorter='{ external: false, resetable: true }'
                  :sorterValue='{ column: "name", asc: true }' pagination :loading="loading" style="border-top: 1px solid #cfcfcf">
                  
                  <template #organization-filter="{ item }">
                    <RMultiCheck
                      :items="organizations_pick_list"
                      @checked="set_picker_filters($event, 'organization')"
                      size="sm"
                    ></RMultiCheck>
                  </template>
                  <template #select-filter="{ item }">
                    <input type="checkbox" :checked="selected_items.length > 0" @click="selectAll()" style="margin-left:7px"/>
                  </template>
                  <template #select="{ item }">
                    <td>
                      <input type="checkbox" :checked="item_is_selected(item.uuid)" @click="select_item(item.uuid)">
                    </td>
                    </template>
                  <template #name="{ item }">
                    <td>
                      <b>{{ item.name }}</b><br>
                      <span v-if="item.warnings && item.warnings.length > 0">
                        <li style="display: inline; margin-right: 2px;" v-for="warning, i in item.warnings" :key="i">
                          <CButton color="warning" class="tag" size="sm">{{ warning }}</CButton>
                        </li>
                      </span>
                    </td>
                  </template>
                  <template #organization="{ item }">
                    <td>
                      <OrganizationBadge :uuid="item.organization" />
                    </td>
                  </template>
                  <template #last_run="{ item }">
                    <td>
                      {{ item.last_run | moment('from', 'now') }}
                    </td>
                  </template>
                  <template #last_hit="{ item }">
                    <td>
                      <span v-if="item.last_hit">
                        {{ item.last_hit | moment('from', 'now') }}
                      </span>
                      <span v-else>
                        Never
                      </span>
                    </td>
                  </template>
                  <template #total_hits="{ item }">
                    <td>
                      {{ item.total_hits ? item.total_hits : 0 }}
                    </td>
                  </template>
                  <template #performance="{ item }">
                    <td>
                      {{ item.query_time_taken ? item.query_time_taken.toLocaleString() : 0 }} ms / {{ item.time_taken ?
                          item.time_taken.toLocaleString() : 0
                      }} ms
                    </td>
                  </template>
                  <template #actions="{ item }">
                    <td style="min-width:25px" class="text-right">
                      <CButtonGroup>
                        <CButton aria-label="View Detection" :to="`detections/${item.uuid}`" size="sm" color="primary"
                          v-c-tooltip="{ content: 'View Detection', placement: 'left' }">
                          <CIcon name='cilMagnifyingGlass' />
                        </CButton>
                        <CButton aria-label="Edit Detection" @click="editDetectionModal(item.uuid)" size="sm"
                          color="info" v-c-tooltip="{ content: 'Edit Detection', placement: 'left' }">
                          <CIcon name='cilPencil' />
                        </CButton>
                        <CButton v-if="item.active" aria-label="Disable Detection" @click="disableDetection(item.uuid)"
                          size="sm" color="warning" v-c-tooltip="{ content: 'Disable Detection', placement: 'left' }">
                          <CIcon name='cilBan' />
                        </CButton>
                        <CButton v-if="!item.active" aria-label="Enable Detection" @click="enableDetection(item.uuid)"
                          size="sm" color="success" v-c-tooltip="{ content: 'Enable Detection', placement: 'left' }">
                          <CIcon name='cilCheck' />
                        </CButton>
                        <CButton aria-label="Clone Detection" size="sm" color="secondary"
                          @click="cloneDetection(item.uuid)"
                          v-c-tooltip="{ content: 'Clone Detection', placement: 'left' }">
                          <CIcon name='cilCopy' />
                        </CButton>
                        <CButton aria-label="Export Detection" @click="exportDetection(item.uuid)"
                          size="sm" color="info"
                          v-c-tooltip="{ content: 'Export Detection - COMING SOON', placement: 'left' }">
                          <CIcon name='cilCloudDownload' />
                        </CButton>
                        <CButton v-if="!item.active" aria-label="Delete Detection"
                          @click="deleteDetectionModal(item.uuid)" size="sm" color="danger"
                          v-c-tooltip="{ content: 'Delete Detection', placement: 'left' }">
                          <CIcon name='cilTrash' />
                        </CButton>
                      </CButtonGroup>
                    </td>
                  </template>
                </CDataTable>
              <!--<DetectionRules></DetectionRules>-->
            </CTab>
            <CTab title="Detection Repositories">
            </Ctab>
            <CTab title="Detection Bundles">
            </CTab>
          </CTabs>
        </CCardBody>
      </CCard>
      <CModal :show.sync="confirm_delete" :close-on-backdrop="false" :centered="true" color="danger" title="Delete Detection Confirmation">
          <p>Are you sure you want to delete {{ selected_items.length }} detection(s)?</p>

          <CAlert color="info">
            <b>NOTE:</b> Only inactive detections will be deleted.
            </CAlert>
        <template #footer>
          <CButton color="secondary" @click="cancelDelete()">Cancel</CButton>
          <CButton color="danger" @click="deleteDetections()">Delete</CButton>
        </template>
      </CModal>
      <CModal :show.sync="import_wizard" :close-on-backdrop="false" :centered="true" size="lg" title="Import Detections JSON">
        <CTextarea v-model="import_json" placeholder="Paste JSON here" rows="10" />
        <template #footer>
          <CButton color="secondary" @click="cancelImport()">Cancel</CButton>
          <CButton color="info" @click="importDetections()">Import</CButton>
        </template>
      </CModal>
      <DetectionRuleModal :show.sync="show_detection_rule_modal" :rule.sync="rule" :mode="modal_mode" />
    </CCol></CRow>

  </div>
</template>

<script>
import { mapState } from 'vuex';
import 'prismjs/components/prism-yaml';
import '../assets/js/prism-rql';
import '../assets/css/prism-reflex.css'; // import syntax highlighting styles
import OrganizationBadge from './OrganizationBadge'
import DetectionRuleModal from './DetectionRuleModal'
import ImportSigmaRuleWizard from './detections/ImportSigmaRuleWizard.vue';
import RMultiCheck from './components/MultiCheck'

//const DetectionRules = () => import('@/views/DetectionRuleList')
export default {
  name: 'DetectionManagement',
  components: {
    //'DetectionRules': DetectionRules
    OrganizationBadge,
    DetectionRuleModal,
    ImportSigmaRuleWizard,
    RMultiCheck
},
  data() {
    return {
      import_wizard: false,
      import_json: '',
      confirm_delete: false,
      selected_items: [],
      picker_filters: {},
      detection_list_fields: [{key:'select', label:'', filter: false}, 'name', 'organization', 'last_run', 'last_hit', 'total_hits', { key: 'performance', label: 'Query Time / Total Time' }, {key: 'actions', filter: false}],
      modal_mode: "Create",
      show_detection_rule_modal: false,
      show_import_sigma_rule_modal: false,
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
        { 'name': 'car.2013-05-009' },
        { 'name': 'attack.defense_evastion' },
        { 'name': 'attack.t1036' },
        { 'name': 'attack.t1036.003' }],
      tag_list: [],
      createDetection: false,
      rule: {
        tags: [],
        query: {
          query: "okay",
          language: ""
        },
        source: {
          uuid: null
        },
        techniques: [],
        tactics: [],
        lookbehind: 5,
        interval: 5,
        rule_type: 0,
        severity: 1,
        risk_score: 0,
        mute_period: 0,
        exceptions: [],
        false_positives: [],
        references: [],
        threshold_config: {
          threshold: 0,
          key_field: null
        },
        field_mismatch_config: {
          source_field: '',
          target_field: '',
          operator: '=='
        },
        metric_change_config: {
          increase: false
        },
        new_terms_config: {
          key_field: '',
          max_terms: 1000,
          window_size: 30
        }
      }
    }
  },
  methods: {
    importDetections() {
      let data = {
        detections: JSON.parse(this.import_json)
      }
      console.log(data)
      this.$store.dispatch('importDetections', {data: data}).then(() => {
        this.import_json = ''
        this.import_wizard = false
      })
    },
    disableDetection(uuid) {
      this.$store.dispatch('updateDetection', { uuid: uuid, data: { 'active': false } })
    },
    enableDetection(uuid) {
      this.$store.dispatch('updateDetection', { uuid: uuid, data: { 'active': true } })
    },
    editDetectionModal(uuid) {
      this.modal_mode = "Edit"
      this.rule = JSON.parse(JSON.stringify(this.detections.find(detection => detection.uuid === uuid)))
      this.show_detection_rule_modal = true
    },
    importSigmaRuleModal() {
      this.rule = this.defaultRule()
      this.show_import_sigma_rule_modal = true
    },
    defaultRule() {
      return {
        
        name: '',
        tags: [],
        query: {
          query: "okay",
          language: ""
        },
        source: {
          uuid: null
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
        false_positives: [],
        references: [],
        threshold_config: {
          threshold: 0,
          max_events: 10,
          key_field: '',
          operator: '==',
          dynamic: false,
          per_field: false,
          discovery_period: 7,
          recalculation_period: 24
        },
        field_mismatch_config: {
          source_field: '',
          target_field: '',
          operator: '=='
        },
        metric_change_config: {
          increase: false,
          threshold_format: 0,
          threshold: 0
        },
        new_terms_config: {
          key_field: '',
          max_terms: 1000,
          window_size: 30
        }
      }
    },
    createDetectionModal() {
      this.modal_mode = "Create"
      this.rule = {
        name: '',
        tags: [],
        query: {
          query: "okay",
          language: ""
        },
        source: {
          uuid: null
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
        false_positives: [],
        references: [],
        threshold_config: {
          threshold: 0,
          max_events: 10,
          key_field: '',
          operator: '==',
          dynamic: false,
          per_field: false,
          discovery_period: 7,
          recalculation_period: 24
        },
        field_mismatch_config: {
          source_field: '',
          target_field: '',
          operator: '=='
        },
        metric_change_config: {
          increase: false,
          threshold_format: 0,
          threshold: 0
        },
        new_terms_config: {
          key_field: '',
          max_terms: 1000,
          window_size: 30
        }
      }
      this.show_detection_rule_modal = true
    },
    deleteDetectionModal(uuid=null) {
      this.confirm_delete = true
      if (uuid !== null)
       { this.selected_items = [uuid]}
    },
    cloneDetection(uuid) {
      let source_detection = this.detections.find(r => r.uuid === uuid)
      this.rule = JSON.parse(JSON.stringify(source_detection))
      this.rule = Object.assign({}, source_detection)
      this.rule.name = '[COPY] ' + source_detection.name
      this.modal_mode = 'Clone'
      this.show_detection_rule_modal = true
    },
    addTag(newTag) {
      const tag = {
        name: newTag
      }
      this.tag_list.push(tag)
      this.tags.push(tag)
    },
    set_picker_filters(val, key) {
      if (!this.picker_filters.hasOwnProperty(key)) {
        this.$set(this.picker_filters, key, []);
      }
      if (val.length == 0) {
        this.$delete(this.picker_filters, key);
      } else {
        this.$set(this.picker_filters, key, val);
      }
    },
    select_item(i) {
      if (this.selected_items.includes(i)) {
        this.selected_items = this.selected_items.filter((item) => item !== i);
      } else {
        this.selected_items.push(i);
      }
    },
    selectAll() {
      if (this.selected_items.length > 0) {
        this.selected_items = [];
      } else {
        this.selected_items = this.detections.map((item) => item.uuid);
      }
    },
    item_is_selected(i) {
      return this.selected_items.includes(i);
    },
    exportDetection(uuid) {
      this.$store.dispatch('exportDetection', { uuid: uuid }).then(resp => {
        let blob = new Blob([JSON.stringify(resp.data)])
        let link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = uuid + '.json'
        link.click()
      })
    },
    exportDetections() {
      this.$store.dispatch('exportSelectedDetections', { uuids: this.selected_items }).then(resp => {
        let blob = new Blob([JSON.stringify(resp.data)])
        let link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = 'detections.json'
        link.click()
      })
    },
    deleteDetections() {
      this.$store.dispatch('deleteSelectedDetections', { uuids: this.selected_items }).then(resp => {
        this.selected_items = []
        this.confirm_delete = false
      })
    },
    cancelDelete() {
      this.selected_items = []
      this.confirm_delete = false
    },
    disableDetections() {
      this.$store.dispatch('disableSelectedDetections', { uuids: this.selected_items }).then(resp => {
        this.selected_items = []
      })
    },
    enableDetections() {
      this.$store.dispatch('enableSelectedDetections', { uuids: this.selected_items }).then(resp => {
        this.selected_items = []
      })
    }
  },
  computed: {
    filtered_items() {
      let items = this.detections;
      let action = "getDetections";
      if (items.length == 0) {
        this.$store.dispatch(action, {});
        if (this.tags !== undefined) {
          this.tags = items.map((item) => {
            if (item.tags !== undefined && item.tags.length > 0) {
              return item.tags;
            }
          });
        }
      }
      let _items = [];
      if (Object.keys(this.picker_filters).length == 0) {
        return items;
      }
      for (let i in items) {
        let item = items[i];
        let match = true;
        for (let key in this.picker_filters) {
          if (this.picker_filters[key].length > 0) {
            if (typeof item[key] == "boolean") {
              if (!this.picker_filters[key].includes(item[key].toString())) {
                match = false;
              }
            } else if (typeof item[key] == "object") {
              if (item[key]) {
                if (!item[key].some((r) => this.picker_filters[key].includes(r))) {
                  match = false;
                }
              } else {
                match = false;
              }
            } else {
              if (!this.picker_filters[key].includes(item[key])) {
                match = false;
              }
            }
          }
        }
        if (match) {
          _items.push(item);
        }
      }
      return _items;
    },
    organizations_pick_list() {
      return this.organizations.map((o) => {
        return { label: o.name, value: o.uuid };
      });
    },
    ...mapState(['alert', 'detections', 'loading','organizations'])
  },
  created() {
    this.$store.commit('add_start') // Stop the success/fail add from showing up when changing from other pages
    this.$store.dispatch('getDetections', {page_size: 10000})
  }
}
</script>
