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
      <template #data_type="{item}">
        <td>
          {{item.data_type.name}}
        </td>
      </template>
      <template #tag_on_match="{item}">
        <td>
          <CSwitch color="success" label-on="Yes" label-off="No" :checked.sync="item.tag_on_match"/>
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
        <CInput v-model="list_data.name" label="Name" placeholder="A friendly name for the list" v-bind:required="modal_submit_text == 'Create'"/>
        <CSelect :options="list_types" :value.sync="list_data.list_type" label="List Type" placeholder="Select a list type" v-bind:required="modal_submit_text == 'Create'"/>
        <CSelect :options="data_type_list" :value.sync="list_data.data_type.uuid" label="Data Type" placeholder="Select the data type this list contains" v-bind:required="modal_submit_text == 'Create'"/>
        <CTextarea label="Values" v-model="list_data.values" placeholder="Enter values separated by new lines" rows="10" cols="50" wrap="off" v-bind:required="modal_submit_text == 'Create'"/>
        <div class="form-input">  
          <label>Tag Observables on list match?</label><br>
          <CSwitch color="success" label-on="Yes" label-off="No" :checked.sync="list_data.tag_on_match"/><br>
          <span v-if="list_data.tag_on_match">Observables that match this list will be tagged with <code>list:{{list_data.name.replace(' ','-').toLowerCase()}}</code></span>
        </div>
      </CForm>
      <template #footer>
        <CButton @click="dismiss()" color="secondary">Dismiss</CButton>
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
        return ['name', 'list_type', 'data_type', 'value_count', 'tag_on_match', 'actions']
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
    computed: mapState(['status','alert','lists','data_types']),
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
          tag_on_match: false
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
        data_type_list: []
      }
    },
    methods: {
      createListModal() {
        this.modal_action = this.createList
        this.modal_title = 'Create List'
        this.modal_status = true
        this.modal_submit_text = 'Create'
      },
      createList() {
        let ld = {}
        Object.assign(ld,this.list_data)
        ld.data_type_uuid = ld.data_type.uuid
        delete ld['data_type']
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
        this.modal_status = true
      },
      editList() {
        let list = {
          name: this.list_data.name,
          list_type: this.list_data.list_type,
          data_type_uuid: this.list_data.data_type.uuid,
          values: this.list_data.values,
          tag_on_match: this.list_data.tag_on_match
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
        this.$store.dispatch('getLists').then(resp => {
          this.$store.commit('save_lists', resp.data)
        })
        this.$store.dispatch('getDataTypes').then(resp => {
           this.data_type_list = this.$store.getters.data_types_list
        })
      }
    }
}
</script>
