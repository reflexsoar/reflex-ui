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
          <button type="button" aria-label="Close" class="close" @click="dismiss()">
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
              <CTab title="Sigma Import" v-if="show_sigma">
                <h5>Sigma Configuration</h5>
                <label>Import from Sigma?</label><br />
                <CSwitch
                  :checked.sync="show_sigma"
                  label="From Sigma?"
                  label-on="Yes"
                  label-off="No"
                  color="success"
                /><br />
                <CSelect
                  label="Organization"
                  placeholder="Select an organization"
                  @change="updateOrganization"
                  v-if="current_user.permissions.view_organizations"
                  :value.sync="rule.organization"
                  :options="organizations"
                />
                <label for="input">Input</label><br />
                <multiselect
                  id="input"
                  @search-change="searchInputs"
                  v-model="rule.source"
                  placeholder="Select the input to be used for this detection"
                  track-by="uuid"
                  label="name"
                  :options="input_list"
                /><br />

                <label>Rule</label>
                <prism-editor
                  class="my-editor"
                  v-model="sigma_rule"
                  :highlight="highlighter"
                  line-numbers
                  aria-label="Sigma Rule"
                  style="height: 250px"
                ></prism-editor
                ><br />
                <CRow>
                  <CCol
                    ><CSelect
                      :value.sync="sigma_backend"
                      :options="['opensearch', 'elasticsearch']"
                      placeholder="Select a backend"
                      label="Backend"
                    ></CSelect
                  ></CCol>
                  <CCol
                    ><CSelect
                      :value.sync="sigma_pipeline"
                      :options="['ecs_windows']"
                      placeholder="Select a pipeline"
                      label="Pipeline"
                    ></CSelect
                  ></CCol>
                </CRow>
                <CButton color="primary" @click="convertRule()">Convert</CButton>
              </CTab>
              <CTab title="Details" v-if="!show_sigma">
                <h5>Rule Details</h5>
                <label>Import from Sigma?</label><br />
                <CSwitch
                  :checked.sync="show_sigma"
                  label="From Sigma?"
                  label-on="Yes"
                  label-off="No"
                  color="success"
                />
                <CSelect
                  label="Organization"
                  placeholder="Select an organization"
                  @change="updateOrganization"
                  v-if="current_user.permissions.view_organizations"
                  :value.sync="rule.organization"
                  :options="organizations"
                />
                <CInput v-model="rule.name" label="Name" placeholder="Rule Name" />
                <CTextarea
                  v-model="rule.description"
                  label="Description"
                  placeholder="A friendly description of the rule"
                  :rows="5"
                />
                <label for="input">Input</label><br />
                <multiselect
                  id="input"
                  @search-change="searchInputs"
                  v-model="rule.source"
                  placeholder="Select the input to be used for this detection"
                  track-by="uuid"
                  label="name"
                  :options="input_list"
                /><br />
                <label>Author</label>
                <multiselect
                  v-model="rule.author"
                  placeholder="Add one or more authors for this detection"
                  :taggable="true"
                  @tag="addAuthor"
                  tag-placeholder="Add new tag"
                  :options="author_list"
                  :multiple="true"
                  :close-on-select="false"
                /><br />
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
              <CTab title="Configuration" v-bind:disabled="rule.source['uuid'] === null">
                <h5>Rule Configuration</h5>
                <CRow
                  ><CCol>
                    <CSelect
                      label="Rule Type"
                      :value.sync="rule.rule_type"
                      :options="rule_types"
                    />
                  </CCol>
                  <CCol>
                    <CSelect
                      label="Rule Status"
                      :value.sync="rule.status"
                      :options="rule_statuses"
                    />
                  </CCol>
                </CRow>
                <CRow>
                  <CCol col="3">
                    <CSelect
                      label="Severity"
                      :value.sync="rule.severity"
                      :options="severities"
                      @change="setRiskScore()"
                    />
                  </CCol>
                  <CCol>
                    <div class="slidecontainer">
                      <label for="risk_score">Risk Score</label><br />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value="0"
                        id="risk_score"
                        label="Risk Score"
                        v-model="rule.risk_score"
                        class="slider"
                        @change="setSeverity()"
                      />
                    </div>
                  </CCol>
                  <CCol col="3"
                    ><CInput
                      v-model="rule.risk_score"
                      label="Risk Score"
                      placeholder="Risk Score"
                      @change="setSeverity()"
                    >
                    </CInput
                  ></CCol>
                </CRow>
                <div v-if="rule.rule_type != 6">
                  <label for="base_query">Base Query</label><br /><prism-editor
                    id="base_query"
                    class="my-editor"
                    v-model="rule.query.query"
                    :highlight="highlighter"
                    line-numbers
                    aria-label="Reflex Query"
                  ></prism-editor
                  ><br />
                </div>
                <div v-if="rule.rule_type == 1">
                  <h5>Threshold Configuration</h5>
                  <p>
                    A Threshold rule allows for alerting when the number of documents
                    exceeds or is below a threshold
                  </p>
                  <CRow>
                    <CCol>
                      <label for="key_fields">Key Fields</label><br>
                      <multiselect v-model="rule.threshold_config.key_field"
                        id="key_fields"
                        :options="threshold_key_field_options"
                        :multiple="true"
                        @tag="addThresholdKeyField"
                        :close-on-select="false"
                        :clear-on-select="false"
                        :taggable="true"
                        placeholder="Select a field"
                        style="z-index:1000"
                      />
                      <small><p class="text-muted">Optional - The field(s) to group by for the threshold</p></small>
                    </CCol>
                    <CCol col=4>
                      <CInput
                        v-model="rule.threshold_config.threshold_field"
                        label="Threshold Field"
                        description="Optional - The field to compute the threshold against"
                      />
                      
                    </CCol>
                  </CRow>
                  <CRow>
                  <CCol>
                      <CSelect
                        :value.sync="rule.threshold_config.mode"
                        label="Threshold Mode"
                        :options="['count', 'terms', 'cardinality']"
                        description="How is the threshold value determined.  count = All matching events, terms = Count per term, cardinality = unique count of terms"
                        />
                        </CCol>

                    <CCol col=2>
                      <CSelect
                        :value.sync="rule.threshold_config.operator"
                        label="Operator"
                        :options="['==', '!=', '>', '<', '>=', '<=']"
                      />
                    </CCol>
                    <CCol>
                      <CInput
                        v-model.number="rule.threshold_config.threshold"
                        v-bind:disabled="rule.threshold_config.dynamic"
                        label="Threshold"
                      />
                    </CCol>
                  </CRow>
                  <CRow>
                    <!--<CCol col="3">
                      
                      <label for="per_field">Alarm per Field Value</label><br />
                      <CSwitch
                        v-bind:disabled="rule.threshold_config.key_field == ''"
                        id="per_field"
                        label-on="Yes"
                        label-off="No"
                        color="success"
                        v-bind:checked.sync="rule.threshold_config.per_field"
                        label="Per Field"
                        description="Should the number of hits per value of the value field be compared to the threshold?"
                      /><br />
                      <small class="form-text text-muted w-100"
                        >When active, changes the group by field to count of hits per
                        distinct field value.</small>
                      
                    </CCol>-->
                    <CCol col="3">
                      <label for="dynamic_threshold">Dynamic Threshold</label><br />
                      <CSwitch
                        id="dynamic_threshold"
                        label-on="Yes"
                        label-off="No"
                        color="success"
                        v-bind:checked.sync="rule.threshold_config.dynamic"
                        label="Dynamic Threshold"
                        description="Should the detection determine a threshold automatically based on a discovery period?"
                      /><br />
                      <small class="form-text text-muted w-100"
                        >Should the detection determine a threshold automatically based on
                        a discovery period?</small
                      >
                    </CCol>
                    <CCol v-if="rule.threshold_config.dynamic">
                      <CInput
                        v-model.number="rule.threshold_config.discovery_period"
                        label="Discovery Period"
                        description="How far back to compute the threshold value (in days)"
                      />
                    </CCol>
                    <CCol v-if="rule.threshold_config.dynamic">
                      <CInput
                        v-model.number="rule.threshold_config.recalculation_period"
                        label="Recalculation Period"
                        description="How ofter to recalculate the dynamic threshold (in hours)"
                      />
                    </CCol>
                  </CRow>
                  <CRow>
                    <CCol col="3">
                      <CInput
                        v-model.number="rule.threshold_config.max_events"
                        label="Max Events"
                        description="The number of events to return when a threshold is crossed"
                      />
                    </CCol>
                  </CRow>
                </div>
                <!--<div v-else-if="rule.rule_type == 2">
                  <h5>Metric Change Configuration</h5>
                  {{ rule.metric_change_config }}
                  <CRow>
                    <CCol col="2">
                      <label for="metric_increase">Metric Increase</label><br />
                      <CSwitch
                        id="metric_increase"
                        label-on="Yes"
                        label-off="No"
                        color="success"
                        v-bind:checked.sync="rule.metric_change_config.increase"
                        label="Metric Increase"
                        description="Does this rule detect metric increases or decreases"
                      />
                    </CCol>
                    <CCol>
                      <CSelect
                        :value.sync="rule.metric_change_config.threshold_format"
                        :options="['Percentage', 'Numeric']"
                        label="Metric Format"
                      />
                    </CCol>
                    <CCol>
                      <CInput
                        v-model.number="rule.metric_change_config.threshold"
                        label="Metric Threshold"
                      />
                    </CCol>
                  </CRow>
                </div>-->
                <div v-else-if="rule.rule_type == 3">
                  <h5>Field Comparison Configuration</h5>
                  <CRow>
                    <CCol col="5">
                      <CInput
                        v-model="rule.field_mismatch_config.source_field"
                        label="Source Field"
                        placeholder="The source field to compare against"
                      />
                    </CCol>
                    <CCol col="2">
                      <CSelect
                        :value.sync="rule.field_mismatch_config.operator"
                        label="Operator"
                        :options="['==', '!=', '>', '<', '>=', '<=']"
                      />
                    </CCol>
                    <CCol col="5">
                      <CInput
                        v-model="rule.field_mismatch_config.target_field"
                        label="Target Field"
                        placeholder="The target field to compare against"
                      />
                    </CCol>
                  </CRow>
                </div>
                <div v-else-if="rule.rule_type == 4">
                  <h5>New Terms Configuration</h5>
                  <CRow>
                    <CCol col>
                      <CInput
                        v-model="rule.new_terms_config.key_field"
                        label="Terms Field"
                        placeholder="Field Name"
                        description="The field to collect terms from and observe new terms in"
                      />
                    </CCol>
                    <CCol>
                      <CInput
                        v-model.number="rule.new_terms_config.window_size"
                        label="Windows Size"
                        description="The number of days back to look for terms"
                      />
                    </CCol>
                    <CCol>
                      <CInput
                        v-model.number="rule.new_terms_config.max_terms"
                        label="Max Terms"
                        description="The maximum number of terms to return.  Too large may have performance impacts, too low may miss terms."
                      />
                    </CCol>
                  </CRow>
                </div>
                <div v-else-if="rule.rule_type == 5">
                  <h5>Indicator Match Configuration</h5>
                  <CRow>
                    <CCol col="6">
                      <CInput
                        v-model="rule.indicator_match_config.key_field"
                        label="Indicator Field"
                        placeholder="Field Name"
                        description="The field to collect the values from to compare to the Intel List"
                      />
                    </CCol>
                    <CCol col="6">
                      <label>Intel List</label><br />
                      <multiselect
                        id="intel_list"
                        v-model="exclusion.list"
                        :options="formatted_lists"
                        track-by="uuid"
                        label="name"
                        :close-on-select="true"
                        :internal-search="false"
                        :searchable="true"
                        @search-change="getIntelList"
                        @select="setList"
                      />
                    </CCol>
                  </CRow>
                </div>
                <div v-else-if="rule.rule_type == 6">
                  <h5>Data Source Monitor Configuration</h5>
                  <p>
                    Data Source Monitors are in place to detect swings in data source
                    volume. This is useful for detecting when a data source is no longer
                    sending data or when a data source is sending too much data.
                  </p>
                  <h5>Included Sources</h5>
                  <CRow>
                    <CCol>
                      <label>Datastream/Index Patterns</label><br />
                      <multiselect
                        id="source_monitor_data_sources"
                        v-model="rule.source_monitor_config.data_sources"
                        :options="[]"
                        :close-on-select="false"
                        :taggable="true"
                        :multiple="true"
                        @tag="addSourceMonitorDataSource"
                      />
                    </CCol>
                    <CCol>
                      <label>Intel Lists</label><br />
                      <multiselect
                        id="source_monitor_source_lists"
                        v-model="rule.source_monitor_config.source_lists"
                        :options="formatted_lists"
                        track-by="uuid"
                        label="name"
                        :close-on-select="false"
                        :internal-search="false"
                        :searchable="true"
                        :multiple="true"
                        @search-change="getIntelList"
                        @select="setList"
                      /><br />
                    </CCol>
                  </CRow>

                  <h5>Excluded Sources</h5>
                  <CRow>
                    <CCol>
                      <label>Excluded Datastream/Index Patterns</label><br />
                      <multiselect
                        id="source_monitor_excluded_data_sources"
                        v-model="rule.source_monitor_config.excluded_sources"
                        :options="[]"
                        :close-on-select="false"
                        :taggable="true"
                        :multiple="true"
                        @tag="addSourceMonitorExcludedDataSource"
                      />
                    </CCol>
                    <CCol>
                      <label>Excluded Intel Lists</label><br />
                      <multiselect
                        id="source_monitor_excluded_source_lists"
                        v-model="rule.source_monitor_config.excluded_source_lists"
                        :options="formatted_lists"
                        track-by="uuid"
                        label="name"
                        :close-on-select="false"
                        :internal-search="false"
                        :searchable="true"
                        :multiple="true"
                        @search-change="getIntelList"
                        @select="setList"
                      /><br />
                    </CCol>
                  </CRow>
                  <h5>Threshold Configuration</h5>
                  If the current value is
                  <b>{{ rule.source_monitor_config.operator }}</b>
                  <b>{{ rule.source_monitor_config.threshold }}</b
                  ><span v-if="rule.source_monitor_config.threshold_as_percent">%</span>
                  <span v-if="rule.source_monitor_config.delta_change"
                    >compared to <b>{{ rule.source_monitor_config.delta_window }}</b> days
                    ago,
                  </span>
                  the alert will fire.<br /><br />
                  <CRow>
                    <CCol col="2">
                      <CSelect
                        :value.sync="rule.source_monitor_config.operator"
                        label="Operator"
                        :options="['==', '!=', '>', '<', '>=', '<=']"
                      />
                    </CCol>
                    <CCol>
                      <CInput
                        v-model.number="rule.source_monitor_config.threshold"
                        label="Threshold"
                      />
                    </CCol>
                    <CCol>
                      <label>Alert on Change</label><br />
                      <CSwitch
                        :checked.sync="rule.source_monitor_config.delta_change"
                        label="Alert on Increase"
                        label-on="Yes"
                        label-off="No"
                        color="success"
                      />
                    </CCol>
                    <CCol>
                      <label>As Percentage</label><br />
                      <CSwitch
                        v-bind:disabled="!rule.source_monitor_config.delta_change"
                        :checked.sync="rule.source_monitor_config.threshold_as_percent"
                        label="As Percentage"
                        label-on="Yes"
                        label-off="No"
                        color="success"
                      />
                    </CCol>
                  </CRow>
                  <CRow v-if="rule.source_monitor_config.delta_change">
                    <CCol col="3">
                      <CInput
                        v-model.number="rule.source_monitor_config.delta_window"
                        label="Days Ago"
                        description="The number of days back to compare to"
                      />
                    </CCol>
                  </CRow>
                </div>
              </CTab>
              <CTab title="Schedule" v-bind:disabled="rule.source['uuid'] === null">
                <h5>Schedule</h5>
                <CRow>
                  <CCol>
                    <CInput
                      label="Run Interval"
                      v-model.number="rule.interval"
                      description="How often detection will run in minutes"
                    ></CInput>
                  </CCol>
                  <CCol>
                    <CInput
                      label="Lookbehind"
                      v-model.number="rule.lookbehind"
                      description="How far back the detection should look in minutes. By default the detection will look back to the last run time."
                    ></CInput>
                  </CCol>
                  <CCol>
                    <CInput
                      label="Mute Period"
                      v-model.number="rule.mute_period"
                      description="How long in minutes to mute all future hits on this detection"
                    ></CInput>
                  </CCol>
                </CRow>
                <h5>Daily Schedule</h5>
                <p>
                  Detections can be configured to run on a daily schedule. If a detection
                  is configured to run on a daily schedule, it will only run during the
                  specified time window. By default a detection will run every day from
                  00:00 to 23:59.
                </p>
                <CSelect :value.sync="rule.schedule_timezone" label="Timezone" :options="timezones" />
                <CRow>
                  <CCol>
                    <CRow v-for="(i, day) in rule.schedule" :key="day">
                      <CCol col="2">
                        <CInputCheckbox
                          :checked.sync="rule.schedule[day].active"
                          :label="day.charAt(0).toUpperCase() + day.slice(1)"
                        />
                      </CCol>
                      <CCol col="5">
                        <CInputCheckbox
                          :checked.sync="rule.schedule[day].custom"
                          label="Custom Hours"
                        />
                      </CCol>
                      <CCol>
                        <ul class="no-bullets" :hidden="!rule.schedule[day].custom">
                          <li v-for="(custom, i) in rule.schedule[day].hours">
                            <CRow>
                              <CCol>
                                <CInput
                                  v-model="rule.schedule[day].hours[i].from"
                                  :disabled="!rule.schedule[day].custom"
                                />
                              </CCol>
                              <CCol col="1"> to </CCol>
                              <CCol>
                                <CInput
                                  v-model="rule.schedule[day].hours[i].to"
                                  :disabled="!rule.schedule[day].custom"
                                >
                                  <template #append>
                                    <CButton
                                      color="danger"
                                      size="sm"
                                      v-on:click="rule.schedule[day].hours.splice(i, 1)"
                                      :disabled="
                                        !rule.schedule[day].custom ||
                                        rule.schedule[day].hours.length == 1
                                      "
                                    >
                                      -
                                    </CButton>
                                  </template>
                                </CInput>
                              </CCol>
                            </CRow>
                          </li>
                        </ul>
                      </CCol>
                      <CCol col="1">
                        <CButton
                          color="success"
                          size="sm"
                          v-on:click="
                            rule.schedule[day].hours.push({ from: '00:00', to: '23:59' })
                          "
                          :disabled="
                            !rule.schedule[day].custom ||
                            rule.schedule[day].hours.length == 5
                          "
                          :hidden="!rule.schedule[day].custom"
                        >
                          +
                        </CButton>
                      </CCol>
                    </CRow>
                  </CCol>
                </CRow><br>
                <CRow>
                  <CCol>
                    <h5>Alert Suppression</h5>
                    <p>
                      Alerts can be configured to be suppressed for a specified period of
                      time after an alert is triggered. This is useful for preventing
                      alert storms.  Alerts will be deduplicated by the event signature.
                    </p>
                    <CRow>
                      <CCol col=6>
                        <CInput
                          label="Max Events"
                          v-model.number="rule.suppression_max_events"
                          description="The maximum number of events to send during each run interval.  Default 0 "
                        ></CInput>
                      </CCol>
                    </CRow>
                  </CCol>
                </CRow>
              </CTab>
              <CTab title="Exclusions" v-bind:disabled="rule.source['uuid'] === null">
                <h5>Exclusions</h5>
                <p>
                  Exclusions allow for fine tuning a detection without modifying the
                  underlying base query
                </p>
                <CAlert color="warning"
                  ><b>NOTE:</b> If creating/editing/deleting exclusions from this window
                  you must save the detection rule when finished.</CAlert
                >
                <CDataTable
                  :items="rule.exceptions"
                  :fields="[
                    'field',
                    'condition',
                    'values',
                    { key: 'list', label: 'Intel List' },
                    { key: 'admin', label: 'Manage' },
                  ]"
                >
                  <template #admin="{ item }">
                    <td class="text-right">
                      <CButton
                        aria-label="Edit Exclusion"
                        @click="editExclusion(item.uuid)"
                        size="sm"
                        color="info"
                        v-c-tooltip="{ content: 'Edit Exclusion', placement: 'left' }"
                        ><CIcon name="cilPencil" /></CButton
                      >&nbsp;
                      <CButton
                        aria-label="Delete Exclusion"
                        @click="deleteExclusion(item.uuid)"
                        size="sm"
                        color="danger"
                        v-c-tooltip="{ content: 'Delete Exclusion', placement: 'left' }"
                        ><CIcon name="cilTrash"
                      /></CButton>
                    </td>
                  </template>
                  <template #values="{ item }">
                    <td>
                      <TagBucket :tags="item.values" label="Exclusions" />
                    </td>
                  </template>
                  <template #list="{ item }">
                    <td>
                      <span v-if="item.list && item.list.name !== null"
                        ><CBadge color="dark" size="sm" class="tag">{{
                          item.list.name
                        }}</CBadge></span
                      ><span v-else>None</span>
                    </td>
                  </template>
                </CDataTable>
                <CButton @click="createExclusion" color="success">New Exclusion</CButton>
              </CTab>
              <CTab title="Field Settings" v-bind:disabled="rule.source['uuid'] === null">
                <CRow>
                  <CCol>
                    <CRow>
                      <CCol
                        ><h5>Signature Fields</h5>
                        <p>
                          Signature fields are used to create a unique signature for each
                          hit. This is used to prevent duplicate hits from being created
                          for the same event. The order of the fields is important as it
                          will change the signature.
                        </p>
                        <CRow>
                          <CCol
                            ><multiselect
                              :options="signature_fields"
                              v-model="rule.signature_fields"
                              :taggable="true"
                              :multiple="true"
                              :close-on-select="false"
                              @tag="addSignatureField"
                              placeholder="Select or add signature fields"
                              tag-placeholder="Add a signature field" /></CCol
                          ><CCol col="2"
                            ><CButton
                              color="primary"
                              size="sm"
                              @click="cloneSignatureFields"
                              >Clone From Input</CButton
                            ></CCol
                          ></CRow
                        ><br />
                      </CCol>
                    </CRow>
                    <CRow>
                      <CCol>
                        <h5>Field Templates</h5>
                        <p>
                          Adding observable field directly on the Detection allows for
                          pulling in Observables that are otherwise not normally available
                          due to the source inputs configuration.
                        </p>
                        <p>
                          Field settings can be added to the Detection by selecting a
                          Field Template, adding individual fields to the detection or
                          both.
                        </p>
                        <multiselect
                          v-model="rule.field_templates"
                          :options="field_templates_multiselect_options"
                          :multiple="true"
                          :close-on-select="false"
                          track-by="uuid"
                          label="name"
                          :searchable="true"
                          :taggable="true" /><br
                      /></CCol>
                    </CRow>

                    <CRow>
                      <CCol> <h5>Additional Fields</h5></CCol
                      ><CCol class="text-right"
                        ><CButton @click="addObservableField()" color="success"
                          >Add Field</CButton
                        ></CCol
                      ></CRow
                    >
                  </CCol>
                </CRow>
                <CRow style="min-height: 300px; max-height: 300px; overflow: auto">
                  <CCol>
                    <CDataTable
                      :items="rule.observable_fields"
                      :fields="[
                        'field',
                        'data_type',
                        'alias',
                        'tags',
                        { key: 'tlp', label: 'TLP' },
                        { key: 'admin', label: '' },
                      ]"
                      size="sm"
                      small
                    >
                      <template #field="{ item }">
                        <td>
                          <CInput
                            size="sm"
                            v-model="item.field"
                            placeholder="Field Name"
                          />
                        </td>
                      </template>
                      <template #data_type="{ item }">
                        <td>
                          <CSelect
                            size="sm"
                            :value.sync="item.data_type"
                            :options="data_types"
                          />
                        </td>
                      </template>
                      <template #alias="{ item }">
                        <td>
                          <CInput size="sm" v-model="item.alias" placeholder="Alias" />
                        </td>
                      </template>
                      <template #tags="{ item }">
                        <td>
                          <multiselect
                            size="sm"
                            v-model="item.tags"
                            :options="tag_list"
                            @tag="addTagToField(item.tags, $event)"
                            :multiple="true"
                            :taggable="true"
                            :close-on-select="false"
                            :show-labels="false"
                            placeholder="Tags"
                          /><br />
                        </td>
                      </template>
                      <template #tlp="{ item }">
                        <td>
                          <CSelect
                            :options="[1, 2, 3, 4]"
                            :value.sync="item.tlp"
                            size="sm"
                          />
                        </td>
                      </template>
                      <template #admin="{ item }">
                        <td>
                          <CButton
                            aria-label="Delete Field"
                            @click="deleteObservableField(item)"
                            size="sm"
                            color="danger"
                            ><CIcon name="cilTrash"
                          /></CButton>
                        </td>
                      </template> </CDataTable
                  ></CCol>
                </CRow>
              </CTab>
              <CTab
                title="Meta Information"
                v-bind:disabled="rule.source['uuid'] === null"
              >
                <h5>MITRE ATT&CK</h5>
                <p>
                  Selecting MITRE ATT&CK Tactics and Techniques allows for mapping the
                  MITRE ATT&CK Matrix to easily determine detection coverage.
                </p>
                <label>MITRE Tactics</label>
                <multiselect
                  v-model="rule.tactics"
                  placeholder="Select tags to apply to this detection"
                  @select="updateTactic"
                  @remove="removeTactic"
                  :options="mitre_tactics"
                  label="name"
                  track-by="external_id"
                  :multiple="true"
                  :close-on-select="false"
                  :internal-search="false"
                  :searchable="true"
                  @search-change="searchTactic"
                  ><template slot="singleLabel" slot-scope="props"
                    ><span class="option__desc"
                      ><span class="option__title">{{ props.option.title }}</span></span
                    ></template
                  >
                  <template slot="option" slot-scope="props">
                    <div class="option__desc">
                      <span class="option__title">{{ props.option.external_id }}</span> -
                      <span class="option__small">{{ props.option.name }}</span>
                    </div>
                  </template> </multiselect
                ><br />
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
                    ><span class="option__desc"
                      ><span class="option__title">{{ props.option.title }}</span></span
                    ></template
                  >
                  <template slot="option" slot-scope="props">
                    <div class="option__desc">
                      <span class="option__title">{{ props.option.external_id }}</span> -
                      <span class="option__small">{{ props.option.name }}</span>
                    </div>
                  </template> </multiselect
                ><br />
                <h5>References</h5>
                <p>
                  References are links to useful external resources that help an analyst
                  understand the detection.
                </p>
                <CButton @click="addReference" size="sm" color="success"
                  >New Reference</CButton
                ><br /><br />
                <div v-for="(fp, i) in rule.references" :key="i">
                  <CInput v-model="rule.references[i]"
                    ><template #append
                      ><CButton @click="removeReference(i)" color="danger"
                        ><CIcon name="cilTrash" size="sm" /></CButton></template
                  ></CInput>
                </div>
              </CTab>
              <CTab title="Triage Guide" v-bind:disabled="rule.source['uuid'] === null">
                <h5>Triage Guide</h5>
                <p>
                  A triage guide helps analysts reviewing events generated from this
                  detection determine the legitimacy of the event. Being as descriptive as
                  possible will help alert consumers.
                </p>
                <editor
                  ref="triageGuideEditor"
                  :initialValue="rule.guide"
                  @change="updateTriageGuide()"
                  height="400px"
                  initialEditType="wysiwyg"
                  previewStyle="vertical"
                /><br />

                <h5>False Positives</h5>
                <p>
                  False positives are quick indicators that an analyst can use to rule out
                  false positive activity on the detection
                </p>
                <CButton @click="addFP" size="sm" color="success"
                  >New False Positive</CButton
                ><br /><br />
                <div v-for="(fp, i) in rule.false_positives" :key="i">
                  <CInput v-model="rule.false_positives[i]"
                    ><template #append
                      ><CButton @click="removeFP(i)" color="danger"
                        ><CIcon name="cilTrash" size="sm" /></CButton></template
                  ></CInput>
                </div>
              </CTab>
              <CTab title="Setup Guide" v-bind:disabled="rule.source['uuid'] === null">
                <h5>Setup Guide</h5>
                <p>
                  The setup guide is a detailed guide on how to setup the detection. This
                  is useful for alert consumers to understand how to make sure all the
                  prequisite data and configurations are in place to ensure the detection
                  works as expected.
                </p>
                <editor
                  ref="setupGuideEditor"
                  :initialValue="rule.setup_guide"
                  @change="updateSetupGuide()"
                  height="400px"
                  initialEditType="wysiwyg"
                  previewStyle="vertical"
                />
              </CTab>
              <CTab title="Testing Guide" v-bind:disabled="rule.source['uuid'] === null">
                <h5>Testing Guide</h5>
                <p>
                  The testing guide is a detailed guide on how to test the detection. This
                  is useful for alert consumers to understand how to test the detection to
                  ensure it is working as expected.
                </p>
                <editor
                  ref="testingGuideEditor"
                  :initialValue="rule.testing_guide"
                  @change="updateTestingGuide()"
                  height="400px"
                  initialEditType="wysiwyg"
                  previewStyle="vertical"
                /><br />
              </CTab>
              <CTab
                title="Testing Automation"
                v-bind:disabled="rule.source['uuid'] === null"
              >
                <h5>Test Automation</h5>
                <p>
                  When a test script is provided, the detection can be tested
                  automatically by running the <code>reflex-rule-tester</code> tool, a
                  guide on how to use this tool can be found
                  <a
                    href="https://docs.reflexsoar.com/en/latest/detections/automated-testing"
                    target="_"
                    >here</a
                  >.
                </p>
                <CTextarea
                  v-model="rule.test_script"
                  placeholder="Paste your script here"
                  rows="10"
                />
                <CRow>
                  <CCol>
                    <CSelect
                      :value.sync="rule.test_script_language"
                      :options="['python', 'powershell', 'batch', 'bash']"
                      label="Script Language"
                    />
                  </CCol>
                  <CCol>
                    <label>Safe Script</label><br />
                    <CSwitch
                      :checked.sync="rule.test_script_safe"
                      label="Safe Script"
                      color="success"
                      label-on="Yes"
                      label-off="No"
                    /><br />
                    <small class="text-muted"
                      >Is the script safe to run automatically?</small
                    >
                  </CCol>
                </CRow>
              </CTab>
              <CTab title="Email Template" v-bind:disabled="rule.source['uuid'] === null">
                <h5>Email Template</h5>
                <p>
                  The e-mail template is used to when generating an e-mail related to this
                  detection, whether manually or automatically. The template is rendered
                  using the Jinja2 templating engine.
                </p>
                <editor
                  ref="emailTemplateEditor"
                  :initialValue="rule.email_template"
                  @change="updateEmailTemplate()"
                  height="400px"
                  initialEditType="markdown"
                  previewStyle="vertical"
                /><br />
              </CTab>
              <CTab title="Review" v-bind:disabled="rule.source['uuid'] === null"
                >{{ rule }}
              </CTab>
            </CTabs>
          </CCol>
        </CRow>
      </div>
      <template #footer>
        <CButton @click="dismiss()" color="secondary">Dismiss</CButton>
        <CButton v-if="step != 0" @click="previousStep()" color="info">Previous</CButton>
        <CButton
          v-if="step != final_step"
          @click="nextStep()"
          :disabled="rule.source['uuid'] === null"
          color="primary"
          >Next</CButton
        >
        <CButton
          v-if="step == final_step && (mode == 'Create' || mode == 'Clone')"
          @click="createDetectionRule()"
          color="primary"
          :disabled="submitted"
          ><span v-if="submitted"><CSpinner size="sm" />&nbsp;</span>Create</CButton
        >
        <CButton
          v-if="step == final_step && mode == 'Edit'"
          @click="editDetectionRule()"
          color="primary"
          :disabled="submitted"
          ><span v-if="submitted"><CSpinner size="sm" />&nbsp;</span>Save</CButton
        >
      </template>
    </CModal>
    <DetectionExclusionModal
      :exclusion.sync="exclusion"
      :rule.sync="rule"
      :show.sync="show_exclusion_modal"
      :mode="exclusion_modal_mode"
    />
  </div>
