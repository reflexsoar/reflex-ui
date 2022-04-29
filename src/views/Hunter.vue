<template>
    <CRow>
        <CCol xs="12" lg="12">
            <CRow>
                <CCol>
                    <h2>Hunter</h2>
                </CCol>
                {{selected_fields}}
            </CRow><CForm id="hunt-form" @submit.prevent="search">
            <CRow>
                
                    <CCol xs="12" lg="10">
                        <CInput v-on:keyup.enter="search(hunt_query)" v-model="hunt_query" placeholder="Enter your hunting query" required></CInput>
                    </CCol>
                    <CCol xs="12" lg="2">
                        <CButton type="submit" class="btn btn-block btn-primary">Hunt</CButton>
                    </CCol>
                
            </CRow></CForm>
            <CRow v-if="hunt_complete">
                
                <CCol>
                    <CRow v-for="hit in this.results" :key="hit._id">
                        <CCol lg="12">
                            <CCard>
                                <CCardHeader>
                                    {{hit._source.message}}
                                </CCardHeader>
                                <CCardBody>                                            
                                    <vue-json-pretty v-model="selected_fields" :showLength="true" :path="'_source'" :data="hit" selectableType="multiple" :deepCollapseChildren="true" :deep="2"></vue-json-pretty>                                            
                                </CCardBody>
                                
                            </CCard>
                        </CCol>
                    </CRow>
                </CCol>
            </CRow>
            <CRow v-else>
                <CCol xs="12" lg="12">
                    <center><h3>No events found.</h3></center>
                </CCol>
            </CRow>
        </CCol>
    </CRow>    
</template>

<script>

import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';

export default {
    name: 'ObservableHistory',
    components: {
        VueJsonPretty
    },
    data () {
        return {
            hunt_query: "",
            results: [],
            selected_fields: [],
            hunt_complete: true,
            fields: ['_index']
        }
    },
    methods: {
        search: function (value) {
            let query = {
                "query": this.hunt_query
            }
            this.$store.dispatch('runThreatHunt', query).then(resp => {
                this.hunt_complete = false
                this.results = resp.data.hits.hits
                if(this.results.length > 0) {
                    this.hunt_complete = true
                }
            })
        }
    }
}
</script>