<template>
  <CCol>
    <h1>List Management<button aria-label="Documentation" type="button" class="kb" onclick="window.open('https://docs.reflexsoar.com/en/latest/intel-lists')"><CIcon name='cil-book' size="lg"/></button></h1><br>
    <CAlert :show.sync="alert.show" :color="alert.type" closeButton>
      {{alert.message}}
    </CAlert>      
    <CCard>
      <CCardHeader>
        <CButton color="primary" @click="createListModal()">New List</CButton>
      </CCardHeader>
      <CCardBody>
      <CDataTable
          :hover="hover"
          :striped="striped"
          :bordered="bordered"
          :small="small"
          :fixed="fixed"
          :items="lists"
          :fields="fields"
          :items-per-page="small ? 25 : 10"
          table-filter
          :dark="dark"
          :sorter='{external: true, resetable: true}'
          :sorterValue='{column: "name", asc: true}'
          :loading="loading"
      >
      <template #name="{item}">
          <td>
              <span v-if="item.active"><CBadge class="tag" color="success">Active</CBadge>&nbsp;</span>
              <span v-if="!item.active"><CBadge class="tag" color="danger">Inactive</CBadge>&nbsp;</span>
              <b>{{item.name}}</b><br>
              <span class="list-attributes">
                <span v-if="item.global_list"><CBadge color="secondary" class="tag"><i class="fas fa-globe"></i> Global List</CBadge></span>
                <span v-if="item.tag_on_match"><CBadge color="secondary" class="tag"><i class="fas fa-tag"></i> Tag On Match</CBadge></span>
                <span v-if="item.flag_ioc"><CBadge color="danger" class="tag"><i class="fas fa-flag"></i> IOC</CBadge></span>
                <span v-if="item.flag_safe"><CBadge color="success" class="tag"><i class="fas fa-flag"></i> Safe</CBadge></span>
                <span v-if="item.flag_spotted"><CBadge color="warning" class="tag"><i class="fas fa-flag"></i> Spotted</CBadge></span>
              </span>
          </td>
      </template>
      <template #organization="{item}">
        <td>
          <OrganizationBadge :uuid="item.organization"/>
        </td>
      </template>
      <template #list_type="{item}">
        <td>
          <CBadge class="tag" color="secondary">{{item.list_type}}</CBadge>
        </td>
      </template>
      <template #data_type_name="{item}">
        <td>
          <CBadge class="tag" color="secondary">{{item.data_type_name}}</CBadge>
        </td>
      </template>
      <template #value_count="{item}">
        <td>
          <span v-if="item.value_count > 0">{{item.value_count}}</span><span v-else>0</span>
        </td>
      </template>
      <template #tag_on_match="{item}">
        <td>
          <CSwitch color="success" label-on="Yes" label-off="No" :checked.sync="item.tag_on_match"/>
        </td>
      </template>
      <template #active="{item}">
        <td>
          <CSwitch color="success" label-on="Yes" label-off="No" :checked.sync="item.active" disabled/>
        </td>
      </template>
      <template #actions="{item}">
          <td style="min-width:25px" class="text-right">
            <CButton v-bind:hidden="!current_user.default_org && item.organization != current_user.organization" aria-label="Edit List" @click="editListModal(item.uuid)" size="sm" color="info" v-c-tooltip="{content:'Edit List', placement:'left'}"><CIcon name='cilPencil'/></CButton>&nbsp;
            <CButton v-bind:hidden="!current_user.default_org && item.organization != current_user.organization" aria-label="Delete List" @click="deleteListModal(item.uuid)" size="sm" color="danger" v-c-tooltip="{content:'Delete List', placement:'left'}"><CIcon name='cilTrash'/></CButton>&nbsp;
          </td>
        </template>      
      </CDataTable>
      </CCardBody>
      <CRow>
        <CCol>
          <CCardBody>
            <CPagination :activePage.sync="active_page" :pages="pagination.pages"/>
          </CCardBody>
        </CCol>
      </CRow>
    </CCard>
    <CModal :title="modal_title" size="xl" :show.sync="modal_status" :closeOnBackdrop="false">{{organization}}
      <CAlert :show.sync="this.error" color="danger" closeButton>
            {{error_message}}
      </CAlert>
      
        <CTabs :activeTab.sync="step" :fade="false" variant="pills" :vertical="{ navs: 'col-md-2', content: 'col-md-10' }">
          <CTab title="1. List Details">
            <h3>List Details</h3>
            <CSelect label="Organization" placeholder="Select an organization" v-if="current_user.permissions.view_organizations" :value.sync="list_data.organization" :options="organizations" @change="reloadDataTypes"/>
            <CInput v-model="list_data.name" label="Name" placeholder="A friendly name for the list" v-bind:required="modal_submit_text == 'Create'"/>
            <CRow>
              <CCol col="12" lg="6">
                <CSelect :options="list_types" :value.sync="list_data.list_type" label="List Type" placeholder="Select a list type" v-bind:required="modal_submit_text == 'Create'"/>
              </CCol>
              <CCol col="12" lg="6">
                <CSelect :disabled="data_type_list.length == 0" :options="data_type_list" :value.sync="list_data.data_type.uuid" label="Data Type" placeholder="Select the data type this list contains" v-bind:required="modal_submit_text == 'Create'"/>
              </CCol>
            </CRow>
            <CRow v-if="list_data.list_type === 'csv'">
              <CCol col='12'>
                <CInput v-model="list_data.csv_headers" label="Column Headers" placeholder="value,sha256,sha1,md5,ip,vthash,ssdeep,imphash,family,extension" description="A comma separated list of CSV fields"/>
              </CCol>
              <CCol col='12'>
                <CInput v-model="list_data.csv_headers_data_types" label="Column Data Types" placeholder="generic,sha256,sha1,md5,ip,v5hash,user,hostname,url" description="A comma separated list of data types that match the above columns.  Use the value nomatch for fields to skip matching on"/>
              </CCol>
            </CRow>
            <CRow>
          <CCol>
            <div class="form-input">  
              <label>Tag Observables on list match?</label><br>
              <CSwitch color="success" label-on="Yes" label-off="No" :checked.sync="list_data.tag_on_match"/><br>
              <span v-if="list_data.tag_on_match">Observables that match this list will be tagged with <code>list:{{list_data.name.replace(' ','-').toLowerCase()}}</code></span>
            </div>
          </CCol>
          <CCol>
            <div class="form-input">  
              <label>List Active</label><br>
              <CSwitch color="success" label-on="Yes" label-off="No" :checked.sync="list_data.active"/>
            </div>
            
          </CCol>
          <CCol>
          <div class="form-input">
            <span v-if="current_user.default_org">
              <label>Global List</label><br>
              <CSwitch color="success" label-on="Yes" label-off="No" :checked.sync="list_data.global_list"/>
            </span>
            </div>
            </CCol>
          <!--<CCol>
            <div class="form-input">  
              <label>To Memcached</label><br>
              <CSwitch color="success" label-on="Yes" label-off="No" :checked.sync="list_data.to_memcached"/>
            </div>
          </CCol>-->
        </CRow>
          </CTab>
          <CTab title="2. External Feed">
            <h3>External Feed</h3>
            <p>External polling allows the system to fetch Intelligence from external sources.  Once enabled, the values in this list will be automatically polled and can not be manually manipulated.</p>
            <label>Enable External Polling</label><br>
            <CSwitch :checked.sync="external_polling" label-on="Yes" label-off="No" color="success"/>
            <CInput :disabled="!external_polling" v-model="list_data.url" label="URL" placeholder="A URL to poll values from on a periodic basis"/>
            <CRow>
              <CCol col="12" lg="6">
                <CInput :disabled="!external_polling" v-model="list_data.poll_interval" label="Polling Interval" placeholder="Enter a value in minutes e.g. 60" description="How often to poll the URL for new data (minutes)"/>
              </CCol>
            </CRow>
          </CTab>
          <CTab title="3. Values">
            <h3>List Values</h3>
            <CAlert color="warning" :show.sync="external_polling">
              While external polling is enabled the manual addition of values is disabled.  Return to the previous step if this was enabled in error.
            </CAlert>
            <CTextarea label="Values" v-model="list_data.values" placeholder="Enter values separated by new lines" rows="10" cols="50" wrap="off" :disabled="external_polling"/>
          </CTab>
          <CTab title ="4. Flags">
            <h3>Flags</h3>
            <p>When an observable matches a value on this list, the select flags will be set on the observable</p>
            <CRow>
              <CCol>
                <label for="ioc">IOC</label><br>
                <CSwitch :checked.sync="list_data.flag_ioc" label-on="Yes" label-off="No" color="success"/>
              </CCol>
              <CCol>
                <label for="ioc">Safe</label><br>
                <CSwitch :checked.sync="list_data.flag_safe" label-on="Yes" label-off="No" color="success"/>
              </CCol>
              <CCol>
                <label for="ioc">Spotted</label><br>
                <CSwitch :checked.sync="list_data.flag_spotted" label-on="Yes" label-off="No" color="success"/>
              </CCol>
              <!--<CCol>
                <label for="ioc">Adjust TLP</label><br>
                <CSwitch :checked.sync="list_data.change_tlp" label-on="Yes" label-off="No" color="success"/>
              </CCol>-->
            </CRow>
            <!--<CRow v-if="list_data.change_tlp">
              <CCol col="6">
                <CInput v-model="list_data.new_tlp" label="New TLP" placeholder="Enter a TLP value" description="The TLP value to set the observable to"/>
              </CCol>
            </CRow>-->
          </CTab>
          <CTab title="5. Review">
            <h3>Review List Details</h3>
            <CRow v-if="current_user.default_org"><br><br>
              <CCol>
                <label>Organization</label><br>
                <OrganizationBadge :uuid="list_data.organization"/><br><br>
              </CCol>
            </CRow>
            <CRow>
              <CCol>
                <label>List Name</label><br>
                {{list_data.name}}<br><br>
              </CCol>
              <CCol>
                <label>List Type</label><br>
                {{list_data.list_type}}
              </CCol>
              <CCol>
                <label>Data Type</label><br>
                {{list_data.data_type.name}}<br><br>
              </CCol>
            </CRow>
            <CRow>
              <CCol>
                <label>Tag Observables on Match</label><br>
                <CBadge :color="list_data.tag_on_match ? 'success' : 'danger'">{{list_data.tag_on_match ? 'Yes' : 'No'}}</CBadge>
              </CCol>
              <CCol>
                <label>To Memcached</label><br>
                <CBadge :color="list_data.to_memcached ? 'success' : 'danger'">{{list_data.to_memcached ? 'Yes' : 'No'}}</CBadge>
              </CCol>
              <CCol>
                <label>List Active</label><br>
                <CBadge :color="list_data.active ? 'success' : 'danger'">{{list_data.active ? 'Yes' : 'No'}}</CBadge>
              </CCol>
            </CRow>
          </CTab>
        </CTabs>
      <template #footer>
        <CButton @click="dismiss()" color="secondary">Cancel</CButton>
        <CButton v-if="step > 0 && step <= last_step" @click="step -= 1" color="secondary">Previous</CButton>
        <CButton v-if="step != last_step" @click="step += 1" color="primary">Next</CButton>
        <CButton @click="modal_action()" v-if="step == last_step" type="submit" form="listForm" color="primary">{{modal_submit_text}}</CButton>
      </template>
    </CModal>
    <CModal title="Delete List" color="danger" :centered="true" :show.sync="delete_modal">
      <CForm id="deleteForm" @submit.prevent="deleteList(list_data.uuid)">
        Are you sure you want to delete <b>{{list_data.name}}</b>?   Type the list name in the box below to confirm your intent.
        <CForm id="delete-list-confirm">
          <CInput
            v-model="delete_confirm"
            label="List"
            required
          ></CInput>
        </CForm>
      </CForm>
      <template #footer>
        <CButton @click="dismiss()" color="secondary">No</CButton>
        <CButton type="submit" form="deleteForm" color="danger">Yes</CButton>
      </template>
    </CModal>
  </CCol>
