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
                    <h1>{{plugin.name}}</h1>
                </CCol>
                <CCol col="12" lg="6" sm="12" class="text-right">
                        <CIcon name="cid-cloud-download"></CIcon>
                </CCol>
            </CRow>
            <CRow>
                <CCol col="12" lg="6" sm="12">
                    {{plugin.description}}
                </CCol>
            </CRow>
        </CCardHeader>
        <CCardBody>
            <CRow>
                <CCol col="6">
                    <b>Name: </b> {{plugin.name}}<br>
                    <b>Enabled: </b> {{plugin.enabled}}
                </CCol>
                <CCol col="6">
                    <b>Date Created: </b>{{plugin.created_at | moment('LLLL')}}<br>
                    <b>Last Updated: </b>{{plugin.modified_at | moment('from', 'now')}}
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
    name: 'PluginDetails',
    data() {
        return {
            uuid: this.$route.params.uuid,
            plugin: {},
            loading: true,
            cardCollapse: true,
            collapse: {},
            toggleCollapse: true
        }
    },
    created() {
        this.$store.dispatch('getPlugin', this.$route.params.uuid).then(resp => {
            this.plugin = resp.data
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
