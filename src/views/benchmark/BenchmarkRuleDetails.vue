<template>
  <div>
    <CRow class="page-heading">
      <CCol>
        <h1>{{ benchmark_rule.name }}</h1>
      </CCol>
      <CCol>
        <CRow>
          <CCol>
            <CBadge
              :color="getSeverityColor(benchmark_rule.severity)"
              class="tag metric-badge"
              >Severity
              <h3>{{ getSeverityText(benchmark_rule.severity) }}</h3>
            </CBadge>
          </CCol>
          <CCol>
            <CBadge
              :color="getSeverityColor(benchmark_rule.severity)"
              class="tag metric-badge"
              >Risk Score
              <h3>{{ benchmark_rule.risk_score }}</h3></CBadge
            >
          </CCol>
          <CCol>
            <CBadge
              :color="getSeverityColor(benchmark_rule.severity)"
              class="tag metric-badge"
              >Secure Score
              <h3>
                {{ benchmark_rule.secure_score ? benchmark_rule.secure_score : 0 }}
              </h3></CBadge
            >
          </CCol>
        </CRow>
      </CCol>
    </CRow>
    <CTabs
      addNavWrapperClasses="page-nav"
      addTabClasses="page-nav-tab-body"
      addNavClasses="page-nav-tab"
      :activeTab.sync="active_tab"
    >
      <CTab title="Overview">
        <h3 class="page-sub-header">Overview</h3>
        <CRow v-if="loading">
          <CCol class="text-center">
            <CCard>
              <CCardBody>
                <CSpinner />
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
        <CRow v-else>
          <CCol col="9">
            <CCard>
              <CCardBody>
                <CRow>
                  <CCol>
                    <h4>Description</h4>
                    <p>{{ benchmark_rule.description }}</p>
                  </CCol>
                </CRow>

                <CRow>
                  <CCol>
                    <h4>Remediation Advice</h4>
                    <p>Fix the thing</p>
                  </CCol>
                </CRow>
                <CRow>
                  <CCol>
                    <h4>Supported Platforms</h4>
                    <p><TagList :tags="benchmark_rule.platform" :tagIcon="false" /></p>
                  </CCol>
                </CRow>
                <CRow>
                  <CCol>
                    <h4>Compliance Frameworks</h4>
                    <p><TagList :tags="benchmark_rule.frameworks" :tagIcon="false" /></p>
                  </CCol>
                </CRow>
              </CCardBody>
              <CCardFooter>
                <CRow>
                  <CCol>
                    <CBadge color="secondary" class="tag"
                      ><b>Rule Version:</b> {{ benchmark_rule.version }}</CBadge
                    >
                  </CCol>
                </CRow>
              </CCardFooter>
            </CCard>
          </CCol>
          <CCol col="3">
            <CCard>
              <CCardBody>
                <h4>Asset Compliance</h4>
                <CRow>
                  <CCol>
                    <CRow>
                      <CCol>
                        <b>Total Assets</b>
                        <CBadge color="info" class="tag metric-badge">{{
                          getRuleMetrics(benchmark_rule.rule_id).total
                        }}</CBadge
                        ><br />
                      </CCol>
                    </CRow>
                    <CRow>
                      <CCol>
                        <b>Passed</b>
                        <CBadge color="success" class="tag metric-badge">{{
                          getRuleMetrics(benchmark_rule.rule_id).passed
                        }}</CBadge
                        ><br />
                      </CCol>
                    </CRow>
                    <CRow>
                      <CCol>
                        <b>Failed</b>
                        <CBadge color="danger" class="tag metric-badge">{{
                          getRuleMetrics(benchmark_rule.rule_id).failed
                        }}</CBadge
                        ><br />
                      </CCol>
                    </CRow>
                    <CRow>
                      <CCol>
                        <b>Error</b>
                        <CBadge color="warning" class="tag metric-badge">{{
                          getRuleMetrics(benchmark_rule.rule_id).error
                        }}</CBadge
                        ><br />
                      </CCol>
                    </CRow>
                    <CRow>
                      <CCol>
                        <b>Skipped</b>
                        <CBadge color="secondary" class="tag metric-badge">{{
                          getRuleMetrics(benchmark_rule.rule_id).skipped
                        }}</CBadge
                        ><br />
                      </CCol>
                    </CRow>
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CTab>
      <CTab title="Asset Results" @click="getBenchmarkAssets()">
        <h3 class="page-sub-header">Asset Results</h3>
        <CRow v-if="assets_loading">
          <CCol class="text-center">
            <CCard>
              <CCardBody>
                <CSpinner />
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
        <CRow v-else>
          <CCol>
            <CCard>
              <CDataTable
                :items="benchmark_assets"
                :fields="asset_fields"
                column-filter
                sorter
                :noItemsView="{
                  noResults: 'No Assets Assessed',
                  noItems: 'No Assets Assessed',
                }"
              >
                <template #hostname="{ item }">
                  <td>
                    <router-link
                      :to="{
                        name: 'View Agent',
                        params: { uuid: item.agent },
                      }"
                      >{{ item.hostname }}</router-link
                    >
                  </td>
                </template>
                <template #status="{ item }">
                  <td>
                    <CBadge :color="getStatusColor(item.status)" class="tag">
                      {{ item.status }}
                    </CBadge>
                  </td>
                </template>
                <template #assessed_at="{ item }">
                  <td>
                    {{ item.assessed_at | moment("from", "now") }} | <CBadge color="secondary">{{item.assessed_at | moment('Y-MM-DD HH:mm:ssZ') }}</CBadge>
                  </td>
                </template>
                <template #actions="{item, index}">
                  <td>
                    <CDropdown toggler-text="Manage" color="secondary" size="sm">
                      <CDropdownItem
                        @click="toggleOutput(item, index)"
                        >{{ Boolean(item._output_toggled) ? 'Hide' : 'Show' }} Last Output</CDropdownItem
                      >
                      <CDropdownItem
                        @click="toggleHistory(item.agent, index)"
                        >{{ Boolean(item._history_toggled) ? 'Hide' : 'Show' }} Asset History</CDropdownItem>
                    </CDropdown>
                  </td>
                </template>
                <template #details="{ item }">
                  <CCardBody v-if="Boolean(item._output_toggled) || Boolean(item._history_toggled)" style="border-top:1px solid #cfcfcf">
                    <CCollapse :show="Boolean(item._output_toggled)" :duration="300">
                      <div class="history-container">
                        <h5>Latest Output</h5>
                        <timeline>
                        <timeline-item bg-color="#9dd8e0"  style="padding-bottom:0px; margin-top:10px;">
                          {{ item.assessed_at | moment('from') }} | <CBadge color="secondary">{{ item.assessed_at | moment('Y-MM-DD HH:mm:ssZ') }}</CBadge> | <CBadge :color="getStatusColor(item.status)">{{item.status}}</CBadge>
                        
                        <pre class="rule-output"  style="margin-top: 2px;">{{ item.output }}</pre>                      
                        </timeline-item>
                        </timeline>
                      </div>
                    </CCollapse>
                    <CCollapse :show="Boolean(item._history_toggled)" :duration="300">
                      <div class="history-container">
                        <h5>History</h5>
                        <div class="text-center" v-if="history_loading">
                          <CSpinner/>
                        </div>
                        <timeline v-else>
                          <timeline-item bg-color="#9dd8e0" style="padding-bottom:0px; margin-top:10px;" v-for="entry, i in benchmark_history[item.agent]" :hollow="true" :key="i">
                            <small>{{ entry.assessed_at | moment('from') }}</small> | <CBadge color="secondary">{{ entry.assessed_at | moment('Y-MM-DD HH:mm:ssZ') }}</CBadge> | <CBadge :color="getStatusColor(entry.status)">{{entry.status}}</CBadge>
                            <pre class="rule-output" style="margin-top: 2px;">{{ entry.output }}</pre></timeline-item>
                        </timeline>
                      </div>
                    </CCollapse>
                  </CCardBody>
                </template>
              </CDataTable>
            </CCard>
          </CCol>
        </CRow>
      </CTab>
      <CTab title="Assessment Criteria">
        <CCard>
          <CCardBody>
            <CRow>
              <CCol>
                <h4>Check Script</h4>
                <pre class="rule-criteria">{{ benchmark_rule.assess.script }}</pre>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </CTab>
    </CTabs>
  </div>
