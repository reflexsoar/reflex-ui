<template>
<div><link rel="stylesheet" href="https://unpkg.com/vue-multiselect@2.1.0/dist/vue-multiselect.min.css">
    <CModal title="Create Event Rule" :centered="true" size="lg" :show.sync="modalStatus" :closeOnBackdrop="false">

        <div>
            <CForm @submit.prevent="createEventRule" id="event_rule_form">
                <div name="create-event-rule-step-1" v-if="step == 1">
                <h4>Rule Details</h4>
                <p>An Event rule allows you to automatically handle Events over a period of time based on Event criteria.</p>
                <p>This rule will apply <b>immediately</b> to <b>{{events.length}}</b> Events and any future events matching the title of this event and observables selected in this wizard.</p>

                <p>
                    <b>Base Event Signature: </b>{{event_signature}}
                </p>
                <CInput label="Rule Name" v-model="name" required></CInput>
                <CTextarea label="Rule description" v-model="description" required placeholder="Give a brief description of what this rule will do and why."></CTextarea>                    
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
                    <h4>Observable Matching</h4>
                    <p>The observables selected here must match for the Rule to apply.  A signature of the observables is calculated to make sure only specific combinations are acted on.</p>
                    <multiselect style="z-index:50" :options="rule_observables" v-model="observables" :custom-label='observableLabel' multiple track-by="value" label="value">
                        <template slot="option" slot-scope="props">
                            <b>{{props.option.dataType}}</b>: {{props.option.value}}
                        </template>
                    </multiselect>
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
                                #{{props.option.id}} - {{props.option.title}}<br><small>{{props.option.event_count}} events.</small>
                            </template>
                            </multiselect>
                        </CCol>
                    </CRow>
                    <label>Dismiss Event</label>
                    <CRow>                    
                        <CCol col="1">
                            <CSwitch v-bind:disabled="merge_into_case" color="success" label-on="Yes" label-off="No"  label="Dismiss Event" :checked.sync="dismiss_event"  style="padding-top:5px"></CSwitch>
                        </CCol>
                        <CCol col="11">
                            
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
                    <b>Observables: </b><br><br>
                    <ul>
                        <li v-for="obs in observables" :key="obs.value"><b>{{obs.dataType}}</b>: {{obs.value}}</li>
                    </ul>
                </div>
            </CForm>
        </div>
      <template #footer>
          <CButton @click="dismiss()" color="secondary">Dismiss</CButton>
          <CButton v-if="step != 1" @click="previousStep()" color="info">Previous</CButton>
          <CButton v-if="step != final_step" @click="nextStep()" color="primary">Next</CButton>
          <CButton v-if="step == final_step" @click="createEventRule()" color="primary">Create</CButton>
      </template>
    </CModal>
</div>
</template>


<script>
import {vSelect} from "vue-select";
import { mapState} from 'vuex';
export default {
    name: 'CreateEventRuleModal',
    props: {
        show: Boolean,
        events: Array,
        event_signature: String,
        rule_observables: Array
    },
    computed: mapState(['settings']),
    data(){
        return {
            name: "",
            cases: [],
            description: "",
            modalStatus: this.show,
            merge_into_case: false,
            dismiss_event: false,
            expire_days: 1,
            observables: [],
            expire: true,
            step: 1,
            final_step: 5,
            target_case: []
        }
    },
    watch: {
        
        show: function() {
            this.modalStatus = this.show
            
        },
        modalStatus: function(){
            if(this.modalStatus) {
                this.loadData()
                this.name = "Rule for event signature "+this.event_signature
                this.observables = this.rule_observables
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
        createEventRule() {
            let rule = {
                name: this.name,
                description: this.description,
                merge_into_case: this.merge_into_case,
                target_case_uuid: this.target_case.uuid,
                expire: this.expire,
                expire_days: parseInt(this.expire_days),
                dismiss: this.dismiss_event,
                event_signature: this.event_signature,
                observables: this.observables
            }
            this.$store.dispatch('createEventRule', rule).then(resp => {
                this.modalStatus = false
            })
        },
        nextStep() {
            this.step += 1
        },
        previousStep() {
            this.step -= 1;
        },
        loadData() {
            this.$store.dispatch('getCases', 'uuid,title,id,event_count,owner,severity').then(resp => {
                this.cases = this.$store.getters.cases
            })
        },
        caseFind(query) {
            let fields = 'uuid,title,id,event_count,owner,severity'
            this.$store.dispatch('getCasesByTitle', {title: query, fields}).then(resp => {
                this.cases = this.$store.getters.cases
            })
        },
        toggleMergeToCase() {
            this.merge_into_case = !this.merge_into_case
        },
        observableLabel({dataType, value}) {
            return `${dataType}: ${value}`
        },
        caseLabel({id, title}) {
            if(id && title) {
                return `#${id} - ${title}`
            }
        },
        reset () {
            this.description = ""
            this.expire = true
            this.expire_days = 1
            this.observables = []
            this.merge_into_case = false
            this.dismiss_event = false
            this.target_case = []
            this.step = 1
        },
        dismiss() {
            this.reset()
            this.modalStatus = false            
        },
        addTag(newTag) {
            const t = {
                name: newTag,
                uuid: ''
            }
            this.tag_list.push(t)
            this.selected_tags.push(t)
        }
    }
}
</script>