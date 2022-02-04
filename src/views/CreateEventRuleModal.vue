<template>
<div><link rel="stylesheet" href="https://unpkg.com/vue-multiselect@2.1.0/dist/vue-multiselect.min.css">
    <CModal title="Create Event Rule" :centered="true" size="lg" :show.sync="modalStatus" :closeOnBackdrop="false">
        <template #header>
            <h5>Create Event Rule</h5>
            <span class='text-right'>
                <button type="button" aria-label="Close" class="close" @click="dismiss()">×</button>
                <button type="button" class="kb" onclick="window.open('https://docs.reflexsoar.com/en/latest/rql')"><CIcon name='cil-book' size="lg"/></button>
            </span>            
        </template>
        <div>
            <CRow>
                <CCol>
                    <CAlert :show.sync="error" color="danger" closeButton>
                        {{error_message}}
                    </CAlert>
                    <CForm @submit.prevent="createEventRule" id="event_rule_form">
                        <!--<CAlert :show="step == 3 && !test_failed" color="danger" closeButton>
                            Your query matches more than <b>1000</b> events, tuning of source system is recommended.
                        </CAlert>-->
                        <div name="create-event-rule-step-1" v-if="step == 1">
                        <h4>Rule Details</h4>
                        <p>An Event rule allows you to automatically handle Events over a period of time based on Event criteria.</p>
                        <p>This rule will apply to <b>{{events.length}}</b> Events and any future events matching the title of this event and observables selected in this wizard.</p>

                        <p>
                            <b>Base Event Signature: </b>{{event_signature}}
                        </p>
                        <CInput label="Rule Name"  placeholder="Enter a friendly name for this rule" :value.sync="name" required></CInput>
                        <CTextarea label="Rule description" v-model="description" required placeholder="Give a brief description of what this rule will do and why."></CTextarea>                    
                        <!--<span v-if="current_user.default_org">
                            <label>Global Rule</label><br>
                            <CSwitch :checked.sync="global_rule" label-on="Yes" label-off="No" color="success"/>
                        </span>-->
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
                                <CCol>
                                    <CButton color="primary" size="sm" @click="test_query()" v-bind:disabled="test_running"><CSpinner v-if="test_running" size="sm"/>&nbsp;Test Query</CButton><i><span v-if="test_running">&nbsp;Running test...</span><span v-if="test_result">&nbsp;{{test_result}}</span></i>
                                </CCol>
                                <CCol class="text-right">
                                    <CButton color="secondary" size="sm" @click="showDrawer()">View Base Event</CButton>
                                </CCol>
                            </CRow>
                        </div>
                        <div name="create-case-template-step-4" v-if="step == 4">
                            <h4>Actions</h4>
                                            
                            <label>Merge into Case</label>
                            <CRow>                    
                                <CCol col="1">
                                    <CSwitch v-bind:disabled="dismiss_event  || tag_event || update_severity" label="Merge into Case" color="success" label-on="Yes" label-off="No" :checked.sync="merge_into_case" style="padding-top:5px"></CSwitch>
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
                                    <CSwitch v-bind:disabled="merge_into_case || tag_event || update_severity" color="success" label-on="Yes" label-off="No"  label="Dismiss Event" :checked.sync="dismiss_event"  style="padding-top:5px"></CSwitch>
                                </CCol>
                                <CCol col="11">
                                    <CSelect v-bind:disabled="!dismiss_event || merge_into_case" :options="close_reasons" v-model="close_reason" placeholder="Select a reason for dismissing the event..."/>
                                    <CTextarea label="Dismiss Comment" rows="5" placeholder="Enter a comment as to why this Event is being dismissed." v-model="dismiss_comment" v-bind:disabled="!dismiss_event || merge_into_case"></CTextarea>
                                </CCol>
                            </CRow>
                            <br>
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
                                    <CSwitch v-bind:disabled="dismiss_event" color="success" label-on="Yes" label-off="No"  label="Update Severity" :checked.sync="update_severity"  style="padding-top:5px"></CSwitch>
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
                </CCol>
            </CRow>
        </div>
      <template #footer>
          
          <CButton @click="dismiss()" color="secondary">Dismiss</CButton>
          <CButton v-if="step != 0" @click="previousStep()" color="info">Previous</CButton>
          <CButton v-if="step != final_step" @click="nextStep()" :disabled="(test_failed && step == 3)" color="primary" >Next</CButton>
          <CButton v-if="step == final_step" @click="createEventRule()" color="primary" :disabled="submitted"><span v-if="submitted"><CSpinner size="sm"/>&nbsp;</span>Create</CButton>
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
  }

  /* optional class for removing the outline */
  .prism-editor__textarea:focus {
    outline: none;
  }
