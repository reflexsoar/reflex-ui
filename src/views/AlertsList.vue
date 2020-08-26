<template>
  <CRow>
    <CCol col>
      <CCard>
          <CCardHeader>
              <b>Alerts</b>
          </CCardHeader>
          <CCardBody>
              <CDataTable
                  :hover="hover"
                  :striped="striped"
                  :bordered="bordered"
                  :small="small"
                  :fixed="fixed"
                  :items="alerts"
                  :fields="fields"
                  :items-per-page="small ? 25 : 10"
                  :dark="dark"
                  :sorter='{external: true, resetable: true}'
                  pagination
              >
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
                  <li style="display: inline; margin-right: 2px;" v-for="tag in item.tags" :key="tag.name"><CButton color="dark" size="sm">{{ tag.name }}</CButton></li>
                </td>
              </template>
              <template #tlp="{item}">
                <td>
                  <CButton v-if="item.tlp == 0" color="light" size="sm">TLP:WHITE</CButton>
                  <CButton v-if="item.tlp == 1" color="success" size="sm">TLP:GREEN</CButton>
                  <CButton v-if="item.tlp == 2" color="warning" size="sm">TLP:AMBER</CButton>
                  <CButton v-if="item.tlp == 3" color="danger" size="sm">TLP:RED</CButton>
                </td>
              </template>
              <template #severity="{item}">
                <td>
                  <CButton v-if="item.tlp == 0" color="light" size="sm">L</CButton>
                  <CButton v-if="item.tlp == 1" color="warning" size="sm">M</CButton>
                  <CButton v-if="item.tlp == 2" color="danger" size="sm">H</CButton>
                  <CButton v-if="item.tlp == 3" color="dark" size="sm">!!</CButton>
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
        return ['name', 'status', 'severity', 'tlp', 'observable_count', 'tags']
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
    created() {
        this.$store.dispatch('getAlerts')
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
      }
    }
}
</script>
