<template>
<div>
  <CRow>
    <CCol>
      <!-- START FILTER PICKERS TODO: Move this to it's own component-->
      <CRow>
        <CCol col="12">
          <CCard class="cases-picker-card">
              <CRow>
                <CCol col="9">
                  <li style="display: inline; margin-right: 2px;" v-for="obs in caseFilters" :key="obs.value+obs.data_type"><CButton color="secondary" class="tag"  size="sm" @click="toggleCaseFilter({'data_type': obs.data_type, 'value': obs.value})"><b>{{obs.data_type}}</b>: <span v-if="obs.filter_type == 'severity'">{{getSeverityText(obs.value).toLowerCase()}}</span><span v-else-if="obs.filter_type == 'organization'">{{mapOrgToName(obs.value)}}</span><span v-else>{{ obs.value | truncate }}</span></CButton></li><span v-if="caseFilters.length > 0" class="separator">|</span>Showing {{filtered_cases ? filtered_cases.length : 0  }} cases.</span>
                </CCol>
                <CCol col="3" class="text-right">
                  <CButton @click="quick_filters = !quick_filters" color="info" size="sm">{{quick_filters ? 'Hide' : 'Show'}} Filters</CButton>&nbsp;
                  <CButton @click="my_cases = !my_cases" :color="my_cases ? 'warning' : 'info'" size="sm">{{my_cases ? 'Assigned To All' : 'Assigned To Me'}}</CButton>
                </CCol>
              </CRow>
            </CCard>
            
            <CCollapse :show="quick_filters"><CCard class="cases-picker-card">
              <!-- MOVE THIS TO ITS OWN COMPONENT -->
            <CRow class='event-stats-container event-stats-row'>
              <div class='event-stats-picker'>
                <CRow>
                  <CCol>
                    <b>Search</b><br>
                    <p>Select a term to free search on </p>
                  </CCol>
                </CRow>
                <CRow>
                  <CCol>
                    <CSelect :options="free_search_options"></CSelect>
                  </CCol>
                </CRow>
                <CRow>
                  <CCol>
                    <CInput></CInput>
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
                                <CInput :value="inputValue.start" v-on="inputEvents.start">
                                  <template #prepend>
                                    <CButton disabled color="secondary" size="sm"><CIcon name='cil-calendar'/></CButton>
                                  </template>
                                </CInput>
                                <CInput :value="inputValue.end" v-on="inputEvents.end">
                                <template #prepend>
                                    <CButton disabled color="secondary" size="sm"><CIcon name='cil-calendar'/></CButton>
                                  </template>
                                </CInput>
                              </CCol>
                            </CRow>
                            <CRow>
                              
                            </CRow>
                          </template>
                        </v-date-picker>
              </div>
              <div class='event-stats-picker' v-for="bucket, title in case_stats" :key="title">
                <b class='event-stats-title'>{{title}}</b>
                <div v-if="loading == 'loading'" class='event-stats-div' style="overflow-y: scroll; margin:auto; text-align:center; verticle-align:middle;">
                  <CSpinner
                        color="dark"
                        style="width:3rem;height:3rem;"
                        size="sm"
                    />
                </div>
                <div v-else class="event-stats-div" style="margin-top:5px; overflow-y: scroll">
                  <CRow v-for="k,v in case_stats[title]" :key="v">
                    <CCol v-if="title === 'severity'" v-c-tooltip="{ content: `${getSeverityText(parseInt(v))}`, placement: 'left' }" @click="toggleCaseFilter({'filter_type': title, 'data_type':title,'value':parseInt(v)})" style="cursor: pointer; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"><span>{{getSeverityText(parseInt(v))}}</span></CCol>
                    <CCol v-else-if="title === 'organization'" v-c-tooltip="{ content: `${mapOrgToName(v)}`, placement: 'left' }" @click="toggleCaseFilter({'filter_type': 'organization', 'data_type':'organization','value':v})" style="cursor: pointer; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"><span>{{mapOrgToName(v)}}</span></CCol>
                    <CCol v-else v-c-tooltip="{ content: `${v}`, placement: 'left' }" @click="toggleCaseFilter({'filter_type': title, 'data_type':title,'value':v})" style="cursor: pointer; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"><span>{{v}}</span></CCol>
                    <CCol class="text-right" col="3"><CBadge color="secondary">{{k.toLocaleString('en-US')}}</CBadge></CCol>
                  </CRow>                
                </div>
              </div>
            </CRow>
            <!-- END EVENT STATS COMPONENT --></CCard>
            </CCollapse>
          
        </CCol>
      </CRow>
      <CRow style="padding:10px">
        <CCol col="10">
          <CButton color="primary" @click="newCaseModal = !newCaseModal">New Case</CButton>
        </CCol>
        <CCol col="2" class="text-right">

        </CCol>
      </CRow>
             <CRow><CCol> <CDataTable
                  :hover="hover"
                  :striped="striped"
                  :bordered="bordered"
                  :small="small"
                  :fixed="fixed"
                  :items="filtered_cases"
                  :fields="fields"
                  :items-per-page="25"
                  :dark="dark"
                  :loading = loading
                  :sorter='{external: false, resetable: true}'
                  :responsive="false"
                  style="border-top: 1px solid #cfcfcf;"
              >
              <template #title="{item}">
                  <td>
                      <router-link :to="`${item.uuid}`">{{item.title}}</router-link><br>
                      <li style="display: inline; margin-right: 2px;" v-for="tag in item.tags" :key="tag.name">
                        <CBadge color="info" size="sm" style="padding: 5px; margin-top:10px; margin-right:3px;cursor: pointer;" @click="toggleCaseFilter({'filter_type': 'tag', 'data_type':'tag','value':tag.name})">{{ tag.name }}</CBadge>
                      </li>
                  </td>
              </template>
              <template #organization="{item}">
              <td>
                <CButton class="tag" size="lg" color="secondary">{{mapOrgToName(item.organization)}}</CButton>
              </td>
              </template>
              <template #status="{item}">
                <td>
                  <span v-if="item.status">{{item.status.name}}</span>
                </td>
              </template>
              <template #events="{item}">
                <td>{{item.event_count > 0 ? item.event_count : 0}}</td>
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
                  <CButton :color="getSeverityColor(item.severity)" size="sm" @click="toggleCaseFilter({'filter_type': 'severity', 'data_type':'severity','value':item.severity})">{{getSeverityText(item.severity)}}</CButton>
                </td>
              </template>
              <template #owner="{item}">
                <td>{{(item.owner && item.owner.username) ? item.owner.username : "Unassigned"}}</td>

              </template>
              <template #actions='{item}'>
                <td>
                  <CDropdown toggler-text="Actions" color="secondary" size="sm">
                    <CDropdownItem v-if="!item.closed" @click="toggleCloseCase(item.uuid)">Close</CDropdownItem>
                    <CDropdownItem v-if="!item.closed" @click="runPlaybookModal = !runPlaybookModal">Execute Playbook</CDropdownItem>
                    <CDropdownDivider v-if="!item.closed" />
                    <CDropdownItem @click="showDeleteCaseModal(item.uuid)">Delete</CDropdownItem>
                  </CDropdown>
                </td>
              </template>
              </CDataTable>
            </CCol>
          </CRow>
    </CCol>
    <CreateCaseModal :show.sync='newCaseModal'></CreateCaseModal>
    <CModal title="Close Case" :centered="true" size="lg" :show="close_case_modal">
      <CAlert :show.sync="error" color="danger" closeButton>
        {{error_message}}
      </CAlert>
      <CForm id="closeCaseForm" @submit.prevent="closeCase" >
          <p>You are about to close this case, select a reason for doing so.  Providing additional context where necessary is recommended.  Note, all open Events attached to this case will also be closed.</p>
          <CSelect :options="close_reasons" label="Reason" placeholder="Select a reason for closing this case" :value.sync="closure_reason_uuid" required></CSelect>
          <CTextarea :value="close_comment" @change="close_comment = $event" v-bind:required="settings.require_case_close_comment" v-bind:disabled="closure_reason_uuid == ''" label="Additional information" rows="5" placeholder="Enter additional information related to the closure reason."></CTextarea>
      </CForm>
      <template #footer>
        <CButton @click="dismiss()" color="secondary">Cancel</CButton>
        <CButton type="submit" form="closeCaseForm" color="primary">Close</CButton>
      </template>
    </CModal>
    <CModal title="Delete Case" color="danger" :centered="true" size="lg" :show.sync="deleteCaseModal">
        <div>
            <p>Deleting a case is a permanent action, all work on the event will be removed and any associated events will be set to <b>New</b> status, are you sure you want to continue?</p>
        </div>
        <template #footer>
            <CButton @click="deleteCaseModal = !deleteCaseModal" color="secondary">Cancel</CButton>
            <CButton @click="deleteCase()" color="danger">Delete</CButton>
        </template>
    </CModal>
  </CRow>
  <CRow>
    <CCol lg="12" sm="12">
      <CCardBody v-if="pagination.pages > 0">
        <CPagination :activePage.sync="current_page" :pages="pagination.pages"/>
      </CCardBody>
    </CCol>
  </CRow>
  </div>
