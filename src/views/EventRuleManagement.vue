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
                <CButton color="primary" @click="show_modal = !show_modal" >New Event Rule</CButton>
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
            <template #last_matched_date="{item}">
              <td v-if="item.last_matched_date">{{item.last_matched_date | moment('from', 'now') }}</td>
              <td v-else>Never</td>
            </template>
            <template #merge_into_case="{item}">
              <td><CSwitch color="success" label-on="Yes" label-off="No" v-bind:checked.sync="item.merge_into_case" disabled></CSwitch></td>
            </template>
            <template #dismiss="{item}">
              <td><CSwitch color="success" label-on="Yes" label-off="No" v-bind:checked.sync="item.dismiss" disabled></CSwitch></td>
            </template>
            <template #admin="{item}"> 
              <td class="text-right"><CButton size="sm" color="info" @click="editRule(item.uuid)">Edit Rule</CButton>&nbsp;<CButton v-if="item.active" size="sm" color="danger" @click="disableRule(item.uuid)">Disable</CButton><CButton v-else size="sm" color="success" @click="enableRule(item.uuid)">Activate</CButton>&nbsp;<CButton v-if="!item.active" color='danger' @click="delete_modal = true; target_event_rule_uuid = item.uuid" size="sm">Delete</CButton></td>
            </template>
            </CDataTable>
          </CTab>
        </CTabs>
        <CRow>
        <CCol lg="12" sm="12">
          <CCardBody v-if="pagination.pages > 0">
            <CPagination :activePage.sync="current_page" :pages="pagination.pages"/>
          </CCardBody>
        </CCol>
      </CRow>
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
      <CCol lg="6">
        <label>Merge into Case</label><br>
        <CSwitch label-on="Yes" label-off="No" color="success" v-bind:checked.sync="rule.merge_into_case"></CSwitch>
        <multiselect
            style="z-index: 5"
            v-if="rule.merge_into_case"
            v-bind:required="rule.merge_into_case"
            v-model="rule.case_uuid" 
            label="title" 
            :options="cases" 
            track-by="uuid" 
            :searchable="true"
            :internal-search="false"
            :options-limit="10"
            :show-no-results="false" 
            @search-change="findCase">
            <template slot="option" slot-scope="props">
                {{props.option.title}}<br><small>{{props.option.event_count ? props.option.event_count : 0}} events.</small>
            </template>
        </multiselect><br>
      </CCol>
      <CCol lg="6">
        <label>Add Tags</label><br>
        <CSwitch label-on="Yes" label-off="No" color="success" v-bind:checked.sync="rule.add_tags"></CSwitch>
      </CCol>
      <CCol lg="6">
        <label>Dismiss</label><br>
        <CSwitch label-on="Yes" label-off="No" color="success" v-bind:checked.sync="rule.dismiss"></CSwitch>
      </CCol>
    </CRow>
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
  <CModal title="Delete Event Rule" color="danger" :centered="true" size="lg" :show.sync="delete_modal">
      <div>
        <p>Deleting an event is a permanent action, are you sure you want to continue?</p>
      </div>
      <template #footer>
          <CButton @click="delete_modal = !delete_modal" color="secondary">Dismiss</CButton>
        <CButton @click="deleteRule(target_event_rule_uuid)" color="danger" v-bind:disabled.sync="dismiss_submitted"><CSpinner color="success" size="sm" v-if="dismiss_submitted"/><span v-else>Delete</span></CButton>
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
        fields: ['name','last_matched_date','merge_into_case','dismiss','admin'],
        modal_mode: 'new',
        show_modal: false,
        test_result: "",
        test_running: false,
        test_complete: false,
        test_failed: false,
        test_result_color: "success",
        event_count: 100, // How many events to test a rule against
        return_events: false,
        backdrop_close: false,
        cases: [],
        page: 1,
        page_size: 10,
        pagination: {},
        current_page: 1,
        delete_modal: false,
        dismiss_submitted: false,
        target_event_rule_uuid: ''
      }
    },
    methods: {
      findCase(query) {
          let fields = 'uuid,title,id,event_count,owner,severity'
          this.$store.dispatch('getCasesByTitle', {title: query, fields}).then(resp => {
              this.cases = this.$store.getters.cases
          })
      },
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
        this.rule = Object.assign({}, this.rules.find(r => r.uuid === uuid))
        this.modal_mode = 'view'
        this.show_modal = true
        this.backdrop_close = true
      },
      editRule(uuid) {
        this.rule = Object.assign({}, this.rules.find(r => r.uuid === uuid))
        this.modal_mode = 'edit'
        this.show_modal = true
        this.test_result = ""
        this.event_count = 100
        this.test_complete = false
        this.backdrop_close = false
        this.$store.dispatch('getCases', {})
        this.cases = this.$store.getters.cases
      },
      loadRules() {
        let page = this.page
        let page_size = this.page_size
        this.$store.dispatch('loadEventRules', {page, page_size}).then(resp => {
          this.rules = this.$store.getters.event_rules
          this.pagination = resp.data.pagination
        })
      },
      disableRule(uuid) {
        let data = {
          active: false
        }
        this.$store.dispatch('updateEventRule', {uuid, data}).then(resp => {
          this.rules = this.$store.getters.event_rules
        })
      },
      enableRule(uuid) {
        let data = {
          active: true
        }
        this.$store.dispatch('updateEventRule', {uuid, data}).then(resp => {
          this.rules = this.$store.getters.event_rules
        })
      },
      deleteRule(uuid) {
        this.dismiss_submitted = true
        let data = {
          active: true
        }
        this.$store.dispatch('deleteEventRule', {uuid, data}).then(resp => {
          this.dismiss_submitted = false
          this.delete_modal = false
        })
        this.loadRules()
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