</template>

<style scoped>
.list-attributes > span {
  margin-right: 4px;
}

.list-attributes > div {
  display: inline-block;
  margin-right: 4px;
  padding-bottom: 3px;
}
</style>

<script>
import {mapState} from "vuex";
import OrganizationBadge from './OrganizationBadge'
export default {
    name: 'ListsList',
    components: {
      OrganizationBadge
    },
    props: {
    items: Array,
    fields: {
      type: Array,
      default () {
        return ['name', 'list_type', {key: 'data_type_name', label: 'Data Type'}, 'value_count', {key: 'actions', label: ''}]
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
    dark: Boolean
    },
    computed: mapState(['current_user','status','alert','lists','data_types', 'pagination']),
    created: function () {
      if(this.current_user.default_org) {
        if (!this.fields.includes('organization')) {
          this.fields.splice(1,0,'organization')
        }
        
      }
      this.loading = true
      this.$store.dispatch('getLists',{}).then(resp => {
        if(!this.current_user.default_org) {
          this.getDataTypes()
        }
        this.loading = false
      })
    },
    watch: {
      modal_status: function () {
        if(!this.modal_status) {
          this.reset()
        }
      }
    },
    data(){
      return {
        loading: false,
        list_data: {
          values: "",
          data_type: { uuid: ''},
          tag_on_match: false,
          active: true,
          organization: "",
          csv_headers: '',
          csv_headers_data_types: '',
          flag_safe: false,
          flag_ioc: false,
          flag_spotted: false
        },
        modal_action: null,
        modal_status: false,
        modal_title: "",
        modal_submit_text: 'Create',
        delete_modal: false,
        create_list_modal: false,
        error: false,
        error_message: "",
        delete_confirm: "",
        list_types: ['values','patterns','csv'],
        data_type_list: [],
        organizations: [],
        organization: null,
        active_page: 1,
        step: 0,
        last_step: 4,
        external_polling: false
      }
    },
    watch: {
      active_page: function() {
        this.reloadLists(this.active_page)
      }
    },
    methods: {
      reloadDataTypes(event) {
        this.loading = true
        this.$store.dispatch('getDataTypes', {organization: event.target.value}).then(() => {
          this.data_type_list = this.data_types.map(item => { return {'label': item.name, 'value': item.uuid}})
          this.loading = false
        })
      },
      reloadLists(page) {
        this.loading = true
        this.$store.dispatch('getLists',{page: page}).then(() => {
          this.loading = false
        })
      },
      mapOrgToName(uuid) {
        let org = this.$store.getters.organizations.filter(o => o.uuid === uuid)
        if (org.length > 0) {
          return org[0].name
        } else {
          return "Unknown"
        }
      },
      fieldPopulated(field) {
        if (field) {
          return field.length > 0;
        } else {
          return false
        }        
      },
      createListModal() {
        this.reset()
        this.modal_action = this.createList
        this.modal_title = 'Create List'
        this.modal_status = true
        this.modal_submit_text = 'Create'
        this.organizations = this.$store.getters.organizations.map((o) => { return {label: o.name, value: o.uuid}})
      },
      createList() {
        let ld = {}
        Object.assign(ld,this.list_data)
        ld.data_type_uuid = ld.data_type.uuid

        ld.flag_spotted = this.list_data.flag_spotted ? true : false
        ld.flag_safe = this.list_data.flag_safe ? true : false 
        ld.flag_ioc = this.list_data.flag_ioc ? true : false 

        delete ld['data_type']
        ld.active = true
        if(!this.external_polling) {
          delete ld['url']
          delete ld['poll_interval']
        }
        this.$store.dispatch('createList', ld).then(resp => {
          this.modal_status = false
        }).catch(err => {
          this.error = true
          this.error_message = err.response.data.message
        })
      },
      editListModal(uuid) {
        this.step = 0
        this.modal_title = "Edit List"
        this.modal_submit_text = 'Edit'
        this.modal_mode = 'edit'
        this.modal_action = this.editList
        Object.assign(this.list_data, this.lists.find(list => list.uuid === uuid))
        if(this.list_data.url) {
          this.external_polling = true
        }
        
        this.organizations = this.$store.getters.organizations.map((o) => { return {label: o.name, value: o.uuid}})
        this.modal_status = true
      },
      editList() {
        let list = {
          name: this.list_data.name,
          organization: this.list_data.organization,
          list_type: this.list_data.list_type,
          data_type_uuid: this.list_data.data_type.uuid,
          values: this.list_data.values,
          tag_on_match: this.list_data.tag_on_match,
          global_list: this.list_data.global_list,
          url: this.list_data.url,
          poll_interval: this.list_data.poll_interval,
          to_memcached: this.list_data.to_memcached,
          active: this.list_data.active,
          csv_headers: this.list_data.csv_headers,
          csv_headers_data_types: this.list_data.csv_headers_data_types,
          flag_ioc: this.list_data.flag_ioc ? true : false,
          flag_safe: this.list_data.flag_safe ? true : false,
          flag_spotted: this.list_data.flag_spotted ? true : false
        }

        let uuid = this.list_data.uuid
        this.$store.dispatch('updateList', {uuid, data: list}).then(resp => {
          //let listIndex = this.lists.findIndex((list => list.uuid == uuid))
          //Object.assign(this.lists[listIndex], resp.data)
          this.modal_status = false
        }).catch(err => {
          this.error = true
          this.error_message = err.response.data.message
        })

      },
      deleteListModal(uuid) {
        this.list_data = this.lists.find(list => list.uuid === uuid)
        this.delete_confirm = ""
        this.delete_modal = true
      },
      deleteList(uuid) {
        let confirm = this.delete_confirm
        if (this.list_data.name == confirm) {
          this.$store.dispatch('deleteList', uuid).then(resp => {
            //let listIndex = this.lists.findIndex((list => list.uuid == uuid))
            //this.lists.splice(listIndex, 1)
            this.delete_modal = false
          })
        }
      },      
      reset() {
        this.list_data = {
          values: "",
          data_type: { uuid: ''},
          tag_on_match: false,
          url: null,
          poll_interval: null,
          to_memcached: false,
          active: true,          
          csv_headers: '',
          csv_headers_data_types: ''
        }
        this.step = 0
        this.external_polling = false
        this.error = false
        this.error_message = ""
      },
      dismiss() {
        this.reset()
        this.modal_status = false
      },
      getDataTypes(organization) {
        let org = null
        if (this.current_user.default_org && organization != '') {
          org = organization
        }
         
        this.$store.dispatch('getDataTypes', {organization: org}).then(resp => {
           this.data_type_list = this.data_types.map(item => { return {'label': item.name, 'value': item.uuid}})
        })
      }
    }
}
</script>
