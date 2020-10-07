<template>
<div><link rel="stylesheet" href="https://unpkg.com/vue-multiselect@2.1.0/dist/vue-multiselect.min.css">
    <CModal title="Close Case" :centered="true" size="lg" :show.sync="modalStatus">
      <CAlert :show.sync="error" color="danger" closeButton>
        {{error_message}}
      </CAlert>
      <CForm id="closeCaseForm" @submit.prevent="closeCase" >
          <p>You are about to close this case, select a reason for doing so.  Providing additional context where necessary is recommended.  Note, all open Events attached to this case will also be closed.</p>
          <CSelect :options="close_reasons" label="Reason" placeholder="Select a reason for closing this case" :value="closure_reason_uuid" @change="closure_reason_uuid = $event.target.value" required></CSelect>
          <CTextarea :value="close_comment" @change="close_comment = $event" v-bind:required="settings.require_case_close_comment" v-bind:disabled="closure_reason_uuid == ''" label="Additional information" rows="5" placeholder="Enter additional information related to the closure reason."></CTextarea>
      </CForm>
      <template #footer>
        <CButton @click="dismiss()" color="secondary">Dismiss</CButton>
        <CButton type="submit" form="closeCaseForm" color="primary">Close</CButton>
      </template>
    </CModal>
</div>
</template>

<script>
import {mapState} from 'vuex';
import {vSelect} from "vue-select";
export default {
    name: 'CloseCaseModal',
    props: {
        show: Boolean,
        case_uuid: String,
        status_uuid: String,
        task_count: Number,
        closed: Boolean
    },
    computed: mapState(['settings']),
    data(){
        return {
            title: "",
            description: "",
            groups: [],
            users: [],
            owner: "",
            group: "",
            modalStatus: this.show,
            error: false,
            error_message: "",
            required: true,
            close_reasons: [],
            close_comment: "",
            closure_reason_uuid: ""
        }
    },
    watch: {
        show: function() {
            this.modalStatus = this.show
        },
        modalStatus: function(){
            if(this.modalStatus) {
                this.loadClosureReasons()
            }
            this.$emit('update:show', this.modalStatus)
            this.$emit('update:closed', this.closed)
        
            if(!this.modalStatus) {
                this.reset()
            }
        }
    },
    created() {
    },
    methods: {
        closeCase(){
            // Leave the closure comment
            let data = {
                message: this.close_comment,
                case_uuid: this.case_uuid,
                is_closure_comment: true,
                closure_reason_uuid: this.closure_reason_uuid
            }
            this.$store.dispatch('createCaseComment', data)

            // Call the update case API endpoint
            let status = {"status_uuid": this.status_uuid, "close_reason_uuid": this.closure_reason_uuid}
            let uuid = this.case_uuid
            this.$store.dispatch('updateCase', {uuid, data: status}).then(resp => {
                this.case_data = resp.data
                this.$emit('update:closed', true)
                this.modalStatus = false
            })

        },
        loadClosureReasons() {
            // Call the closure reasons API endpoint
            this.$store.dispatch('getCloseReasons').then(resp => {
                this.close_reasons = resp.data.map((reason) => { return {'label': reason.title, 'value': reason.uuid }})
            })            
        },
        reset() {
            this.closure_reason_uuid = ""
            this.close_comment = ""
            this.owner = null
            this.group = null
            this.error = false
            this.error_message = ""
        },
        dismiss() {
            this.reset()
            this.$emit('update:closed', false)
            this.modalStatus = false
            this.$emit('update:show', this.modalStatus)
        }
    }
}
</script>