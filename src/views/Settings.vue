<template>
<div>
    <CAlert :show.sync="alert.show" :color="alert.type" closeButton>
      {{alert.message}}
    </CAlert>
    <CRow>
      <CCol xs="12" lg="12">
        <CCard>
          <CCardHeader>
            <b>Settings</b>
          </CCardHeader>
          <CCardBody class="tabbed">
            <CTabs :activeTab.sync="activeTab">
              <CTab active v-if="current_user && current_user.role && current_user.role.permissions['update_settings']">
                <template slot="title">
                  <CIcon name="cil-globe-alt"/> {{tabs[0]}}
                </template>
                <GlobalSettings/>
              </CTab>
              <CTab>
                <template slot="title">
                  <CIcon name="cil-user"/> {{tabs[1]}}
                </template>
                <UsersList/>
              </CTab>
              <!--<CTab>
                <template slot="title">
                  <CIcon name="cil-people"/> {{tabs[2]}}
                </template>
                <GroupList/>
              </CTab>-->
              <CTab>
                <template slot="title">
                  <CIcon name="cil-people"/> {{tabs[3]}}
                </template>
              </CTab>
              <CTab>
                <template slot="title">
                  <CIcon name="cil-graph"/> {{tabs[4]}}
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
import GlobalSettings from './GlobalSettings'
import { mapState, mapGetters } from 'vuex'
export default {
  name: 'Settings',
  computed: mapState(['current_user', 'alert']),
  components: {
    UsersList,
    GlobalSettings,
    GroupList,
    AuditLogs
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
        'Global',
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
