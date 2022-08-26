<template>
  <CCard>
    <CCardHeader class="bg-light">
      <CRow>
        <CCol col="6">
          <span v-if="!comment.is_closure_comment"
            ><b>{{ comment.created_by.username }}</b><span v-if="comment.other_organization_name">&nbsp;<CBadge class="tag" size="xs" color="secondary">{{comment.other_organization_name}}</CBadge></span> commented
            {{ comment.created_at | moment("from", "now") }}. <span v-if="comment.edited"><i>edited</i></span></span
          >
          <span v-else
            ><b>{{ comment.created_by.username }}</b><span v-if="comment.other_organization_name">&nbsp;<CBadge class="tag" size="xs" color="secondary">{{comment.other_organization_name}}</CBadge></span> closed the case with the
            following comment at
            {{ comment.created_at | moment("from", "now") }}.</span
          >
        </CCol>
        
          <CCol col="6" class="text-right">
            <CButtonGroup>
            <CButton color="secondary" 
              size="sm" 
              @click="edit = !edit"
              v-if="current_user.uuid == comment.created_by.uuid && settings.allow_comment_editing && !comment.is_closure_comment"
              >Edit</CButton
            >
            <CButton
              color="danger"
              size="sm"
              v-if="
                current_user.uuid == comment.created_by.uuid &&
                settings.allow_comment_deletion &&
                !comment.is_closure_comment &&
                current_user.role.permissions['delete_case_comment']
              "
              @click="deleteAction(comment.uuid)"
              >Delete</CButton
            >
          </CButtonGroup>
        </CCol>
      </CRow>
    </CCardHeader>
    <CCardBody>
      <vue-markdown v-if="!edit">{{ comment.message }}</vue-markdown><span v-else>
        <markdown-editor height="auto" theme="info" :value="comment.message" @change="editted_comment = $event"></markdown-editor>
        <!--<CTextarea :value="comment.message" @change="editted_comment = $event" rows="5"></CTextarea>-->
      <CButton color="danger" @click="edit = !edit" size="sm"><CIcon name="cilXCircle"/></CButton>
      <CButton color="primary" @click="updateComment()"  size="sm"><CIcon name="cilSave"/></CButton></span>
    </CCardBody>
  </CCard>
</template>

<script>
import { mapState } from "vuex";
export default {
  name: "Comment",
  computed: mapState(["current_user", "settings"]),
  props: {
    comment: Object,
    deleteAction: Function,
  },
  data() {
    return {
      edit: false,
      editted_comment: ""
    };
  },
  methods: {
    updateComment() {
      let uuid = this.comment.uuid
      this.$store.dispatch('updateComment', {uuid, data: {message: this.editted_comment}}).then(resp => {
        this.comment = resp.data
        this.edit = false
      })
    }
  }
};
</script>