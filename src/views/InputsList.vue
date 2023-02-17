<template>
  <CRow>
    <CCol>
      <div style="padding: 10px;"><CButton color="primary" @click="newInput()">New Input</CButton></div>

              <CDataTable
                  :hover="hover"
                  :items="filtered_inputs"
                  :fields="fields"
                  :loading="loading"
                  :items-per-page="small ? 25 : 10"                 
                  :sorter='{external: false, resetable: true}'
                  column-filter
                  pagination
                  style="border-top: 1px solid #cfcfcf;"
                  @update:sorter-value="sort($event)"
                  :column-filter-value.sync="column_filters"
              >
              <template #organization-filter="{item}">
                <RMultiCheck :items="organizations" @checked="filter_organizations"></RMultiCheck>
              </template>
              <template #name="{item}">
                  <td>
                      <b>{{item.name}}</b>
                  </td>
              </template>
              <template #organization="{item}">
                <td>
                  <OrganizationBadge :uuid="item.organization"/>
                </td>
              </template>
              <template #tags="{item}">
                <td>
                  <li style="display: inline; margin-right: 2px;" v-for="tag in item.tags" :key="tag"><CButton color="primary" size="sm" disabled>{{ tag }}</CButton></li>
                </td>
              </template>
              <template #actions="{item}">
                <td class='text-right'>
                  <CButton color="info" size="sm" :to="item.uuid"><CIcon name="cilPencil"/></CButton>&nbsp;
                  <CButton color="secondary" size="sm" @click="cloneInput(item.uuid)"><CIcon name="cilCopy"/></CButton>
                </td>
              </template>
              </CDataTable>
    </CCol>
  </CRow>
</template>

<style scoped>
.position-relative {
  position: none;
}
</style>

<script>
import {mapState} from "vuex";
import OrganizationBadge from './OrganizationBadge'
import RMultiCheck from './components/MultiCheck.vue'
export default {
    name: 'Inputs',
    components: {
      OrganizationBadge,
      RMultiCheck
    },
    props: {
    items: Array,
    fields: {
      type: Array,
      default () {
        return ['name', {
          key:'description', sorter:false}, 'tags', 'actions']
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
    computed: {
      ...mapState(['current_user','inputs', 'pagination', 'source_input']),
      filtered_inputs() {
        if (this.org_filter.length == 0) {
          return this.inputs
        } else {
          return this.inputs.filter((input) => {
            return this.org_filter.includes(input.organization)
          })
        }
      }
    },
    created: function () {
        if(this.current_user.default_org) {
          if (!this.fields.includes('organization')) {
            this.fields.splice(1,0,{key:'organization', filterable: false, sorter: false})
            
          }
          this.organizations = this.$store.getters.organizations.map((o) => { return {label: o.name, value: o.uuid}})
        }
        this.loadData()
        
    },
    data(){
      return {
        name: "",
        description: "",
        url: "",
        organizations: Array,
        dismissCountDown: 10,
        loading: true,
        active_page: 1,
        page_size: 10000,
        org_filter: [],
        column_filters: {}
      }
    },
    watch: {
      active_page: function() {
        this.reloadInputs(this.active_page)
      }
    },
    methods: {
      sort(event) {
        let sort_direction = event.asc ? 'asc' : 'desc'
        event.column = event.column ? event.column : 'created_at'
        this.reloadInputs(this.active_page, event.column, sort_direction)
      },
      newInput() {
        this.$store.commit('clone_input', null)
        this.$router.push('/inputs/create')
      },
      cloneInput(uuid) {
        this.$store.commit('clone_input', this.inputs.find(item => item.uuid === uuid))
        this.$router.push('/inputs/create')
      },
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
      reloadInputs(page, sort_by, sort_direction) {
        this.loading = true
          this.$store.dispatch('getInputs',{page_size: this.page_size, page: page, sort_by: sort_by, sort_direction: sort_direction}).then(() => {
            this.loading = false
        })
      },
      loadData: function() {
        this.loading = true
        
        this.$store.dispatch('getInputs', {page_size: this.page_size}).then(resp => {
            this.loading = false
        })
      },
      filter_organizations(val) {
        if(val === null) {
          this.org_filter = []
          return
        }        
        if (this.org_filter.includes(val)) {
          this.org_filter = this.org_filter.filter(o => o !== val)
        } else {
          this.org_filter.push(val)
        }
      }
    },
    beforeDestroy: function() {
      clearInterval(this.refresh)
    }
}
</script>
