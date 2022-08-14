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
    <h1><CRow style="padding: 10px 10px 0px 10px">
      <CCol>{{event_data.title}}</CCol>
      <CCol col="3" class="text-right"><CButton color="secondary"
        @click="$store.commit('set', ['eventDrawerMinimize', true])"
      >Close</CButton></CCol>
    </CRow></h1>
    <CRow  style="padding: 10px 10px 0px 10px">
      <CCol>
        <b>Status:</b> {{event_data.status ? event_data.status.name : 'Unknown'}}<span v-if="event_data.dismiss_reason"> - {{event_data.dismiss_reason}}<br><b>Comment:</b> {{event_data.dismiss_comment}}<br><b>Dismissed By:</b> {{event_data.dismissed_by.username}}</span>
      </CCol>
    </CRow>
    <CRow style="padding: 10px 10px 0px 10px">
      <CCol>
        <CIcon name="cilTags"/>&nbsp;<li style="display: inline; margin-right: 2px;" v-for="tag in event_data.tags" :key="tag"><CButton color="dark" class="tag" size="sm">{{ tag }}</CButton></li><br><br>
      </CCol>
    </CRow>
    <CTabs :activeTab.sync="activeTab" class="tabbed" style='overflow-y: scroll; overflow-x: scroll'>
      <CTab title="Overview" active>
        <CRow style="padding: 10px 10px 0px 10px">
          <CCol>
            <h3>Description</h3>
            {{event_data.description}}
          </CCol>
        </CRow>
        <hr>
        <CRow style="padding: 10px 10px 0px 10px">
          <CCol>
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
              <template #value="{item}">
                  <td>
                      <b>{{item.value}}</b><br><small>{{item.source_field ? item.source_field.toLowerCase() : 'none'}} | {{item.data_type}}</small>
                  </td>
              </template>
              <template #ioc="{item}">
                  <td>
                      <CSwitch style="padding-top:3px" color="danger" label-on="Yes" label-off="No" :checked.sync="item.ioc" :disabled.sync="item.safe" v-on:change.native="toggleISS(event_data.uuid, item.value, 'ioc', item.ioc)"/>
                  </td>
              </template>
              <template #spotted="{item}">
                  <td>
                      <CSwitch style="padding-top:3px" color="danger" label-on="Yes" label-off="No" :checked.sync="item.spotted" v-on:change.native="toggleISS(event_data.uuid, item.value, 'spotted', item.spotted)"/>
                  </td>
              </template>
              <template #safe="{item}">
                  <td>
                      <CSwitch style="padding-top:3px" color="success" label-on="Yes" label-off="No" :checked.sync="item.safe" :disabled.sync="item.ioc" v-on:change.native="toggleISS(event_data.uuid, item.value, 'safe', item.safe)"/>
                  </td>
              </template>
              <template #tags="{item}">
                  <td>
                      <CIcon name='cilTags'/>&nbsp;<li style="display: inline; margin-right: 2px;" v-for="tag in item.tags" :key="tag"><CButton color="primary" size="sm" disabled>{{ tag }}</CButton></li>
                  </td>
            </template>
          </CDataTable>
          </CCol>
        </CRow>
      </CTab>
      <CTab title="Raw Log">
        <CRow style="padding: 10px 10px 0px 10px;">
          <CCol >
            <h3>Raw Log</h3>
            <vue-json-pretty :showLength="true" selectableType="multiple" :path="'res'" :data="jsonify(event_data.raw_log)"></vue-json-pretty><br>
          </CCol>
        </CRow>
      </CTab>
      <CTab title="Tuning Advice" v-if="this.event_data.tuning_advice">
      <CRow>
        <CCol>
          <CCardBody>
            <h3>Tuning Advice</h3>
            <vue-markdown>{{event_data.tuning_advice}}</vue-markdown>
          </CCardBody>
        </CCol>
      </CRow></CTab>
      <CTab :title="`Matched Event Rules - ${this.event_data.event_rules.length}`" v-if="this.event_data.event_rules">
        <CRow style="padding: 10px 10px 0px 10px">
          <CCol>
            <h3>Matched Event Rules</h3>
            <p>The rules listed below have acted on this event at some point in time.</p>
            <CRow v-for="rule in rules" :key="rule.uuid">
              <CCol>
                <CCardBody>
                  <h5>{{rule.name}}</h5>
                  <prism-editor rows="10" class="my-editor" v-model="rule.query" :highlight="highlighter" line-numbers></prism-editor>
                </CCardBody>
              </CCol>
            </CRow>
          </CCol>
        </CRow>          
      </CTab>
      <CTab title="Detection" v-if="this.event_data.detection_id">
        <CCardBody>
            <h3>Detection</h3>
            {{detection.description}}<br><br>
            <div>
              <h4>Base Query</h4>
              <pre>{{detection.query.query}}</pre>
            </div>
            <div v-if="detection.guide">
              <h4>Investigation Guide</h4>
              {{detection.guide}}<br><br>

              <p><b>False Positives</b><br>
              <li v-for="fp,i in detection.false_positives" :key="i">
                  {{fp}}
              </li></p>
              <p><b>References</b><br>
              <li v-for="ref,i in detection.references" :key="i">
                  <a v-bind:href="ref" target="_">{{ref}}</a>
              </li></p>
            </div>

            <h4>MITRE ATT&CK</h4>
            <p><b>MITRE ATT&CK Tactics</b> <li style="display: inline; margin-right: 2px;" v-for="t in detection.tactics" :key="t.name"><CButton color="primary" size="sm" disabled="">{{ t.name }}</CButton></li></p>
            <p><b>MITRE ATT&CK Techniques</b> <li style="display: inline; margin-right: 2px;" v-for="t in detection.techniques" :key="t.name"><CButton color="primary" size="sm" disabled="">{{ t.name }}</CButton></li></p>

            <div v-if="detection.exceptions">
              <h4>Exceptions</h4>
              <CDataTable
                :items="detection.exceptions"
                :fields="['field','condition','values',{key: 'list', label:'Intel List'},{key: 'admin', label: ''}]">
                <template #admin="{item}">
                <td class="text-right">
                    <CButton aria-label="Edit Exclusion"  size="sm" color="info" v-c-tooltip="{content:'Edit Exclusion', placement:'left'}"><CIcon name='cilPencil'/></CButton>&nbsp;
                    <CButton aria-label="Delete Exclusion"  size="sm" color="danger" v-c-tooltip="{content:'Delete Exclusion', placement:'left'}"><CIcon name='cilTrash'/></CButton>
                </td>
                </template>
                <template #values="{item}">
                <td>
                    <li style="display: inline; margin-right: 2px;" v-for="value in item.values" :key="value"><CButton color="primary" size="sm" disabled>{{ value }}</CButton></li>
                </td>
                </template>
                <template #list="{item}">
                <td>
                    <span v-if="item.list.name !== null"><CButton color="primary" size="sm" disabled>{{item.list.name}}</CButton></span>
                </td>
                </template>
                </CDataTable>
            </div>
        </CCardBody>
      </CTab>
    </CTabs>
    </CCol>
  </CRow>
  
  </CRightDrawer>
