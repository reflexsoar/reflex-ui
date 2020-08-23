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
                    <h1>{{organization.name}}</h1>
                    <a v-bind:href="`${organization.url}`" target=_blank>{{organization.url}}</a>
                </CCol>
                <CCol col="12" lg="6" sm="12" class="text-right">
                    <template #tags='{tag}'>
                        {{tag.name}}
                    </template>
                    <li style="display: inline; margin: 0 2px;" v-for="tag in organization.tags" :key="tag.name"><CBadge color="primary" style="border-radius: 0px; padding: 5px;">{{ tag.name }}</CBadge></li>
                </CCol>
            </CRow>
            <CRow>
                <CCol col="12" lg="6" sm="12">
                    {{organization.description}}
                </CCol>
            </CRow>
        </CCardHeader>
        <CCardBody>
            <h3>Metrics</h3>
            <CRow>
                <CCol col="12" sm="12" lg="3">
                    <CWidgetIcon
                    :header="`${organization.total_projects}`"
                    text="Total Projects"
                    color="info"
                    :icon-padding="false"
                    >
                    <CIcon name="cil-settings" width="24"/>
                    </CWidgetIcon>
                </CCol>
                <CCol col="12" sm="12" lg="3">
                    <CWidgetIcon
                    header="Stewgle"
                    text="Most Vulnerable Project"
                    color="danger"
                    :icon-padding="false"
                    >
                    <CIcon name="cil-bell" width="24"/>
                    </CWidgetIcon>
                </CCol>
                <CCol col="12" sm="12" lg="3">
                    <CWidgetIcon
                    header="DealerSocket"
                    text="Least Vulnerable Project"
                    color="success"
                    :icon-padding="false"
                    >
                    <CIcon name="cil-badge" width="24"/>
                    </CWidgetIcon>
                </CCol>
                <CCol col="12" sm="12" lg="3">
                    <CWidgetIcon
                    header="Cross-Site Scripting"
                    text="Most Repeated Finding"
                    color="danger"
                    :icon-padding="false"
                    >
                    <CIcon name="cil-bug" width="24"/>
                    </CWidgetIcon>
                </CCol>
            </CRow>
        </CCardBody>
    </CCard>
  </CCol>
  <CCol col="12" v-if="!loading">
        <CRow>
            <CCol col="6" lg="6" sm="6">
                <h2>Projects</h2>
            </CCol>  
            <CCol col="6" lg="6" sm="6" class="text-right">
                <CButton color="primary" to="/projects/create">Add Project</CButton>
            </CCol>  
        </CRow>
        <CRow>
            <CCol col="12" v-for="project in organization.projects" :key="project.name">
                <CCard class="shadow-sm">
                    <!--<CCardHeader >
                        <CRow>
                            <CCol col="6" lg="6" sm="6">
                                <strong>{{project.name}}</strong>
                            </CCol>
                            <CCol col="6" lg="6" sm="6" class="text-right">
                                <template #tags='{tag}'>
                                    {{tag.name}}
                                </template>
                                <li style="display: inline; margin-right: 2px;" v-for="tag in project.tags" :key="tag.name"><CBadge class="badge" color="dark" style="border-radius: 0px; padding: 5px; font-weight: normal; font-size:.9em">{{ tag.name }}</CBadge></li>
                                
                            </CCol>
                        </CRow>
                        
                    </CCardHeader>-->
                    <CCollapse :show="collapse[project.uuid]">
                    <CCardBody>
                        <CRow>
                            <CCol col="12" sm="12" lg="2">
                                <h2>{{project.name | capitalize }}</h2>
                                <a v-bind:href="`${project.url}`" target=_blank>{{project.url}}</a>                                
                            </CCol>
                            <CCol col="12" sm="12" lg="2">
                                <h5>Last Updated</h5>
                                {{project.modified_at | moment('timezone', 'America/New_York', 'from', 'now')}}
                            </CCol>
                            <CCol col="12" sm="12" lg="5" v-c-tooltip="{
                                content: project.description,
                                placement: 'bottom'
                            }">
                                <h5>Description</h5>{{project.description | truncate}}
                            </CCol>
                            <CCol col="12" sm="12" lg="3">
                                <CRow>
                                    <CCol col>
                                        <template #tags='{tag}'>
                                            {{tag.name}}
                                        </template>
                                        <li style="display: inline; margin-right: 2px;" v-for="tag in project.tags" :key="tag.name"><CButton color="dark" size="sm">{{ tag.name }}</CButton></li>
                                    </CCol>
                                </CRow>
                            </CCol>
                        </CRow>
                        <CRow>
                            <CCol col="12" sm="12" lg="2">
                                <CCallout color="danger">Critical<br><h3>1</h3></CCallout>
                            </CCol>
                            <CCol col="12" sm="12" lg="2">
                                <CCallout color="warning">Medium<br><h3>31</h3></CCallout>
                            </CCol>
                            <CCol col="12" sm="12" lg="2">
                                <CCallout color="dark">Low<br><h3>3,400</h3></CCallout>
                            </CCol>
                            <CCol col="12" sm="12" lg="2">
                                <CCallout color="info">Info<br><h3>7</h3></CCallout>
                            </CCol>
                            <CCol col="12" sm="12" lg="2">
                                <CCallout color="secondary">Closed<br><h3>7</h3></CCallout>
                            </CCol>
                        </CRow>
                    </CCardBody>
                    <CCardFooter>
                        <CRow>
                            <CCol col="12" sm="12" lg="6">
                                <CButton color="secondary" size="sm" disabled><b style="text-transform: uppercase;">{{project.created_at | moment('DD MMM YY')}}</b></CButton> <span style="color:#4f5d73; font-weight: bold;">Date Created</span>
                            </CCol>
                            <CCol col="12" sm="12" lg="6" class="text-right">
                                <CDropdown 
                                    color="secondary"
                                    toggler-text="Options"
                                >
                                    <CDropdownItem :to="`/projects/${project.uuid}`">View</CDropdownItem>
                                    <CDropdownItem>Add Finding</CDropdownItem>
                                    <CDropdownItem>Generate Report</CDropdownItem>
                                    <CDropdownDivider/>
                                    <CDropdownItem>Close</CDropdownItem>
                                </CDropdown>
                            </CCol>
                        </CRow>
                    </CCardFooter>
                    </CCollapse>
                </CCard>
            </CCol>
        </CRow>
    </CCol>
  </CRow>
</template>

<script>
import {mapState} from "vuex";
export default {
    name: 'OrganizationDetails',
    data() {
        return {
            uuid: this.$route.params.uuid,
            organization: {},
            loading: true,
            cardCollapse: true,
            collapse: {},
            toggleCollapse: true
        }
    },
    created() {
        this.$store.dispatch('getOrganization', this.$route.params.uuid).then(resp => {
            this.organization = resp.data
            let {projects} = this.organization
            for(const project in projects) {
                let uuid = projects[project].uuid
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
            
        }
    }
}
</script>
