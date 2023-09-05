<template>
  <div>
    <CRow>
      <CCol>
        <!--<editor
          ref="commentEditor"
          :initialValue="comment_text"
          @change="updateCommentText()"
          height="200px"
          initialEditType="markdown"
          previewStyle="tab"
        /><br />
        <CButton
          color="primary"
          @click="createEventComment()"
          v-bind:disabled="comment_text.length == 0"
          >Comment</CButton
        >-->
        <CInput v-model="comment_text" placeholder="Enter your comment here">
          <template #append>
            <CButton
              color="primary"
              @click="createComment()"
              v-bind:disabled="comment_text.length == 0"
              >Comment</CButton
            >
          </template>
        </CInput>   
      </CCol>
    </CRow>
  </div>
</template>

<script>
import "@toast-ui/editor/dist/toastui-editor.css";

import { Editor } from "@toast-ui/vue-editor";

export default {
  name: "CommentBox",
  components: {
    Editor,
  },
  props: {
    comment: {
      type: Object,
      default: () => {},
    },
    settings: Object,
    event_uuid: String,
    comment_type: {
      type: String,
      default: "event",
    },
  },
  data() {
    return {
      comment_text: "",
    };
  },
  methods: {
    updateCommentText() {
      this.comment_text = this.$refs.commentEditor.invoke("getMarkdown");
    },
    createComment() {
      if (this.comment_type == "event") {
        this.createEventComment();
      } else {
        this.createCaseComment();
      }
    },
    createEventComment() {
      let payload = {
        comment: this.comment_text,
      };
      console.log(this.comment);
      this.$store
        .dispatch("createEventComment", {
          uuid: this.event_uuid,
          data: payload,
        })
        .then((response) => {
          this.$refs.commentEditor.invoke("setMarkdown", "");
          this.comment_text = "";
        })
        .catch((error) => {
          this.error = true;
          this.error_message = error.response.data.message;
        });
    },
  },
};
</script>
