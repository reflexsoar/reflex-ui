<template>
  <div>
    <CRow>
      <event-drawer :event_data="event_data"></event-drawer>
      <CCol col v-if="loading"
        ><link
          rel="stylesheet"
          href="https://unpkg.com/vue-multiselect@2.1.0/dist/vue-multiselect.min.css"
        />
        <div style="margin: auto; text-align: center; verticle-align: middle">
          <CSpinner color="dark" style="width: 6rem; height: 6rem" />
        </div>
      </CCol>
      <CCol col v-if="!loading">
        <CRow class="page-heading" style="padding-left: 15px; padding-right: 15px">
          <CCol
            ><h2>
              &nbsp;{{ case_data.title
              }}<CIcon
                v-if="case_data.escalated"
                name="cilWarning"
                class="escalated"
                size="xl"
              />
            </h2>
            <TagList style="padding-left: 15px" :tags="case_data.tags" label="name"
          /></CCol>
          <CCol col="2" class="text-right">
            <label class="text-muted"
              ><b>Status</b></label
            >
            <CSelect
              id="status-select"
              v-if="edit_status"
              :options="case_statuses"
              :value.sync="case_data.status.uuid"
              @change="updateStatus()"
            ></CSelect>
            <h4
              @click="editStatus"
              style="cursor: pointer"
              id="status-label"
              v-if="!edit_status"
            >
              <CBadge size="sm" :color="getStatusColor(case_data.status.name)"
                >&nbsp;&nbsp;&nbsp;</CBadge
              >&nbsp;{{ case_data.status.name }}
            </h4>
          </CCol>
          <CCol col="2" class="text-right">
            <label class="text-muted"
              ><b>Severity</b></label
            >
            <CSelect
              id="severity-select"
              v-if="edit_severity"
              :value.sync="case_data.severity"
              :options="severities"
              @change="updateSeverity()"
              v-bind:disabled="case_data.status && case_data.status.closed"
            ></CSelect>
            <h4
              v-if="!edit_severity"
              style="cursor: pointer"
              id="severity-label"
              @click="editSeverity"
            >
              <CBadge size="sm" :color="getSeverityColor(case_data.severity)"
                >&nbsp;&nbsp;&nbsp;</CBadge
              >&nbsp;{{ getSeverityText(case_data.severity) }}
            </h4>
          </CCol>
          <CCol col="2" class="text-right">
            <label class="text-muted"
              ><b>Owner</b></label
            >
            <div role="group" class="form-group">
              <multiselect
                id="owner-select"
                v-if="edit_owner"
                v-model="assignee"
                label="username"
                :options="[...users, { username: 'Unassigned' }]"
                track-by="username"
                :searchable="true"
                :internal-search="false"
                :options-limit="25"
                :show-no-results="false"
                v-bind:disabled="case_data.status.closed"
                @search-change="usersFind"
                @select="updateAssignee($event)"
              >
              </multiselect>
              <h4
                v-if="!edit_owner"
                style="cursor: pointer"
                id="owner-label"
                @click="editOwner"
              >
                {{ case_data.owner.username }}
              </h4>
            </div>
          </CCol>
          
          <CCol col="2" class="text-right">
            <CDropdown
              toggler-text="Actions"
              color="secondary"
              v-bind:disabled="case_data.status && case_data.status.closed"
            >
              <CDropdownItem @click="closeCase()">Close Case</CDropdownItem>
              <CDropdownItem v-if="case_data.escalated !== true" @click="escalateCase()"
                >Escalate Case</CDropdownItem
              >
              <CDropdownItem
                v-if="case_data.escalated == true"
                @click="escalateCase(false)"
                >De-Escalate Case</CDropdownItem
              >
              <CDropdownItem @click="caseTemplateModal = !caseTemplateModal"
                >Apply Case Template</CDropdownItem
              >
              <CDropdownItem
                v-if="case_data.case_template_uuid"
                @click="removeCaseTemplate()"
                >Remove Case Template</CDropdownItem
              >
              <CDropdownItem @click="addObservableModal = !addObservableModal"
                >Add Observables</CDropdownItem
              >
              <CDropdownItem @click="linkCaseModal = !linkCaseModal"
                >Link Cases</CDropdownItem
              >
              <CDropdownItem @click="runPlaybookModal = !runPlaybookModal" disabled
                >Run Playbook</CDropdownItem
              >
              <CDropdownDivider v-if="current_user.permissions['delete_case']" />
              <CDropdownItem
                v-if="current_user.permissions['delete_case']"
                @click="deleteCaseModal = !deleteCaseModal"
                >Delete</CDropdownItem
              >
            </CDropdown>
          </CCol>
        </CRow>

        <CTabs
          :activeTab.sync="activeTab"
          addNavWrapperClasses="page-nav"
          addTabClasses="page-nav-tab-body"
          addNavClasses="page-nav-tab"
        >
          <CTab title="Case Details" active>
            <CCardBody style="padding-top: 5px">
              <CRow>
                <CCol col="12">
                  <CRow>
                    <CCol col="2">
                      <CalloutCard label="SLA Status" value="Okay" color="success" />
                    </CCol>
                    <CCol col="2">
                      <CalloutCard
                        label="Total Events"
                        :value="case_data.event_count ? case_data.event_count : 0"
                        color="info"
                      />
                    </CCol>
                    <CCol col="2">
                      <CalloutCard
                        label="Related Cases"
                        :value="related_cases.length"
                        color="info"
                      />
                    </CCol>
                    <CCol col="2">
                      <CalloutCard
                        label="Remaining Tasks"
                        :value="case_data.observable_count"
                        color="info"
                      >
                        <template #value>
                          <strong class="h1"
                            >{{ case_data.open_tasks }} /
                            {{ case_data.total_tasks }}</strong
                          >
                        </template>
                      </CalloutCard>
                    </CCol>
                    <CCol col="2">
                      <CalloutCard
                        label="Total Observables"
                        :value="case_data.observable_count"
                        color="info"
                      />
                    </CCol>

                    <CCol col="2">
                      <CalloutCard label="Days Open" :value="daysOpen()" color="info" />
                    </CCol>
                  </CRow>
                </CCol>
              </CRow>
              <CRow>
                <CCol col="9"
                  ><CCard>
                    <CCardBody
                      @mouseover="edit_description_hint = true"
                      @mouseleave="edit_description_hint = false"
                      style="overflow-y: auto; height: 100%"
                    >
                      <h5>
                        Description
                        <small
                          ><a
                            v-if="
                              edit_description_hint &&
                              case_data.status &&
                              !case_data.status.closed
                            "
                            @click="edit_description = !edit_description"
                            ><CIcon
                              style="cursor: pointer"
                              name="cilPencil"
                              size="sm" /></a
                        ></small>
                      </h5>
                      <p v-if="!edit_description">
                        <vue-markdown>{{ case_data.description }}</vue-markdown>
                      </p>
                      <span v-if="edit_description">
                        <CButton
                          color="danger"
                          @click="edit_description = false"
                          size="sm"
                          ><CIcon name="cilXCircle" /></CButton
                        >&nbsp;<CButton
                          color="primary"
                          @click="saveDescription()"
                          size="sm"
                          ><CIcon name="cilSave" /></CButton
                        ><br /><br />
                        <editor
                          ref="descriptionEditor"
                          :initialValue="case_data.description"
                          @change="updateCaseDescription()"
                          height="500px"
                          initialEditType="markdown"
                          previewStyle="tab"
                        />
                      </span>
                      <span
                        v-if="closureComments().length > 0 && case_data.status.closed"
                      >
                        <br />
                        <h5>Closure Details</h5>
                        <hr style="border-top: 1px dotted #cfcfcf" />
                        <span v-for="comment in closureComments()" :key="comment.uuid">
                          <b
                            >Closed as: {{ comment.closure_reason.title }} by
                            {{ comment.created_by.username }}</b
                          ><br />
                          <small>{{ comment.created_at | moment("LLLL") }}</small>
                          <br />{{ comment.message }}<br /><br />
                        </span>
                      </span>
                    </CCardBody>
                  </CCard>
                </CCol>
                <CCol col="3">
                  <CCard>
                    <CCardHeader> Overview </CCardHeader>
                    <CCardBody>
                      <div v-if="current_user.default_org && current_user.permissions.view_organizations"  style="margin-bottom: 10px">
                        <label>Organization</label><br>
                        <OrganizationBadge :uuid="case_data.organization"/>
                      </div>
                      <ObjectAttribute
                        label="Created"
                        :value="case_data.created_at | moment('LLLL')"
                      ></ObjectAttribute>
                      <ObjectAttribute
                        label="Created By"
                        :value="case_data.created_by.username"
                      ></ObjectAttribute>
                      <ObjectAttribute
                        label="Updated"
                        :value="case_data.updated_at | moment('LLLL')"
                      ></ObjectAttribute>
                      <ObjectAttribute
                        v-if="
                          case_data.case_template && case_data.case_template.title != null
                        "
                        label="Applied Case Template"
                        :value="case_data.case_template.title"
                      />
                      <div>
                        <span
                          v-if="!edit_tags"
                          @click="editTags()"
                          style="cursor: pointer"
                        >
                          <TagList :tags="case_data.tags" label="name"
                        /></span>
                        <span v-if="edit_tags">
                          <multiselect
                            id="tagselect"
                            v-model="current_tags"
                            placeholder="Select tags to apply to this case"
                            :taggable="true"
                            tag-placeholder="Add new tag"
                            track-by="name"
                            label="name"
                            :options="tags"
                            :multiple="true"
                            :close-on-select="false"
                            @tag="addTag"
                            style="z-index: 50"
                          ></multiselect
                          ><CButton @click="saveTags()">Save Tags</CButton>
                        </span>
                      </div>
                    </CCardBody>
                  </CCard>
                </CCol>
              </CRow>
            </CCardBody>
          </CTab>
          <CTab title="Observables">
            <h2 class="page-sub-header">Observables</h2>
            <CCard>
              <ObservableList
                :uuid="uuid"
                :events="case_data.events"
                :key="reloadObservables"
              ></ObservableList>
            </CCard>
          </CTab>
          <CTab title="Events">
            <h2 class="page-sub-header">Events</h2>
            <CCard>
              <div
                v-if="tab_loading"
                style="margin: auto; text-align: center; verticle-align: middle"
              >
                <CCardBody>
                  <CSpinner color="dark" style="width: 6rem; height: 6rem" />
                </CCardBody>
              </div>
              <div v-else>
                <CRow>
                  <CCol col="12">
                    <CCardBody
                      style="border-bottom: 1px solid #cfcfcf; padding-bottom: 0px"
                    >
                      <CRow>
                        <CCol col="8">
                          <!--<li style="display: inline; margin-right: 2px;" v-for="obs in observableFilters" :key="obs.value"><CButton color="secondary" class="tag"  size="sm" @click="toggleObservableFilter({'dataType': obs.dataType.name, 'value': obs.value})"><b>{{obs.dataType}}</b>: <span v-if="obs.filter_type == 'severity'">{{getSeverityText(obs.value).toLowerCase()}}</span><span v-else>{{ obs.value }}</span></CButton></li><span v-if="!filteredBySignature() && observableFilters.length > 0"><span class="separator">|</span>Showing {{filtered_events.length}} grouped events.</span><span v-if="filteredBySignature() && observableFilters.length != 0"><span class="separator" v-if="filteredBySignature() && observableFilters.length != 0">|</span>Showing {{filtered_events.length}} events.</span><span v-if="observableFilters.length == 0">Showing {{filtered_events.length}} grouped events.</span>-->
                        </CCol>
                        <CCol col="2">
                          <CInput
                            placeholder="Search"
                            :value="search_filter"
                            @change="search_filter = $event"
                            v-on:keydown.enter.native="
                              toggleObservableFilter({
                                filter_type: 'search',
                                dataType: 'search',
                                value: $event.target.value,
                              })
                            "
                            ><template #append>
                              <CButton
                                color="secondary"
                                @click="
                                  toggleObservableFilter({
                                    filter_type: 'search',
                                    dataType: 'search',
                                    value: search_filter,
                                  })
                                "
                                >Search</CButton
                              ></template
                            ></CInput
                          >
                        </CCol>
                        <CCol col="2">
                          <!--<CPagination :activePage.sync="current_events_page" :pages="events_page_data.pages"/>-->
                        </CCol>
                      </CRow>
                    </CCardBody>
                  </CCol>
                </CRow>
                <CRow>
                  <CCol col="12">
                    <CDataTable
                      :items="filtered_events"
                      :fields="event_fields"
                      :striped="true"
                      :sorter="{ resetable: true }"
                      :responsive="false"
                    >
                      <template #name="{ item }">
                        <td>
                          <input
                            v-if="!(item.case_uuid || item.status.closed)"
                            type="checkbox"
                            :value="item.uuid"
                            v-model="selected"
                          />&nbsp;<a
                            @click="
                              toggleObservableFilter({
                                filter_type: 'title',
                                dataType: 'title',
                                value: item.title,
                              })
                            "
                            >{{ item.title }}</a
                          ><br />
                          <CIcon name="cilCenterFocus" />&nbsp;
                          <li
                            style="display: inline; margin-right: 2px"
                            v-for="obs in item.observables.slice(0, 3)"
                            :key="obs.uuid"
                          >
                            <CButton
                              color="secondary"
                              class="tag"
                              size="sm"
                              style="margin-top: 5px; margin-bottom: 5px"
                              @click="
                                toggleObservableFilter({
                                  filter_type: 'observable',
                                  dataType: obs.data_type,
                                  value: obs.value,
                                })
                              "
                              ><b>{{
                                obs.source_field
                                  ? obs.source_field.toLowerCase()
                                  : obs.data_type
                              }}</b
                              >: {{ obs.value.toLowerCase() }}</CButton
                            >
                          </li>
                          <span
                            v-if="item.observables.length > 3"
                            style="cursor: pointer"
                            v-c-popover="{
                              header: 'Additional Observables',
                              content: extraObservables(item.observables.slice(3)),
                            }"
                            ><small>&nbsp;+{{ item.observables.length - 3 }}</small></span
                          ><br />
                          <TagList :tags="item.tags" />
                        </td>
                      </template>
                      <template #reference="{ item }">
                        <td>
                          <span
                            v-c-tooltip="{
                              content: `${item.reference}`,
                              placement: 'top',
                            }"
                            >{{ item.reference | truncate }}</span
                          >
                        </td>
                      </template>
                      <template #created="{ item }">
                        <td>
                          <span v-c-tooltip="item.created_at">{{
                            item.created_at | moment("from", "now")
                          }}</span>
                        </td>
                      </template>
                      <template #events="{ item }">
                        <td>
                          <CButton
                            class="tag"
                            @click="
                              toggleObservableFilter({
                                filter_type: 'eventsig',
                                dataType: 'signature',
                                value: item.signature,
                              })
                            "
                            v-if="
                              !(filteredBySignature() || item.related_events_count < 1)
                            "
                            color="dark"
                            size="sm"
                            >{{ item.related_events_count }}</CButton
                          >
                        </td>
                      </template>
                      <template #status="{ item }">
                        <td>
                          {{ item.status.name }}
                        </td>
                      </template>
                      <template #severity="{ item }">
                        <td>
                          <CButton
                            @click="
                              toggleObservableFilter({
                                filter_type: 'severity',
                                dataType: 'severity',
                                value: item.severity,
                              })
                            "
                            class="tag"
                            :color="getSeverityColor(item.severity)"
                            size="sm"
                            >{{ getSeverityText(item.severity) }}</CButton
                          >
                        </td>
                      </template>
                      <template #actions="{ item }">
                        <td align="right">
                          <CButtonGroup>
                            <CDropdown
                              toggler-text="Actions"
                              color="secondary"
                              size="sm"
                              right
                            >
                              <CDropdownItem @click="showDrawer(item.uuid)"
                                >View Event</CDropdownItem
                              >
                              <CDropdownItem v-if="item.status != 2">Close</CDropdownItem>
                              <CDropdownItem v-if="item.status == 2"
                                >Reopen</CDropdownItem
                              >
                              <CDropdownItem>Remove from Case</CDropdownItem>
                              <CDropdownItem>Transfer Case</CDropdownItem>
                              <CDropdownItem
                                @click="runPlaybookModal = !runPlaybookModal"
                                disabled
                                >Run Playbook</CDropdownItem
                              >
                              <CDropdownDivider />
                              <CDropdownItem
                                @click="deleteCaseModal = !deleteCaseModal"
                                disabled
                                >Delete</CDropdownItem
                              >
                            </CDropdown>
                          </CButtonGroup>
                        </td>
                      </template>
                      <template #observables="{ item }">
                        <td>
                          {{ item.observable_count }}
                        </td>
                      </template>
                    </CDataTable></CCol
                  >
                </CRow>
              </div>
            </CCard>
          </CTab>
          <CTab title="Tasks">
            <div
              v-if="tab_loading"
              style="
                margin: auto;
                padding: 10px;
                text-align: center;
                verticle-align: middle;
              "
            >
              <CSpinner color="dark" style="width: 6rem; height: 6rem" />
            </div>
            <div v-else>
              <CRow>
                <CCol>
                  <h2 class="page-sub-header">Tasks</h2>
                </CCol>
                <CCol class="text-right">
                  <CButton color="primary" @click="caseTaskModal = !caseTaskModal"
                    >Add Task</CButton
                  >
                </CCol>
              </CRow>
              <CaseTaskList :uuid="uuid" :key="reloadTasks"></CaseTaskList>
            </div>
          </CTab>
          <CTab
            title="Attachments"
            disabled
            v-c-tooltip="{ content: 'Coming Soon', placement: 'top' }"
          >
            <div
              v-if="tab_loading"
              style="margin: auto; text-align: center; verticle-align: middle"
            >
              <CSpinner color="dark" style="width: 6rem; height: 6rem" />
            </div>
            <div v-else>
              <CaseFileList :case_files="case_files" :uuid="uuid" />
            </div>
          </CTab>
          <CTab title="Comments">
            <div
              v-if="tab_loading"
              style="margin: auto; text-align: center; verticle-align: middle"
            >
              <CSpinner color="dark" style="width: 6rem; height: 6rem" />
            </div>
            <div v-else>
              <Comments
                :comments.sync="comments"
                :uuid="case_data.uuid"
                comment_type="case"
              ></Comments>
            </div>
          </CTab>
          <CTab title="History">
            <CRow>
              <CCol>
                <h2 class="page-sub-header">History</h2>
              </CCol>
              <CCol col="3">
                <CInput placeholder="Search History" v-model="history_search"></CInput>
              </CCol>
            </CRow>
            <CCard>
              <div
                style="
                  overflow-y: auto;
                  overflow-x: hidden;
                  max-height: calc(100vh - 300px);
                "
              >
                <div
                  v-if="tab_loading"
                  style="margin: auto; text-align: center; verticle-align: middle"
                >
                  <CCardBody>
                    <CSpinner color="dark" style="width: 6rem; height: 6rem" />
                  </CCardBody>
                </div>
                <div v-else>
                  <CaseHistoryTimeline :entries="filtered_history" />
                </div></div
            ></CCard>
          </CTab>
          <CTab title="Related Cases"
            ><h2 class="page-sub-header">Related Cases</h2>
            <CCard
              ><div
                v-if="tab_loading"
                style="margin: auto; text-align: center; verticle-align: middle"
              >
                <CCardBody>
                  <CSpinner color="dark" style="width: 6rem; height: 6rem" />
                </CCardBody>
              </div>
              <div v-else>
                <CDataTable
                  :fields="[
                    'title',
                    'event_count',
                    'observable_count',
                    'status',
                    'owner',
                    'actions',
                  ]"
                  :items="related_cases"
                >
                  <template #title="{ item }">
                    <td>
                      <router-link :to="`${item.uuid}`">{{ item.title }}</router-link>
                    </td>
                  </template>
                  <template #status="{ item }">
                    <td>
                      {{ item.status.name }}
                    </td>
                  </template>
                  <template #owner="{ item }">
                    <td>
                      {{ item.owner.username ? item.owner.username : "Unassigned" }}
                    </td>
                  </template>
                  <template #actions="{ item }">
                    <td>
                      <CButton @click="unlinkCase(item.uuid)" color="danger" size="sm"
                        >Unrelate</CButton
                      >
                    </td>
                  </template>
                </CDataTable>
              </div></CCard
            >
          </CTab>
          <CTab
            title="Playbook/Action Output"
            disabled
            v-c-tooltip="{ content: 'Coming Soon', placement: 'top' }"
          >
            <div class="bg-dark console-output">
              <code class="bg-dark pre-formatted raw_log"
                >2020-09-13 20:33:50,591 - Extracting ZIP file<br />2020-09-13
                20:33:50,593 - Running test plugin!<br />2020-09-13 20:33:54,716 - Running
                agent<br />2020-09-13 20:34:28,846 - Running agent<br />2020-09-13
                20:34:28,847 - Running input ES_PROD<br />2020-09-13 20:34:28,847 -
                Fetching credentials for ES_PROD<br />2020-09-13 20:34:33,124 - RUNNING
                ELASTICSEARCH PLUGIN<br />2020-09-13 20:34:33,150 - POST
                https://localhost:9200/.siem-signals-*/_search [status:200
                request:0.025s]<br />2020-09-13 20:34:33,154 - Pushing 26 events to bulk
                ingest...<br />2020-09-13 20:35:12,878 - Running agent<br />2020-09-13
                20:35:12,879 - Running input ES_PROD<br />2020-09-13 20:35:12,879 -
                Fetching credentials for ES_PROD<br />2020-09-13 20:35:17,060 - RUNNING
                ELASTICSEARCH PLUGIN<br />2020-09-13 20:35:17,085 - POST
                https://localhost:9200/.siem-signals-*/_search [status:200
                request:0.024s]<br />2020-09-13 20:35:17,089 - Pushing 26 events to bulk
                ingest...</code
              >
            </div>
          </CTab>
        </CTabs>

        <CModal
          title="Delete Case"
          color="danger"
          :centered="true"
          size="lg"
          :show.sync="deleteCaseModal"
        >
          <div>
            <p>
              Deleting a case is a permanent action, all work on the event will be removed
              and any associated events will be set to <b>New</b> status, are you sure you
              want to continue?
            </p>
          </div>
          <template #footer>
            <CButton @click="deleteCaseModal = !deleteCaseModal" color="secondary"
              >Cancel</CButton
            >
            <CButton @click="deleteCase()" color="danger">Delete</CButton>
          </template>
        </CModal>
        <AddObservableModal
          :case_data.sync="case_data"
          :show.sync="addObservableModal"
          :uuid="case_data.uuid"
          :organization="this.case_data.organization"
        ></AddObservableModal>
        <AddTaskModal :show.sync="caseTaskModal" :case_uuid="this.uuid"></AddTaskModal>
        <CloseCaseModal
          :show.sync="closeCaseModal"
          :case_uuid="this.uuid"
          :status_uuid.sync="this.case_data.status.uuid"
          :organization="this.case_data.organization"
          :closed.sync="case_closed"
        ></CloseCaseModal>
        <ApplyCaseTemplateModal
          :show.sync="caseTemplateModal"
          :case_uuid="this.uuid"
          :current_case_template_uuid="
            case_data.case_template ? case_data.case_template.uuid : null
          "
          :organization="this.case_data.organization"
        />
        <LinkCaseModal
          :show.sync="linkCaseModal"
          :case_uuid="this.uuid"
          :related_cases="related_cases"
        />
      </CCol>
    </CRow>
  </div>
