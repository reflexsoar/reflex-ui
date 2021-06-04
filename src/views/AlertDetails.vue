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
                    <h3>{{event.title | truncate}}</h3>
                </CCol>
                <CCol col="12" lg="6" sm="12" class="text-right">
                    <CButtonGroup>
                        <CDropdown 
                        toggler-text="Actions" 
                        color="secondary"
                        >
                        <CDropdownItem v-if="!event.case" @click="dismissEventModal = !dismissEventModal">Dismiss Event</CDropdownItem>
                        <CDropdownItem @click="runPlaybookModal = !runPlaybookModal">Run Playbook</CDropdownItem>
                        <CDropdownItem v-if="!event.case" @click="mergeIntoCaseModal = !mergeIntoCaseModal">Merge into Case</CDropdownItem>
                        <CDropdownItem v-if="!event.case" @click="createCaseModal = !createCaseModal">Create Case</CDropdownItem>
                        <CDropdownDivider/>
                        <CDropdownItem @click="deleteEventModal = !deleteEventModal">Delete</CDropdownItem>
                        </CDropdown>
                        <CButton v-if="event.case" :to="`/cases/${event.case}`" color="success">ViewCase</CButton>
                    </CButtonGroup>
                </CCol>
                
            </CRow>
            <CRow>
                <CCol col="12" lg="10" sm="12">{{event.description}}<br><br></CCol>
            </CRow>
            <CRow>
                <CCol col="12" lg="6" sm="12" style="margin-top:5px;"><li style="display: inline; margin-right: 2px;" v-for="tag in event.tags" :key="tag"><CButton color="primary" size="sm" disabled="">{{ tag }}</CButton></li></CCol>
            </CRow>
        </CCardHeader>
        <CCardBody>
            <CRow>
                <CCol col="6">
                    <label>Source: </label> Elasticsearch<br>
                    <label>Created: </label> {{event.created_at | moment('LLLL')}}<br>
                    <label>Updated: </label> {{event.modified_at | moment('from', 'now')}}
                </CCol>
                <CCol col="6" class="text-right">
                    <label>Event Signature: </label>&nbsp;{{event.signature}}<br>
                    <label>Status: </label>&nbsp;{{event.status.name}}
                </CCol>
            </CRow>
        </CCardBody>
    </CCard>
    <CCard class="shadow-sm bg-white rounded" >
        <CCardHeader style="border-bottom:none;">
            <CRow >
                <CCol col="12" lg="12" sm="12" class="text-left">
                    <b @click="collapse_observables = !collapse_observables" style='display: inline-block'>Observables</b>
                </CCol>
            </CRow>
        </CCardHeader>
        <CCollapse :show="collapse_observables">
            <CDataTable
                :hover="hover"
                :items="event.observables"
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
                <template #ioc="{item}">
                    <td>
                        <CSwitch style="padding-top:3px" color="danger" label-on="Yes" label-off="No" :checked.sync="item.ioc" disabled/>
                    </td>
                </template>
                <template #spotted="{item}">
                    <td>
                        <CSwitch style="padding-top:3px" color="danger" label-on="Yes" label-off="No" :checked.sync="item.spotted"/>
                    </td>
                </template>
                <template #safe="{item}">
                    <td>
                        <CSwitch style="padding-top:3px" color="success" label-on="Yes" label-off="No" :checked.sync="item.safe"/>
                    </td>
                </template>
                <template #dataType="{item}">
                    <td>
                        {{item.data_type | defang}}
                    </td>
                </template>                
                <template #tags="{item}">
                    <td>
                        <li style="display: inline; margin-right: 2px;" v-for="tag in item.tags" :key="tag"><CButton color="primary" size="sm" disabled>{{ tag }}</CButton></li>
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
                <CCol col="12" class="bg-dark pre-formatted raw_log">{{jsonify(event.raw_log)}}</CCol>
            </CRow>
        </CCardBody></CCollapse>
    </CCard>
  </CCol>
  <CModal title="Dismiss Event" color="danger" :centered="true" size="lg" :show.sync="dismissEventModal">
      <div>
        <p>Dismissing an event indicates that no action is required.  For transparency purposes, it is best to leave a comment as to why this event is being dismissed.  Fill out the comment field below.</p>
        <CForm id="dismissEventForm" @submit.prevent="dismissEvent()">
            <CRow>
                <CCol><br>
            <CSelect :reset-on-options-change='true' placeholder="Select a reason for dismissing the event..." :options="close_reasons" :value="dismissalReason" @change="dismissalReason = $event.target.value" label="Reason"/>
            <CTextarea
                placeholder="Enter a comment as to why this Event is being dismissed."
                v-bind:required="settings.require_event_dismiss_comment"
                :value="dismissalComment"
                @change="dismissalComment = $event"
                label="Comment"
                rows=5
            >
            </CTextarea>            
                </CCol>
            </CRow>
        </CForm>
      </div>
      <template #footer>
        <CButton type="submit" form="dismissEventForm" color="danger">Dismiss Event</CButton>
      </template>
    </CModal>
    <CModal title="Run Playbook" color="dark" :centered="true" size="lg" :show.sync="runPlaybookModal">
      <div>
        You can manually execute a playbook against this Event. Select a playbook from the list below and click Execute.
        <CForm>
            <CRow>
                <CCol><br>
                <CSelect
                label="Playbook"
                horizontal
                :options="['Enrich','Remediate','Escalate']"
                placeholder="Please select"
              />
                </CCol>
            </CRow>
        </CForm>
      </div>
      <template #footer>
        <CButton @click="runPlaybook()" color="primary">Execute</CButton>
      </template>
    </CModal>
    <CModal title="Delete Event" color="danger" :centered="true" size="lg" :show.sync="deleteEventModal">
      <div>
        Deleting an event is a permanent action, are you sure you want to continue?
      </div>
      <template #footer>
          <CButton @click="deleteEventModal = !deleteEventModal" color="secondary">Dismiss</CButton>
        <CButton @click="deleteEvent()" color="danger">Delete</CButton>
      </template>
    </CModal>
    <CreateCaseModal :show.sync="createCaseModal" :events="[event.uuid]"></CreateCaseModal>
    <MergeEventIntoCaseModal :show.sync="mergeIntoCaseModal" :events="[event.uuid]"></MergeEventIntoCaseModal>
  </CRow>
