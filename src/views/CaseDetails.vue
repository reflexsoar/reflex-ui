<template>
  <CRow>
    <CCol col v-if="loading"><link rel="stylesheet" href="https://unpkg.com/vue-multiselect@2.1.0/dist/vue-multiselect.min.css">
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
                    <h3 style="margin-bottom:0px;">
                    <CButton v-if="case_data.severity == 1" color="light">Low</CButton>
                    <CButton v-if="case_data.severity == 2" color="warning">Medium</CButton>
                    <CButton v-if="case_data.severity == 3" color="danger">High</CButton>
                    <CButton v-if="case_data.severity >= 4" color="dark">Critical</CButton>&nbsp;#{{case_data.id}} - {{case_data.title | truncate}} <span v-if="case_data.status.closed"> - Closed</span></h3>
                </CCol>
                <CCol col="12" lg="6" sm="12" class="text-right">
                        <CDropdown 
                        toggler-text="Actions" 
                        color="secondary"
                        v-bind:disabled="case_data.status.closed"
                        >
                        <CDropdownItem @click="caseTemplateModal = !caseTemplateModal">Add Case Template</CDropdownItem>
                        <CDropdownItem @click="caseTaskModal = !caseTaskModal">Add Task</CDropdownItem>
                        <CDropdownItem @click="addObservableModal = !addObservableModal">Add Observables</CDropdownItem>
                        <CDropdownItem @click="runPlaybookModal = !runPlaybookModal">Run Playbook</CDropdownItem>
                        <CDropdownDivider/>
                        <CDropdownItem @click="deleteCaseModal = !deleteCaseModal">Delete</CDropdownItem>
                        </CDropdown>
                </CCol>
            </CRow>
        </CCardHeader>
        <CCardBody>
            <CRow>
                <CCol col="6">
                    <b>Created: </b>{{case_data.created_at | moment('LLLL')}}&nbsp;<b>Updated: </b>{{case_data.modified_at | moment('from', 'now')}}&nbsp;<b>Created By: </b>{{case_data.created_by.username}}&nbsp;<b>Updated By: </b>{{case_data.updated_by.username}}
                </CCol>
                <CCol col="6" class="text-right">
                    <li style="display: inline; margin-right: 2px;" v-for="tag in case_data.tags" :key="tag.name"><CButton color="primary" size="sm" disabled="">{{ tag.name }}</CButton></li>
                </CCol>
            </CRow>
        </CCardBody>
    </CCard>
    <CCard>
          <CCardBody class="tabbed">
            <CTabs>
              <CTab title="Case Details" active>
                  <CCardBody>
                    <CRow>
                        <CCol col="3" style="border-right: 1px dotted #cfcfcf;">
                            <CSelect label="Status" :options="case_statuses" :value.sync="case_data.status_uuid" @change="updateStatus()"></CSelect>
                            <label>Assignee</label>
                            <div role="group" class="form-group">
                                <multiselect 
                                    v-model="assignee" 
                                    label="username" 
                                    :options="users" 
                                    track-by="username" 
                                    :searchable="true"
                                    :internal-search="false"
                                    :options-limit="25"
                                    :show-no-results="false"
                                    v-bind:disabled="case_data.status.closed" 
                                    @search-change="usersFind">
                                </multiselect>
                            </div>
                            <CSelect label="Severity" :value.sync="case_data.severity" :options="severities" @change="updateSeverity()" v-bind:disabled="case_data.status.closed"></CSelect>
                        </CCol>
                        <CCol col="9" @mouseover="edit_description_hint = true" @mouseleave="edit_description_hint = false">
                            <h5>Description <small><a v-if="edit_description_hint && !case_data.status.closed" @click="edit_description = !edit_description">edit</a></small></h5>
                            <p v-if="!edit_description"><vue-markdown>{{case_data.description}}</vue-markdown></p>
                            <span v-if="edit_description"><CTextarea rows="10" v-model="case_data.description"></CTextarea><CButton color="danger" @click="edit_description = false">Cancel</CButton>&nbsp;<CButton color="primary" @click="saveDescription()">Save</CButton></span>
                            
                        </CCol>
                    </CRow>
                    <CRow style="border-top: 1px dotted #cfcfcf; padding-top:10px; margin-top: 10px;">
                        <CCol col="12" style="border-right: 1px dotted #cfcfcf;">
                            <h5>Metrics</h5>
                            <CRow>
                                <CCol col="3">
                                    <CWidgetSimple header="Total Observables" :text="String(case_data.observables.length)">
                                    </CWidgetSimple>
                                </CCol>
                                <CCol col="3">
                                    <CWidgetSimple header="Total Events" :text="String(case_data.events.length)">
                                    </CWidgetSimple>
                                </CCol>
                                <CCol col="3">
                                    <CWidgetSimple header="Time Open" :text="daysOpen()">
                                    </CWidgetSimple>
                                </CCol>
                                 <CCol col="3">
                                    <CWidgetSimple header="SLA Status" text="Okay">
                                    </CWidgetSimple>
                                </CCol>
                            </CRow>
                        </CCol>
                    </CRow>
                  </CCardBody>
              </CTab>
              <CTab title="Observables">
                <ObservableList :observables="case_data.observables" :events="case_data.events"></ObservableList>
              </CTab>
              <CTab title="Events">
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
                    <td style="min-width:200px; max-width:300px;">
                        <router-link :to="`/alerts/${item.uuid}`">{{item.title}}</router-link><br>
                        <li style="display: inline; margin-right: 2px;" v-for="tag in item.tags" :key="tag.name">
                            <CBadge color="info" size="sm" style="padding: 5px; margin-top:10px; margin-right:3px;">{{ tag.name }}</CBadge>
                        </li>
                    </td>
                </template>
                <template #status="{item}">
                    <td >{{item.status.name}}</td>
                </template>
                <template #tlp="{item}">
                    <td>
                    <CButton v-if="item.tlp == 1" color="light" size="sm">TLP:WHITE</CButton>
                    <CButton v-if="item.tlp == 2" color="success" size="sm">TLP:GREEN</CButton>
                    <CButton v-if="item.tlp == 3" color="warning" size="sm">TLP:AMBER</CButton>
                    <CButton v-if="item.tlp >= 4" color="danger" size="sm">TLP:RED</CButton>
                </td>
                </template>
                <template #severity="{item}">
                    <td>
                    <CButton v-if="item.severity == 1" color="light" size="sm">L</CButton>
                    <CButton v-if="item.severity == 2" color="warning" size="sm">M</CButton>
                    <CButton v-if="item.severity == 3" color="danger" size="sm">H</CButton>
                    <CButton v-if="item.severity >= 4" color="dark" size="sm">C</CButton>
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
              </CTab>
              <CTab title="Tasks">
                <CaseTaskList :tasks="case_data.tasks"></CaseTaskList>
              </CTab>
              <CTab title="Attachments">
                 Case attachments here
              </CTab>
              <CTab title="Comments">
                  <Comments :comments="case_data.comments" :uuid="case_data.uuid" comment_type="case"></Comments>                             
              </CTab>
              <CTab title="History">
                  <div style="overflow-y:scroll; overflow-x:hidden; max-height:400px">
                 <timeline>
                    <timeline-item bg-color="#9dd8e0"><small>{{case_data.created_at | moment('LLLL')}}</small><br>Case Opened by <b>{{case_data.created_by.username}}</b></timeline-item>
                    <timeline-item bg-color="#9dd8e0" style="padding-bottom:5px;" v-for="entry in case_data.history" :hollow="true" :key="entry.uuid"><small>{{entry.created_at | moment('LLLL')}}</small><vue-markdown style="margin-bottom:0px;">{{entry.message}} by *{{entry.created_by.username}}*</vue-markdown></timeline-item>
                </timeline>
                  </div>
              </CTab>
              <CTab title="Playbook/Action Output" class="bg-dark">
                 <div class="bg-dark console-output">
                     <code class="bg-dark pre-formatted raw_log">2020-09-13 20:33:50,591 - Extracting ZIP file<br>2020-09-13 20:33:50,593 - Running test plugin!<br>2020-09-13 20:33:54,716 - Running agent<br>2020-09-13 20:34:28,846 - Running agent<br>2020-09-13 20:34:28,847 - Running input ES_PROD<br>2020-09-13 20:34:28,847 - Fetching credentials for ES_PROD<br>2020-09-13 20:34:33,124 - RUNNING ELASTICSEARCH PLUGIN<br>2020-09-13 20:34:33,150 - POST https://localhost:9200/.siem-signals-*/_search [status:200 request:0.025s]<br>2020-09-13 20:34:33,154 - Pushing 26 events to bulk ingest...<br>2020-09-13 20:35:12,878 - Running agent<br>2020-09-13 20:35:12,879 - Running input ES_PROD<br>2020-09-13 20:35:12,879 - Fetching credentials for ES_PROD<br>2020-09-13 20:35:17,060 - RUNNING ELASTICSEARCH PLUGIN<br>2020-09-13 20:35:17,085 - POST https://localhost:9200/.siem-signals-*/_search [status:200 request:0.024s]<br>2020-09-13 20:35:17,089 - Pushing 26 events to bulk ingest...</code>
                 </div>
              </CTab>
            </CTabs>
          </CCardBody>
        </CCard>
    <AddObservableModal :case_data.sync="case_data" :show.sync="addObservableModal" :uuid="case_data.uuid" ></AddObservableModal>
    <AddTaskModal :show.sync="caseTaskModal" :case_uuid="this.uuid" :task_count.sync="case_data.tasks.length"></AddTaskModal>
  </CCol>
  </CRow>
