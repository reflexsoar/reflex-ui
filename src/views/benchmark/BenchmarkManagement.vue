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
        <BenchmarkRules/>
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

import BenchmarkRules from "./BenchmarkRules.vue";

export default {
  name: "BenchmarkManagement",
  components: {
    BenchmarkRules,
  },
  computed: mapState(["current_user"]),
  data() {
    return {
      alert: {
        show: false,
        color: "success",
        message: "",
      }
    };
  }
};
</script>
