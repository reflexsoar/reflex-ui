<template>
  <div>
    <link
      rel="stylesheet"
      href="https://unpkg.com/vue-multiselect@2.1.0/dist/vue-multiselect.min.css"
    />
    <CModal
      title="Create Event Rule"
      :centered="false"
      size="xl"
      :show.sync="modalStatus"
      :closeOnBackdrop="false"
    >
      <template #header>
        <h5 style="text-transform: capitalize">{{ mode }} Detection Rule</h5>
        <span class="text-right">
          <button
            type="button"
            aria-label="Close"
            class="close"
            @click="dismiss()"
          >
            ×
          </button>
          <button
            type="button"
            class="kb"
            aria-label="Documentation"
            onclick="window.open('https://docs.reflexsoar.com/en/latest/detections')"
          >
            <CIcon name="cil-book" size="lg" />
          </button>
        </span>
      </template>
      <div>
        <CRow>
          <CCol>
            <CAlert :show.sync="error" color="danger" closeButton>
              {{ error_message }}
            </CAlert>
          </CCol>
        </CRow>
        <CRow>
          <CCol>
            <CTabs
              :fade="false"
              variant="pills"
              :activeTab.sync="step"
              :vertical="{ navs: 'col-md-2', content: 'col-md-10' }"
            >
              <CTab title="1. Details">
                <h5>Rule Details</h5>
                <CSelect
                  label="Organization"
                  placeholder="Select an organization"
                  v-if="current_user.role.permissions.view_organizations"
                  :value.sync="organization"
                  :options="organizations"
                />
                <CInput
                  v-model="rule.name"
                  label="Name"
                  placeholder="Rule Name"
                />
                <CTextarea
                  v-model="rule.description"
                  label="Description"
                  placeholder="A friendly description of the rule"
                  :rows="5"
                />
                <label>Tags</label>
                <multiselect
                  v-model="rule.tags"
                  placeholder="Select tags to apply to this detection"
                  :taggable="true"
                  @tag="addTag"
                  tag-placeholder="Add new tag"
                  :options="tag_list"
                  :multiple="true"
                  :close-on-select="false"
                /><br />
              </CTab>
              <CTab title="2. Configuration">
                <h5>Rule Configuration</h5>
                <p>Something something dark side</p>
                <CSelect
                  label="Input"
                  :options="input_list"
                  description="The inputt this detection should use for connection and source data"
                  v-model="rule.source"
                />

                <CSelect
                  label="Rule Type"
                  v-model="rule.rule_type"
                  @change="updateRuleType"
                  :options="rule_types"
                />
                <CTextarea
                  label="Base Query"
                  placeholder="A base query"
                  description="A base query defines exactly what the detection should be looking for"
                  v-model="rule.query.query"
                />
                <div v-if="rule.rule_type == 0">Match Configuration</div>
                <div v-else-if="rule.rule_type == 1">Threshold</div>
                <div v-else-if="rule.rule_type == 2">Metric Change</div>
                <div v-else-if="rule.rule_type == 3">Field Mismatch</div>
                <CRow>
                  <CCol>
                    <CInput
                      label="Interval"
                      v-model="rule.interval"
                      description="How ofthen detection will run in minutes"
                    ></CInput>
                  </CCol>
                  <CCol>
                    <CInput
                      label="Lookbehind"
                      v-model="rule.lookbehind"
                      description="How far back the detection should look in minutes. By default the detection will look back to the last run time."
                    ></CInput>
                  </CCol>
                </CRow>
              </CTab>
              <CTab title="3. Exclusions">
                <h5>Exclusions</h5>
              </CTab>
              <CTab title="4. MITRE ATT&CK">
                <h5>MITRE ATT&CK</h5>
                <p>Something something dark side</p>
                <label>MITRE Tactics</label>
                <multiselect
                  v-model="rule.tactics"
                  placeholder="Select tags to apply to this detection"
                  @select="addTactic"
                  :options="mitre_tactics"
                  label="name"
                  track-by="external_id"
                  :multiple="true"
                  :close-on-select="false"
                ><template slot="singleLabel" slot-scope="props"
                    ><img
                      class="option__image"
                      :src="props.option.img"
                      alt="No Man’s Sky"
                    /><span class="option__desc"
                      ><span class="option__title">{{
                        props.option.title
                      }}</span></span
                    ></template
                  >
                  <template slot="option" slot-scope="props"
                    >
                    <div class="option__desc">
                      <span class="option__title">{{ props.option.external_id }}</span
                      > - <span class="option__small">{{
                        props.option.name
                      }}</span>
                    </div>
                  </template>
                </multiselect><br />
                <label>MITRE Techniques</label>
                <multiselect
                  v-model="rule.techniques"
                  placeholder="Select tags to apply to this detection"
                  @select="addTechnique"
                  :options="mitre_techniques"
                  label="name"
                  track-by="external_id"
                  :multiple="true"
                  :close-on-select="false"
                  :internal-search="false"
                  :searchable="true"
                  @search-change="findTechnique"
                >
                  <template slot="singleLabel" slot-scope="props"
                    ><img
                      class="option__image"
                      :src="props.option.img"
                      alt="No Man’s Sky"
                    /><span class="option__desc"
                      ><span class="option__title">{{
                        props.option.title
                      }}</span></span
                    ></template
                  >
                  <template slot="option" slot-scope="props"
                    >
                    <div class="option__desc">
                      <span class="option__title">{{ props.option.external_id }}</span
                      > - <span class="option__small">{{
                        props.option.name
                      }}</span>
                    </div>
                  </template>
                </multiselect>
              </CTab>
              <CTab title="5. Actions">
                <h5>Actions</h5>
                <p>
                  Actions run in coordination with a detection matching. Actions
                  can be individual integration steps or running entire
                  playbooks.
                </p>
              </CTab>
              <CTab title="6. Triage Guide">
                <h5>Triage Guide</h5>
                <p>
                  A triage guide helps analysts reviewing events generated from
                  this detection determine the legitimacy of the event. Being as
                  descriptive as possible will help alert consumers.
                </p>
                <CTextarea
                  v-model="rule.guide"
                  :rows="10"
                  label="Guide Details"
                  description="HINT: Use markdown to create a beautiful description."
                />
              </CTab>
              <CTab title="7. Review"> </CTab>
            </CTabs>
          </CCol>
        </CRow>
      </div>
      <template #footer>
        <CButton @click="dismiss()" color="secondary">Dismiss</CButton>
        <CButton v-if="step != 0" @click="previousStep()" color="info"
          >Previous</CButton
        >
        <CButton
          v-if="step != final_step"
          @click="nextStep()"
          :disabled="test_failed && step == 2"
          color="primary"
          >Next</CButton
        >
        <CButton
          v-if="step == final_step && (mode == 'create' || mode == 'clone')"
          @click="createDetectionRule()"
          color="primary"
          :disabled="submitted"
          ><span v-if="submitted"><CSpinner size="sm" />&nbsp;</span
          >Create</CButton
        >
        <CButton
          v-if="step == final_step && mode == 'edit'"
          @click="editDetectionRule()"
          color="primary"
          :disabled="submitted"
          ><span v-if="submitted"><CSpinner size="sm" />&nbsp;</span
          >Save</CButton
        >
      </template>
    </CModal>
  </div>