</style>
<script>
import {vSelect} from "vue-select";
import { PrismEditor } from 'vue-prism-editor'
import { highlight, languages } from 'prismjs/components/prism-core';
import 'vue-prism-editor/dist/prismeditor.min.css'; // import the styles somewhere
import 'prismjs/components/prism-python';
import '../assets/js/prism-rql';
import '../assets/css/prism-reflex.css'; // import syntax highlighting styles

import { mapState} from 'vuex';

export default {
    components: {
        PrismEditor,
    },
    name: 'CreateEventRuleModal',
    props: {
        show: Boolean,
        events: Array,
        event_signature: String,
        event_organization: String,
        source_event_uuid: String,
        rule_observables: Array
    },
    computed: mapState(['settings','current_user']),
    data(){
        return {
            name: "",
            cases: [],
            description: "",
            modalStatus: this.show,
            merge_into_case: false,
            tag_event: false,
            global_rule: false,
            update_severity: false,
            target_severity: 0,
            selected_tags: [],
            dismiss_event: false,
            expire_days: 1,
            observables: [],
            expire: false,
            step: 1,
            final_step: 5,
            test_running: false,
            test_result: "",
            test_failed: true,
            target_case: {},
            query: "",
            close_reason: "",
            close_reasons: [],
            dismiss_comment: "",
            tag_list: [],
            add_action: false,
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
            actions: [
                {
                    label:'Merge into Case',
                    value: 'merge'
                },
                {
                    label: 'Dismiss Event',
                    value: 'dismiss'
                },
                {
                    label: 'Mute Event',
                    value: 'mute_event'
                },
                {
                    label: 'Update Event description',
                    value: 'update_description'
                },
                {
                    label: 'Add Event Tags',
                    value: 'tag'
                }
            ],
            current_action: "",
            selected_actions: [],
            error: false,
            error_message: "",
            submitted: false
        }
    },
    watch: {
        show: function() {
            this.error = false
            this.error_message = ""
            this.modalStatus = this.show
        },
        modalStatus: function(){
            if(this.modalStatus) {
                this.test_failed = true
                this.loadData()
                this.query = this.generateRule()
                this.name = "Rule for event signature "+this.event_signature
                this.caseFind("*")
                this.loadCloseReasons()
            }
            this.$emit('update:show', this.modalStatus)
            if(!this.modalStatus) {
                this.reset()
            }
        },
        case_template: function() {
            this.applyCaseTemplate()
        },
        use_case_template: function() {
            if(!this.use_case_template) {
                this.case_template = null
            }
            
            this.applyCaseTemplate()
        }
    },
    created() {
        //this.loadData()
        //this.$store.dispatch('getSettings')
    },
    methods: {
        generateRule() {
            /* Generates a basic rule for the selected Event that an analyst
            can use as their base */
            let rule_text = "# System generated base query that includes all observables and the event title\n"
            rule_text += "# Pin this rule to this event by it's title\n"
            rule_text += `title = "${this.event_signature}"\n`
            rule_text += "\n# Default matching on all present observables\n"
            rule_text += '# Consider fine tuning this with the expands function\n'

            let observable_values = this.rule_observables.map(obs => obs.value.replace(/\\/g,'\\\\').replace(/\"/g,'\\"'))
            rule_text += `and observables.value|all In ["${observable_values.join('","')}"]`
            
            return rule_text
        },
        highlighter(code) {
            return highlight(code, languages.rql);
        },
        test_query() {
            let data = {
                'uuid': this.source_event_uuid,
                'query': this.query,
            }
            this.test_result = ""
            this.test_running = true
            this.$store.dispatch('testEventRuleQuery', data).then(resp => {
                if (resp.data.success == true) {
                    this.test_failed = false
                } else {
                    this.test_failed = true
                }
                this.test_result = resp.data.message
                this.test_running = false
            }).catch(err => {
                this.test_running = false
                this.test_failed = true                
                this.test_result = err.response.data.message
            })
        },
        createEventRule() {
            this.submitted = true
            let rule = {
                name: this.name,
                organization: this.event_organization,
                description: this.description,
                merge_into_case: this.merge_into_case,
                target_case_uuid: this.target_case.uuid,
                update_severity: this.update_severity,
                target_severity: this.target_severity,
                add_tags: this.tag_event,
                tags_to_add: Array(),
                expire: this.expire,
                expire_days: parseInt(this.expire_days),
                dismiss_comment: this.dismiss_comment,
                dismiss_reason: this.close_reasoon ? this.close_reasons.filter(c => c.value === this.close_reason)[0].label : null,
                dismiss: this.dismiss_event,
                event_signature: this.event_signature,
                query: this.query
            }

            if(this.current_user.default_org) {
                rule['global_rule'] = this.global_rule
            }

            for(let tag in this.selected_tags) {
                rule.tags_to_add.push(this.selected_tags[tag].name)
            }

            this.$store.dispatch('createEventRule', rule).then(resp => {
                this.modalStatus = false
                this.error = false
                this.error_message = ""
                this.submitted = false
            }).catch(err => {
                this.submitted = false
                this.error = true
                this.step = 1
                this.error_message = err.response.data.message
            })
        },
        nextStep() {
            this.step += 1
        },
        previousStep() {
            this.step -= 1;
        },
        loadData() {
            this.$store.dispatch('getCases', {}).then(resp => {
                this.cases = this.$store.getters.cases
            })
        },
        caseFind(query) {
            let fields = 'uuid,title,id,event_count,owner,severity'
            let organization = this.event_organization
            this.$store.dispatch('getCasesByTitle', {title: query, organization: organization, fields}).then(resp => {
                this.cases = this.$store.getters.cases
            })
        },
        toggleMergeToCase() {
            this.merge_into_case = !this.merge_into_case
        },
        caseLabel({uuid, title}) {
            if(uuid && title) {
                return `${title} (${uuid})`
            }
        },
        reset () {
            this.name = ""
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
            this.test_result = ""
        },
        dismiss() {
            this.reset()
            this.modalStatus = false            
        },
        addTag(newTag) {
            console.log(newTag)
            const t = {
                name: newTag,
                uuid: ''
            }
            this.tag_list.push(t)
            this.selected_tags.push(t)
        },
        loadCloseReasons() {
            let organization = this.event_organization
            this.$store.dispatch('getCloseReasons', {organization}).then(resp => {
            this.close_reasons = this.$store.getters.close_reasons.map((reason) => { return {label: reason.title, value: reason.uuid}})
            })
        },
        loadTags: function() {
            this.tag_list = Array()
            this.$store.dispatch('getTags').then(resp => {
                for(let i in resp.data) {
                    this.tag_list.push({'name': resp.data[i].name, 'uuid': resp.data[i].uuid})
                }
            })
        },
        showDrawer() {
            let uuid = this.source_event_uuid
            if(this.$store.getters.eventDrawerMinimize) {
            this.$store.dispatch('getEvent', uuid).then(resp => {
                this.$store.commit('set', ['eventDrawerMinimize', !this.$store.getters.eventDrawerMinimize])
                this.event_data = resp.data
            })
            } else {
            this.$store.commit('set', ['eventDrawerMinimize', !this.$store.getters.eventDrawerMinimize])
            }   
        }
    }
}
</script>