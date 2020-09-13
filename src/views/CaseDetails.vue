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
                    <h3>{{case_data.title | truncate}}</h3>
                </CCol>
                <CCol col="12" lg="6" sm="12" class="text-right">
                        <CDropdown 
                        toggler-text="Actions" 
                        color="secondary"
                        >
                        <CDropdownItem @click="caseTemplateModal = !caseTemplateModal">Add Case Template</CDropdownItem>
                        <CDropdownItem @click="caseTaskModal = !caseTaskModal">Add Task</CDropdownItem>
                        <CDropdownItem @click="addObservableModal = !addObservableModal">Add Observables</CDropdownItem>
                        <CDropdownItem @click="runPlaybookModal = !runPlaybookModal">Run Playbook</CDropdownItem>
                        <CDropdownDivider/>
                        <CDropdownItem @click="deleteCaseModal = !deleteCaseModal">Delete</CDropdownItem>
                        </CDropdown>
                    <br>
                </CCol>
                
            </CRow>
            <CRow>
                <CCol col="12" lg="12" sm="12">{{case_data.description}}</CCol>
            </CRow>
            <CRow>
                <CCol col="12" lg="6" sm="12" style="margin-top:5px;"><li style="display: inline; margin-right: 2px;" v-for="tag in case_data.tags" :key="tag.name"><CButton color="primary" size="sm" disabled="">{{ tag.name }}</CButton></li></CCol>
            </CRow>
        </CCardHeader>
        <CCardBody>
            <CRow>
                <CCol col="6">
                    <b>Created: </b>{{case_data.created_at | moment('LLLL')}}<br>
                    <b>Updated: </b>{{case_data.modified_at | moment('from', 'now')}}
                </CCol>
                <CCol col="6" class="text-right">
                    
                </CCol>
            </CRow>
        </CCardBody>
    </CCard>
    <CCard class="shadow-sm bg-white rounded">
        <CCardHeader style="border-bottom:none;">
            <CRow >
                <CCol col="12" lg="12" sm="12" class="text-left">
                    <b>Observables</b> <CButton @click="collapse_observables = !collapse_observables" size="sm" color="secondary" class="float-right"><span v-if="collapse_observables">-</span><span v-if="!collapse_observables">+</span></CButton>
                </CCol>
            </CRow>
        </CCardHeader>
        <CCollapse :show="collapse_observables">
            <CDataTable
                :hover="hover"
                :items="case_data.observables"
                :fields="observable_fields"
                :items-per-page="small ? 25 : 10"
                bordered
                striped
                pagination
            >
                <template #value="{item}">
                    <td v-bind:class="observableAccent(item.tlp)">
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
              <template #actions="{item}">
                  <td>
                    <CDropdown 
                        toggler-text="Actions" 
                        color="secondary"
                        size="sm"
                        >
                        <CDropdownItem>Mark as IOC</CDropdownItem>
                        <CDropdownItem>Mark as Safe</CDropdownItem>
                        <CDropdownItem @click="runPlaybookModal = !runPlaybookModal">Execute Action</CDropdownItem>
                        <CDropdownDivider/>
                        <CDropdownItem @click="deleteEventModal = !deleteEventModal">Delete</CDropdownItem>
                        </CDropdown>
                    </td>
              </template>
            </CDataTable>
        </CCollapse>
    </CCard>
    <CCard class="shadow-sm bg-white rounded">
        <CCardHeader style="border-bottom:none;">
            <CRow>
                <CCol col="12" lg="12" sm="12" class="text-left">
                    <b>Related Events</b> <CButton @click="collapse_events = !collapse_events" size="sm" color="secondary" class="float-right"><span v-if="collapse_events">-</span><span v-if="!collapse_events">+</span></CButton>
                </CCol>
            </CRow>
        </CCardHeader>
        <CCollapse :show="collapse_events">
            <CDataTable
                :hover="hover"
                :items="case_data.events"
                :fields="event_fields"
                :items-per-page="small ? 25 : 10"
                bordered
                striped
                pagination
            >
                <template #title="{item}">
                    <td>
                        <router-link :to="`/alerts/${item.uuid}`">{{item.title}}</router-link>
                    </td>
                </template>
                <template #status="{item}">
                    <td>{{item.status.name}}</td>
                </template>
                <template #tlp="{item}">
                    <td>
                    <CButton v-if="item.tlp == 0" color="light" size="sm">TLP:WHITE</CButton>
                    <CButton v-if="item.tlp == 1" color="success" size="sm">TLP:GREEN</CButton>
                    <CButton v-if="item.tlp == 2" color="warning" size="sm">TLP:AMBER</CButton>
                    <CButton v-if="item.tlp >= 3" color="danger" size="sm">TLP:RED</CButton>
                </td>
                </template>
                <template #severity="{item}">
                    <td>
                    <CButton v-if="item.severity == 0" color="light" size="sm">L</CButton>
                    <CButton v-if="item.severity == 1" color="warning" size="sm">M</CButton>
                    <CButton v-if="item.severity == 2" color="danger" size="sm">H</CButton>
                    <CButton v-if="item.severity >= 3" color="dark" size="sm">C</CButton>
                </td>
                </template>
                <template #tags="{item}">
                    <td>
                        <li style="display: inline; margin-right: 2px;" v-for="tag in item.tags" :key="tag.name"><CButton color="primary" size="sm" disabled>{{ tag.name }}</CButton></li>
                    </td>
              </template>
              <template #actions="{item}">
                  <td>
                    <CDropdown 
                        toggler-text="Actions" 
                        color="secondary"
                        size="sm"
                        >
                        <CDropdownItem>Resolve</CDropdownItem>
                        <CDropdownItem>Remove from Case</CDropdownItem>
                        <CDropdownItem>Transfer Case</CDropdownItem>
                        <CDropdownItem @click="runPlaybookModal = !runPlaybookModal">Run Playbook</CDropdownItem>
                        <CDropdownDivider/>
                        <CDropdownItem @click="deleteEventModal = !deleteEventModal">Delete</CDropdownItem>
                        </CDropdown>
                    </td>
              </template>
            </CDataTable>
        </CCollapse>
    </CCard>
    <CCard class="shadow-sm bg-white rounded" >
        <CCardHeader>
            <CRow>
                <CCol col="12" lg="12" sm="12" class="text-left">
                    <b>Comments</b> <CButton @click="collapse_comments = !collapse_comments" size="sm" color="secondary" class="float-right"><span v-if="collapse_comments">-</span><span v-if="!collapse_comments">+</span></CButton>
                </CCol>
            </CRow>
        </CCardHeader>
        <CCollapse :show="collapse_comments">
        <CCardBody style="overflow:scroll">
            <CRow>
                <CCol col="12">
                    SOME COMMENTS HERE
                </CCol>
            </CRow>
        </CCardBody></CCollapse>
    </CCard>
    <AddObservableModal :show.sync="addObservableModal"></AddObservableModal>
    <AddTaskModal :show.sync="caseTaskModal"></AddTaskModal>
  </CCol>
  </CRow>
