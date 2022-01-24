<template>
<div>
    <CAlert :show.sync="alert.show" :color="alert.type" closeButton>
      {{alert.message}}
    </CAlert>
    <CRow>
      <CCol xs="12" lg="12">
        <CCard>
          <CCardHeader>
            <CRow>
              <CCol>
                <b>Settings</b>
              </CCol>
              <CCol class="text-right">
              </CCol>
            </CRow>
          </CCardHeader>
          <CCardBody class="tabbed">
            <CTabs :activeTab.sync="activeTab">
              <CTab active v-if="current_user && current_user.role && current_user.role.permissions['update_settings']">
                <template slot="title">
                  <CIcon name="cil-globe-alt"/> {{tabs[0]}}
                </template>
                <GlobalSettings/>
              </CTab>
              <CTab v-if="current_user && current_user.role.permissions.view_organizations">
                <template slot="title">
                  <CIcon name="cil-people"/> {{tabs[1]}}
                </template>
                <OrganizationList/>
              </CTab>
              <CTab>
                <template slot="title">
                  <CIcon name="cil-user"/> {{tabs[2]}}
                </template>
                <UsersList/>
              </CTab>
              <!--<CTab>
                <template slot="title">
                  <CIcon name="cil-people"/> {{tabs[3]}}
                </template>
                <GroupList/>
              </CTab>-->
              <!--<CTab>
                <template slot="title">
                  <CIcon name="cil-people"/> {{tabs[4]}}
                </template>
              </CTab>-->
              <CTab>
                <template slot="title">
                  <CIcon name="cil-graph"/> {{tabs[5]}}
                </template>
                <AuditLogs :key="reloadLogs"/>
              </CTab>
              
            </CTabs>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
</div>
</template>

<script>
import UsersList from './UsersList'
import RolesList from './RolesList'
import GroupList from './GroupList'
import AuditLogs from './AuditLogs'
import OrganizationList from './OrganizationList'
import GlobalSettings from './GlobalSettings'
import { mapState, mapGetters } from 'vuex'
export default {
  name: 'Settings',
  computed: mapState(['current_user', 'alert']),
  components: {
    UsersList,
    GlobalSettings,
    GroupList,
    AuditLogs,
    OrganizationList
  },
  watch: {
    activeTab: function () {
      if(this.activeTab == 3) {
        this.reloadLogs = Math.random()
      }
    }
  },
  created() {
  },  
  data () {
    return {
      tabs: [
        'Current Tenant',
        'Organizations',
        'Users',
        'Groups',
        'Roles',
        'Audit Logs'
      ],
      activeTab: 0,
      reloadLogs: 0
    }
  }
}
</script>
