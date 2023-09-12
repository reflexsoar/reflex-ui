<template>
<div style="z-index: 9999 !important; position: relative"><link rel="stylesheet" href="https://unpkg.com/vue-multiselect@2.1.0/dist/vue-multiselect.min.css">
    <CModal  title="Add Item to List" :centered="true" size="lg" :show.sync="modalStatus">
      <CAlert v-if="error" :show="error" color="danger" fade>
        {{error_message}}
        </CAlert>
        <CForm id="add_to_list" >
            <p>Select a list to add <b>{{observable.data_type}}: {{observable.value}}</b> to:</p>
            <CSelect v-bind:disabled="lists_formatted.length == 0" placeholder="Select one" :value.sync="selected_list" :options="lists_formatted" label="List" description="Be sure to pick the correct list."/>
        </CForm>
      
      <template #footer>
          <CButton @click="dismiss()" color="secondary">Cancel</CButton>
        <CButton type="submit" form="add_to_list" color="primary" @click="addToList" v-bind:disabled="lists.length == 0 || selected_list == ''">Add Observbale</CButton>
      </template>
    </CModal>
</div>
</template>

<script>
import {vSelect} from "vue-select";
import { mapState} from 'vuex';
export default {
    name: 'ListAdderModal',
    props: {
        show: Boolean,
        observable: Object
    },
    computed: mapState(['settings']),
    data(){
        return {
            modalStatus: this.show,
            selected_list: "",
            lists: [],
            lists_formatted: [],
            obs_value: this.observable.value,
            error: false,
            error_message: "",
        }
    },
    watch: {
        show: function() {
            this.modalStatus = this.show;
            
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
                this.getLists(this.observable.data_type, this.observable.organization)
                this.obs_value = this.observable.value;
            }
            this.$emit('update:show', this.modalStatus)
            if(!this.modalStatus) {
                this.reset()
            }
        },
    },
    methods: {
        getLists(dt, organization=null) {
            let data = {
                data_type: dt,
                organization: organization,
                page_size: 50
            }
            let data_type = [dt]
            this.$store.dispatch('getLists', data).then(resp => {
                this.lists = resp.data.lists
                this.lists_formatted = this.lists.filter(l => l.url === null).map(l => ({'label':l.name, 'value': l.uuid}))
            })
            return this.lists
        },
        addToList() {
            
            let value = {values: [this.observable.value]}
            let uuid = this.selected_list;
            this.$store.dispatch('addItemToList', {uuid, value}).then(resp => {
                this.dismiss()
            }).catch(err => {
                this.error = true
                this.error_message = err.response.data.message
            })
        },
        reset () {
            this.selected_list = ""
        },
        dismiss() {
            this.reset()
            this.modalStatus = false            
        }
    }
}
</script>