</template>

<script>
import {mapState} from "vuex";
import AddObservableModal from './AddObservableModal'
import AddTaskModal from './AddTaskModal'
export default {
    name: 'CaseDetails',
    components: {
        AddObservableModal,
        AddTaskModal
    },
    props: {
        observable_fields: {
            type: Array,
            default () {
            return ['value', 'ioc', 'spotted', 'dataType', 'tags', 'actions']
            }
        },
        event_fields: {
            type: Array,
            default() {
                return ['title','status','severity','observable_count','tags','actions']
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
            case_data: {},
            loading: true,
            cardCollapse: true,
            collapse_comments: true,
            collapse_observables: true,
            collapse_events: true,
            collapse: {},
            toggleCollapse: true,
            deleteCaseModal: false,
            addObservableModal: false,
            caseTemplateModal: false,
            addObservableModal: false,
            caseObservableModal: false,
            runPlaybookModal: false,
            deleteCaseModal: false,
            caseTaskModal: false,
            dismissalComment: "",
            dismissalReason: null
        }
    },
    created() {
        this.$store.dispatch('getCase', this.$route.params.uuid).then(resp => {
            this.case_data = resp.data
            let {cases} = this.case_data
            for(const c in cases) {
                let uuid = cases[c].uuid
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
        },
        observableAccent(tlp) {
            if(tlp == 3){ 
                return {'danger-accent': true}
            }
            switch (tlp) {
                case 1: return {"success-accent":true};
                case 2: return {"warning-accent":true};
                case 3: return {"danger-accent":true};
                default: return {"success-accent":true};
            }
        },
        onHighlight(text) {
            console.log('highlight', text)
        },
        onShare(text) {
            console.log('share', text)
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
