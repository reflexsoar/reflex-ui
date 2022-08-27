<template>
  <CRightDrawer fixed :minimize="minimize" :show="show" :aside="true" :narrow="true" colorScheme="light"
    @update:show="(value) => $store.commit('set', ['mitreDrawerShow', value])">
    <CRow>
      <CCol>
        <CCardBody>
          <CRow>
            <CCol><h2>{{mitre_technique.name}} - {{mitre_technique.external_id}}</h2><label>Phases</label>:&nbsp;<li style="display: inline; margin-right: 2px;" v-for="name in mitre_technique.phase_names"
              :key="name">
              <CButton color="dark" class="tag" size="sm">{{ name }}</CButton>
            </li></CCol>
            
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
              <div v-if="loading" class="text-center"><CSpinner></CSpinner></div>
              <div v-else>
                <span v-if="associated_detections.length != 0"><ul>
                  <li v-for="detection in associated_detections" :key="detection.uuid">
                  <b><router-link :to="`/detections/${detection.uuid}`">{{detection.name}}</router-link></b> - {{detection.description}}
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

export default {
  name: 'MitreTechniqueDrawer',
  nav,
  props: {
    technique: {}
  },
  components: {
    CRightDrawer
  },
  created: function () {     
  },
  watch: {
    minimize(val) {
      if (!val) {
        this.loading = true
        this.getDetections(this.mitre_technique.external_id, this.mitre_technique.phase_names)
      } else {
        
      }
    }
  },
  data() {
    return {
      associated_detections: [],
      loading: false
      
    }
  },
  computed: {
    show() {

      return this.$store.state.mitreDrawerShow
    },
    minimize() {
      return this.$store.state.mitreDrawerMinimize
    },
    ...mapState(['mitre_technique'])
  },
  methods: {
    getDetections(tech,tactics){
      this.$store.dispatch('getDetections', { tactics: tactics, technique: tech, save: false }).then(resp => {
        this.associated_detections = resp.data.detections
        this.loading = false
      }).err(err => {
        this.loading = false
      })
    }
    
  }
}
</script>
