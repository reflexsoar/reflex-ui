<template>
  <CSidebar 
    fixed 
    :minimize="minimize"
    :show="show"
    @update:show="(value) => $store.commit('set', ['sidebarShow', value])"
  >
    <CSidebarBrand class="d-md-down-none" to="/">
      <img class="c-sidebar-brand-full" style="margin-bottom:0px; width: 80%" v-bind:src="logo_slogan"/>
      <img class="c-sidebar-brand-minimized" style="margin-bottom:0px; width: 80%" v-bind:src="logo"/>
    </CSidebarBrand>

    <CSidebarNav>
      <CSidebarNavItem name="Dashboard" to="/dashboard" icon="cil-speedometer"></CSidebarNavItem>
      <CSidebarNavItem v-if="this.$store.getters.user_has_permission('view_cases')" name="Cases" to="/cases" icon="cil-briefcase"></CSidebarNavItem>
      <CSidebarNavDropdown v-if="this.$store.getters.user_has_permission('view_events') || this.$store.getters.user_has_permission('view_event_rules')" name='Events' icon="cil-bell">
        <CSidebarNavItem v-if="this.$store.getters.user_has_permission('view_events')" name="Queue" to="/alerts/list"></CSidebarNavItem>
        <CSidebarNavItem v-if="this.$store.getters.user_has_permission('view_event_rules')" name="Event Rules" to="/event_rules"></CSidebarNavItem>
      </CSidebarNavDropdown>
      <CSidebarNavDropdown v-if="this.$store.getters.user_has_permission('view_lists')" name='Automation' icon="cil-3d">
        <CSidebarNavItem v-if="this.$store.getters.user_has_permission('view_lists')" name="Queue" to="/lists"></CSidebarNavItem>
      </CSidebarNavDropdown>
      <CSidebarNavDropdown v-if="this.$store.getters.user_has_permission('view_lists')" name='System' icon="cil-settings">
        <CSidebarNavItem v-if="this.$store.getters.user_has_permission('update_settings')" name="Settings" to="/settings"></CSidebarNavItem>
        <CSidebarNavItem v-if="this.$store.getters.user_has_permission('view_agents')" name="Agents" to="/agents"></CSidebarNavItem>
        <CSidebarNavItem v-if="this.$store.getters.user_has_permission('view_credentials')" name="Credentials" to="/credentials"></CSidebarNavItem>
        <CSidebarNavItem v-if="this.$store.getters.user_has_permission('view_inputs')" name="Inputs" to="/inputs"></CSidebarNavItem>
      </CSidebarNavDropdown>
    </CSidebarNav>

    <!--<CRenderFunction flat :content-to-render="filtered_nav"/>-->
    <CSidebarMinimizer
      class="d-md-down-none"
      @click.native="$store.commit('set', ['sidebarMinimize', !minimize])"
    />
  </CSidebar>
</template>

<script>
import nav from './_nav'
import {mapState} from "vuex"

export default {
  name: 'TheSidebar',
  nav,
  data() {
    return {
      logo: require('../assets/img/squid-white-no-background.png'),
      logo_slogan: require('../assets/img/reflexsoar-white-no-background.png'),
      filtered_nav: []
    }
  },
  created: function() {
    if (this.$store.state.unread_alert_count > 0) {
      nav[0]._children[1]['badge'] = {'color': 'danger', 'text': this.$store.state.unread_alert_count}
    }
    
  },
  computed: {
    show () {
      return this.$store.state.sidebarShow 
    },
    minimize () {
      return this.$store.state.sidebarMinimize 
    },
    ...mapState(['current_user'])
  }
}
</script>
