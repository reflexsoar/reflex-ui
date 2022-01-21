<template>
<div><link rel="stylesheet" href="https://unpkg.com/vue-multiselect@2.1.0/dist/vue-multiselect.min.css">
    <CModal title="Add Item to List" :centered="true" size="lg" :show.sync="modalStatus">
      <div>
        <CForm @submit.prevent="addToList()" id="add_to_list" >
            <p>Select a list to add <b>{{observable.data_type}}: {{observable.value}}</b> to.</p>
            <CSelect v-bind:disabled="lists.length == 0" placeholder="Select one" :value.sync="selected_list" :options="lists_formatted" label="List" description="Be sure to pick the correct list."/>
        </CForm>
      </div>
      <template #footer>
          <CButton @click="dismiss()" color="secondary">Cancel</CButton>
        <CButton type="submit" form="add_to_list" color="primary" v-bind:disabled="lists.length == 0 || selected_list == ''">Add Observbale</CButton>
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
        observable: Object
    },
    computed: mapState(['settings']),
    data(){
        return {
            modalStatus: this.show,
            selected_list: "",
            lists: [],
            lists_formatted: []
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
                this.getLists(this.observable.data_type, this.observable.organization)
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
        getLists(dt, organization=null) {
            let data = {
                data_type: dt,
                organization: organization
            }
            let data_type = [dt]
            this.$store.dispatch('getLists', data).then(resp => {
                this.lists = resp.data
                this.lists_formatted = this.lists.filter(l => l.url === null).map(l => ({'value':l.name, 'id': l.uuid}))
            })
            return this.lists
        },
        addToList() {
            let value = {'values': [this.observable.value]}
            let uuid = this.lists.filter(l => l.name === this.selected_list)[0].uuid
            console.log(uuid)
            this.$store.dispatch('addItemToList', {uuid, value}).then(resp => {
                this.dismiss()
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