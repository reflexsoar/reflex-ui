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
                <CCol col="9">
                  <li style="display: inline; margin-right: 2px;" v-for="obs in observableFilters" :key="obs.value"><CButton color="secondary" class="tag"  size="sm" @click="toggleObservableFilter({'data_type': obs.data_type, 'value': obs.value})"><b>{{obs.data_type}}</b>: <span v-if="obs.filter_type == 'severity'">{{getSeverityText(obs.value).toLowerCase()}}</span><span v-else>{{ obs.value | truncate }}</span></CButton></li><span v-if="!filteredBySignature() && observableFilters.length > 0"><span class="separator">|</span>Showing {{filtered_events ? filtered_events.length : 0  }} grouped events.</span><span v-if="filteredBySignature() && observableFilters.length != 0"><span class="separator" v-if="filteredBySignature() && observableFilters.length != 0">|</span>Showing {{filtered_events ? filtered_events.length : 0}} events.</span><span v-if="observableFilters.length == 0">Showing {{filtered_events.length}} grouped events.</span>
                </CCol>
                <CCol col="3" class="text-right">
                  <CButton @click="quick_filters = !quick_filters" color="info" size="sm">Quick Filters</CButton>&nbsp;<CButton @click="advanced_filter = !advanced_filter" color="info" size="sm">Advanced Filter</CButton>&nbsp;<CButton size="sm" color="info" to="/event_rules" style='color:#fff'>Manage Event Rules</CButton>
                </CCol>
              </CRow>
            </CCardHeader>
            <CCollapse :show="quick_filters">
              <CNav variant="tabs" :justified="true">
                <CNavItem>
                  <div @click="toggleObservableFilter({'filter_type': 'status', 'data_type':'status','value':'New'})">
                    <h1>{{eventCountByStatus('New')}}</h1>
                    New
                  </div>
                </CNavItem>
                <CNavItem>
                  <div @click="toggleObservableFilter({'filter_type': 'status', 'data_type':'status','value':'Open'})">
                    <h1>{{eventCountByStatus('Open')}}</h1>
                    Open
                  </div>
                </CNavItem>
                <CNavItem>
                  <div @click="toggleObservableFilter({'filter_type': 'status', 'data_type':'status','value':'Closed'})">
                    <h1>{{eventCountByStatus('Closed')}}</h1>
                    Closed
                  </div>
                </CNavItem>
                <CNavItem>
                  <div @click="toggleObservableFilter({'filter_type': 'status', 'data_type':'status','value':'Dismissed'})">
                    <h1>{{eventCountByStatus('Dismissed')}}</h1>
                    Dismissed
                  </div>
                </CNavItem>
                <CNavItem>
                  <div @click="toggleObservableFilter({'filter_type': 'severity', 'data_type':'severity','value':3})">
                    <h1>{{eventCountBySeverity(3)}}</h1>
                    Critical
                  </div>
                </CNavItem>
                <CNavItem>
                  <div @click="toggleObservableFilter({'filter_type': 'severity', 'data_type':'severity','value':2})">
                    <h1>{{eventCountBySeverity(2)}}</h1>
                    High
                  </div>
                </CNavItem>
                <CNavItem>
                  <div @click="toggleObservableFilter({'filter_type': 'severity', 'data_type':'severity','value':1})">
                    <h1>{{eventCountBySeverity(1)}}</h1>
                    Medium
                  </div>
                </CNavItem>
                <CNavItem>
                  <div @click="toggleObservableFilter({'filter_type': 'severity', 'data_type':'severity','value':0})">
                    <h1>{{eventCountBySeverity(0)}}</h1>
                    Low
                  </div>
                </CNavItem>
              </CNav>
            </CCollapse>
            <CCollapse :show="advanced_filter">
                <CCardBody>
                  <b>Advanced Filtering</b>
                  <p>Apply an RQL rule to create additional filtering on returned events.</p>
                  <prism-editor class="my-editor" v-model="advanced_query" :highlight="highlighter" line-numbers></prism-editor><br>
                  <CButton @click="toggleObservableFilter({'filter_type': 'rql', 'data_type':'rql', 'value': advanced_query})" color="primary" size="sm">Filter</CButton>
                </CCardBody>
            </CCollapse>
          </CCard>
        </CCol>
      </CRow>
      <CRow>
        <CCol col="3">
            <div>
              <CButton v-if="select_all || selected.length != 0 && !filteredBySignature()" @click="clearSelected()" style="margin-top: -5px" size="sm" color="secondary"><CIcon name="cilXCircle" size="sm"></CIcon></CButton><CButton style="margin-top: -5px" v-if="!select_all && selected.length == 0 || filteredBySignature()" @click="selectAllNew()" size="sm" color="secondary"><CIcon name="cilCheck"></CIcon></CButton>&nbsp;&nbsp;<CSelect :options="sort_options" placeholder="Sort by" :value="sort_by" @change="sort_by = $event.target.value; filterEvents()" class="d-inline-block"/>&nbsp;<CSelect class="d-inline-block" placeholder="Events per Page" :options="[10,25,50,100]" @change="card_per_page = $event.target.value; filterEvents()"/>
            </div>
        </CCol>
        <CCol col="3">
          <center><CPagination :activePage.sync="current_page" :pages="page_data.pages"/></center>
        </CCol>
        <CCol col="3" class="text-right">
          <CInput placeholder="Search" v-model="search_filter" v-on:keydown.enter="toggleObservableFilter({'filter_type':'search','data_type':'search','value':search_filter})" ><template #append>
            <CButton color="secondary" @click="toggleObservableFilter({'filter_type':'search','data_type':'search','value':search_filter})">Search</CButton>
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
          <CCardBody style="overflow-y:scroll; max-height:600px">
            <CDataTable
                  :items="filtered_events"
                  :fields="fields"
                  :striped="true"
                  :sorter='{resetable:true}'
                  :responsive="false"
                  v-on:mouseenter.native="pauseRefresh = true" v-on:mouseleave.native="pauseRefresh = false"
              >
              <template #name="{item}">
                  <td>
                      <input v-if="!(item.case || item.status.closed)" type="checkbox" :value="item.uuid" v-model="selected"/>&nbsp;<a @click="toggleObservableFilter({'filter_type':'title','data_type':'title','value':item.title})">{{item.title}}</a><br>
                      <CIcon name="cilCenterFocus"/>&nbsp;<li style="display: inline; margin-right: 2px;" v-for="obs in getEventObservables(item.uuid).slice(0,2)" :key="obs.uuid"><CButton color="secondary" class="tag"  size="sm" style="margin-top:5px; margin-bottom:5px;" @click="toggleObservableFilter({'filter_type':'observable', 'data_type': obs.data_type, 'value': obs.value})"><b>{{obs.data_type}}</b>: {{ obs.value.toLowerCase() | truncate }}</CButton></li><span v-if="getEventObservables(item.uuid).length > 2" style="cursor: pointer;" v-c-popover="{'header':'Additional Observables', 'content':extraObservables(getEventObservables(item.uuid).slice(2))}"><small>&nbsp;+{{ getEventObservables(item.uuid).length - 2}}</small></span><br>
                      <CIcon name="cilTags"/>&nbsp;<li style="display: inline; margin-right: 2px;" v-for="tag in item.tags" :key="tag"><CButton @click="toggleObservableFilter({'filter_type': 'tag', 'data_type':'tag', 'value':tag})" color="dark" class="tag" size="sm">{{ tag }}</CButton></li>
                  </td>
              </template>
              <template #reference="{item}">
                <td><span v-c-tooltip="{
        content: `${item.reference}`,
        placement: 'top'
      }">{{item.reference | truncate}}</span></td>
              </template>
              <template #created="{item}">
                  <td>
                      <span v-c-tooltip="item.created_at">{{item.created_at | moment('from','now')}}</span>
                  </td>
              </template>
              <template #events="{item}">
                <td>
                  <CButton class="tag" @click="toggleObservableFilter({'filter_type':'eventsig','data_type':'signature','value':item.signature})" v-if="!(filteredBySignature() || item.related_events_count < 1)" color="dark" size="sm">{{item.related_events_count}}</CButton>
                </td>
              </template>
              <template #status="{item}">
                <td>
                  {{item.status.name}}
                </td>
              </template>
              <template #severity="{item}">
                <td>
                  <CButton @click="toggleObservableFilter({'filter_type':'severity', 'data_type':'severity', 'value':item.severity})" class="tag" :color="getSeverityColor(item.severity)" size="sm">{{getSeverityText(item.severity)}}</CButton>
                </td>
              </template>
              <template #actions="{item}">
                <td align="right">
                  <CButtonGroup>
                    <CButton v-if="(item.related_events_count && item.related_events_count > 0 && !filteredBySignature()) || (filteredBySignature() && item.status.name == 'New')" size="sm" color="info" @click="createEventRule(item.title, item.uuid)" v-c-tooltip="{'content':'Create Event Rule','placement':'bottom'}"><CIcon name='cilGraph'/></CButton>
                    <CButton @click="caseFromCard(item.uuid)" v-if="!item.case" size="sm" color="secondary" v-c-tooltip="{'content':'Create Case','placement':'bottom'}"><CIcon name="cilBriefcase"/></CButton>
                    <CButton :to="`/alerts/${item.uuid}`" size="sm" color="secondary" v-c-tooltip="{'content':'View Event','placement':'bottom'}"><CIcon name="cilMagnifyingGlass"/></CButton>
                    <CButton v-if="item.status.closed" @click="reopenEvent(item.uuid)" v-c-tooltip="{'content':'Reopen Event','placement':'bottom'}" size="sm" color="success"><CIcon name="cilEnvelopeOpen"/></CButton>
                    <CButton v-if="item.case" size="sm" color="secondary" :to="`/cases/${item.case}`" v-c-tooltip="{'content':'View Case','placement':'bottom'}"><CIcon name="cilBriefcase"/></CButton>
                    <CButton v-if="!item.status.closed" color="danger" size="sm" @click="dismissEventFromCard(item.uuid)" v-c-tooltip="{'content':'Dismiss Event','placement':'bottom'}"><CIcon name="cilDeaf"/></CButton>
                  </CButtonGroup>
                </td>
              </template>
              <template #observables="{item}">
                <td>
                  {{item.observable_count}}
                </td>
              </template>
              </CDataTable>
          </CCardBody>
        </CCard>
        </CCol>
      </CRow>
      <CRow v-else>
        <CCol :col="12/columns" v-for="event in filtered_events" :key="event.uuid">
          <CCard :accent-color="getSeverityColor(event.severity)">
            <CCardBody @mouseenter="pauseRefresh = true" @mouseleave="pauseRefresh = false">
              <CRow>
                <CCol col="9">
                  <h4>
                    <input type="checkbox" v-if="!(event.status.closed || event.case)" v-bind:checked="selected.includes(event.uuid)" :value="event.uuid" @change="selectEvents($event)"/>
                    &nbsp;<a @click="toggleObservableFilter({'filter_type':'title','data_type':'title','value':event.title})">{{event.title}}</a></h4>
                  {{event.description | truncate_description}}<br>
                  <CIcon name="cilCenterFocus"/>&nbsp;<li style="display: inline; margin-right: 2px;" v-for="obs in getEventObservables(event.uuid).slice(0,5)" :key="obs.uuid"><CButton color="secondary" class="tag" v-c-tooltip.hover.click="`${obs.tags}`" size="sm" style="margin-top:5px; margin-bottom:5px;" @click.prevent.stop="showActionMenu($event, obs)"><b>{{obs.source_field ? obs.source_field.toLowerCase() : obs.data_type }}</b>: {{ obs.value.toLowerCase() | truncate }}</CButton></li><span v-if="getEventObservables(event.uuid).length > 5" style="cursor: pointer;" v-c-popover="{'header':'Additional Observables', 'content':extraObservables(getEventObservables(event.uuid).slice(5))}"><small>&nbsp;+{{ getEventObservables(event.uuid).length - 5}}</small></span><br>
                  <!--<CIcon name="cilCenterFocus" style="margin-top:5px"/>&nbsp;<li style="display: inline; margin-right: 2px;" v-for="obs in getEventObservables(event.uuid)" :key="obs.uuid"><CButton color="secondary" class="tag"  v-c-tooltip.hover.click="`${obs.tags}`"  size="sm" style="margin-top:5px; margin-bottom:0px;" @click="toggleObservableFilter({'filter_type':'observable', 'data_type': obs.data_type, 'value': obs.value})"><b>{{obs.data_type}}</b>: {{ obs.value.toLowerCase() }}</CButton></li>-->
                </CCol>
                <CCol col="3" class="text-right">
                  <CButtonGroup>
                    <CButton v-if="(event.related_events_count && event.related_events_count > 0 && !filteredBySignature()) || (filteredBySignature() && event.status.name == 'New')" size="sm" color="info" @click="createEventRule(event.signature, event.uuid)" v-c-tooltip="{'content':'Create Event Rule','placement':'bottom'}"><CIcon name='cilGraph'/></CButton>
                    <CButton @click="caseFromCard(event.uuid)" v-if="!event.case" size="sm" color="secondary" v-c-tooltip="{'content':'Create Case','placement':'bottom'}"><CIcon name="cilBriefcase"/></CButton>
                    <CButton :to="`/alerts/${event.uuid}`" size="sm" color="secondary" v-c-tooltip="{'content':'View Event','placement':'bottom'}"><CIcon name="cilMagnifyingGlass"/></CButton>
                    <CButton v-if="event.status.closed" @click="reopenEvent(event.uuid)" v-c-tooltip="{'content':'Reopen Event','placement':'bottom'}" size="sm" color="success"><CIcon name="cilEnvelopeOpen"/></CButton>
                    <CButton v-if="event.case" size="sm" color="secondary" :to="`/cases/${event.case}`" v-c-tooltip="{'content':'View Case','placement':'bottom'}"><CIcon name="cilBriefcase"/></CButton>
                    <CButton v-if="!event.status.closed" color="danger" size="sm" @click="dismissEventFromCard(event.uuid)" v-c-tooltip="{'content':'Dismiss Event','placement':'bottom'}"><CIcon name="cilDeaf"/></CButton>
                  </CButtonGroup>
                </CCol>
              </CRow>
            </CCardBody>
            <CCardFooter style="background-color:#f0f0f0;">
              <CRow>
                <CCol col="9">
                  <small>
                    <CButton @click="toggleObservableFilter({'filter_type':'severity', 'data_type':'severity', 'value':event.severity})" class="tag" :color="getSeverityColor(event.severity)" size="sm">{{getSeverityText(event.severity)}}</CButton>
                    <span v-if="!filteredBySignature() && event.related_events_count > 1" class="separator">|</span><CButton class="tag" @click="toggleObservableFilter({'filter_type':'eventsig','data_type':'signature','value':event.signature})" v-if="!filteredBySignature() && event.related_events_count > 1" color="dark" size="sm">{{event.related_events_count}} occurences <span v-if="event.related_events_count && event.related_events_count > 0"></span></CButton>
                    <span class="separator">|</span><CButton class="tag" @click="toggleObservableFilter({'filter_type':'status', 'data_type':'status', 'value': event.status.name})" size="sm" color="info">{{event.status.name}}</CButton>
                    <span  v-if="event.status.closed && event.dismiss_reason"><span class="separator">|</span><b>Dismiss Reason:</b> {{event.dismiss_reason.title }}</span>
                    <span class="separator">|</span>Created {{event.created_at | moment('LLLL') }}
                    <span class="separator">|</span><b>Reference:</b> {{event.reference}}
                  </small>
                </CCol>
                <CCol col="3" class="text-right">
                  <CIcon name="cilTags"/>&nbsp;<li style="display: inline; margin-right: 2px;" v-for="tag in event.tags" :key="tag.name"><CButton @click="toggleObservableFilter({'filter_type': 'tag', 'data_type':'tag', 'value':tag})" color="dark" class="tag" size="sm">{{ tag }}</CButton></li>
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
    <CreateCaseModal :show.sync="createCaseModal" :events="selected"></CreateCaseModal>
    <CreateEventRuleModal :show.sync="createEventRuleModal" :events="selected" :event_signature.sync="event_signature" :source_event_uuid="sourceRuleEventUUID" :rule_observables="rule_observables"></CreateEventRuleModal>
    <MergeEventIntoCaseModal :show.sync="mergeIntoCaseModal" :events="selected"></MergeEventIntoCaseModal>
    <RunActionModal :show.sync="runActionModal" :observable="selected_observable"></RunActionModal>
    <CModal title="Delete Event" color="danger" :centered="true" size="lg" :show.sync="deleteEventModal">
      <div>
        <p>Deleting an event is a permanent action, are you sure you want to continue?</p>
        <p>This action will apply to <b>{{selected.length}}</b> events.</p>
      </div>
      <template #footer>
          <CButton @click="deleteEventModal = !deleteEventModal" color="secondary">Dismiss</CButton>
        <CButton @click="deleteEvent" color="danger">Delete</CButton>
      </template>
    </CModal>
    <vue-simple-context-menu
      :elementId="'observableContextMenu'"
      :options="actions"
      :ref="'vueSimpleContextMenu'"
      @option-clicked="actionMenuClicked"
    />
  </CRow>
