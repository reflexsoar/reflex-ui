<template>
   
  <CRow><link rel="stylesheet" href="https://unpkg.com/vue-multiselect@2.1.0/dist/vue-multiselect.min.css">
    <CCol col v-if="loading">
        <div style="margin: auto; text-align:center; verticle-align:middle;">
           <CSpinner
                color="dark"
                style="width:6rem;height:6rem;"
            />
        </div>
    </CCol>
    <CCol col v-if="!loading">
    <CAlert :show.sync="alert" color="success" closeButton>
        {{alert_message}}
    </CAlert>
    <CCard class="shadow-sm bg-white rounded" >
        <CCardHeader>
            <CRow>
                <CCol col="12" lg="4" sm="12" class="text-left" @mouseover="name_hover = true" @mouseleave="name_hover = false">
                    <h1>
                        <span v-if="!name_edit">
                            {{agent.name}}&nbsp;<a v-if="name_hover" @click="name_edit = !name_edit"><CIcon name="cilPencil" size="sm"/></a>
                        </span>
                        <span v-if="name_edit">
                            <CInput v-model="agent.name" size="lg">
                            <template #append>
                                <CButton color="danger" @click="name_edit = !name_edit" size="sm"  class="no-shadow"><CIcon name="cilXCircle"/></CButton>
                                <CButton color="primary" @click="updateAgentName()" class="no-shadow" size="sm"><CIcon name="cilSave"/></CButton>
                            </template>
                            </CInput>
                        </span>
                    </h1>                   
                </CCol>
                <CCol col="12" lg="8" sm="12" class="text-right">
                    <template #tags='{tag}'>
                        {{tag.name}}
                    </template>
                    <li style="display: inline; margin-right: 2px;" v-for="tag in agent.tags" :key="tag.name"><CButton color="primary" size="sm" disabled>{{ tag.name }}</CButton></li>
                </CCol>
            </CRow>
            <CRow>
                <CCol col="12" lg="6" sm="12">
                    {{agent.description}}
                </CCol>
            </CRow>
        </CCardHeader>
        <CCardBody>
            <CRow>
                <CCol col="6">
                    <label>Active</label><br>
                    <CSwitch color="success" label-on="Yes" label-off="No" :checked.sync="agent.active"/><br>
                    <label>Last Heartbeat</label><br>
                    {{agent.last_heartbeat | moment('LLLL')}}
                </CCol>
            </CRow>
            <CRow>
                <CCol><hr>
                  <h3>Inputs</h3>
                  Inputs selected here will be polled by the agent at the period defined in the input configuration.<br><br>
                  <multiselect v-model="selected" placeholder="Select inputs to be used by this agent" track-by="uuid" label="name" :options="input_list" :multiple="true" @input="updateInputs()">
                  </multiselect>
                </div>
                </CCol>
                <CCol><hr>
                  <h3>Groups</h3>
                  Groups selected here can be targeted by plugins to run plugins on select agents.<br><br>
                  <multiselect v-model="selected_groups" placeholder="Select the groups this agent belongs to" track-by="uuid" label="name" :options="group_list" :multiple="true" @input="updateGroups()">
                  </multiselect>
                </div>
                </CCol>
            </CRow>
        </CCardBody>
        <CCardFooter>
            <CRow>
                <CCol col="12" class='text-right'>
                    <CButton color='danger' @click='delete_confirm_modal = true'><CIcon name='cil-trash'/></CButton>
                </CCol>
            </CRow>
        </CCardFooter>
    </CCard>
  </CCol>
  </CRow>
</template>

<script>
import {mapState} from "vuex";
import {vSelect} from "vue-select";
export default {
    name: 'InputDetails',
    data() {
        return {
            uuid: this.$route.params.uuid,
            agent: {},
            input_list: [],
            group_list: [],
            selected: [],
            selected_groups: [],
            loading: true,
            cardCollapse: true,
            collapse: {},
            toggleCollapse: true,
            alert:false,
            alert_message:"",
            animate: true,
            name_hover: false,
            name_edit: false,
            tags_hover: false,
            tags_edit: false,
            delete_confirm_modal: false
        }
    },
    created() {
        this.$store.dispatch('getInputList').then(resp => {
            for(let i in resp.data) {
                this.input_list.push({'name': resp.data[i].name, 'uuid': resp.data[i].uuid})
            }
        })
        this.$store.dispatch('getAgentGroups').then(resp => {
            for(let i in resp.data){ 
                this.group_list.push({'name': resp.data[i].name, 'uuid': resp.data[i].uuid})
            }
        })
        this.$store.dispatch('getAgent', this.$route.params.uuid).then(resp => {
            this.agent = resp.data
            this.selectedInputs()
            this.selectedGroups()
            this.loading = false
        })
        
    },
    methods: {
        expandAll() {
            for(const c in this.collapse) {
                if(!this.collapse[c]) {
                    this.collapse[c] = true
                }
            }

            this.toggleCollapse = false
        },
        collapseAll() {
            for(const c in this.collapse) {
                if(this.collapse[c]) {
                    this.collapse[c] = false
                }                
            }
            this.toggleCollapse = true
        },
        addInput(input) {
            this.inputs.push(input)
            this.input_list.push(t)
            this.selected.push(t)
        },
        selectedInputs() {
            for(const i in this.agent.inputs) {
                let input = this.agent.inputs[i]
                this.selected.push({'uuid': input.uuid, 'name': input.name})
            }
        },
        selectedGroups() {
            for(const i in this.agent.groups) {
                let group = this.agent.groups[i]
                this.selected_groups.push({'uuid': group.uuid, 'name': group.name})
            }
        },
        updateInputs(event) {
            this.alert = 5
            this.alert_message = "Successfully updated the agents inputs."
            let uuid = this.uuid
            let inputs = { "inputs": []}
            for(const inp in this.selected) {
                inputs['inputs'].push(this.selected[inp].uuid)
            }
            this.$store.dispatch('setAgentInputs', {uuid, inputs} )
        },
        updateGroups(event) {
            this.alert = 5
            this.alert_message = "Successfully updated the agents groups."
            let groups = { "groups": [] }
            for(const grp in this.selected_groups) {
                groups['groups'].push(this.selected_groups[grp].uuid)
            }
            let uuid = this.uuid
            this.$store.dispatch('setAgentGroups', {uuid, groups})
        },
        updateAgentName() {
            let uuid = this.uuid;
            let data = {
                name: this.agent.name
            }
            this.$store.dispatch('updateAgent', {uuid, data}).then(resp => {
                this.agent = this.$store.getters.agent
            })
            this.name_edit = false
        }
    },
    filters: {
        firstTwo: function(value) {
            if (!value) return ''
            value = value.toString()
            return value.substring(0,2)
        },
        capitalize: function (value) {
            if (!value) return ''
            value = value.toString()
            return value.toUpperCase()
        }
    }
}
</script>
