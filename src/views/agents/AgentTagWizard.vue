<template>
  <CModal :centered="false" size="lg" :show.sync="show" :close-on-backdrop="false">
    <link
      rel="stylesheet"
      href="https://unpkg.com/vue-multiselect/dist/vue-multiselect.min.css"
    />
    <template #header>
      <h5 class="modal-title" style="text-transform: capitalize">{{ mode }} Agent Tag</h5>
    </template>
    <CAlert :show.sync="error" color="danger">
      {{ error_message }}
    </CAlert>
    <CRow>
      <CCol>
        <CInput
          label="Namespace"
          v-model="namespace"
          placeholder="Enter a name for the tag"
        />
      </CCol>
      <CCol>
        <CInput label="Value" v-model="value" placeholder="Enter a name for the tag" />
      </CCol>
      <CCol col="2">
        <CInput
          label="Color"
          type="color"
          v-model="color"
          placeholder="Enter a color for the tag"
        />
      </CCol>
    </CRow>
    <CRow>
      <CCol>
        <CTextarea
          label="Description"
          v-model="description"
          placeholder="Enter a description for the tag"
        />
      </CCol>
    </CRow>
    <CRow>
      <CCol>
        <div>
        <label>Tag Query</label>
        <prism-editor
          class="my-editor"
          v-model="query"
          :highlight="highlighter"
          line-numbers
          aria-label="Tag RQL Query"
        ></prism-editor><br>
        </div>
      </CCol>
    </CRow>
    <CRow>
      <CCol>
        <h5>Preview</h5>
        <AgentTag :namespace="namespace" :value="value" :color="color" />
      </CCol>
      <CCol>
        <h5>Testing</h5>
        <CButton @click="testTag()" size="sm" color="primary">Test Query</CButton>

          <span v-if="tested">&nbsp;{{ test_hit_count }} Agents would match.</span>        
      </CCol>
    </CRow>
    <template #footer>
      <CRow>
        <CCol class="text-right">
          <CButton color="secondary" @click="dismiss">Cancel</CButton>&nbsp;
          <CButton v-if="mode == 'create'" color="primary" @click="createTag"
            ><span v-if="submitted"><CSpinner size="sm" />&nbsp;</span>Create</CButton
          >
          <CButton v-if="mode == 'edit'" color="primary" @click="updateTag"
            ><span v-if="submitted"><CSpinner size="sm" />&nbsp;</span>Update</CButton
          >
        </CCol>
      </CRow>
    </template>
  </CModal>
</template>

<style>
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
  font-size: 12px;
  line-height: 1.5;
  padding: 5px;
  max-height: 150px;
  overflow-y: auto;
}

.prism-editor__container{

  min-height: 200px;

}

/* optional class for removing the outline */
.prism-editor__textarea:focus {
  outline: none;
}
</style>

<script>
import { mapState } from "vuex";
import { PrismEditor } from "vue-prism-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import "vue-prism-editor/dist/prismeditor.min.css"; // import the styles somewhere
import "prismjs/components/prism-python";
import "../../assets/js/prism-rql";
import "../../assets/css/prism-reflex.css"; // import syntax highlighting styles

import AgentTag from "./AgentTag.vue";

export default {
  name: "AgentTagWizard",
  components: {
    AgentTag,
    PrismEditor,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    mode: {
      type: String,
      default: "create",
    },
    tag: {
      type: Object,
      default: () => {
        return {
          namespace: null,
          value: null,
          description: null,
          query: null,
          organization: null,
          color: null,
        };
      },
    },
  },
  computed: mapState(["current_user", "organizations"]),
  data() {
    return {
      error: false,
      error_message: "",
      namespace: null,
      description: null,
      value: null,
      query: null,
      dynamic: true,
      organization: null,
      color: "#" + Math.floor(Math.random() * 16777215).toString(16),
      submitted: false,
      test_hit_count: 0,
      tested: false
    };
  },
  watch: {
    show: function () {
      this.$emit("update:show", this.show);
      if (this.show) {
        if (this.rule != {}) {
          let tag_data = JSON.parse(JSON.stringify(this.tag));
          this.uuid = tag_data.uuid;
          this.name = tag_data.name;
          this.organization = tag_data.organization;
          this.description = tag_data.description;
          this.namespace = tag_data.namespace;
          this.value = tag_data.value;
          this.query = tag_data.query;
          this.color = tag_data.color;
        }

        if (this.mode == "create") {
          this.reset();
        }
      }
    },
  },
  methods: {
    highlighter(code) {
      if (languages.rql == undefined) {
        return highlight(code, languages.python);
      }
      return highlight(code, languages.rql);
    },
    generateRandomHexColor() {
      this.color = "#" + Math.floor(Math.random() * 16777215).toString(16);
    },
    getFontColor(color) {
      let color_info = Color(color);
      console.log(color_info.isDark());
      /* The font should be white if the background is dark */
      if (color_info.isDark()) {
        return "#fff";
      } else {
        return "#000";
      }
    },
    reset() {
      this.error = false;
      this.error_message = "";
      this.namespace = null;
      this.description = null;
      this.value = null;
      this.query = null;
      this.color = "#" + Math.floor(Math.random() * 16777215).toString(16);
      this.submitted = false;
      this.tested = false;
      this.test_hit_count = 0;
    },
    createTag() {
      this.error = false;
      this.error_message = "";
      this.submitted = true;
      let payload = {
        namespace: this.namespace,
        organization: this.organization,
        value: this.value,
        description: this.description,
        query: this.query,
        color: this.color,
      };
      this.$store
        .dispatch("createAgentTag", payload)
        .then(() => {
          this.submitted = false;
          this.closeModal();
        })
        .catch((error) => {
          this.error = true;
          this.error_message = error.response.data.message;
          this.submitted = false;
        });
    },
    testTag() {
      this.error = false;
      this.error_message = "";
      this.submitted = true;
      let payload = {
        query: this.query,
      }

      if (this.organization != "" || this.organization != undefined) {
        payload.organization = this.organization;
      }

      this.$store
        .dispatch("testAgentTag", payload)
        .then((resp) => {
          this.submitted = false;
          this.test_hit_count = resp.data.hits;
          this.tested = true;
        })
        .catch((error) => {
          this.error = true;
          this.error_message = error.response.data.message;
          this.submitted = false;
        });
    },
    updateTag() {
      this.error = false;
      this.error_message = "";

      let payload = {
        namespace: this.namespace,
        organization: this.organization,
        value: this.value,
        description: this.description,
        query: this.query,
        color: this.color,
      }
      
      this.$store
        .dispatch("updateAgentTag", { uuid: this.tag.uuid, data: payload })
        .then(() => {
          this.submitted = false;
          this.closeModal();
        })
        .catch((error) => {
          this.error = true;
          this.error_message = error.response.data.message;
          this.submitted = false;
        });
    },
    closeModal() {
      this.reset();
      this.$emit("update:show", false);
    },
    dismiss() {
      this.closeModal();
    },
  },
};
</script>