</template>

<style scoped>
/* required class */
.my-editor {
  /* we dont use `language-` classes anymore so thats why we need to add background and text color manually */
  /*background: #fdfdfd;*/
  background: #0e0e0e !important;
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

.slidecontainer {
  width: 100%;
}

.slider {
  width: 100%;
}
/* optional class for removing the outline */
.prism-editor__textarea:focus {
  outline: none;
}

.modal-body {
  padding-left: 0px;
}

.full-height-table {
  height: 450px !important;
}

ul.no-bullets {
  list-style-type: none; /* Remove bullets */
  padding: 0; /* Remove padding */
  margin: 0; /* Remove margins */
}
</style>
<script>
import { uuid } from "vue-uuid";
import { vSelect } from "vue-select";
import { PrismEditor } from "vue-prism-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import "vue-prism-editor/dist/prismeditor.min.css"; // import the styles somewhere
import "prismjs/components/prism-clike";
import "prismjs/components/prism-kusto";
import "prismjs/components/prism-python";
import "prismjs/components/prism-yaml";
import "../assets/js/prism-lucene";
import "../assets/css/prism-reflex.css"; // import syntax highlighting styles
import "v-markdown-editor/dist/v-markdown-editor.css";
import "@toast-ui/editor/dist/toastui-editor.css";

import { Editor } from "@toast-ui/vue-editor";

import DetectionExclusionModal from "./DetectionExclusionModal.vue";
import ImportSigmaRuleWizard from "./detections/ImportSigmaRuleWizard.vue";
import TagBucket from "./components/TagBucket.vue";

import { mapState } from "vuex";

export default {
  components: {
    PrismEditor,
    DetectionExclusionModal,
    ImportSigmaRuleWizard,
    Editor,
    TagBucket,
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
        organization: "",
        guide: "",
        setup_guide: "",
        testing_guide: "",
        status: "Experimental",
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
    field_templates_multiselect_options: function () {
      return this.field_templates.map((o) => {
        return { name: o.name, uuid: o.uuid };
      });
    },
    selected_org: function () {
      return this.rule.organization;
    },
    formatted_lists() {
      return this.lists.map((list) => {
        return { name: list.name, uuid: list.uuid };
      });
    },
    ...mapState([
      "settings",
      "current_user",
      "input_list",
      "mitre_tactics",
      "mitre_techniques",
      "field_templates",
      "inputs",
      "lists",
    ]),
  },
  data() {
    return {
      intel_lists: [],
      rule_statuses: [
        "Experimental",
        "Draft",
        "Superceded",
        "Beta",
        "Stable",
        "Test",
        "Deprecated",
        'Production',
        "Production - Enterprise"
      ],
      tabs: [
        { name: "Overview", icon: "cil-description" },
        { name: "Configuration", icon: "cil-gear" },
        { name: "Investigation Guide", icon: "cil-book" },
        { name: "Review", icon: null },
      ],
      rule_types: [
        { label: "Match", value: 0 },
        { label: "Threshold", value: 1 },
        //{ label: "Metric Change", value: 2 },
        { label: "Field Comparison", value: 3 },
        { label: "New Terms", value: 4 },
        { label: "Indicator Match", value: 5 },
        { label: "Data Source Monitor", value: 6 },
      ],
      severities: [
        { label: "Informational", value: 0 },
        { label: "Low", value: 1 },
        { label: "Medium", value: 2 },
        { label: "High", value: 3 },
        { label: "Critical", value: 4 },
      ],
      timezones: [
        { label: "(UTC-12:00) International Date Line West", value: "Etc/GMT+12" },
        { label: "(UTC-11:00) Coordinated Universal Time-11", value: "Etc/GMT+11" },
        { label: "(UTC-10:00) Hawaii", value: "Pacific/Honolulu" },
        { label: "(UTC-09:00) Alaska", value: "America/Anchorage" },
        { label: "(UTC-08:00) Baja California", value: "America/Santa_Isabel" },
        { label: "(UTC-08:00) Pacific Time (US and Canada)", value: "America/Los_Angeles" },
        { label: "(UTC-07:00) Chihuahua, La Paz, Mazatlan", value: "America/Chihuahua" },
        { label: "(UTC-07:00) Arizona", value: "America/Phoenix" },
        { label: "(UTC-07:00) Mountain Time (US and Canada)", value: "America/Denver" },
        { label: "(UTC-06:00) Central America", value: "America/Guatemala" },
        { label: "(UTC-06:00) Central Time (US and Canada)", value: "America/Chicago" },
        { label: "(UTC-06:00) Saskatchewan", value: "America/Regina" },
        { label: "(UTC-06:00) Guadalajara, Mexico City, Monterey", value: "America/Mexico_City" },
        { label: "(UTC-05:00) Bogota, Lima, Quito", value: "America/Bogota" },
        { label: "(UTC-05:00) Indiana (East)", value: "America/Indiana/Indianapolis" },
        { label: "(UTC-05:00) Eastern Time (US and Canada)", value: "America/New_York" },
        { label: "(UTC-04:30) Caracas", value: "America/Caracas" },
        { label: "(UTC-04:00) Atlantic Time (Canada)", value: "America/Halifax" },
        { label: "(UTC-04:00) Asuncion", value: "America/Asuncion" },
        { label: "(UTC-04:00) Georgetown, La Paz, Manaus, San Juan", value: "America/La_Paz" },
        { label: "(UTC-04:00) Cuiaba", value: "America/Cuiaba" },
        { label: "(UTC-04:00) Santiago", value: "America/Santiago" },
        { label: "(UTC-03:30) Newfoundland", value: "America/St_Johns" },
        { label: "(UTC-03:00) Brasilia", value: "America/Sao_Paulo" },
        { label: "(UTC-03:00) Greenland", value: "America/Godthab" },
        { label: "(UTC-03:00) Cayenne, Fortaleza", value: "America/Cayenne" },
        { label: "(UTC-03:00) Buenos Aires", value: "America/Argentina/Buenos_Aires" },
        { label: "(UTC-03:00) Montevideo", value: "America/Montevideo" },
        { label: "(UTC-02:00) Coordinated Universal Time-2", value: "Etc/GMT+2" },
        { label: "(UTC-01:00) Cape Verde", value: "Atlantic/Cape_Verde" },
        { label: "(UTC-01:00) Azores", value: "Atlantic/Azores" },
        { label: "(UTC+00:00) Casablanca", value: "Africa/Casablanca" },
        { label: "(UTC+00:00) Monrovia, Reykjavik", value: "Atlantic/Reykjavik" },
        { label: "(UTC+00:00) Dublin, Edinburgh, Lisbon, London", value: "Europe/London" },
        { label: "(UTC+00:00) Coordinated Universal Time", value: "Etc/GMT" },
        { label: "(UTC+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna", value: "Europe/Berlin" },
        { label: "(UTC+01:00) Brussels, Copenhagen, Madrid, Paris", value: "Europe/Paris" },
        { label: "(UTC+01:00) West Central Africa", value: "Africa/Lagos" },
        { label: "(UTC+01:00) Belgrade, Bratislava, Budapest, Ljubljana, Prague", value: "Europe/Budapest" },
        { label: "(UTC+01:00) Sarajevo, Skopje, Warsaw, Zagreb", value: "Europe/Warsaw" },
        { label: "(UTC+01:00) Windhoek", value: "Africa/Windhoek" },
        { label: "(UTC+02:00) Athens, Bucharest, Istanbul", value: "Europe/Istanbul" },
        { label: "(UTC+02:00) Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius", value: "Europe/Kiev" },
        { label: "(UTC+02:00) Cairo", value: "Africa/Cairo" },
        { label: "(UTC+02:00) Damascus", value: "Asia/Damascus" },
        { label: "(UTC+02:00) Amman", value: "Asia/Amman" },
        { label: "(UTC+02:00) Harare, Pretoria", value: "Africa/Johannesburg" },
        { label: "(UTC+02:00) Jerusalem", value: "Asia/Jerusalem" },
        { label: "(UTC+02:00) Beirut", value: "Asia/Beirut" },
        { label: "(UTC+03:00) Baghdad", value: "Asia/Baghdad" },
        { label: "(UTC+03:00) Minsk", value: "Europe/Minsk" },
        { label: "(UTC+03:00) Kuwait, Riyadh", value: "Asia/Riyadh" },
        { label: "(UTC+03:00) Nairobi", value: "Africa/Nairobi" },
        { label: "(UTC+03:30) Tehran", value: "Asia/Tehran" },
        { label: "(UTC+04:00) Moscow, St. Petersburg, Volgograd", value: "Europe/Moscow" },
        { label: "(UTC+04:00) Tbilisi", value: "Asia/Tbilisi" },
        { label: "(UTC+04:00) Yerevan", value: "Asia/Yerevan" },
        { label: "(UTC+04:00) Abu Dhabi, Muscat", value: "Asia/Dubai" },
        { label: "(UTC+04:00) Baku", value: "Asia/Baku" },
        { label: "(UTC+04:00) Port Louis", value: "Indian/Mauritius" },
        { label: "(UTC+04:30) Kabul", value: "Asia/Kabul" },
        { label: "(UTC+05:00) Tashkent", value: "Asia/Tashkent" },
        { label: "(UTC+05:00) Islamabad, Karachi", value: "Asia/Karachi" },
        { label: "(UTC+05:30) Sri Jayewardenepura Kotte", value: "Asia/Colombo" },
        { label: "(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi", value: "Asia/Kolkata" },
        { label: "(UTC+05:45) Kathmandu", value: "Asia/Kathmandu" },
        { label: "(UTC+06:00) Astana", value: "Asia/Almaty" },
        { label: "(UTC+06:00) Dhaka", value: "Asia/Dhaka" },
        { label: "(UTC+06:00) Yekaterinburg", value: "Asia/Yekaterinburg" },
        { label: "(UTC+06:30) Yangon", value: "Asia/Yangon" },
        { label: "(UTC+07:00) Bangkok, Hanoi, Jakarta", value: "Asia/Bangkok" },
        { label: "(UTC+07:00) Novosibirsk", value: "Asia/Novosibirsk" },
        { label: "(UTC+08:00) Krasnoyarsk", value: "Asia/Krasnoyarsk" },
        { label: "(UTC+08:00) Ulaanbaatar", value: "Asia/Ulaanbaatar" },
        { label: "(UTC+08:00) Beijing, Chongqing, Hong Kong, Urumqi", value: "Asia/Shanghai" },
        { label: "(UTC+08:00) Perth", value: "Australia/Perth" },
        { label: "(UTC+08:00) Kuala Lumpur, Singapore", value: "Asia/Singapore" },
        { label: "(UTC+08:00) Taipei", value: "Asia/Taipei" },
        { label: "(UTC+09:00) Irkutsk", value: "Asia/Irkutsk" },
        { label: "(UTC+09:00) Seoul", value: "Asia/Seoul" },
        { label: "(UTC+09:00) Osaka, Sapporo, Tokyo", value: "Asia/Tokyo" },
        { label: "(UTC+09:30) Darwin", value: "Australia/Darwin" },
        { label: "(UTC+09:30) Adelaide", value: "Australia/Adelaide" },
        { label: "(UTC+10:00) Hobart", value: "Australia/Hobart" },
        { label: "(UTC+10:00) Yakutsk", value: "Asia/Yakutsk" },
        { label: "(UTC+10:00) Brisbane", value: "Australia/Brisbane" },
        { label: "(UTC+10:00) Guam, Port Moresby", value: "Pacific/Port_Moresby" },
        { label: "(UTC+10:00) Canberra, Melbourne, Sydney", value: "Australia/Sydney" },
        { label: "(UTC+11:00) Vladivostok", value: "Asia/Vladivostok" },
        { label: "(UTC+11:00) Solomon Islands, New Caledonia", value: "Pacific/Guadalcanal" },
        { label: "(UTC+12:00) Coordinated Universal Time+12", value: "Etc/GMT-12" },
        { label: "(UTC+12:00) Fiji, Marshall Islands", value: "Pacific/Fiji" },
        { label: "(UTC+12:00) Magadan", value: "Asia/Magadan" },
        { label: "(UTC+12:00) Auckland, Wellington", value: "Pacific/Auckland" },
        { label: "(UTC+13:00) Nuku'alofa", value: "Pacific/Tongatapu" },
        { label: "(UTC+13:00) Samoa", value: "Pacific/Apia" }
      ],
      techniques: [],
      tactics: [],
      error: false,
      error_message: "",
      submitted: false,
      step: 0,
      final_step: 11,
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
      author_list: [],
      short_names: [],
      show_exclusion_modal: false,
      exclusion_modal_mode: "Create",
      exclusion: {},
      show_sigma: false,
      saved_step: 0,
      sigma_rule: "",
      sigma_backend: "",
      sigma_pipeline: "",
      observable_fields: [],
      threshold_key_field_options: [],
      data_types: [
        "url",
        "user",
        "sid",
        "sha256hash",
        "sha1hash",
        "process",
        "port",
        "pid",
        "md5hash",
        "mac",
        "ip",
        "imphash",
        "host",
        "generic",
        "fqdn",
        "filepath",
        "email_subject",
        "email",
        "domain",
        "detection_id",
        "command",
      ],
      signature_fields: [],
      source_monitor_excluded_sources: [],
      daily_schedule: false,
      schedule: this.defaultSchedule(),
    };
  },
  watch: {
    show: function () {
      if (this.show) {
        if (this.rule.organization) {
          this.$store.dispatch("getInputList", { organization: this.rule.organization });
        } else {
          this.$store.dispatch("getInputList", {
            organization: this.current_user.organization,
          });
        }
      }
      this.error = false;
      this.error_message = "";
      if (this.mode == "Edit") {
        if (this.rule.monday === undefined) {
          this.rule.schedule = this.defaultSchedule();
        }
        if (this.rule.testing_guide) {
          this.$refs.testingGuideEditor.invoke("setMarkdown", this.rule.testing_guide);
        } else {
          this.$refs.testingGuideEditor.invoke("setMarkdown", "");
        }
        if (this.rule.guide) {
          this.$refs.triageGuideEditor.invoke("setMarkdown", this.rule.guide);
        } else {
          this.$refs.triageGuideEditor.invoke("setMarkdown", "");
        }
        if (this.rule.setup_guide) {
          this.$refs.setupGuideEditor.invoke("setMarkdown", this.rule.setup_guide);
        } else {
          this.$refs.setupGuideEditor.invoke("setMarkdown", "");
        }
        if (this.rule.email_template) {
          this.$refs.emailTemplateEditor.invoke("setMarkdown", this.rule.email_template);
        } else {
          this.$refs.emailTemplateEditor.invoke("setMarkdown", "");
        }
        this.$store
          .dispatch("getFieldTemplates", { organization: this.rule.organization })
          .then(() => {
            if (this.rule.field_templates) {
              let template_ids = Object.assign([], this.rule.field_templates);
              this.rule.field_templates = this.field_templates
                .map((o) => {
                  return { name: o.name, uuid: o.uuid };
                })
                .filter((o) => {
                  return template_ids.includes(o.uuid);
                });
            }
          });
        if (this.rule.threshold_config.key_field) {
          this.threshold_key_field_options = this.rule.threshold_config.key_field
        }

        if (this.rule.tags) {
          this.tag_list = this.rule.tags.map((o) => {
            return o;
          });
        }

        if (this.rule.author) {
          this.author_list = this.rule.author.map((o) => {
            return o;
          });
        }

        if (this.rule.signature_fields) {
          this.signature_fields = this.rule.signature_fields;
        }

        this.step = 0;
      }

      if (this.mode == "Clone") {
        this.step = 0;
        [
          "assigned_agent",
          "created_at",
          "created_by",
          "detection_id",
          "last_hit",
          "last_run",
          "query_time_taken",
          "time_taken",
          "total_hits",
          "updated_at",
          "updated_by",
          "uuid",
          "version",
          "warnings",
          "field_templates",
          "from_repo_sync",
          "original_uuid",
          "repository",
          "assess_rule",
        ].forEach((k) => {
          delete this.rule[k];
        });
      }

      if (this.mode == "Create") {
        this.$store.commit("save_field_templates", []);
        if (this.current_user.default_org) {
          this.rule.organization = this.current_user.organization;
        }
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
    addSourceMonitorDataSource(l) {
      if (this.rule.source_monitor_config.data_sources) {
        this.$set(this.rule.source_monitor_config, "data_sources", [
          ...this.rule.source_monitor_config.data_sources,
          l,
        ]);
      } else {
        this.$set(this.rule.source_monitor_config, "data_sources", [l]);
      }
    },
    addSourceMonitorExcludedDataSource(l) {
      if (this.rule.source_monitor_config.excluded_sources) {
        this.$set(this.rule.source_monitor_config, "excluded_sources", [
          ...this.rule.source_monitor_config.excluded_sources,
          l,
        ]);
      } else {
        this.$set(this.rule.source_monitor_config, "excluded_sources", [l]);
      }
    },
    setSourceMonitorSources(l) {
      if (this.rule.source_monitor_config.source_lists) {
        this.$set(this.rule.source_monitor_config, "source_lists", [
          ...this.rule.source_monitor_config.source_lists,
          l,
        ]);
      } else {
        this.$set(this.rule.source_monitor_config, "source_lists", [l]);
      }
    },
    setSourceMonitorExcludedSources(l) {
      if (this.rule.source_monitor_config.excluded_source_lists) {
        this.$set(this.rule.source_monitor_config, "excluded_source_lists", [
          ...this.rule.source_monitor_config.excluded_source_lists,
          l,
        ]);
      } else {
        this.$set(this.rule.source_monitor_config, "excluded_source_lists", [l]);
      }
    },
    setList(list) {
      this.rule.indicator_match_config.intel_list = list;
    },
    getIntelList(search = null) {
      this.$store.dispatch("getLists", {
        organization: this.rule.organization,
        name__like: search,
      });
    },
    updateSelectedTemplates(t) {
      this.rule.field_templates.push({ name: t.name, uuid: t.uuid });
    },
    setRiskScore() {
      if (this.rule.severity == 0 ) {
        this.rule.risk_score = 0;
      } else if (this.rule.severity == 1) {
        this.rule.risk_score = 1;
      } else if (this.rule.severity == 2) {
        this.rule.risk_score = 30;
      } else if (this.rule.severity == 3) {
        this.rule.risk_score = 60;
      } else if (this.rule.severity == 4) {
        this.rule.risk_score = 90;
      }
    },
    setSeverity() {
      if (this.rule.risk_score == 0) {
        this.rule.severity = 0;
      } else if (this.rule.risk_score <= 29) {
        this.rule.severity = 1;
      } else if (this.rule.risk_score <= 59 && this.rule.risk_score >= 30) {
        this.rule.severity = 2;
      } else if (this.rule.risk_score <= 89 && this.rule.risk_score >= 60) {
        this.rule.severity = 3;
      } else {
        this.rule.severity = 4;
      }
      this.rule.risk_score = parseInt(this.rule.risk_score);
    },
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
      return highlight(code, languages.lucene);
    },
    addFP() {
      if (this.rule.false_positives && this.rule.false_positives.length > 0) {
        this.rule.false_positives.push("");
      } else {
        this.rule.false_positives = [""];
      }
    },
    removeFP(id) {
      this.rule.false_positives.splice(id, 1);
    },
    addReference() {
      if (this.rule.references && this.rule.references.length > 0) {
        this.rule.references.push("");
      } else {
        this.rule.references = [""];
      }
    },
    removeReference(id) {
      this.rule.references.splice(id, 1);
    },
    createExclusion() {
      this.exclusion = {
        description: "",
        condition: "is",
        values: [],
        field: "",
        uuid: uuid.v4(),
        list: null,
      };
      this.exclusion_modal_mode = "Create";
      this.show_exclusion_modal = true;
    },
    editExclusion(uuid) {
      this.exclusion = this.rule.exceptions.find((exclusion) => exclusion.uuid === uuid);
      this.exclusion_modal_mode = "Edit";
      this.show_exclusion_modal = true;
    },
    deleteExclusion(uuid) {
      this.rule.exceptions = this.rule.exceptions.filter(
        (exclusions) => exclusions.uuid !== uuid
      );
    },
    addObservableField() {
      if (this.rule.observable_fields == null) {
        this.$set(this.rule, "observable_fields", []);
      }
      if (this.rule.observable_fields && this.rule.observable_fields.length > 0) {
        this.rule.observable_fields.splice(0, 0, {
          field: "",
          data_type: "",
          alias: "",
          tags: [],
          tlp: 1,
        });
      } else {
        this.rule.observable_fields.splice(0, 0, {
          field: "",
          data_type: "",
          alias: "",
          tags: [],
          tlp: 1,
        });
      }
    },
    deleteObservableField(item) {
      let id = this.rule.observable_fields.indexOf(item);
      this.rule.observable_fields.splice(id, 1);
    },
    testDetectionRule() {},
    createDetectionRule() {

      /* Checks for rules being null and sets them to empty arrays */
      if(this.rule.tactics === null) {
        this.rule.tactics = []
      }
      if(this.rule.techniques === null) {
        this.rule.techniques = []
      }
      if(this.rule.references === null) {
        this.rule.references = []
      }
      if(this.rule.false_positives === null) {
        this.rule.false_positives = []
      }

      this.rule.tactics = this.rule.tactics.map((tactic) => {
        return {
          mitre_id: tactic.mitre_id,
          external_id: tactic.external_id,
          name: tactic.name,
          shortname: tactic.shortname,
        };
      });

      this.rule.techniques = this.rule.techniques.map((technique) => {
        return {
          mitre_id: technique.mitre_id,
          external_id: technique.external_id,
          name: technique.name,
        };
      });

      this.rule.risk_score = parseInt(this.rule.risk_score);

      if (this.rule.threshold_config.threshold) {
        this.rule.threshold_config.threshold = parseInt(
          this.rule.threshold_config.threshold
        );
      }

      if (this.rule.new_terms_config.max_terms) {
        this.rule.new_terms_config.max_terms = parseInt(
          this.rule.new_terms_config.max_terms
        );
      }

      if (this.rule.new_terms_config.window_size) {
        this.rule.new_terms_config.window_size = parseInt(
          this.rule.new_terms_config.window_size
        );
      }

      if (this.rule.interval) {
        this.rule.interval = parseInt(this.rule.interval);
      }

      if (this.rule.lookbehind) {
        this.rule.lookbehind = parseInt(this.rule.lookbehind);
      }

      if (this.rule.mute_period) {
        this.rule.mute_period = parseInt(this.rule.mute_period);
      }

      if (this.rule.field_templates) {
        this.rule.field_templates = this.rule.field_templates.map((template) => {
          return template.uuid;
        });
      }

      this.rule = this.removeNulls(this.rule);

      this.submitted = true;
      this.$store
        .dispatch("createDetection", this.rule)
        .then((resp) => {
          this.submitted = false;
          this.dismiss();
        })
        .catch((err) => {
          this.submitted = false;
          this.error = true;
          this.error_message = err.response.data.message;
          if (err.response.data.errors) {
            let errors = [];
            this.error_message += ": ";
            for (let e in err.response.data.errors) {
              errors.push(err.response.data.errors[e]);
            }
            this.error_message += errors.join(", ");
          }
        });
    },
    removeNulls(obj) {
      const isArray = Array.isArray(obj);
      for (const k of Object.keys(obj)) {
        if (obj[k] === null) {
          if (isArray) {
            obj.splice(k, 1);
          } else {
            delete obj[k];
          }
        } else if (typeof obj[k] === "object") {
          this.removeNulls(obj[k]);
        }
        if (isArray && obj.length === k) {
          this.removeNulls(obj);
        }
      }
      return obj;
    },
    editDetectionRule() {
      if (this.rule.tactics) {
        this.rule.tactics = this.rule.tactics.map((tactic) => {
          return {
            mitre_id: tactic.mitre_id,
            external_id: tactic.external_id,
            name: tactic.name,
            shortname: tactic.shortname,
          };
        });
      }

      if (this.rule.techniques) {
        this.rule.techniques = this.rule.techniques.map((technique) => {
          return {
            mitre_id: technique.mitre_id,
            external_id: technique.external_id,
            name: technique.name,
          };
        });
      }

      if (this.rule.field_templates) {
        this.rule.field_templates = this.rule.field_templates.map((template) => {
          return template.uuid;
        });
      }

      this.rule.risk_score = parseInt(this.rule.risk_score);

      this.submitted = true;
      this.$store
        .dispatch("updateDetection", { uuid: this.rule.uuid, data: this.rule })
        .then((resp) => {
          this.submitted = false;
          this.dismiss();
        })
        .catch((err) => {
          this.submitted = false;
          console.log(err);
        });
    },
    nextStep() {
      this.step += 1;
    },
    previousStep() {
      this.step -= 1;
    },
    loadMITRETactics() {},
    searchTactic(external_id) {
      this.$store.dispatch("getMitreTactics", {
        external_id__like: external_id,
        name__like: external_id,
      });
    },
    findTechnique(external_id) {
      /* Return a list of techniques from the API based on the tactics that are currently selected */
      let phase_names = [];
      if (this.rule.tactics.length > 0) {
        phase_names = this.rule.tactics.map((t) => {
          return t.shortname;
        });
      }
      this.$store.dispatch("getMitreTechniques", {
        external_id__like: external_id,
        name__like: external_id,
        phase_names: phase_names,
      });
    },
    searchInputs(name) {
      this.$store.dispatch("getInputList", {
        organization: this.agent.organization,
        name: name,
      });
    },
    loadData() {
      this.$store.dispatch("getCases", {}).then((resp) => {
        this.cases = this.$store.getters.cases;
      });
    },
    reset() {
      this.sigma_rule = "";
      this.sigma_backend = "";
      this.sigma_pipeline = "";
      this.observable_fields = [];
      this.show_sigma = false;
    },
    dismiss() {
      this.step = 0;
      this.error = false;
      this.error_message = null;
      this.reset();
      this.modalStatus = false;
    },
    addTag(newTag) {
      const t = {
        name: newTag,
        uuid: "",
      };
      if (this.rule.tags) {
        this.rule.tags.push(t.name);
      } else {
        this.rule.tags = [t.name];
      }

      this.tag_list.push(t.name);
    },
    addAuthor(newAuthor) {
      const t = {
        name: newAuthor,
        uuid: "",
      };

      if (this.rule.author) {
        this.$set(this.rule, "author", [...this.rule.author, t.name])
      } else {
        this.$set(this.rule, "author", [t.name])
      }

      this.author_list.push(t.name);
    },
    addTagToField(field, t) {
      if (field) {
        field.push(t);
      } else {
        field.push(t);
      }
      this.tag_list.push(t);
    },
    addSignatureField(t) {
      if (this.rule.signature_fields) {
        this.$set(this.rule, "signature_fields", [...this.rule.signature_fields, t]);
      } else {
        this.rule.signature_fields = [t];
      }
      this.signature_fields.push(t);
    },
    cloneSignatureFields() {
      let source_input = this.input_list.find((i) => i.uuid === this.rule.source.uuid);
      if (source_input !== undefined) {
        if (this.rule.signature_fields === undefined) {
          this.$set(this.rule, "signature_fields", []);
        }
        this.rule.signature_fields = source_input.signature_fields;
      }
    },
    updateTactic(tactic) {
      if (!this.short_names.includes(tactic.shortname)) {
        this.short_names.push(tactic.shortname);
      }
      this.$store.dispatch("getMitreTechniques", { phase_names: this.short_names });
    },
    removeTactic(tactic) {
      if (this.short_names.includes(tactic.shortname)) {
        this.short_names = this.short_names.filter((t) => t !== tactic.shortname);
      }
      this.$store.dispatch("getMitreTechniques", { phase_names: this.short_names });
    },
    addTechnique(technique) {},
    updateOrganization() {
      this.$store.dispatch("getInputList", { organization: this.rule.organization });
      this.getIntelList();
      this.$store.dispatch("getFieldTemplates", { organization: this.rule.organization });
      this.rule.source = { uuid: null };
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
    toggleSigma() {
      this.show_sigma = !this.show_sigma;

      if (this.show_sigma) {
        this.saved_step = this.step;
        this.final_step += 1;
      } else {
        this.step = this.saved_step;
        this.final_step -= 1;
      }
    },
    updateTestingGuide(field) {
      this.rule.testing_guide = this.$refs.testingGuideEditor.invoke("getMarkdown");
    },
    updateTriageGuide() {
      this.rule.guide = this.$refs.triageGuideEditor.invoke("getMarkdown");
    },
    updateSetupGuide() {
      this.rule.setup_guide = this.$refs.setupGuideEditor.invoke("getMarkdown");
    },
    updateEmailTemplate() {
      this.rule.email_template = this.$refs.emailTemplateEditor.invoke("getMarkdown");
    },
    convertRule() {
      let data = {
        sigma_rule: encodeURIComponent(this.sigma_rule),
        backend: this.sigma_backend,
        pipeline: this.sigma_pipeline,
      };
      let organization = this.rule.organization;
      let source = this.rule.source;
      this.$store
        .dispatch("importSigmaRule", data)
        .then((response) => {
          this.rule = Object.assign(this.rule, response.data);
          this.rule.organization = organization;
          this.rule.source = source;
          this.show_sigma = false;
          this.error = false;
          this.error_message = "";
          this.setRiskScore();
          this.setSeverity();
        })
        .catch((error) => {
          this.error = true;
          this.error_message = error.response.data.message;
        });
    },
    addThresholdKeyField(event) {
      console.log(event)
      if (this.rule.threshold_config.key_field) {
        this.$set(this.rule.threshold_config, "key_field", [
          ...this.rule.threshold_config.key_field,
          event,
        ]);
      } else {
        this.$set(this.rule.threshold_config, "key_field", [""]);
      }

      this.threshold_key_field_options.push(event)
    },
    defaultSchedule() {
      return {
        monday: {
          active: true,
          custom: false,
          hours: [{ from: "00:00", to: "23:59" }],
        },
        tuesday: {
          active: true,
          custom: false,
          hours: [{ from: "00:00", to: "23:59" }],
        },
        wednesday: {
          active: true,
          custom: false,
          hours: [{ from: "00:00", to: "23:59" }],
        },
        thursday: {
          active: true,
          custom: false,
          hours: [{ from: "00:00", to: "23:59" }],
        },
        friday: {
          active: true,
          custom: false,
          hours: [{ from: "00:00", to: "23:59" }],
        },
        saturday: {
          active: true,
          custom: false,
          hours: [{ from: "00:00", to: "23:59" }],
        },
        sunday: {
          active: true,
          custom: false,
          hours: [{ from: "00:00", to: "23:59" }],
        },
      };
    },
  },
};
</script>
