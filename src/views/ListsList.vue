<template>
  <CCol>
    <h2>List Management</h2><br>
    <CAlert :show.sync="alert.show" :color="alert.type" closeButton>
      {{alert.message}}
    </CAlert>      
    <div v-if="status == 'loading'" style="margin: auto; text-align:center; verticle-align:middle;">
      <CSpinner
            color="dark"
            style="width:6rem;height:6rem;"
        />
    </div>
    <CCard v-else>
      <CCardHeader>
        <CButton color="primary" @click="createListModal()">New List</CButton>
      </CCardHeader>
      <CDataTable
          :hover="hover"
          :striped="striped"
          :bordered="bordered"
          :small="small"
          :fixed="fixed"
          :items="lists"
          :fields="fields"
          :items-per-page="small ? 25 : 10"
          :dark="dark"
          :sorter='{external: true, resetable: true}'
          pagination
      >
      <template #name="{item}">
          <td>
              {{item.name}}
          </td>
      </template>
      <template #organization="{item}">
        <td>
          <CButton class="tag" size="lg" color="secondary">{{mapOrgToName(item.organization)}}</CButton>
        </td>
      </template>
      <template #data_type="{item}">
        <td>
          {{item.data_type.name}}
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
            <CButton @click="editListModal(item.uuid)" size="sm" color="primary">Edit</CButton>&nbsp;
            <CButton @click="deleteListModal(item.uuid)" size="sm" color="danger">Delete</CButton>&nbsp;
          </td>
        </template>      
      </CDataTable>
    </CCard>
    <CModal :title="modal_title" :centered="true" size="lg" :show.sync="modal_status" :closeOnBackdrop="false">
      <CAlert :show.sync="this.error" color="danger" closeButton>
            {{error_message}}
      </CAlert>
      <CForm @submit.prevent="modal_action()" id="listForm">
        <CSelect label="Organization" placeholder="Select an organization" v-if="current_user.role.permissions.view_organizations" v-model="list_data.organization" :options="organizations"/>
        <CInput v-model="list_data.name" label="Name" placeholder="A friendly name for the list" v-bind:required="modal_submit_text == 'Create'"/>
        <CRow>
          <CCol col="12" lg="6">
            <CSelect :options="list_types" :value.sync="list_data.list_type" label="List Type" placeholder="Select a list type" v-bind:required="modal_submit_text == 'Create'"/>
          </CCol>
          <CCol col="12" lg="6">
            <CSelect :options="data_type_list" :value.sync="list_data.data_type.uuid" label="Data Type" placeholder="Select the data type this list contains" v-bind:required="modal_submit_text == 'Create'"/>
          </CCol>
        </CRow>
        <CInput v-model="list_data.url" label="URL" placeholder="A URL to poll values from on a periodic basis"/>
        <CRow>
          <CCol col="12" lg="6">
            <CInput v-model="list_data.poll_interval" label="Polling Interval" placeholder="60" description="How often to poll the URL for new data (minutes)"/>
          </CCol>
        </CRow>
        <CTextarea label="Values" v-model="list_data.values" placeholder="Enter values separated by new lines" rows="10" cols="50" wrap="off" :disabled="list_data.url"/>
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
              <label>To Memcached</label><br>
              <CSwitch color="success" label-on="Yes" label-off="No" :checked.sync="list_data.to_memcached"/>
            </div>
          </CCol>
        </CRow>
        
      </CForm>
      <template #footer>
        <CButton @click="dismiss()" color="secondary">Cancel</CButton>
        <CButton type="submit" form="listForm" color="primary">{{modal_submit_text}}</CButton>
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

<script>
import {mapState} from "vuex";
export default {
    name: 'ListsList',
    props: {
    items: Array,
    fields: {
      type: Array,
      default () {
        return ['name', 'list_type', 'data_type', 'value_count', 'tag_on_match', 'active', 'actions']
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
    computed: mapState(['current_user','status','alert','lists','data_types']),
    created: function () {
      this.loadData()
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
        list_data: {
          values: "",
          data_type: { uuid: ''},
          tag_on_match: false,
          active: true,
          organization: ""
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
        list_types: ['values','patterns'],
        data_type_list: [],
        organizations: []
      }
    },
    methods: {
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
        delete ld['data_type']
        ld.active = true
        this.$store.dispatch('createList', ld).then(resp => {
          this.modal_status = false
        }).catch(err => {
          this.error = true
          this.error_message = err.response.data.message
        })
      },
      editListModal(uuid) {
        this.modal_title = "Edit List"
        this.modal_submit_text = 'Edit'
        this.modal_mode = 'edit'
        this.modal_action = this.editList
        Object.assign(this.list_data, this.lists.find(list => list.uuid === uuid))
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
          url: this.list_data.url,
          poll_interval: this.list_data.poll_interval,
          to_memcached: this.list_data.to_memcached,
          active: this.list_data.active
        }

        let uuid = this.list_data.uuid
        this.$store.dispatch('updateList', {uuid, data: list}).then(resp => {
          let listIndex = this.lists.findIndex((list => list.uuid == uuid))
          Object.assign(this.lists[listIndex], resp.data)
          this.modal_status = false
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
            let listIndex = this.lists.findIndex((list => list.uuid == uuid))
            this.lists.splice(listIndex, 1)
            this.delete_modal = false
          })
        }
      },      
      reset() {
        this.list_data = {
          values: "",
          data_type: { uuid: ''},
          tag_on_match: false
        }
        this.error = false
        this.error_message = ""
      },
      dismiss() {
        this.reset()
        this.modal_status = false
      },
      loadData: function() {
        if(this.current_user.role.permissions.view_organizations) {
          if (!this.fields.includes('organization')) {
            this.fields.splice(1,0,'organization')
          }
        }
        this.$store.dispatch('getLists')
        this.$store.dispatch('getDataTypes').then(resp => {
           this.data_type_list = this.$store.getters.data_types_list
        })
      }
    }
}
</script>
