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
    <CCol col v-else>
      <CRow>
        <CCol col="12">
            <CCardHeader>
              <CRow>
                <CCol col="10">
                  <li style="display: inline; margin-right: 2px;" v-for="filter in caseFilters" :key="filter.value+filter.dataType"><CButton color="secondary" class="tag"  size="sm" @click="toggleCaseFilter({'dataType': filter.dataType.name, 'value': filter.value})"><b>{{filter.dataType}}</b>: <span v-if="filter.filter_type == 'severity'">{{getSeverityText(filter.value).toLowerCase()}}</span><span v-else>{{ filter.value }}</span></CButton></li><span v-if="caseFilters.length > 0" class="separator">|</span>Showing {{filtered_cases.length}} cases.
                </CCol>
                <CCol col="2" class="text-right">
                  <CButton @click="quick_filters = !quick_filters" color="info" size="sm">Quick Filters</CButton>
                </CCol>
              </CRow>
            </CCardHeader>
            <CCollapse :show="quick_filters">
              <CNav variant="tabs" :justified="true">
                <CNavItem>
                  <div @click="toggleCaseFilter({'filter_type': 'status', 'dataType':'status','value':'New'})">
                    New
                  </div>
                </CNavItem>
                <CNavItem>
                  <div @click="toggleCaseFilter({'filter_type': 'status', 'dataType':'status','value':'In Progress'})">
                    In Progress
                  </div>
                </CNavItem>
                <CNavItem>
                  <div @click="toggleCaseFilter({'filter_type': 'status', 'dataType':'status','value':'Closed'})">
                    Closed
                  </div>
                </CNavItem>
                <CNavItem>
                  <div @click="toggleCaseFilter({'filter_type': 'cases', 'dataType':'cases','value':'My Cases'})">
                    My Cases
                  </div>
                </CNavItem>
                <CNavItem>
                  <div @click="toggleCaseFilter({'filter_type': 'tasks', 'dataType':'tasks','value':'Cases I have Tasks'})">
                    My Tasks
                  </div>
                </CNavItem>
                <CNavItem>
                  <div @click="toggleCaseFilter({'filter_type': 'severity', 'dataType':'severity','value':4})">
                    Critical
                  </div>
                </CNavItem>
                <CNavItem>
                  <div @click="toggleCaseFilter({'filter_type': 'severity', 'dataType':'severity','value':3})">
                    High
                  </div>
                </CNavItem>
                <CNavItem>
                  <div @click="toggleCaseFilter({'filter_type': 'severity', 'dataType':'severity','value':2})">
                    Medium
                  </div>
                </CNavItem>
                <CNavItem>
                  <div @click="toggleCaseFilter({'filter_type': 'severity', 'dataType':'severity','value':1})">
                    Low
                  </div>
                </CNavItem>
              </CNav>
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
              <CDataTable
                  :hover="hover"
                  :striped="striped"
                  :bordered="bordered"
                  :small="small"
                  :fixed="fixed"
                  :items="filtered_cases"
                  :fields="fields"
                  :items-per-page="small ? 25 : 10"
                  :dark="dark"
                  :sorter='{external: true, resetable: true}'
                  pagination
                  :responsive="false"
                  style="border-top: 1px solid #cfcfcf;"
              >
              <template #title="{item}">
                  <td>
                      <router-link :to="`${item.uuid}`">{{item.title}}</router-link><br>
                      <li style="display: inline; margin-right: 2px;" v-for="tag in item.tags" :key="tag.name">
                        <CBadge color="info" size="sm" style="padding: 5px; margin-top:10px; margin-right:3px;cursor: pointer;" @click="toggleCaseFilter({'filter_type': 'tag', 'dataType':'tag','value':tag.name})">{{ tag.name }}</CBadge>
                      </li>
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
                  <CButton :color="getSeverityColor(item.severity)" size="sm" @click="toggleCaseFilter({'filter_type': 'severity', 'dataType':'severity','value':item.severity})">{{getSeverityText(item.severity)}}</CButton>
                </td>
              </template>
              <template #owner="{item}">
                <td>{{(item.owner && item.owner.username) ? item.owner.username : "Unassigned"}}</td>

              </template>
              <template #actions='{item}'>
                <td>
                  <CDropdown toggler-text="Actions" color="secondary" size="sm">
                    <CDropdownItem @click="runPlaybookModal = !runPlaybookModal">Close</CDropdownItem>
                    <CDropdownItem @click="runPlaybookModal = !runPlaybookModal">Execute Playbook</CDropdownItem>
                    <CDropdownDivider />
                    <CDropdownItem @click="showDeleteCaseModal(item.uuid)">Delete</CDropdownItem>
                  </CDropdown>
                </td>
              </template>
              </CDataTable>
    </CCol>
    <CreateCaseModal :show.sync='newCaseModal'></CreateCaseModal>
    <CModal title="Delete Case" color="danger" :centered="true" size="lg" :show.sync="deleteCaseModal">
        <div>
            <p>Deleting a case is a permanent action, all work on the event will be removed and any associated events will be set to <b>New</b> status, are you sure you want to continue?</p>
        </div>
        <template #footer>
            <CButton @click="deleteCaseModal = !deleteCaseModal" color="secondary">Dismiss</CButton>
            <CButton @click="deleteCase()" color="danger">Delete</CButton>
        </template>
    </CModal>
  </CRow>
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
    created: function () {
        this.filterCases()
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
        caseFilters: [{'filter_type':'status','dataType':'status','value':'New'}],
        filtered_cases: [],
        page_data: {}
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
      showDeleteCaseModal(uuid) {
        this.target_case = uuid
        this.deleteCaseModal = !this.deleteCaseModal
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
        let status_filters = []
        let tag_filters = []
        let severity_filter = []
        let search = []
        let owner = []
        let my_cases = false
        let my_tasks = false
        for(let f in this.caseFilters) {
          let filter = this.caseFilters[f]

          if(filter.filter_type == 'status') {
            status_filters.push(filter.value)
          }

          if(filter.filter_type == 'tag') {
            tag_filters.push(filter.value)
          }

          if(filter.filter_type == 'search') {
            search = filter.value
          }

          if(filter.filter_type == 'severity') {
            severity_filter.push(filter.value)
          }

          if(filter.filter_type == 'owner') {
            owner.push(filter.value)
          }

          if(filter.filter_type == 'tasks') {
            my_tasks = true
          }

          if(filter.filter_type == 'cases') {
            my_cases = true
          }
        }

        this.$store.dispatch('getCases', {
          tag: tag_filters,
          status: status_filters,
          severity: severity_filter,
          search: search,
          owner: owner,
          fields: ['title','status','tlp','severity','owner','uuid','id','event_count'],
          my_cases: my_cases,
          my_tasks: my_tasks,
          page: this.current_page,
          page_size: this.card_per_page
        }).then(resp => {
          this.filtered_cases = this.$store.getters.cases
          this.page_data = resp.data.pagination
          this.$store.commit('add_success')
          this.loading = false
        })
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
          this.caseFilters = this.caseFilters.filter(item => item.value !== filter.value)
        }
        this.filterCases()
      }
    },
    beforeDestroy: function() {
      clearInterval(this.refresh)
    }
}
</script>
