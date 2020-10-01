<template>
    <div>
    <timeline>
        <timeline-item bg-color="#9dd8e0" style="padding-bottom:5px;" v-for="entry in entries" :hollow="true" :key="entry.uuid"><small>{{entry.created_at | moment('LLLL')}}</small><vue-markdown style="margin-bottom:0px;">{{entry.message}} by *{{entry.created_by.username}}*</vue-markdown></timeline-item>
    </timeline>
    </div>
</template>

<script>
import { vSelect } from "vue-select";
import { Timeline, TimelineItem, TimelineTitle } from 'vue-cute-timeline'
export default {
  name: "CaseHistoryTimeline",
  components: {
    Timeline,
    TimelineItem,
    TimelineTitle,
  },
  props: {
    entries: Array,
  }
};
</script>
