<template>

    <CCol xs="12" lg="12">
    <h1>Dashboard</h1>
      <CRow>
        <CCol xs="4" lg="4">
          <CWidgetIcon
            :header="dashboard_metrics.total_cases"
            text="Total Cases"
            color="primary"
          >
            <CIcon name="cil-briefcase" width="24"/>
          </CWidgetIcon>
        </CCol>
        <CCol xs="4" lg="4">
          <CWidgetIcon
            :header="dashboard_metrics.open_cases"
            text="Closed Cases"
            color="warning"
          >
            <CIcon name="cil-briefcase" width="24"/>
          </CWidgetIcon>
        </CCol>
        <CCol xs="4" lg="4">
          <CWidgetIcon
            :header="dashboard_metrics.total_cases"
            text="Open Cases"
            color="success"
          >
            <CIcon name="cil-briefcase" width="24"/>
          </CWidgetIcon>
        </CCol>
        <CCol xs="4" lg="4">
          <CWidgetIcon
            :header="dashboard_metrics.total_events"
            text="Total Events"
            color="info"
          >
            <CIcon name="cil-bell" width="24"/>
          </CWidgetIcon>
        </CCol>
        <CCol xs="4" lg="4">
          <CWidgetIcon
            :header="dashboard_metrics.new_events"
            text="New Events"
            color="danger"
          >
            <CIcon name="cil-bell" width="24"/>
          </CWidgetIcon>
        </CCol>
        <CCol xs="4" lg="4">
          <CWidgetIcon
            :header="dashboard_metrics.time_since_last_event | moment('from')"
            text="Last Event"
            color="primary"
          >
            <CIcon name="cil-clock" width="24"/>
          </CWidgetIcon>
        </CCol>
        
      </CRow>
      

    <h3>DEBUG</h3>
    <h4>Current User UUID</h4>
    {{current_user.uuid}}

    <h4>Perm Check</h4>
    {{current_user.permissions}}<br><br>
    <b>Can edit users:</b> {{current_user.role.permissions['update_user']}}
    </CCol>

</template>
<script>
import MainChartExample from './charts/MainChartExample'
import WidgetsDropdown from './widgets/WidgetsDropdown'
import WidgetsBrand from './widgets/WidgetsBrand'
import { mapState } from 'vuex';

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
  created() {
    this.$store.dispatch("getDashboardMetrics");
  },
  computed: mapState(['current_user','dashboard_metrics']),
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
