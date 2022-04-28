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
        <CCol>
          <v-date-picker
            v-model="range"
            mode="dateTime"
            :masks="masks"
            is-range
          >
            <template v-slot="{ inputValue, inputEvents }">
              <CRow>
                <CCol>
                  <b>Time Filter</b><p></p>
                </CCol>
              </CRow>
              <CRow>
                <CCol>
                  <CInput label="Start" :value="inputValue.start" v-on="inputEvents.start">
                    <template #prepend>
                      <CButton disabled color="secondary" size="sm"><CIcon name='cil-calendar' aria-label="Start Date"/></CButton>
                    </template>
                  </CInput>
                </CCol>
                <CCol>
                  <CInput label="End" :value="inputValue.end" v-on="inputEvents.end">
                  <template #prepend>
                      <CButton disabled color="secondary" size="sm"><CIcon name='cil-calendar' aria-label="End Date"/></CButton>
                    </template>
                  </CInput>
                </CCol>
              </CRow>
              <CRow>
                <CCol class='text-right'>
                  <CButtonGroup>
                    <CButton size="sm" color="primary" @click="applyTimeFilter()">Apply</CButton>
                  </CButtonGroup>
                </CCol>
              </CRow>
            </template>
          </v-date-picker>
        </CCol>
      </CRow>
      <CRow v-if="this.$store.getters.user_has_permission('view_events')">
        <CCol col="12">
          <h4>Event Charts</h4>
        </CCol> 
        <CCol xs="4" lg="4">
          <CCard>
            <CCardHeader>Events by Title</CCardHeader>
              <CChartHorizontalBar
                :datasets="computedValues(event_stats, 'title')"
                :labels="computedKeys(event_stats, 'title')"
                :options="barChart_options"
              />
          </CCard>
        </CCol>
        <CCol xs="4" lg="4">
          <CCard>
            <CCardHeader>Events by Severity</CCardHeader>
              <CChartHorizontalBar
                :datasets="computedValues(event_stats, 'severity')"
                :labels="computedKeys(event_stats, 'severity')"
                :options="barChart_options"
              />
          </CCard>
        </CCol>
        <CCol xs="4" lg="4">
          <CCard>
            <CCardHeader>Events by Status</CCardHeader>
          <CChartHorizontalBar
            :datasets="computedValues(event_stats, 'status')"
            :labels="computedKeys(event_stats, 'status')"
            :options="barChart_options"
          />
          </CCard>
        </CCol>
        <CCol xs="4" lg="4">
          <CCard>
            <CCardHeader>Events by Dismiss Reason</CCardHeader>
            <CChartHorizontalBar
              :datasets="computedValues(event_stats, 'dismiss reason')"
              :labels="computedKeys(event_stats, 'dismiss reason')"
              :options="barChart_options"
            />
          </CCard>
        </CCol>
      </CRow>
      <CRow v-if="this.$store.getters.user_has_permission('view_events')">
        <CCol xs="4" lg="12">
          <CCard>
            <CCardHeader>Events over Time</CCardHeader>
            <CCardBody>
              <CChartBar 
                :datasets="computedValues(event_stats, 'events_over_time')"
                :labels="computedKeys(event_stats, 'events_over_time')"
                :options="barChart_options"
              />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
      <CRow>
        <CCol col="12">
          <h4>Case Charts</h4>
        </CCol> 
      </CRow>
      <CRow>
        <CCol xs="4" lg="4">
          <CCard>
            <CCardHeader>Cases by Severity</CCardHeader>
              <CChartHorizontalBar
                :datasets="computedValues(case_stats, 'severity', label='Cases')"
                :labels="computedKeys(case_stats, 'severity')"
                :options="barChart_options"
              />
          </CCard>
        </CCol>
        <CCol xs="4" lg="4">
          <CCard>
            <CCardHeader>Cases by Status</CCardHeader>
          <CChartHorizontalBar
            :datasets="computedValues(case_stats, 'status', label='Cases')"
            :labels="computedKeys(case_stats, 'status')"
            :options="barChart_options"
          />
          </CCard>
        </CCol>
        <CCol xs="4" lg="4">
          <CCard>
            <CCardHeader>Cases by Closure Reason</CCardHeader>
            <CChartHorizontalBar
              :datasets="computedValues(case_stats, 'close reason', label='Cases')"
              :labels="computedKeys(case_stats, 'close reason')"
              :options="barChart_options"
            />
          </CCard>
        </CCol>
      </CRow>
      <CRow>
        <CCol xs="4" lg="12">
          <CCard>
            <CCardHeader>Cases over Time</CCardHeader>
            <CCardBody>
              <CChartBar 
                :datasets="computedValues(case_stats, 'cases_over_time', label='Cases')"
                :labels="computedKeys(case_stats, 'cases_over_time')"
                :options="barChart_options"
              />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CCol>

</template>

<script>
import MainChartExample from './charts/MainChartExample'
import WidgetsDropdown from './widgets/WidgetsDropdown'
import WidgetsBrand from './widgets/WidgetsBrand'
import { CChartHorizontalBar, CChartBar } from '@coreui/vue-chartjs'
import { mapState } from 'vuex';

export default {
  name: 'Dashboard',
  components: {
    MainChartExample,
    WidgetsDropdown,
    WidgetsBrand,
    CChartHorizontalBar,
    CChartBar
  },
  data () {
    return {
      barChart_options: {
        scales: {
          yAxes: [{
             ticks: {
                precision:0,
                beginAtZero: true,
             }
          }]
        },
        maintainAspectRatio: false
      },
      range: {
          start: this.days_ago(7),
          end: this.today()
        },
        masks: {
          input: 'YYYY-MM-DD h:mm A'
        }
    }
  },
  created() {
    if(this.$store.getters.user_has_permission('view_events')) { 
      this.$store.dispatch("getDashboardMetrics");
      this.$store.dispatch("getEventStats", {top: 5, metrics: ['events_over_time','title','status','dismiss_reason','severity']})
    }
    
    this.$store.dispatch("getCaseStats", {top: 5, metrics: ['cases_over_time','status','close_reason','severity']})
  },
  computed: mapState(['current_user','dashboard_metrics','event_stats','case_stats']),
  methods: {
    applyTimeFilter() {
      this.$store.dispatch("getEventStats", {top: 5, metrics: ['events_over_time','title','status','dismiss_reason', 'severity'], start: this.range.start.toISOString(), end: this.range.end.toISOString()})
      this.$store.dispatch("getCaseStats", {top: 5, metrics: ['cases_over_time',,'status','close_reason','severity'], start: this.range.start.toISOString(), end: this.range.end.toISOString()})
    },
    today() {
      let d = new Date()
      d.setHours(23,59,59,0)
      return d
    },
    days_ago(offset) {
      let d = new Date()
      d.setDate(d.getDate() - offset)
      d.setHours(0,0,0,0)
      return d
    },
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
    computedKeys(data, field){
      let keys = []
      for(let key in data[field]) {
        if(field === 'severity') {
          key = this.getSeverityText(parseInt(key))
        }
        if(!keys.includes(key)) {
          keys.push(key)
        }        
      }
      return keys
    },
    computedValues(data, field, label='Events'){
      let dataset = {
        'label': label,
        'data': [],
        'backgroundColor': []
      }
      for(let key in data[field]) {
        dataset.data.push(data[field][key])
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
    },
    getSeverityText(severity) {
        switch(severity) {
        case 1: return 'Low';
        case 2: return 'Medium';
        case 3: return 'High';
        case 4: return 'Critical';
        default: return 'Low';
        }
    }
  }
}
</script>
