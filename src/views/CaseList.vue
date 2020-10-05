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
      <CRow style="padding:10px">
        <CCol col="10">
          <CButton color="primary" @click="newCaseModal = !newCaseModal">New Case</CButton>
        </CCol>
        <CCol col="2" class="text-right">
          <multiselect 
                    v-model="fields"
                    :options="available_fields"
                    multiple
                    :close-on-select="false">
                    <template slot="selection" slot-scope="{ values, search, isOpen }"><span class="multiselect__single" v-if="values.length &amp;&amp; !isOpen">{{ values.length }} fields selected</span></template>
                </multiselect>
        </CCol>
      </CRow>
              <CDataTable
                  :hover="hover"
                  :striped="striped"
                  :bordered="bordered"
                  :small="small"
                  :fixed="fixed"
                  :items="cases"
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
                        <CBadge color="info" size="sm" style="padding: 5px; margin-top:10px; margin-right:3px;">{{ tag.name }}</CBadge>
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
                  <CButton :color="getSeverityColor(item.severity)" size="sm">{{getSeverityText(item.severity)}}</CButton>
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
        this.loadData()
        this.refresh = setInterval(function() {
          this.loadData()
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
        available_fields: ['title','status','events','tlp','severity','owner','actions','created_at','modified_at']
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
              this.cases = this.$store.getters.cases
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
      loadData: function() {
        let fields = 'title,status,tlp,severity,owner,uuid,id,event_count'
        this.loading = true
        this.$store.dispatch('getCases', fields).then(resp => {
            this.cases = resp.data
            this.loading = false
        })
      }
    },
    beforeDestroy: function() {
      clearInterval(this.refresh)
    }
}
</script>