</template>

<style scoped>

.c-sidebar {
  width: 60% !important;
   overflow-y: scroll;
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
</style>

<script>
import nav from '../containers/_nav'
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';
import CRightDrawer from './CRightDrawer'
import { PrismEditor } from 'vue-prism-editor'
import { highlight, languages } from 'prismjs/components/prism-core';
import 'vue-prism-editor/dist/prismeditor.min.css'; // import the styles somewhere
import 'prismjs/components/prism-python';
import '../assets/js/prism-rql';
import '../assets/css/prism-reflex.css'; // import syntax highlighting styles

export default {
  name: 'EventDrawer',
  nav,
  props: {
      event_data: {}
  },
  components: {
    VueJsonPretty,
    CRightDrawer,
    PrismEditor
  },
  created: function() {
    if (this.$store.state.unread_alert_count > 0) {
      nav[0]._children[1]['badge'] = {'color': 'danger', 'text': this.$store.state.unread_alert_count}
    }
  },
  watch: {
    minimize (val) {
      if (!val) {
        this.event_data = this.$store.getters.event
        if(this.event_data.event_rules) {
          this.$store.dispatch('loadEventRules', {rules: this.event_data.event_rules, save: false}).then(resp => {
            this.rules = resp.data.event_rules
          })
        }
        if(this.event_data.detection_id) {
          this.$store.dispatch('getDetection', this.event_data.detection_id).then(resp => {
            this.detection = resp.data
          })
        }
      }
    }
  },
  data() {
    return {
      observable_fields: ['value', 'ioc', 'spotted', 'safe', 'tags'],
      activeTab: 1,
      rules: [],
      detection: {}
    }
  },
  computed: {
    show () {
      return this.$store.state.eventDrawerShow 
    },
    minimize () {
      return this.$store.state.eventDrawerMinimize 
    }
  },
  methods: {
     toggleISS(uuid, observable_value, field, value) {
      let data = {};
      data[field] = value
      this.$store.dispatch('updateEventObservable', {uuid, observable_value, data}).then(resp => {
        this.observables = this.$store.getters.observables
      })
    },
    highlighter(code) {
        return highlight(code, languages.rql);
    },
    jsonify(s) {
        try {
            return JSON.parse(s)
        } catch (e) {
            return s
        }
    }
  }
}
</script>
