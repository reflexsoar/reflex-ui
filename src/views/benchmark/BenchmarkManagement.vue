<template>
  <div>
    <CRow class="page-heading">
      <CCol>
        <h2>Benchmark Management</h2>
        <CAlert :show.sync="alert.show" :color="alert.color" :fade="false" closeButton>
          {{ alert.message }}
        </CAlert>
      </CCol>
      <CCol>
        <CAlert color="info">
          <b>Beta Functionality</b> This functionality is currently in Beta and requires a
          special agent to properly function.
        </CAlert>
      </CCol>
    </CRow>
    <CTabs
      addNavWrapperClasses="page-nav"
      addTabClasses="page-nav-tab-body"
      addNavClasses="page-nav-tab"
    >
      <CTab title="Rules">
        <BenchmarkRules />
      </CTab>
      <CTab title="Rule Sets"> </CTab>
      <CTab title="Exceptions"> </CTab>
      <CTab title="Frameworks">
        <CRow class="page-sub-header">
          <CCol>
            <h3>Frameworks</h3>
          </CCol>
          <CCol>
            <CInput
                  v-model="control_search"
                  placeholder="Search controls by control number or name"
                >
                  <template #append>
                    <CButton color="primary" @click="control_search = ''">Clear</CButton>
                  </template>
                </CInput>
          </CCol>
        </CRow>
        <CRow>
          <CCol>
            <CCard>
              <CCardBody>
                
                <CTabs
                  variant="pills"
                  :vertical="{ navs: 'col-md-3', content: 'col-md-9' }"
                >
                  <CTab v-for="benchmark in benchmarks" :title="benchmark">
                    <h4>{{ benchmark }}</h4>
                    <CListGroup>
                      <CListGroupItem
                        v-for="(control, index) in filtered_controls(benchmark)"
                        :key="index"
                        :action="true"
                        @click="toggleDetails(index)"
                        style="cursor: pointer"
                      >
                        <CRow>
                          <CCol>
                            {{ control.control_number }} - {{ control.control_name }}
                          </CCol>
                          <CCol class="text-right" col="1">
                            <CBadge color="secondary" v-if="control.automated"
                              >Automated</CBadge
                            >
                          </CCol>
                        </CRow>
                        <CCollapse :show="showDetails(index)">
                          {{ control }}
                        </CCollapse>
                      </CListGroupItem>
                    </CListGroup>
                  </CTab>
                </CTabs>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CTab>
    </CTabs>
  </div>
</template>

<script>
import { mapState } from "vuex";

import BenchmarkRules from "./BenchmarkRules.vue";

