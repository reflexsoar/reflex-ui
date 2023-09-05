<template>
  <div>
    <CRow>
      <CCol>
            <CRow>
              <CCol>
                <span v-if="!comment.is_closure_comment"
                  ><b>{{ comment.created_by }}</b
                  ><span v-if="comment.other_organization_name"
                    >&nbsp;<CBadge class="tag" size="xs" color="secondary">{{
                      comment.other_organization_name
                    }}</CBadge></span
                  >
                  commented {{ comment.created_at | moment("from", "now") }}.
                  <span v-if="comment.edited"><i>edited</i></span></span
                >
                <span v-else
                  ><b>{{ comment.created_by }}</b
                  ><span v-if="comment.other_organization_name"
                    >&nbsp;<CBadge class="tag" size="xs" color="secondary">{{
                      comment.other_organization_name
                    }}</CBadge></span
                  >
                  closed the {{ item_type }} with the following comment
                  {{ comment.created_at | moment("from", "now") }}.</span
                >
              </CCol>
            </CRow>
            <CRow>
              <CCol>
                <CCard style="background-color: #f9f9f9;">
                  <CCardBody style="padding-top: 5px; padding-bottom: 10px;">
                  <viewer :initialValue="comment.comment" />
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>          
      </CCol>
    </CRow>
  </div>
</template>

<script>
import '@toast-ui/editor/dist/toastui-editor-viewer.css';

import { Viewer } from '@toast-ui/vue-editor';

export default {
  name: "Comment",
    components: {
        Viewer,
    },
  props: {
    comment: Object,
    settings: Object,
    item_type: {
      type: String,
      default: "event",
    },
  },
};
</script>
