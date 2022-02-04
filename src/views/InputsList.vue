<template>
  <CRow>
    <CCol>
      <h1>Inputs<button type="button" aria-label="Close" class="close" onclick="window.open('https://docs.reflexsoar.com/en/latest/inputs')"><CIcon name='cil-book' size="lg"/></button></h1><br>
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
                  :loading="loading"
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
              <template #organization="{item}">
                <td>
                  <CButton class="tag" size="lg" color="secondary">{{mapOrgToName(item.organization)}}</CButton>
                </td>
              </template>
              <template #tags="{item}">
                <td>
                  <li style="display: inline; margin-right: 2px;" v-for="tag in item.tags" :key="tag"><CButton color="primary" size="sm" disabled>{{ tag }}</CButton></li>
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
    computed: mapState(['current_user','inputs']),
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
        url: "",
        organizations: Array,
        dismissCountDown: 10,
        loading: true
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
      addSuccess: function() {
        if (this.$store.getters.addSuccess == 'success') {
          return true
        } else {
          return false
        }
      },
      loadData: function() {
        this.loading = true
        if(this.current_user.default_org) {
          if (!this.fields.includes('organization')) {
            this.fields.splice(1,0,'organization')
            
          }
          this.organizations = this.$store.getters.organizations.map((o) => { return {label: o.name, value: o.uuid}})
        }
        this.$store.dispatch('getInputs').then(resp => {
            this.loading = false
        })
      }
    },
    beforeDestroy: function() {
      clearInterval(this.refresh)
    }
}
</script>
