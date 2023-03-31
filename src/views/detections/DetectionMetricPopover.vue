<template>
  <div>
    <CCard class="bucket" @click="toggleDetails()">
      <CIcon name="cilSpeedometer" style="margin-top:-1px; width: 14px; height: 14px;"/> Metrics
      <CCard class="info" v-if="show_details">
        <span class="small">
        <b>Query Time:</b>
        {{
        detection.query_time_taken ? detection.query_time_taken.toLocaleString() : 0
        }}
        ms<br />
        <b>Total Time:</b>
        {{ detection.time_taken ? detection.time_taken.toLocaleString() : 0 }} ms<br>
        <b>Last Hit:</b>
        {{ detection.last_hit | moment('from','now') }}<br />
        <b>Total Hits:</b>
        {{ detection.total_hits ? detection.total_hits.toLocaleString() : 0 }}<br />
        </span>
    </CCard>
    </CCard>
    
  </div>
</template>

<style scoped>
.bucket {
  padding-left: 8px;
  padding-right: 8px;
  padding-bottom: 1px;
  display: inline;
  cursor: pointer;
  text-align: center;
}

.info {
  position: absolute;
  width: 200px;
  text-align: left;
  margin-top: 5px;
  display: block;
  box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.2);
  padding: 5px;
  border: 1px solid #cfcfcf;
  border-radius: 3px;
  z-index: 1002;
}
</style>

<script>

export default {
  name: "DetectionMetricPopover",
  props: {
    detection: Object,
  },
  data() {
    return {
      show_details: false,
    };
  },
  methods: {
    outsideClickHandler(e) {
      if(!this.$el.contains(e.target)) {
        this.show_details = false;
        document.removeEventListener('click', this.outsideClickHandler);
      }
    },
    toggleDetails() {
      this.show_details = !this.show_details;
      if(this.show_details) {
        document.addEventListener('click', this.outsideClickHandler);
      }
    }
  }
};
</script>
