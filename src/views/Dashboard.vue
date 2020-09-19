<template>
  <div>
    <h1>Dashboard</h1>
    <h2>DEBUG</h2>
    <h3>Permissions</h3>
    {{user_perms}}
    <h3>Current User UUID</h3>
    {{current_user}}

    <h3>Perm Check</h3>
    <b>Can edit users:</b> {{edit_users}}
  </div>
</template>

<script>
import MainChartExample from './charts/MainChartExample'
import WidgetsDropdown from './widgets/WidgetsDropdown'
import WidgetsBrand from './widgets/WidgetsBrand'

export default {
  name: 'Dashboard',
  components: {
    MainChartExample,
    WidgetsDropdown,
    WidgetsBrand
  },
  data () {
    return {
      current_user: this.$store.getters.current_user,
      user_perms: this.$store.getters.user_perms,
      edit_users: this.$store.getters.has_perm('update_user')
    }
  },
  methods: {
    color (value) {
      let $color
      if (value <= 25) {
        $color = 'info'
      } else if (value > 25 && value <= 50) {
        $color = 'success'
      } else if (value > 50 && value <= 75) {
        $color = 'warning'
      } else if (value > 75 && value <= 100) {
        $color = 'danger'
      }
      return $color
    }
  }
}
</script>