</template>

<style>
.metric-badge {
  display: block;
}

.rule-output {
  background: #0e0e0e;
  color: #ccc !important;
  border: 1px solid rgb(216, 219, 224);
  border-radius: 0.25rem;
  box-shadow: inset 0 1px 1px rgb(0 0 21 / 8%);

  max-height: 400px;
  overflow-y: auto;

  white-space: pre-wrap;

  /* you must provide font-family font-size line-height. Example: */
  font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
  font-size: 12px;
  line-height: 1.5;
  padding: 5px;
  padding-left: 10px;
}

.rule-criteria {
  background: #0e0e0e;
  color: #ccc !important;
  border: 1px solid rgb(216, 219, 224);
  border-radius: 0.25rem;
  box-shadow: inset 0 1px 1px rgb(0 0 21 / 8%);

  max-height: 400px;
  overflow-y: auto;

  /* you must provide font-family font-size line-height. Example: */
  font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  padding: 5px;
  padding-left: 10px;
}

.history-container {
  max-height: 250px;
  overflow-y: auto;
}
</style>

<script>
import { mapState } from "vuex";

import TagList from "../components/TagList.vue";

import { Timeline, TimelineItem, TimelineTitle } from 'vue-cute-timeline'
import 'vue-cute-timeline/dist/index.css'

