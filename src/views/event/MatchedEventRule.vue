<template>
  <div>
    <CCard>
      <CCardHeader @click="show_details = !show_details" style="cursor: pointer"
        ><CIcon name="cilChevronTop" v-if="!show_details" /><CIcon
          name="cilChevronBottom"
          v-else
        />&nbsp;<b>{{ rule.name }}</b><br></CCardHeader
      >
      <CCollapse :show.sync="show_details">
        <CCardBody>
          <CRow>
            <CCol>
              <vue-markdown>{{ rule.description }}</vue-markdown>
            </CCol>
          </CRow>
          <label>Rule Query</label>
          <prism-editor
            rows="10"
            class="my-editor"
            v-model="rule.query"
            :highlight="highlighter"
            line-numbers
          ></prism-editor>
          <CRow>
            <CCol>
              <br><b>Actions</b>
              <vue-markdown>{{ rule }}</vue-markdown>
            </CCol>
          </CRow>
        </CCardBody>
      </CCollapse>
    </CCard>
  </div>
</template>
<style scoped>
.my-editor {
  /* we dont use `language-` classes anymore so thats why we need to add background and text color manually */
  /*background: #fdfdfd;*/
  background: #0e0e0e;
  color: #ccc !important;
  border: 1px solid rgb(216, 219, 224);
  border-radius: 0.25rem;
  box-shadow: inset 0 1px 1px rgb(0 0 21 / 8%);

  /* you must provide font-family font-size line-height. Example: */
  font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  padding: 5px;
  max-height: 300px;
  overflow-y: scroll;
}

/* optional class for removing the outline */
.prism-editor__textarea:focus {
  outline: none;
}
</style>

<script>
import TagList from "../components/TagList.vue";
import { PrismEditor } from "vue-prism-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import "vue-prism-editor/dist/prismeditor.min.css"; // import the styles somewhere
import "prismjs/components/prism-python";
import "../../assets/js/prism-rql";
import "../../assets/css/prism-reflex.css"; // import syntax highlighting styles

export default {
  name: "MatchedEventRule",
  components: {
    TagList,
    PrismEditor,
  },
  props: {
    rule: Object,
  },
  computed: {
    tags() {
      let fields_to_return = ["expire"];
      let tags = [];
      for (let key in this.rule) {
        if (fields_to_return.includes(key)) {
          tags.push(key);
        }
      }
      return tags;
    },
  },
  data() {
    return {
      show_details: false,
    };
  },
  methods: {
    toggleDetails() {
      this.show_details = !this.show_details;
    },

    highlighter(code) {
      return highlight(code, languages.rql);
    },
  },
};
</script>
