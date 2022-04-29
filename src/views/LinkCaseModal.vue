<template>
<div><link rel="stylesheet" href="https://unpkg.com/vue-multiselect@2.1.0/dist/vue-multiselect.min.css">
    <CModal title="Link Cases" :centered="true" size="lg" :show.sync="modalStatus">
      <CAlert :show.sync="error" color="danger" closeButton>
        {{error_message}}
      </CAlert>
        <CForm id="linkCaseForm" @submit.prevent="linkCase" >
            <label>Select a case to link</label>
            <multiselect 
                v-model="selected"
                label="title" 
                :options="cases" 
                track-by="uuid" 
                :searchable="true"
                :internal-search="false"
                :options-limit="10"
                :show-no-results="false" 
                :required="true"
                :multiple="true"
                @search-change="caseFind">
                <template slot="option" slot-scope="props">
                    {{props.option.title}}<br>
                    <small><b>Severity: </b>{{getSeverity(props.option.severity)}} | <b>Owner:</b> {{props.option.owner ? props.option.owner.username : "Unassigned" }} | Contains {{props.option.event_count ? props.option.event_count : 0}} events.</small><br>
                    <small>{{props.option.description | truncate}}</small>
                </template>
            </multiselect>
        </CForm>
      <template #footer>
        <CButton @click="dismiss()" color="secondary">Cancel</CButton>
        <CButton type="submit" form="linkCaseForm" color="primary">Link</CButton>
      </template>
    </CModal>
</div>
</template>

<script>
import {vSelect} from "vue-select";
export default {
    name: 'LinkCaseModal',
    props: {
        show: Boolean,
        case_uuid: String,
        related_cases: Array
    },
    data(){
        return {
            cases: [],
            selected: [],
            modalStatus: this.show,
            error: false,
            error_message: "",
            required: true
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
        getSeverity(severity) {
            switch(severity) {
                case 1: return "Low";
                case 2: return "Medium";
                case 3: return "High";
                case 4: return "Critical";
                default: return "Low"
            }
        },
        linkCase() {
            let uuid = this.case_uuid
            let uuids = this.selected.map(c => { return c.uuid})
            this.$store.dispatch('relateCases', {uuid, data: {'cases': uuids}}).then(resp => {
                this.dismiss()
                this.modalStatus = false
            })
        },
        loadData() {
            this.$store.dispatch('getCases', {status: []}).then(resp => {
                this.cases = this.$store.getters.cases.filter(x => !this.related_cases.map(c => { return c.uuid }).includes(x.uuid) && x.uuid != this.case_uuid)
            })
        },
        caseFind(query) {
            this.$store.dispatch('getCasesByTitle', {title: query}).then(resp => {
                this.cases = this.$store.getters.cases.filter(x => !this.related_cases.map(c => { return c.uuid }).includes(x.uuid) && x.uuid != this.case_uuid)
            })
        },
        reset() {
            this.selected = []
            this.error = false
            this.error_message = ""
        },
        dismiss() {
            this.reset()
            this.modalStatus = false
        }
    }
}
</script>