<template>

  <CCol xs="12" lg="12">
    <CRow>
      <CCol>
        <h1>Dashboard</h1>
      </CCol>
      <CCol>
        <v-date-picker v-model="range" mode="dateTime" :masks="masks" is-range>
          <template v-slot="{ inputValue, inputEvents }">
            <CRow>
              <CCol>
                <CInput label="Start" :value="inputValue.start" v-on="inputEvents.start">
                  <template #prepend>
                    <CButton disabled color="secondary" size="sm">
                      <CIcon name='cil-calendar' aria-label="Start Date" />
                    </CButton>
                  </template>
                </CInput>
              </CCol>
              <CCol>
                <CInput label="End" :value="inputValue.end" v-on="inputEvents.end">
                  <template #prepend>
                    <CButton disabled color="secondary" size="sm">
                      <CIcon name='cil-calendar' aria-label="End Date" />
                    </CButton>
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
    <CTabs variant="pills" :active-tab="0" color=""><br>
      <CTab title="Overview">
        <CRow>
          <CCol xs="4" lg="4">
            <CWidgetIcon :header="dashboard_metrics.total_cases ? dashboard_metrics.total_cases.toString() : '0'"
              text="Total Cases" color="primary">
              <CIcon name="cil-briefcase" width="24" />
            </CWidgetIcon>
          </CCol>
          <CCol xs="4" lg="4">
            <CWidgetIcon :header="dashboard_metrics.closed_cases ? dashboard_metrics.closed_cases.toString() : '0'"
              text="Closed Cases" color="warning">
              <CIcon name="cil-briefcase" width="24" />
            </CWidgetIcon>
          </CCol>
          <CCol xs="4" lg="4">
            <CWidgetIcon :header="dashboard_metrics.open_cases ? dashboard_metrics.open_cases.toString() : '0'"
              text="Open Cases" color="success">
              <CIcon name="cil-briefcase" width="24" />
            </CWidgetIcon>
          </CCol>
          <CCol xs="4" lg="4">
            <CWidgetIcon :header="dashboard_metrics.total_events ? dashboard_metrics.total_events.toString() : '0'"
              text="Total Events" color="info">
              <CIcon name="cil-bell" width="24" />
            </CWidgetIcon>
          </CCol>
          <CCol xs="4" lg="4">
            <CWidgetIcon :header="dashboard_metrics.new_events ? dashboard_metrics.new_events.toString() : '0'"
              text="New Events" color="danger">
              <CIcon name="cil-bell" width="24" />
            </CWidgetIcon>
          </CCol>
          <CCol xs="4" lg="4">
            <CWidgetIcon :header="dashboard_metrics.time_since_last_event | moment('from')" text="Last Event"
              color="primary">
              <CIcon name="cil-clock" width="24" />
            </CWidgetIcon>
          </CCol>

        </CRow>
      </CTab>
      <CTab title="Events">
        <CRow v-if="this.$store.getters.user_has_permission('view_events')">
          <CCol xs="3" lg="3">
            <CCard>
              <CCardHeader>Events by Title</CCardHeader>

              <apexchart width="100%" type="bar"
                :options="compute_chart_options('events-chart', event_stats, 'title', horizontal = true)"
                :series="compute_chart_series(event_stats, 'title')">
              </apexchart>
            </CCard>
          </CCol>
          <CCol xs="3" lg="3">
            <CCard>
              <CCardHeader>Events by Severity</CCardHeader>
              <apexchart width="100%" type="bar"
                :options="compute_chart_options('events-chart', event_stats, 'severity', horizontal = true)"
                :series="compute_chart_series(event_stats, 'severity')">
              </apexchart>
            </CCard>
          </CCol>
          <CCol xs="3" lg="3">
            <CCard>
              <CCardHeader>Events by Status</CCardHeader>
              <apexchart width="100%" type="bar"
                :options="compute_chart_options('statuses', event_stats, 'status', horizontal = true)"
                :series="compute_chart_series(event_stats, 'status')">
              </apexchart>
            </CCard>
          </CCol>
          <CCol xs="3" lg="3">
            <CCard>
              <CCardHeader>Events by Dismiss Reason</CCardHeader>
              <apexchart width="100%" type="bar"
                :options="compute_chart_options('dismiss_reasons', event_stats, 'dismiss reason', horizontal = true)"
                :series="compute_chart_series(event_stats, 'dismiss reason')">
              </apexchart>
            </CCard>
          </CCol>
        </CRow>
        <CRow v-if="this.$store.getters.user_has_permission('view_events')">
          <CCol xs="4" lg="12">
            <CCard>
              <CCardHeader>Events over Time</CCardHeader>
              <CCardBody>
                <apexchart width="100%" type="bar"
                  :options="compute_chart_options('events_over_time', event_stats, 'events_over_time', horizontal = false, height = 250)"
                  :series="compute_chart_series(event_stats, 'events_over_time')">
                </apexchart>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CTab>
      <CTab title="Cases">
        <CRow>
          <CCol xs="4" lg="4">
            <CCard>
              <CCardHeader>Cases by Severity</CCardHeader>
              <apexchart width="100%" type="bar"
                :options="compute_chart_options('case-severities', case_stats, 'severity', label = 'Cases')"
                :series="compute_chart_series(case_stats, 'severity')">
              </apexchart>
            </CCard>
          </CCol>
          <CCol xs="4" lg="4">
            <CCard>
              <CCardHeader>Cases by Status</CCardHeader>
              <apexchart width="100%" type="bar"
                :options="compute_chart_options('cases-statuses', case_stats, 'status', label = 'Cases')"
                :series="compute_chart_series(case_stats, 'status')">
              </apexchart>
            </CCard>
          </CCol>
          <CCol xs="4" lg="4">
            <CCard>
              <CCardHeader>Cases by Closure Reason</CCardHeader>
              <apexchart width="100%" type="bar"
                :options="compute_chart_options('cases-close-reasons', case_stats, 'close reason', label = 'Cases')"
                :series="compute_chart_series(case_stats, 'close reason')">
              </apexchart>
            </CCard>
          </CCol>
        </CRow>
        <CRow>
          <CCol xs="4" lg="12">
            <CCard>
              <CCardHeader>Cases over Time</CCardHeader>
              <CCardBody>
                <apexchart width="100%" type="bar"
                  :options="compute_chart_options('events_over_time', event_stats, 'events_over_time', horizontal = false, height = 250)"
                  :series="compute_chart_series(event_stats, 'events_over_time')">
                </apexchart>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CTab>
      <CTab title="Organization" v-if="current_user.default_org">
        <CCol col="12">
          <CCard>
            <CCardHeader>Events by Organization over the last 30 days</CCardHeader>
            <apexchart type="heatmap" :options="heatmap_options()" :series="heatmap_series()"></apexchart>
          </CCard>
        </CCol>
      </CTab>
      <CTab title="Inputs">
        <CCardBody>
          <CRow>
            <CCol>
              <CCard>
                <CRow>
                  <CCol>
                    <apexchart type="line" :options="spark1" :series="series" height="200" />
                  </CCol>
                </CRow>
              </CCard>
            </CCol>
            <CCol>
              <CCard>
                <CRow>
                  <CCol>
                    <apexchart type="area" :options="spark1" :series="series" height="200" />
                  </CCol>
                </CRow>
              </CCard>
            </CCol>
            <CCol>
              <CCard>
                <CRow>
                  <CCol>
                    <apexchart type="bar" :options="spark1" :series="series" height="200" />
                  </CCol>
                </CRow>
              </CCard>
            </CCol>
          </CRow>
        </CCardBody>
      </CTab>

    </CTabs>

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
  data() {
    return {
      range: {
        start: this.days_ago(7),
        end: this.today()
      },
      masks: {
        input: 'YYYY-MM-DD h:mm A'
      }, series: [{
        name: 'Events',
        data: [102, 144, 88, 68, 48, 64, 140, 75, 37, 29, 121, 46, 122, 89, 86, 107, 6, 95, 11, 17, 50, 51, 148, 120, 94, 5, 84, 116, 13, 21]
      }],
      spark1: {

        chart: {
          type: 'bar',
          height: 160,
          sparkline: {
            enabled: true
          },
        },
        stroke: {
          curve: 'smooth',
          width: 2
        },
        fill: {
          opacity: 0.5,
        },
        dataLabels: {
          enabled: true,
          distributed: true
        },
        title: {
          text: 'Input A',
          offsetX: 0,
          style: {
            fontSize: '24px',
          }
        },
        subtitle: {
          text: '32,150 Events',
          offsetX: 0,
          style: {
            fontSize: '14px',
          }
        }
      }
    }
  },
  created() {
    if (this.$store.getters.user_has_permission('view_events')) {
      this.$store.dispatch("getDashboardMetrics");
      this.$store.dispatch("getEventStats", { top: 5, metrics: ['events_over_time', 'title', 'status', 'dismiss_reason', 'severity'] })
    }

    this.$store.dispatch("getCaseStats", { top: 5, metrics: ['cases_over_time', 'status', 'close_reason', 'severity'] })
  },
  computed: mapState(['current_user', 'dashboard_metrics', 'event_stats', 'case_stats']),
  methods: {
    heatmap_options() {
      let options = {
        chart: {
          height: 200
        },
        dataLabels: {
          enabled: true
        },
        plotOptions: {
          heatmap: {
            min: 0,
            enableShades: false,
            shadeIntensity: 1
          }
        }
      }
      return options
    },
    heatmap_series() {
      return this.event_stats['events_by_day_by_org_series']
    },
    compute_chart_options(name, data, labels, horizontal = false, height = 250, show_labels = false) {
      let options = {
        chart: {
          id: name,
          title: {
            text: 'awesome'
          },
          height: height,
          toolbar: {
            show: false
          }
        },
        xaxis: {
          categories: this.computedKeys(data, labels),
        },
        dataLabels: {
          enabled: show_labels
        }
      }
      if (horizontal) {
        options['plotOptions'] = {
          bar: {
            horizontal: horizontal
          }
        }
      }
      return options
    },
    compute_pie_options(data, labels, label) {
      let options = {
        labels: this.computedKeys(data, labels),
        dataLabels: {
          dropShadow: {
            enabled: false
          }
        }
      }
      return options
    },
    compute_pie_series(data, labels, label) {
      return this.computedValues(data, labels, label = label)[0].data
    },
    compute_chart_series(data, labels, label = 'Events') {
      let x = this.computedValues(data, labels, label = label)[0]
      let y = {
        name: x.label,
        data: x.data
      }
      return [y]
    },
    applyTimeFilter() {
      this.$store.dispatch("getEventStats", { top: 5, metrics: ['events_over_time', 'title', 'status', 'dismiss_reason', 'severity'], start: this.range.start.toISOString(), end: this.range.end.toISOString() })
      this.$store.dispatch("getCaseStats", { top: 5, metrics: ['cases_over_time', , 'status', 'close_reason', 'severity'], start: this.range.start.toISOString(), end: this.range.end.toISOString() })
    },
    today() {
      let d = new Date()
      d.setHours(23, 59, 59, 0)
      return d
    },
    days_ago(offset) {
      let d = new Date()
      d.setDate(d.getDate() - offset)
      d.setHours(0, 0, 0, 0)
      return d
    },
    color(value) {
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
    computedKeys(data, field) {
      let keys = []
      for (let key in data[field]) {
        if (field === 'severity') {
          key = this.getSeverityText(parseInt(key))
        }
        if (!keys.includes(key)) {
          keys.push(key)
        }
      }
      return keys
    },
    computedValues(data, field, label = 'Events') {
      let dataset = {
        'label': label,
        'data': [],
        'backgroundColor': []
      }
      for (let key in data[field]) {
        dataset.data.push(data[field][key])
        dataset.backgroundColor.push('#3c4b64')
      }
      return [dataset]
    },
    getRandomColor() {
      var letters = '0123456789ABCDEF'.split('');
      var color = '#';
      for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    },
    getSeverityText(severity) {
      switch (severity) {
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
