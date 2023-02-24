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
        <h5 style="text-transform: capitalize">{{ mode }} Event Rule</h5>
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
            onclick="window.open('https://docs.reflexsoar.com/en/latest/rql')"
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
            <CAlert :show="disable_reason" color="danger" closeButton>
              <b>Rule Disabled by System: </b>{{ disable_reason }}
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
              <CTab title="1. Rule Details">
                <CAlert :show="mode == 'clone'" color="warning">
                  <b>WARNING: </b>This Event Rule has been cloned from another.
                  Please verify all fields before submitting. The following
                  fields are not copied:<br />
                  <ul style="margin-bottom: 0px">
                    <li>Organization</li>
                    <li>Target Case</li>
                    <li>Dismiss Reason</li>
                  </ul>
                </CAlert>
                <h4>Rule Details</h4>
                <p>
                  An Event rule allows you to automatically handle Events over a
                  period of time based on Event criteria.
                </p>
                <p v-if="from_card">
                  This rule will apply to <b>{{ events.length }}</b> Events and
                  any future events matching the title of this event and
                  observables selected in this wizard.
                </p>
                <CSelect
                  label="Organization"
                  placeholder="Select an organization"
                  v-if="
                    current_user.role.permissions.view_organizations &&
                    !from_card
                  "
                  :value.sync="organization"
                  :options="organizations"
                  @change="reloadMeta()"
                />
                <CInput
                  label="Rule Name"
                  placeholder="Enter a friendly name for this rule"
                  :value.sync="name"
                  required
                ></CInput>
                <CTextarea
                  rows="5"
                  label="Rule description"
                  v-model.lazy="description"
                  required
                  placeholder="Give a brief description of what this rule will do and why."
                ></CTextarea>
                <CRow>
                  <CCol col="2">
                    <label>Rule Active?</label><br />
                    <CSwitch
                      :checked.sync="active"
                      label-on="Yes"
                      label-off="no"
                      color="success"
                      aria-label="Rule Active"
                    /><br />
                  </CCol>
                  <CCol col="5">
                    <label>Run rule retroactively after creation?</label><br />
                    <CSwitch
                      :checked.sync="run_retroactively"
                      label-on="Yes"
                      label-off="no"
                      color="success"
                      aria-label="Run Rule Retroactively"
                    /><br />
                    <small class="text-muted"
                      >When the rule is saved, Reflex will retroactively attempt
                      to match this rule to any event that is currently in a New
                      state</small>
                  </CCol>
                  <CCol col="5" v-if="current_user.default_org && !from_card">
                    <label>Global Rule</label><br />
                    <CSwitch
                      :checked.sync="global_rule"
                      label-on="Yes"
                      label-off="No"
                      color="success"
                    /><br />
                    <small class="text-muted"
                      >Global Rules exist in the Default Tenant and will apply
                      to every tenant in the Reflex system. Matches on Global
                      rules do not stop further rule processing.</small
                    >
                  </CCol>
                </CRow>
                <CRow>
                  <CCol col="3">
                    <CInput v-model="priority" label="Priority" description="Set the rule priority to determine which rules to run first.  Lower priorities run first  (Min: 1, Max: 65535)"></CInput>
                  </CCol>
                </CRow>
              </CTab>
              <CTab title="2. Expiration">
                <h4>Expiration</h4>
                <p>
                  Setting an expiration will cause this rule to disable itself
                  at a future date and all new events will not be acted on by
                  this rule.
                </p>

                <CRow>
                  <CCol col="1">
                    <label>Expire</label><br />
                    <CSwitch
                      color="success"
                      label-on="Yes"
                      label-off="No"
                      label="Dismiss Event"
                      :checked.sync="expire"
                      aria-label="Expire Rule"
                    ></CSwitch>
                  </CCol>
                  <CCol>
                    <CInput
                      label="Expiration period (days)"
                      v-bind:disabled="!expire"
                      placeholder="Enter a period in number of days"
                      v-model="expire_days"
                    ></CInput>
                  </CCol>
                </CRow>
              </CTab>
              <CTab title="3. Event Query">
                <CAlert
                  :show.sync="test_complete"
                  :color="test_result_color"
                  closeButton
                >
                  {{ test_result }}
                </CAlert>
                <h4>Event Query</h4>
                <p>
                  Supply an RQL query to match events to this rule based on a
                  certain criteria. Click
                  <a
                    href="https://docs.reflexsoar.com/en/latest/rql/"
                    target="_new"
                    >here</a
                  >
                  for a syntax reference.
                </p>
                <prism-editor
                  rows="10"
                  @keydown="test_failed = true"
                  class="my-editor"
                  v-model="query"
                  :highlight="highlighter"
                  line-numbers
                  aria-label="Reflex Query"
                ></prism-editor
                ><br />

                <CRow>
                  <CCol lg="4">
                    <CInput
                      description="Reflex will fetch the last N events and compare this rule to them"
                      label="Number of test events"
                      v-model="event_count"
                    >
                      <template #append>
                        <CButton
                          color="primary"
                          v-bind:disabled="test_running"
                          @click="testRule()"
                          ><span v-if="!test_running">Test Rule</span
                          ><span v-else
                            ><CSpinner size="sm" />&nbsp;Testing...</span
                          ></CButton
                        >
                      </template>
                    </CInput>
                  </CCol>
                  <CCol lg="8">
                    <v-date-picker
                      v-model="range"
                      mode="dateTime"
                      :masks="masks"
                      is-range
                    >
                      <template v-slot="{ inputValue, inputEvents }">
                        <CRow>
                          <CCol>
                            <CInput
                              description="Start of search period"
                              label="Start Time"
                              :value="inputValue.start"
                              v-on="inputEvents.start"
                            >
                              <template #prepend>
                                <CButton disabled color="secondary" size="sm"
                                  ><CIcon name="cil-calendar"
                                /></CButton>
                              </template>
                            </CInput>
                          </CCol>
                          <CCol>
                            <CInput
                              label="End Time"
                              :value="inputValue.end"
                              v-on="inputEvents.end"
                            >
                              <template #prepend>
                                <CButton disabled color="secondary" size="sm"
                                  ><CIcon name="cil-calendar"
                                /></CButton>
                              </template>
                            </CInput>
                          </CCol>
                        </CRow>
                      </template>
                    </v-date-picker>
                  </CCol>
                  <CCol col="6">
                    <label>Include Results</label><br />
                    <CSwitch
                      color="success"
                      label-on="Yes"
                      label-off="No"
                      v-bind:checked.sync="return_events"
                    ></CSwitch
                    >&nbsp;<CButton
                      style="margin-top: -20px"
                      size="sm"
                      color="success"
                      v-if="return_events && test_complete && !test_failed"
                      @click="show_test_results = !show_test_results"
                      >View Results</CButton
                    ><br />
                    <small class="text-muted"
                      >Selecting this option will present all matched events in
                      a new window.</small
                    >
                  </CCol>
                  <CCol class="text-right" v-if="from_card">
                    <label>&nbsp;</label><br />
                    <CButton color="secondary" size="sm" @click="showDrawer()"
                      >View Source Event</CButton
                    >
                  </CCol>
                </CRow>
              </CTab>
              <CTab title="4. Event Actions" :disabled="test_failed && from_card">
                <h4>Event Actions</h4>
                <label>Dismiss Event</label>
                <CRow>
                  <CCol col="1">
                    <CSwitch
                      color="success"
                      label-on="Yes"
                      label-off="No"
                      label="Dismiss Event"
                      :checked.sync="dismiss_event"
                      style="padding-top: 5px"
                    ></CSwitch>
                  </CCol>
                  <CCol col="11">
                    <CSelect
                      v-bind:disabled="!dismiss_event"
                      :options="close_reasons"
                      :value.sync="close_reason"
                      placeholder="Select a reason for dismissing the event..."
                    />
                    <CTextarea
                      label="Dismiss Comment"
                      rows="5"
                      placeholder="Enter a comment as to why this Event is being dismissed."
                      v-model="dismiss_comment"
                      v-bind:disabled="!dismiss_event"
                    ></CTextarea>
                  </CCol>
                </CRow>
                <br />
                <label>Add Tags</label>
                <CRow>
                  <CCol col="1">
                    <CSwitch
                      color="success"
                      label-on="Yes"
                      label-off="No"
                      label="Tag Event"
                      :checked.sync="tag_event"
                      style="padding-top: 5px"
                    ></CSwitch>
                  </CCol>
                  <CCol>
                    <multiselect
                      v-bind:disabled="!tag_event"
                      v-model="selected_tags"
                      placeholder="Select tags to apply to this input"
                      :taggable="true"
                      tag-placeholder="Add new tag"
                      track-by="name"
                      label="name"
                      :options="tag_list"
                      :multiple="true"
                      @tag="addTag"
                      :close-on-select="false"
                    >
                    </multiselect>
                  </CCol>
                </CRow>
                <br />
                <label>Update Severity</label>
                <CRow>
                  <CCol col="1">
                    <CSwitch
                      color="success"
                      label-on="Yes"
                      label-off="No"
                      label="Update Severity"
                      :checked.sync="update_severity"
                      style="padding-top: 5px"
                    ></CSwitch>
                  </CCol>
                  <CCol>
                    <CSelect
                      v-bind:disabled="!update_severity"
                      :options="severities"
                      :value.sync="target_severity"
                      placeholder="Select a new severity for matching events..."
                    />
                  </CCol>
                </CRow>
              </CTab>
              <CTab title="5. Case Actions" :disabled="test_failed && from_card">
                <h4>Case Actions</h4>
                <p>Applying Case Actions when an Event Rule matches quickly helps analysts organize events in to Cases.  When <b>Create New Case</b> is selected, each matching event will have it's own unique case created. When <b>Merge into Case</b> is selected, all matching events will merge into the selected case.</p>
                <CRow>
                  <CCol col="2"><label>Create New Case</label>
                    <CSwitch
                      label="Merge into Case"
                      color="success"
                      label-on="Yes"
                      label-off="No"
                      :checked.sync="create_new_case"
                      style="padding-top: 5px"
                      v-bind:disabled="merge_into_case"
                    ></CSwitch>
                  </CCol>
                  <CCol col="10">
                      <label for="case_template">Case Template</label>
                      <multiselect 
                    v-model="case_template" 
                    label="title" 
                    :options="case_templates" 
                    track-by="uuid" 
                    :searchable="true"
                    :internal-search="false"
                    :options-limit="10"
                    :show-no-results="false"
                    placeholder="Select a case template..."
                    @search-change="caseTemplateFind"
                    v-bind:disabled="(current_user.role.permissions.view_organizations && organization == null) || !create_new_case">
                    <template slot="option" slot-scope="props">
                        {{props.option.title}}<br>
                        <small>{{props.option.description}}<br>Contains {{props.option.task_count}} tasks.</small>
                    </template>
                </multiselect>
                <small class="text-muted"
                      >Select a Case Template to apply when the new case is created</small>
                  </CCol>
                </CRow>
                <br><label>Merge into Case</label>
                <CRow>
                  <CCol col="1">
                    <CSwitch
                      label="Merge into Case"
                      color="success"
                      label-on="Yes"
                      label-off="No"
                      :checked.sync="merge_into_case"
                      style="padding-top: 5px"
                      v-bind:disabled="create_new_case"
                    ></CSwitch>
                  </CCol>
                  <CCol col="11">
                    <multiselect
                      style="z-index: 50"
                      v-bind:disabled="!merge_into_case"
                      :options="cases"
                      v-model="target_case"
                      track-by="uuid"
                      label="title"
                      :searchable="true"
                      :internal-search="false"
                      :options-limit="10"
                      :show-no-results="false"
                      @search-change="caseFind"
                      :custom-label="caseLabel"
                      placeholder="Select a case"
                    >
                      <template slot="option" slot-scope="props">
                        {{ props.option.title }} ({{ props.option.uuid
                        }}<br /><small
                          >{{
                            props.option.event_count
                              ? props.option.event_count
                              : 0
                          }}
                          events.</small
                        >
                      </template> </multiselect
                    ><br />
                  </CCol>
                </CRow>
              </CTab>
              <CTab title="6. Notifications" :disabled="test_failed && from_card">
                <h4>Notifications</h4>
                <p>By selecting a notification channel, any time this Event Rule matches an event, a notification will be sent to all selected channels using the channels defined message template.</p>
                <label for="notification_channel_select">Notification Channel</label><br>
                <multiselect
                      id="notification_channel_select"
                      style="z-index: 50"
                      :options="formatted_notification_channels"
                      v-model="channels"
                      track-by="uuid"
                      label="name"
                      :searchable="true"
                      :internal-search="false"
                      :options-limit="10"
                      :show-no-results="false"
                      @search-change="loadNotificationChannels"
                      placeholder="Select a notification channel"
                      :multiple="true"
                      :close-on-select="false"
                      
                    ></multiselect>
              </CTab>
              <CTab title="7. Review" :disabled="test_failed && from_card">
                <h4>Review</h4>
                <b>Rule Name: </b> {{ name }}<br />
                <b>Description: </b><br />{{ description }}<br /><br />
                <span v-if="expire"
                  ><b>Expire in: </b> {{ expire_days }} day(s)<br
                /></span>
                <b>Actions: </b><br /><br />
                <ul>
                  <li v-if="merge_into_case">
                    Merge in to case
                    <b>#{{ target_case.id }} - {{ target_case.title }}</b>
                  </li>
                  <li v-if="dismiss_event">Immediately dismiss event</li>
                </ul>
              </CTab>
            </CTabs>
          </CCol>
        </CRow>
        <CRow>
          <CCol>
            <CForm @submit.prevent="createEventRule" id="event_rule_form">
              <!--<CAlert :show="step == 3 && !test_failed" color="danger" closeButton>
                            Your query matches more than <b>1000</b> events, tuning of source system is recommended.
                        </CAlert>-->
              <div name="create-event-rule-step-1" v-if="step == 1"></div>
              <div name="create-case-template-step-2" v-if="step == 2"></div>
              <div name="create-case-template-step-3" v-if="step == 3"></div>
              <div name="create-case-template-step-4" v-if="step == 4"></div>
              <div name="create-case-template-step-5" v-if="step == 5"></div>
            </CForm>
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
          :disabled="test_failed && step == 2 && from_card"
          color="primary"
          >Next</CButton
        >
        <CButton
          v-if="step == final_step && (mode == 'create' || mode == 'clone')"
          @click="createEventRule()"
          color="primary"
          :disabled="submitted"
          ><span v-if="submitted"><CSpinner size="sm" />&nbsp;</span
          >Create</CButton
        >
        <CButton
          v-if="step == final_step && mode == 'edit'"
          @click="editEventRule()"
          color="primary"
          :disabled="submitted"
          ><span v-if="submitted"><CSpinner size="sm" />&nbsp;</span
          >Save</CButton
        >
      </template>
    </CModal>
    <CModal
      title="Rule Testing Results"
      size="xl"
      :show.sync="show_test_results"
    >
      <div style="overflow-y: scroll; max-height: 400px">
        <!--<vue-json-pretty :showLength="true" selectableType="multiple" :path="'res'" :data="test_results"></vue-json-pretty>-->
        {{ test_results }}
      </div>
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
  name: "CreateEventRuleModal",
  props: {
    show: Boolean,
    events: Array,
    selected_count: Number,
    event_signature: String,
    event_organization: String,
    source_event_uuid: String,
    rule_observables: Array,
    from_card: {
      type: Boolean,
      default: false,
    },
    mode: {
      type: String,
      default: "create",
    },
    event_rule: {
      type: Object,
      default: null,
    },
  },
  computed: {
    formatted_notification_channels() {
      if(this.notification_channels.length == 0) {
        this.$store.dispatch("getNotificationChannels", {}).then(() => {
          return this.notification_channels.map((o) => { return { name:o.name, uuid:o.uuid}})
        });
      }
      return this.notification_channels.map((o) => { return { name:o.name, uuid:o.uuid}})
      
    }, ...mapState(["settings", "current_user", "notification_channels"])
  },
  data() {
    return {
      name: "",
      cases: [],
      description: "",
      modalStatus: this.show,
      merge_into_case: false,
      tag_event: false,
      global_rule: false,
      priority: 1,
      update_severity: false,
      target_severity: 0,
      selected_tags: [],
      dismiss_event: false,
      expire_days: 1,
      observables: [],
      expire: false,
      final_step: 6,
      test_running: false,
      test_result: "",
      test_failed: true,
      target_case: {},
      query: "",
      close_reason: "",
      close_reasons: [],
      create_new_case: false,
      case_template: '',
      dismiss_comment: "",
      tag_list: [],
      case_templates: [],
      run_retroactively: true,
      add_action: false,
      channels: [],
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
      actions: [
        {
          label: "Merge into Case",
          value: "merge",
        },
        {
          label: "Dismiss Event",
          value: "dismiss",
        },
        {
          label: "Mute Event",
          value: "mute_event",
        },
        {
          label: "Update Event description",
          value: "update_description",
        },
        {
          label: "Add Event Tags",
          value: "tag",
        },
      ],
      current_action: "",
      selected_actions: [],
      error: false,
      error_message: "",
      submitted: false,
      step: 0,
      range: {
        start: this.days_ago(7),
        end: this.today(),
      },
      masks: {
        input: "YYYY-MM-DD h:mm A",
      },
      return_events: false,
      event_count: 1,
      organization: "",
      organizations: [],
      rule: {},
      show_test_results: false,
      test_result_color: "success",
      test_results: "",
      test_complete: false,
      disable_reason: null,
      active: true,
    };
  },
  watch: {
    show: function () {
      this.error = false;
      this.error_message = "";
      this.modalStatus = this.show;
    },
    modalStatus: function () {
      if (this.modalStatus) {
        this.test_failed = true;
        this.loadData();
        if (this.from_card) {
          this.event_count = this.events.length;
          this.organization = this.event_organization;
          this.query = this.generateRule();
          if (this.event_signature) {
            this.name = "Rule for event signature " + this.event_signature;
          }
        } else {
          if (this.event_rule) {
            this.populateEventRuleFields();
          } else {
            this.modalStatus = false;
          }
          this.event_count = 1000;
        }

        this.caseFind("*");
        this.loadNotificationChannels();
        this.loadCloseReasons();
      }
      this.$emit("update:show", this.modalStatus);
      if (!this.modalStatus) {
        this.reset();
      }
    }
  },
  created() {
    //this.loadData()
    //this.$store.dispatch('getSettings')
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
    populateEventRuleFields() {
      this.organization = this.current_user.organization;

      if (this.event_rule.organization) {
        this.organization = this.event_rule.organization;
      }

      this.$store
        .dispatch("getCloseReasons", { organization: this.organization })
        .then((resp) => {
          this.close_reasons = this.$store.getters.close_reasons.map(
            (reason) => {
              return { label: reason.title, value: reason.uuid };
            }
          );
          this.step = 0;
          this.name = this.event_rule.name;
          //this.organization = this.event_rule.organization
          this.description = this.event_rule.description;
          this.merge_into_case = this.event_rule.merge_into_case;
          this.tag_event = this.event_rule.add_tags;
          this.tags_to_add = this.event_rule.tags_to_add
          this.priority = this.event_rule.priority;
          this.global_rule = this.event_rule.global_rule;
          this.update_severity = this.event_rule.update_severity;
          this.target_severity = this.event_rule.target_severity;
          this.selected_tags = this.event_rule.tags_to_add;
          this.dismiss_event = this.event_rule.dismiss_event;
          this.expire_days = this.event_rule.expire_days;
          this.observables = this.event_rule.observables;
          this.expire = this.event_rule.expire;
          this.dismiss_event = this.event_rule.dismiss;
          this.run_retroactively = this.event_rule.run_retroactively;
          this.channels = this.event_rule.notification_channels ? this.event_rule.notification_channels : [];
          this.channels = this.formatted_notification_channels.filter((channel) =>
            this.event_rule.notification_channels.includes(channel.uuid)
          );
          if (this.event_rule.target_case_uuid) {
            this.$store
              .dispatch("getCase", this.event_rule.target_case_uuid)
              .then((resp) => {
                this.target_case = resp.data;
              });
          } else {
            this.target_case = {};
          }
          if (this.event_rule.disable_reason) {
            this.disable_reason = this.event_rule.disable_reason;
          }
          this.active = this.event_rule.active;
          this.query = this.event_rule.query;
          this.close_reason = this.event_rule.dismiss_reason
            ? this.close_reasons.filter(
                (c) => c.value === this.event_rule.dismiss_reason
              )[0].value
            : null;
          this.dismiss_comment = this.event_rule.dismiss_comment;
        });
    },
    generateRule() {
      /* Generates a basic rule for the selected Event that an analyst
            can use as their base */
      let rule_text =
        "# System generated base query that includes all observables and the event title\n";
      rule_text += "# Pin this rule to this event by it's title\n";
      rule_text += `title = "${this.event_signature}"\n`;
      rule_text += "\n# Default matching on all present observables\n";
      rule_text += "# Consider fine tuning this with the expands function\n";

      let observable_values = this.rule_observables.map((obs) =>
        obs.value.replace(/\\/g, "\\\\").replace(/\"/g, '\\"')
      );
      rule_text += `and observables.value|all In ["${observable_values.join(
        '","'
      )}"]`;

      return rule_text;
    },
    highlighter(code) {
      return highlight(code, languages.rql);
    },
    test_query() {
      let data = {
        uuid: this.source_event_uuid,
        query: this.query,
      };
      this.test_result = "";
      this.test_running = true;
      this.$store
        .dispatch("testEventRuleQuery", data)
        .then((resp) => {
          if (resp.data.success == true) {
            this.test_failed = false;
          } else {
            this.test_failed = true;
          }
          this.test_result = resp.data.message;
          this.test_running = false;
        })
        .catch((err) => {
          this.test_running = false;
          this.test_failed = true;
          this.test_result = err.response.data.message;
        });
    },
    testRule() {
      let data = {
        data: "",
        query: this.rule.query ? this.rule.query : this.query,
        event_count: parseInt(this.event_count),
        return_results: this.return_events,
        start_date: this.range.start,
        end_date: this.range.end,
      };

      if (this.from_card && this.source_event_uuid) {
        data["uuid"] = this.source_event_uuid;
      }

      if (!this.global_rule) {
        data["organization"] = this.organization ? this.organization : null;
      }

      this.test_result = "";
      this.test_complete = false;
      this.test_running = true;
      this.$store
        .dispatch("testEventRuleQuery", data)
        .then((resp) => {
          if (resp.data.success == true) {
            this.test_result = resp.data.message;
            if (this.return_events) {
              this.test_results = resp.data.hits;
            }

            this.test_result_color = "success";

            if(resp.data.danger) {
              this.test_result_color = "danger";
            } 
            
            this.test_failed = false;
          } else {
            this.test_result =
              resp.data.message +
              ". Try increasing the number of test events or increasing your date range.";
            this.test_result_color = "warning";
            this.test_failed = true;
          }
          this.test_running = false;
          this.test_complete = true;
        })
        .catch((err) => {
          this.test_complete = true;
          this.test_running = false;
          this.test_failed = true;
          this.test_result = err.response.data.message;
          this.test_result_color = "danger";
        });
    },
    createEventRule() {
      this.submitted = true;

      let rule = {
        name: this.name,
        organization: this.organization,
        description: this.description,
        priority: parseInt(this.priority),
        merge_into_case: this.merge_into_case,
        create_new_case: this.create_new_case,
        case_template: this.case_template ? this.case_template.uuid : null,
        target_case_uuid: this.target_case.uuid,
        update_severity: this.update_severity,
        target_severity: this.target_severity,
        add_tags: this.tag_event,
        tags_to_add: Array(),
        expire: this.expire,
        expire_days: parseInt(this.expire_days),
        dismiss_comment: this.dismiss_comment,
        dismiss_reason: this.close_reason,
        dismiss: this.dismiss_event,
        event_signature: this.event_signature,
        run_retroactively: this.run_retroactively,
        notification_channels: Array(),
        query: this.query,
        active: this.active
      };

      if (this.current_user.default_org) {
        rule["global_rule"] = this.global_rule;
      }

      for (let tag in this.selected_tags) {
        rule.tags_to_add.push(this.selected_tags[tag].name);
      }

      for (let channel in this.channels) {
        rule.notification_channels.push(this.channels[channel].uuid);
      }

      this.$store
        .dispatch("createEventRule", rule)
        .then((resp) => {
          this.modalStatus = false;
          this.error = false;
          this.error_message = "";
          this.submitted = false;
        })
        .catch((err) => {
          this.submitted = false;
          this.error = true;
          this.step = 0;
          this.error_message = err.response.data.message;
        });
    },
    editEventRule() {
      let uuid = this.event_rule.uuid;
      let rule = {
        name: this.name,
        organization: this.organization,
        description: this.description,
        priority: parseInt(this.priority),
        merge_into_case: this.merge_into_case,
        target_case_uuid: this.target_case ? this.target_case.uuid : null,
        update_severity: this.update_severity,
        target_severity: this.target_severity,
        add_tags: this.tag_event,
        tags_to_add: Array(),
        expire: this.expire,
        expire_days: parseInt(this.expire_days),
        dismiss_comment: this.dismiss_comment,
        dismiss_reason: this.close_reason,
        dismiss: this.dismiss_event,
        event_signature: this.event_signature,
        run_retroactively: this.run_retroactively,
        notification_channels: Array(),
        query: this.query,
        active: this.active,
      };
    
      if (this.current_user.default_org) {
        rule["global_rule"] = this.global_rule;
      }

      for (let tag in this.selected_tags) {
        rule.tags_to_add.push(this.selected_tags[tag].name);
      }

      for (let channel in this.channels) {
        rule.notification_channels.push(this.channels[channel].uuid);
      }

      this.$store
        .dispatch("editEventRule", { uuid, rule })
        .then(() => {
          this.modalStatus = false;
          this.error = false;
          this.error_message = "";
          this.submitted = false;
        })
        .catch((err) => {
          this.submitted = false;
          this.error = true;
          this.step = 0;
          this.error_message = err.response.data.message;
        });
    },
    nextStep() {
      this.step += 1;
    },
    previousStep() {
      this.step -= 1;
    },
    loadData() {
      this.$store.dispatch("getCases", {}).then((resp) => {
        this.cases = this.$store.getters.cases;
      });
    },
    caseFind(query) {
      let fields = "uuid,title,id,event_count,owner,severity";
      let organization = this.event_organization;
      this.$store
        .dispatch("getCasesByTitle", {
          title: query,
          organization: organization,
          fields,
        })
        .then((resp) => {
          this.cases = this.$store.getters.cases;
        });
    },
    toggleMergeToCase() {
      this.merge_into_case = !this.merge_into_case;
    },
    caseLabel({ uuid, title }) {
      if (uuid && title) {
        return `${title} (${uuid})`;
      }
    },
    reset() {
      this.name = "";
      this.organization = "";
      this.query = "";
      this.description = "";
      this.expire = true;
      this.expire_days = 1;
      this.observables = [];
      this.merge_into_case = false;
      this.dismiss_event = false;
      this.target_case = {};
      this.step = 0;
      this.test_complete = false;
      this.test_failed = false;
      this.test_result = "";
      this.disable_reason = null;
      this.active = true;
    },
    dismiss() {
      this.reset();
      this.modalStatus = false;
    },
    addChannel(channel) {
      const c = {
        name: channel.name,
        uuid: channel.uuid,
      };
      this.channels.push(c)
    },
    addTag(newTag) {
      const t = {
        name: newTag,
        uuid: "",
      };
      this.tag_list.push(t);
      this.selected_tags.push(t);
    },
    reloadMeta() {
      this.loadCloseReasons()
      this.loadNotificationChannels()
      this.caseTemplateFind('')
      this.channels = []
    },
    loadNotificationChannels(name=null) {
      let organization = this.organization;

      if (this.from_card) {
        organization = this.event_organization
      }

      if(name) {
        this.$store.dispatch("getNotificationChannels", { organization: organization, name__like: name });
      } else {
        this.$store.dispatch("getNotificationChannels", { organization });
      }

    },
    caseTemplateFind(query) {
        let organization = this.organization
        this.$store.dispatch('getCaseTemplateList', {title: query, organization: organization}).then(resp => {
            this.case_templates = resp.data
        })
    },
    loadCloseReasons() {
      let organization = this.organization;

      if (this.from_card) {
        organization = this.event_organization;
      }

      if (this.current_user.default_org) {
        this.$store.dispatch("getOrganizations", {}).then((resp) => {
          this.organizations = this.$store.getters.organizations.map((o) => {
            return { label: o.name, value: o.uuid };
          });
        });
      }

      this.$store.dispatch("getCloseReasons", { organization }).then((resp) => {
        this.close_reasons = this.$store.getters.close_reasons.map((reason) => {
          return { label: reason.title, value: reason.uuid };
        });
      });
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
    showDrawer() {
      let uuid = this.source_event_uuid;
      if (this.$store.getters.eventDrawerMinimize) {
        this.$store.dispatch("getEvent", uuid).then((resp) => {
          this.$store.commit("set", [
            "eventDrawerMinimize",
            !this.$store.getters.eventDrawerMinimize,
          ]);
          this.event_data = resp.data;
        });
      } else {
        this.$store.commit("set", [
          "eventDrawerMinimize",
          !this.$store.getters.eventDrawerMinimize,
        ]);
      }
    },
  },
};
</script>