<template>
  <div>
    <CCard>
        <CCardBody>
          <CRow>
            <CCol>
              <h5>{{ rule.name }}</h5>
            </CCol>
            <CCol class="text-right">
              <TagList :tags="tags" v-if="tags.length > 0" />
            </CCol>
          </CRow>
          <CRow>
            <CCol>
              <vue-markdown>{{ rule.description }}</vue-markdown>
            </CCol>
          </CRow>
          <CRow v-if="event_rule_actions().length > 0" style="margin-bottom: 5px">
            <CCol>
              <i class="fas fa-bolt"></i>&nbsp;
              <li style="display: inline; margin-right: 2px;" v-for="action in event_rule_actions()">
                 <CBadge color="dark" class="tag tag-list" size="sm"> {{ action }} </CBadge>
              </li>
            </CCol>
          </CRow>
          <CRow style="margin-top: 10px">
            <CCol>
            <button class="collapse-toggle" @click="show_details = !show_details">Show Query</button>
            <CCollapse :show.sync="show_details" style="margin-top: 10px">
            <prism-editor
              rows="10"
              class="my-editor"
              v-model="rule.query"
              :highlight="highlighter"
              line-numbers
            ></prism-editor>
            </CCollapse>
            </CCol>
          </CRow>
        </CCardBody>
      
    </CCard>
  </div>
</template>
<style scoped>

.action-list-item {
  display: inline-block;
  margin-right: 10px;
  margin-bottom: 10px;
  padding: 5px 10px;
  border-radius: 5px;
  background-color: #eee;
}

.collapse-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

/* Show a chevron up or down depending on the state of the collapse */
.collapse-toggle::after {
  content: "\f078";
  font-family: "Font Awesome 5 Free";
  font-weight: 900;
  font-size: 12px;
  margin-left: 5px;
  transition: transform 0.2s ease-in-out;
}

/* Hide the focus ring on the button */
.collapse-toggle:focus {
  outline: none;
}

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
      let fields_to_return = ["expire","global_rule","run_retroactively"];
      let tags = [];
      for (let key in this.rule) {
        if (fields_to_return.includes(key) && this.rule[key] == true) {
          /* Replace the _ with a space and uppercase the first letter of each word */
          key = key.replace(/_/g, " ");
          key = key.replace(/\w\S*/g, function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
          });
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
    event_rule_actions() {
      let actions = [];
      if (this.rule.dismiss) {
        actions.push("Dismisses");
      }
      if (this.rule.add_tags) {
        actions.push("Tags Event");
      }
      if (this.rule.create_new_case) {
        actions.push("Creates New Case");
      }
      if (this.rule.merge_into_case) {
        actions.push("Merges Into Case");
      }
      if (this.rule.run_retroactively) {
        actions.push("Runs Retroactively");
      }
      if (this.rule.expire) {
        actions.push("Expires");
      }

      return actions;
    }
  },
};
</script>
