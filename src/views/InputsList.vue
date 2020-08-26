<template>
  <CRow>
    <CCol col>
      <CButton color="primary" to="create">New Input</CButton><br><br>
      <CCard>
          <CCardHeader>
              <b>Inputs</b>
          </CCardHeader>
          <CCardBody>
              <CDataTable
                  :hover="hover"
                  :striped="striped"
                  :bordered="bordered"
                  :small="small"
                  :fixed="fixed"
                  :items="inputs"
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
              <template #tags="{item}">
                <td>
                  <li style="display: inline; margin-right: 2px;" v-for="tag in item.tags" :key="tag.name"><CButton color="dark" size="sm">{{ tag.name }}</CButton></li>
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
    name: 'Inputs',
    props: {
    items: Array,
    fields: {
      type: Array,
      default () {
        return ['name', 'description', 'tags']
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
        this.$store.dispatch('getInputs')
    },
    computed: mapState(['inputs']),
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
