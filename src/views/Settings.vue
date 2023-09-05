<template>
  <div>
    
    <CRow>
      <CCol xs="12" lg="12">
        <h1 class="page-heading">Platform Settings</h1>
        
        <CTabs
          :activeTab.sync="activeTab"
          addNavWrapperClasses="page-nav"
          addTabClasses="page-nav-tab-body"
          addNavClasses="page-nav-tab"
        >
          <CTab
            active
            v-if="
              current_user &&
              current_user.role &&
              current_user.permissions['update_settings']
            "
          >
            <template slot="title">
              <CIcon name="cil-globe-alt" /> {{ tabs[0] }}
            </template>
              <GlobalSettings />
          </CTab>
          <CTab v-if="current_user && current_user.permissions.view_organizations">
            <template slot="title"> <CIcon name="cil-people" /> {{ tabs[1] }} </template>
            <OrganizationList />
          </CTab>
          <CTab>
            <template slot="title"> <CIcon name="cil-user" /> {{ tabs[2] }} </template>
            <UsersList />
          </CTab>
          
          <!--<CTab>
                <template slot="title">
                  <CIcon name="cil-people"/> {{tabs[3]}}
                </template>
                <GroupList/>
              </CTab>-->
          <CTab v-if="current_user.permissions.view_roles">
            <template slot="title"> <CIcon name="cil-people" /> {{ tabs[3] }} </template>
            <RolesList />
          </CTab>
          <CTab>
            <template slot="title"> <i class="fa fa-key"></i> {{ tabs[4] }} </template>
            <AuthSettings :key="reloadAuthTab"/>
          </CTab>
          <CTab v-if="current_user.permissions.view_service_accounts">
            <template slot="title"> <CIcon name="cil-bolt" /> {{ tabs[5] }} </template>
            <ServiceAccountList />
          </CTab>
          <CTab>
            <template slot="title"> <CIcon name="cil-graph" /> {{ tabs[6] }} </template>
            <AuditLogs :key="reloadLogs" />
          </CTab>
        </CTabs>
      </CCol>
    </CRow>
  </div>
</template>

<script>
import UsersList from "./UsersList";
import RolesList from "./RolesList";
import GroupList from "./GroupList";
import ServiceAccountList from "./ServiceAccountList";
import AuditLogs from "./AuditLogs";
import OrganizationList from "./OrganizationList";
import GlobalSettings from "./GlobalSettings";
import AuthSettings from "./settings/AuthSettings";
import { mapState, mapGetters } from "vuex";
export default {
  name: "Settings",
  computed: mapState(["current_user", "alert"]),
  components: {
    UsersList,
    RolesList,
    GlobalSettings,
    GroupList,
    AuditLogs,
    OrganizationList,
    ServiceAccountList,
    AuthSettings,
  },
  watch: {
    activeTab: function () {
      if (this.activeTab == 6) {
        this.reloadLogs = Math.random();
      }
      if (this.activeTab == 4) {
        this.reloadAuthTab = Math.random()
      }
    },
  },
  created() {},
  data() {
    return {
      tabs: [
        "Current Tenant",
        "Organizations",
        "Users",
        //'Groups',
        "Roles",
        "Authentication",
        "Service Accounts",
        "Audit Logs",
      ],
      activeTab: 0,
      reloadLogs: 0,
      reloadAuthTab: 0
    };
  },
};
</script>
