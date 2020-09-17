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
      <div style="padding:10px"><CButton color="primary" @click="newCaseModal = !newCaseModal">New Case</CButton></div>
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
                  style="border-top: 1px solid #cfcfcf;"
              >
              <template #title="{item}">
                  <td>
                      <router-link :to="`${item.uuid}`">{{item.title}}</router-link>
                  </td>
              </template>
              <template #status="{item}">
                <td>
                  {{item.status.name}}
                </td>
              </template>
              <template #events="{item}">
                <td>{{item.events.length}}</td>
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
              <template #tags="{item}">
                <td>
                  <li style="display: inline; margin-right: 2px;" v-for="tag in item.tags" :key="tag.name"><CButton color="primary" size="sm" disabled>{{ tag.name }}</CButton></li>
                </td>
              </template>
              </CDataTable>
    </CCol>
    <CreateCaseModal :show.sync='newCaseModal'></CreateCaseModal>
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
    fields: {
      type: Array,
      default () {
        return ['title','status','events','tlp','severity','owner','tags']
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
        newCaseModal: false
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
        this.$store.dispatch('getCases').then(resp => {
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
