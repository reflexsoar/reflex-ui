<template>
  <div>
    <link
      rel="stylesheet"
      href="https://unpkg.com/vue-multiselect@2.1.0/dist/vue-multiselect.min.css"
    />
    <CRow
      ><CCol xs="12" lg="12">
        <h2 id="detections-page-header">
          <CBadge color="primary">BETA</CBadge>&nbsp;Detection Management&nbsp;<button
            type="button"
            class="kb"
            onclick="window.open('https://docs.reflexsoar.com/en/latest/detections')"
          >
            <CIcon name="cil-book" size="lg" />
          </button>
        </h2>
        <br />
        <CAlert :show.sync="alert.show" :color="alert.type" closeButton>
          {{ alert.message }}
        </CAlert>
        <CAlert :show="true" color="info"
          ><b>Beta Feature</b>: This feature is in beta and requires a specific agent
          version and API version.</CAlert
        >
        <span v-if="current_tab == 0"></span>
        <CCard>
          <CCardBody class="tabbed">
            <CTabs :activeTab.sync="current_tab">
              <CTab title="Detection Rules" active>
                <DetectionsFilterMenu
                  :total_detections="filtered_items.length"
                  @filter_changed="getDetections()"
                ></DetectionsFilterMenu>
                <CRow style="padding: 10px">
                  <CCol>
                    <CButton
                      v-if="current_user.role.permissions['create_detection']"
                      color="primary"
                      size="sm"
                      @click="createDetectionModal()"
                      >New Detection</CButton
                    >
                  </CCol>
                  <CCol col="11" class="text-right">
                    <CDropdown color="secondary" toggler-text="Bulk Actions" size="sm">
                     <CDropdownItem
                        @click="selectAllByFilter()"
                        >Select All {{ total_items }} Detections</CDropdownItem>
                        <CDropdownItem
                        @click="clearSelection()"
                        >Clear Selection</CDropdownItem>
                      <CDropdownDivider></CDropdownDivider>
                      <CDropdownItem
                        v-bind:disabled="selected_items.length == 0"
                        @click="enableDetections()"
                        ><CIcon name="cilCheck" />&nbsp;&nbsp;Enable
                        {{ selected_items.length }} Detections</CDropdownItem
                      >
                      <CDropdownItem
                        v-bind:disabled="selected_items.length == 0"
                        @click="disableDetections()"
                        ><CIcon name="cilBan" />&nbsp;&nbsp;Disable
                        {{ selected_items.length }} Detections</CDropdownItem
                      >
                      <CDropdownItem
                        v-bind:disabled="selected_items.length == 0"
                        @click="assessDetections()"
                        ><i class="fas fa-flag"/>&nbsp;&nbsp;Assess
                        {{ selected_items.length }} Detections</CDropdownItem
                      >
                      <CDropdownItem
                          aria-label="Clear Warnings"
                          @click="clearWarnings()"
                          size="sm"
                          color="success"
                          v-bind:disabled="selected_items.length == 0"
                          v-c-tooltip="{ content: 'Clear Warnings', placement: 'left' }"
                        ><i class="fas fa-soap" />&nbsp;&nbsp;Clear Warnings</CDropdownItem>
                      <CDropdownItem
                        v-bind:disabled="selected_items.length == 0"
                        @click="addToRepository()"
                        ><CIcon name="cilStorage" size="sm"></CIcon>&nbsp;&nbsp;Add to
                        Repository</CDropdownItem
                      >
                      <CDropdownItem
                        v-bind:disabled="selected_items.length == 0"
                        @click="removeFromRepository()"
                        ><CIcon name="cilStorage" size="sm"></CIcon>&nbsp;&nbsp;Remove from
                        Repository</CDropdownItem
                      >
                      <CDropdownItem
                        v-bind:disabled="selected_items.length == 0"
                        @click="exportDetections()"
                        ><i class="fas fa-file-export" />&nbsp;&nbsp;Export
                        {{ selected_items.length }} Detections</CDropdownItem
                      >
                      <CDropdownItem @click="import_wizard = !import_wizard"
                        ><i class="fas fa-file-import" />&nbsp;&nbsp;Import
                        Detections</CDropdownItem
                      >
                      <CDropdownDivider></CDropdownDivider>
                       
                      <CDropdownItem
                        v-bind:disabled="selected_items.length == 0"
                        @click="deleteDetectionModal()"
                        ><CIcon name="cilTrash" size="sm" />&nbsp;Delete
                        {{ selected_items.length }} Detections</CDropdownItem
                      >
                    </CDropdown>
                  </CCol>
                </CRow>
                <CDataTable
                  :items="filtered_items"
                  :fields="detection_list_fields"
                  :items-per-page="10"
                  :sorter="{ external: true, resetable: true }"
                  :sorterValue.sync="sorter_value"
                  :loading="loading"
                  style="border-top: 1px solid #cfcfcf"
                  :responsive="false"
                >
                  <template #organization-filter="{ item }">
                    <RMultiCheck
                      :items="organizations_pick_list"
                      @checked="set_picker_filters($event, 'organization')"
                      size="sm"
                    ></RMultiCheck>
                  </template>
                  <template #status="{ item }">
                    <td>
                      <CBadge class="tag tag-sm" color="info" v-if="item.status">{{
                        item.status
                      }}</CBadge
                      ><CBadge class="tag tag-sm" color="danger" v-else>Unknown</CBadge>
                    </td>
                  </template>
                  <template #select-header="{ item }">
                    <span style="text-align: center">
                      <input
                        type="checkbox"
                        :checked="selected_items.length > 0"
                        @click="selectAll()"
                        style="margin-left: 7px"
                    /></span>
                  </template>
                  <template #select="{ item }">
                    <td style="text-align: center">
                      <input
                        type="checkbox"
                        :checked="item_is_selected(item.uuid)"
                        @click="select_item(item.uuid)"
                      />
                    </td>
                  </template>
                  <template #name="{ item }">
                    <td>
                      <CRow>
                        <CCol>
                          <CBadge class="tag tag-sm" color="success" v-if="item.active"
                            >Active</CBadge
                          ><CBadge class="tag tag-sm" color="danger" v-else
                            >Inactive</CBadge
                          >&nbsp;<b>{{ item.name }}</b>
                        </CCol>
                        <CCol col="3">
                          <div style="display: inline-block; padding-right: 2px">
                            <TagBucket
                              v-if="item.tags && item.tags.length > 0"
                              :tags="item.tags"
                            />
                          </div>
                          <div style="display: inline-block">
                            <DetectionRepoPopover
                              v-if="item.repository && item.repository.length > 0"
                              :repositories="item.repository"
                            />
                          </div>
                          <div v-if="item.assess_rule" style="display: inline-block; padding-left: 2px;">
                            <TagBucket iconName="cil-speedometer" label="Flagged for Assessment" :noCount="true" tagColor="primary" />
                            </div>
                        </CCol>
                      </CRow>
                      <br />
                      <span v-if="item.warnings && item.warnings.length > 0">
                        <li
                          style="display: inline; margin-right: 2px"
                          v-for="(warning, i) in item.warnings"
                          :key="i"
                        >
                          <CButton color="warning" class="tag" size="sm">{{
                            warning
                          }}</CButton>
                        </li>
                      </span>
                    </td>
                  </template>
                  <template #organization="{ item }">
                    <td>
                      <OrganizationBadge :uuid="item.organization" />
                    </td>
                  </template>
                  <template #last_run="{ item }">
                    <td style="width: 125px">
                      <span v-if="neverRun(item.last_run)"> Never</span>
                      <span v-else>
                        {{ item.last_run | moment("from", "now") }}
                      </span>
                    </td>
                  </template>
                  <template #last_hit="{ item }">
                    <td style="width: 125px">
                      <span v-if="item.last_hit">
                        {{ item.last_hit | moment("from", "now") }}
                      </span>
                      <span v-else> Never </span>
                    </td>
                  </template>
                  <template #total_hits="{ item }">
                    <td style="width: 75px" class="text-center">
                      {{ item.total_hits ? item.total_hits : 0 }}
                    </td>
                  </template>
                  <template #tags="{ item }">
                    <td>
                      <TagBucket :tags="item.tags" />
                    </td>
                  </template>
                  <template #performance="{ item }">
                    <td class="small">
                      Query Time:
                      {{
                        item.query_time_taken ? item.query_time_taken.toLocaleString() : 0
                      }}
                      ms<br />
                      Total Time:
                      {{ item.time_taken ? item.time_taken.toLocaleString() : 0 }} ms
                      <br>
                      Estimated Hits Per Day:
                      <span v-if="item.average_hits_per_day != null">
                        {{ item.average_hits_per_day ? item.average_hits_per_day.toLocaleString() : 0 }}
                      </span>
                      <span v-else>-</span>
                    </td>
                  </template>
                  <template #actions="{ item }">
                    <td style="min-width: 25px" class="text-right">
                      <CDropdown color="secondary" toggler-text="Manage" size="sm">
                        <CDropdownItem
                          aria-label="View Detection"
                          :to="`detections/${item.uuid}`"
                          size="sm"
                          color="primary"
                          v-c-tooltip="{ content: 'View Detection', placement: 'left' }"
                          ><CIcon name="cilMagnifyingGlass" />&nbsp;&nbsp;View
                          Detection</CDropdownItem
                        >
                        <CDropdownItem 
                          aria-label="Flag for Assessment"
                          @click="flagForAssessment(item.uuid)"
                          size="sm"
                          color="warning"
                          v-if="!item.assess_rule"
                          v-c-tooltip="{ content: 'Flag for Assessment', placement: 'left' }"
                          ><i class="fas fa-flag"/>&nbsp;&nbsp;Flag for Assessment</CDropdownItem
                        >
                        <CDropdownItem
                          aria-label="Clear Warnings"
                          @click="clearWarnings(item.uuid)"
                          size="sm"
                          color="success"
                          v-if="item.warnings && item.warnings.length > 0"
                          v-c-tooltip="{ content: 'Clear Warnings', placement: 'left' }"
                        ><i class="fas fa-soap" />&nbsp;&nbsp;Clear Warnings</CDropdownItem>
                        <CDropdownItem
                          aria-label="Edit Detection"
                          @click="editDetectionModal(item.uuid)"
                          size="sm"
                          color="info"
                          v-c-tooltip="{ content: 'Edit Detection', placement: 'left' }"
                        >
                          <CIcon name="cilPencil" />&nbsp;&nbsp;Edit Detection
                        </CDropdownItem>
                        <CDropdownItem
                          v-if="item.active"
                          aria-label="Disable Detection"
                          @click="disableDetection(item.uuid)"
                          size="sm"
                          color="warning"
                          v-c-tooltip="{
                            content: 'Disable Detection',
                            placement: 'left',
                          }"
                        >
                          <CIcon name="cilBan" />&nbsp;&nbsp;Disable Detection
                        </CDropdownItem>
                        <CDropdownItem
                          v-if="!item.active"
                          aria-label="Enable Detection"
                          @click="enableDetection(item.uuid)"
                          size="sm"
                          color="success"
                          v-c-tooltip="{ content: 'Enable Detection', placement: 'left' }"
                        >
                          <i class="fas fa-circle-check" />&nbsp;&nbsp;Enable Detection
                        </CDropdownItem>
                        <CDropdownItem
                          aria-label="Clone Detection"
                          size="sm"
                          color="secondary"
                          @click="cloneDetection(item.uuid)"
                          v-c-tooltip="{ content: 'Clone Detection', placement: 'left' }"
                        >
                          <CIcon name="cilCopy" />&nbsp;&nbsp;Clone Detection
                        </CDropdownItem>
                        <CDropdownItem
                          v-if="!item.from_repo_sync"
                          aria-label="Add To Repository"
                          @click="addToRepository(item.uuid)"
                          size="sm"
                          color="primary"
                          v-c-tooltip="{
                            content: 'Add to Repository',
                            placement: 'left',
                          }"
                        >
                          <CIcon name="cilStorage" />&nbsp;&nbsp;Add To Repository
                        </CDropdownItem>
                        <CDropdownItem
                          v-if="!item.from_repo_sync"
                          aria-label="Remove From Repository"
                          @click="removeFromRepository(item.uuid)"
                          size="sm"
                          color="primary"
                          v-c-tooltip="{
                            content: 'Remove from Repository',
                            placement: 'left',
                          }"
                        >
                          <CIcon name="cilStorage" />&nbsp;&nbsp;Remove from Repository
                        </CDropdownItem>
                        <CDropdownItem
                          aria-label="Export Detection"
                          @click="exportDetection(item.uuid)"
                          size="sm"
                          color="info"
                          v-c-tooltip="{
                            content: 'Export Detection',
                            placement: 'left',
                          }"
                        >
                          <i class="fas fa-file-export" />&nbsp;&nbsp;Export Detection
                        </CDropdownItem>
                        <CDropdownItem
                          v-if="!item.active && !item.from_repo_sync"
                          aria-label="Delete Detection"
                          @click="deleteDetectionModal(item.uuid)"
                          size="sm"
                          color="danger"
                          v-c-tooltip="{ content: 'Delete Detection', placement: 'left' }"
                        >
                          <CIcon name="cilTrash" />&nbsp;&nbsp;Delete Detection
                        </CDropdownItem>
                      </CDropdown>
                    </td>
                  </template>
                </CDataTable>
                <CPagination :active-page.sync="current_page" :pages="total_pages" />
                <!--<DetectionRules></DetectionRules>-->
              </CTab>
              <CTab title="Detection Repositories">
                <DetectionRepositoryList />
              </CTab>
              <!--<CTab title="Detection Bundles"> </CTab>-->
            </CTabs>
          </CCardBody>
        </CCard>
        <AddToRepositoryModal
          :show.sync="show_add_to_repository_modal"
          :detection_ids.sync="selected_items"
          @rule_added="getDetections()"
        />
        <RemoveFromRepositoryModal
          :show.sync="show_remove_from_repository_modal"
          :detection_ids.sync="selected_items"
          :selected_repos.sync="selected_item_repos"
          @rule_removed="getDetections()"
        />
        <CModal
          :show.sync="confirm_delete"
          :close-on-backdrop="false"
          :centered="true"
          color="danger"
          title="Delete Detection Confirmation"
        >
          <CAlert :show.sync="error" color="danger">
            {{ error_message }}
          </CAlert>
          <p>Are you sure you want to delete {{ selected_items.length }} detection(s)?</p>

          <CAlert color="info">
            <b>NOTE:</b> Only inactive detections will be deleted.
          </CAlert>
          <template #footer>
            <CButton color="secondary" @click="cancelDelete()">Cancel</CButton>
            <CButton color="danger" @click="deleteDetections()">Delete</CButton>
          </template>
        </CModal>
        <CModal
          :show.sync="import_wizard"
          :close-on-backdrop="false"
          :centered="true"
          size="lg"
          title="Import Detections JSON"
        >
          <CTextarea v-model="import_json" placeholder="Paste JSON here" rows="10" />
          <template #footer>
            <CButton color="secondary" @click="cancelImport()">Cancel</CButton>
            <CButton color="info" @click="importDetections()">Import</CButton>
          </template>
        </CModal>
        <DetectionRuleModal
          :show.sync="show_detection_rule_modal"
          :rule.sync="rule"
          :mode="modal_mode"
        /> </CCol
    ></CRow>
  </div>
