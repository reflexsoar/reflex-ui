<template>
  <div><link rel="stylesheet" href="https://unpkg.com/vue-multiselect@2.1.0/dist/vue-multiselect.min.css"><CCol xs="12" lg="12">
    <h2>Event Rules</h2><br>
    <CAlert :show.sync="alert.show" :color="alert.type" closeButton>
      {{alert.message}}
    </CAlert>
    <CCard>
      <CCardBody class="tabbed">
        <CTabs>
          <CTab active>
            <template slot="title">
              Event Rules
            </template>
            
            <CRow style="padding: 10px;">
              <CCol>
                <CButton color="primary" @click="newRuleModal = !newRuleModal" >New Event Rule</CButton>
              </CCol>
            </CRow>
            <hr style="margin-bottom:0px; margin-top:0px;">
            <CDataTable
            :items="rules"
            :fields="fields"
            >
            <template #name="{item}">
              <td><span onmouseover="" style="cursor: pointer;" @click="viewRule(item.uuid)"><b >{{item.name}}</b><br>{{item.description}}</span></td>
            </template>
            <template #hits="{item}">
              <td>{{item.hits ? item.hits : 0}} hits</td>
            </template>
            <template #merge_into_case="{item}">
              <td><CSwitch color="success" label-on="Yes" label-off="No" v-bind:checked.sync="item.merge_into_case" disabled></CSwitch></td>
            </template>
            <template #dismiss="{item}">
              <td><CSwitch color="success" label-on="Yes" label-off="No" v-bind:checked.sync="item.dismiss" disabled></CSwitch></td>
            </template>
            <template #admin="{item}"> 
              <td class="text-right"><CButton size="sm" color="info" @click="editRule(item.uuid)">Edit Rule</CButton>&nbsp;<CButton v-if="item.active" size="sm" color="danger" @click="disableRule(item.uuid)">Disable</CButton><CButton v-else size="sm" color="success" @click="enableRule(item.uuid)">Activate</CButton>&nbsp;<CButton v-if="!item.active" color='danger' @click="delete_modal = true" size="sm">Delete</CButton></td>
            </template>
            </CDataTable>
          </CTab>
        </CTabs>
      </CCardBody>
    </CCard>
  </CCol>
  <CModal :show.sync="show_modal" :centered="true" :title="rule.name" size="xl" :closeOnBackdrop="backdrop_close" style="width: 80%">
    <CAlert :show.sync="test_complete" :color="test_result_color" closeButton>
      {{test_result}}
    </CAlert>
    <p><b>Description</b><br>{{rule.description}}</p>
    <prism-editor :readonly="modal_mode != 'edit'" class="my-editor" v-model="rule.query" :highlight="highlighter" line-numbers></prism-editor><br>
    <CRow v-if="modal_mode == 'edit'">
      <CCol lg="12">
        <label>Merge into Case</label><br>
        <CSwitch label-on="Yes" label-off="No" color="success" v-bind:checked.sync="rule.merge_into_case"></CSwitch>
        <CInput label="Case" v-if="rule.merge_into_case" v-model="rule.case_uuid"></CInput>
      </CCol>
      <CCol lg="12">
        <label>Dismiss</label><br>
        <CSwitch label-on="Yes" label-off="No" color="success" v-bind:checked.sync="rule.dismiss"></CSwitch>
      </CCol>
    </CRow><br>
    <CRow v-if="modal_mode == 'edit'">
      <CCol lg="12">
        <h5>Rule Testing</h5>
        <CInput description="Reflex will fetch the last N events and compare this rule to them" label="Number of test events" v-model="event_count"><template #append><CButton color="primary" @click="testRule()"><span v-if="!test_running">Test Rule</span><span v-else>Testing...</span></CButton></template></CInput>
      </CCol>
      <CCol lg="12">
        <label>Include Results</label><br>
        <CSwitch color="success" label-on="Yes" label-off="No" :v-bind:checked.sync="return_events"></CSwitch>
      </CCol>
    </CRow>
    <template #footer>
      <CButton color="secondary" @click="show_modal = !show_modal">Close</CButton>
      <CButton color="primary" v-if="modal_mode == 'edit'" :disabled="test_failed || (!test_complete && !test_failed)">Edit</CButton>
    </template>
  </CModal>
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
    min-height: 250px;
    max-height: 400px;
    overflow: scroll;
    overflow-x: hidden;
  }

  /* optional class for removing the outline */
  .prism-editor__textarea:focus {
    outline: none;
  }

  .modal-lg {
    max-width: 80%;    
  }

  .modal-body {
    overflow-y: scroll;
    max-height: 600px;
  }
</style>
<script>
import {mapState} from 'vuex';
import { PrismEditor } from 'vue-prism-editor'
import { highlight, languages } from 'prismjs/components/prism-core';
import 'vue-prism-editor/dist/prismeditor.min.css'; // import the styles somewhere
import 'prismjs/components/prism-python';
import '../assets/js/prism-rql';
import '../assets/css/prism-reflex.css'; // import syntax highlighting styles
export default {
    components: {
      PrismEditor
    },
    name: 'EventRuleManagement',
    data () {
      return {
        rules: [],
        rule: {},
        fields: ['name','hits','merge_into_case','dismiss','admin'],
        modal_mode: 'new',
        show_modal: false,
        test_result: "",
        test_running: false,
        test_complete: false,
        test_failed: false,
        test_result_color: "success",
        event_count: 100, // How many events to test a rule against
        return_events: false,
        backdrop_close: false
      }
    },
    methods: {
      testRule() {
        let data = {
          'uuid': '',
          'query': this.rule.query,
          'event_count': parseInt(this.event_count),
          'return_results': this.return_events
        }
        this.test_running = true
        this.$store.dispatch('testEventRuleQuery', data).then(resp => {
          if (resp.data.success == true)
          {
            this.test_result = resp.data.message
            this.test_result_color = "success"

          } else {
            this.test_result = resp.data.message + ". Try increasing the number of test events."
            this.test_result_color = "warning"
            this.test_failed = true
          }
          this.test_running = false
          this.test_complete = true
        }).catch(err => {
          this.test_complete = true
          this.test_running = false
          this.test_failed = true
          this.test_rule = err.response.data.message
          this.test_result_color = "danger"
        })
      },
      highlighter(code) {
        return highlight(code, languages.rql);
      },
      viewRule(uuid) {
        this.rule = this.rules.find(r => r.uuid === uuid)
        this.modal_mode = 'view'
        this.show_modal = true
        this.backdrop_close = true
      },
      editRule(uuid) {
        this.rule = this.rules.find(r => r.uuid === uuid)
        this.modal_mode = 'edit'
        this.show_modal = true
        this.test_result = ""
        this.event_count = 100
        this.test_complete = false
        this.backdrop_close = false
      },
      loadRules() {
        this.$store.dispatch('loadEventRules').then(resp => {
          this.rules = resp.data
        })
      },
      addTag (newTag) {
        const tag = {
          name: newTag
        }
        this.tag_list.push(tag)
        this.tags.push(tag)
      }
    },
    computed: mapState(['alert']),
    created() {
      this.loadRules()
    }
}
</script>
