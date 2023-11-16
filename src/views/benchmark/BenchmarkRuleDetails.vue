<template>
  <div>
    <CRow class="page-heading">
      <CCol>
        <h1>{{ benchmark_rule.name }}</h1>
      </CCol>
    </CRow>
    <CTabs
      addNavWrapperClasses="page-nav"
      addTabClasses="page-nav-tab-body"
      addNavClasses="page-nav-tab"
    >
      <CTab title="Overview">
        <h3 class="page-sub-header">Overview</h3>
        <CRow v-if="loading">
          <CCol class="text-center">
            <CSpinner />
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
                    <p>Do the needful</p>
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
            </CCard>
          </CCol>
          <CCol col="3">
            <CCard>
              <CCardBody>
                <h4>Scoring</h4>
                <CRow>
                  <CCol>
                    <CBadge color="dark" class="tag metric-badge"
                      ><h1>{{ benchmark_rule.risk_score }}</h1>
                      Severity</CBadge
                    >
                  </CCol>
                  <CCol>
                    <CBadge color="dark" class="tag metric-badge"
                      ><h1>{{ benchmark_rule.risk_score }}</h1>
                      Risk Score</CBadge
                    >
                  </CCol> </CRow
                ><br />
                <h5>Asset Scoring</h5>
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
                        <b>Passed</b>
                        <CBadge color="secondary" class="tag metric-badge">{{
                          getRuleMetrics(benchmark_rule.rule_id).total
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
      <CTab title="Asset Results"> </CTab>
      <CTab title="Assessment Criteria">
        <CCard>
          <CCardBody>
            <CRow>
              <CCol>
                <h4>Check Script</h4>
                <pre class="query">{{ benchmark_rule.assess.script }}</pre>
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

.query {
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
</style>

<script>
import { mapState } from "vuex";

import TagList from "../components/TagList.vue";

export default {
  name: "BenchmarkRuleDetails",
  components: {
    TagList,
  },
  computed: mapState(["current_user", "benchmark_rule", "benchmark_metrics"]),
  created() {
    let uuid = this.$route.params.uuid;
    this.loading = true;
    this.$store.dispatch("getBenchmarkRule", { uuid: uuid }).then(() => {
      this.$store.dispatch("getBenchmarkMetrics", { rule_uuids: [uuid] }).then(() => {
        this.loading = false;
      });
    });
  },
  data() {
    return {
      loading: false,
    };
  },
  methods: {
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
  },
};
</script>
