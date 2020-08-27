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
    <CCard class="shadow-sm bg-white rounded" >
        <CCardHeader>
            <CRow>
                <CCol col="12" lg="6" sm="12" class="text-left">
                    <b>Configuration</b>
                </CCol>
            </CRow>
        </CCardHeader>
        <CCardBody class="bg-dark" style="overflow:scroll">
            <CRow class="bg-dark" >
                <CCol col="12" class="bg-dark pre-formatted raw_log">
                    {{input.config}}
                </CCol>
            </CRow>
        </CCardBody>
    </CCard>
    <CCard class="shadow-sm bg-white rounded" >
        <CCardHeader>
            <CRow>
                <CCol col="12" lg="6" sm="12" class="text-left">
                    <b>Field Mapping</b>
                </CCol>
            </CRow>
        </CCardHeader>
        <CCardBody class="bg-dark" style="overflow:scroll">
            <CRow class="bg-dark" >
                <CCol col="12" class="bg-dark pre-formatted raw_log">
                    {{input.field_mapping}}
                </CCol>
            </CRow>
        </CCardBody>
    </CCard>
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
            input: {},
            loading: true,
            cardCollapse: true,
            collapse: {},
            toggleCollapse: true
        }
    },
    created() {
        this.$store.dispatch('getInput', this.$route.params.uuid).then(resp => {
            this.input = resp.data
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
