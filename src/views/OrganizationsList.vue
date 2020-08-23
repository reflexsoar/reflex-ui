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
      <CButton color="primary" to="create">New Organization</CButton><br><br>
      <CCard>
          <CCardHeader>
              <b>Organizations</b>
          </CCardHeader>
          <CCardBody>
              <CDataTable
                  :hover="hover"
                  :striped="striped"
                  :bordered="bordered"
                  :small="small"
                  :fixed="fixed"
                  :items="organizations"
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
    name: 'Organizations',
    props: {
    items: Array,
    fields: {
      type: Array,
      default () {
        return ['name', 'description', 'url', 'total_projects']
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
        this.$store.dispatch('getOrganizations').then(resp => {
            this.organizations = resp.data
            this.loading = false
        })
    },
    data(){
      return {
        name: "",
        description: "",
        url: "",
        orgs: Array,
        dismissCountDown: 10,
        loading: true
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
