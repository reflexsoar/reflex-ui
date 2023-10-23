<template>
  <CRightDrawer fixed :minimize="minimize" :show="show" :aside="true" :narrow="true" colorScheme="light"
    @update:show="(value) => $store.commit('set', ['mitreDrawerShow', value])">
    <CRow>
      <CCol>
        <CCardBody>
          <CRow>
            <CCol><h2>{{mitre_technique.name}} - {{mitre_technique.external_id}}</h2><TagList :tags="mitre_technique.phase_names" :tagIcon="false"/>
              </CCol>
            
            <CCol col="3" class="text-right">
              <CButton color="secondary" @click="$store.commit('set', ['mitreDrawerMinimize', true])">Close</CButton>
            </CCol>
          </CRow>
          <hr>
          <div style="overflow-y: scroll; overflow-x: hidden; overflow-wrap: break-word; max-height: calc(100vh - 150px)">
          <CRow>
            <CCol>              
              <h3>Description</h3>
              <vue-markdown :source="mitre_technique.description"></vue-markdown>
            </CCol>
          </CRow>
          <CRow>
            <CCol>
              <hr>
              <h3>References</h3>
              <ul>
                <li v-for="ref in mitre_technique.external_references" :key="ref.external_id">
                  {{ref.url}}&nbsp;<a _target="_child" :href="ref.url" target="_blank"><CIcon name='cil-external-link' size="sm"/></a>
                </li>
              </ul>
            </CCol>
          </CRow>
          <CRow>
            <CCol>
              <hr>
              <h3>Data Sources</h3>
              <ul>
                <li v-for="ref in mitre_technique.data_sources" :key="ref">
                  {{ref}}
                </li>
              </ul>
            </CCol>
          </CRow>
          <CRow>
            <CCol>
              <hr>
              <h3>Detections</h3>
              <div v-if="detections_loading" class="text-center"><CSpinner></CSpinner></div>
              <div v-else>
                <CDataTable
                  :items="associated_detections"
                  :fields="[{key: 'name', label:'Name', _style:'width: 60%'},'severity','risk_score','active']"
                  :column-filter="true"
                  sorter
                  pagination
                  >
                  <template #name="{item}">
                    <td>
                      <b><router-link :to="`/detections/${item.uuid}`">{{item.name}}</router-link></b><br>
                      {{ item.description }}
                    </td>
                  </template>
                  <template #severity="{item}">
                    <td>
                      <CBadge class="tag" size="sm" :color="getSeverityColor(item.severity)">{{getSeverityText(item.severity)}}</CBadge>
                    </td>
                  </template>
                  <template #risk_score="{item}">
                    <td>
                      <CBadge class="tag" size="sm" :color="getSeverityColor(item.severity)">{{ item.risk_score }}</CBadge>
                    </td>
                  </template>
                  <template #active="{item}">
                    <td>
                      <CBadge class="tag" size="sm" v-if="item.active" color="success">Active</CBadge>
                      <CBadge class="tag" size="sm" v-else color="danger">Inactive</CBadge>
                    </td>
                  </template>
                </CDataTable>
              </div>
            </CCol>
          </CRow>
          <CRow>
            <CCol>
              <hr>
              <h3>Inputs</h3>
              <div v-if="detections_loading" class="text-center"><CSpinner></CSpinner></div>
              <div v-else>
                <span v-if="associated_inputs.length != 0"><ul>
                  <li v-for="input in associated_inputs" :key="input.uuid">
                  <b><router-link :to="`/inputs/${input.uuid}`">{{input.name}}</router-link></b> - {{input.description}}
                  </li></ul>
                  </span>
                  <span v-else>No Associated Detections</span>
              </div>
            </CCol>
          </CRow></div>
        </CCardBody>
      </CCol>
    </CRow>

  </CRightDrawer>
</template>

<style scoped>
.tab-container {
  overflow-y: scroll;
  overflow-x: scroll;
  max-height: calc(100vh - 200px);
}

.c-sidebar {
  width: 60% !important;
  overflow-y: visible
}

.c-sidebar.c-sidebar-fixed {
  z-index: 1052;
}

.c-sidebar-minimized.c-sidebar-fixed {
  width: 0px !important;
  z-index: 1052;
}
</style>

<style scoped>
/* required class */


/* optional class for removing the outline */

.modal-body {
  padding-left: 0px;
}
</style>

<script>

import { mapState } from "vuex";
import nav from '../../containers/_nav'
import 'vue-json-pretty/lib/styles.css';
import CRightDrawer from '../CRightDrawer'
import TagList from '../components/TagList'

export default {
  name: 'MitreTechniqueDrawer',
  nav,
  props: {
    technique: {},
    organization: {
      type: String,
      default: ''
    }
  },
  components: {
    CRightDrawer,
    TagList
  },
  created: function () {     
  },
  watch: {
    minimize(val) {
      if (!val) {
        this.loading = true
        let technique_ids = []
        this.getDetections(this.mitre_technique.external_id, this.mitre_technique.phase_names)
        this.getInputs(this.mitre_technique.data_sources)
      }
    }
  },
  data() {
    return {
      associated_detections: [],
      associated_inputs: [],
      loading: false,
      detections_loading: true,
      inputs_loading: true
    }
  },
  computed: {
    show() {
      return this.$store.state.mitreDrawerShow
    },
    minimize() {
      return this.$store.state.mitreDrawerMinimize
    },
    ...mapState(['mitre_technique','current_user'])
  },
  methods: {
    getSeverityColor(severity) {
      switch (severity) {
        case 0:
          return "light";
        case 1:
          return "dark";
        case 2:
          return "info";
        case 3:
          return "warning";
        case 4:
          return "danger";
        default:
          return "danger";
      }
    },
    getSeverityText(severity) {
      switch (severity) {
        case 0: 
          return "Informational";
        case 1:
          return "Low";
        case 2:
          return "Medium";
        case 3:
          return "High";
        case 4:
          return "Critical";
        default:
          return "Unknown";
      }
    },
    getDetections(tech,tactics){
      this.detections_loading = true
      this.$store.dispatch('getDetections', { techniques: tech, save: false, organization: this.organization }).then(resp => {
        this.associated_detections = resp.data.detections

        // Sort the detections by their external_id in alphabetical order
        
        this.detections_loading = false
      }).catch(err => {
        this.detections_loading = false
      })
    },
    getInputs(mitre_data_sources) {
      this.inputs_loading = true
      this.$store.dispatch('getInputs', { mitre_data_sources: mitre_data_sources, organization: this.organization }).then(resp => {
        this.associated_inputs = resp.data.inputs
        this.inputs_loading = false
      }).catch(err => {
        this.inputs_loading = false
      })
    }    
  }
}
</script>