export default {
  name: "BenchmarkRuleDetails",
  components: {
    TagList,
    Timeline,
    TimelineItem,
  },
  computed: mapState([
    "current_user",
    "benchmark_rule",
    "benchmark_metrics",
    "benchmark_assets",
  ]),
  created() {
    let uuid = this.$route.params.uuid;
    this.loading = true;
    this.$store.dispatch("getBenchmarkRule", { uuid: uuid }).then(() => {
      this.$store.dispatch("getBenchmarkMetrics", { rule_uuids: [uuid] }).then(() => {
        this.loading = false;
      });
    });
  },
  watch: {
    active_tab: function (val) {
      if (val == 1) {
        this.getBenchmarkAssets();
      }
    },
  },
  data() {
    return {
      loading: false,
      assets_loading: false,
      history_loading: false,
      active_tab: 0,
      target_asset: {},
      benchmark_history: {},
      asset_fields: [
        "hostname",
        {
          key: "status",
          label: "Status",
          _classes: "text-center",
          sortable: true,
          filter: true,
        },
        {
          key: "assessed_at",
          label: "Assessed At",
          _classes: "text-center",
          sortable: true,
          filter: true,
        },
        {
          key: "actions",
          label: "",
          _classes: "text-center",
          sortable: false,
          filter: false,
        },
      ],
    };
  },
  methods: {
    toggleOutput(item, index) {
      this.$set(this.benchmark_assets[index], '_output_toggled', !this.benchmark_assets[index]._output_toggled)
    },
    toggleHistory(uuid, index) {
      if(!this.benchmark_assets[index]._history_toggled) {
        let rule_uuid = this.$route.params.uuid;
        this.history_loading = true
        this.$set(this.benchmark_assets[index], '_history_toggled', !this.benchmark_assets[index]._history_toggled)
        this.$store.dispatch("getBenchmarkAssetHistory", { uuid: rule_uuid, asset_uuid: uuid}).then((resp) => {
          this.benchmark_history[uuid] = resp.data.history
          this.history_loading = false;
        })
      } else {
        this.$set(this.benchmark_assets[index], '_history_toggled', !this.benchmark_assets[index]._history_toggled)
      }
    },
    getRuleMetrics(uuid) {
      if (this.benchmark_metrics[uuid]) {
        return this.benchmark_metrics[uuid];
      } else {
        return {
          total: 0,
          passed: 0,
          failed: 0,
          error: 0,
          skipped: 0,
        };
      }
    },
    showAssetOutput(uuid) {
      this.target_asset = this.benchmark_assets.find((x) => x.uuid == uuid);
      this.view_asset_output = true;
    },
    hideAssetOutput() {
      this.view_asset_output = false;
      this.target_asset = {}
    },
    getBenchmarkAssets() {
      let uuid = this.$route.params.uuid;
      this.assets_loading = true;
      this.benchmark_history = {}
      this.$store
        .dispatch("getBenchmarkAssets", { uuid: uuid })
        .then(() => {
          this.assets_loading = false;
        })
        .catch(() => {
          this.assets_loading = false;
        });
    },
    getSeverityText(sev) {
      return this.$store.getters.severity_text(sev);
    },
    getSeverityColor(sev) {
      return this.$store.getters.severity_color(sev);
    },
    getStatusColor(status) {
      switch (status) {
        case "passed":
          return "success";
        case "failed":
          return "danger";
        case "error":
          return "warning";
        case "skipped":
          return "secondary";
        default:
          return "secondary";
      }
    },
  },
};
</script>
