<template>
  <div>
    <link
      rel="stylesheet"
      href="https://unpkg.com/vue-multiselect@2.1.0/dist/vue-multiselect.min.css"
    />
    <CModal title="Import Sigma Rule" size="xl" :show.sync="modalStatus">
      <template #header>
        <h5 style="text-transform: capitalize">{{ modal_mode }} Agent Policy</h5>
        <span class="text-right">
          <button type="button" aria-label="Close" class="close" @click="dismiss()">
            ×
          </button>
          <button
            type="button"
            class="kb"
            aria-label="Documentation"
            onclick="window.open('https://docs.reflexsoar.com/en/latest/agents/policy')"
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
        <CCol><h3>Agent Policy</h3>
        <p>
          Agent policies allow you to control how all agents behave without having to
          manually configure each one. Agent policies can be assigned to Agent Groups or
          directly to a single agent as a policy override.
        </p>
        </CCol>
        </CRow>
        <CRow>
        <CCol>
        <CTabs
          variant="pills"
          :vertical="{ navs: 'col-md-2', content: 'col-md-10' }"
          :fade="false"
          :activeTab.sync="tab"
        >
          <CTab title="Details">
            <CRow>
              <CCol>
                <CSelect
                  v-if="current_user.default_org"
                  placeholder="Select an Organization..."
                  required
                  :value.sync="policy.organization"
                  :options="formattedOrganizations()"
                  label="Organization"
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol>
                <CInput
                  v-model="policy.name"
                  label="Policy Name"
                  placeholder="Enter a name for the policy"
                  required
                  :isValid="validate(policy.name, validations.name)"
                  :invalidFeedback="validations.name.message"
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol>
                <CInput
                  v-model.number="policy.priority"
                  label="Priority"
                  placeholder="Enter a priority for the policy"
                  description="If more than one policy is assigned to an agent the higher priority policy will override all other policies when there is setting conflict. 1 is the highest priority."
                  :isValid="validate(policy.priority, validations.priority)"
                  :invalidFeedback="validations.priority.message"
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol>
                <CTextarea
                  v-model="policy.description"
                  label="Description"
                  placeholder="Enter a description for the policy"
                  rows="5"
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol>
                <label for="policy_tags">Tags</label>
                <multiselect
                  id="agent_roles"
                  v-model="policy.tags"
                  placeholder="Select the groups this agent belongs to"
                  :options="tags"
                  :multiple="true"
                  :taggable="true"
                  :close-on-select="false"
                  @tag="addTag"
                >
                </multiselect
                ><br />
              </CCol>
            </CRow>
          </CTab>
          <CTab title="General Settings">
            <CRow>
              <CCol>
                <label for="agent_roles">Roles</label>
                <MultiPicker label="Roles" :value.sync="policy.roles" :options="roles"/>
              </CCol>
            </CRow>
            <CRow>
              <CCol>
                <CInput
                  v-model.number="policy.health_check_interval"
                  label="Health Check Interval"
                  placeholder="Enter a health check interval in seconds"
                  description="How often the Agent will check in to the management for policy updates"
                  :isValid="
                    validate(
                      policy.health_check_interval,
                      validations.health_check_interval
                    )
                  "
                  :invalidFeedback="validations.health_check_interval.message"
                />
              </CCol>
              <CCol>
                <CSelect
                  :value.sync="policy.logging_level"
                  label="Log Level"
                  placeholder="Select a logging level"
                  :options="log_levels"
                />
              </CCol>
            </CRow>
            <CRow>
              
              <CCol>
                <CInput
                  disabled
                  v-model.number="policy.max_intel_db_size"
                  label="Max Intel DB Size"
                  placeholder="Size in Mb"
                  description="The agent will cache some intel locally to improve intel check performance"
                />
              </CCol>
              <CCol>
                
              </CCol>
            </CRow>
          </CTab>
          <CTab
            title="Poller Settings"
            v-bind:disabled="policy.roles && !policy.roles.includes('poller')"
          >
            <CRow>
              <CCol>
                <CInput
                  v-model.number="policy.poller_config.concurrent_inputs"
                  label="Concurrent Inputs"
                  placeholder="Enter the number of concurrent inputs"
                  description="The number of concurrent inputs the poller will process"
                  :isValid="
                    validate(
                      policy.poller_config.concurrent_inputs,
                      validations.concurrent_inputs
                    )
                  "
                  :invalidFeedback="validations.concurrent_inputs.message"
                />
              </CCol>
              <CCol>
                <CSelect
                  :value.sync="policy.poller_config.logging_level"
                  label="Log Level"
                  placeholder="Select a logging level"
                  :options="log_levels"
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol>
                <CInput
                  v-model.number="policy.poller_config.max_input_attempts"
                  label="Max Input Attempts"
                  placeholder="Enter the number of concurrent inputs"
                  description="The number for how many times to try an input before skipping it"
                  :isValid="
                    validate(
                      policy.poller_config.max_input_attempts,
                      validations.max_input_attempts
                    )
                  "
                  :invalidFeedback="validations.max_input_attempts.message"
                />
              </CCol>
              <CCol>
                <CInput
                  v-model.number="policy.poller_config.signature_cache_ttl"
                  label="Event Signature Cache TTL"
                  placeholder="Enter a time in seconds"
                  description="How long the poller role will cache Event Signatures before Event Realert will happen"
                  :isValid="
                    validate(
                      policy.poller_config.signature_cache_ttl,
                      validations.signature_cache_ttl
                    )
                  "
                  :invalidFeedback="validations.signature_cache_ttl.message"
                />
              </CCol>
            </CRow>
          </CTab>
          <CTab
            title="Runner Settings"
            v-bind:disabled="policy.roles && !policy.roles.includes('runner')"
          >
            <CRow>
              <CCol>
                <CInput
                  v-model.number="policy.runner_config.concurrent_actions"
                  label="Concurrent Actions"
                  placeholder="Enter the number of concurrent actions"
                  description="The number of concurrent actions this agent can run at one time"
                  :isValid="
                    validate(
                      policy.runner_config.concurrent_actions,
                      validations.concurrent_actions
                    )
                  "
                  :invalidFeedback="validations.concurrent_actions.message"
                />
              </CCol>
              <CCol>
                <CSelect
                  :value.sync="policy.runner_config.logging_level"
                  label="Log Level"
                  placeholder="Select a logging level"
                  :options="log_levels"
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol>
                <CInput
                  v-model.number="policy.runner_config.wait_interval"
                  label="Wait Interval"
                  placeholder="Enter a time in seconds"
                  description="How long should the agent wait before polling for new actions to execute"
                  :isValid="
                    validate(
                      policy.runner_config.wait_interval,
                      validations.wait_interval
                    )
                  "
                  :invalidFeedback="validations.wait_interval.message"
                />
              </CCol>
              <CCol>
                <CInput
                  v-model.number="policy.runner_config.plugin_poll_interval"
                  label="Plugin Poll Interval"
                  placeholder="Enter a time in seconds"
                  description="How often should the agent poll for new or updated plugins"
                  :isValid="
                    validate(
                      policy.runner_config.plugin_poll_interval,
                      validations.plugin_poll_interval
                    )
                  "
                  :invalidFeedback="validations.plugin_poll_interval.message"
                />
              </CCol>
            </CRow>
          </CTab>
          <CTab
            title="Detector Settings"
            v-bind:disabled="policy.roles && !policy.roles.includes('detector')"
          >
            <CRow>
              <CCol>
                <CInput
                  v-model.number="policy.detector_config.concurrent_rules"
                  label="Concurrent Rules"
                  placeholder="Enter the number of concurrent detection rules"
                  description="The number of concurrent detection rules this agent can run at one time"
                  :isValid="
                    validate(
                      policy.detector_config.concurrent_rules,
                      validations.concurrent_rules
                    )
                  "
                  :invalidFeedback="validations.concurrent_rules.message"
                />
              </CCol>
              <CCol>
                <CSelect
                  :value.sync="policy.detector_config.logging_level"
                  label="Log Level"
                  placeholder="Select a logging level"
                  :options="log_levels"
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol>
                <CInput
                  v-model.number="policy.detector_config.wait_interval"
                  label="Wait Interval"
                  placeholder="Enter a time in seconds"
                  description="How long should the agent wait before polling for new detections to execute"
                  :isValid="
                    validate(
                      policy.detector_config.wait_interval,
                      validations.wait_interval
                    )
                  "
                  :invalidFeedback="validations.wait_interval.message"
                />
              </CCol>
              <CCol>
                <CInput
                  v-model.number="policy.detector_config.catchup_period"
                  label="Max Catchup Period"
                  placeholder="Enter a time in minutes"
                  description="How  far can a detection rule go between runs to look for new data"
                  :isValid="
                    validate(
                      policy.detector_config.catchup_period,
                      validations.catchup_period
                    )
                  "
                  :invalidFeedback="validations.catchup_period.message"
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol>
                <CInput
                  v-model.number="policy.detector_config.max_threshold_events"
                  label="Max Threshold Events"
                  placeholder="Enter the max number of events to send when a threshold rule matches"
                  description="The max number of events to send when a threshold rule matches"
                  :isValid="
                    validate(
                      policy.detector_config.max_threshold_events,
                      validations.max_threshold_events
                    )
                  "
                  :invalidFeedback="validations.max_threshold_events.message"
                />
              </CCol>
              <CCol> </CCol>
            </CRow>
          </CTab>
          <CTab title="MITRE Mapper Settings"
          v-bind:disabled="policy.roles && !policy.roles.includes('mitre')">
            <CRow>
              <CCol>
                <CInput
                  v-model.number="policy.mitre_mapper_config.concurrent_inputs"
                  label="Concurrent Inputs"
                  placeholder="Enter the number of concurrent inputs"
                  description="The number of concurrent inputs the poller will process"
                  :isValid="
                    validate(
                      policy.mitre_mapper_config.concurrent_inputs,
                      validations.concurrent_inputs
                    )
                  "
                  :invalidFeedback="validations.concurrent_inputs.message"
                />
              </CCol>
              <CCol>
                <CSelect
                  :value.sync="policy.mitre_mapper_config.logging_level"
                  label="Log Level"
                  placeholder="Select a logging level"
                  :options="log_levels"
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol>
                <CInput
                  v-model.number="policy.mitre_mapper_config.mapping_refresh_interval"
                  label="Mapping Refresh Interval"
                  placeholder="Enter a time in seconds"
                  description="How often the MITRE mapper will refresh the mapping data"
                  :isValid="
                    validate(
                      policy.mitre_mapper_config.mapping_refresh_interval,
                      validations.mapping_refresh_interval
                    )
                  "
                  :invalidFeedback="validations.mapping_refresh_interval.message"
                />
              </CCol>
              <CCol>
                <CInput
                  v-model.number="policy.mitre_mapper_config.assessment_days"
                  label="Assessment Days"
                  placeholder="Enter a time in days"
                  description="How many days back to look for new data source assessments"
                  :isValid="
                    validate(
                      policy.mitre_mapper_config.assessment_days,
                      validations.assessment_days
                    )
                  "
                  :invalidFeedback="validations.assessment_days.message"
                />
              </CCol>
            </CRow>
          </CTab>
          <CTab title="Review">
            <CRow>
              <CCol>
                <h4>Review</h4>
                <p>Review the policy settings and click save to create the policy.</p>
              </CCol>
            </CRow>
            <CRow>
              <CCol>
                <h5>General Settings</h5>
                <label>Name:</label> {{ policy.name }}<br />
                <label>Tags:</label> <li style="display: inline; margin-right: 2px;" v-for="tag in policy.tags" :key="tag">
                    <CBadge color="info" size="sm" style="padding: 5px; margin-top:10px; margin-right:3px;">{{ tag }}</CBadge>
                </li><br>
                <label>Description:</label> {{ policy.description }}<br />
                <label>Priority:</label> {{ policy.priority }}<br />
                <label>Roles:</label><br />
                <li
                  style="display: inline; margin-right: 2px"
                  v-for="role in policy.roles"
                  :key="role"
                >
                  <CButton color="primary" style="cursor: auto" size="sm" disabled>
                    {{ roles.find((r) => r.value == role).label }}
                  </CButton>
                </li>
                <br /><br />
                <label>Health Check Interval:</label> {{ policy.health_check_interval
                }}<br />
                <label>Log Level:</label> {{ policy.logging_level }}<br /><br>
              </CCol>
            </CRow>
            <CRow>
              <CCol>
                <h5>Poller Settings</h5>

                <label>Signature Cache TTL:</label>
                {{ policy.poller_config.signature_cache_ttl }}<br />
                <label>Concurrent Inputs:</label>
                {{ policy.poller_config.concurrent_inputs }}<br />
                <label>Max Input Attempts:</label>
                {{ policy.poller_config.max_input_attempts }}<br />
                <label>Log Level:</label> {{ policy.poller_config.logging_level }}<br />
              </CCol>
              <CCol>
                <h5>Runner Settings</h5>
                <label>Concurrent Actions:</label>
                {{ policy.runner_config.concurrent_actions }}<br />

                <label>Wait Interval:</label> {{ policy.runner_config.wait_interval
                }}<br />
                <label>Plugin Poll Interval:</label>
                {{ policy.runner_config.plugin_poll_interval }}<br />
                <label>Logging Level:</label> {{ policy.runner_config.logging_level
                }}<br />
              </CCol>
              <CCol>
                <h5>Detector Settings</h5>
                <label>Concurrent Rules:</label>
                {{ policy.detector_config.concurrent_rules }}<br />
                <label>Wait Interval:</label> {{ policy.detector_config.wait_interval
                }}<br />
                <label>Catchup Period:</label> {{ policy.detector_config.catchup_period
                }}<br />
                <label>Max Threshold Events:</label>
                {{ policy.detector_config.max_threshold_events }}<br />
                <label>Logging Level:</label> {{ policy.detector_config.logging_level
                }}<br />
              </CCol>
            </CRow>
          </CTab>
        </CTabs></CCol></CRow>
      </div>
      <template #footer>
        <CButton @click="dismiss()" color="secondary">Dismiss</CButton>
        <CButton v-if="modal_mode == 'Edit'" @click="update()" color="primary"
          >Save</CButton
        >
        <CButton v-if="modal_mode == 'Create'" @click="create()" color="primary"
          >Create</CButton
        >
      </template>
    </CModal>
  </div>
