<template>
  <CRow>
    <CCol col="12">
      <CRow class="page-heading page-heading-no-nav">
        <CCol>
          <h2>Events<button aria-label="Documentation" type="button" class="kb" onclick="window.open('https://docs.reflexsoar.com/en/latest/events')"><CIcon name='cil-book' size="lg"/></button></h2>
          <!-- START FILTER PICKERS TODO: Move this to it's own component-->
      <CRow>        
        <CCol col="12">
          
              <CRow>
                <CCol col="9">
                  <li style="display: inline; margin-right: 2px;" v-for="obs,i  in observable_filters" :key="i"><CBadge color="secondary" class="tag tag-clickable"  size="sm" @click="toggleObservableFilter({'filter_type': obs.data_type, 'data_type': obs.data_type, 'value': obs.value})"><b>{{obs.data_type}}</b>: <span v-if="obs.filter_type == 'severity'">{{getSeverityText(obs.value).toLowerCase()}}</span><span v-else-if="obs.filter_type == 'organization'">{{mapOrgToName(obs.value)}}</span><span v-else-if="obs.filter_type == 'event_rule'">{{getEventRuleName(obs.value)}}</span><span v-else-if="obs.filter_type == 'title__like'">{{obs.value}}*</span><span v-else>{{ obs.value | truncate }}</span></CBadge></li><span v-if="!filteredBySignature() && observableFilters.length > 0"><span class="separator">|</span>Showing {{filtered_events ? filtered_events.length : 0  }} grouped events.</span><span v-if="filteredBySignature() && observableFilters.length != 0"><span class="separator" v-if="filteredBySignature() && observableFilters.length != 0">|</span>Showing {{filtered_events ? filtered_events.length : 0}} events.</span><span v-if="observableFilters.length == 0">Showing {{filtered_events.length}} grouped events.</span>
                </CCol>
                <CCol col="3" class="text-right" style="padding-right:50px">
                  <CDropdown 
                    toggler-text="Options"
                    color="secondary"
                    class='d-inline-block'
                    aria-label="Filtering Options"
                    size="sm"
                >                  
                    <CDropdownItem @click="saveFilter()" color="success" size="sm">Save View</CDropdownItem>
                    <CDropdownItem @click="loadFilter()" color="primary" size="sm">Edit View</CDropdownItem>
                    <CDropdownItem @click="toggleFilters()" color="info" size="sm">{{quick_filters ? 'Hide' : 'Show'}} Filter Menu</CDropdownItem>
                    <CDropdownItem @click="resetFilters()" color="secondary" size="sm">Reset Filter</CDropdownItem>
                    <CDropdownItem @click="showExportWizard()" color="secondary" size="sm"><i class="fas fa-download"/>&nbsp;Export Events</CDropdownItem>
                  </CDropdown>
                </CCol>
                
              </CRow>
        
            <CCollapse :show="quick_filters" >
              <!-- MOVE THIS TO ITS OWN COMPONENT -->
            <CRow class='event-stats-container event-stats-row'>
              <div class='event-stats-picker'>
                <CRow>
                  <CCol>
                    <b>Search</b><p>Free search by field</p>
                  </CCol>
                  <CCol class='text-right'>
                    <CButtonGroup>
                      <CButton size="sm" color="primary" @click="applyFreeSearch()">Search</CButton>
                    </CButtonGroup>
                  </CCol>
                </CRow>
                <CRow>
                  <CCol>
                    <CSelect :options="free_search_options" aria-label="Search Field" :value.sync="selected_search_option"></CSelect>
                  </CCol>
                </CRow>
                <CRow>
                  <CCol>
                    <CInput placeholder="Enter a search term..." aria-label="Free search" v-model="search_text" @keydown.enter="applyFreeSearch()"></CInput>
                  </CCol>
                </CRow>
              </div>
              <div class='event-stats-picker' style='padding-right: 10px'>
                <v-date-picker
                          v-model="range"
                          mode="dateTime"
                          :masks="masks"
                          is-range
                        >
                          <template v-slot="{ inputValue, inputEvents }">
                            <CRow>
                              <CCol>
                                <b>Time Filter</b><p>Select a date range</p>
                              </CCol>
                              <CCol class='text-right'>
                                <CButtonGroup>
                                  <CButton size="sm" color="secondary" @click="clearTimeFilter()">Reset</CButton>
                                  <CButton size="sm" color="primary" @click="applyTimeFilter()">Apply</CButton>
                                </CButtonGroup>                                
                              </CCol>
                            </CRow>
                            <CRow>
                              <CCol>
                                <CInput aria-label="Start Date" :value="inputValue.start" v-on="inputEvents.start">
                                  <template #prepend>
                                    <CButton aria-label="Start Date" disabled color="secondary" size="sm"><CIcon name='cil-calendar'/></CButton>
                                  </template>
                                </CInput>
                                <CInput aria-label="End Date" :value="inputValue.end" v-on="inputEvents.end">
                                <template #prepend>
                                    <CButton aria-label="End Date" disabled color="secondary" size="sm"><CIcon name='cil-calendar'/></CButton>
                                  </template>
                                </CInput>
                              </CCol>
                            </CRow>
                            <CRow>
                              
                            </CRow>
                          </template>
                        </v-date-picker>
              </div>
              <div class='event-stats-picker' v-for="bucket, title in event_stats" :key="title">
                <b class='event-stats-title'>{{title}}</b>
                <div v-if="status == 'loading'" class='event-stats-div' style="overflow-y: scroll; margin:auto; text-align:center; verticle-align:middle;">
                  <CSpinner
                        color="primary"
                        style="width:3rem;height:3rem;"
                        size="sm"
                        :grow="true"
                    />
                </div>
                <div v-else class="event-stats-div" style="margin-top:5px; overflow-y: scroll">
                  <CRow v-for="k,v in event_stats[title]" :key="v">
                    <CCol v-if="title === 'severity'" v-c-tooltip="{ content: `${getSeverityText(parseInt(v))}`, placement: 'left' }" @click="toggleObservableFilter({'filter_type': title, 'data_type':title,'value':parseInt(v)})" style="cursor: pointer; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"><span>{{getSeverityText(parseInt(v))}}</span></CCol>
                    <CCol v-else-if="title === 'organization'" v-c-tooltip="{ content: `${mapOrgToName(v)}`, placement: 'left' }" @click="toggleObservableFilter({'filter_type': 'organization', 'data_type':'organization','value':v})" style="cursor: pointer; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"><span>{{mapOrgToName(v)}}</span></CCol>
                    <CCol v-else-if="title === 'observable value'" v-c-tooltip="{ content: `${encodeURI(v)}`, placement: 'left' }" @click="toggleObservableFilter({'filter_type': 'observable', 'data_type':'observable','value':v})" style="cursor: pointer; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"><span>{{v}}</span></CCol>
                    <CCol v-else-if="title === 'event rule'" v-c-tooltip="{ content: `${getEventRuleName(v)}`, placement: 'left' }" @click="toggleObservableFilter({'filter_type': 'event_rule', 'data_type':'event rule','value':v})" style="cursor: pointer; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"><span>{{getEventRuleName(v)}}</span></CCol>
                    <CCol v-else v-c-tooltip="{ content: `${v}`, placement: 'left' }" @click="toggleObservableFilter({'filter_type': title, 'data_type':title,'value':v})" style="cursor: pointer; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"><span>{{v}}</span></CCol>
                    <CCol class="text-right" col="3"><CBadge color="secondary">{{k.toLocaleString('en-US')}}</CBadge></CCol>
                  </CRow>                
                </div>
              </div>
            </CRow>
            <!-- END EVENT STATS COMPONENT -->
            </CCollapse>
        </CCol>
      </CRow>
      <!-- END FILTER PICKERS -->
        </CCol>
      </CRow>
      
      <CRow>
        <CCol col="12">
          <CAlert :show.sync="alert.show" :color="alert.type" closeButton>
            {{alert.message}}
          </CAlert>
          <CAlert :show="selectedOrgLength() > 1" color="warning" closeButton>
            <h5>WARNING: Multiple Organizations Selected</h5>
            You have selected events from more than one organization, bulk actions have been disabled.  In a future release you will be able to perform this action.
          </CAlert>
        </CCol>
      </CRow>
      
      <CRow>
        <CCol col="4">
            <div>
                <CDropdown
                  toggler-text=""
                  class="float-left"
                  color="secondary"
                  aria-label="Bulk Select"
                ><CDropdownItem  @click="selectAllNew()">Select visible</CDropdownItem>
                <CDropdownItem @click="selectAcrossPages()">Select all&nbsp;<b>{{page_data.total_results}}</b>&nbsp;events</CDropdownItem>
                <CDropdownItem @click="clearSelected()">Clear Selection</CDropdownItem>
                </CDropdown>
                &nbsp; <CDropdown 
                :toggler-text="`${selected_count} events`" 
                color="secondary"
                v-bind:disabled="selected.length == 0 || selectedOrgLength() > 1"
                class='d-inline-block'
                aria-label="Bulk Actions"
            >
                <CDropdownItem v-bind:disabled="selectedOrgLength() > 1" @click="startDismissEvent()">Dismiss Event</CDropdownItem>
                <CDropdownItem v-bind:disabled="selectedOrgLength() > 1" @click="runPlaybookModal = !runPlaybookModal">Run Playbook</CDropdownItem>
                <CDropdownItem v-bind:disabled="selectedOrgLength() > 1" @click="createCaseModal = !createCaseModal">Create Case</CDropdownItem>
                <CDropdownItem v-bind:disabled="selectedOrgLength() > 1" @click="mergeIntoCaseModal = !mergeIntoCaseModal">Merge into Case</CDropdownItem>
                <CDropdownItem v-bind:disabled="selectedOrgLength() > 1" @click="showRunActionModal(null, false)">Run Action</CDropdownItem>
                <div v-if="this.$store.getters.user_has_permission('delete_event')">
                  <CDropdownDivider/>
                  <CDropdownItem  @click="deleteEventModal = !deleteEventModal">Delete</CDropdownItem>
                </div>
            </CDropdown>
              <!--&nbsp;<CSelect :options="sort_options" placeholder="Sort by" :value="sort_by" @change="sort_by = $event.target.value; filterEvents()" class="d-inline-block"/>-->&nbsp;<CButton aria-label="Sorting" style="margin-top: -5px" size="sm" color="secondary" @click="toggleSortDirection()"><CIcon v-if="sort_direction === 'asc'" name="cilSortAscending"/><CIcon v-if="sort_direction === 'desc'" name="cilSortDescending"/></CButton>&nbsp;<CSelect class="d-inline-block" placeholder="Events per Page" :options="[10,25,50,100]" @change="card_per_page = $event.target.value; filterEvents()"/>
            </div>
            
        </CCol>
        <CCol class="text-right">
          <CPagination :activePage.sync="current_page" :pages="page_data.pages"/>
        </CCol>
        <CCol class="text-right">
          <div>
            <!--<CButton v-if="!table_view" @click="setColumns()" color="secondary" class="d-inline-block"><small><CIcon name='cilColumns' size="sm"></CIcon></small></CButton>&nbsp;<CButton color="secondary" @click="table_view = !table_view"  class="d-inline-block"><span v-if="table_view">Card</span><span v-else>Table</span> View</CButton>&nbsp;-->
            
          </div>
        </CCol>
      </CRow>
      <CRow col v-if="status == 'loading'">
        <CCol col="12">
        <div style="margin: auto; text-align:center; verticle-align:middle;">
           <CSpinner
                color="primary"
                style="width:6rem;height:6rem;"
                :grow="true"
            />
        </div>
        </CCol>
      </CRow>
      <CRow v-else-if="filtered_events.length == 0">
        <CCol class='text-center'>
          <h3><br>No Events.</h3>
        </CCol>
      </CRow>
      <CRow v-else @mouseenter="pauseRefresh = true" @mouseleave="pauseRefresh = false">
        <CCol :col="12" v-for="event in filtered_events" :key="event.uuid">
          <!--<EventCard :event="event"></EventCard>-->
          <CCard :accent-color="getSeverityColor(event.severity)">
            <CCardBody>
              <CRow>
                <CCol col="9">
                  <h4>                    
                    <input type="checkbox" aria-label="Select Card" v-if="!(event.status.closed || event.case)" v-bind:checked="selected.includes(event.uuid)" :value="event.uuid" @change="selectEvents($event)"/>
                    &nbsp;<a @click="toggleObservableFilter({'filter_type':'title','data_type':'title','value':event.title})" style="cursor: pointer;">{{event.title}}</a></h4>
                  {{event.description | truncate_description}}<br>
                  <CIcon name="cilCenterFocus" />&nbsp;<li  style="display: inline; margin-right: 2px;" v-for="obs,i in event.observables.slice(0,max_observables)" :key="i"><CBadge @click.prevent.stop="setPopoverData(obs, event.organization)" :id="`popover-${obs.value}`" data-popover="test" color="secondary" class="tag tag-clickable tag-list" size="sm" style="margin-top:5px; margin-bottom:5px;" ><b>{{obs.source_field ? obs.source_field.toLowerCase() : obs.data_type }}</b>: {{ obs.value.toLowerCase() | truncate }}</CBadge></li><span v-if="event.observables.length > max_observables" style="cursor: pointer;" v-c-popover="{'header':'Additional Observables', 'content':extraObservables(event.observables.slice(max_observables))}"><small>&nbsp;+{{ event.observables.length - max_observables}}</small></span><br>
                  <!--<CIcon name="cilCenterFocus" style="margin-top:5px"/>&nbsp;<li style="display: inline; margin-right: 2px;" v-for="obs in getEventObservables(event.uuid)" :key="obs.uuid"><CButton color="secondary" class="tag"  v-c-tooltip.hover.click="`${obs.tags}`"  size="sm" style="margin-top:5px; margin-bottom:0px;" @click="toggleObservableFilter({'filter_type':'observable', 'data_type': obs.data_type, 'value': obs.value})"><b>{{obs.data_type}}</b>: {{ obs.value.toLowerCase() }}</CButton></li>-->
                </CCol>
                <CCol col="3" class="text-right">
                 <CIcon name="cilTags"/>&nbsp;<li style="display: inline; margin-right: 2px;" v-for="tag,i  in event.tags" :key="i"><CBadge @click="toggleObservableFilter({'filter_type': 'tag', 'data_type':'tag', 'value':tag})" color="dark" class="tag tag-clickable tag-list" size="sm">{{ tag }}</CBadge></li>
                </CCol>
              </CRow>
            </CCardBody>
            <CCardFooter style="background-color:#f0f0f0;">
              <CRow>
                <CCol col="2">
                <CButtonGroup>
                    <!--<CButton v-if="!event.acknowledged" aria-label="Acknowlege" @click="ackEvent(event.uuid)" size="sm" color="success" v-c-tooltip="{'content':'Acknowledge Event','placement':'bottom'}"><CIcon name="cilCheck"/></CButton>
                    <CButton v-if="event.acknowledged" aria-label="Unacknowledge" @click="unackEvent(event.uuid)" size="sm" color="warning" v-c-tooltip="{'content':'Acknowledge Event','placement':'bottom'}"><CIcon name="cilX"/></CButton>
                    <CButton aria-label="Create Event Rule" size="sm" color="info" @click="createEventRule(event.signature, event.uuid)" v-c-tooltip="{'content':'Create Event Rule','placement':'bottom'}"><CIcon name='cilGraph'/></CButton>
                    <CButton aria-label="Dismiss Event" v-if="!event.status.closed" color="danger" size="sm" @click="dismissEventFromCard(event.uuid)" v-c-tooltip="{'content':'Dismiss Event','placement':'bottom'}"><CIcon name="cilDeaf"/></CButton>
                    <CButton aria-label="Run Action" size="sm" color="secondary" @click="showRunActionModal(event.uuid, true)" v-c-tooltip="{'content':'Run Action','placement':'bottom'}"><i class="fas fa-play"/></CButton>
                    <CButton aria-label="Create Case" @click="caseFromCard(event.uuid)" v-if="event.status.name === 'New'" size="sm" color="secondary" v-c-tooltip="{'content':'Create Case','placement':'bottom'}"><CIcon name="cilBriefcase"/></CButton>-->
                    <CButton aria-label="View Event" @click="showDrawer(event.uuid)" size="sm" color="secondary" v-c-tooltip="{'content':'View Event','placement':'bottom'}"><i class="fas fa-magnifying-glass"></i></CButton>
                    
                    <!--<CButton aria-label="Add Comment" @click="showEventCommentModal(event.uuid)" size="sm" color="secondary" v-c-tooltip="{'content':'Add Comment','placement':'bottom'}"><CIcon name="cilCommentBubble"/> {{event.total_comments ? event.total_comments : 0}}</CButton>
                    <CButton aria-label="Reopen Event" v-if="event.status.closed" @click="reopenEvent(event.uuid)" v-c-tooltip="{'content':'Reopen Event','placement':'bottom'}" size="sm" color="success"><CIcon name="cilEnvelopeOpen"/></CButton>
                    <CButton aria-label="View Case" v-if="event.case" size="sm" color="secondary" :to="`/cases/${event.case}`" v-c-tooltip="{'content':'View Case','placement':'bottom'}"><CIcon name="cil-folder-open"/></CButton>-->
                    &nbsp;<CDropdown toggler-text="Actions" size="sm" color="secondary" v-c-tooltip="{'content':'More Actions','placement':'bottom'}">
                      <template #toggler-content>
                        <i class="fas fa-ellipsis"></i>
                      </template>

                    <!-- Ack -->
                    <CDropdownItem v-if="!event.acknowledged" @click="ackBySig(event.uuid, event.signature)"><i class="fas fa-check"></i>&nbsp;Acknowledge</CDropdownItem>
                    <CDropdownItem v-if="event.acknowledged" @click="unAckBySig(event.uuid, event.signature)"><i class="fas fa-x"></i>&nbsp;Unacknowledge</CDropdownItem>
                    <!-- Dismiss -->
                    <CDropdownItem @click="dismissEventFromCard(event.uuid)"><i class="fas fa-bell-slash"></i>&nbsp;Dismiss</CDropdownItem>
                    <!-- Create Case -->
                    <CDropdownItem @click="caseFromCard(event.uuid)"><i class="fas fa-briefcase"></i>&nbsp;Create Case</CDropdownItem>
                    <!-- Create Event Rule -->
                    <CDropdownItem @click="createEventRule(event.signature, event.uuid)"><i class="fas fa-diagram-project"></i>&nbsp;Create Event Rule</CDropdownItem>
                    <!-- Run Action -->
                    <CDropdownItem @click="showRunActionModal(event.uuid, true)"><i class="fas fa-play"/>&nbsp;Run Action</CDropdownItem>
                    <!-- View Event -->
                    <CDropdownItem @click="showDrawer(event.uuid)"><i class="fas fa-magnifying-glass"></i>&nbsp;View Event</CDropdownItem>
                    <!-- View Case -->
                    <CDropdownItem v-if="event.case" :to="`/cases/${event.case}`"><CIcon name="cilFolderOpen"/>&nbsp;View Case</CDropdownItem>
                    <!-- Add Comment -->
                    <CDropdownItem @click="showEventCommentModal(event.uuid)"><i class="fas fa-comment"></i>&nbsp;Add Comment</CDropdownItem>
                    <!-- Reopen Event -->
                    <CDropdownItem v-if="event.status.closed" @click="reopenEvent(event.uuid)"><i class="fas fa-envelope-open"></i>&nbsp;Reopen Event</CDropdownItem>
                    

                  </CDropdown>
                  </CButtonGroup>
                  
                  
                </CCol>
                <CCol col="10" class="text-right">
                  <small>
                    <CBadge class="tag" color="dark" v-if="event.category">{{ event.category ? event.category : 'Uncategorized' }}</CBadge>
                    <span class="separator">|</span>
                    <CBadge @click="toggleObservableFilter({'filter_type':'severity', 'data_type':'severity', 'value':event.severity})" class="tag tag-clickable" :color="getSeverityColor(event.severity)" size="sm">{{getSeverityText(event.severity)}}</CBadge>
                    <span class="separator" v-if="event.risk_score">|</span><CBadge v-if="event.risk_score" class="tag tag-clickable" :color="getSeverityColor(event.severity)" size="sm">Risk: {{event.risk_score}}</CBadge>
                    <span v-if="!filteredBySignature() && event.related_events_count > 1" class="separator">|</span><CBadge class="tag tag-clickable" @click="toggleObservableFilter({'filter_type':'signature','data_type':'signature','value':event.signature})" v-if="!filteredBySignature() && event.related_events_count > 1" color="dark" size="sm">{{event.related_events_count}} occurrences <span v-if="event.related_events_count > 0"></span></CBadge>                    
                    <span class="separator">|</span><CBadge class="tag tag-clickable" @click="toggleObservableFilter({'filter_type':'status', 'data_type':'status', 'value': event.status.name})" size="sm" color="info">{{event.status.name}}</CBadge>
                    <span  v-if="event.status.closed && event.dismiss_reason"><span class="separator">|</span><b>Dismiss Reason:</b> {{event.dismiss_reason.title }}</span>
                    <span class="separator">|</span>Created {{event.original_date | moment('LLLL') }}
                    <span class="separator">|</span><b>Reference:</b> {{event.reference}}
                    <span class="separator">|</span><CIcon name='cilVector' v-c-tooltip="{content: 'Event Rules Matched'}"></CIcon> {{event.event_rules ? event.event_rules.length : 0 }}
                    <span v-if="current_user.default_org"><span class="separator">|</span></span></small><span style="cursor: pointer" @click="toggleObservableFilter({'filter_type':'organization','data_type':'organization','value':event.organization})"><OrganizationBadge v-if="current_user.default_org" :uuid="event.organization" color="warning" /></span>
                </CCol>
              </CRow>
            </CCardFooter>
          </CCard>
        </CCol>
      </CRow>
    </CCol>
    <CModal title="Dismiss Event" color="danger" :centered="true" size="lg" :show.sync="dismissEventModal">
      <CAlert :show.sync="error" color="danger">
        Failed to dismiss Event(s). {{error_message}}
      </CAlert>
      <div>
        <p>Dismissing an event indicates that no action is required.  For transparency purposes, it is best to leave a comment as to why this event is being dismissed.  Fill out the comment field below.</p>
        <p>This action will apply to all related events with the same signature.</p>
        <div v-if="selectedOrgLength() > 1">
          <CCallout color="warning" class="admonition">
            <h5>Multiple Organization Warning</h5>
            <p>You are dismissing events for multiple organizations at the same time.  Be sure to pick the correct reason and provide a description for each.</p>
          </CCallout>
          <div v-for="events,org in selected_orgs" :key="org">
            <CRow>
              <CCol><hr></CCol></CRow>
            <CRow >
              <CCol>              
                <h5>{{mapOrgToName(org)}} | <small class="text-muted">{{events.length}} events</small></h5>
              </CCol>
              <CCol>
                <CSelect :reset-on-options-change='true' placeholder="Select a reason for dismissing the event..."/>
              </CCol>
            </CRow>
            <CRow>
              <CCol>
                <CTextarea
                  placeholder="Enter a comment as to why this Event is being dismissed."
                  v-bind:required="settings.require_event_dismiss_comment"
                  label="Comment"
                  rows=3
                />
              </CCol>
            </CRow>
          </div>
        </div>
        <div v-else>
          <CForm id="dismissEventForm" @submit.prevent="dismissEventByFilter()">
              <CRow>
                  <CCol><br>
              <CSelect :reset-on-options-change='true' placeholder="Select a reason for dismissing the event..." :options="close_reasons" :value="dismissalReason" @change="dismissalReason = $event.target.value; dismissalComment = close_reasons.filter(r => r.value == $event.target.value)[0].description" label="Reason"/>
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
              <CRow>

                <CCol >
                  <label for="tuning_advice_switch">Provide Tuning Advice?</label><br>
                  <CSwitch id="tuning_advice_switch" :checked.sync="tuningAdviceToggle" label-on="Yes" label-off="No" color="success">Provide Tuning Advice</CSwitch><br>
                  <CTextarea v-if="tuningAdviceToggle"
                    placeholder="Enter advice on how this Event should be tuned to prevent future False Positives."
                    :value="tuningAdvice"
                    @change="tuningAdvice = $event"
                    label="Tuning Advice"
                    rows=5
                  >
                  </CTextarea>
                </CCol>
              </CRow>
          </CForm>
        </div>
      </div>
      <template #footer>
        <CButton @click="resetDismissModal()" color="secondary">Cancel</CButton>
        <!--<CButton color="warning" @click="dismissEventByFilter()" v-bind:disabled="dismiss_submitted"><CSpinner color="success" size="sm" v-if="dismiss_submitted"/><span v-else>Dismiss Event</span></CButton>-->
        <CButton type="submit" form="dismissEventForm" color="danger" v-bind:disabled="dismiss_submitted"><CSpinner color="success" size="sm" v-if="dismiss_submitted"/><span v-else>Dismiss Event</span></CButton>
      </template>
    </CModal>
    <SaveViewModal :filter_string="saved_filter_string" :show.sync="show_save_view_modal"></SaveViewModal>
    <LoadViewModal :show.sync="show_load_view_modal"></LoadViewModal>
    <EventCommentModal :event="event_comment_target" :show.sync="event_comment_modal"></EventCommentModal>
    <CreateCaseModal :show.sync="createCaseModal" :organization="organization" :events="selected" :related_events_count="related_events_count" :case_from_card="true"></CreateCaseModal>
    <CreateEventRuleModal :show.sync="createEventRuleModal" :events="selected" :event_signature.sync="event_signature" :event_organization.sync="event_organization" :source_event_uuid="sourceRuleEventUUID" :rule_observables="rule_observables" :from_card="true"></CreateEventRuleModal>
    <MergeEventIntoCaseModal :show.sync="mergeIntoCaseModal" :events="selected"></MergeEventIntoCaseModal>
    <RunActionModal :show.sync="runActionModal" :events="selected" :events_data="selected_events"></RunActionModal>
    <ListAdderModal :show.sync="listAdderModal" :observable="selected_observable"></ListAdderModal>
    <ObservablePopover ref="popover" :show.sync="show_observable_popover" :observable="popover_data" :organization="popover_organization" @add-observable-to-filter="toggleObservableFilter"/>
    <EventExportWizard :show.sync="show_export_wizard"/>
    <CModal title="Delete Event" color="danger" :centered="true" size="lg" :show.sync="deleteEventModal">
      <div>
        <p>Deleting an event is a permanent action, are you sure you want to continue?</p>
        <p>This action will apply to <b>{{selected_count}}</b> events.</p>
      </div>
      <template #footer>
          <CButton @click="deleteEventModal = !deleteEventModal" color="secondary">Dismiss</CButton>
        <CButton @click="deleteEvent" color="danger" v-bind:disabled="dismiss_submitted"><CSpinner color="success" size="sm" v-if="dismiss_submitted"/><span v-else>Delete</span></CButton>
      </template>
    </CModal>
    <vue-simple-context-menu
      :elementId="'observableContextMenu'"
      :options="actions"
      :ref="'vueSimpleContextMenu'"
      @option-clicked="actionMenuClicked"
    />
    <vue-simple-context-menu
      :elementId="'savedFiltersMenu'"
      :options="savedFilters"
      :ref="'savedFiltersMenu'"
      @option-clicked="loadFilterClicked"
    />
    <event-drawer :event_data="event_data"></event-drawer>
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
import ListAdderModal from './ListAdderModal'
import "vue-simple-context-menu/dist/vue-simple-context-menu.css";
import { PrismEditor } from 'vue-prism-editor'
import { highlight, languages } from 'prismjs/components/prism-core';
import 'vue-prism-editor/dist/prismeditor.min.css'; // import the styles somewhere
import 'prismjs/components/prism-python';
import '../assets/js/prism-rql';
import '../assets/css/prism-reflex.css'; // import syntax highlighting styles
import EventDrawer from './EventDrawer.vue';
import CRightDrawer from './CRightDrawer.vue';
import OrganizationBadge from './OrganizationBadge'
import EventCommentModal from './event/EventCommentModal'
import EventCard from './event/EventCard'
import ObservablePopover from './components/ObservablePopover'
import SaveViewModal from './event/SaveViewModal'
import LoadViewModal from './event/LoadViewModal'
import EventExportWizard from './event/EventExportWizard'

