<template>
  <CRow>
    <CCol col="12">
      <h2>Events</h2>
      <CRow>
        <CCol col="12">
          <CAlert :show.sync="alert.show" :color="alert.type" closeButton>
            {{alert.message}}
          </CAlert>
        </CCol>
      </CRow>
      <CRow>
        <CCol col="12">
          <CCard>
            <CCardHeader>
              <CRow>
                <CCol col="10">
                  <li style="display: inline; margin-right: 2px;" v-for="obs in observableFilters" :key="obs.value"><CButton color="secondary" class="tag"  size="sm" @click="toggleObservableFilter({'dataType': obs.dataType.name, 'value': obs.value})"><b>{{obs.dataType}}</b>: <span v-if="obs.filter_type == 'severity'">{{getSeverityText(obs.value).toLowerCase()}}</span><span v-else>{{ obs.value }}</span></CButton></li><span v-if="!filteredBySignature() && observableFilters.length > 0"><span class="separator">|</span>Showing {{filtered_events.length}} grouped events.</span><span v-if="filteredBySignature() && observableFilters.length != 0"><span class="separator" v-if="filteredBySignature() && observableFilters.length != 0">|</span>Showing {{filtered_events.length}} events.</span><span v-if="observableFilters.length == 0">Showing {{filtered_events.length}} grouped events.</span>
                </CCol>
                <CCol col="2" class="text-right">
                  <CButton @click="quick_filters = !quick_filters" color="info" size="sm">Quick Filters</CButton>
                </CCol>
              </CRow>
            </CCardHeader>
            <CCollapse :show="quick_filters">
              <CNav variant="tabs" :justified="true">
                <CNavItem>
                  <div @click="toggleObservableFilter({'filter_type': 'status', 'dataType':'status','value':'New'})">
                    <h1>{{eventCountByStatus('New')}}</h1>
                    New
                  </div>
                </CNavItem>
                <CNavItem>
                  <div @click="toggleObservableFilter({'filter_type': 'status', 'dataType':'status','value':'Open'})">
                    <h1>{{eventCountByStatus('Open')}}</h1>
                    Open
                  </div>
                </CNavItem>
                <CNavItem>
                  <div @click="toggleObservableFilter({'filter_type': 'status', 'dataType':'status','value':'Closed'})">
                    <h1>{{eventCountByStatus('Closed')}}</h1>
                    Closed
                  </div>
                </CNavItem>
                <CNavItem>
                  <div @click="toggleObservableFilter({'filter_type': 'status', 'dataType':'status','value':'Dismissed'})">
                    <h1>{{eventCountByStatus('Dismissed')}}</h1>
                    Dismissed
                  </div>
                </CNavItem>
                <CNavItem>
                  <div @click="toggleObservableFilter({'filter_type': 'severity', 'dataType':'severity','value':3})">
                    <h1>{{eventCountBySeverity(3)}}</h1>
                    Critical
                  </div>
                </CNavItem>
                <CNavItem>
                  <div @click="toggleObservableFilter({'filter_type': 'severity', 'dataType':'severity','value':2})">
                    <h1>{{eventCountBySeverity(2)}}</h1>
                    High
                  </div>
                </CNavItem>
                <CNavItem>
                  <div @click="toggleObservableFilter({'filter_type': 'severity', 'dataType':'severity','value':1})">
                    <h1>{{eventCountBySeverity(1)}}</h1>
                    Medium
                  </div>
                </CNavItem>
                <CNavItem>
                  <div @click="toggleObservableFilter({'filter_type': 'severity', 'dataType':'severity','value':0})">
                    <h1>{{eventCountBySeverity(0)}}</h1>
                    Low
                  </div>
                </CNavItem>
              </CNav>
            </CCollapse>
          </CCard>
        </CCol>
      </CRow>
      <CRow>
        <CCol col="2">
            <div>
              <CButton v-if="select_all || selected.length != 0 && !filteredBySignature()" @click="clearSelected()" style="margin-top: -5px" size="sm" color="secondary"><CIcon name="cilXCircle" size="sm"></CIcon></CButton><CButton style="margin-top: -5px" v-if="!select_all && selected.length == 0 || filteredBySignature()" @click="selectAll()" size="sm" color="secondary"><CIcon name="cilCheck"></CIcon></CButton>&nbsp;&nbsp;<CSelect :options="['Severity','Date Created','Name','TLP','Observable Count']" placeholder="Sort by" class="d-inline-block"/>
            </div>
        </CCol>
        <CCol col="4">
          <center><CPagination v-if="!table_view" :activePage.sync="current_page" :pages="page_data.pages"/></center>
        </CCol>
        <CCol col="3" class="text-right">
          <CInput placeholder="Search" v-model="search_filter"><template #append>
            <CButton color="secondary" @click="toggleObservableFilter({'filter_type':'search','dataType':'search','value':search_filter})">Search</CButton>
          </template></CInput>
        </CCol>
        <CCol col="3" class="text-right">
          <div>
            <CButton v-if="!table_view" @click="setColumns()" color="secondary" class="d-inline-block"><small><CIcon name='cilColumns' size="sm"></CIcon></small></CButton>&nbsp;<CButton color="secondary" @click="table_view = !table_view"  class="d-inline-block"><span v-if="table_view">Card</span><span v-else>Table</span> View</CButton>&nbsp;
            <CDropdown 
                :toggler-text="`${selected.length} events`" 
                color="secondary"
                v-bind:disabled="selected.length == 0"
                class='d-inline-block'
            >
                <CDropdownItem @click="dismissEventModal = !dismissEventModal">Dismiss Event</CDropdownItem>
                <CDropdownItem @click="runPlaybookModal = !runPlaybookModal">Run Playbook</CDropdownItem>
                <CDropdownItem @click="createCaseModal = !createCaseModal">Create Case</CDropdownItem>
                <CDropdownItem @click="mergeIntoCaseModal = !mergeIntoCaseModal">Merge into Case</CDropdownItem>
                <CDropdownDivider/>
                <CDropdownItem @click="deleteEventModal = !deleteEventModal">Delete</CDropdownItem>
            </CDropdown>
          </div>
        </CCol>
      </CRow>
      <CRow col v-if="status == 'loading'">
        <CCol col="12">
        <div style="margin: auto; text-align:center; verticle-align:middle;">
           <CSpinner
                color="dark"
                style="width:6rem;height:6rem;"
            />
        </div>
        </CCol>
      </CRow>           
      <CRow v-else-if="filtered_events.length == 0">
      <CCol col="12" class='text-center'>
          <h1>No Events</h1>
        </CCol>
      </CRow>
      <CRow v-else-if="table_view">
        <CCol col="12">
        <CCard>
          <CCardBody>
            <CDataTable
                  :items="filtered_events"
                  :fields="fields"
                  items-per-page-select
                  :items-per-page="10"
                  :striped="true"
                  :sorter='{resetable:true}'
                  pagination
              >
              <template #name="{item}">
                  <td>
                      <input v-if="!item.case_uuid" type="checkbox" :value="item.uuid" v-model="selected"/>&nbsp;<a @click="toggleObservableFilter({'filter_type':'title','dataType':'title','value':item.title})">{{item.title}}</a><br>
                      <CIcon name="cilTags"/>&nbsp;<li style="display: inline; margin-right: 2px;" v-for="tag in item.tags" :key="tag.name"><CButton @click="toggleObservableFilter({'filter_type': 'tag', 'dataType':'tag', 'value':tag.name})" color="dark" class="tag" size="sm">{{ tag.name }}</CButton></li>
                  </td>
              </template>
              <template #reference="{item}">
                <td><span v-c-tooltip="{
        content: `${item.reference}`,
        placement: 'top'
      }">{{item.reference | truncate}}</span></td>
              </template>
              <template #created_at="{item}">
                  <td>
                      {{item.created_at | moment('from', 'now')}}
                  </td>
              </template>
              <template #related_events="{item}">
                <td>
                  <CButton class="tag" @click="toggleObservableFilter({'filter_type':'eventsig','dataType':'signature','value':item.signature})" v-if="!filteredBySignature" color="dark" size="sm">{{event.related_events_count}} occurences</CButton>
                </td>
              </template>
              <template #status="{item}">
                <td>
                  {{item.status.name}}
                </td>
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
              </CDataTable>
          </CCardBody>
        </CCard>
        </CCol>
      </CRow>
      <CRow v-else>
        <CCol :col="12/columns" v-for="(event, index) in filtered_events" :key="event.uuid">
          <CCard :accent-color="getSeverityColor(event.severity)">
            <CCardBody>
              <CRow>
                <CCol col="9">
                  <h4>
                    <input type="checkbox" v-if="!event.case_uuid" v-bind:checked="selected.includes(event.uuid)" :value="event.uuid" @change="selectEvents($event)"/>
                    &nbsp;<a @click="toggleObservableFilter({'filter_type':'title','dataType':'title','value':event.title})">{{event.title}}</a></h4>
                  {{event.description}}<br>
                  <li style="display: inline; margin-right: 2px;" v-for="obs in event.observables" :key="obs.uuid"><CButton color="secondary" class="tag"  size="sm" style="margin-top:5px; margin-bottom:0px;" @click="toggleObservableFilter({'filter_type':'observable', 'dataType': obs.dataType.name, 'value': obs.value})"><b>{{obs.dataType.name}}</b>: {{ obs.value.toLowerCase() }}</CButton></li>
                </CCol>
                <CCol col="3" class="text-right">
                  <CButtonGroup>
                    <CButton v-if="(event.new_related_events && event.new_related_events.length > 0 && !filteredBySignature()) || (filteredBySignature() && event.status.name == 'New')" size="sm" color="info" @click="createEventRule(event.signature)">Create Event Rule</CButton>
                    <CButton v-if="event.case_uuid" size="sm" color="secondary" :to="`/cases/${event.case_uuid}`">View Case</CButton>
                  </CButtonGroup>
                </CCol>
              </CRow>
            </CCardBody>
            <CCardFooter style="background-color:#f0f0f0;">
              <CRow>
                <CCol col="8">
                  <small>
                    <CButton @click="toggleObservableFilter({'filter_type':'severity', 'dataType':'severity', 'value':event.severity})" class="tag" :color="getSeverityColor(event.severity)" size="sm">{{getSeverityText(event.severity)}}</CButton>
                    <span v-if="!filteredBySignature() && event.related_events_count > 1" class="separator">|</span><CButton class="tag" @click="toggleObservableFilter({'filter_type':'eventsig','dataType':'signature','value':event.signature})" v-if="!filteredBySignature() && event.related_events_count > 1" color="dark" size="sm">{{event.related_events_count}} occurences <span v-if="event.new_related_events && event.new_related_events.length > 0"> | {{event.new_related_events.length}} open</span></span></CButton>
                    <span class="separator">|</span><CButton class="tag" @click="toggleObservableFilter({'filter_type':'status', 'dataType':'status', 'value': event.status.name})" size="sm" color="info">{{event.status.name}}</CButton>
                    <span class="separator">|</span>Created {{event.created_at | moment('LLLL') }}</span>
                    <span class="separator">|</span><b>Reference:</b> {{event.reference}}
                    <span class="separator">|</span><b>Event Sig:</b> <span @click="toggleObservableFilter({'filter_type':'eventsig','dataType':'signature','value':event.signature})">{{event.signature}}</span>
                    
                  </small>
                </CCol>
                <CCol col="4" class="text-right">
                  <CIcon name="cilTags"/>&nbsp;<li style="display: inline; margin-right: 2px;" v-for="tag in event.tags" :key="tag.name"><CButton @click="toggleObservableFilter({'filter_type': 'tag', 'dataType':'tag', 'value':tag.name})" color="dark" class="tag" size="sm">{{ tag.name }}</CButton></li>
                </CCol>
              </CRow>
            </CCardFooter>
          </CCard>
        </CCol>
      </CRow>
    </CCol>
    <CModal title="Dismiss Event" color="danger" :centered="true" size="lg" :show.sync="dismissEventModal">
      <div>
        <p>Dismissing an event indicates that no action is required.  For transparency purposes, it is best to leave a comment as to why this event is being dismissed.  Fill out the comment field below.</p>
        <p>This comment will apply to <b>{{selected.length}}</b> events.</p>
        <CForm>
            <CRow>
                <CCol><br>
            <CSelect :options="['False Positive','Alarm requires tuning','Administrative Activity']" v-model="dismissalReason" label="Reason"/>
            <CTextarea
                placeholder="Enter a comment as to why this Event is being dismissed."
                required
                v-model="dismissalComment"
                label="Comment"
                rows=5
            >
            </CTextarea>            
                </CCol>
            </CRow>
        </CForm>
      </div>
      <template #footer>
        <CButton @click="dismissEvent()" color="danger">Dismiss</CButton>
      </template>
    </CModal>
    <CreateCaseModal :show.sync="createCaseModal" :events="selected"></CreateCaseModal>
    <CreateEventRuleModal :show.sync="createEventRuleModal" :events="selected" :event_signature.sync="event_signature" :rule_observables="rule_observables"></CreateEventRuleModal>
    <MergeEventIntoCaseModal :show.sync="mergeIntoCaseModal" :events="selected"></MergeEventIntoCaseModal>
    <CModal title="Delete Event" color="danger" :centered="true" size="lg" :show.sync="deleteEventModal">
      <div>
        <p>Deleting an event is a permanent action, are you sure you want to continue?</p>
        <p>This action will apply to <b>{{selected.length}}</b> events.</p>
      </div>
      <template #footer>
          <CButton @click="deleteEventModal = !deleteEventModal" color="secondary">Dismiss</CButton>
        <CButton @click="deleteEvent()" color="danger">Delete</CButton>
      </template>
    </CModal>
  </CRow>
