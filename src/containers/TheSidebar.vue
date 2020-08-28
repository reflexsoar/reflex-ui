<template>
  <CSidebar 
    fixed 
    :minimize="minimize"
    :show="show"
    @update:show="(value) => $store.commit('set', ['sidebarShow', value])"
  >
    <CSidebarBrand class="d-md-down-none" to="/">
      <h1 class="c-sidebar-brand-full" style="margin-bottom:0px">re<span class="text-info">flex</span></h1>
      <h3 class="c-sidebar-brand-minimized" style="margin-bottom:0px">R<span class="text-info">F</span></h3>
    </CSidebarBrand>

    <CRenderFunction flat :content-to-render="$options.nav"/>
    <CSidebarMinimizer
      class="d-md-down-none"
      @click.native="$store.commit('set', ['sidebarMinimize', !minimize])"
    />
  </CSidebar>
</template>

<script>
import nav from './_nav'

export default {
  name: 'TheSidebar',
  nav,
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
    }
  }
}
</script>
