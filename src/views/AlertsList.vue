<template>
  <CRow>
    <CCol col>
      <CCard>
          <CCardHeader>
            <CRow>
              <CCol>
                <b>Events</b>
              </CCol>
              <CCol class="text-right">
                <CDropdown 
                        toggler-text="Actions" 
                        color="secondary"
                        size="sm" v-bind:disabled="selected.length < 1"
                    >
                        <CDropdownItem @click="dismissEventModal = !dismissEventModal">Dismiss Event</CDropdownItem>
                        <CDropdownItem @click="runPlaybookModal = !runPlaybookModal">Run Playbook</CDropdownItem>
                        <CDropdownItem @click="createCaseModal = !createCaseModal">Create Case</CDropdownItem>
                        <CDropdownItem @click="mergeIntoCaseModal = !mergeIntoCaseModal">Merge into Case</CDropdownItem>
                        <CDropdownDivider/>
                        <CDropdownItem @click="deleteEventModal = !deleteEventModal">Delete</CDropdownItem>
                    </CDropdown>
                </CCol>
            </CRow>
          </CCardHeader>
          <CCardBody>
              <CDataTable
                  :items="events"
                  :fields="fields"
                  items-per-page-select
                  :items-per-page="10"
                  :striped="true"
                  :sorter='{resetable:true}'
                  pagination
              >
              <template #select="{item}">
                <td class="text-center">
                    <input v-if="!item.case_uuid" type="checkbox" :value="item.uuid" v-model="selected"/>
                </td>
              </template>
              <template #created_at="{item}">
                  <td>
                      {{item.created_at | moment('from', 'now')}}
                  </td>
              </template>
              <template #name="{item}">
                  <td>
                      <router-link :to="`${item.uuid}`">{{item.title}}</router-link>
                  </td>
              </template>
              <template #status="{item}">
                <td>
                  {{item.status.name}}
                </td>
              </template>
              <template #tags="{item}">
                <td>
                  <li style="display: inline; margin-right: 2px;" v-for="tag in item.tags" :key="tag.name"><CButton color="primary" class="tag"  size="sm" disabled>{{ tag.name }}</CButton></li>
                </td>
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
              </CDataTable>
          </CCardBody>
      </CCard>
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

<script>
import {mapState} from "vuex";
import {vSelect} from "vue-select";
import CreateCaseModal from './CreateCaseModal'
export default {
    name: 'Events',
    components: {
      CreateCaseModal
    },
    props: {
    items: Array,
    fields: {
      type: Array,
      default () {
        return ['select','created_at', 'name', 'status', 'severity', 'tlp', 'observable_count', 'tags']
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
    event: false
    },
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
        status: "",
        events: [],
        case_tlp: 2,
        case_severity: 1,
        use_case_template: false,
        dismissCountDown: 10,
        selectAll: false,
        selected: Array(),
        dismissEventModal:false,
        deleteEventModal: false,
        createCaseModal: false,
        dismissalComment: "",
        dismissalReason: null
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
      loadData: function() {
        this.loading = true
        this.$store.dispatch('getEvents').then(resp => {
            this.events = resp.data
            this.loading = false
        })
      },
      select() {
        this.selected = [];
        if (!this.selectAll) {
          for (let i in this.events) {
            this.selected.push(this.events[i].uuid)
          }
        }
      }  
    },
    beforeDestroy: function() {
      clearInterval(this.refresh)
    }
}
</script>
