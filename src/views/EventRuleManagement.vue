<template>
  <div><link rel="stylesheet" href="https://unpkg.com/vue-multiselect@2.1.0/dist/vue-multiselect.min.css"><CCol xs="12" lg="12">
    <h2>Event Rules<button type="button" class="kb" onclick="window.open('https://docs.reflexsoar.com/en/latest/event-rules/')"><CIcon name='cil-book' size="lg"/></button></h2><br>
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
            :loading="loading"
            >
            <template #name="{item}">
              <td><span onmouseover="" style="cursor: pointer;" @click="viewRule(item.uuid)"><b >{{item.name}}</b><br>{{item.description}}</span></td>
            </template>
            <template #organization="{item}">
              <td>
                <CButton class="tag" size="lg" color="secondary">{{mapOrgToName(item.organization)}}</CButton>
              </td>
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
              <td class="text-right"><!--<CButton size="sm" color="info" @click="cloneRule(item.uuid)">Clone Rule</CButton>&nbsp;--><CButton size="sm" color="info" @click="editRule(item.uuid)">Edit Rule</CButton>&nbsp;<CButton v-if="item.active" size="sm" color="danger" @click="disableRule(item.uuid)">Disable</CButton><CButton v-else size="sm" color="success" @click="enableRule(item.uuid)">Activate</CButton>&nbsp;<CButton v-if="!item.active" color='danger' @click="delete_modal = true; target_event_rule_uuid = item.uuid" size="sm">Delete</CButton></td>
            </template>
            <template #global_rule="{item}">
              <td>
                <CSwitch color="success" label-on="Yes" label-off="No" disabled :checked.sync="item.global_rule"/>
              </td>
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
  <CModal :show.sync="show_modal" :centered="true" :title="modal_title" size="lg" :closeOnBackdrop="backdrop_close" style="width: 80%">
    <template #header>
        <h5>{{modal_title}}</h5>
        <span class='text-right'>
            <button type="button" aria-label="Close" class="close" @click="dismiss()">×</button>
            <button type="button" class="kb" onclick="window.open('https://docs.reflexsoar.com/en/latest/rql')"><CIcon name='cil-book' size="lg"/></button>
        </span>                   
    </template>
    <CAlert :show.sync="test_complete" :color="test_result_color" closeButton>
      {{test_result}}
    </CAlert>
    <div v-if="modal_mode == 'create'">
      <div>
            <CForm @submit.prevent="createEventRule" id="event_rule_form">
                <!--<CAlert :show="step == 3 && !test_failed" color="danger" closeButton>
                    Your query matches more than <b>1000</b> events, tuning of source system is recommended.
                </CAlert>-->
                <div name="create-event-rule-step-1" v-if="step == 1">
                <h4>Rule Details</h4>
                <p>An Event rule allows you to automatically handle Events over a period of time based on Event criteria.</p>
                <CSelect label="Organization" placeholder="Select an organization" v-if="current_user.role.permissions.view_organizations" :value.sync="organization" :options="organizations" @change="loadCloseReasons()"/>
                <CInput label="Rule Name" placeholder="Enter a friendly name for this rule" v-model="name" required></CInput>
                <CTextarea label="Rule description" v-model="description" required placeholder="Give a brief description of what this rule will do and why."></CTextarea>                    
                <CRow>
                    <CCol v-if="current_user.default_org">
                      <label>Global Rule</label><br>
                      <CSwitch :checked.sync="rule.global_rule" label-on="Yes" label-off="No" color="success"/>
                    </CCol>
                    <CCol>
                        <label>Run rule retroactively after creation?</label><br>
                        <CSwitch :checked.sync="run_retroactively" label-on="Yes" label-off="no" color="success"/>
                    </CCol>
                </CRow>
                </div>
                <div name="create-case-template-step-2" v-if="step == 2">
                    <h4>Expiration</h4>
                    <p>Setting an expiration on the rule is recommended to allow analysts to revisit Events at a future state. There may be use cases for non-expiration rules but we can't think of any...</p>
                    <label>Expire</label>
                    <CRow>
                        <CCol col="12">
                            <CSwitch color="success" label-on="Yes" label-off="No"  label="Dismiss Event" :checked.sync="expire"></CSwitch>
                        </CCol>
                    </CRow><br>
                    <CInput label="Expiration period (days)" v-bind:disabled="!expire" placeholder="Enter a period in number of days" v-model="expire_days"></CInput>
                </div>
                <div name="create-case-template-step-3" v-if="step == 3">
                    <h4>Event Query</h4>
                    <p>Supply an RQL query to match events to this rule based on a certain criteria.  Click <a href="https://docs.reflexsoar.com/en/latest/rql/" target="_new">here</a> for a syntax reference.</p>
                    <prism-editor @keydown="test_failed=true" class="my-editor" v-model="query" :highlight="highlighter" line-numbers></prism-editor><br>
                    <!--<CTextarea v-model="query" rows="5" style="font-family: Consolas"></CTextarea>-->
                    <CRow>
                        <!--<CCol>
                            <CButton color="primary" size="sm" @click="testRule()" v-bind:disabled="test_running"><CSpinner v-if="test_running" size="sm"/>&nbsp;Test Query</CButton><i><span v-if="test_running">&nbsp;Running test...</span></i>
                        </CCol>-->
                        <CCol lg="4">
        
                          <CInput description="Reflex will fetch the last N events and compare this rule to them" label="Number of test events" v-model="event_count"><template #append><CButton color="primary" v-bind:disabled="test_running" @click="testRule()"><span v-if="!test_running">Test Rule</span><span v-else><CSpinner size="sm"/>&nbsp;Testing...</span></CButton></template></CInput>
                        </CCol>
                        <CCol lg="8">
                        <v-date-picker
                          v-model="range"
                          mode="dateTime"
                          :masks="masks"
                          is-range
                        >
                          <template v-slot="{ inputValue, inputEvents }">
                            <CRow>
                              <CCol>
                                <CInput description="Start of search period" label="Start Time" :value="inputValue.start" v-on="inputEvents.start">
                                  <template #prepend>
                                    <CButton disabled color="secondary" size="sm"><CIcon name='cil-calendar'/></CButton>
                                  </template>
                                </CInput>
                              </CCol>
                              <CCol>
                                <CInput label="End Time" :value="inputValue.end" v-on="inputEvents.end">
                                <template #prepend>
                                    <CButton disabled color="secondary" size="sm"><CIcon name='cil-calendar'/></CButton>
                                  </template>
                                </CInput>
                              </CCol>
                            </CRow>
                          </template>
                        </v-date-picker>
                        </CCol>
                        <CCol lg="12">
                          <label>Include Results</label><br>
                          <CSwitch color="success" label-on="Yes" label-off="No" v-bind:checked.sync="return_events"></CSwitch>&nbsp;<CButton style="margin-top: -20px" size="sm" color="success" v-if="return_events && test_complete && !test_failed" @click="show_test_results = !show_test_results">View Results</CButton>
                        </CCol>
                    </CRow>
                </div>
                <div name="create-case-template-step-4" v-if="step == 4">
                    <h4>Actions</h4>
                                    
                    <label>Merge into Case</label>
                    <CRow>                    
                        <CCol col="1">
                            <CSwitch v-bind:disabled="dismiss_event" label="Merge into Case" color="success" label-on="Yes" label-off="No" :checked.sync="merge_into_case" style="padding-top:5px"></CSwitch>
                        </CCol>
                        <CCol col="11">
                            <multiselect style="z-index:50"
                                v-bind:disabled="!merge_into_case || dismiss_event"
                                :options="cases" 
                                v-model="target_case" 
                                track-by="uuid" 
                                label="title"
                                :searchable="true"
                                :internal-search="false"
                                :options-limit="10"
                                :show-no-results="false"
                                @search-change="caseFind"
                                :custom-label="caseLabel"
                                placeholder="Select a case"
                            >
                            <template slot="option" slot-scope="props">
                                {{props.option.title}} ({{props.option.uuid}}<br><small>{{props.option.event_count ? props.option.event_count : 0 }} events.</small>
                            </template>
                            </multiselect><br>
                        </CCol>
                    </CRow>
                    <label>Dismiss Event</label>
                    <CRow>                    
                        <CCol col="1">
                            <CSwitch v-bind:disabled="merge_into_case" color="success" label-on="Yes" label-off="No"  label="Dismiss Event" :checked.sync="dismiss_event"  style="padding-top:5px"></CSwitch>
                        </CCol>
                        <CCol col="11">
                            <CSelect v-bind:disabled="!dismiss_event || merge_into_case" :options="close_reasons" v-model="close_reason" placeholder="Select a reason for dismissing the event..."/>
                            <CTextarea label="Dismiss Comment" rows="5" placeholder="Enter a comment as to why this Event is being dismissed." v-model="dismiss_comment" v-bind:disabled="!dismiss_event || merge_into_case"></CTextarea>
                        </CCol>
                    </CRow>
                    <label>Add Tags</label>
                            <CRow>
                                <CCol col="1">
                                    <CSwitch v-bind:disabled="dismiss_event" color="success" label-on="Yes" label-off="No"  label="Tag Event" :checked.sync="tag_event"  style="padding-top:5px"></CSwitch>
                                </CCol>
                                <CCol>
                                    <multiselect
                                        v-bind:disabled="dismiss_event || !tag_event"
                                        v-model="selected_tags" 
                                        placeholder="Select tags to apply to this input"
                                        :taggable="true"
                                        tag-placeholder="Add new tag"
                                        track-by="name"
                                        label="name"
                                        :options="tag_list"
                                        :multiple="true"
                                        @tag="addTag"
                                        :close-on-select="false"
                                    >
                                    </multiselect>
                                </CCol>
                            </CRow>
                            <br>
                            <label>Update Severity</label>
                            <CRow>
                                <CCol col="1">
                                    <CSwitch v-bind:disabled="dismiss_event" color="success" label-on="Yes" label-off="No" label="Update Severity" :checked.sync="update_severity"  style="padding-top:5px"></CSwitch>
                                </CCol>
                                <CCol>
                                    <CSelect v-bind:disabled="dismiss_event || !update_severity" :options="severities" :value.sync="target_severity" placeholder="Select a new severity for matching events..."/>
                                </CCol>
                            </CRow>

                </div>
                <div name="create-case-template-step-5" v-if="step == 5">
                    <h4>Review</h4>
                    <b>Rule Name: </b> {{name}}<br>
                    <b>Description: </b><br>{{description}}<br><br>
                    <span v-if="expire"><b>Expire in: </b> {{expire_days}} day(s)<br></span>
                    <b>Actions: </b><br><br>
                        <ul>
                            <li v-if="merge_into_case">Merge in to case <b>#{{target_case.id}} - {{target_case.title}}</b></li>
                            <li v-if="dismiss_event">Immediately dismiss event</li>
                        </ul>
                </div>
            </CForm>
        </div>
    </div>
    <CRow v-else-if="modal_mode === 'view'">
      <CCol>
        <b>Description</b>
        <p>{{rule.description ? rule.description : "None"}}</p>
      </CCol>
    </CRow>
    <CRow v-if="modal_mode == 'edit'">
      <CCol>
        <CSelect label="Organization" placeholder="Select an organization" v-if="current_user.default_org" :value.sync="rule.organization" :options="organizations" @change="loadCloseReasons()"/>
        <CInput label='Rule Name' v-model="rule.name"/>
        <CTextarea v-model="rule.description" placeholder="Give a brief description of what this rule will do and why." label="Description"/>
        <CRow>
            <CCol v-if="current_user.default_org">
              <label>Global Rule</label><br>
              <CSwitch :checked.sync="rule.global_rule" label-on="Yes" label-off="No" color="success"/>
            </CCol>
        </CRow>
      </CCol>
    </CRow>
    <div  v-if="modal_mode === 'view' || modal_mode === 'edit'">
      <b>RQL Query</b>
      <prism-editor :readonly="modal_mode === 'view'" class="my-editor" v-model="rule.query" :highlight="highlighter" line-numbers></prism-editor><br>
    </div>
    <CRow v-if="modal_mode == 'edit'">
      <CCol>
        <h5 style="cursor: pointer" @click="show_actions = !show_actions"><CIcon style="margin-top: -5px" v-if="show_actions" name="cil-chevron-bottom"/><CIcon style="margin-top: -5px" v-else name="cil-chevron-top"/>&nbsp; Actions</h5>
      </CCol>
    </CRow>
    <CCollapse :show.sync="show_actions">
      <CRow v-if="modal_mode == 'edit'">
          <CCol lg="6">
            <label>Merge into Case</label><br>
            <CSwitch label-on="Yes" v-bind:disabled="rule.dismiss" label-off="No" color="success" v-bind:checked.sync="rule.merge_into_case"></CSwitch>
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
            <label>Update Severity</label><br>
            <CSwitch label-on="Yes" label-off="No" color="success" v-bind:checked.sync="rule.update_severity"></CSwitch>
            <CSelect 
              label="Severity"
              v-if="rule.update_severity"
              :options="severities"
              :value.sync="rule.target_severity"
              placeholder="Select a Severity"
              v-bind:disabled="current_user.role.permissions.view_organizations && organization == null"
            >
            </CSelect>
          </CCol>
          <CCol lg="6">
            <label>Add Tags</label><br>
            <CSwitch label-on="Yes" label-off="No" color="success" v-bind:checked.sync="rule.add_tags"></CSwitch>
            <multiselect
                v-bind:disabled="rule.dismiss || !rule.add_tags"
                v-model="rule.tags_to_add" 
                placeholder="Select tags to apply to this input"
                :taggable="true"
                tag-placeholder="Add new tag"
                track-by="name"
                label="name"
                :options="tag_list"
                :multiple="true"
                @tag="addTag"
                :close-on-select="false"
            >
            </multiselect>
          </CCol>
          <CCol lg="6">
            <label>Dismiss</label><br>
            <CSwitch v-bind:disabled="rule.merge_into_case" label-on="Yes" label-off="No" color="success" v-bind:checked.sync="rule.dismiss"></CSwitch><br><br>
          </CCol>
          <CCol log="6">
            <label>Expire</label><br>
            <CSwitch label-on="Yes" label-off="No" color="success" v-bind:checked.sync="rule.expire"></CSwitch>
            <CInput label="Expiration period (days)" v-if="rule.expire" placeholder="Enter a period in number of days" v-model="rule.expire_days"></CInput>
          </CCol>
      </CRow>
    </CCollapse>

    <CRow v-if="modal_mode == 'edit'">
      <CCol lg="12">
        <br><h5 style="cursor: pointer" @click="show_testing_pane = !show_testing_pane"><CIcon style="margin-top: -5px" v-if="show_testing_pane" name="cil-chevron-bottom"/><CIcon style="margin-top: -5px" v-else name="cil-chevron-top"/>&nbsp; Rule Testing</h5>
      </CCol>
    </CRow>

    <CCollapse :show.sync="show_testing_pane">
      <CRow>
        <CCol lg="4">        
          <CInput description="Reflex will fetch the last N events and compare this rule to them" label="Number of test events" v-model="event_count"><template #append><CButton color="primary" v-bind:disabled="test_running" @click="testRule()"><span v-if="!test_running">Test Rule</span><span v-else><CSpinner size="sm"/>&nbsp;Testing...</span></CButton></template></CInput>
        </CCol>
        <CCol lg="8">
        <v-date-picker
          v-model="range"
          mode="dateTime"
          :masks="masks"
          is-range
        >
          <template v-slot="{ inputValue, inputEvents }">
            <CRow>
              <CCol>
                <CInput description="Start of search period" label="Start Time" :value="inputValue.start" v-on="inputEvents.start">
                  <template #prepend>
                    <CButton disabled color="secondary" size="sm"><CIcon name='cil-calendar'/></CButton>
                  </template>
                </CInput>
              </CCol>
              <CCol>
                <CInput label="End Time" :value="inputValue.end" v-on="inputEvents.end">
                <template #prepend>
                    <CButton disabled color="secondary" size="sm"><CIcon name='cil-calendar'/></CButton>
                  </template>
                </CInput>
              </CCol>
            </CRow>
          </template>
        </v-date-picker>
        </CCol>
        <CCol lg="12">
          <label>Include Results</label><br>
          <CSwitch color="success" label-on="Yes" label-off="No" v-bind:checked.sync="return_events"></CSwitch>&nbsp;<CButton style="margin-top: -20px" size="sm" color="success" v-if="return_events && test_complete && !test_failed" @click="show_test_results = !show_test_results">View Results</CButton>
        </CCol>
      </CRow>
      </CCollapse>
    <template #footer>
        <CButton @click="dismiss()" color="secondary">Dismiss</CButton>
        <CButton v-if="step != 1 && modal_mode === 'create'" @click="previousStep()" color="info">Previous</CButton>
        <CButton v-if="step != final_create_step && modal_mode === 'create'" @click="nextStep()" color="primary">Next</CButton>
        <CButton v-if="step == final_create_step && modal_mode === 'create'" @click="createEventRule()" color="primary">Create</CButton>
        <CButton color="primary" @click="editEventRule(rule.uuid)" v-if="modal_mode == 'edit'">Edit</CButton>
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
  <CModal title="Rule Testing Results" :centered="true" size="xl" :show.sync="show_test_results">
    <div style="overflow-y: scroll; max-height: 400px;">
      <!--<vue-json-pretty :showLength="true" selectableType="multiple" :path="'res'" :data="test_results"></vue-json-pretty>-->
      {{test_results}}
    </div>
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

    max-height: 200px;
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
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';
export default {
    components: {
      PrismEditor,
      VueJsonPretty
    },
    name: 'EventRuleManagement',
    data () {
      return {
        step: 1,
        rules: [],
        rule: {},
        fields: ['name','merge_into_case','dismiss','last_matched_date','admin'],
        modal_mode: 'create',
        show_test_results: false,
        global_rule: false,
        show_modal: false,
        modal_title: "",
        test_results: [],
        test_result: "",
        test_running: false,
        test_complete: false,
        test_failed: true,
        final_create_step: 5,
        test_result_color: "success",
        name: "",
        query: "",
        description: "",
        expire: false,
        expire_days: 1,
        merge_into_case: false,
        dismiss_event: false,
        dismiss_comment: "",
        close_reason: "",
        close_reasons: [],
        target_case: "",
        show_testing_pane: false,
        show_actions: false,
        run_retroactively: true,
        range: {
          start: new Date().setDate(new Date().getDate()-7),
          end: new Date()
        },
        masks: {
          input: 'YYYY-MM-DD h:mm A'
        },
        event_count: 1000, // How many events to test a rule against
        return_events: false,
        backdrop_close: false,
        cases: [],
        page: 1,
        page_size: 10,
        pagination: {},
        current_page: 1,
        delete_modal: false,
        dismiss_submitted: false,
        target_event_rule_uuid: '',
        organization: "",
        organizations: [],
        tag_list: [],
        tag_event: false,
        severities: [
                {
                    label: 'Low',
                    value: 0
                },
                {
                    label: 'Medium',
                    value: 1
                },
                {
                    label: 'High',
                    value: 2
                },
                {
                    label: 'Critical',
                    value: 3
                }
            ],
          target_severity: 0,
          update_severity: false,
          selected_tags: []
      }
      
    },
    watch: {
      current_page: function () {
        this.loadRules()
      },
      show_modal (val) {
        if (val === true) {
          this.loadCloseReasons()
          this.loadTags()
         
          this.findCase('*')
          if (this.modal_mode === 'create') {
            this.modal_title = 'Create Event'
          } else if (this.modal_mode === 'edit') {
            this.modal_title = 'Edit | '+this.rule.name
          } else if (this.modal_mode === 'view') {
            this.modal_title = 'View | '+this.rule.name
          }
        } else {
          this.modal_mode = 'create'
          this.reset()
        }
      },
      merge_into_case (val) {
        if (!val) {
          this.target_case = ""
        }
      },
      dismiss_event (val) {
        if (!val) {
          this.dismiss_comment = ""
          this.close_reason = ""
        }
      }
    },
    methods: {
      mapOrgToName(uuid) {
        let org = this.$store.getters.organizations.filter(o => o.uuid === uuid)
        if (org.length > 0) {
          return org[0].name
        } else {
          return "Unknown"
        }
      },
      findCase(query) {
          let fields = 'uuid,title,id,event_count,owner,severity'
          this.$store.dispatch('getCasesByTitle', {title: query, fields}).then(resp => {
              this.cases = this.$store.getters.cases
          })
      },
      nextStep() {
        this.test_complete = false
        this.test_failed = true
        this.step += 1
      },
      previousStep() {
        this.step -= 1;
      },
      reset () {
        this.name = ""
        this.rule = {}
        this.query = ""
        this.description = ""
        this.expire = true
        this.expire_days = 1
        this.observables = []
        this.merge_into_case = false
        this.dismiss_event = false
        this.target_case = []
        this.step = 1
        this.test_complete = false
        this.test_failed = false
        this.test_running = false
        this.test_result = ""
        this.test_results = []
      },
      dismiss() {
        this.reset()
        this.show_modal = false            
      },
      testRule() {
        let data = {
          'uuid': '',
          
          'query': this.rule.query ? this.rule.query : this.query,
          'event_count': parseInt(this.event_count),
          'return_results': this.return_events,
          'start_date': this.range.start,
          'end_date': this.range.end
        }

        if(!this.global_rule) {
          data['organization'] = this.organization ? this.organization : null;
        }
        this.test_result = ""
        this.test_complete = false
        this.test_running = true
        this.$store.dispatch('testEventRuleQuery', data).then(resp => {
          if (resp.data.success == true)
          {
            this.test_result = resp.data.message
            if(this.return_events) {
              this.test_results = resp.data.hits
            }
            this.test_result_color = "success"
            this.test_failed = false

          } else {
            this.test_result = resp.data.message + ". Try increasing the number of test events or increasing your date range."
            this.test_result_color = "warning"
            this.test_failed = true
          }
          this.test_running = false
          this.test_complete = true
        }).catch(err => {
          this.test_complete = true
          this.test_running = false
          this.test_failed = true
          this.test_result = err.response.data.message
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
      cloneRule(uuid) {
        let source_rule = this.rules.find(r => r.uuid === uuid)
        console.log(source_rule)
        this.name = '[COPY] '+source_rule.name
        this.organization = source_rule.organization
        this.query = source_rule.query
        this.description = source_rule.description
        this.expire = source_rule.expire
        this.expire_days = source_rule.expire_days
        this.observables = source_rule.observables
        this.merge_into_case = source_rule.merge_into_case
        this.dismiss_event = source_rule.dismiss
        this.dismiss_comment = source_rule.dismiss_comment
        this.dismiss_reason = source_rule.dismiss_reason
        this.target_case_uuid = source_rule.target_case_uuid
        this.global_rule = source_rule.global_rule
        this.step = 1
        this.show_modal = true
      },
      editRule(uuid) {
        this.rule = Object.assign({}, this.rules.find(r => r.uuid === uuid))
        this.modal_mode = 'edit'
        this.show_modal = true
        this.test_result = ""
        this.event_count = 1000
        this.test_complete = false
        this.backdrop_close = false
        this.$store.dispatch('getCases', {})
        this.cases = this.$store.getters.cases
      },
      loadTags: function() {
          this.tag_list = Array()
          this.$store.dispatch('getTags').then(resp => {
              for(let i in resp.data) {
                  this.tag_list.push({'name': resp.data[i].name, 'uuid': resp.data[i].uuid})
              }
          })
      },
      loadRules() {
        
        let page = this.current_page
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
      createEventRule() {

        let rule = {
          name: this.name,
          organization: this.event_organization,
          description: this.description,
          merge_into_case: this.merge_into_case,
          target_case_uuid: this.target_case.uuid,
          update_severity: this.update_severity,
          target_severity: this.target_severity,
          add_tags: this.tag_event,
          tags_to_add: this.selected_tags ? this.selected_tags.map(item => { return item.name}) : [],
          expire: this.expire,
          expire_days: parseInt(this.expire_days),
          dismiss_comment: this.dismiss_comment,
          dismiss_reason: this.close_reasoon ? this.close_reasons.filter(c => c.value === this.close_reason)[0].label : null,
          dismiss: this.dismiss_event,
          event_signature: this.event_signature,
          run_retroactively: this.run_retroactively,
          query: this.query
        }

        if(this.current_user.default_org) {
          rule['global_rule'] = this.global_rule
        }

        this.$store.dispatch('createEventRule', rule).then(resp => {
          this.show_modal = false
          this.rules = this.$store.getters.event_rules
        })
      },
      editEventRule(uuid) {
        let rule = {
          name: this.rule.name,
          organization: this.rule.organization ? this.rule.organization : null,
          description: this.rule.description,
          merge_into_case: this.rule.merge_into_case,
          target_case_uuid: this.rule.case_uuid ? this.rule.case_uuid.uuid : '',
          update_severity: this.rule.update_severity,
          target_severity: this.rule.target_severity,
          add_tags: this.rule.tag_event,
          tags_to_add: this.selected_tags ? this.selected_tags.map(item => { return item.name}) : [],
          expire: this.rule.expire,
          expire_days: parseInt(this.rule.expire_days),
          dismiss_comment: this.rule.dismiss_comment,
          dismiss_reason: this.close_reasons.filter(c => c.value === this.rule.close_reason)[0],
          dismiss: this.rule.dismiss,
          query: this.rule.query
        }

        if(this.current_user.default_org) {
          rule['global_rule'] = this.rule.global_rule
        }        

        this.$store.dispatch('editEventRule', {uuid, rule}).then(resp => {
          this.show_modal = false
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
      addTag(newTag) {
            const t = {
                name: newTag,
                uuid: ''
            }
            this.tag_list.push(t)
            this.selected_tags.push(t)
        },
      caseLabel({uuid, title}) {
        if(uuid && title) {
           return `${title} (${uuid})`
        }
      },
      caseFind(query) {
        let fields = 'uuid,title,id,event_count,owner,severity'
        this.$store.dispatch('getCasesByTitle', {title: query, fields}).then(resp => {
          this.cases = this.$store.getters.cases
        })
      },
      loadCloseReasons() {
        let organization = this.organization
        if(this.current_user.default_org) {
          this.$store.dispatch('getOrganizations').then(resp => {
            this.organizations = this.$store.getters.organizations.map((o) => { return {label: o.name, value: o.uuid}})
          })
        }
        
        this.$store.dispatch('getCloseReasons', {organization: organization}).then(resp => {
          this.close_reasons = this.$store.getters.close_reasons.map((reason) => { return {label: reason.title, value: reason.uuid}})
        })
      }
    },
    computed: mapState(['alert','current_user','loading']),
    created() {
      this.loadRules()
      if(this.current_user.default_org) {
        if (!this.fields.includes('organization')) {
          this.fields.splice(1,0,'organization')
        }
        if (!this.fields.includes('global_rule')) {
          this.fields.splice(2,0,'global_rule')
        }
        
      }
      
    }
}
</script>