export default {
  name: "BenchmarkManagement",
  components: {
    BenchmarkRules,
  },
  computed: {
    ...mapState(["current_user"]),
    benchmarks() {
      // Return a list of unique benchmarks from the rules
      let benchmarks = [];
      for (let rule in this.sample_controls) {
        let benchmark_name = this.sample_controls[rule].benchmark_name;
        if (!benchmarks.includes(benchmark_name)) {
          benchmarks.push(benchmark_name);
        }
      }
      return benchmarks;
    },
  },
  methods: {
    filtered_controls(benchmark) {
      return this.sample_controls.filter((control) => {
        // If the control name contains the search string, return true
        if (
          control.control_name
            .toLowerCase()
            .includes(this.control_search.toLowerCase()) &&
          control.benchmark_name == benchmark
        ) {
          return true;
        }

        // If the control number contains the search string, return true
        if (
          control.control_number
            .toLowerCase()
            .includes(this.control_search.toLowerCase()) &&
          control.benchmark_name == benchmark
        ) {
          return true;
        }
      });
    },
    toggleDetails(index) {
      console.log(index);
      this.$set(
        this.sample_controls[index],
        "_show_details",
        !this.sample_controls[index]._show_details
      );
    },
    showDetails(index) {
      return this.sample_controls[index]._show_details;
    },
  },
  data() {
    return {
      control_search: "",
      control_fields: ["control_name"],
      sample_controls: [
        {
          framework: "CIS",
          platform: "Windows",
          benchmark_name: "Microsoft Windows Server 2019 Benchmark",
          version: "2.0.0",
          date: "04-14-2023",
          control_number: "1.1.1",
          level: 1,
          control_name:
            "Ensure 'Enforce password history' is set to '24 or more password(s)'",
          automated: true,
        },
        {
          framework: "CIS",
          platform: "Windows",
          benchmark_name: "Microsoft Windows Server 2019 Benchmark",
          version: "2.0.0",
          date: "04-14-2023",
          control_number: "1.1.2",
          level: 1,
          control_name:
            "Ensure 'Maximum password age' is set to '365 or fewer days, but not 0'",
          automated: true,
        },
        {
          framework: "CIS",
          platform: "Windows",
          benchmark_name: "Microsoft Windows Server 2019 Benchmark",
          version: "2.0.0",
          date: "04-14-2023",
          control_number: "1.1.3",
          level: 1,
          control_name: "Ensure 'Minimum password age' is set to '1 or more day(s)'",
          automated: true,
        },
        {
          framework: "CIS",
          platform: "Windows",
          benchmark_name: "Microsoft Windows Server 2019 Benchmark",
          version: "2.0.0",
          date: "04-14-2023",
          control_number: "1.1.4",
          level: 1,
          control_name:
            "Ensure 'Minimum password length' is set to '14 or more character(s)'",
          automated: true,
        },
        {
          framework: "CIS",
          platform: "Windows",
          benchmark_name: "Microsoft Windows Server 2019 Benchmark",
          version: "2.0.0",
          date: "04-14-2023",
          control_number: "1.1.5",
          level: 1,
          control_name:
            "Ensure 'Password must meet complexity requirements' is set to 'Enabled'",
          automated: true,
        },
        {
          framework: "CIS",
          platform: "Windows",
          benchmark_name: "Microsoft Windows Server 2019 Benchmark",
          version: "2.0.0",
          date: "04-14-2023",
          control_number: "1.1.6",
          level: 1,
          control_name:
            "Ensure 'Store passwords using reversible encryption' is set to 'Disabled'",
          automated: true,
        },
        {
          framework: "CIS",
          platform: "Windows",
          benchmark_name: "Microsoft Windows Server 2019 Benchmark",
          version: "2.0.0",
          date: "04-14-2023",
          control_number: "1.2.1",
          level: 1,
          control_name:
            "Ensure 'Account lockout duration' is set to '15 or more minute(s)'",
          automated: true,
        },
        {
          framework: "CIS",
          platform: "Windows",
          benchmark_name: "Microsoft Windows Server 2019 Benchmark",
          version: "2.0.0",
          date: "04-14-2023",
          control_number: "1.2.2",
          level: 1,
          control_name:
            "Ensure 'Account lockout threshold' is set to '5 or fewer invalid logon attempt(s), but not 0'",
          automated: true,
        },
        {
          framework: "CIS",
          platform: "Windows",
          benchmark_name: "Microsoft Windows Server 2019 Benchmark",
          version: "2.0.0",
          date: "04-14-2023",
          control_number: "1.2.4",
          level: 1,
          control_name:
            "Ensure 'Reset account lockout counter after' is set to '15 or more minute(s)'",
          automated: true,
        },
        {
          framework: "CIS",
          platform: "Windows",
          benchmark_name: "Microsoft Windows Server 2019 Benchmark",
          version: "2.0.0",
          date: "04-14-2023",
          control_number: "2.2.1",
          level: 1,
          control_name:
            "Ensure 'Access Credential Manager as a trusted caller' is set to 'No One'",
          automated: true,
        },
        {
          framework: "CIS",
          platform: "Windows",
          benchmark_name: "Microsoft Windows Server 2019 Benchmark",
          version: "2.0.0",
          date: "04-14-2023",
          control_number: "2.2.2",
          level: 1,
          control_name:
            "Ensure 'Access this computer from the network' is set to 'Administrators, Authenticated Users, ENTERPRISE DOMAIN CONTROLLERS' (DC only)",
          automated: true,
        },
        {
          framework: "CIS",
          platform: "Windows",
          benchmark_name: "Microsoft Windows Server 2019 Benchmark",
          version: "2.0.0",
          date: "04-14-2023",
          control_number: "2.2.3",
          level: 1,
          control_name:
            "Ensure 'Access this computer from the network' is set to 'Administrators, Authenticated Users' (MS only)",
          automated: true,
        },
      ],
      alert: {
        show: false,
        color: "success",
        message: "",
      },
    };
  },
};
</script>
