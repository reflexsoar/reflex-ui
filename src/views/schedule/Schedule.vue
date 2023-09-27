<template>
  <div>
    <CRow class="page-heading page-heading-row page-heading-no-nav">
      <CCol>
        <h1>
          Schedules<button
            type="button"
            class="kb"
            onclick="window.open('https://docs.reflexsoar.com/en/latest/schedules')"
          >
            <CIcon name="cil-book" size="lg" />
          </button>
        </h1>
      </CCol>
    </CRow>
    <CRow>
      <CCol>
        <ScheduleList></ScheduleList>
      </CCol>
    </CRow>
  </div>
</template>

<script>
import { mapState } from "vuex";

import ScheduleList from "./ScheduleList.vue";

export default {
  name: "Schedules",
  components: {
    ScheduleList,
  },
  data() {
    return {};
  },
  methods: {
    getSchedules() {
      this.$store.dispatch("getSchedules");
    },
  },
  mounted() {},
};
</script>
