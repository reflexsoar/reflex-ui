<template>
  <div>
    <CAlert :show.sync="alert.show" :color="alert.type" closeButton>
      {{ alert.message }}
    </CAlert>
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
              current_user.role.permissions['update_settings']
            "
          >
            <template slot="title">
              <CIcon name="cil-globe-alt" /> {{ tabs[0] }}
            </template>
            <h2 class="page-sub-header">Current Tenant</h2>
            <CCard>
              <GlobalSettings />
            </CCard>
          </CTab>
          <CTab v-if="current_user && current_user.role.permissions.view_organizations">
            <template slot="title"> <CIcon name="cil-people" /> {{ tabs[1] }} </template>
            <OrganizationList />
          </CTab>
          <CTab>
            <template slot="title"> <CIcon name="cil-user" /> {{ tabs[2] }} </template>
            <UsersList />
          </CTab>
          <CTab>
            <template slot="title"> <i class="fa fa-key"></i> {{ tabs[3] }} </template>
            <AuthSettings :key="reloadAuthTab"/>
          </CTab>
          <!--<CTab>
                <template slot="title">
                  <CIcon name="cil-people"/> {{tabs[3]}}
                </template>
                <GroupList/>
              </CTab>-->
          <CTab v-if="current_user.role.permissions.view_roles">
            <template slot="title"> <CIcon name="cil-people" /> {{ tabs[4] }} </template>
            <RolesList />
          </CTab>
          <CTab v-if="current_user.role.permissions.view_service_accounts">
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
      if (this.activeTab == 3) {
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
        "Authentication",
        //'Groups',
        "Roles",
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
