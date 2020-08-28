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
    <CCard class="shadow-sm bg-white rounded" >
        <CCardHeader>
            <CRow>
                <CCol col="12" lg="6" sm="12" class="text-left">
                    <h1>{{agent.name}}</h1>
                </CCol>
                <CCol col="12" lg="6" sm="12" class="text-right">
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
                    <b>Name: </b> {{agent.name}}<br>
                    <b>Enabled: </b> True
                </CCol>
                <CCol col="6">
                    <b>Plugin: </b> Elasticsearch<br>
                    <b>Last Heartbeat: </b>{{agent.last_heartbeat | moment('from', 'now')}}
                </CCol>
            </CRow>
            <CRow>
                <CCol><hr>
                  <h3>Inputs</h3>
                  Inputs selected here will be polled by the agent at the period defined in the input configuration.<br><br>
                  <multiselect v-model="selected" placeholder="Select inputs to be used by this agent" track-by="uuid" label="name" :options="input_list" :multiple="true" @input="test($event)">
                  </multiselect>
                </div>
                </CCol>
            </CRow>
        </CCardBody>
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
            selected: [],
            loading: true,
            cardCollapse: true,
            collapse: {},
            toggleCollapse: true
        }
    },
    created() {
        this.$store.dispatch('getInputList').then(resp => {
            for(let i in resp.data) {
                this.input_list.push({'name': resp.data[i].name, 'uuid': resp.data[i].uuid})
            }
        })
        this.$store.dispatch('getAgent', this.$route.params.uuid).then(resp => {
            this.agent = resp.data
            this.selectedInputs()
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
            console.log(input)
            this.inputs.push(newTag)
            this.input_list.push(t)
            this.selected.push(t)
        },
        selectedInputs() {
            for(const i in this.agent.inputs) {
                let input = this.agent.inputs[i]
                this.selected.push({'value': input.uuid, 'name': input.name})
            }
        },
        test(event) {
            console.log(event)
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