</template>

<style scoped>
/* required class */
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

.modal-body {
  padding-left: 0px;
}
</style>
<script>
import { vSelect } from "vue-select";
import { PrismEditor } from "vue-prism-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import "vue-prism-editor/dist/prismeditor.min.css"; // import the styles somewhere
import "prismjs/components/prism-python";
import "../assets/js/prism-rql";
import "../assets/css/prism-reflex.css"; // import syntax highlighting styles

import { mapState } from "vuex";

export default {
  components: {
    PrismEditor,
  },
  name: "DetectionRuleModal",
  props: {
    show: Boolean,
    rule: {
      type: Object,
      default: {
        tags: [],
        query: {
          query: "okay",
          language: "",
        },
        techniques: [],
        tactics: [],
        lookbehind: 5,
        interval: 5,
      },
    },
    mode: {
      type: String,
      default: "Create",
    },
  },
  computed: {
    formatted_tags: function () {
      return this.rule.tags.map((o) => {
        return { name: o, uuid: "" };
      });
    },
    ...mapState([
      "settings",
      "current_user",
      "input_list",
      "mitre_tactics",
      "mitre_techniques",
    ]),
  },
  data() {
    return {
      tabs: [
        { name: "Overview", icon: "cil-description" },
        { name: "Configuration", icon: "cil-gear" },
        { name: "Investigation Guide", icon: "cil-book" },
        { name: "Review", icon: null },
      ],
      rule_types: ["Match", "Threshold", "Metric Change", "Field Mismatch"],
      severities: [
        {
          label: "Low",
          value: 1,
        },
        {
          label: "Medium",
          value: 2,
        },
        {
          label: "High",
          value: 3,
        },
        {
          label: "Critical",
          value: 4,
        },
      ],
      techniques: [],
      tactics: [],
      error: false,
      error_message: "",
      submitted: false,
      step: 0,
      final_step: 6,
      range: {
        start: this.days_ago(7),
        end: this.today(),
      },
      masks: {
        input: "YYYY-MM-DD h:mm A",
      },
      organization: "",
      organizations: [],
      show_test_results: false,
      test_result_color: "success",
      test_results: "",
      test_complete: false,
      test_failed: false,
      active: true,
      modalStatus: this.show,
      tag_list: [],
    };
  },
  watch: {
    show: function () {
      this.error = false;
      this.error_message = "";
      if (this.mode == "Edit") {
        this.step = 0;
      }
      this.modalStatus = this.show;
    },
    modalStatus: function () {
      if (this.modalStatus) {
        this.$store.dispatch("getMitreTactics", {});
        this.$store.dispatch("getMitreTechniques", {});
        this.test_failed = true;
        this.loadData();
      }
      this.$emit("update:show", this.modalStatus);
      if (!this.modalStatus) {
        this.reset();
      }
    },
  },
  created() {
    //this.loadData()
    //this.$store.dispatch('getSettings')
    if (this.current_user.default_org) {
      this.$store.dispatch("getOrganizations", {}).then((resp) => {
        this.organizations = this.$store.getters.organizations.map((o) => {
          return { label: o.name, value: o.uuid };
        });
      });
    }
    this.$store.dispatch("getMitreTactics", {});
  },
  methods: {
    today() {
      let d = new Date();
      d.setHours(23, 59, 59, 0);
      return d;
    },
    days_ago(offset) {
      let d = new Date();
      d.setDate(d.getDate() - offset);
      d.setHours(0, 0, 0, 0);
      return d;
    },
    highlighter(code) {
      return highlight(code, languages.rql);
    },
    testDetectionRule() {},
    createDetectionRule() {
      this.submitted = true;
    },
    editDetectionRule() {},
    nextStep() {
      this.step += 1;
    },
    previousStep() {
      this.step -= 1;
    },
    loadMITRETactics() {},
    findTechnique(external_id) {
      /* Return a list of techniques from the API based on the tactics that are currently selected */
      this.$store.dispatch('getMitreTechniques', {external_id__like: external_id, phase_names: this.rule.tactics.map(t => { return t.shortname })})
    },
    loadData() {
      this.$store.dispatch("getCases", {}).then((resp) => {
        this.cases = this.$store.getters.cases;
      });
    },
    reset() {},
    dismiss() {
      this.reset();
      this.modalStatus = false;
    },
    addTag(newTag) {
      const t = {
        name: newTag,
        uuid: "",
      };
      this.rule.tags.push(t.name);
      this.tag_list.push(t.name);
    },
    addTactic(tactic) {
      this.$store.dispatch("getMitreTechniques", { phase_names: this.rule.tactics.map(t => { return t.shortname }) });
    },
    addTechnique(technique) {

    },
    loadTags: function () {
      this.tag_list = Array();
      this.$store.dispatch("getTags").then((resp) => {
        for (let i in resp.data) {
          this.tag_list.push({
            name: resp.data[i].name,
            uuid: resp.data[i].uuid,
          });
        }
      });
    },
    updateRuleType(event) {
      this.rule.rule_type = this.rule_types.indexOf(event.target.value);
    },
    searchInputs(name) {
      this.$store.dispatch("getInputList", {
        organization: this.rule.organization,
        name: name,
      });
    },
  },
};
</script>