</template>

<script>
import { mapState } from "vuex";
import "prismjs/components/prism-yaml";
import "../assets/js/prism-rql";
import "../assets/css/prism-reflex.css"; // import syntax highlighting styles
import OrganizationBadge from "./OrganizationBadge";
import DetectionRuleModal from "./DetectionRuleModal";
import DetectionRepositoryList from "./detections/DetectionRepositoryList";
import ImportSigmaRuleWizard from "./detections/ImportSigmaRuleWizard.vue";
import RMultiCheck from "./components/MultiCheck";
import TagBucket from "./components/TagBucket";
import DetectionRepoPopover from "./detections/DetectionRepoPopover";
import DetectionsFilterMenu from "./detections/DetectionsFilterMenu";

import AddToRepositoryModal from "./detections/AddToRepositoryModal";
import RemoveFromRepositoryModal from "./detections/RemoveFromRepositoryModal";

//const DetectionRules = () => import('@/views/DetectionRuleList')
export default {
  name: "DetectionManagement",
  components: {
    //'DetectionRules': DetectionRules
    OrganizationBadge,
    DetectionRuleModal,
    ImportSigmaRuleWizard,
    RMultiCheck,
    DetectionRepositoryList,
    AddToRepositoryModal,
    RemoveFromRepositoryModal,
    TagBucket,
    DetectionRepoPopover,
    DetectionsFilterMenu,
  },
  data() {
    return {
      error: false,
      current_tab: 0,
      error_message: "",
      show_add_to_repository_modal: false,
      show_remove_from_repository_modal: false,
      import_wizard: false,
      import_json: "",
      confirm_delete: false,
      selected_items: [],
      selected_item_repos: [],
      picker_filters: {},
      sorter_value: { column: 'name', asc: true },
      //loading: false,
      detection_list_fields: [
        { key: "select", label: "", filter: false },
        "name",
        "status",
        "last_run",
        "last_hit",
        { key: "total_hits", label: "Hits" },
        { key: "performance", label: "Performance" },
        { key: "actions", filter: false },
      ],
      modal_mode: "Create",
      show_detection_rule_modal: false,
      show_import_sigma_rule_modal: false,
      tabs: [
        "1. Rule Details",
        "2. Sigma Rule",
        "3. Interval",
        "4. Playbooks",
        "5. Triage Notes",
        "6. Outputs",
      ],
      severities: ["Critical", "High", "Medium", "Low"],
      playbook_names: ["Phishing Analysis", "Threat Enrichment", "Cuckoo Sandbox"],
      backends: ["Elasticsearch", "Sysmon", "Crowdstrike", "SentinelOne", "Splunk"],
      tags: [
        { name: "car.2013-05-009" },
        { name: "attack.defense_evastion" },
        { name: "attack.t1036" },
        { name: "attack.t1036.003" },
      ],
      tag_list: [],
      createDetection: false,
      rule: {
        tags: [],
        query: {
          query: "okay",
          language: "",
        },
        status: "Experimental",
        source: {
          uuid: null,
        },
        techniques: [],
        tactics: [],
        lookbehind: 5,
        interval: 5,
        rule_type: 0,
        severity: 1,
        risk_score: 0,
        mute_period: 0,
        exceptions: [],
        false_positives: [],
        references: [],
        threshold_config: {
          threshold: 0,
          key_field: null,
        },
        field_mismatch_config: {
          source_field: "",
          target_field: "",
          operator: "==",
        },
        metric_change_config: {
          increase: false,
        },
        new_terms_config: {
          key_field: "",
          max_terms: 1000,
          window_size: 30,
        },
        indicator_match_config: {
          intel_list: {},
          key_field: ""
        },
        source_monitor_config: {
          data_sources: [],
          source_lists: [],
          excluded_sources: [],
          excluded_source_lists: [],
          delta_change: false,
          delta_window: 7,
          operator: "==",
          threshold: 0,
          threshold_as_percent: false
        },
        daily_schedule: false,
        schedule: this.defaultSchedule(),
      },
      current_page: 1,
      page_size: 25,
      total_pages: 1,
      sort_by: "name",
      sort_direction: "asc",
      total_items: 0
    };
  },
  methods: {
    getDetections() {
      let filters = JSON.parse(JSON.stringify(this.selected_detection_filters));
      filters["page_size"] = this.page_size;
      filters["page"] = this.current_page;
      filters["sort_by"] = this.sort_by;
      if (filters["sort_by"] === null) {
        filters["sort_by"] = "name";
      }
      filters["sort_direction"] = this.sort_direction;
      if (filters["sort_direction"] === null) {
        filters["sort_direction"] = "asc";
      }
      this.$store.dispatch("getDetections", filters).then((resp) => {
        this.current_page = resp.data.pagination.page;
        let paging = resp.data.pagination;
        this.total_pages = paging.pages;
        this.total_items = paging.total_results;
      });
    },
    importDetections() {
      let data = {
        detections: JSON.parse(this.import_json),
      };
      this.$store.dispatch("importDetections", { data: data }).then(() => {
        this.import_json = "";
        this.import_wizard = false;
      });
    },
    disableDetection(uuid) {
      this.$store.dispatch("updateDetection", { uuid: uuid, data: { active: false } });
    },
    enableDetection(uuid) {
      this.$store.dispatch("updateDetection", { uuid: uuid, data: { active: true } });
    },
    editDetectionModal(uuid) {
      this.modal_mode = "Edit";
      this.rule = JSON.parse(
        JSON.stringify(this.detections.find((detection) => detection.uuid === uuid))
      );
      this.show_detection_rule_modal = true;
    },
    importSigmaRuleModal() {
      this.rule = this.defaultRule();
      this.show_import_sigma_rule_modal = true;
    },
    defaultRule() {
      return {
        name: "",
        tags: [],
        query: {
          query: "okay",
          language: "",
        },
        status: "Experimental",
        source: {
          uuid: null,
        },
        techniques: [],
        tactics: [],
        lookbehind: 5,
        interval: 5,
        rule_type: 0,
        severity: 2,
        risk_score: 50,
        mute_period: 0,
        exceptions: [],
        false_positives: [],
        references: [],
        threshold_config: {
          threshold: 0,
          max_events: 10,
          key_field: "",
          operator: "==",
          dynamic: false,
          per_field: false,
          discovery_period: 7,
          recalculation_period: 24,
        },
        field_mismatch_config: {
          source_field: "",
          target_field: "",
          operator: "==",
        },
        metric_change_config: {
          increase: false,
          threshold_format: 0,
          threshold: 0,
        },
        new_terms_config: {
          key_field: "",
          max_terms: 1000,
          window_size: 30,
        },
        daily_schedule: false,
        schedule: this.defaultSchedule(),
      };
    },
    createDetectionModal() {
      this.modal_mode = "Create";
      this.rule = {
        name: "",
        tags: [],
        query: {
          query: "okay",
          language: "",
        },
        status: "Experimental",
        source: {
          uuid: null,
        },
        techniques: [],
        tactics: [],
        lookbehind: 5,
        interval: 5,
        rule_type: 0,
        suppression_max_events: 0,
        severity: 1,
        risk_score: 50,
        mute_period: 0,
        exceptions: [],
        false_positives: [],
        references: [],
        threshold_config: {
          threshold: 0,
          max_events: 10,
          key_field: "",
          operator: "==",
          dynamic: false,
          per_field: false,
          discovery_period: 7,
          recalculation_period: 24,
        },
        field_mismatch_config: {
          source_field: "",
          target_field: "",
          operator: "==",
        },
        metric_change_config: {
          increase: false,
          threshold_format: 0,
          threshold: 0,
        },
        new_terms_config: {
          key_field: "",
          max_terms: 1000,
          window_size: 30,
        },
        indicator_match_config: {
          intel_list: {},
          key_field: ""
        },
        source_monitor_config: {
          data_sources: [],
          source_lists: [],
          excluded_sources: [],
          excluded_source_lists: [],
          delta_change: false,
          delta_window: 7,
          operator: "==",
          threshold: 0,
          threshold_as_percent: false
        },
        daily_schedule: false,
        schedule: this.defaultSchedule(),
      };
      this.show_detection_rule_modal = true;
    },
    deleteDetectionModal(uuid = null) {
      this.confirm_delete = true;
      this.resetError();
      if (uuid !== null) {
        this.selected_items = [uuid];
      }
    },
    cloneDetection(uuid) {
      let source_detection = this.detections.find((r) => r.uuid === uuid);
      this.rule = JSON.parse(JSON.stringify(source_detection));
      this.rule = Object.assign({}, source_detection);
      this.rule.name = "[COPY] " + source_detection.name;
      this.modal_mode = "Clone";
      this.show_detection_rule_modal = true;
    },
    addTag(newTag) {
      const tag = {
        name: newTag,
      };
      this.tag_list.push(tag);
      this.tags.push(tag);
    },
    select_all_by_filter() {
      console.log("NOT IMPLEMENTED");
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
    select_item(i) {
      let item = this.detections.find((detection) => detection.uuid === i);

      if (this.selected_items.includes(i)) {
        this.selected_items = this.selected_items.filter((item) => item !== i);
      } else {
        this.selected_items.push(i);
      }

      if (this.selected_items.includes(i)) {
        let item = this.detections.find((detection) => detection.uuid === i);
        if (item.repository && item.repository.length > 0) {
          // Add this items repos to selected_item_repos if not already there
          this.selected_item_repos = this.selected_item_repos.concat(
            item.repository.filter((repo) => !this.selected_item_repos.includes(repo))
          );
        }
      } else {
        // Remove this items repos from selected_item_repos if no other items have it
        let item = this.detections.find((detection) => detection.uuid === i);
        if (item.repository && item.repository.length > 0) {
          // If any other item in selected_items has a repository in selected_item_repos
          // don't remove if, if not remove it
          this.selected_item_repos = this.selected_item_repos.filter((repo) => {
            return this.selected_items.some((item) => {
              let detection = this.detections.find(
                (detection) => detection.uuid === item
              );
              return detection.repository.includes(repo);
            });
          });
        }
      }
    },
    neverRun(last_run) {
      if (last_run.startsWith("19")) {
        return true;
      }
    },
    selectAllByFilter() {
      let filters = JSON.parse(JSON.stringify(this.selected_detection_filters));
      this.$store.dispatch("getDetectionsByFilter", filters).then((resp) => {
        this.selected_items = resp.data.detections;
      });
    },
    clearSelection() {
      this.selected_items = [];
    },
    selectAll() {
      if (this.selected_items.length > 0) {
        this.selected_items = [];
        this.selected_item_repos = [];
      } else {
        this.selected_items = this.detections.map((item) => item.uuid);

        // Add all the selected items repositories to selected_item_repos if not already there
        this.selected_item_repos = this.detections.reduce((acc, detection) => {
          if (detection.repository && detection.repository.length > 0) {
            return acc.concat(detection.repository.filter((repo) => !acc.includes(repo)));
          } else {
            return acc;
          }
        }, []);
      }
    },
    item_is_selected(i) {
      return this.selected_items.includes(i);
    },
    exportDetection(uuid) {
      this.$store.dispatch("exportDetection", { uuid: uuid }).then((resp) => {
        let blob = new Blob([JSON.stringify(resp.data)]);
        let link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = uuid + ".json";
        link.click();
      });
    },
    exportDetections() {
      this.$store
        .dispatch("exportSelectedDetections", { uuids: this.selected_items })
        .then((resp) => {
          let blob = new Blob([JSON.stringify(resp.data)]);
          let link = document.createElement("a");
          link.href = window.URL.createObjectURL(blob);
          link.download = "detections.json";
          link.click();
        });
    },
    resetError() {
      this.error = false;
      this.error_message = "";
    },
    deleteDetections() {
      this.$store
        .dispatch("deleteSelectedDetections", { uuids: this.selected_items })
        .then((resp) => {
          this.selected_items = [];
          this.confirm_delete = false;
        })
        .catch((err) => {
          this.error = true;
          this.error_message = err.response.data.message;
        });
    },
    cancelDelete() {
      this.selected_items = [];
      this.confirm_delete = false;
    },
    disableDetections() {
      this.$store
        .dispatch("disableSelectedDetections", { uuids: this.selected_items })
        .then((resp) => {
          this.selected_items = [];
        });
    },
    clearWarnings(uuid) {
      let uuids = [];
      if(typeof(uuid) === "string") {
        uuids = [uuid];
      } else {
        uuids = this.selected_items;
      }
      this.$store.dispatch("clearDetectionWarnings", { uuids: uuids }).then((resp) => {
        this.selected_items = [];
      }).catch((err) => {
        this.selected_items = [];
        this.alert = { message: err.response.data.message, type: "danger" };
      });
    },
    enableDetections() {
      this.$store
        .dispatch("enableSelectedDetections", { uuids: this.selected_items })
        .then((resp) => {
          this.selected_items = [];
        });
    },
    addToRepository(item) {
      if (item) {
        this.selected_items = [item];
      }
      if(this.show_add_to_repository_modal) {
        this.show_add_to_repository_modal = false;
      }
      this.show_add_to_repository_modal = true;
    },
    flagForAssessment(item) {
      this.$store.dispatch("flagDetectionAssess", { uuid: item })
    },
    assessDetections() {
      this.$store
        .dispatch("assessSelectedDetections", { uuids: this.selected_items })
        .then((resp) => {
          this.selected_items = [];
        });
    },
    removeFromRepository(item) {
      item = this.detections.find((detection) => detection.uuid === item);
      if (item) {
        this.selected_items = [item.uuid];
        if (item.repository && item.repository.length > 0) {
          // Add this items repos to selected_item_repos if not already there
          this.selected_item_repos = this.selected_item_repos.concat(
            item.repository.filter((repo) => !this.selected_item_repos.includes(repo))
          );
        }
      }
      this.show_remove_from_repository_modal = true;
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
  computed: {
    filtered_items() {
      let items = this.detections;
      let _items = [];
      if (Object.keys(this.picker_filters).length == 0) {
        return items;
      }
      for (let i in items) {
        let item = items[i];
        let match = true;
        for (let key in this.picker_filters) {
          if (this.picker_filters[key].length > 0) {
            if (typeof item[key] == "boolean") {
              if (!this.picker_filters[key].includes(item[key].toString())) {
                match = false;
              }
            } else if (typeof item[key] == "object") {
              if (item[key]) {
                if (!item[key].some((r) => this.picker_filters[key].includes(r))) {
                  match = false;
                }
              } else {
                match = false;
              }
            } else {
              if (!this.picker_filters[key].includes(item[key])) {
                match = false;
              }
            }
          }
        }
        if (match) {
          _items.push(item);
        }
      }
      return _items;
    },
    organizations_pick_list() {
      return this.organizations.map((o) => {
        return { label: o.name, value: o.uuid };
      });
    },
    ...mapState([
      "alert",
      "detections",
      "organizations",
      "current_user",
      "selected_detection_filters",
      "loading",
    ]),
  },
  watch: {
    current_page: function(){
        this.getDetections()
      },
    sorter_value: function(){
      this.sort_by = this.sorter_value.column
      this.sort_direction = this.sorter_value.asc ? 'asc' : 'desc'
      this.getDetections()
    },
  },
  created() {
    if (this.current_user.default_org) {
      if (!this.detection_list_fields.includes("organization")) {
        this.detection_list_fields.splice(2, 0, { key: "organization", sorter: false });
      }
      //this.organizations = this.$store.getters.organizations.map((o) => { return {label: o.name, value: o.uuid}})
    }
    this.$store.commit("add_start"); // Stop the success/fail add from showing up when changing from other pages
    this.getDetections();
  },
};
</script>