</template>

<script>
import { mapState } from "vuex";

import MultiPicker from '../components/MultiPicker.vue'

export default {
  name: "AgentPolicyWizard",
  components: {
    MultiPicker
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    modal_mode: {
      type: String,
      default: "Create",
    },
    policy: {
      type: Object,
      default: () => {
        return {
          roles: [],
          name: "",
          description: "",
          tags: [],
          poller_config: {},
          runner_config: {},
          detector_config: {},
        };
      },
    },
  },
  computed: mapState(["current_user", "organizations"]),
  watch: {
    show: function () {
      this.error = false;
      this.error_message = "";
      this.modalStatus = this.show;
    },
    modalStatus: function () {
      if (this.modalStatus) {
        this.tab = 0;
        this.test_failed = true;
      }
      this.$emit("update:show", this.modalStatus);
      if (!this.modalStatus) {
        this.dismiss();
      }
    },
  },
  data() {
    return {
      tab: 0,
      error: false,
      error_message: "",
      modalStatus: this.show,
      submitted: false,
      roles: [
        {
          label: "Detector",
          value: "detector",
        },
        {
          label: "Runner",
          value: "runner",
        },
        {
          label: "Poller",
          value: "poller",
        },
        {
          label: "MITRE Mapper",
          value: "mitre",
        }],
      log_levels: ["INFO", "ERROR", "WARNING", "DEBUG"],
      tags: [],
      validations: {
        event_realert_ttl: {
          min: 1,
          max: 86400,
          required: true,
          type: "number",
          message: "Must be a number between 1 and 86400",
        },
        health_check_interval: {
          min: 30,
          max: 86400,
          required: true,
          type: "number",
          message: "Must be between 30 and 86400",
        },
        concurrent_inputs: {
          min: 1,
          max: 25,
          required: true,
          type: "number",
          message: "Must be between 1 and 25",
        },
        max_input_attempts: {
          min: 1,
          max: 10,
          required: true,
          type: "number",
          message: "Must be between 1 and 10",
        },
        signature_cache_ttl: {
          min: 1,
          max: 86400,
          required: true,
          type: "number",
          message: "Must be between 1 and 86400",
        },
        plugin_poll_interval: {
          min: 1,
          max: 86400,
          required: true,
          type: "number",
          message: "Must be between 1 and 86400",
        },
        concurrent_actions: {
          min: 1,
          max: 25,
          required: true,
          type: "number",
          message: "Concurrent Actions must be between 1 and 25",
        },
        concurrent_rules: {
          min: 1,
          max: 25,
          required: true,
          type: "number",
          message: "Must be a number between 1 and 25",
        },
        wait_interval: {
          min: 1,
          max: 300,
          required: true,
          type: "number",
          message: "Must be between 1 and 300",
        },
        catchup_period: {
          min: 1,
          max: 43200,
          required: true,
          type: "number",
          message: "Must be between 1 and 43200",
        },
        max_threshold_events: {
          min: 1,
          max: 10000,
          required: true,
          type: "number",
          message: "Must be between 1 and 10000",
        },
        priority: {
          min: 1,
          max: 1000,
          required: true,
          type: "number",
          message: "Priority must be a number between 1 and 1000",
        },
        name: {
          length: 3,
          required: true,
          type: "string",
          message: "Must be at least 3 characters",
        },
        mapping_refresh_interval: {
          min: 1,
          max: 86400,
          required: true,
          type: "number",
          message: "Must be between 1 and 86400"
        },
        assessment_days: {
          min: 1,
          max: 90,
          required: true,
          type: "number",
          message: "Must be between 1 and 90"
        }
      },
    };
  },
  methods: {
    dismiss() {
      this.error = false;
      this.error_message = "";
      this.modalStatus = false;
    },
    formattedOrganizations() {
      return this.organizations.map((o) => {
        return { label: o.name, value: o.uuid };
      });
    },
    addTag(tag) {
      this.tags.push(tag);
      this.policy.tags.push(tag);
    },
    create() {
      this.$store
        .dispatch("createAgentPolicy", this.policy)
        .then((response) => {
          this.dismiss();
        })
        .catch((error) => {
          this.error = true;
          this.error_message = error.response.data.message;
        });
    },
    update() {
      let uuid = this.policy.uuid
      let stripped_policy = JSON.parse(JSON.stringify(this.policy))

      let fields_to_remove = [
        "created_at",
        "created_by",
        "revision",
        "updated_at",
        "updated_by",
        "uuid",
      ]

      fields_to_remove.forEach(element => {
        delete stripped_policy[element]  
      });
      
      this.$store
        .dispatch("updateAgentPolicy", { uuid: uuid, data: stripped_policy })
        .then((response) => {
          this.dismiss();
        })
        .catch((error) => {
          this.error = true;
          this.error_message = error.response.data.message;
          console.log(this.policy)
        });
    },
    validate(field, validator) {
      let min = validator.min ? validator.min : null;
      let max = validator.max ? validator.max : null;
      let required = validator.required ? validator.required : false;
      let type = validator.type ? validator.type : "string";
      let length = validator.length ? validator.length : null;
      if (typeof field != type) {
        return false;
      }
      if (typeof field == "number") {
        if (min !== null) {
          if (field < min) {
            return false;
          }
        }
        if (max !== null) {
          if (field > max) {
            return false;
          }
        }
      }
      if (typeof field == "string") {
        if (length !== null) {
          if (field.length < length) {
            return false;
          }
        }
      }
      if (required) {
        if (["", null, undefined, 0].includes(field)) {
          return false;
        }
      }
      return true;
    },
  },
};
</script>