</template>

<script>
import {mapState} from "vuex";
import hoverselect from './HoverSelect'
import CreateCaseModal from './CreateCaseModal'
import MergeEventIntoCaseModal from './MergeEventIntoCaseModal'
export default {
    name: 'EventDetails',
    components: {
        hoverselect,
        CreateCaseModal,
        MergeEventIntoCaseModal
    },
    computed: mapState(['settings']),
    props: {
        observable_fields: {
            type: Array,
            default () {
            return ['value', 'ioc', 'spotted', 'safe', 'dataType', 'tags']
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
            event: {},
            loading: true,
            cardCollapse: true,
            collapse_raw_log: true,
            collapse_observables: true,
            collapse: {},
            toggleCollapse: true,
            dismissEventModal: false,
            runPlaybookModal: false,
            deleteEventModal: false,
            dismissalComment: "",
            dismissalReason: null,
            createCaseModal: false,
            mergeIntoCaseModal: false,
            close_reason: []
        }
    },
    created() {
        this.$store.dispatch('getEvent', this.$route.params.uuid).then(resp => {
            this.event = resp.data
            let {events} = this.event
            for(const event in events) {
                let uuid = events[event].uuid
                this.$set(this.collapse, uuid, true)
            }
            this.loading = false
        })
        this.loadCloseReasons()
    },
    methods: {
        jsonify(s) {
            try {
                return JSON.parse(s)
            } catch (e) {
                return s
            }
        },
        loadCloseReasons() {
            this.$store.dispatch('getCloseReasons').then(resp => {
                this.close_reasons = this.$store.getters.close_reasons.map((reason) => { return {label: reason.title, value: reason.uuid}})
            })
        },
        dismissEvent() {
            
            let data = {          
                dismiss_reason_uuid: this.dismissalReason,
                dismiss_comment: this.dismissalComment
            }
            this.$store.dispatch('updateEvent', {uuid: this.uuid, data}).then(resp => {
                this.event = this.$store.getters.event
            })
            this.dismissEventModal = false
            this.dismissalComment = ""
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
        },
        observableAccent(tlp) {
            if(tlp == 3){ 
                return {'danger-accent': true}
            }
            switch (tlp) {
                case 0: return {"success-accent":true};
                case 1: return {"warning-accent":true};
                case 2: return {"danger-accent":true};
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
