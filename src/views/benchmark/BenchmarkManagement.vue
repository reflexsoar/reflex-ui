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
          <b>Beta Functionality</b> This functionality is currently in Beta and requires a special agent to properly
          function.
        </CAlert>
      </CCol>
    </CRow>    
    <CTabs
        addNavWrapperClasses="page-nav"
        addTabClasses="page-nav-tab-body"
        addNavClasses="page-nav-tab"
      >
      <CTab title="Rules">
      </CTab>
      <CTab title="Rule Sets">
      </CTab>
      <CTab title="Exceptions">
      </CTab>
    </CTabs>
  </div>
</template>

<script>
import { mapState } from "vuex";

import OrganizationBadge from "../OrganizationBadge";
import TagBucket from "../components/TagBucket.vue";

export default {
  name: "BenchmarkManagement",
  components: {
    OrganizationBadge,
    TagBucket,
  },
  computed: mapState(["current_user", "benchmark_rules"]),
  created: function () {
    this.$store.dispatch("getBenchmarkRules", {});
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
      benchmark_rule: {},
      columns: [
        "name",
        "description",
        { key: "actions", label: "" },
      ],
      show_benchmark_rule_wizard: false,
      modal_mode: "create",
    };
  },
  methods: {
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
    }
  },
};
</script>