</template>

<script>
import {mapState} from "vuex";
import AddObservableModal from './AddObservableModal'
import ObservableList from './ObservableList'
import CaseTaskList from './CaseTaskList'
import AddTaskModal from './AddTaskModal'
import Comments from './Comments'
import { Timeline, TimelineItem, TimelineTitle } from 'vue-cute-timeline'
import { Mentionable } from 'vue-mention'
import moment from 'moment';
export default {
    name: 'CaseDetails',
    components: {
        AddObservableModal,
        ObservableList,
        CaseTaskList,
        AddTaskModal,
        Timeline,
        TimelineItem,
        TimelineTitle,
        Mentionable,
        Comments
    },
    props: {
        event_fields: {
            type: Array,
            default() {
                return ['title','status','severity','observable_count','actions']
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
            dismissalReason: null,
            edit_description_hint: false,
            edit_description: false,
            lockCase: false,
            users: [],
            assignee: null,
            comment: "",
            comments: [],
            tasks: [],
            collapse_tasks: Array(),
            case_statuses: [],
            severities: [
                {
                    'label': 'Low',
                    'value': 1
                },
                {
                    'label': 'Medium',
                    'value': 2
                },
                {
                    'label': 'High',
                    'value': 3
                },
                {
                    'label': 'Critical',
                    'value': 4
                }
            ]
        }
    },
    beforeCreate() {
        this.$store.dispatch('getCase', this.$route.params.uuid).then(resp => {
            this.case_data = resp.data
            this.loading = false
        })

        this.$store.dispatch('getCaseStatus').then(resp => {
            this.case_statuses = resp.data.map(function(status) {
                return {'value': status.uuid, 'label': status.name}
            })
        })

        for(let task in this.tasks) {
            this.collapse_tasks[this.tasks[task].order] = false;
        }
    },
    watch: {
        assignee: function() {
            this.updateAssignee(this.assignee.uuid)
        }
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
        updateSeverity() {
            let uuid = this.uuid
            let severity = {"severity": this.case_data.severity}
            this.$store.dispatch('updateCase', {uuid, data: severity}).then(resp => {
                this.case_data = resp.data
            })
        },
        updateStatus() {
            let uuid = this.uuid
            let status = {"status_uuid": this.case_data.status_uuid}
            this.$store.dispatch('updateCase', {uuid, data: status}).then(resp => {
                this.case_data = resp.data
            })
        },
        saveDescription() {
            let uuid = this.uuid
            let description = {"description": this.case_data.description}
            this.$store.dispatch('updateCase', {uuid, data: description}).then(resp => {
                this.case_data = resp.data
            })
            this.edit_description = false
        },
        updateAssignee(assignee_uuid) {
            let uuid = this.uuid
            let assignee = {"owner_uuid": assignee_uuid}
            this.$store.dispatch('updateCase', {uuid, data: assignee}).then(resp => {
                this.case_data = resp.data
            })
            this.edit_description = false
        },
        usersFind(query) {
            this.$store.dispatch('getUsersByName', query).then(resp => {
                this.users = resp.data
            })
        },
        collapseAll() {
            for(const c in this.collapse) {
                if(this.collapse[c]) {
                    this.collapse[c] = false
                }                
            }
            this.toggleCollapse = true
        },
        onHighlight(text) {
            console.log('highlight', text)
        },
        onShare(text) {
            console.log('share', text)
        },
        daysOpen() {
            return String(moment().diff(this.case_data.created_at,'days'))+" days"
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
            let maxLength = 50
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