</template>

<style scoped>

.nav-item:not(:last-child) {
  border-right:1px solid #cfcfcf !important;
}

.nav-item h1 {
  font-weight: 400
}

.card {
  margin-bottom: 10px;
}

.card:not(:first-child) {
  border-bottom:0px;
  border-top:0px;
}

.card-body {
  padding-top: 10px;
  padding-bottom: 10px;
}

a {
  color: #3C4B64;
}

.separator {
  margin-left: 10px;
  margin-right: 10px;
}

</style>

<script>
import {mapState} from "vuex";
import {vSelect} from "vue-select";
import CreateCaseModal from './CreateCaseModal'
import MergeEventIntoCaseModal from './MergeEventIntoCaseModal'
import CreateEventRuleModal from './CreateEventRuleModal'
export default {
    name: 'Events',
    components: {
      CreateCaseModal,
      MergeEventIntoCaseModal,
      CreateEventRuleModal
    },
    props: {
    items: Array,
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
    event: false
    },
    computed: mapState(['status','alert']),
    created: function () {
        this.loadData()
        this.refresh = setInterval(function() {
         this.loadData()
        }.bind(this), 5000)
    },
    data(){
      return {
        name: "",
        description: "",
        severity: 0,
        tlp: 0,
        tag_list: [],
        selected_tags: [],
        observable_count: 0,
        tags: [],
        events: [],
        case_tlp: 2,
        case_severity: 1,
        use_case_template: false,
        dismissCountDown: 10,
        selected: Array(),
        mergeIntoCaseModal: false,
        dismissEventModal:false,
        deleteEventModal: false,
        createCaseModal: false,
        createEventRuleModal: false,
        dismissalComment: "",
        dismissalReason: null,
        collapse: {},
        observableFilters: [{'filter_type':'status','dataType':'status','value':'New'}],
        filtered_events: [],
        quick_filters: false,
        search_filter: '',
        table_view: false,
        select_all: false,
        fields: ['name', 'created_at', 'related_events', 'reference', 'status', 'severity', 'tlp', 'observable_count'],
        sort_by: 'date',
        event_signature: "",
        rule_observables: [],
        columns: 1,
        card_page_num: 1,
        card_per_page: 25,
        page_data: {},
        current_page: 1
      }
    },
    methods: {
      addSuccess: function() {
        if (this.$store.getters.addSuccess == 'success') {
          return true
        } else {
          return false
        }
      },
      unique_event_sigs() {
        
      },
      setColumns(){
        if(this.columns == 1) {
          this.columns = 2;
        } else {
          this.columns = 1
        }
      },
      eventCountByStatus(status) {
        return this.filtered_events.reduce(function(n, event) {
          if(event) {
            return n + (event.status.name == status)
          }          
        }, 0)
      },
      eventCountBySeverity(severity) {
        return this.filtered_events.reduce(function(n, event) {
          if(event) {
            return n + (event.severity == severity)
          }          
        }, 0)
      },
      selectEvents(event) {
        
        if(this.selected.some((item) => { return item === event.target.value })) {

          if(!this.filteredBySignature()) {
            this.selected = this.selected.filter(x => !this.selectedRelated(event.target.value).includes(x))
          } else {
            this.selected = this.selected.filter(item => item !== event.target.value)
          }

        } else {
          if(!this.filteredBySignature()) {
            this.selected = [...this.selected, ...this.selectedRelated(event.target.value)]
          } else {
            this.selected.push(event.target.value)
          }          
        }
      },
      createEventRule(signature) {
        this.selected = []
        this.event_signature = signature
        let source_event = this.filtered_events.filter((event) => event.signature == signature)
        this.selected = this.selectedRelated(source_event[0].uuid)
        this.rule_observables = this.filtered_events.filter((event) => 
            this.selected.includes(event.uuid)
          ).map(event => event.observables).flat().map( function(obs) { 
            return {'dataType':obs.dataType.name, 'value': obs.value
            }
          })
        let unique_observables = Array.from(new Set(this.rule_observables.map(a => a.value)))
        .map(value => {
          return this.rule_observables.find(a => a.value === value)
        })
        this.rule_observables = unique_observables
        this.createEventRuleModal = true
      },
      selectedRelated(uuid) {
        let source_event = this.filtered_events.filter((event) => { 
          return event.uuid == uuid 
        })
        return source_event[0].new_related_events
      },
      filteredBySignature() {
        if(this.observableFilters.some((filter) => filter.filter_type == 'eventsig')) {
          return true
        } else {
          return false
        }
      },
      filterEvents: function () {

        // Build the filters based on what is currently selected
        let status_filters = []
        let tag_filters = []
        let observables_filters = []
        let severity_filter = []
        let signature_filter = ""
        let grouped = !this.filteredBySignature()
        let search = ""
        for(let f in this.observableFilters) {
          let filter = this.observableFilters[f]

          if(filter.filter_type == 'eventsig') {
            signature_filter = filter.value
          }

          if(filter.filter_type == 'status') {
            status_filters.push(filter.value)
          }

          if(filter.filter_type == 'tag') {
            tag_filters.push(filter.value)
          }

          if(filter.filter_type == 'observable') {
            observables_filters.push(filter.value)
          }

          if(filter.filter_type == 'search') {
            search = filter.value
          }

          if(filter.filter_type == 'severity') {
            severity_filter.push(filter.value)
          }
        }

        this.$store.dispatch('getEvents', {
          signature: signature_filter,
          grouped: grouped,
          tags: tag_filters,
          status: status_filters,
          observables: observables_filters,
          severity: severity_filter,
          search: search,
          fields: '',
          page: this.current_page,
          page_size: 25
        }).then(resp => {
          this.filtered_events = resp.data.events
          this.page_data = resp.data.pagination
          this.$store.commit('add_success')
        })
      },
      transformFilter(filter) {
        /* Returns a filter in the way the API wants to see it */
        return {'field':filter['filter_type'],'value':filter['value']}
      },
      toggleObservableFilter(obs) {
        let exists = this.observableFilters.some((item) => {
          return item.value === obs.value
        })

        // Can only have one status filter at a time
        if(obs.filter_type == 'status') {
          this.observableFilters = this.observableFilters.filter(item => item.filter_type !== obs.filter_type)
        }

        if(!exists) {
          this.observableFilters.push(obs)
        } else {
          this.observableFilters = this.observableFilters.filter(item => item.value !== obs.value)
        }
        this.filterEvents()
      },
      relatedEvents(signature) {
        return this.events.filter((event) => event.signature === signature).length
      },
      countStatusBySignature(signature, status) {
        return this.events.filter((event) => event.signature === signature && event.status.name == status).length
      },
      loadData: function() {
        this.filterEvents()
      },
      selectAll() {
        //this.selected = [];
        if(!this.select_all) {
          for (let i in this.filtered_events) {
            let event = this.filtered_events[i]
            if(!this.filteredBySignature() && event.related_events_count > 1) {
              if(event.signature) {
                this.selected = [...this.selected, ...this.selectedRelated(event.uuid)]
              } else if (event.signature == null) {
                this.selected = [...this.selected, ...this.selectedRelated(event.uuid)]
              }
            } else {
              if(!event.case_uuid) {
                if(!this.selected.includes(event.uuid)) {
                  this.selected.push(event.uuid)
                }
              }
            }
          }
          if(!this.filteredBySignature()) {
            this.select_all = true
          }
        }
      },
      clearSelected() {
        this.selected = []
        this.select_all = false
      },
      getSeverityColor(severity) {
        switch(severity) {
          case 0: return 'dark';
          case 1: return 'info';
          case 2: return 'warning';
          case 3: return 'danger';
          default: return 'dark';
        }
      },
      getSeverityText(severity) {
        switch(severity) {
          case 0: return 'Low';
          case 1: return 'Medium';
          case 2: return 'High';
          case 3: return 'Critical';
          default: return 'Low';
        }
      }
    },
    beforeDestroy: function() {
      clearInterval(this.refresh)
    },
    watch: {
      current_page: function(){
        this.filterEvents()
      }
    },
    filters: {
      truncate: function (value) {
          let maxLength = 6
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
