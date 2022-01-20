<template>

    <CCol xs="12" lg="12">
    <h1>Dashboard</h1>
      <CRow>
        <CCol xs="4" lg="4">
          <CWidgetIcon
            :header="dashboard_metrics.total_cases ? dashboard_metrics.total_cases.toString() : '0'"
            text="Total Cases"
            color="primary"
          >
            <CIcon name="cil-briefcase" width="24"/>
          </CWidgetIcon>
        </CCol>
        <CCol xs="4" lg="4">
          <CWidgetIcon
            :header="dashboard_metrics.closed_cases ? dashboard_metrics.closed_cases.toString() : '0'"
            text="Closed Cases"
            color="warning"
          >
            <CIcon name="cil-briefcase" width="24"/>
          </CWidgetIcon>
        </CCol>
        <CCol xs="4" lg="4">
          <CWidgetIcon
            :header="dashboard_metrics.open_cases ? dashboard_metrics.open_cases.toString() : '0'"
            text="Open Cases"
            color="success"
          >
            <CIcon name="cil-briefcase" width="24"/>
          </CWidgetIcon>
        </CCol>
        <CCol xs="4" lg="4">
          <CWidgetIcon
            :header="dashboard_metrics.total_events ? dashboard_metrics.total_events.toString() : '0'"
            text="Total Events"
            color="info"
          >
            <CIcon name="cil-bell" width="24"/>
          </CWidgetIcon>
        </CCol>
        <CCol xs="4" lg="4">
          <CWidgetIcon
            :header="dashboard_metrics.new_events ? dashboard_metrics.new_events.toString() :'0'"
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
      <CRow>
        <CCol xs="4" lg="4">
          <CCard>
            <CCardHeader>Events by Title</CCardHeader>
              <CChartHorizontalBar
                :datasets="computedValues('title')"
                :labels="computedKeys('title')"
                :options="barChart_options"
              />
          </CCard>
        </CCol>
        <CCol xs="4" lg="4">
          <CCard>
            <CCardHeader>Events by Status</CCardHeader>
          <CChartHorizontalBar
            :datasets="computedValues('status')"
            :labels="computedKeys('status')"
            :options="barChart_options"
          />
          </CCard>
        </CCol>
        <CCol xs="4" lg="4">
          <CCard>
            <CCardHeader>Events by Dismiss Reason</CCardHeader>
            <CChartHorizontalBar
              :datasets="computedValues('dismiss reason')"
              :labels="computedKeys('dismiss reason')"
              :options="barChart_options"
            />
          </CCard>
        </CCol>
      </CRow>
    </CCol>

</template>
<script>
import MainChartExample from './charts/MainChartExample'
import WidgetsDropdown from './widgets/WidgetsDropdown'
import WidgetsBrand from './widgets/WidgetsBrand'
import { CChartHorizontalBar } from '@coreui/vue-chartjs'
import { mapState } from 'vuex';

export default {
  name: 'Dashboard',
  components: {
    MainChartExample,
    WidgetsDropdown,
    WidgetsBrand,
    CChartHorizontalBar
  },
  data () {
    return {
      barChart_options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
      }
    }
  },
  created() {
    this.$store.dispatch("getDashboardMetrics");
    this.$store.dispatch("getEventStats", {top: 5})
  },
  computed: mapState(['current_user','dashboard_metrics','event_stats']),
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
    },
    computedKeys(field){
      let keys = []
      for(let key in this.event_stats[field]) {
        keys.push(key)
      }
      return keys
    },
    computedValues(field){
      let dataset = {
        'label': 'Events',
        'data': [],
        'backgroundColor': []
      }
      for(let key in this.event_stats[field]) {
        dataset.data.push(this.event_stats[field][key])
        dataset.backgroundColor.push('#3c4b64')
      }
      return [dataset]
    },
    getRandomColor() {
      var letters = '0123456789ABCDEF'.split('');
      var color = '#';
      for (var i = 0; i < 6; i++ ) {
          color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    }
  }
}
</script>
