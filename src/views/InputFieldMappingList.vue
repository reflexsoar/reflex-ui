<template>
  <CRow>
    <CCol>
    
      <div style="padding: 10px;">
      <CAlert :show="true" color="info"><b>Beta Feature</b>: This feature is in beta and requires specific conditions.</CAlert>
      <CButton color="primary" @click="newFieldMappingTemplate()">New Field Mapping</CButton></div>
      {{source_field_mapping_template}}
             <CCardBody><CDataTable
                  :hover="hover"
                  :items="field_mapping_templates"
                  :fields="fields"
                  :loading="loading"
                  :items-per-page="small ? 25 : 10"                 
                  :sorter='{external: true, resetable: true}'
                  table-filter
                  @update:sorter-value="sort($event)"
              >
              <template #title="{item}">
                  <td>
                      <b>{{item.title}}</b>
                  </td>
              </template>
              <template #organization="{item}">
                <td>
                  <OrganizationBadge :uuid="item.organization"/>
                </td>
              </template>
              <template #actions="{item}">
                <td class='text-right'>
                  <CButton color="info" size="sm" :to="item.uuid"><CIcon name="cilPencil"/></CButton>&nbsp;
                  <CButton color="secondary" size="sm" @click="cloneFieldMappingTemplate(item.uuid)"><CIcon name="cilCopy"/></CButton>
                </td>
              </template>
              </CDataTable>
              <CRow>
                <CCol>
                  <CCardBody>
                    <CPagination :activePage.sync="active_page" :pages="pagination.pages"/>
                  </CCardBody>
                </CCol>
              </CRow>
              </CCardBody>
    </CCol>
  </CRow>
</template>

<script>
import {mapState} from "vuex";
import OrganizationBadge from './OrganizationBadge'
export default {
    name: 'InputFieldMappingList',
    components: {
      OrganizationBadge
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
    computed: mapState(['current_user','field_mapping_templates', 'pagination', 'source_field_mapping_template']),
    created: function () {
        if(this.current_user.default_org) {
          if (!this.fields.includes('organization')) {
            this.fields.splice(1,0,{key:'organization', sorter: false})
            
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
        active_page: 1
      }
    },
    watch: {
      active_page: function() {
        this.reloadFieldMappingTemplates(this.active_page)
      }
    },
    methods: {
      sort(event) {
        let sort_direction = event.asc ? 'asc' : 'desc'
        event.column = event.column ? event.column : 'created_at'
        this.reloadFieldMappingTemplates(this.active_page, event.column, sort_direction)
      },
      newFieldMappingTemplate() {
        this.$store.commit('clone_field_mapping_template', null)
        alert('Not implemented')
        //this.$router.push('/inputs/create_field_mapping_template')
      },
      cloneFieldMappingTemplate(uuid) {
        this.$store.commit('clone_field_mapping_template', this.field_mapping_templates.find(item => item.uuid === uuid))
        alert('Not implemented')
        //this.$router.push('/inputs/create_field_mapping_template')
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
      reloadFieldMappingTemplates(page, sort_by, sort_direction) {
        this.loading = true
          this.$store.dispatch('getFieldMappingTemplates',{page: page, sort_by: sort_by, sort_direction: sort_direction}).then(() => {
            this.loading = false
        })
      },
      loadData: function() {
        this.loading = true
        
        this.$store.dispatch('getFieldMappingTemplates', {}).then(resp => {
            this.loading = false
        })
      }
    },
    beforeDestroy: function() {
      clearInterval(this.refresh)
    }
}
</script>