</template>

<style scoped>

.separator {
  margin-left: 10px;
  margin-right: 10px;
}

</style>

<script>
import {mapState} from "vuex";
import CreateCaseModal from './CreateCaseModal'
export default {
    name: 'Cases',
    components: {
      CreateCaseModal
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
    alert: false
    },
    computed: mapState(['settings','current_user']),
    created: function () {
      this.caseFilters = this.$store.getters.case_filters
      if(this.current_user.default_org) {
        
          this.organizations = this.$store.getters.organizations.map((o) => { return {label: o.name, value: o.uuid}})
          if (!this.fields.includes('organization')) {
            this.fields.splice(1,0,'organization')
          }
        this.fields.push()
      }
        this.filterCases()
        this.loadClosureReasons()
        this.refresh = setInterval(function() {
          this.filterCases()
        }.bind(this), 60000)
    },
    data(){
      return {
        name: "",
        description: "",
        dismissCountDown: 10,
        loading: true,
        newCaseModal: false,
        deleteCaseModal: false,
        target_case: "",
        fields: ['title','status','events','tlp','severity','owner','actions'],
        available_fields: ['title','status','events','tlp','severity','owner','actions','created_at','modified_at'],
        quick_filters: false,
        caseFilters: [{'filter_type':'status','data_type':'status','value':'New'}],
        filtered_cases: [],
        pagination: {},
        close_reasons: [],
        case_closed: false,
        status_uuid: "",
        target_case_uuid: "",
        close_comment: "",
        error: false,
        error_message: "",
        closure_reason_uuid: "",
        close_case_modal: false,
        current_page: 1,
        range: {
          start: this.days_ago(7),
          end: this.today()
        },
        masks: {
          input: 'YYYY-MM-DD h:mm A'
        },
        free_search_options: [
          'Title', //'Commenter', 'Owner', 'Description', 'Comments', 'Task Note', 'Observable'
        ],
        case_stats: {},
        my_cases: false,
        
      }
    },
    watch: {
      current_page: function () {
        this.filterCases()
      },
      my_cases: function() {
        this.filterCases()
      }
    },
    filters: {
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
    methods: {
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
      mapOrgToName(uuid) {
        let org = this.$store.getters.organizations.filter(o => o.uuid === uuid)
        if (org.length > 0) {
          return org[0].name
        } else {
          return "Unknown"
        }
      },
      dismiss() {
        this.closure_reason_uuid = undefined
        this.error = false
        this.error_message = ""
        this.status_uuid = undefined
        this.target_case = ""
        this.close_comment = ""
        this.close_case_modal = false
      },
      closeCase(){
          // Leave the closure comment
          let data = {
              message: this.close_comment,
              case_uuid: this.target_case,
              is_closure_comment: true,
              closure_reason_uuid: this.closure_reason_uuid
          }
          this.$store.dispatch('createCaseComment', data)

          // Call the update case API endpoint
          let status = {"status_uuid": this.status_uuid, "close_reason_uuid": this.closure_reason_uuid}
          let uuid = this.target_case
          this.$store.dispatch('updateCase', {uuid, data: status}).then(resp => {
              this.filterCases()
          })
          this.dismiss()
      },
      toggleCloseCase(uuid) {
        this.target_case = uuid
        let organization = this.filtered_cases.filter(c => c.uuid === uuid)[0].organization
        this.loadClosureReasons(organization)
        this.loadCaseStatuses()
        this.close_case_modal = !this.close_case_modal        
      },
      loadClosureReasons(organization=null) {
          // Call the closure reasons API endpoint
          this.$store.dispatch('getCloseReasons', {organization: organization}).then(resp => {
              this.close_reasons = resp.data.map((reason) => { return {'label': reason.title, 'value': reason.uuid }})
          })            
      },
      addSuccess: function() {
        if (this.$store.getters.addSuccess == 'success') {
          return true
        } else {
          return false
        }
      },
      showDeleteCaseModal(uuid) {
        this.target_case = uuid
        this.deleteCaseModal = !this.deleteCaseModal
      },
      loadCaseStatuses() {
        let organization = this.filtered_cases.filter(c => c.uuid === this.target_case)[0].organization
        this.$store.dispatch('getCaseStatus', {organization: organization}).then(resp => {
          this.status_uuid = resp.data.find(s => s.name === 'Closed').uuid
        })
      },
      deleteCase() {
          let uuid = this.target_case
          this.$store.dispatch('deleteCase', uuid).then(resp => {
              this.filtered_cases = this.$store.getters.cases
              this.target_case = ""
              this.deleteCaseModal = !this.deleteCaseModal
          })
      },
      getSeverityColor(severity) {
          switch(severity) {
          case 1: return 'dark';
          case 2: return 'info';
          case 3: return 'warning';
          case 4: return 'danger';
          default: return 'dark';
          }
      },
      getSeverityText(severity) {
          switch(severity) {
          case 1: return 'Low';
          case 2: return 'Medium';
          case 3: return 'High';
          case 4: return 'Critical';
          default: return 'Low';
          }
      },
      filterCases: function () {

        // Build the filters based on what is currently selected
        this.$store.commit('add_start')
        this.loading = true
        let status_filters = []
        let title_filters = []
        let tag_filters = []
        let severity_filter = []
        let search = []
        let owner = []
        let my_cases = false
        let my_tasks = false
        let start_time = ""
        let end_time = ""
        let organization_filters = []
        let close_reasons_filters = []
        let owner_filters = []
        for(let f in this.caseFilters) {
          let filter = this.caseFilters[f]

          if(filter.filter_type == 'status') {
            status_filters.push(filter.value)
          }

          if(filter.filter_type == 'tags') {
            tag_filters.push(filter.value)
          }

          if(filter.filter_type == 'search') {
            search = filter.value
          }

          if(filter.filter_type == 'severity') {
            severity_filter.push(filter.value)
          }

          if(filter.filter_type == 'tasks') {
            my_tasks = true
          }

          if(filter.filter_type == 'cases') {
            my_cases = true
          }

          if(filter.filter_type == 'title') {
            title_filters.push(filter.value)
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

          if(filter.filter_type == 'close reason') {
            close_reasons_filters.push(filter.value)
          }

          if(filter.filter_type == 'owner') {
            owner_filters.push(filter.value)
          }
        }

        this.$store.dispatch('getCases', {
          tag: tag_filters,
          status: status_filters,
          severity: severity_filter,
          search: search,
          owner: owner,
          fields: ['title','status','tlp','severity','owner','uuid','id','event_count'],
          my_cases: this.my_cases,
          my_tasks: my_tasks,
          page: this.current_page,
          page_size: this.card_per_page,   
          organization: organization_filters,
          close_reason: close_reasons_filters,
          owner: owner_filters
        }).then(resp => {
          this.filtered_cases = this.$store.getters.cases
          this.pagination = resp.data.pagination
          this.$store.commit('add_success')
          this.loading = false
        })

        this.$store.dispatch('getCaseStats', {
          status: status_filters,
          severity: severity_filter,
          tags: tag_filters,          
          title: title_filters,
          start: start_time,
          end: end_time,   
          organization: organization_filters,
          close_reason: close_reasons_filters,
          owner: owner_filters,
          my_cases: this.my_cases,
          metrics: ['tag','status','severity','close_reason','organization','owner']
        }).then(resp => {
          this.case_stats = this.$store.getters.case_stats
        })
      },
      applyTimeFilter() {
        this.clearTimeFilter(false)
        this.toggleCaseFilter({'filter_type':'start','data_type':'start','value':this.range.start.toISOString()})
        this.toggleCaseFilter({'filter_type':'end','data_type':'end','value':this.range.end.toISOString()})
        this.filterCases()
      },
      clearTimeFilter(refresh=true) {
        this.caseFilters = this.caseFilters.filter(f => f.filter_type !== 'start')
        this.caseFilters = this.caseFilters.filter(f => f.filter_type !== 'end')
        if(refresh) {
          this.filterCases()
        }
      },
      toggleCaseFilter(filter) {
        let exists = this.caseFilters.some((item) => {
          return item.value == filter.value
        })

        // Can only have one status filter at a time
        if(filter.filter_type == 'status') {
          this.caseFilters = this.caseFilters.filter(item => item.filter_type !== filter.filter_type)
        }

        // Can't filter by my cases and my tasks at the same time
        if(filter.filter_type == 'cases') {
          this.caseFilters = this.caseFilters.filter(item => item.filter_type != 'tasks')
        }

        // Can't filter by my cases and my tasks at the same time
        if(filter.filter_type == 'tasks') {
          this.caseFilters = this.caseFilters.filter(item => item.filter_type != 'cases')
        }

        if(!exists) {
          this.caseFilters.push(filter)
        } else {
          if(filter.data_type == 'start' || filter.data_type == 'end') {
            this.caseFilters = this.caseFilters.filter(item => item.filter_type !== 'start')
            this.caseFilters = this.caseFilters.filter(item => item.filter_type !== 'end')
          } else {
            this.caseFilters = this.caseFilters.filter(item => item.value !== filter.value)
          }
        }

        this.$store.commit('update_case_filters', this.caseFilters)

        if(!['end','start'].includes(filter.filter_type)) {
          this.filterCases()
        }
          
      }
    },
    beforeDestroy: function() {
      clearInterval(this.refresh)
    }
}
</script>
