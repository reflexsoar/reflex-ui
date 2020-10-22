<template>
  <CRow>
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
                    <h1>{{input.name}}</h1>
                </CCol>
                <CCol col="12" lg="6" sm="12" class="text-right">
                    <template #tags='{tag}'>
                        {{tag.name}}
                    </template>
                    <li style="display: inline; margin-right: 2px;" v-for="tag in input.tags" :key="tag.name"><CButton color="primary" size="sm" disabled>{{ tag.name }}</CButton></li>
                </CCol>
            </CRow>
            <CRow>
                <CCol col="12" lg="6" sm="12">
                    {{input.description}}
                </CCol>
            </CRow>
        </CCardHeader>
        <CCardBody>
            <CRow>
                <CCol col="6">
                    <b>Name: </b> {{input.name}}<br>
                    <b>Enabled: </b> True
                </CCol>
                <CCol col="6">
                    <b>Plugin: </b> Elasticsearch<br>
                    <b>Date Created: </b>{{input.created_at | moment('LLLL')}}<br>
                    <b>Last Updated: </b>{{input.modified_at | moment('from', 'now')}}
                </CCol>
            </CRow>
        </CCardBody>
    </CCard>
    <CRow>
        <CCol>
        <CCard class="shadow-sm bg-white rounded" @mouseover="config_hover = true" @mouseleave="config_hover = false">
            <CCardHeader>
                <CRow>
                    <CCol col="12" lg="6" sm="12" class="text-left">
                        <b>Configuration</b>&nbsp;<a v-if="config_hover && !edit_config" @click="edit_config = !edit_config"><CIcon name="cilPencil" size="sm"/></a>
                    </CCol>
                </CRow>
            </CCardHeader>
            <CCardBody class="bg-dark" v-if="!edit_config" style="overflow:scroll; min-height:300px; max-height:300px;">
                <CRow class="bg-dark">
                    <CCol col="12" class="bg-dark pre-formatted raw_log">
                        {{input.config}}
                    </CCol>
                </CRow>
            </CCardBody>
            <CCardBody v-if="edit_config">
                <CAlert :show.sync="config_json_error" color="danger" closeButton class="text-left">
                    Invalid JSON. Please check your config before submitting.
                </CAlert>
                <CTextarea :value="jsonToString(input.config)" @change="convertConfig($event)" rows="10"/>
                <CButton color="danger" @click="edit_config = !edit_config; config_json_error = false" size="sm"><CIcon name="cilXCircle"/></CButton>&nbsp;
                <CButton color="primary" @click="updateConfig()"  size="sm" v-bind:disabled="config_json_error"><CIcon name="cilSave"/></CButton>
            </CCardBody>
        </CCard>
        </CCol>
        <CCol>
        <CCard class="shadow-sm bg-white rounded" @mouseover="field_mapping_hover = true" @mouseleave="field_mapping_hover = false">
            <CCardHeader>
                <CRow>
                    <CCol col="12" lg="6" sm="12" class="text-left">
                        <b>Field Mapping</b><a v-if="field_mapping_hover && !edit_field_mapping" @click="edit_field_mapping = !edit_field_mapping"><CIcon name="cilPencil" size="sm"/></a>
                    </CCol>
                </CRow>
            </CCardHeader>
            <CCardBody v-if="!edit_field_mapping" class="bg-dark" style="overflow:scroll; min-height:300px; max-height:300px;">
                <CRow class="bg-dark" >
                    <CCol col="12" class="bg-dark pre-formatted raw_log">
                        {{input.field_mapping}}
                    </CCol>
                </CRow>
            </CCardBody>
            <CCardBody v-if="edit_field_mapping" class="text-right">
                <CAlert :show.sync="json_error" color="danger" closeButton class="text-left">
                    Invalid JSON. Please check your config before submitting.
                </CAlert>
                
                <CTextarea :value="jsonToString(input.field_mapping)" @change="convertFieldMapping($event)" rows="10"/>
                <CButton color="danger" @click="edit_field_mapping = !edit_field_mapping; json_error = false" size="sm"><CIcon name="cilXCircle"/></CButton>&nbsp;
                <CButton color="primary" @click="updateFieldMapping()"  size="sm" v-bind:disabled="json_error"><CIcon name="cilSave"/></CButton>
            </CCardBody>
        </CCard>
        </CCol></CRow>
  </CCol>
  </CRow>
</template>

<script>
import {mapState} from "vuex";
export default {
    name: 'InputDetails',
    data() {
        return {
            uuid: this.$route.params.uuid,
            loading: true,
            cardCollapse: true,
            collapse: {},
            toggleCollapse: true,
            edit_field_mapping: false,
            field_mapping_hover: false,
            edit_config: false,
            config_hover: false,
            json_error: false,
            config_json_error: false
        }
    },
    computed: mapState(['input']),
    created() {
        this.$store.dispatch('getInput', this.$route.params.uuid).then(resp => {
            this.loading = false
        })        
    },
    methods: {
        jsonToString(data) {
            return JSON.stringify(data, undefined, 4)
        },
        convertFieldMapping(event) {
            try {
                this.input.field_mapping = JSON.parse(event)
                this.json_error = false
            } catch {
                this.input.field_mapping = this.input.field_mapping
                this.json_error = true
            }
        },
        convertConfig(event) {
            try {
                this.input.config = JSON.parse(event)
                this.config_json_error = false
            } catch {
                this.input.config = this.input.config
                this.config_json_error = true
            }
        },
        updateConfig() {
            let uuid = this.uuid
            let config = null
            try {
                config = JSON.parse(JSON.stringify(this.input.config))
                this.config_json_error = false
            } catch {
                config = null
                this.config_json_error = true
            }
            if(config) {
                this.$store.dispatch('updateInput', {uuid: uuid, data: { config: config }}).then(resp => {
                    this.edit_config = false
                })
            }
        },
        updateFieldMapping() {
            let uuid = this.uuid
            let field_mapping = null
            try {
                field_mapping = JSON.parse(JSON.stringify(this.input.field_mapping))
                this.json_error = false                
            } catch {
                field_mapping = null
                this.json_error = true
            }

            if(field_mapping) {
                this.$store.dispatch('updateInput', {uuid: uuid, data: { field_mapping: field_mapping}} ).then(resp => {
                    this.edit_field_mapping = false
                })
            }
            
        },
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
        },
        truncate: function (value) {
            let maxLength = 250
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