</template>

<style scoped>

html, body {
  margin: 0;
  height: 100%;
  overflow: hidden;
}

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
  padding-top: 5px;
  padding-bottom: 10px;
}

.card-footer {
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

/* required class */
.my-editor {
  /* we dont use `language-` classes anymore so thats why we need to add background and text color manually */
  /*background: #fdfdfd;*/
  background: #0e0e0e;
  color: #ccc !important;
  border: 1px solid rgb(216, 219, 224);
  border-radius: 0.25rem;
  box-shadow: inset 0 1px 1px rgb(0 0 21 / 8%);

  /* you must provide font-family font-size line-height. Example: */
  font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  padding: 5px;
  
  overflow: scroll;
  overflow-x: hidden;
}

/* optional class for removing the outline */
.prism-editor__textarea:focus {
  outline: none;
}
</style>

<script>
import {mapState} from "vuex";
import CreateCaseModal from './CreateCaseModal'
import MergeEventIntoCaseModal from './MergeEventIntoCaseModal'
import CreateEventRuleModal from './CreateEventRuleModal'
import RunActionModal from './RunActionModal'
import "vue-simple-context-menu/dist/vue-simple-context-menu.css";
import { PrismEditor } from 'vue-prism-editor'
import { highlight, languages } from 'prismjs/components/prism-core';
import 'vue-prism-editor/dist/prismeditor.min.css'; // import the styles somewhere
import 'prismjs/components/prism-python';
import '../assets/js/prism-rql';
import '../assets/css/prism-reflex.css'; // import syntax highlighting styles

export default {
    name: 'Events',
    components: {
      CreateCaseModal,
      MergeEventIntoCaseModal,
      CreateEventRuleModal,
      RunActionModal,
      PrismEditor
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
    computed: mapState(['status','alert','settings']),
    created: function () {
        this.loadData()
        this.loadCloseReasons()
        //this.refresh = setInterval(function() {
        //  if(!this.pauseRefresh) {
        //    this.loadData()
        //  }         
        //}.bind(this), this.settings.events_page_refresh*1000 || 60000)
    },
    data(){
      return {
        actions: [
          {"name": "Filter"},
          {"name": "VT Lookup"},
          {"name": "Google Search"},
          {"name": "Copy"},
          {"name": "Run Action"}
        ],
        name: "",
        description: "",
        severity: 0,
        tlp: 0,
        tag_list: [],
        selected_tags: [],
        observable_count: 0,
        tags: [],
        events: [],
        pauseRefresh: false,
        case_tlp: 2,
        case_severity: 1,
        use_case_template: false,
        dismissCountDown: 10,
        selected: Array(),
        selected_events: [],
        selected_observable: {},
        mergeIntoCaseModal: false,
        dismissEventModal:false,
        deleteEventModal: false,
        createCaseModal: false,
        createEventRuleModal: false,
        runActionModal: false,
        sourceRuleEventUUID: "",
        dismissalComment: "",
        dismissalReason: null,
        close_reasons: [],
        collapse: {},
        observableFilters: [{'filter_type':'status','data_type':'status','value':'New'}],
        filtered_events: [],
        event_observables: {},
        quick_filters: false,
        advanced_filter: false,
        advanced_query: "",
        search_filter: '',
        table_view: false,
        select_all: false,
        fields: ['name', 'created', 'events', 'reference', 'status', 'severity', 'observables','actions'],
        sort_by: 'date',
        event_signature: "",
        rule_observables: [],
        related_events: [],
        columns: 1,
        card_page_num: 1,
        card_per_page: this.settings ? this.settings.events_per_page : 10,
        page_data: {'total_results': 0, 'pages': 0, 'page': 0, 'page_size': 0},
        current_page: 1,
        sort_by: 'created_at',
        sort_options: [
          {'label': 'Severity','value':'severity'},
          {'label': 'Date Created', 'value': 'created_at'},
          {'label': 'Name', 'value': 'title'},
          {'label': 'TLP', 'value': 'tlp'}
        ]
      }
    },
    methods: {
      highlighter(code) {
        return highlight(code, languages.rql);
      },
      showActionMenu(event, item) {
        this.$refs.vueSimpleContextMenu.showMenu(event, item)
      },
      actionMenuClicked(event) {
        let action = event.option.name
        switch (action) {
          case "Filter":
            this.toggleObservableFilter({'filter_type':'observable', 'data_type': event.item.data_type, 'value': event.item.value})
            break
          case "Copy":
            navigator.clipboard.writeText(event.item.value)
            break
          case "VT Lookup":
            if (["md5hash","sha1hash","sha256hash","imphash","domain","ip"].includes(event.item.data_type)) {
              if (event.item.data_type == "ip") {
                window.open(`https://www.virustotal.com/gui/ip-address/${event.item.value}`, '_blank').focus()
              } else if (["sha1hash","sha256hash","imphash","md5hash"].includes(event.item.data_type)) {
                window.open(`https://www.virustotal.com/gui/file/${event.item.value}`, '_blank').focus()
              } else if (event.item.data_type == "domain") {
                window.open(`https://www.virustotal.com/gui/domain/${event.item.value}`, '_blank').focus()
              }
              console.log("DO THE THING")
            } else {
              alert("Unsupported data type")
            }
            break
          case "Google Search":
            window.open(`https://www.google.com/search?q=${event.item.value}`, '_blank').focus()
            break
          case "Run Action":
            this.showRunActionModal(event.item)
            break

        }        
      },
      showRunActionModal(observable) {
        this.selected_observable = observable
        this.runActionModal = true
      },
      reopenEvent(uuid) {
        this.$store.dispatch('updateEvent', {uuid: uuid, data: {'status': 0}}).then(resp => {
          this.filtered_events = this.filterEvents()
        })
      },
      dismissEventFromCard(uuid) {
        this.selected = [uuid]
        this.dismissEventModal = true
      },
      deleteEvent() {
        if(this.selected.length == 1) {
          this.$store.dispatch('deleteEvent', this.selected[0]).then(resp => {
            this.filtered_events = this.filterEvents()
          })
        } 
        if (this.selected.length > 1) {
          this.$store.dispatch('deleteEvents', this.selected).then(resp => {
            this.filtered_events = this.filterEvents()
            
          })
        }
        this.selected = []
        this.deleteEventModal = false
      },
      dismissEvent() {
        
        if(this.selected.length == 1) {
          let data = {          
            dismiss_reason_uuid: this.dismissalReason,
            dismiss_comment: this.dismissalComment
          }
          this.$store.dispatch('updateEvent', {uuid: this.selected[0], data}).then(resp => {
            this.filtered_events = this.filterEvents()
          })
         }else if (this.selected.length > 1) {
          let data = {          
            dismiss_reason_uuid: this.dismissalReason,
            dismiss_comment: this.dismissalComment,
            events: this.selected
          }
          this.$store.dispatch('dismissEvents', data).then(resp => {
            this.filtered_events = this.filterEvents()
            
          })
         }
         this.selected = []
         this.dismissEventModal = false
         this.dismissalComment = ""
      },
      loadCloseReasons() {
        this.$store.dispatch('getCloseReasons').then(resp => {
          this.close_reasons = this.$store.getters.close_reasons.map((reason) => { return {label: reason.title, value: reason.uuid}})
        })
      },
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
        if (this.filtered_events) {
          return this.filtered_events.reduce(function(n, event) {
            if(event) {
              return n + (event.status.name == status)
            }          
          }, 0)
        } else {
          return 0
        }
      },
      eventCountBySeverity(severity) {
        if (this.filtered_events) {
          return this.filtered_events.reduce(function(n, event) {
            if(event) {
              return n + (event.severity == severity)
            }          
          }, 0)
        } else {
          return 0
        }
      },
      createEventRule(signature, uuid) {
        this.selected = []
        this.sourceRuleEventUUID = uuid
        let source_event = this.filtered_events.find((event) => event.signature == signature)
        this.event_signature = source_event.title
        this.$store.dispatch('getRelatedEvents', source_event.signature).then(resp => {
            this.selected = [...resp.data.events]
            this.rule_observables = this.getEventObservables(source_event.uuid).flat().map( function(obs) { 
              return {'data_type':obs.data_type, 'value': obs.value
              }
            })
          let unique_observables = Array.from(new Set(this.rule_observables.map(a => a.value)))
          .map(value => {
            return this.rule_observables.find(a => a.value === value)
          })
          this.rule_observables = unique_observables
          this.createEventRuleModal = true
        })          
        
      },
      selectedRelated(uuid) {
        let source_event = this.filtered_events.filter((event) => { 
          return event.uuid == uuid 
        })
        return source_event[0].related_events_count
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
        this.$store.commit('add_start')
        let status_filters = []
        let tag_filters = []
        let observables_filters = []
        let severity_filter = []
        let signature_filter = ""
        let title_filter = []
        let rql = ""
        let grouped = !this.filteredBySignature()
        let search = []
        for(let f in this.observableFilters) {
          let filter = this.observableFilters[f]

          if(filter.filter_type == 'eventsig') {
            signature_filter = filter.value
          }

          if(filter.filter_type == 'rql') {
            rql = encodeURIComponent(filter.value)
          }

          if(filter.filter_type == 'status') {
            status_filters.push(filter.value)
          }

          if(filter.filter_type == 'tag') {
            tag_filters.push(encodeURIComponent(filter.value))
          }

          if(filter.filter_type == 'observable') {
            observables_filters.push(encodeURIComponent(filter.value))
          }

          if(filter.filter_type == 'search') {
            search.push(encodeURIComponent(filter.value))
          }

          if(filter.filter_type == 'severity') {
            severity_filter.push(filter.value)
          }

          if(filter.filter_type == 'title') {
            title_filter = [encodeURIComponent(filter.value)]
          }
        }

        this.$store.dispatch('getEvents', {
          signature: signature_filter,
          grouped: grouped,
          tags: tag_filters,
          status: status_filters,
          observables: observables_filters,
          severity: severity_filter,
          title: title_filter,
          search: search,
          rql: rql,
          fields: '',
          page: this.current_page,
          page_size: this.card_per_page,
          sort_by: this.sort_by
        }).then(resp => {
          this.filtered_events = this.$store.getters.events
          this.event_observables = resp.data.observables
          this.page_data = resp.data.pagination
          this.$store.commit('add_success')
        })
      },
      sanitizeHTML(str) {
        var temp = document.createElement('div');
        temp.textContent = str
        return temp.innerHTML
      },
      extraObservables(observables) {
        let content = "<ul style='list-style-type: none; padding:0; margin: 0;'>"
        for(let o in observables) {
          let obs = observables[o]
          content += `<li><b>${obs.source_field ? obs.source_field.toLowerCase() : obs.data_type }</b>: ${this.sanitizeHTML(obs.value)}</li>`
        }
        content += "</ul>"
        return content
      },
      transformFilter(filter) {
        /* Returns a filter in the way the API wants to see it */
        return {'field':filter['filter_type'],'value':filter['value']}
      },
      toggleObservableFilter(obs) {
        this.selected = []
        let exists = this.observableFilters.some((item) => {
          return item.value === obs.value
        })

        // Can only have one status filter at a time
        if(obs.filter_type == 'status') {
          this.observableFilters = this.observableFilters.filter(item => item.filter_type !== obs.filter_type)
        }

        // Can only have one RQL filter at a time
        if(obs.filter_type == 'rql') {
          this.observableFilters = this.observableFilters.filter(item => item.filter_type !== obs.filter_type)
        }

        if(!exists) {
          this.observableFilters.push(obs)
        } else {
          this.observableFilters = this.observableFilters.filter(item => item.value !== obs.value)
        }
        this.current_page = 1
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
      caseFromCard(uuid){
        this.selected = [uuid]
        this.createCaseModal = true
      },
      selectAllNew() {
        if(!this.select_all) {
          this.selected = []
          for (let i in this.filtered_events) {
            let event = this.filtered_events[i]
            this.$store.dispatch('getRelatedEvents', event.signature).then(resp => {
              this.selected = [...this.selected, ...resp.data.events]
            })
            
          }
          
        }
      },
      selectAll() {
        
        if(!this.select_all) {
          for (let i in this.filtered_events) {
            let event = this.filtered_events[i]
            if(event.related_events_count > 1) {
              this.$store.dispatch('getRelatedEvents', event.uuid).then(resp => {
                this.selected = [...this.selected, ...resp.data.events]
              })
            } else {
              if(!this.selected.includes(event.uuid)  && event.status.name == 'New') {
                this.selected.push(event.uuid)
              }
            }            
          }
        }
      },
      selectEvents(event) {
        if(this.observableFilters.some(e => e.filter_type === 'eventsig')) {
          let event_uuid = event.target.value
          if(this.selected.includes(event_uuid)) {
            this.selected = this.selected.filter(item => item !== event_uuid)
          } else {
            this.selected.push(event_uuid)
          }
          return
        }
        let e = this.filtered_events.find(x => x.uuid == event.target.value)
        if(e) {
          if(this.selected.some((item) => { return item === e.uuid})) {
            if(e.related_events_count > 1) {
              this.$store.dispatch('getRelatedEvents', e.signature).then(resp => {
                this.selected = this.selected.filter(item => !resp.data.events.includes(item))
              })
            } else {
              this.selected = this.selected.filter(item => item != e.uuid)
            }            
          } else {       
            if(e.related_events_count > 1) {
              this.$store.dispatch('getRelatedEvents', e.signature).then(resp => {
                this.selected = [...this.selected, ...resp.data.events]
              })
            } else {
              if(!this.selected.includes(event.uuid) && e.status.name == 'New') {
                this.selected.push(e.uuid)
              }
            }
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
      },
      getEventObservables(uuid) {
        return this.event_observables[uuid]
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
      truncate_description: function (value) {
          let maxLength = 150
          if (!value) return ''
          value = value.toString()
          if (value.length > maxLength) {
              return value.substring(0,maxLength) + "..."
          } else {
              return value.substring(0,maxLength)
          }
      },
      truncate: function (value) {
          let maxLength = 75
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