export default {
    name: 'Events',
    components: {
      CreateCaseModal,
      MergeEventIntoCaseModal,
      CreateEventRuleModal,
      RunActionModal,
      ListAdderModal,
      PrismEditor,
      EventDrawer,
      CRightDrawer,
      OrganizationBadge,
      EventCommentModal,
      EventCard,
      ObservablePopover,
      SaveViewModal,
      LoadViewModal,
      EventExportWizard
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
    computed: mapState(['status','alert','settings','current_user','observable_filters']),
    created: function () {

      /* Set the page size based on the global settings page */
      if(this.settings) {
        this.card_per_page = this.settings.events_per_page
      }
      
      this.observableFilters = this.observable_filters
      
      this.quick_filters = this.$store.getters.quick_filters
      this.loadData()
      this.loadCloseReasons()
      this.$store.commit('set', ['eventDrawerMinimize', true])      
        
      //this.refresh = setInterval(function() {
      //  if(!this.pauseRefresh) {
      //    this.loadData()
      //  }         
      //}.bind(this), this.settings.events_page_refresh*1000 || 60000)
    },
    data(){
      return {
        saved_filter_string: "",
        show_save_view_modal: false,
        show_load_view_modal: false,
        savedFilters: [{
          'name': 'Filter 1'
        }],
        actions: [
          {"name": "Filter"},
          {"name": "VT Lookup"},
          {"name": "Google Search"},
          {"name": "Copy"},
          //{"name": "Run Action"},
          {"name": "Add to List"}
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
        listAdderModal: false,
        sourceRuleEventUUID: "",
        dismissalComment: "",
        dismissalReason: null,
        tuningAdviceToggle: false,
        tuningAdvice: '',
        close_reason: "",
        close_reasons: [],
        collapse: {},
        observableFilters: [{'filter_type':'status','data_type':'status','value':'New'}],
        filtered_events: [],
        event_observables: {},
        quick_filters: true,
        advanced_filter: false,
        advanced_query: "",
        search_filter: '',
        table_view: false,
        select_all: false,
        fields: ['name', 'created', 'events', 'reference', 'status', 'severity', 'observables','actions'],
        sort_by: 'date',
        event_signature: "",
        event_organization: "",
        rule_observables: [],
        related_events: [],
        related_events_count: 0,
        case_from_card: false,
        columns: 1,
        card_page_num: 1,
        card_per_page: 10,
        page_data: {'total_results': 0, 'pages': 0, 'page': 0, 'page_size': 0},
        current_page: 1,
        sort_by: 'original_date',
        sort_options: [
        //  {'label': 'Severity','value':'severity'},
          {'label': 'Date Created', 'value': 'created_at'},
        //  {'label': 'Name', 'value': 'title'},
        //  {'label': 'TLP', 'value': 'tlp'}
        ],
        sort_direction: 'desc',
        drawer_open: false,
        event_data: {},
        dismiss_submitted: false,
        event_stats: {},
        free_search_options: ['Title','Tag','Signature','Observable'],
        selected_count: 0,
        target_event: {},
        range: {
          start: this.days_ago(7),
          end: this.today()
        },
        masks: {
          input: 'YYYY-MM-DD h:mm A'
        },
        selected_search_option: "Title",
        search_text: "",
        selected_orgs: {},
        multiple_org_dismiss: {},
        max_observables: 15,
        organization: "",
        event_rules: [],
        error: false,
        error_message: "",
        event_comment_modal: false,
        event_comment_target: {},
        popover_data: {},
        popover_organization: "",
        show_observable_popover: false,
        show_export_wizard: false
      }
    },
    methods: {
      ackBySig(uuid, signature) {
        this.$store.dispatch('acknowledgeEventBySignature', {'uuid': uuid, 'signature': signature}).then(() => {
          this.filtered_events = this.filterEvents()
        })
      },
      unAckBySig(uuid, signature) {
        this.$store.dispatch('unacknowledgeEventBySignature', {'uuid': uuid, 'signature': signature}).then(() => {
          this.filtered_events = this.filterEvents()
        })
      },
      ackEvent(uuid) {
        this.$store.dispatch('acknowledgeEvent', uuid).then(() => {
          this.filtered_events = this.filterEvents()
        })
      },
      unackEvent(uuid) {
        this.$store.dispatch('unacknowledgeEvent', uuid).then(() => {
          this.filtered_events = this.filterEvents()
        })
      },
      showExportWizard() {
        this.show_export_wizard = true;
      },
      setPopoverData(data, organization) {
        this.popover_data = data
        this.popover_organization = organization
        this.show_observable_popover = true
      },
      showEventCommentModal(uuid) {
        this.event_comment_target = this.filtered_events.find(event => event.uuid == uuid)
        this.event_comment_modal = true
      },
      getEventRuleName(uuid) {
        let rule = this.event_rules.find(r => r.uuid === uuid)
        if(rule) {
          return rule.name
        } else {
          return "Unknown"
        }
      },
      startDismissEvent() {
        let organization = ""
        if(this.target_event) {
          organization = this.target_event.organization
        }

        if(this.selectedOrgLength() == 1) {
          organization = Object.keys(this.selected_orgs)[0]
        }

        this.$store.dispatch('getCloseReasons', {organization: organization}).then(resp => {
          this.close_reasons = this.$store.getters.close_reasons.map((reason) => { return {label: reason.title, value: reason.uuid, description: reason.description}})
          this.error = false
          this.error_message = ""
          this.dismissalComment = ""
          this.dismissalReason = null
          this.tuningAdviceToggle = false
          this.tuningAdvice = ''
          this.dismissEventModal = true
        })
        //this.loadCloseReasons()
        
      },
      resetDismissModal() {
        this.dismissEventModal = false
        this.dismissalComment = ""
        this.dismissalReason = null
        this.tuningAdviceToggle = false
        this.tuningAdvice = ''
      },
      resetFilters() {
        this.observableFilters = [{'filter_type':'status','data_type':'status','value':'New'}]
        this.$store.commit('update_observable_filters', this.observableFilters)
        //this.filterEvents()
      },
      selectedOrgLength() {
        return Object.keys(this.selected_orgs).length
      },
      today() {
        let d = new Date()
        d.setHours(23,59,59,0)
        return d
      },
      days_ago(offset) {
        let d = new Date()
        d.setDate(d.getDate() - offset)
        d.setHours(0,0,0,0)
        return d
      },
      add_filter() {
        let fields =  this.search_filter.split(':')
        if(fields.length > 1) {
          let key = fields[0]
          let value = fields[1].trim()
          let event_fields = ['title','description','status','tags']
          if (event_fields.includes(key)) {
          } else {
            this.toggleObservableFilter({'filter_type': 'observable', 'data_type': key, 'value': value})
            this.search_filter = ""
          }
        }
        //toggleObservableFilter({'filter_type':'search','data_type':'search','value':search_filter})
      },
      highlighter(code) {
        return highlight(code, languages.rql);
      },
      showActionMenu(event, item, organization) {
        item.organization = organization
        this.$refs.vueSimpleContextMenu.showMenu(event, item, organization)
      },
      showSavedFiltersMenu(event, item, organization) {
        item.organization = organization
        this.$refs.savedFiltersMenu.showMenu(event, item, organization)
      },
      loadFilterClicked(event) {
        console.log(event)
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
          case "Add to List":
            this.showListAdder(event.item)
            break
        }        
      },
      showRunActionModal(event, clear_selected = false) {
        // If event is a string convert it to an array
        if(clear_selected) { this.clearSelected() }
        if(event) {
          this.selectEvents(event)
        }
        this.runActionModal = true
      },
      showListAdder(observable) {
        this.selected_observable = observable
        this.listAdderModal = true
      },
      reopenEvent(uuid) {
        this.$store.dispatch('updateEvent', {uuid: uuid, data: {'status': 0}}).then(resp => {
          this.filtered_events = this.filterEvents()
        })
      },
      dismissEventFromCard(uuid) {
        let event = this.filtered_events.filter(event => event.uuid === uuid)
        
        if(event.length > 0) {
          event = event[0]
        }
        this.target_event = event
        
        //this.loadCloseReasons()
        this.selected = [uuid]
        this.selected_count = this.selected.length
        
        this.selected_orgs = {}
        this.selected_orgs[event.organization] = {
          'events': [uuid]
        }
        
        this.related_events_count = this.getRelatedCount(event.signature)
        if(this.related_events_count > 0) {
          this.selected_count = this.related_events_count
        }

        let organization = ""
        if(this.target_event) {
          organization = this.target_event.organization
        }

        if(this.selectedOrgLength() == 1) {
          organization = Object.keys(this.selected_orgs)[0]
        }

        this.$store.dispatch('getCloseReasons', {organization: organization}).then(resp => {
          this.dismissalReason = null
          this.dismissalComment = ""
          this.tuningAdviceToggle = false
          this.tuningAdvice = ''
          this.error = false
          this.error_message = ""
          this.dismissEventModal = true
        })
      },
      deleteEvent() {
        this.dismiss_submitted = true
        if(this.selected.length == 1) {
          this.$store.dispatch('deleteEvents', this.selected).then(resp => {
            this.filtered_events = this.filterEvents()
            this.dismiss_submitted = false
            this.deleteEventModal = false
          })
        } 
        if (this.selected.length > 1) {
          this.$store.dispatch('deleteEvents', this.selected).then(resp => {
            this.filtered_events = this.filterEvents()
            this.dismiss_submitted = false
            this.deleteEventModal = false            
          })
        }
        this.selected = []          
      },
      dismissEventByFilter() {
        this.dismiss_submitted = true
        let data = {
          filter: JSON.stringify(this.observableFilters),
          dismiss_reason_uuid: this.dismissalReason,
          dismiss_comment: this.dismissalComment,
          uuids: this.selected
        }

        if(this.tuningAdviceToggle && this.tuningAdvice != "") {
          data.tuning_advice = this.tuningAdvice
        } else {
          data.tuning_advice = null
        }

        this.$store.dispatch('dismissEventsByFilter', data).then(resp => {
          this.filtered_events = this.filterEvents()
            this.dismissEventModal = false
            this.dismiss_submitted = false
            this.error = false
            this.error_message = ""
            this.selected = []
            this.selected_count = 0
        }).catch(err => {
            this.error = true
            this.error_message = err.response.data.message
            this.selected_count = 0
            this.dismiss_submitted = false
          })
      },
      dismissEvent() {
        this.dismiss_submitted = true
          let data = {          
            dismiss_reason_uuid: this.dismissalReason,
            dismiss_comment: this.dismissalComment,
            events: this.selected
          }
          this.$store.dispatch('dismissEvents', data).then(resp => {
            this.filtered_events = this.filterEvents()
            this.dismissEventModal = false
            this.dismiss_submitted = false
            this.error = false
            this.error_message = ""
            this.selected = []
            this.selected_count = 0
          }).catch(err => {
            this.error = true
            this.error_message = err.response.data.message
            this.selected = []
            this.selected_count = 0
            this.dismiss_submitted = false
          })
         this.selected = []
         this.selected_count = 0
         
         this.dismissalComment = ""
      },
      loadCloseReasons() {

        let organization = ""
        if(this.target_event) {
          organization = this.target_event.organization
        }

        if(this.selectedOrgLength() == 1) {
          organization = Object.keys(this.selected_orgs)[0]
        }

        this.$store.dispatch('getCloseReasons', {organization: organization}).then(resp => {
          this.close_reasons = this.$store.getters.close_reasons.map((reason) => { return {label: reason.title, value: reason.uuid, description: reason.description}})
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
        this.event_organization = source_event.organization
        this.$store.dispatch('getRelatedEvents', source_event.signature).then(resp => {
            this.selected = [...resp.data.events]
            this.selected_count = 1
            this.rule_observables = source_event.observables.flat().map( function(obs) { 
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
        return this.getRelatedCount(source_event[0].signature)
      },
      filteredBySignature() {
        if(this.observableFilters.some((filter) => filter.filter_type == 'signature')) {
          return true
        } else {
          return false
        }
      },
      filterEvents: function () {

        this.organizations = this.$store.getters.organizations.map((o) => { return {label: o.name, value: o.uuid}})

        // Build the filters based on what is currently selected
        this.$store.commit('add_start')
        let status_filters = []
        let tag_filters = []
        let observables_filters = []
        let severity_filter = []
        let signature_filter = ""
        let title_filter = []
        let source_filters = []
        let organization_filters = []
        let rql = ""
        let start_time = ""
        let end_time = ""
        let grouped = !this.filteredBySignature()
        let search = []
        let event_rule_filters = []
        let title__like_filter = null
        for(let f in this.observableFilters) {
          let filter = this.observableFilters[f]

          if(filter.filter_type == 'signature') {
            signature_filter = filter.value
          }

          if(filter.filter_type == 'source') {
            source_filters.push(filter.value)
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

          if(filter.filter_type == 'start') {
            start_time = filter.value
          }

          if(filter.filter_type == 'end') {
            end_time = filter.value
          }

          if(filter.filter_type == 'event_rule') {
            event_rule_filters.push(filter.value)
          }

          if(filter.filter_type == 'organization') {
            organization_filters.push(filter.value)
          }          

          if(filter.filter_type == 'title__like') {
            title__like_filter = filter.value
          }

        }

        this.$store.dispatch('getEventStats', {
          signature: signature_filter,
          tags: tag_filters,
          severity: severity_filter,
          title: title_filter,
          status: status_filters,
          source: source_filters,
          observables: observables_filters,
          start: start_time,
          end: end_time,          
          organization: organization_filters,
          event_rules: event_rule_filters,
          title__like: title__like_filter
        }).then(resp => {
          this.event_stats = this.$store.getters.event_stats
          let rule_ids = Object.keys(this.event_stats['event rule'])
          this.$store.dispatch('loadEventRules', {page_size: 500, save: false}).then(resp => {
            this.event_rules = resp.data.event_rules
          })
        })

        this.$store.dispatch('getEvents', {
          signature: signature_filter,
          grouped: grouped,
          tags: tag_filters,
          status: status_filters,
          observables: observables_filters,
          severity: severity_filter,
          title: title_filter,
          search: search,
          source: source_filters,
          rql: rql,
          fields: '',
          page: this.current_page,
          page_size: this.card_per_page,
          sort_by: this.sort_by,
          sort_direction: this.sort_direction,
          start: start_time,
          end: end_time,
          organization: organization_filters,
          event_rules: event_rule_filters,
          title__like: title__like_filter
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
        this.clearSelected()
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
          if(obs.data_type == 'start' || obs.data_type == 'end') {
            this.observableFilters = this.observableFilters.filter(item => item.filter_type !== 'start')
            this.observableFilters = this.observableFilters.filter(item => item.filter_type !== 'end')
          } else {
            this.observableFilters = this.observableFilters.filter(item => item.value !== obs.value)
          }
        }

        this.$store.commit('update_observable_filters', this.observableFilters)

        this.current_page = 1
        //if(!['end','start'].includes(obs.filter_type)) {
        //  this.filterEvents()
        //}
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
        this.selected = []
        let event = this.filtered_events.filter(event => event.uuid === uuid)
        if(event.length > 0) {
          event = event[0]
        }
        this.selected = [uuid]
        this.related_events_count = this.getRelatedCount(event.signature)
        this.case_from_card = true
        this.organization = event.organization
        this.createCaseModal = true
      },
      selectAllNew() {
        this.selected_orgs = {}
        
        if(this.select_all) {
          
          
          this.select_all = false
        }
        if(!this.select_all) {
          this.selected = []
          if(this.observableFilters.some(e => e.filter_type === 'signature')) {
            this.selected_count = 0 
            for (let i in this.filtered_events) {
              let event = this.filtered_events[i]
              this.selected = [...this.selected, event.uuid]

              // If this is the first time selecting the organization
              if(!(event.organization in this.selected_orgs)) {
                this.selected_orgs[event.organization] = {
                  events: [],
                  dismiss_reason: '',
                  dismiss_comment: ''
                }
              }
              // If the event isn't selected in that org yet, push it
              if(!this.selected_orgs[event.organization].includes(event.uuid)) {
                  this.selected_orgs[event.organization].events.push(event.uuid)
              }
              
              this.selected_count += 1
            }
          }
          else {
            this.selected_count = 0
            //this.selected = []
            for (let i in this.filtered_events) {
              let event = this.filtered_events[i]
              this.selected = [...this.selected, event.uuid]
              // If this is the first time selecting the organization
              if(!(event.organization in this.selected_orgs)) {
                this.selected_orgs[event.organization] = {
                  events: [],
                  dismiss_reason: '',
                  dismiss_comment: ''
                }
              }
              // If the event isn't selected in that org yet, push it
              if(!this.selected_orgs[event.organization].events.includes(event.uuid)) {
                  this.selected_orgs[event.organization].events.push(event.uuid)
              }              
              this.selected_count += this.getRelatedCount(event.signature)
            }
          }
        }
      },
      selectAcrossPages() {
        this.selected = []
        let status_filters = []
        let tag_filters = []
        let observables_filters = []
        let severity_filter = []
        let signature_filter = ""
        let title_filter = []
        let source_filters = []
        let organization_filters = []
        let start_time = ""
        let end_time = ""
        let title__like_filter = null
        let event_rule_filters = []
        this.select_all = true
        this.selected_count = this.page_data.total_results
        for(let f in this.observableFilters) {
          let filter = this.observableFilters[f]

          if(filter.filter_type == 'signature') {
            signature_filter = filter.value
          }

          if(filter.filter_type == 'source') {
            source_filters.push(filter.value)
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

          if(filter.filter_type == 'start') {
            start_time = filter.value
          }

          if(filter.filter_type == 'end') {
            end_time = filter.value
          }

          if(filter.filter_type == 'organization') {
            organization_filters.push(filter.value)
          }          

          if(filter.filter_type == 'title__like') {
            title__like_filter = filter.value
          }

          if(filter.filter_type == 'event_rule') {
            event_rule_filters.push(filter.value)
          }

        }
        this.$store.dispatch('getBulkEvents', {
          signature: signature_filter,
          tags: tag_filters,
          severity: severity_filter,
          title: title_filter,
          status: status_filters,
          source: source_filters,
          observables: observables_filters,
          start: start_time,
          end: end_time,
          organization: organization_filters,
          title__like: title__like_filter,
          event_rule: event_rule_filters
        }).then(resp => {
          this.selected = [...resp.data.events]
          if (resp.data.organizations === null) {
            this.selected_orgs = {'': []}
          } else {
            this.selected_orgs = resp.data.organizations
          }
          
          
          
        })
      },
      selectAll() {
        
        if(!this.select_all) {
          for (let i in this.filtered_events) {
            let event = this.filtered_events[i]
            
            if(this.getRelatedCount(event.signature) > 1) {
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
        this.selected_count = this.selected.length
      },
      selectEvents(event) {
        let event_uuid = null;
        if (typeof event === 'string') {
          event_uuid = event
        } else {
          event_uuid = event.target.value
        }
        if(this.observableFilters.some(e => e.filter_type === 'signature')) {
          
          if(this.selected.includes(event_uuid)) {
            this.selected_count -= 1
            this.selected = this.selected.filter(item => item !== event_uuid)
          } else {
            this.selected.push(event_uuid)
            this.selected_count += 1
          }
          return
        }
        let e = this.filtered_events.find(x => x.uuid == event_uuid)
        if(e) {          
          if(this.selected.some((item) => { return item === e.uuid})) {
              this.selected = this.selected.filter(item => item != e.uuid)

              // Go through each selected organization and remove the item
              for(let o in this.selected_orgs) {
                if(e.uuid in this.selected_orgs[o].events) {
                  this.selected_orgs[o].events = this.selected_orgs[o].events.filter(item => item != e.uuid)
                }
                
                // If no more events are selected for that organization remove the organization UUID
                if(this.selected_orgs[o].length == 0) {
                  delete this.selected_orgs[o]
                }
              }
              
              this.selected_count -= this.getRelatedCount(e.signature)
          } else {       
              this.selected.push(e.uuid)

              // If the org hasn't been selected yet, add it as an empty dictionary
              
              // If this is the first time selecting the organization
              if(!(e.organization in this.selected_orgs)) {
                this.selected_orgs[e.organization] = {
                  events: [],
                  dismiss_reason: '',
                  dismiss_comment: ''
                }
              }

              // If the event isn't selected in that org yet, push it
              if(!(e.uuid in this.selected_orgs[e.organization].events)) {
                  this.selected_orgs[e.organization].events.push(e.uuid)
              }

              this.selected_count += this.getRelatedCount(e.signature)
          }
        }

        this.selected_events = this.filtered_events.filter((event) => this.selected.includes(event.uuid))
        
      },
      clearSelected() {
        this.selected = []
        this.selected_events = []
        this.selected_orgs = {}
        this.select_all = false
        this.selected_count = 0
      },
      getSeverityColor(severity) {
        switch(severity) {
          case 0: return 'light';
          case 1: return 'dark';
          case 2: return 'info';
          case 3: return 'warning';
          case 4: return 'danger';
          default: return 'danger';
        }
      },
      getRelatedCount(sig) {
        if(this.event_stats.signature[sig] !== undefined) {
          return this.event_stats.signature[sig]
        } else {
          return 1
        }        
      },
      getSeverityText(severity) {
        switch(severity) {
          case 0: return 'Informational';
          case 1: return 'Low';
          case 2: return 'Medium';
          case 3: return 'High';
          case 4: return 'Critical';
          default: return 'Unknown';
        }
      },
      getEventObservables(uuid) {
        return this.event_observables[uuid]
      },
      toggleSortDirection() {

        if(this.sort_direction == "asc") {
          this.sort_direction = "desc"
          this.filterEvents()
          return
        }

        if(this.sort_direction == "desc") {
          this.sort_direction = "asc"
          this.filterEvents()
          return
        }
      },
      applyFreeSearch() {
        if(!['',null].includes(this.search_text)) {
          if(this.selected_search_option.toLowerCase() == 'title') {
            this.toggleObservableFilter({'filter_type':'title__like', 'data_type': 'title', 'value': this.search_text})
          } else {
            this.toggleObservableFilter({'filter_type':this.selected_search_option.toLowerCase(), 'data_type': this.selected_search_option.toLowerCase(), 'value': this.search_text})
          }
          this.search_text = ""
        }
      },
      applyTimeFilter() {
        this.clearTimeFilter(false)
        this.toggleObservableFilter({'filter_type':'start','data_type':'start','value':this.range.start.toISOString()})
        this.toggleObservableFilter({'filter_type':'end','data_type':'end','value':this.range.end.toISOString()})
        this.filterEvents()
      },
      clearTimeFilter(refresh=true) {
        this.observableFilters = this.observableFilters.filter(f => f.filter_type !== 'start')
        this.observableFilters = this.observableFilters.filter(f => f.filter_type !== 'end')
        if(refresh) {
          this.filterEvents()
        }
      },
      showDrawer(event_uuid) {
        let uuid = event_uuid
        if(this.$store.getters.eventDrawerMinimize) {
          this.$store.dispatch('getEvent', uuid).then(resp => {
            this.$store.commit('set', ['eventDrawerMinimize', !this.$store.getters.eventDrawerMinimize])
            this.event_data = resp.data
          })
        } else {
          this.$store.commit('set', ['eventDrawerMinimize', !this.$store.getters.eventDrawerMinimize])
        }   
      },
      mapOrgToName(uuid) {
        let org = this.$store.getters.organizations.filter(o => o.uuid === uuid)
        if (org.length > 0) {
          return org[0].name
        } else {
          return "Unknown"
        }
      },
      toggleFilters() {
        this.quick_filters = !this.quick_filters
        this.$store.commit('set_quick_filter_state', this.quick_filters)
      },
      saveFilter() {
        this.show_save_view_modal = true
        this.saved_filter_string = JSON.stringify(this.observableFilters)
      },
      loadFilter() {
        this.show_load_view_modal = true
      }
    },
    beforeDestroy: function() {
      clearInterval(this.refresh)
    },
    watch: {
      current_page: function(){
        this.filterEvents()
      },
      observable_filters: function() {
        this.observableFilters = this.observable_filters
        this.filterEvents()
      },
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
    },
}
</script>
