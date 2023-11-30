<template>
<div><link rel="stylesheet" href="https://unpkg.com/vue-multiselect@2.1.0/dist/vue-multiselect.min.css">

    <CModal title="Merge Event Into Case" :centered="true" size="lg" :show.sync="modalStatus">
      <div>
        <CAlert color="danger" v-if="error">{{error_message}}</CAlert>
          <p>Merging <b>{{events.length}}</b> event<span v-if="events.length > 1">s</span>.</p>
            <SelectInput
                :options="cases"
                :value.sync="case_data.uuid"
                option_label="title"
                option_key="uuid"
                @search-change="caseFind"
                :loading="loading"
            >
                <template #option="{ option }">
                    
                        <CCol>
                        
                        <b>{{option.title}}</b><br>
                        <small><b>Severity: </b>{{getSeverity(option.severity)}} | <b>Owner:</b> {{option.owner ? option.owner.username : "Unassigned" }} | Contains {{option.event_count ? option.event_count : 0}} events.</small><br>
                        <small>{{option.description | truncate}}</small>
                        
                        </CCol>
                    <CCol class="text-right">
                        <OrganizationBadge :uuid="option.organization"></OrganizationBadge>
                    </CCol>
                </template>
            </SelectInput>
            <label>Include Related Events</label><br>
            <CSwitch color="success" label-on="Yes" label-off="No" v-bind:checked.sync="include_related_events"></CSwitch><br>
            <small class='text-muted'>Selecting this option will also merge any other event with the same signature that is in a <b>New</b> status</small>
      </div>
      <template #footer>
          <CButton @click="dismiss()" color="secondary">Cancel</CButton>
        <CButton @click="mergeEventIntoCase()" v-bind:disabled="!case_data" color="primary"><span v-if="!submitted || complete">Merge</span><span v-if="submitted && !complete"><CSpinner color="success" size="sm"/></span></CButton>
      </template>
    </CModal>
</div>
</template>

<script>
import {vSelect} from "vue-select";
import { mapState } from 'vuex';

import SelectInput from './components/SelectInput.vue'
import OrganizationBadge from './OrganizationBadge.vue'

export default {
    name: 'MergeEventIntoCaseModal',
    props: {
        show: Boolean,
        events: Array
    },
    components: {
        SelectInput,
        OrganizationBadge,
    },
    computed: mapState(['settings','cases']),
    data(){
        return {
            case_data: {},
            modalStatus: false,
            include_related_events: true,
            submitted: false,
            complete: true,
            error: false,
            error_message: "",
            loading: false
        }
    },
    watch: {
        show: function() {
            this.modalStatus = this.show
        },
        modalStatus: function(){
            if(this.modalStatus) {
                this.loadData()
            }
            this.$emit('update:show', this.modalStatus)
            if(!this.modalStatus) {
                this.reset()
            }
        }
    },
    methods: {
        loadData() {
            this.loading = true
            this.$store.dispatch('getCases', {}).then(resp => {
                this.loading = false
            }).catch(err => {
                this.loading = false
            })
        },
        caseLabel({uuid, title}) {
            if(uuid && title) {
                return `${title} (${uuid})`
            }
        },
        getSeverity(severity) {
            switch(severity) {
                case 0: return "Informational";
                case 1: return "Low";
                case 2: return "Medium";
                case 3: return "High";
                case 4: return "Critical";
                default: return "Low"
            }
        },
        caseFind(query) {
            let fields = 'uuid,title,id,event_count,owner,severity'
            this.loading = true
            this.$store.dispatch('getCasesByTitle', {title: query, fields}).then(resp => {
                this.loading = false
            }).catch(err => {
                this.loading = false
            })
        },
        mergeEventIntoCase() {
            let uuid = this.case_data.uuid;
            let events = this.events;
            let include_related_events = this.include_related_events
            this.complete = false
            this.submitted = true
            this.error = false
            this.error_message = ""
            this.$store.dispatch('addEventsToCase', {uuid, include_related_events, events}).then(resp => {
                this.complete = true
                this.submitted = false
                this.modalStatus = false
                this.$store.commit('show_alert', {'message':'Successfully merged events into Case.', 'type':'success'})
                this.$router.push({path: '/cases/'+uuid})
            }).catch(err => {
                this.submitted = false
                this.complete = true
                this.error = true
                this.error_message = err.response.data.message
                //this.$store.commit('show_alert', {'message':'Error merging events into Case. '+err.response.data.message, 'type':'danger'})
            })
        },
        reset () {
            this.case_data = {}
        },
        dismiss() {
            this.reset()
            this.modalStatus = false            
        }
    },
    filters: {
      truncate: function (value) {
            let maxLength = 100
            if (!value) return ''
            value = value.toString()
            if (value.length > maxLength) {
                return value.substring(0,maxLength) + "..."
            } else {
                return value.substring(0,maxLength)
            }
            
        }
    }
}
</script>