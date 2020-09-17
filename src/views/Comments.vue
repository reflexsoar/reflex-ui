<template>
  <div class="comments">
    <timeline>
      <timeline-item v-for="comment in comment_list" :key="comment.uuid" bg-color="#9dd8e0">
        <CCard>
          <CCardHeader class="bg-light">
            <b>{{comment.created_by.username}}</b>
            commented {{comment.created_at | moment('from', 'now')}}.
          </CCardHeader>
          <CCardBody>
            <vue-markdown>{{comment.message}}</vue-markdown>
          </CCardBody>
        </CCard>
      </timeline-item>
    </timeline>
    <CRow>
      <CCol>
        <CCardBody>
          <CTextarea
            v-model="comment"
            rows="5"
            placeholder="Enter your comment here...Markdown format is supported"
          ></CTextarea>
          <CButton color="primary" @click="leaveComment()" v-bind:disabled="comment.length == 0">Comment</CButton>
        </CCardBody>
      </CCol>
    </CRow>
  </div>
</template>

<script>
import { vSelect } from "vue-select";
import { Timeline, TimelineItem, TimelineTitle } from "vue-cute-timeline";
export default {
  name: "Comments",
  components: {
    Timeline,
    TimelineItem,
    TimelineTitle,
  },
  props: {
    comments: Array,
    comment_type: "",
    uuid: "",
  },
  data() {
    return {
      comment_list: this.comments,
      comment: ""
    };
  },
  created() {
  },
  methods: {
    leaveComment() {
        let data = {'message': this.comment, 'case_uuid': this.uuid}
        this.$store.dispatch('createCaseComment', data)
        this.comment = "";
    }
  },
};
</script>