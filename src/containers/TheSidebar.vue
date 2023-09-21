<template>
  <CSidebar 
    fixed 
    :minimize="minimize"
    :show="show"
    @update:show="(value) => $store.commit('set', ['sidebarShow', value])"
  >
    <CSidebarBrand class="d-md-down-none" to="/">
      <img aria-label="logo with slogan" class="c-sidebar-brand-full" style="margin-bottom:0px; width: 80%" v-bind:src="logo_slogan"/>
      <img aria-label="logo" class="c-sidebar-brand-minimized" style="margin-bottom:0px; width: 80%" v-bind:src="logo"/>
    </CSidebarBrand>

    <CSidebarNav :overlaid="true">
      <CSidebarNavItem name="Dashboard" to="/dashboard" icon="cil-speedometer"></CSidebarNavItem>
      <CSidebarNavItem v-if="this.$store.getters.user_has_permission('view_cases')" name="Cases" to="/cases" icon="cil-briefcase"></CSidebarNavItem>
      <CSidebarNavDropdown v-if="this.$store.getters.user_has_permission('view_detections')" name="Detections" icon="cil-shield-alt">
        <CSidebarNavItem name="Detections" to="/detections"></CSidebarNavItem>
        <CSidebarNavItem name="MITRE ATT&CK" to="/mitre_coverage" :badge="beta_badge"></CSidebarNavItem>
      </CSidebarNavDropdown>
      <!--<CSidebarNavItem v-if="this.$store.getters.user_has_permission('view_detections')" name="Detections" icon="cil-shield-alt" to="/detections" :badge="beta_badge"></CSidebarNavItem>-->
      <CSidebarNavDropdown v-if="this.$store.getters.user_has_permission('view_events') || this.$store.getters.user_has_permission('view_event_rules')" name='Events' icon="cil-bell">
        <CSidebarNavItem v-if="this.$store.getters.user_has_permission('view_events')" name="Queue" to="/alerts/list"></CSidebarNavItem>
        <CSidebarNavItem v-if="this.$store.getters.user_has_permission('view_event_rules')" name="Event Rules" to="/event_rules"></CSidebarNavItem>
      </CSidebarNavDropdown>      
      <CSidebarNavDropdown v-if="this.$store.getters.user_has_permission('view_lists')" name='Intel' icon="cil-3d">
        <CSidebarNavItem v-if="this.$store.getters.user_has_permission('view_lists')" name="List Manager" to="/lists"></CSidebarNavItem>
        <CSidebarNavItem v-if="this.$store.getters.user_has_permission('view_lists')" name="Intel Explorer" to="/lists/explore"></CSidebarNavItem>
      </CSidebarNavDropdown>
      <CSidebarNavItem v-if="this.$store.getters.user_has_permission('view_events')" name="Integrations" to="/integrations" icon="cil-applications" :badge="beta_badge"></CSidebarNavItem>
      <CSidebarNavItem name="Assets" to="/assets" icon="cil-layers" :badge="beta_badge"></CSidebarNavItem>
      <CSidebarNavDropdown v-if="this.$store.getters.user_has_permission('view_lists')" name='System' icon="cil-settings">
        <CSidebarNavItem v-if="this.$store.getters.user_has_permission('update_settings')" name="Settings" to="/settings"></CSidebarNavItem>
        <CSidebarNavItem v-if="this.$store.getters.user_has_permission('update_notification_channel')" name='Notifications' to="/notifications" :badge="beta_badge"></CSidebarNavItem>
        <CSidebarNavItem v-if="this.$store.getters.user_has_permission('view_agents')" name="Agents" to="/agents"></CSidebarNavItem>
        <CSidebarNavItem v-if="this.$store.getters.user_has_permission('view_credentials')" name="Credentials" to="/credentials"></CSidebarNavItem>
        <CSidebarNavItem v-if="this.$store.getters.user_has_permission('view_inputs')" name="Inputs" to="/inputs"></CSidebarNavItem>
        <CSidebarNavItem v-if="this.$store.getters.user_has_permission('view_data_source_templates')" name="Data Source Templates" to="/data_source_templates"></CSidebarNavItem>
      </CSidebarNavDropdown>
    </CSidebarNav>

    <!--<CRenderFunction flat :content-to-render="filtered_nav"/>-->
    <CSidebarMinimizer
      class="d-md-down-none"
      @click.native="$store.commit('set', ['sidebarMinimize', !minimize])"
      aria-label="Sidebar Minimizer"
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
      logo: require('../assets/img/symbol.png'),
      logo_slogan: require('../assets/img/white-logo-color-symbol-no-background.png'),
      filtered_nav: [],
      beta_badge: {
        color: 'primary',
        text: 'BETA'
      }
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
