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
          <CCol
            ><h3>Agent Policy</h3>
            <p>
              Agent policies allow you to control how all agents behave without having to
              manually configure each one. Agent policies can be assigned to Agent Groups
              or directly to a single agent as a policy override.
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
                    <SelectInput
                      :options="formattedOrganizations()"
                      label="Organization"
                      placeholder="Select an organization"
                      :value.sync="policy.organization"
                      description="Select an organization related to this item."
                      @change="reloadData"
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
                    <MultiPicker
                      label="Roles"
                      :value.sync="policy.roles"
                      :options="agent_roles"
                    />
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
                  <CCol> </CCol>
                </CRow>
                <CRow>
                  <CCol>
                    <MultiPicker
                      :value.sync="policy.agent_tags"
                      :options="agent_tags"
                      option_label="full_name"
                      option_key="uuid"
                      label="Agent Tags"
                      description="Agents with these tags will have this policy applied">
                        <template #option="{ option }">
                          <AgentTag v-if="option.namespace !== undefined && option.value !== undefined" :namespace="option.namespace" :value="option.value" :color="option.color" />
                          <span v-else>Unknown Option ({{option.uuid}})</span>
                        </template>
                      </MultiPicker>
                          
                  </CCol>
                </CRow>
              </CTab>
              <CTab
                title="Inventory Settings"
              >
                <CRow>
                  <CCol>
                    <label>Agent Inventory Enabled</label><br />
                    <CSwitch
                      :checked.sync="policy.inventory_config.enabled"
                      label-on="Yes"
                      label-of="No"
                      color="success"
                    /><br />
                    </CCol>
                  </CRow><br>
                <CRow>
                  <CCol>
                    <CInput
                      v-model.number="policy.inventory_config.collection_interval"
                      label="Inventory Interval"
                      placeholder="Enter an inventory interval in seconds"
                      description="How often the Agent will check in to the management for inventory updates"
                      :isValid="
                        validate(
                          policy.inventory_config.collection_interval,
                          validations.inventory_collection_interval
                        )
                      "
                      :invalidFeedback="validations.inventory_collection_interval.message"
                    />
                  </CCol>
                  <CCol>
                    <CInput
                      v-model.number="policy.inventory_config.cache_expiration"
                      label="Cache Expiration"
                      placeholder="Enter a max cache age in seconds"
                      description="How old can inventory data be before it is considered stale"
                      :isValid="
                        validate(
                          policy.inventory_config.cache_expiration,
                          validations.inventory_cache_expire
                        )
                      "
                      :invalidFeedback="validations.inventory_cache_expire.message"
                    />
                  </CCol>
                  <CCol>
                    <CInput
                      v-model.number="policy.inventory_config.perf_interval"
                      label="Performance Collection Interval"
                      placeholder="Enter a time in seconds"
                      description="How often to pull performance data from the host"
                      :isValid="
                        validate(
                          policy.inventory_config.perf_interval,
                          validations.perf_interval
                        )
                      "
                      :invalidFeedback="validations.perf_interval.message"
                    />
                  </CCol>
                  <CCol>
                    <CInput
                      v-model.number="policy.inventory_config.service_interval"
                      label="Service Collection Interval"
                      placeholder="Enter a time in seconds"
                      description="How often to pull container service data from the host"
                      :isValid="
                        validate(
                          policy.inventory_config.service_interval,
                          validations.service_interval
                        )
                      "
                      :invalidFeedback="validations.service_interval.message"
                    />
                  </CCol>
                </CRow>
                <CRow>
                  <CCol>
                    <label>Collect Installed Software</label><br />
                    <CSwitch
                      :checked.sync="policy.inventory_config.installed_software"
                      label-on="Yes"
                      label-of="No"
                      color="success"
                    />
                  </CCol>
                  <CCol>
                    <label>Collect Running Services</label><br />
                    <CSwitch
                      :checked.sync="policy.inventory_config.services"
                      label-on="Yes"
                      label-of="No"
                      color="success"
                    />
                  </CCol>
                  <CCol>
                    <label>Collect Network Adapters</label><br />
                    <CSwitch
                      :checked.sync="policy.inventory_config.network_adapters"
                      label-on="Yes"
                      label-of="No"
                      color="success"
                    />
                  </CCol>
                </CRow><br>
                <CRow>
                  <CCol>
                    <label>Collect Listening Ports</label><br />
                    <CSwitch
                      :checked.sync="policy.inventory_config.listening_ports"
                      label-on="Yes"
                      label-of="No"
                      color="success"
                    />
                  </CCol>
                  <CCol>
                    <label>Collect Local Users</label><br />
                    <CSwitch
                      :checked.sync="policy.inventory_config.local_users"
                      label-on="Yes"
                      label-of="No"
                      color="success"
                    />
                  </CCol>
                  <CCol>
                    <label>Collect Containers</label><br />
                    <CSwitch
                      :checked.sync="policy.inventory_config.containers"
                      label-on="Yes"
                      label-of="No"
                      color="success"
                    />
                  </CCol>
                </CRow><br>
                <CRow>
                  <CCol>
                    <MultiPicker
                      label="Metrics Outputs"
                      :value.sync="policy.inventory_config.metrics_outputs"
                      :options="integration_outputs"
                      option_label="configuration_name"
                      option_key="configuration_uuid"
                      description="Select the outputs that should receive metrics data from this agent"
                      :asTags="true"
                    >
                      <template #option="{ option }">
                        <span style="display: inline">{{ option.integration_name }} - {{ option.configuration_name }}
                        <small style="float: right">{{ option.configuration_uuid }}</small>
                        </span>
                      </template>
                    </MultiPicker>
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
              <CTab
                title="MITRE Mapper Settings"
                v-bind:disabled="policy.roles && !policy.roles.includes('mitre')"
              >
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
                <CRow>
                  <CCol>
                    <CInput
                      v-model.number="policy.mitre_mapper_config.timeout"
                      label="Timeout"
                      placeholder="Enter a time in seconds"
                      description="How long the MITRE Mapper will wait for mapping queries to timeout"
                      :isValid="
                        validate(policy.mitre_mapper_config.timeout, validations.timeout)
                      "
                      :invalidFeedback="validations.timeout.message"
                    />
                  </CCol>
                  <CCol> </CCol>
                </CRow>
              </CTab>
              <CTab
                title="Windows Log Collector"
                v-bind:disabled="policy.roles && !policy.roles.includes('winlog')"
              >
                <CRow>
                  <CCol>
                    <CSelect
                      :value.sync="policy.winlog_config.logging_level"
                      label="Log Level"
                      placeholder="Select a logging level"
                      :options="log_levels"
                    />
                  </CCol>
                </CRow>
                <CRow>
                  <CCol>
                    <MultiPicker label="Log Sources" :value.sync="policy.winlog_config.log_source_config" :options="[{value: 'abc', label:'Foo'}]"
                    description="Select the log sources that this Windows Log Collector should consume from" />
                  </CCol>
                </CRow>
                <CRow>
                  <CCol>
                    <MultiPicker label="Default Output" :value.sync="policy.winlog_config.default_output" :options="[{value: 'abc', label:'Foo'}]"
                    description="The Windows Log Collector will default to sending log sources to these outputs unless overridden by other policy settings" />
                  </CCol>
                </CRow>
              </CTab>
              <CTab
                title="File Integrity Monitoring"
                v-bind:disabled="policy.roles && !policy.roles.includes('fim')"
              >
                <CRow>
                  <CCol>
                    <CInput
                      v-model.number="policy.fim_config.max_parallel_rules"
                      label="Concurrent Rules"
                      placeholder="Enter the number of concurrent rules"
                      description="The number of concurrent rules the FIM engine will process"
                      :isValid="
                        validate(
                          policy.fim_config.max_parallel_rules,
                          validations.max_parallel_rules
                        )
                      "
                      :invalidFeedback="validations.max_parallel_rules.message"
                    />
                  </CCol>
                  <CCol>
                    <CSelect
                      :value.sync="policy.fim_config.logging_level"
                      label="Log Level"
                      placeholder="Select a logging level"
                      :options="log_levels"
                    />
                  </CCol>
                </CRow>
                <CRow>
                  <CCol>
                    <CInput
                      v-model.number="policy.fim_config.max_cpu_time"
                      label="Max CPU Time"
                      placeholder="Enter a time in seconds"
                      description="Tells the host how much CPU time to give the FIM process.  Higher numbers may impact system performance."
                      :isValid="
                        validate(policy.fim_config.max_cpu_time, validations.max_cpu_time)
                      "
                      :invalidFeedback="validations.max_cpu_time.message"
                    />
                  </CCol>
                  <CCol>
                    <CInput
                      v-model.number="policy.fim_config.max_memory"
                      label="Max Memory"
                    />
                  </CCol>
                </CRow>
                <CRow>
                  <CCol>
                    <CInput
                      v-model.number="policy.fim_config.max_cache_db_size"
                      label="Max Cache DB Size"
                      placeholder="Enter a size in Mb"
                      description="The maximum size of the FIM cache database in Mb"
                    />
                  </CCol>
                  <CCol>
                    <CInput
                      v-model.number="policy.fim_config.max_cache_db_age"
                      label="Max Cache DB Age"
                      placeholder="Enter a time in hours"
                      description="The maximum age of the FIM cache database in hours"
                    />
                  </CCol>
                </CRow>
                <CRow>
                  <CCol>
                    <label>Alert on Cache Missing</label><br />
                    <CSwitch
                      :checked.sync="policy.fim_config.alert_on_cache_missing"
                      label-on="Yes"
                      label-of="No"
                      color="success"
                    /><br />
                    <span class="text-muted"
                      ><small
                        >If the FIM cache goes missing, fire an alert for further
                        investigation.</small
                      ></span
                    >
                  </CCol>
                </CRow>
              </CTab>
              <CTab
                title="Search Proxy Settings"
                v-bind:disabled="policy.roles && !policy.roles.includes('search_proxy')"
              >
                <CRow>
                  <CCol>
                    <CSelect
                      :value.sync="policy.search_proxy_config.logging_level"
                      label="Log Level"
                      placeholder="Select a logging level"
                      :options="log_levels"
                    />
                  </CCol>
                  <CCol>
                    <CInput
                      v-model.number="policy.search_proxy_config.query_timeout"
                      label="Query Timeout"
                      placeholder="Enter a time in seconds"
                      description="How long the search proxy will wait for a query to timeout"
                    />
                  </CCol>
                  <CCol>
                    <CInput
                      v-model.number="policy.search_proxy_config.max_concurrent_searches"
                      label="Max Concurrent Searches"
                      placeholder="Enter a number"
                      description="The maximum number of concurrent searches the search proxy will process"
                    />
                  </CCol>
                </CRow>
                <CRow>
                  <CCol>
                    <CInput
                      v-model.number="policy.search_proxy_config.event_wait_timeout"
                      label="Event Wait Timeout"
                      placeholder="Enter a time in seconds"
                      description="How long the search proxy will wait for an event to timeout"
                    />
                  </CCol>
                  <CCol>
                    <CInput
                      v-model.number="policy.search_proxy_config.max_results"
                      label="Max Results"
                      placeholder="Enter a number"
                      description="The maximum number of results the search proxy will return"
                    />
                  </CCol>
                </CRow>
                <CRow>
                  <CCol>
                    <CInput
                      v-model="policy.search_proxy_config.sudo_user"
                      label="Sudo User"
                      placeholder="Enter a user"
                      description="The user masquerade as when authenticating searches"
                    />
                  </CCol>
                </CRow>
                <CRow>
                  <CCol>
                    <MultiPicker
                      label="User Roles"
                      :value.sync="policy.search_proxy_config.user_roles"
                      :options="formattedRoles()"
                    />
                  </CCol>
                </CRow>
                <CRow>
                  <CCol>
                    <SelectInput
                      :options="formattedInputs()"
                      label="Target Input"
                      placeholder="Select an input"
                      :value.sync="policy.search_proxy_config.target_input"
                      description="The input which provides cluster connection information to perform searches against"
                    />
                  </CCol>
                </CRow>
                <CRow>
                  <CCol>
                    <SelectInput
                      :options="formattedCredentials('private_key')"
                      label="Signing Key"
                      placeholder="Select a signing key"
                      :value.sync="policy.search_proxy_config.credential"
                      description="The signing key to use when creating JWT auth tokens for auth proxy"
                      @search-change="searchCredentials"
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
                    <CRow>
                      <CCol><label>Description:</label> {{ policy.description }}</CCol>
                    </CRow>
                    <CRow>
                      <CCol><label>Name:</label> {{ policy.name }}</CCol>

                      <CCol><label>Priority:</label> {{ policy.priority }}</CCol>
                    </CRow>
                    <CRow>
                      <CCol
                        ><label>Roles:</label>&nbsp;
                        <li
                          style="display: inline; margin-right: 2px"
                          v-for="role in policy.roles"
                          :key="role"
                        >
                          <CBadge
                            color="secondary"
                            class="tag tag-sm"
                            style="cursor: auto"
                            size="sm"
                            disabled
                          >
                            {{
                              agent_roles.find((r) => r.value == role)
                                ? agent_roles.find((r) => r.value == role).label
                                : "Unknown: " + role
                            }}
                          </CBadge>
                        </li></CCol
                      >
                    </CRow>
                    <CRow>
                      <CCol
                        ><label>Health Check Interval:</label>
                        {{ policy.health_check_interval }}</CCol
                      >
                      <CCol
                        ><label>Log Level:</label> {{ policy.logging_level }}<br
                      /></CCol>
                    </CRow>
                    <CRow
                      ><CCol
                        ><label>Tags:</label>&nbsp;
                        <li
                          style="display: inline; margin-right: 2px"
                          v-for="tag in policy.tags"
                          :key="tag"
                        >
                          <CBadge color="secondary" class="tag tag-sm" size="sm">{{
                            tag
                          }}</CBadge>
                        </li></CCol
                      ></CRow
                    >
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
                    <label>Log Level:</label> {{ policy.poller_config.logging_level
                    }}<br />
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
                    <label>Catchup Period:</label>
                    {{ policy.detector_config.catchup_period }}<br />
                    <label>Max Threshold Events:</label>
                    {{ policy.detector_config.max_threshold_events }}<br />
                    <label>Logging Level:</label> {{ policy.detector_config.logging_level
                    }}<br />
                  </CCol>
                </CRow>
                <CRow>
                  <CCol>
                    <h5>Search Proxy Settings</h5>
                    <label>Event Wait Timeout:</label>
                    {{ policy.search_proxy_config.event_wait_timeout }}<br />
                    <label>Max Results:</label>
                    {{ policy.search_proxy_config.max_results }}<br />
                    <label>Query Timeout:</label>
                    {{ policy.search_proxy_config.query_timeout }}<br />
                    <label>Sudo User:</label>
                    {{ policy.search_proxy_config.sudo_user }}<br />
                    <label>Target Input:</label>
                    {{ policy.search_proxy_config.target_input }}<br />
                    <label>User Roles:</label>
                    {{ policy.search_proxy_config.user_roles }}<br />
                    <label>Logging Level:</label>
                    {{ policy.search_proxy_config.logging_level }}<br />
                  </CCol>
                  <CCol>
                    <h5>MITRE Mapper Settings</h5>
                    <label>Concurrent Inputs:</label>
                    {{ policy.mitre_mapper_config.concurrent_inputs }}<br />
                    <label>Mapping Refresh Interval:</label>
                    {{ policy.mitre_mapper_config.mapping_refresh_interval }}<br />
                    <label>Assessment Days:</label>
                    {{ policy.mitre_mapper_config.assessment_days }}<br />
                    <label>Timeout:</label>
                    {{ policy.mitre_mapper_config.timeout }}<br />
                    <label>Logging Level:</label>
                    {{ policy.mitre_mapper_config.logging_level }}<br />
                  </CCol>
                  <CCol>
                    <h5>File Integrity Monitoring Settings</h5>
                    <label>Max Parallel Rules:</label>
                    {{ policy.fim_config.max_parallel_rules }}<br />
                    <label>Max CPU Time:</label>
                    {{ policy.fim_config.max_cpu_time }}<br />
                    <label>Max Memory:</label>
                    {{ policy.fim_config.max_memory }}<br />
                    <label>Max Cache DB Size:</label>
                    {{ policy.fim_config.max_cache_db_size }}<br />
                    <label>Max Cache DB Age:</label>
                    {{ policy.fim_config.max_cache_db_age }}<br />
                    <label>Alert on Cache Missing:</label>
                    {{ policy.fim_config.alert_on_cache_missing }}<br />
                    <label>Wait Interval:</label>
                    {{ policy.fim_config.wait_interval }}<br />
                    <label>Logging Level:</label>
                    {{ policy.fim_config.logging_level }}<br />
                  </CCol>
                </CRow>
              </CTab> </CTabs></CCol
        ></CRow>
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

