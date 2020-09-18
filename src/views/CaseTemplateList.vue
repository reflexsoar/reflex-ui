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
      <div style="padding:10px"><CButton color="primary" @click="newCaseTemplateModal = !newCaseTemplateModal">New Case Template</CButton></div>
              <CDataTable
                  :hover="hover"
                  :striped="striped"
                  :bordered="bordered"
                  :small="small"
                  :fixed="fixed"
                  :items="case_templates"
                  :fields="fields"
                  :items-per-page="small ? 25 : 10"
                  :dark="dark"
                  :sorter='{external: true, resetable: true}'
                  pagination
                  style="border-top: 1px solid #cfcfcf;"
              >
              <template #title="{item}">
                  <td>
                      <router-link :to="`${item.uuid}`">{{item.title}}</router-link>
                  </td>
              </template>
              <template #tasks="{item}">
                <td>
                  {{ item.tasks.length }}
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
                  <CButton v-if="item.severity == 1" color="light" size="sm">Low</CButton>
                  <CButton v-if="item.severity == 2" color="warning" size="sm">Medium</CButton>
                  <CButton v-if="item.severity == 3" color="danger" size="sm">High</CButton>
                  <CButton v-if="item.severity >= 4" color="dark" size="sm">Critical</CButton>
                </td>
              </template>
              <template #owner="{item}">
                <td v-if="item.owner.username">{{item.owner.username}}</td>
                <td v-if="!item.owner.username">Unassigned</td>
              </template>
              </CDataTable>
    </CCol>
    <CreateCaseTemplateModal :show.sync='newCaseTemplateModal'></CreateCaseTemplateModal>
  </CRow>
</template>

<script>
import {mapState} from "vuex";
import CreateCaseTemplateModal from './CreateCaseTemplateModal'
export default {
    name: 'CaseTemplates',
    components: {
      CreateCaseTemplateModal
    },
    props: {
    items: Array,
    fields: {
      type: Array,
      default () {
        return ['title','description','tasks','severity','tlp']
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
    alert: false,
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
        newCaseTemplateModal: false
      }
    },
    methods: {
      loadData: function() {
        this.loading = true
        this.$store.dispatch('getCaseTemplates').then(resp => {
            this.case_templates = resp.data
            this.loading = false
        })
      }
    },
    beforeDestroy: function() {
      clearInterval(this.refresh)
    }
}
</script>
