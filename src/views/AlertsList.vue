<template>
  <CRow>
    <CCol col>
      <CCard>
          <CCardHeader>
              <b>Alerts</b>
          </CCardHeader>
          <CCardBody>
              <CDataTable
                  :items="alerts"
                  :fields="fields"
                  items-per-page-select
                  :items-per-page="10"
                  pagination
              >
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
                  <li style="display: inline; margin-right: 2px;" v-for="tag in item.tags" :key="tag.name"><CButton color="primary" size="sm" disabled>{{ tag.name }}</CButton></li>
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
  </CRow>
</template>

<script>
import {mapState} from "vuex";
export default {
    name: 'Alerts',
    props: {
    items: Array,
    fields: {
      type: Array,
      default () {
        return ['created_at', 'name', 'status', 'severity', 'tlp', 'observable_count', 'tags']
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
    alert: false
    },
    created: function () {
        this.loadData()
        this.refresh = setInterval(function() {
          this.loadData()
        }.bind(this), 5000)
    },
    computed: mapState(['alerts']),
    data(){
      return {
        name: "",
        description: "",
        severity: 0,
        tlp: 0,
        observable_count: 0,
        tags: [],
        status: "",
        dismissCountDown: 10
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
        this.$store.dispatch('getAlerts').then(resp => {
            this.alerts = resp.data
            this.loading = false
        })
      }
    },
    beforeDestroy: function() {
      clearInterval(this.refresh)
    }
}
</script>