</template>

<style scoped>
.separator {
  margin-left: 10px;
  margin-right: 10px;
}
</style>

<script>
import { mapState } from "vuex";
import AddObservableModal from "./AddObservableModal";
import ObservableList from "./ObservableList";
import CaseTaskList from "./CaseTaskList";
import AddTaskModal from "./AddTaskModal";
import CloseCaseModal from "./CloseCaseModal";
import ApplyCaseTemplateModal from "./ApplyCaseTemplateModal";
import LinkCaseModal from "./LinkCaseModal";
import Comments from "./Comments";
import CaseHistoryTimeline from "./CaseHistoryTimeline";
import CaseFileList from "./CaseFileList";
import EventDrawer from "./EventDrawer.vue";
import CRightDrawer from "./CRightDrawer.vue";
import "v-markdown-editor/dist/v-markdown-editor.css";
import TagList from "./components/TagList";
import ObjectAttribute from "./components/ObjectAttribute";
import CalloutCard from "./components/CalloutCard";
import "@toast-ui/editor/dist/toastui-editor.css";

import { Editor } from "@toast-ui/vue-editor";

import OrganizationBadge from './OrganizationBadge.vue'

import { Mentionable } from "vue-mention";
import moment from "moment";
export default {
  name: "CaseDetails",
  components: {
    AddObservableModal,
    ObservableList,
    CaseTaskList,
    AddTaskModal,
    CloseCaseModal,
    Mentionable,
    LinkCaseModal,
    CaseHistoryTimeline,
    ApplyCaseTemplateModal,
    Comments,
    CaseFileList,
    EventDrawer,
    TagList,
    ObjectAttribute,
    Editor,
    CalloutCard,
    OrganizationBadge
  },
  computed: {
    ...mapState(["alert", "current_user", "settings", "tags", "case_observables"]),
    filtered_history() {
      return this.case_history.filter((item) => {
        // Return by message or by username
        return (
          item.message.toLowerCase().includes(this.history_search.toLowerCase()) ||
          item.created_by.username
            .toLowerCase()
            .includes(this.history_search.toLowerCase())
        );
      });
    },
  },
  props: {
    caption: {
      type: String,
      default: "Table",
    },
    hover: Boolean,
    striped: Boolean,
    bordered: Boolean,
    small: Boolean,
    fixed: Boolean,
    dark: Boolean,
  },
  data() {
    return {
      uuid: this.$route.params.uuid,
      case_data: {
        created_by: {
          username: "",
        },
        updated_by: {
          username: "",
        },
        status: {
          closed: false,
        },
        case_template: {
          uuid: "",
        },
      },
      history_search: "",
      loading: true,
      cardCollapse: true,
      collapse_comments: true,
      collapse_observables: true,
      collapse_events: true,
      edit_title: false,
      edit_title_hint: false,
      collapse: {},
      tasks: [],
      task: {},
      case_history: [],
      event_fields: [
        "name",
        "created",
        "events",
        "reference",
        "status",
        "severity",
        "observables",
        "actions",
      ],
      toggleCollapse: true,
      deleteCaseModal: false,
      addObservableModal: false,
      caseTemplateModal: false,
      addObservableModal: false,
      caseObservableModal: false,
      closeCaseModal: false,
      linkCaseModal: false,
      runPlaybookModal: false,
      deleteCaseModal: false,
      caseTaskModal: false,
      dismissalComment: "",
      dismissalReason: null,
      edit_description_hint: false,
      edit_description: false,
      lockCase: false,
      activeTab: -1,
      users: [],
      assignee: null,
      comment: "",
      comments: [],
      tasks: [],
      selected: [],
      observables: [],
      reloadObservables: 1,
      reloadTasks: 1,
      tab_loading: false,
      search_filter: "",
      filtered_events: [],
      event_observables: {},
      related_cases: [],
      case_files: [],
      observableFilters: [{ filter_type: "status", data_type: "status", value: "Open" }],
      collapse_tasks: Array(),
      events_per_page: 10,
      current_events_page: 1,
      events_page_data: {},
      case_closed: false,
      original_status: {},
      case_statuses: [],
      edit_tags: false,
      edit_tags_hint: false,
      current_tags: [],
      edit_severity: false,
      edit_owner: false,
      edit_status: false,
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
      tlps: [
        {
          label: "White",
          value: 1,
        },
        {
          label: "Green",
          value: 2,
        },
        {
          label: "Amber",
          value: 3,
        },
        {
          label: "Red",
          value: 4,
        },
      ],
      event_data: {},
    };
  },
  created() {
    this.buildPage();
  },
  watch: {
    $route: function () {
      this.buildPage();
    },
    current_events_page: function () {
      this.filterEvents(this.uuid);
    },
    closeCaseModal: function () {
      if (!this.closeCaseModal) {
        if (this.case_closed) {
          this.case_data.status.closed = true; // This is hacky...figure out a better way
        } else {
          this.case_data.status.uuid = this.original_status;
        }
      }
    },
    linkCaseModal: function () {
      if (!this.linkCaseModal) {
        this.related_cases = this.$store.getters.related_cases;
        //this.loadRelatedCases()
      }
    },
    caseTemplateModal: function () {
      if (!this.caseTemplateModal) {
        this.loadData();
        this.reloadTasks = Math.random();
      }
    },
    activeTab: function () {
      if (this.activeTab == 0) {
        this.loadData();
      }
      if (this.activeTab == 1) {
        this.reloadObservables = Math.random();
      }
      if (this.activeTab == 4) {
        this.loadCaseFiles();
      }
      if (this.activeTab == 2) {
        this.filterEvents();
      }
      if (this.activeTab == 5) {
        this.loadComments();
      }
      if (this.activeTab == 3) {
        this.reloadTasks = Math.random();
      }
      if (this.activeTab == 6) {
        this.loadHistory();
      }
      if (this.activeTab == 7) {
        this.loadRelatedCases();
      }
    },
  },
  methods: {
    buildPage() {
      this.loading = true;
      this.activeTab = 0;
      this.uuid = this.$route.params.uuid;
      //this.loadRelatedCases()
      this.loadComments();
      this.original_status = this.case_data.status.uuid;
      this.filterEvents();
      this.$store.dispatch("getSettings", { uuid: this.case_data.organization });
      //this.$store.dispatch('getTags')

      for (let task in this.tasks) {
        this.collapse_tasks[this.tasks[task].order] = false;
      }
    },
    addTag(event) {
      const t = {
        name: event,
        uuid: "",
      };
      this.tags.push(t);
      this.current_tags.push(t);
    },
    updateCaseDescription() {
      this.case_data.description = this.$refs.descriptionEditor.invoke("getMarkdown");
    },
    editSeverity() {
      this.edit_severity = !this.edit_severity;
      // Create an event listener for a window click
      document.addEventListener("click", this.closeSeverityEdit);
    },
    closeSeverityEdit(e) {
      // If the click is not on the severity select, close the edit
      if (!e.target.id.includes("severity")) {
        console.log(e);
        this.edit_severity = false;
        document.removeEventListener("click", this.closeSeverityEdit);
      }
    },
    editStatus() {
      this.edit_status = !this.edit_status;
      // Create an event listener for a window click
      document.addEventListener("click", this.closeStatusEdit);
    },
    closeStatusEdit(e) {
      // If the click is not on the status select, close the edit
      if (!e.target.id.includes("status")) {
        this.edit_status = false;
        document.removeEventListener("click", this.closeStatusEdit);
      }
    },
    editOwner() {
      this.edit_owner = true;
      // Create an event listener for a window click
      document.addEventListener("click", this.closeOwnerEdit);
    },
    closeOwnerEdit(e) {
      // If the click is not on the owner select, close the edit
      if (!e.target.id.includes("owner") && !e.target.classList.contains("multiselect__select")) {
        console.log(e)
        this.edit_owner = false;
        document.removeEventListener("click", this.closeOwnerEdit);
      }
    },
    editTags() {
      this.current_tags = this.case_data.tags;
      this.edit_tags = !this.edit_tags;
      // If the tags have been edited, we need to update the current_tags
    },
    saveTags() {
      let uuid = this.uuid;
      let data = {
        tags: this.current_tags.map((tag) => {
          return tag.name;
        }),
      };
      this.$store.dispatch("updateCase", { uuid, data: data }).then((resp) => {
        this.case_data.tags = resp.data.tags;
        this.edit_tags = false;
      });
    },
    deleteCase() {
      let uuid = this.uuid;
      this.$store.dispatch("deleteCase", uuid).then((resp) => {
        this.$router.push({ path: "/cases/list" });
      });
    },
    updateTitle() {
      let uuid = this.uuid;
      let data = {
        title: this.case_data.title,
      };
      this.$store.dispatch("updateCase", { uuid, data }).then((resp) => {
        this.case_data = this.$store.getters.case_data;
        this.edit_title = false;
        this.edit_title_hint = false;
      });
    },
    closureComments() {
      if (this.comments != undefined) {
        return this.comments.filter(
          (comment) => comment.is_closure_comment == true && comment.message != ""
        );
      }
    },
    loadRelatedCases() {
      let uuid = this.uuid;
      this.tab_loading = true;
      this.$store.dispatch("getRelatedCases", uuid).then((resp) => {
        this.related_cases = this.$store.getters.related_cases;
        this.tab_loading = false;
      });
    },
    unlinkCase(target_uuid) {
      let uuid = this.uuid;
      this.$store
        .dispatch("unlinkCases", { uuid, data: { cases: [target_uuid] } })
        .then((resp) => {
          this.related_cases = this.$store.getters.related_cases;
          this.tab_loading = false;
        });
    },
    loadObservables() {
      this.tab_loading = true;
      this.$store
        .dispatch("getCaseObservablesFromEvents", { uuid: this.$route.params.uuid })
        .then((resp) => {
          this.observables = this.$store.getters.observables;
          this.tab_loading = false;
        });
    },
    loadHistory() {
      this.tab_loading = true;
      this.$store.dispatch("getCaseHistory", this.$route.params.uuid).then((resp) => {
        this.case_history = this.$store.getters.case_history;
        this.tab_loading = false;
      });
    },
    loadComments() {
      this.tab_loading = true;
      this.$store.dispatch("getCaseComments", this.$route.params.uuid).then((resp) => {
        this.comments = this.$store.getters.comments;
        this.tab_loading = false;
      });
    },
    loadCaseFiles() {
      this.tab_loading = true;
      this.$store
        .dispatch("getCaseFiles", { uuid: this.$route.params.uuid })
        .then((resp) => {
          this.case_files = this.$store.getters.case_files;
          this.tab_loading = false;
        });
    },
    loadData() {
      this.$store.dispatch("getCase", this.$route.params.uuid).then((resp) => {
        this.case_data = this.$store.getters.case_data;
        this.case_data.status.uuid = this.case_data.status.uuid;
        if (this.case_data.owner && this.case_data.owner.username != null) {
          this.assignee = this.case_data.owner;
        } else {
          this.assignee = { username: "Unassigned" };
        }

        this.$store
          .dispatch("getUsers", { organization: this.case_data.organization })
          .then((resp) => {
            this.users = this.$store.getters.users;
          });

        this.$store
          .dispatch("getCaseStatus", { organization: this.case_data.organization })
          .then((resp) => {
            this.case_statuses = resp.data.map(function (status) {
              return { value: status.uuid, label: status.name, closed: status.closed };
            });
          });

        this.loading = false;
      });
    },
    filteredBySignature() {
      if (this.observableFilters.some((filter) => filter.filter_type == "eventsig")) {
        return true;
      } else {
        return false;
      }
    },
    toggleObservableFilter(obs) {
      let exists = this.observableFilters.some((item) => {
        return item.value === obs.value;
      });

      // Can only have one status filter at a time
      if (obs.filter_type == "status") {
        this.observableFilters = this.observableFilters.filter(
          (item) => item.filter_type !== obs.filter_type
        );
      }

      if (!exists) {
        this.observableFilters.push(obs);
      } else {
        this.observableFilters = this.observableFilters.filter(
          (item) => item.value !== obs.value
        );
      }
      this.filterEvents();
    },
    sanitizeHTML(str) {
      var temp = document.createElement("div");
      temp.textContent = str;
      return temp.innerHTML;
    },
    extraObservables(observables) {
      let content = "<ul style='list-style-type: none; padding:0; margin: 0;'>";
      for (let o in observables) {
        let obs = observables[o];
        content += `<li><b>${obs.data_type}</b>: ${this.sanitizeHTML(obs.value)}</li>`;
      }
      content += "</ul>";
      return content;
    },
    filterEvents() {
      this.tab_loading = true;
      let status_filters = ["New", "Open", "Closed"];
      let tag_filters = [];
      let observables_filters = [];
      let severity_filter = [];
      let signature_filter = "";
      let grouped = false;
      let search = "";

      for (let f in this.observableFilters) {
        let filter = this.observableFilters[f];

        if (filter.filter_type == "eventsig") {
          signature_filter = filter.value;
        }

        if (filter.filter_type == "status") {
          status_filters.push(filter.value);
        }

        if (filter.filter_type == "tag") {
          tag_filters.push(filter.value);
        }

        if (filter.filter_type == "observable") {
          observables_filters.push(filter.value);
        }

        if (filter.filter_type == "search") {
          search = filter.value;
        }

        if (filter.filter_type == "severity") {
          severity_filter.push(filter.value);
        }
      }

      this.$store
        .dispatch("getCaseEvents", {
          uuid: this.uuid,
          signature: signature_filter,
          grouped: grouped,
          tags: tag_filters,
          status: status_filters,
          observables: observables_filters,
          severity: severity_filter,
          search: search,
          fields: "",
          page: this.current_events_page,
          page_size: 25,
        })
        .then((resp) => {
          this.filtered_events = resp.data.events;
          this.event_observables = resp.data.observables;
          this.events_page_data = resp.data.pagination;
          this.$store.commit("add_success");
          this.tab_loading = false;
        });
    },
    expandAll() {
      for (const c in this.collapse) {
        if (!this.collapse[c]) {
          this.collapse[c] = true;
        }
      }

      this.toggleCollapse = false;
    },
    updateSeverity() {
      let uuid = this.uuid;
      let severity = { severity: this.case_data.severity };
      this.edit_severity = false;
      this.$store.dispatch("updateCase", { uuid, data: severity }).then((resp) => {
        this.case_data = this.$store.getters.case_data;
      });
    },
    updateTLP() {
      let uuid = this.uuid;
      let tlp = { tlp: this.case_data.tlp };
      this.$store.dispatch("updateCase", { uuid, data: tlp }).then((resp) => {
        this.case_data = this.$store.getters.case_data;
      });
    },
    closeCase() {
      let _status = this.case_statuses.find((status) => status.label == "Closed");
      if (_status !== undefined) {
      }
      if (_status !== undefined && _status.closed === true) {
        this.case_data.status.uuid = _status.value;
        this.closeCaseModal = true;
      }
    },
    updateStatus() {
      let uuid = this.uuid;
      let status = { status_uuid: this.case_data.status.uuid };

      // Prompt for a reason before closing the case
      // else change the status
      if (
        this.case_statuses.filter(
          (status) => status.value == this.case_data.status.uuid && status.closed === true
        ).length > 0
      ) {
        this.closeCaseModal = true;
      } else {
        this.$store.dispatch("updateCase", { uuid, data: status }).then((resp) => {
          this.case_data = this.$store.getters.case_data;
          this.edit_status = false;
        });
      }
    },
    saveDescription() {
      let uuid = this.uuid;
      let description = { description: this.case_data.description };
      this.$store.dispatch("updateCase", { uuid, data: description }).then((resp) => {
        this.case_data = this.$store.getters.case_data;
      });
      this.edit_description = false;
    },
    updateAssignee(a) {
      let uuid = this.uuid;
      let assignee = { uuid: null };

      if (a.username == "Unassigned") {
        assignee = null;
      } else {
        assignee.uuid = a.uuid;
      }
      this.$store
        .dispatch("updateCase", { uuid, data: { owner: assignee } })
        .then((resp) => {
          this.case_data = this.$store.getters.case_data;
          this.edit_owner = false;
        });
      this.edit_description = false;
    },
    escalateCase(escalated = true) {
      let uuid = this.uuid;
      this.$store
        .dispatch("updateCase", { uuid, data: { escalated: escalated } })
        .then((resp) => {
          this.case_data = this.$store.getters.case_data;
        });
    },
    usersFind(query) {
      this.$store
        .dispatch("getUsersByName", {
          username: query,
          organization: this.case_data.organization,
        })
        .then((resp) => {
          this.users = this.$store.getters.users;
        });
    },
    collapseAll() {
      for (const c in this.collapse) {
        if (this.collapse[c]) {
          this.collapse[c] = false;
        }
      }
      this.toggleCollapse = true;
    },
    onHighlight(text) {
      console.log("highlight", text);
    },
    onShare(text) {
      console.log("share", text);
    },
    daysOpen() {
      return String(moment().diff(this.case_data.created_at, "days")) + " days";
    },
    getStatusColor(status) {
      switch (status) {
        case "New":
          return "secondary";
        case "Hold":
          return "warning";
        case "Closed":
          return "success";
        case "In Progress":
          return "info";
        default:
          return "dark";
      }
    },
    getSeverityColor(severity) {
      switch (severity) {
        case 1:
          return "dark";
        case 2:
          return "info";
        case 3:
          return "warning";
        case 4:
          return "danger";
        default:
          return "dark";
      }
    },
    getSeverityText(severity) {
      switch (severity) {
        case 1:
          return "Low";
        case 2:
          return "Medium";
        case 3:
          return "High";
        case 4:
          return "Critical";
        default:
          return "Low";
      }
    },
    getEventObservables(uuid) {
      return this.event_observables[uuid];
    },
    showDrawer(event_uuid) {
      let uuid = event_uuid;
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
    removeCaseTemplate() {
      let data = { case_template_uuid: null };
      let uuid = this.case_data.uuid;
      this.$store.dispatch("updateCase", { uuid, data }).then((resp) => {
        this.loadData();
        this.reloadTasks = Math.random();
      });
    },
  },
  filters: {
    firstTwo: function (value) {
      if (!value) return "";
      value = value.toString();
      return value.substring(0, 2);
    },
    capitalize: function (value) {
      if (!value) return "";
      value = value.toString();
      return value.toUpperCase();
    },
    truncate: function (value) {
      let maxLength = 50;
      if (!value) return "";
      value = value.toString();
      if (value.length > maxLength) {
        return value.substring(0, maxLength) + "...";
      } else {
        return value.substring(0, maxLength);
      }
    },
    defang: function (value) {
      if (this.settings.defang_observables) {
        return value.replace(":", "[:]").replace("http", "hxxp").replace(".", "[.]");
      } else {
        return value;
      }
    },
  },
};
</script>