import MultiPicker from "../components/MultiPicker.vue";
import SelectInput from "../components/SelectInput.vue";
import AgentTag from '../agents/AgentTag.vue';

export default {
  name: "AgentPolicyWizard",
  components: {
    MultiPicker,
    SelectInput,
    AgentTag
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
          agent_tags: [],
          poller_config: {},
          runner_config: {},
          detector_config: {},
          mitre_mapper_config: {},
          fim_config: {},
          search_proxy_config: {},
          winlog_config: {},
          inventory_config: {}
        };
      },
    },
  },
  computed: mapState(["current_user", "organizations", "credentials", "inputs", "roles", "agent_tags", "integration_outputs"]),
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
        this.reloadData();
      }
      this.$emit("update:show", this.modalStatus);
      if (!this.modalStatus) {
        this.dismiss();
      }
    }
  },
  data() {
    return {
      tab: 0,
      error: false,
      error_message: "",
      modalStatus: this.show,
      submitted: false,
      agent_roles: [
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
        },
        {
          label: "File Integrity Monitoring",
          value: "fim",
        },
        {
          label: "Windows Log Collector",
          value: 'winlog'
        },
        {
          label: "Search Proxy",
          value: "search_proxy",
        },
      ],
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
          message: "Must be between 1 and 86400",
        },
        assessment_days: {
          min: 1,
          max: 90,
          required: true,
          type: "number",
          message: "Must be between 1 and 90",
        },
        timeout: {
          min: 1,
          max: 86400,
          required: true,
          type: "number",
          message: "Must be between 1 and 86400",
        },
        max_parallel_rules: {
          min: 1,
          max: 25,
          required: true,
          type: "number",
          message: "Must be between 1 and 25",
        },
        max_cpu_time: {
          min: 5,
          max: 60,
          required: true,
          type: "number",
          message: "Must be between 5 and 60",
        },
        inventory_collection_interval: {
          min: 300,
          max: 86400,
          required: true,
          type: "number",
          message: "Must be between 300 and 86400",
        },
        inventory_cache_expire: {
          min: 300,
          max: 86400,
          required: true,
          type: "number",
          message: "Must be between 300 and 86400",
        },
        perf_interval: {
          min: 10,
          max: 86400,
          required: true,
          type: "number",
          message: "Must be between 300 and 86400",
        },
        service_interval: {
          min: 300,
          max: 86400,
          required: true,
          type: "number",
          message: "Must be between 300 and 86400",
        },
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
    formattedInputs() {
      return this.inputs.map((i) => {
        return { label: i.name, value: i.uuid };
      });
    },
    formattedCredentials(type = null) {
      if(type) {
        return this.credentials
        .filter((c) => c.credential_type == type)
        .map((c) => {
          return { label: c.name, value: c.uuid };
        });
      }
      return this.credentials.map((c) => {
        return { label: c.name, value: c.uuid };
      });
    },
    formattedRoles() {
      return this.roles.map((r) => {
        return { label: r.name, value: r.uuid };
      });
    },
    addTag(tag) {
      this.tags.push(tag);
      this.policy.tags.push(tag);
    },
    reloadData() {
      this.getCredentials()
      this.getInputs()
      this.getRoles()
      this.getAgentTags()
      this.getConfiguredOutputs()
    },
    searchCredentials(value) {
      this.$store.dispatch("getCredentials", {organization: this.policy.organization, name__like: value})
    },
    getConfiguredOutputs(name) {
      this.$store.dispatch("getConfiguredOutputs", {organization: this.policy.organization, name__like: name})
    },
    getCredentials() {
      this.$store
        .dispatch("getCredentialList", {organization: this.policy.organization}).then(() => {
          this.policy.search_proxy_config.credential = null
        })
    },
    getInputs() {
      this.$store
        .dispatch("getInputs", {organization: this.policy.organization}).then(() => { 
          this.policy.search_proxy_config.target_input = null
        })
    },
    getRoles() {
      this.$store
        .dispatch("getRoles", {organization: this.policy.organization}).then(() => {
          this.policy.search_proxy_config.roles = []
        })
    },
    getAgentTags() {
      this.$store
        .dispatch("getAgentTags", {organization: this.policy.organization})
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
      let uuid = this.policy.uuid;
      let stripped_policy = JSON.parse(JSON.stringify(this.policy));

      let fields_to_remove = [
        "created_at",
        "created_by",
        "revision",
        "updated_at",
        "updated_by",
        "uuid",
      ];

      fields_to_remove.forEach((element) => {
        delete stripped_policy[element];
      });

      this.$store
        .dispatch("updateAgentPolicy", { uuid: uuid, data: stripped_policy })
        .then((response) => {
          this.dismiss();
        })
        .catch((error) => {
          this.error = true;
          this.error_message = error.response.data.message;
          console.log(this.policy);
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
