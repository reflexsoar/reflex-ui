<template>
  <div>
    <link
      rel="stylesheet"
      href="https://unpkg.com/vue-multiselect@2.1.0/dist/vue-multiselect.min.css"
    /><CRow
      ><CCol xs="12" lg="12">
        <h2>
          Event Rules<button
            type="button"
            class="kb"
            onclick="window.open('https://docs.reflexsoar.com/en/latest/event-rules/')"
          >
            <CIcon name="cil-book" size="lg" />
          </button>
        </h2>
        <br />
        <CAlert :show.sync="alert.show" :color="alert.type" closeButton>
          {{ alert.message }}
        </CAlert>
        <CCard>
          <CCardHeader style="border-bottom: 0px">
            <CRow>
              <CCol>
                <CButton color="primary" @click="createEventRule()"
                  >New Event Rule</CButton
                >
              </CCol>
              <CCol class="text-right">
                <CButtonGroup>
                  <CButton disabled color="secondary"
                    ><CIcon name="cilCloudDownload" size="sm"></CIcon>&nbsp; Export
                    Rules</CButton
                  >
                  <CButton disabled color="secondary"
                    ><CIcon name="cilCloudUpload" size="sm"></CIcon>&nbsp; Import
                    Rules</CButton
                  >
                </CButtonGroup>
              </CCol>
            </CRow>
          </CCardHeader>
          <CCardBody>
            <CDataTable
              :items="computed_event_rules"
              :fields="fields"
              :loading="loading"
              :items-per-page="10"
              items-per-page-select
              pagination
              hover
              column-filter
              :sorter="{ external: false, resetable: true }"
            >
              <template #organization-filter="{ item }">
                <RMultiCheck
                  :items="organizations_pick_list"
                  @checked="set_picker_filters($event, 'organization')"
                  size="sm"
                ></RMultiCheck>
              </template>
              <template #created_by-filter="{ item }">
                <RMultiCheck
                  :items="event_rule_users"
                  @checked="set_picker_filters($event, 'created_by')"
                  size="sm"
                ></RMultiCheck>
              </template>
              <template #name="{ item }">
                <td>
                  <b>{{ item.name }}</b
                  ><br />{{ item.description }}
                </td>
              </template>
              <template #organization="{ item }">
                <td>
                  <OrganizationBadge :uuid="item.organization" />
                </td>
              </template>

              <template #last_matched_date="{ item }">
                <td v-if="item.last_matched_date">
                  {{ item.last_matched_date | moment("from", "now") }}
                </td>
                <td v-else>Never</td>
              </template>
              <template #hits="{ item }">
                <td>
                  {{ item.hits.toLocaleString("en-US") }}
                </td>
              </template>
              <template #manage="{ item }">
                <td class="text-right">
                  <CButton
                    aria-label="Export Rule"
                    disabled
                    @click="downloadRuleAsJSON(item.uuid)"
                    size="sm"
                    color="secondary"
                    v-c-tooltip="{
                      content: 'Export Rule - COMING SOON',
                      placement: 'left',
                    }"
                    ><CIcon name="cilCloudDownload" /></CButton
                  >&nbsp;
                  <CButton
                    aria-label="Clone Rule"
                    size="sm"
                    color="secondary"
                    @click="cloneRule(item.uuid)"
                    ><CIcon name="cilCopy" /></CButton
                  >&nbsp;
                  <CButton
                    aria-label="Edit Rule"
                    size="sm"
                    color="info"
                    @click="editRule(item.uuid)"
                    v-c-tooltip="{ content: 'Edit Rule', placement: 'left' }"
                    ><CIcon name="cilPencil" /></CButton
                  >&nbsp;
                  <CButton
                    aria-label="Disable Rule"
                    v-if="item.active"
                    size="sm"
                    color="warning"
                    @click="disableRule(item.uuid)"
                    v-c-tooltip="{ content: 'Disable Rule', placement: 'left' }"
                    ><CIcon name="cilBan"
                  /></CButton>
                  <CButton
                    aria-label="Enable Rule"
                    v-else
                    size="sm"
                    color="success"
                    @click="enableRule(item.uuid)"
                    v-c-tooltip="{ content: 'Enable Rule', placement: 'left' }"
                    ><CIcon name="cilCheck" /></CButton
                  >&nbsp;
                  <CButton
                    aria-label="Delete Rule"
                    v-if="!item.active"
                    color="danger"
                    @click="
                      delete_modal = true;
                      target_event_rule_uuid = item.uuid;
                    "
                    size="sm"
                    v-c-tooltip="{ content: 'Delete Rule', placement: 'left' }"
                    ><CIcon name="cilTrash"
                  /></CButton>
                </td>
              </template>
              <template #created_by="{ item }">
                <td>
                  {{ item.created_by ? item.created_by.username : "Unknown" }}
                </td>
              </template>
              <template #updated_by="{ item }">
                <td>
                  {{ item.updated_by ? item.updated_by.username : "Unknown" }}
                </td>
              </template>
              <template #priority="{ item }">
                <td>
                  <CBadge style="font-size: 90%; font-weight: 500" color="info">{{
                    item.priority
                  }}</CBadge>
                </td>
              </template>
              <template #properties="{ item }">
                <td>
                  <span v-if="item.global_rule"
                    ><CBadge style="font-size: 90%; font-weight: 500" color="info"
                      >Global Rule</CBadge
                    >&nbsp;</span
                  >
                  <span v-if="item.run_retroactively"
                    ><CBadge style="font-size: 90%; font-weight: 500" color="info"
                      >Retroactive</CBadge
                    >&nbsp;</span
                  >
                  <span v-if="item.merge_into_case"
                    ><CBadge style="font-size: 90%; font-weight: 500" color="info"
                      >Merge Into Case</CBadge
                    >&nbsp;</span
                  >
                  <span v-if="item.create_new_case"
                    ><CBadge style="font-size: 90%; font-weight: 500" color="info"
                      >Create New Case</CBadge
                    >&nbsp;</span
                  >
                  <span v-if="item.dismiss"
                    ><CBadge style="font-size: 90%; font-weight: 500" color="info"
                      >Dismiss Event</CBadge
                    >&nbsp;</span
                  >
                  <span v-if="item.expire"
                    ><CBadge style="font-size: 90%; font-weight: 500" color="info"
                      >Rule Expires</CBadge
                    >&nbsp;</span
                  >
                  <span v-if="item.notification_channels"
                    ><CBadge style="font-size: 90%; font-weight: 500" color="info"
                      >Notifies</CBadge
                    >&nbsp;</span
                  >
                </td>
              </template>
            </CDataTable>
          </CCardBody>
          <CRow>
            <!--<CCol lg="12" sm="12">
          <CCardBody v-if="pagination.pages > 0">
            <CPagination :activePage.sync="current_page" :pages="pagination.pages"/>
          </CCardBody>
        </CCol>-->
          </CRow>
        </CCard>
      </CCol></CRow
    >
    <CreateEventRuleModal
      :from_card="false"
      :show.sync="create_event_rule_modal"
      :event_rule="rule"
      :mode="modal_mode"
    />
    <CModal
      title="Delete Event Rule"
      color="danger"
      :centered="true"
      size="lg"
      :show.sync="delete_modal"
    >
      <div>
        <p>Deleting an event is a permanent action, are you sure you want to continue?</p>
      </div>
      <template #footer>
        <CButton @click="delete_modal = !delete_modal" color="secondary">Dismiss</CButton>
        <CButton
          @click="deleteRule(target_event_rule_uuid)"
          color="danger"
          v-bind:disabled.sync="dismiss_submitted"
          ><CSpinner color="success" size="sm" v-if="dismiss_submitted" /><span v-else
            >Delete</span
          ></CButton
        >
      </template>
    </CModal>
    <CModal
      title="Rule Testing Results"
      :centered="true"
      size="xl"
      :show.sync="show_test_results"
    >
      <div style="overflow-y: scroll; max-height: 400px">
        <!--<vue-json-pretty :showLength="true" selectableType="multiple" :path="'res'" :data="test_results"></vue-json-pretty>-->
        {{ test_results }}
      </div>
    </CModal>
    <CModal
      title="Export Rule"
      :centered="true"
      size="lg"
      :show.sync="showRuleDownloadModal"
    >
      <pre style="max-height: 400px; overflow-x: scroll">{{ rule_json }}</pre>
    </CModal>
    <CModal
      title="Export All Rules"
      :centered="true"
      size="lg"
      :show.sync="downloadAllRulesModal"
    >
      TEST
    </CModal>
  </div>
