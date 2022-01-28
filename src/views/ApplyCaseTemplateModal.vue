<template>
<div><link rel="stylesheet" href="https://unpkg.com/vue-multiselect@2.1.0/dist/vue-multiselect.min.css">
    <CModal title="Apply Case Template" :centered="true" size="lg" :show.sync="modalStatus">
      <CAlert :show.sync="error" color="danger" closeButton>
        {{error_message}}
      </CAlert>
        <CForm id="applyCaseTemplateForm" @submit.prevent="applyCaseTemplate" >
            <label>Select a case template</label>
            <multiselect 
                v-model="case_template" 
                label="title" 
                :options="templates" 
                track-by="uuid" 
                :searchable="true"
                :internal-search="false"
                :options-limit="10"
                :show-no-results="false" 
                :required="true"
                @search-change="caseTemplateFind">
                <template slot="option" slot-scope="props">
                    {{props.option.title}}<br>
                    <small>{{props.option.description}}<br>Contains {{props.option.task_count}} tasks.</small>
                </template>
            </multiselect>
        </CForm>
      <template #footer>
        <CButton @click="dismiss()" color="secondary">Cancel</CButton>
        <CButton type="submit" form="applyCaseTemplateForm" color="primary">Apply</CButton>
      </template>
    </CModal>
</div>
</template>

<script>
import {vSelect} from "vue-select";
export default {
    name: 'ApplyCaseTemplateModal',
    props: {
        show: Boolean,
        case_uuid: String,
        current_case_template_uuid: String,
        organization: String
    },
    data(){
        return {
            templates: [],
            case_template: null,
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
    created() {
        this.loadData()        
    },
    methods: {
        applyCaseTemplate() {
            if(this.case_template == null || !('uuid' in this.case_template)) {
                this.error = true
                this.error_message = 'Select a case template.'
            } else {
                let data = {'case_template_uuid': this.case_template.uuid}
                let uuid = this.case_uuid
                this.$store.dispatch('updateCase', {uuid, data}).then(resp => {
                    this.modalStatus = false
                    this.$store.commit('show_alert', {message: 'Successfully applied the case template', type:'success'})
                })
            }            
        },
        loadData() {
            let organization = this.organization
            this.$store.dispatch('getCaseTemplateList', {title: '', organization}).then(resp => {
                this.templates = this.$store.getters.case_template_list.filter((template) => template.uuid != this.current_case_template_uuid)
            })
        },
        caseTemplateFind(query) {
            let organization = this.organization
            console.log(query)
            this.$store.dispatch('getCaseTemplateList', {title: query, organization: organization}).then(resp => {
                this.templates = this.$store.getters.case_template_list.filter((template) => template.uuid != this.current_case_template_uuid)
            })
        },
        reset() {
            this.case_template = null
            this.error = false
            this.error_message = ""
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