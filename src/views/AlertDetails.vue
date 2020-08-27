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
                    <h2>{{alert.title | truncate}}</h2>
                </CCol>
                <CCol col="12" lg="6" sm="12" class="text-right">
                    <li style="display: inline; margin-right: 2px;" v-for="tag in alert.tags" :key="tag.name"><CButton color="primary" size="sm" disabled="">{{ tag.name }}</CButton></li>
                </CCol>
            </CRow>
            <CRow>
                <CCol col="12" lg="6" sm="12" class="pre-formatted">{{alert.description}}</CCol>
            </CRow>
        </CCardHeader>
        <CCardBody>
            <CRow>
                <CCol col="6">
                    <b>Source: </b> Elasticsearch<br>
                    <b>Created: </b>{{alert.created_at | moment('LLLL')}}<br>
                    <b>Updated: </b>{{alert.modified_at | moment('from', 'now')}}
                </CCol>
                <CCol col="6">
                </CCol>
            </CRow>
        </CCardBody>
    </CCard>
    <CCard class="shadow-sm bg-white rounded" >
        <CCardHeader>
            <CRow >
                <CCol col="12" lg="12" sm="12" class="text-left">
                    <b @click="collapse_observables = !collapse_observables" style='display: inline-block'>Observables</b> <CButton class="float-right" color="primary" size="sm">New Observable</Cbutton>
                </CCol>
            </CRow>
        </CCardHeader>
        <CCollapse :show="collapse_observables">
            <CDataTable
                :hover="hover"
                :items="alert.observables"
                :fields="observable_fields"
                :items-per-page="small ? 25 : 10"
                bordered
                striped
                pagination
            >
                <template #value="{item}">
                    <td>
                        {{item.value | defang}}
                    </td>
                </template>
                <template #dataType="{item}">
                    <td>
                        {{item.dataType.name | defang}}
                    </td>
                </template>
                <template #tags="{item}">
                    <td>
                        <li style="display: inline; margin-right: 2px;" v-for="tag in item.tags" :key="tag.name"><CButton color="primary" size="sm" disabled>{{ tag.name }}</CButton></li>
                    </td>
              </template>
            </CDataTable>
        </CCollapse>
    </CCard>
    <CCard class="shadow-sm bg-white rounded" >
        <CCardHeader>
            <CRow @click="collapse_raw_log = !collapse_raw_log">
                <CCol col="12" lg="12" sm="12" class="text-left">
                    <b>Raw Log</b> <span class="float-right" v-if="collapse_raw_log">-</span><span class="float-right" v-if="!collapse_raw_log">+</span>
                </CCol>
            </CRow>
        </CCardHeader>
        <CCollapse :show="collapse_raw_log">
        <CCardBody class="bg-dark" style="overflow:scroll">
            <CRow class="bg-dark" >
                <CCol col="12" class="bg-dark pre-formatted raw_log">
                    {{alert.raw_log}}
                </CCol>
            </CRow>
            
        </CCardBody></CCollapse>
    </CCard>
  </CCol>
  </CRow>
</template>

<script>
import {mapState} from "vuex";
export default {
    name: 'AlertDetails',
    props: {
        observable_fields: {
            type: Array,
            default () {
            return ['value', 'ioc', 'spotted', 'dataType', 'tags']
            }
        },
        caption: {
            type: String,
            default: 'Table'
        },
        hover: Boolean,
        striped: Boolean,
        bordered: Boolean,
        small: Boolean,
        fixed: Boolean,
        dark: Boolean,
    },
    data() {
        return {
            uuid: this.$route.params.uuid,
            alert: {},
            loading: true,
            cardCollapse: true,
            collapse_raw_log: false,
            collapse_observables: true,
            collapse: {},
            toggleCollapse: true
        }
    },
    created() {
        this.$store.dispatch('getAlert', this.$route.params.uuid).then(resp => {
            this.alert = resp.data
            let {alerts} = this.alert
            for(const alert in alerts) {
                let uuid = alerts[alert].uuid
                this.$set(this.collapse, uuid, true)
            }
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
            
        },
        defang: function(value) {
            return value.replace(':','[:]').replace('http','hxxp').replace('.','[.]')
        }
    }
}
</script>