</template>

<style>
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

  overflow: scroll;
  overflow-x: hidden;

  max-height: 200px;
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
import "../assets/js/prism-rql";
import "../assets/css/prism-reflex.css"; // import syntax highlighting styles
import VueJsonPretty from "vue-json-pretty";
import "vue-json-pretty/lib/styles.css";
import CreateEventRuleModal from "./CreateEventRuleModal";
import OrganizationBadge from "./OrganizationBadge";
import RMultiCheck from "./components/MultiCheck";

export default {
  components: {
    PrismEditor,
    VueJsonPretty,
    CreateEventRuleModal,
    OrganizationBadge,
    RMultiCheck,
  },
  name: "EventRuleManagement",
  data() {
    return {
      create_event_rule_modal: false,
      step: 1,
      rules: [],
      rule: {},
      fields: [
        "name",
        "priority",
        "properties",
        "hits",
        "last_matched_date",
        "created_by",
        "updated_by",
        { key: "manage", label: "", filter: false },
      ],
      modal_mode: "create",
      show_test_results: false,
      global_rule: false,
      show_modal: false,
      modal_title: "",
      test_results: [],
      test_result: "",
      test_running: false,
      test_complete: false,
      test_failed: true,
      final_create_step: 5,
      test_result_color: "success",
      name: "",
      query: "",
      description: "",
      expire: false,
      expire_days: 1,
      merge_into_case: false,
      dismiss_event: false,
      dismiss_comment: "",
      close_reason: "",
      close_reasons: [],
      target_case: "",
      show_testing_pane: false,
      show_actions: false,
      run_retroactively: true,
      range: {
        start: new Date().setDate(new Date().getDate() - 7),
        end: new Date(),
      },
      masks: {
        input: "YYYY-MM-DD h:mm A",
      },
      event_count: 1000, // How many events to test a rule against
      return_events: false,
      backdrop_close: false,
      cases: [],
      page: 1,
      page_size: 10,
      pagination: {},
      current_page: 1,
      delete_modal: false,
      dismiss_submitted: false,
      target_event_rule_uuid: "",
      organization: "",
      organizations: [],
      tag_list: [],
      tag_event: false,
      severities: [
        {
          label: "Low",
          value: 0,
        },
        {
          label: "Medium",
          value: 1,
        },
        {
          label: "High",
          value: 2,
        },
        {
          label: "Critical",
          value: 3,
        },
      ],
      target_severity: 0,
      update_severity: false,
      selected_tags: [],
      showRuleDownloadModal: false,
      downloadAllRulesModal: false,
      rule_json: {},
      sort_by: "created_at",
      sort_direction: "asc",
      picker_filters: {},
    };
  },
  watch: {
    current_page: function () {
      this.loadRules();
    },
    show_modal(val) {
      if (val === true) {
        this.loadCloseReasons();
        this.loadTags();

        this.findCase("*");
        if (this.modal_mode === "create") {
          this.modal_title = "Create Event";
        } else if (this.modal_mode === "edit") {
          this.modal_title = "Edit | " + this.rule.name;
        } else if (this.modal_mode === "view") {
          this.modal_title = "View | " + this.rule.name;
        }
      } else {
        this.modal_mode = "create";
        this.reset();
      }
    },
    merge_into_case(val) {
      if (!val) {
        this.target_case = "";
      }
    },
    dismiss_event(val) {
      if (!val) {
        this.dismiss_comment = "";
        this.close_reason = "";
      }
    },
  },
  methods: {
    sort(event) {
      this.sort_direction = event.asc ? "asc" : "desc";
      this.sort_by = event.column ? event.column : "created_at";
      this.loadRules();
    },
    downloadAllRules() {},
    downloadRuleAsJSON(uuid) {
      this.rule_json = this.rules.find((item) => item.uuid === uuid);
      this.showRuleDownloadModal = true;
    },
    mapOrgToName(uuid) {
      let org = this.$store.getters.organizations.filter((o) => o.uuid === uuid);
      if (org.length > 0) {
        return org[0].name;
      } else {
        return "Unknown";
      }
    },
    findCase(query) {
      let fields = "uuid,title,id,event_count,owner,severity";
      this.$store.dispatch("getCasesByTitle", { title: query, fields }).then((resp) => {
        this.cases = this.$store.getters.cases;
      });
    },
    nextStep() {
      this.test_complete = false;
      this.test_failed = true;
      this.step += 1;
    },
    previousStep() {
      this.step -= 1;
    },
    reset() {
      this.name = "";
      this.rule = {};
      this.query = "";
      this.description = "";
      this.expire = true;
      this.expire_days = 1;
      this.observables = [];
      this.merge_into_case = false;
      this.dismiss_event = false;
      this.target_case = [];
      this.step = 1;
      this.test_complete = false;
      this.test_failed = false;
      this.test_running = false;
      this.test_result = "";
      this.test_results = [];
    },
    dismiss() {
      this.reset();
      this.show_testing_pane = false;
      this.show_modal = false;
    },
    highlighter(code) {
      return highlight(code, languages.rql);
    },
    viewRule(uuid) {
      this.rule = Object.assign(
        {},
        this.event_rules.find((r) => r.uuid === uuid)
      );
      this.modal_mode = "view";
      this.show_modal = true;
      this.backdrop_close = true;
    },
    cloneRule(uuid) {
      let source_rule = this.event_rules.find((r) => r.uuid === uuid);
      this.rule = Object.assign({}, source_rule);
      this.rule.name = "[COPY] " + source_rule.name;
      this.rule.organization = "";
      this.rule.target_case_uuid = null;
      this.rule.dismiss_reason = "";
      this.rule.merge_into_case = false;
      this.rule.tags_to_add = [];
      this.modal_mode = "clone";
      this.create_event_rule_modal = true;
    },
    editRule(uuid) {
      this.rule = Object.assign(
        {},
        this.event_rules.find((r) => r.uuid === uuid)
      );
      this.modal_mode = "edit";
      this.create_event_rule_modal = true;
    },
    loadTags: function () {
      this.tag_list = Array();
      this.$store.dispatch("getTags").then((resp) => {
        for (let i in resp.data) {
          this.tag_list.push({ name: resp.data[i].name, uuid: resp.data[i].uuid });
        }
      });
    },
    getHits(uuid) {
      if (this.event_rule_stats["hits"][uuid] !== undefined) {
        return this.event_rule_stats["hits"][uuid];
      } else {
        return 0;
      }
    },
    getLastMatched(uuid) {
      if (this.event_rule_stats["last_hit"][uuid] !== undefined) {
        return this.event_rule_stats["last_hit"][uuid];
      } else {
        return null;
      }
    },
    loadRules() {
      let page = this.current_page;
      let page_size = this.page_size;
      this.$store.dispatch("getEventRuleStats", { rules: null, save: true }).then(() => {
        this.$store
          .dispatch("loadEventRules", {
            page,
            page_size,
            sort_by: this.sort_by,
            sort_direction: this.sort_direction,
          })
          .then((resp) => {
            this.pagination = resp.data.pagination;
            let rules = this.event_rules.map((r) => {
              return r.uuid;
            });
          });
      });
    },
    disableRule(uuid) {
      let data = {
        active: false,
      };
      this.$store.dispatch("updateEventRule", { uuid, data });
    },
    enableRule(uuid) {
      let data = {
        active: true,
      };
      this.$store.dispatch("updateEventRule", { uuid, data });
    },
    createEventRule() {
      this.rule = {
        expire_days: 1,
      };
      this.modal_mode = "create";
      this.create_event_rule_modal = true;
    },
    deleteRule(uuid) {
      this.dismiss_submitted = true;
      let data = {
        active: true,
      };
      this.$store.dispatch("deleteEventRule", { uuid, data }).then((resp) => {
        this.dismiss_submitted = false;
        this.delete_modal = false;
      });
      this.loadRules();
    },
    addTag(newTag) {
      const t = {
        name: newTag,
        uuid: "",
      };
      this.tag_list.push(t);
      this.selected_tags.push(t);
    },
    caseLabel({ uuid, title }) {
      if (uuid && title) {
        return `${title} (${uuid})`;
      }
    },
    caseFind(query) {
      let fields = "uuid,title,id,event_count,owner,severity";
      this.$store.dispatch("getCasesByTitle", { title: query, fields }).then((resp) => {
        this.cases = this.$store.getters.cases;
      });
    },
    loadCloseReasons() {
      let organization = this.organization;
      if (this.current_user.default_org) {
        this.$store.dispatch("getOrganizations", {}).then((resp) => {
          this.organizations = this.$store.getters.organizations.map((o) => {
            return { label: o.name, value: o.uuid };
          });
        });
      }

      this.$store
        .dispatch("getCloseReasons", { organization: organization })
        .then((resp) => {
          this.close_reasons = this.$store.getters.close_reasons.map((reason) => {
            return { label: reason.title, value: reason.uuid };
          });
        });
    },
    set_picker_filters(val, key) {
      if (!this.picker_filters.hasOwnProperty(key)) {
        this.$set(this.picker_filters, key, []);
      }
      if (val.length == 0) {
        this.$delete(this.picker_filters, key);
      } else {
        this.$set(this.picker_filters, key, val);
      }
    },
  },
  computed: {
    computed_event_rules: function () {
      return this.event_rules.map((item) => {
        return {
          ...item,
          hits: this.getHits(item.uuid),
          last_matched_date: this.getLastMatched(item.uuid),
        };
      });
    },
    organizations_pick_list() {
      return this.organizations.map((o) => {
        return { label: o.name, value: o.uuid };
      });
    },
    event_rule_users() {
      let users = [];
      this.computed_event_rules.forEach((rule) => {
        if (!users.includes({label: rule.created_by.username, value: rule.created_by.username})) {
          users.push({label: rule.created_by.username, value: rule.created_by.username});
        }
      });
      return users
    },
    ...mapState(["alert", "current_user", "loading", "event_rules", "event_rule_stats"]),
  },
  created() {
    this.loadRules();
    if (this.current_user.default_org) {
      if (!this.fields.includes("organization")) {
        this.fields.splice(1, 0, { key: "organization" });
      }
      this.$store.dispatch("getOrganizations", {});
    }
  },
};
</script>
