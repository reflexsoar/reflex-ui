<template>
<div><link rel="stylesheet" href="https://unpkg.com/vue-multiselect@2.1.0/dist/vue-multiselect.min.css">

    <CModal title="Merge Event Into Case" :centered="true" size="lg" :show.sync="modalStatus">
      <div>
          <p>Merging <b>{{events.length}}</b> event<span v-if="events.length > 1">s</span>.</p>
           <multiselect 
                v-model="case_data"
                label="title" 
                :options="cases" 
                track-by="uuid" 
                :searchable="true"
                :internal-search="false"
                :options-limit="10"
                :show-no-results="false" 
                :custom-label="caseLabel"
                @search-change="caseFind"
                placeholder="Select a case">
                <template slot="option" slot-scope="props">
                    {{props.option.title}}<br>
                    <small><b>Severity: </b>{{getSeverity(props.option.severity)}} | <b>Owner:</b> {{props.option.owner ? props.option.owner.username : "Unassigned" }} | Contains {{props.option.event_count ? props.option.event_count : 0}} events.</small><br>
                    <small>{{props.option.description | truncate}}</small>
                </template>
            </multiselect><br>
            <label>Include Related Events</label><br>
            <CSwitch color="success" label-on="Yes" label-off="No" v-bind:checked.sync="include_related_events"></CSwitch><br>
            <small class='text-muted'>Selecting this option will also merge any other event with the same signature that is in a <b>New</b> status</small>
      </div>
      <template #footer>
          <CButton @click="dismiss()" color="secondary">Cancel</CButton>
        <CButton @click="mergeEventIntoCase()" v-bind:disabled="!case_data" color="primary">Merge</CButton>
      </template>
    </CModal>
</div>
</template>

<script>
import {vSelect} from "vue-select";
import { mapState } from 'vuex';
export default {
    name: 'MergeEventIntoCaseModal',
    props: {
        show: Boolean,
        events: Array,
    },
    computed: mapState(['settings','cases']),
    data(){
        return {
            case_data: {},
            modalStatus: false,
            include_related_events: true
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
            this.$store.dispatch('getCases', 'uuid,title,id,event_count,owner,severity')
        },
        caseLabel({uuid, title}) {
            if(uuid && title) {
                return `${title} (${uuid})`
            }
        },
        getSeverity(severity) {
            switch(severity) {
                case 1: return "Low";
                case 2: return "Medium";
                case 3: return "High";
                case 4: return "Critical";
                default: return "Low"
            }
        },
        caseFind(query) {
            let fields = 'uuid,title,id,event_count,owner,severity'
            this.$store.dispatch('getCasesByTitle', {title: query, fields})
        },
        mergeEventIntoCase() {
            let uuid = this.case_data.uuid;
            let events = this.events;
            let include_related_events = this.include_related_events
            this.$store.dispatch('addEventsToCase', {uuid, include_related_events, events}).then(resp => {
                this.modalStatus = false
                this.$store.commit('show_alert', {'message':'Successfully merged events into Case.', 'type':'success'})
                this.$router.push({path: '/cases/'+uuid})
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