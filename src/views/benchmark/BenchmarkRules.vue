<template>
  <div>
    <CRow>
      <CCol>
        <h3 class="page-sub-header">Benchmark Rules</h3>
      </CCol>
    </CRow>
    <CRow>
      <CCol>
        <CCard style="margin-top: 5px">
          <CDataTable
            :items="benchmark_rules"
            :fields="columns"
            :responsive="false"
            pagination
            :items-per-page="10"
            :sorter="{ external: true, resetable: true }"
            :loading="loading"
          >
            <template #name="{ item }">
              <td>
                <b
                  ><router-link :to="`/benchmarks/rules/${item.uuid}`">{{
                    item.name
                  }}</router-link></b
                ><br />
                <CBadge color="secondary" class="tag tag-sm"
                  ><b>Version:</b> {{ item.version }}</CBadge
                >
              </td>
            </template>
            <template #organization="{ item }">
              <td>
                <span v-if="item.organization">
                  <OrganizationBadge :organization="item.organization" />
                </span>
                <span v-else><CBadge color="secondary" class="tag">System</CBadge></span>
              </td>
            </template>
            <template #severity="{ item }">
              <td class="text-center">
                <CBadge :color="severityColor(item.severity)" class="tag">{{
                  severityText(item.severity)
                }}</CBadge>
              </td>
            </template>
            <template #risk_score="{ item }">
              <td class="text-center">
                <CBadge :color="severityColor(item.severity)" class="tag">{{
                  item.risk_score
                }}</CBadge>
              </td>
            </template>
            <template #scoring="{ item }">
              <td>
                <BenchmarkScore :score="getRuleMetrics(item.rule_id)" />
              </td>
            </template>
            <template #actions="{ item }">
              <td class="text-right">
                <CDropdown toggler-text="Actions" color="secondary" size="sm">
                  <CDropdownItem
                    @click="editRule(item.uuid)"
                    v-if="current_user.permissions['update_benchmark_rule']"
                    >Edit</CDropdownItem
                  >
                  <CDropdownItem
                    v-if="
                      !item.active && current_user.permissions['delete_benchmark_rule']
                    "
                    @click="deleteRule(item.uuid)"
                    >Delete</CDropdownItem
                  >
                </CDropdown>
              </td>
            </template>
          </CDataTable>
        </CCard>
      </CCol>
    </CRow>
  </div>
</template>

<script>
import { mapState } from "vuex";

import OrganizationBadge from "../OrganizationBadge";
import TagBucket from "../components/TagBucket.vue";
import BenchmarkScore from "./BenchmarkScore.vue";

export default {
  name: "FimRules",
  components: {
    OrganizationBadge,
    TagBucket,
    BenchmarkScore,
  },
  computed: mapState(["current_user", "benchmark_rules", "benchmark_metrics"]),
  created: function () {
    this.loading = true
    this.$store.dispatch("getBenchmarkRules", {}).then(() => {
      this.$store.dispatch("getBenchmarkMetrics", {}).then(() => {
        this.loading = false
      });
    });
    if (this.current_user.default_org) {
      this.columns.splice(3, 0, "organization");
    }
  },
  data() {
    return {
      alert: {
        show: false,
        color: "success",
        message: "",
      },
      loading: false,
      benchmark_rule: {},
      columns: [
        { key: "name", label: "Name", _style: "width: 40%" },
        "severity",
        "risk_score",
        { key: "scoring", label: "Asset Compliance" },
        //{ key: "actions", label: "" },
      ],
      show_benchmark_rule_wizard: false,
      modal_mode: "create",
      empty_score: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        error: 0,
      },
    };
  },
  methods: {
    getRuleMetrics(rule_id) {
      if (!this.benchmark_metrics[rule_id]) {
        return this.empty_score;
      }
      return this.benchmark_metrics[rule_id];
    },
    severityText(severity) {
      return this.$store.getters.severity_text(severity);
    },
    severityColor(severity) {
      return this.$store.getters.severity_color(severity);
    },
    createRule() {
      this.modal_mode = "create";
      this.benchmark_rule = {};
      this.show_benchmark_rule_wizard = true;
    },
    editRule(uuid) {
      this.benchmark_rule = this.benchmark_rules.find((x) => x.uuid == uuid);
      this.modal_mode = "edit";
      this.show_benchmark_rule_wizard = true;
    },
    deleteRule(uuid) {
      this.$store.dispatch("deleteBenchmarkRule", { uuid: uuid });
    },
  },
};
</script>
