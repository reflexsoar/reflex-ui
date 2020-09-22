<template>
  <div>
    <h1>Dashboard</h1>
    <h2>Welcome back, {{current_user.first_name}}</h2>
    <h3>DEBUG</h3>


    <h4>Organization Data</h4>
    {{current_user.organization}}<br><br>
    <h4>Current User UUID</h4>
    {{current_user.uuid}}

    <h4>Perm Check</h4>
    {{current_user.permissions}}<br><br>
    <b>Can edit users:</b> {{current_user.permissions.includes('update_user')}}
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
    }
  },
  computed: {
    current_user: function () { 
      return this.$store.getters.current_user
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
