<template>
  <CRow>
    <CCol col>
      <CButton color="primary" to="create">New Credential</CButton><br><br>
      <CCard>
          <CCardHeader>
              <b>Credentials</b>
          </CCardHeader>
          <CCardBody>
              <CDataTable
                  :hover="hover"
                  :striped="striped"
                  :bordered="bordered"
                  :small="small"
                  :fixed="fixed"
                  :items="credentials"
                  :fields="fields"
                  :items-per-page="small ? 25 : 10"
                  :dark="dark"
                  :sorter='{external: true, resetable: true}'
                  pagination
              >
              <template #name="{item}">
                  <td>
                      <router-link :to="`${item.uuid}`">{{item.name}}</router-link>
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
    name: 'Credentials',
    props: {
    items: Array,
    fields: {
      type: Array,
      default () {
        return ['name', 'description']
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
        this.$store.dispatch('getCredentials')
    },
    computed: mapState(['credentials']),
    data(){
      return {
        name: "",
        description: "",
        url: "",
        orgs: Array,
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
