<template>
<div><link rel="stylesheet" href="https://unpkg.com/vue-multiselect@2.1.0/dist/vue-multiselect.min.css">
    <CModal title="Run Action" :centered="true" size="lg" :show.sync="modalStatus">
      <div>
        <CForm @submit.prevent="runAction" >
            <p>Select an action to perform against the observable <b>{{observable.data_type}}: {{observable.value}}</b></p>
            <CSelect placeholder="Select one" :value.sync="selected_plugin" :options="getPlugins()" label="Plugin" description="Different plugins have different actions."/>
            <CSelect placeholder="Select one" :value.sync="selected_action" :options="actions" label="Action" description="The action will be sent to an agent for execution."/>
        </CForm>
      </div>
      <template #footer>
          <CButton @click="dismiss()" color="secondary">Cancel</CButton>
        <CButton @click="runAction()" color="primary">Execute</CButton>
      </template>
    </CModal>
</div>
</template>

<script>
import {vSelect} from "vue-select";
import { mapState} from 'vuex';
export default {
    name: 'RunActionModal',
    props: {
        show: Boolean,
        observable: Object,
    },
    computed: mapState(['settings']),
    data(){
        return {
            modalStatus: this.show,
            selected_plugin: "",
            selected_action: "",
            actions: []
        }
    },
    watch: {
        show: function() {
            this.modalStatus = this.show
        },
        settings: function() {
            this.use_case_template = this.settings.require_case_templates
        },
        selected_plugin: function() {
            this.selected_action = ""
            this.pluginActions(this.selected_plugin)
        },
        modalStatus: function(){
            if(this.modalStatus) {

            }
            this.$emit('update:show', this.modalStatus)
            if(!this.modalStatus) {
                this.reset()
            }
        },
    },
    created() {
    },
    methods: {
        getPlugins() {
            return [
                {'label':'Reflex Utility','value':'reflex'},
                {'label':'SentinelOne','value':'sentinelone'}]
        },
        pluginActions(utility) {
            switch(utility) {
                case "reflex":
                    this.actions = ['AD Lookup']
                    break
                case "sentinelone":
                    this.actions = ['Isolate Host','Block Hash','Query Agent Details','Update Agent','Fetch File']
            }            
        },
        runAction() {
            console.log("RUN THE ACTION")
        },
        findActions() {
            console.log("FIND ACTIONS")
        },
        reset () {
            this.selected_action = ""
            this.selected_plugin = ""
            this.actions = []
            console.log("START OVER")
        },
        dismiss() {
            this.reset()
            this.modalStatus = false            
        }
    }
}
</script>