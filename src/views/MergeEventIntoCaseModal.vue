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
                    #{{props.option.id}} - {{props.option.title}}<br>
                    <small><b>Severity: </b>{{getSeverity(props.option.severity)}} | <b>Owner:</b> {{props.option.owner.username || "Unassigned" }} | Contains {{props.option.event_count}} events.</small><br>
                    <small>{{props.option.description | truncate}}</small>
                </template>
            </multiselect>
      </div>
      <template #footer>
          <CButton @click="dismiss()" color="secondary">Dismiss</CButton>
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
            modalStatus: false
        }
    },
    watch: {
        show: function() {
            this.modalStatus = this.show
        },
        modalStatus: function(){
            this.$emit('update:show', this.modalStatus)
            if(!this.modalStatus) {
                this.reset()
            }
        }
    },
    created() {
        this.$store.dispatch('getSettings')
        this.loadData()
    },
    methods: {
        loadData() {
            this.$store.dispatch('getCases', 'uuid,title,id,event_count,owner,severity')
        },
        caseLabel({id, title}) {
            if(id && title) {
                return `#${id} - ${title}`
            }
        },
        getSeverity(severity) {
            switch(severity) {
                case 0: return "Low";
                case 1: return "Medium";
                case 2: return "High";
                case 3: return "Critical";
                default: return "Low"
            }
        },
        caseFind(query) {
            let fields = 'uuid,title,id,event_count,owner,severity'
            this.$store.dispatch('getCasesByTitle', {title: query, fields}).then(resp => {
                this.$store.commit('save_cases', resp.data)
            })
        },
        mergeEventIntoCase() {
            let uuid = this.case_data.uuid;
            let events = {'events': this.events};
            this.$store.dispatch('addEventsToCase', {uuid, events}).then(resp => {
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