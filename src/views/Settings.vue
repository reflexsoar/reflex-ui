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
            <CTabs>
              <CTab active v-if="current_user.permissions.includes('update_settings')">
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
              <CTab>
                <template slot="title">
                  <CIcon name="cil-people"/> {{tabs[2]}}
                </template>
                <GroupList/>
              </CTab>
              <CTab>
                <template slot="title">
                  <CIcon name="cil-people"/> {{tabs[3]}}
                </template>
                
              </CTab>
              <CTab>
                <template slot="title">
                  <CIcon name="cil-graph"/> {{tabs[4]}}
                </template>
                3. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore
                et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
                dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
                officia deserunt mollit anim id est laborum.
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
import GlobalSettings from './GlobalSettings'
import { mapState, mapGetters } from 'vuex'
export default {
  name: 'Settings',
  computed: mapState(['current_user', 'alert']),
  components: {
    UsersList,
    GlobalSettings,
    GroupList
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
        'Integrations'
      ],
      activeTab: 1
    }
  }
}
</script>
