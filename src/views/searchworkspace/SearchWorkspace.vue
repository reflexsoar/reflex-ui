<template>
  <div>
    <CTabs
      addNavWrapperClasses="page-nav"
      addTabClasses="page-nav-tab-body"
      addNavClasses="page-nav-tab"
      :activeTab.sync="active_tab"
    >
      <CTab v-for="(tab, i) in search_tabs">
        <template #title>
          {{ tab.name }}&nbsp;<i
            class="fas fa-times"
            @click="removeSearch(i)"
            style="cursor: pointer"
          ></i>
        </template>

        <section class="flex-wrapper" id="search">
          <div class="flex-grid">
            <div class="d-col-2">
              <SelectInput
                size="lg"
                :value.sync="tab.dataset"
                :options="datasets"
                style="margin-bottom: 0px"
                :taggable="true"
                :grouped="true"
              />
            </div>
            <div class="d-col-9">
              <CInput
                size="lg"
                v-on:keyup.enter="search(tab)"
                v-model="tab.search"
                placeholder="Enter your hunting query"
                required
                style="margin-bottom: 0px"
              >
              </CInput>
            </div>

            <div class="d-col-2">
              <CButtonGroup>
                <CButton @click="search(tab)" color="primary">Search</CButton>
                <CDropdown toggler-text="Settings" color="secondary">
                  <CDropdownItem @click="addSearch()">New Search</CDropdownItem>
                  <CDropdownItem @click="tab.search_on_change = !tab.search_on_change">
                    <!-- show a checkmark if the search on change is enabled -->
                    <span v-if="tab.search_on_change"
                      ><i class="fas fa-check"></i>&nbsp;</span
                    >
                    Search on change
                  </CDropdownItem>
                  <CDropdownItem @click="tab.show_chart = !tab.show_chart">
                    <!-- show a checkmark if the search on change is enabled -->
                    <span v-if="tab.show_chart"
                      ><i class="fas fa-check"></i>&nbsp;</span
                    >
                    Show chart
                  </CDropdownItem>
                </CDropdown>
              </CButtonGroup>
            </div>
          </div>
        </section>
        <section class="flex-wrapper" id="filter" v-if="tab.filters.length > 0">
          <div class="flex-grid" id="search">
            <div class="d-col-all text-left">
              <!-- horizontal list of badges with a close button that removes the filter -->
              <li
                style="display: inline; margin-right: 2px"
                v-for="(filter, i) in tab.filters"
                :key="i"
              >
                <span class="reflex-filter reflex-badge-secondary tag-list">
                  <b>{{ filter.exclude ? "NOT" : "" }}</b> {{ filter.field }}:
                  {{ filter.value }}
                  <i
                    class="fas fa-times"
                    @click="removeFilter(tab, i)"
                    style="cursor: pointer; margin-left:2px;"
                  ></i>
                </span>
              </li>
            </div>
          </div>
        </section>
        <section class="flex-wrapper" id="results">
          <div class="flex-grid">
            <div class="d-col-2 text-left field-selector">
              <div class="field-selection">
                <CInput v-model="field_search" placeholder="Search fields">
                  <template #append>
                    <CButton color="secondary" size="sm" @click="hide_field_selection()"
                      ><i class="fa-solid fa-square-caret-left"></i
                    ></CButton>
                  </template>
                </CInput>
                <div class="field-list-wrapper">
                  <div class="field-group-header">
                    Selected Fields
                    <span
                      v-if="tab.fields.length > 0"
                      class="reset-fields"
                      @click="tab.fields = []"
                      >| Clear All</span
                    >
                  </div>
                  <draggable
                    v-model="tab.fields"
                    group="selected_fields"
                    @start="drag = true"
                    @end="drag = false"
                  >
                    <div v-for="(field, i) in tab.fields" :key="i" :ref="field.name">
                      <div class="flex-grid field-picker-item text-left">
                        <div class="d-col-11">
                          <div class="field-name">{{ field.name }}</div>
                        </div>
                        <div class="d-col-1">
                          <div
                            class="field-picker-hide"
                            @click="deselectField(tab, field)"
                          >
                            <i class="fas fa-times" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </draggable>
                  <div class="field-group-header">Available</div>

                  <div
                    v-for="field in filtered_fields(tab)"
                    :key="field.name"
                    :ref="field.name"
                  >
                    <div class="flex-grid field-picker-item text-left">
                      <div class="d-col-11">
                        <div class="field-name">{{ field.name }}</div>
                      </div>
                      <div class="d-col-1">
                        <div class="field-picker-show" @click="selectField(tab, field)">
                          <i class="fas fa-eye" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="field-selection-toggle">
                <CButton
                  @click="show_field_selection()"
                  size="sm"
                  color="secondary"
                  v-c-tooltip="{ content: 'Show Fields', placement: 'right' }"
                  ><i class="fa-solid fa-square-caret-right"></i
                ></CButton>
              </div>
            </div>
            <div class="d-col-10 text-left search-results">
                
                  <div class="flex-grid" style="margin-bottom: 10px" v-if="tab.show_chart">
                    <div class="d-col-12" style="background-color: #fff; border: 1px solid #ddd; padding: 10px">
              <CChartBar
                :datasets="timeline_datasets(tab)"
                :labels="timeline_datalabels(tab)"
                style="height: 150px; width:100%"
                :options="{
                  responsive: true,
                  maintainAspectRatio: false,
                  legend: {
                    display: false
                  },
                  scales: {
                    xAxes: [
                      {
                        type: 'time',
                        time: {
                          unit: 'day',
                          displayFormats: {
                            day: 'MMM D'
                          }
                        },
                        gridLines: {
                          display: true,
                        },
                        ticks: {
                          display: true,
                          autoSkip: true,
                        },
                      },
                    ],
                    yAxes: [
                      {
                        beginAtZero: true,
                        gridLines: {
                          display: true,
                        },
                        ticks: {
                          display: true,
                          autoSkip: true,
                          maxTicksLimit: 5
                        },
                      },
                    ],
                  },
                }"
              />
          </div>
          
          </div>
                <div class="table-wrapper">
                  <table class="log-table">
                    <thead >
                      <tr >
                        <th colspan="100%" class="table-controls">
                        <button class="field-value-control" @click="fullScreenTable(tab)">
                      <i v-if="!tab.full_screen_log_table" class="fas fa-maximize"></i>
                      <i v-if="tab.full_screen_log_table" class="fas fa-minimize"></i>
                    </button>
                        </th>
                      </tr>
                      <tr>
                        <th class="fitwidth" scope="col"></th>
                        <th scope="col"
                          v-for="field in column_fields(tab)"
                          :key="field.key"
                          class="fitwidth field-header"
                        >
                          {{ field.label }}
                          <span class="field-value-controls">
                            <button class="field-value-control">
                              <i class="fas fa-sort" />
                            </button>
                            <button
                              class="field-value-control"
                              @click="deselectField(tab, { name: field.key })"
                            >
                              <i class="fas fa-times" />
                            </button>
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-if="tab.search_complete == false">
                        <td class="text-center" colspan="100%" style="height: 160px">
                          <CSpinner style="width: 125px; height: 125px" />
                        </td>
                      </tr>
                      <tr
                        v-if="flattened_results(tab).length == 0 && tab.search_complete"
                      >
                        <td class="text-center" colspan="100%">
                          <span v-if="tab.search_failed">
                            <CAlert color="warning">
                              <strong>Search failed</strong>
                              <br />
                              {{ tab.failure_reason }}
                            </CAlert>
                            </span>
                          <span v-else>
                          No results {{ tab.search_failed }}
                          </span>
                          </td>
                      </tr>
                      <tr
                        v-for="(result, i) in flattened_results(tab)"
                        :key="result._id"
                        v-else-if="tab.search_complete"
                      >
                        <td class="fitwidth">
                          <button
                            class="field-value-control"
                            v-on:click="view_log(result)"
                          >
                            <i
                              class="fa-solid fa-up-right-and-down-left-from-center expand-icon"
                            ></i>
                          </button>
                          <input type="checkbox" class="row-checkbox" />
                        </td>
                        <td
                          v-for="field in column_fields(tab)"
                          :key="field.key"
                          class="fitwidth field-value"
                        > 
                          <span v-if="field.key === '_'">
                            <span v-for="(v, k) in result" :key="k">
                              <span class="reflex-badge reflex-badge-secondary">{{
                                k
                              }}</span>
                              <span class="reflex-badge">{{ v }}</span>
                            </span>
                          </span>
                          <span v-else>
                            <span v-if="result[field.key] == undefined" class="empty-value">empty</span>
                            <span :ref="i + '.' + field.key" v-else>{{ result[field.key] }}</span
                            >
                            
                            &nbsp;
                            <span class="field-value-controls" v-if="result[field.key] != undefined">
                              <button
                                class="field-value-control"
                                @click="copyValue(result[field.key], i, field.key)"
                              >
                                <i class="fas fa-clipboard" />
                              </button>
                              <button
                                class="field-value-control"
                                v-on:click="
                                  filterByValue(tab, result[field.key], field.key)
                                "
                              >
                                <i class="fas fa-filter" />
                              </button>
                            </span>
                          </span>
                        </td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colspan="100%" class="table-controls">
                          <span class="pagination"> 
                            <span v-bind:disabled="tab.current_page > 1" class="page-number" v-on:click="nextPage(tab, tab.current_page-1)">
                             <i class="fa-solid fa-chevron-left"></i>
                            </span>
                            <span v-for="page in maxPages(tab)" >
                              <button class="page-number" v-bind:class="page == tab.current_page ? 'active' : null" v-on:click="nextPage(tab, page)">
                                {{ page }}
                              </button>
                            </span>
                            <span v-bind:disabled="tab.current_page < maxPages(tab)" class="page-number" v-on:click="nextPage(tab, tab.current_page+1)">
                              <i class="fa-solid fa-chevron-right"></i>
                              </span>
                            <span class="result-count"> | {{ tab.results.length }} results</span>
                          </span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
            </div>
          </div>
        </section>
      </CTab>
    </CTabs>
    <LogDrawer />
  </div>
</template>

<style scoped>

.table-controls {
  background-color: #efefef;
  border-bottom: 1px solid #ddd;
  padding: 5px;
  font-size: 14px;
  position: sticky;
}

.table-wrapper.full-screen {
  /* Bring the log wrapper to the front and make it full screen */
  z-index: 20000;
  position: fixed;
  display: block;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #fff;
  min-height: 100vh;
}

.empty-value {
  color: #aaa;
}

.field-list-wrapper {
  overflow-x: hidden;
  overflow-y: auto;
  min-height: calc(100vh - 330px);
  max-height: calc(100vh - 330px);
}

.field-name {
  overflow: hidden;
  white-space: nowrap;
  /* ellipsis */
  text-overflow: ellipsis;
  max-width: 95%;
}

.field-selection-toggle {
  display: none;
}

/* Create a show class that shows the field-selection-toggle */
.field-selection-toggle.show {
  display: block;
}

/* Create a hide class that hides the field-selection div */
.field-selection.hide {
  display: none;
}

.search-results.expand {
  width: calc(100% - 50px);
}

.field-selector.shrink {
  width: auto;
}

.field-list-wrapper .collapse {
  max-width: 0%;
}

/* Transition the shrink and expand classes */
.field-selector.shrink,
.search-results.expand {
  transition: width 0.5s ease-in-out;
}

/* Transition the collapse class */
.field-list-wrapper .collapse {
  transition: max-width 1s ease-in-out;
}

.field-value-controls {
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
}

.field-header:hover .field-value-controls,
.field-value:hover .field-value-controls {
  opacity: 1;
}

.field-value-control {
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  color: #3c4b64;
  margin-right: 5px;
  font-size: 12px;
}

.pagination {
  font-size: 13px;
}

.page-number {
  padding: 2px 5px;
  margin: 0 2px;
  cursor: pointer;
  line-height: 1.2;
  font-weight: 500;
  border: 0;
}

.page-number:focus {
  outline: none;
}

.page-chevron {
  padding: 2px 5px;
  margin: 0 2px;
  cursor: pointer;
  line-height: 1.2;
  font-weight: 500;
}

.page-number.active {
  background-color: #3c4b64;
  color: #fff;
  border-radius: 2px;
}

.result-count {
  font-family: Inter;
}

/* Hide the focus outline on the buttons */
.field-value-control:focus {
  outline: none;
}

.reflex-badge {
  font-size: 12px !important;
}

.reflex-filter {
  background-color: #3c4b64;
  color: #fff;
  border-radius: 2px;
  padding: 2px 5px;
  margin: 0 2px;
  cursor: pointer;
  line-height: 1.2;
  font-weight: 500;
  padding: 6px 8px 6px 6px;
}

.field-picker-item {
  margin: 0;
  padding: 0px;
  padding-left: 5px;
  margin-bottom: 4px;
}

.field-picker-item div[class^="d-col-"] {
  padding: 0 !important;
}

.table-wrapper {
  overflow-x: auto;
  overflow-y: auto;
  min-height: calc(100vh - 310px);
  background-color: #fff;
  max-height: calc(100vh - 310px);
}

.log-table {
  margin: auto;
  border-collapse: collapse;
  width: 100%;
  height: 100%;
  max-width: 100%;
}

.log-table thead {
  /* Make the table header stick to the top */
  position: sticky;
  top: 0;
  background-color: #fff;
  z-index: 1;
  border: 1px solid #ddd;
}

.log-table tfoot {
  /* Make sticky footer */
  position: sticky;
  bottom: 0;
  background-color: #fff;
  z-index: 1;
  border-top: 1px solid #ddd;
}

.log-table tbody {
  width: 100%;
  height: 100% !important;
}

.log-table th,
.log-table td {
  text-align: left;
  padding: 8px;
  border: 1px solid #ddd;
}

.log-table tr {
  max-height: 25px;
  font-family: "Roboto Mono";
}

.log-table tr:nth-child(even) {
  background-color: #f2f2f2;
}

.log-table th {
  background-color: light-grey;
}

.log-table th.fitwidth,
.log-table td.fitwidth {
  /* Make the table cells expand to fit the content */
  width: 1px;
  white-space: nowrap;
}

.row-checkbox {
  /* Style the checkbox so it looks nice */
  width: 15px;
  height: 15px;
  border: 1px solid #ddd;
  border-radius: 2px;
  margin: 0;
  padding: 0;
  cursor: pointer;
  padding-top: 2px;
  vertical-align: middle;
  margin-left: 5px;
}

.field-header,
.field-value {
  font-family: "Roboto Mono";
  font-size: 12px;
}

.field-header {
  font-weight: 600;
}

.expand-icon {
  /* Hide the expand icon by default */
  opacity: 0;
  cursor: pointer;
}

/* Show the expand icon when it's cell is hovered over */
.log-table tr:hover .expand-icon {
  opacity: 1;
}

.reset-fields {
  font-weight: normal;
  cursor: pointer;
}

.flex-wrapper {
  margin-left: -30px;
  margin-right: -30px;
}

.flex-grid {
  display: flex;
  justify-content: space-between;
  text-align: center;
}

.flex-grid:nth-child(odd) div[class^="d-col-"] {
  padding: 0.5rem 0.5rem;
}
.flex-grid:nth-child(even) div[class^="d-col-"] {
  padding: 0.5rem 0.5rem;
}

@media (min-width: 980px) {
  .flex-grid {
    margin-top: 2rem;
  }
  .flex-grid:first-child {
    margin-top: 0;
  }

  .d-col-1 {
    width: 7.05%;
  }
  .d-col-2 {
    width: 15.5%;
  }
  .d-col-3,
  .d-col-thirds {
    width: 23.95%;
  }
  .d-col-4,
  .d-col-quarters {
    width: 32.4%;
  }
  .d-col-5 {
    width: 40.85%;
  }
  .d-col-6,
  .d-col-halfs {
    width: 49.3%;
  }
  .d-col-7 {
    width: 57.75%;
  }
  .d-col-8 {
    width: 66.2%;
  }
  .d-col-9 {
    width: 74.65%;
  }
  .d-col-10 {
    width: 83.1%;
  }
  .d-col-11 {
    width: 91.55%;
  }
  .d-col-12,
  .d-col-full {
    width: 100%;
  }
}

@media only screen and (min-width: 661px) and (max-width: 979px) {
  .flex-grid {
    flex-flow: row wrap;
  }

  .t-col-4,
  .t-col-6,
  .t-col-12 {
    margin-top: 2rem;
  }

  .t-col-4 {
    width: 31.46%;
  }
  .t-col-6 {
    width: 48.6%;
  }
  .t-col-12 {
    width: 100%;
  }

  .flex-grid:first-child .t-col-4,
  .flex-grid:first-child .t-col-6,
  .flex-grid:first-child .t-col-12 {
    margin-top: 0;
  }
}
</style>

<script>
import VueJsonPretty from "vue-json-pretty";
import "vue-json-pretty/lib/styles.css";
import draggable from "vuedraggable";
import SelectInput from "../components/SelectInput.vue";

import LogDrawer from "@/views/searchworkspace/LogDrawer.vue";

import { CChartBar } from "@coreui/vue-chartjs";

export default {
  name: "SearchWorkspace",
  components: {
    VueJsonPretty,
    SelectInput,
    draggable,
    CChartBar,
    LogDrawer,
  },
  created() {
    this.$store.commit("set", ["logDrawerMinimize", true]);
  },
  data() {
    return {
      active_tab: 0,
      field_filters: [],
      hunt_query: "",
      datasets: [
        {
          name: "Tellaro",
          options: [
            {
              value: "events",
              label: "Events",
            },
            {
              value: "cases",
              label: "Cases",
            },
            {
              value: "artifacts",
              label: "Event Artifacts",
            },
          ],
        },
        {
          name: "External Sources",
          options: [
            { value: "ls1", label: "Log Source 1" },
            { value: "ls2", label: "Log Source 2" },
          ],
        },
      ],
      search_tabs: [
        {
          name: "Reflex Events",
          search: "title: *",
          dataset: "events",
          filters: [],
          date_range: {
            start: null,
            end: null,
          },
          results: [],
          fields: [],
          search_on_change: false,
          search_complete: true,
        search_failed: false,
        failure_reason: "",
          pages: 0,
          current_page: 1,
          hide_empty_fields: false,
        full_screen_log_table: false,
        timefield: '@timestamp',
        show_chart: true
        },
        {
          name: "User logins from new countries",
          search:
            "event.code:4624 AND NOT geoip.country_iso_code:US AND NOT geoip.country_iso_code:CA",
          dataset: "events",
          filters: [],
          date_range: {
            start: null,
            end: null,
          },
          results: [],
          fields: [],
          search_on_change: false,
          search_complete: true,
        search_failed: false,
        failure_reason: "",
          pages: 0,
          current_page: 1,
          hide_empty_fields: false,
        full_screen_log_table: false,
        timefield: '@timestamp',
        show_chart: true
        },
      ],
      results: [],
      selected_fields: [],
      field_search: "",
      hunt_complete: true,
      fields: [
        {
          type: "keyword",
          name: "event.code",
        },
        {
          type: "keyword",
          name: "process.pid",
        },
        {
          type: "keyword",
          name: "process.name",
        },
        {
          type: "keyword",
          name: "process.path",
        },
        {
          type: "keyword",
          name: "process.command_line",
        },
        {
          type: "ip",
          name: "source.ip",
        },
        {
          type: "ip",
          name: "destination.ip",
        },
        {
          type: "text",
          name: "message",
        },
        {
          type: "meta",
          name: "_source",
        },
      ],
      events: [
        {
          event: {
            code: 1,
          },
          process: {
            pid: 1,
            name: "cmd.exe",
            path: "C:\\Windows\\System32\\cmd.exe",
            command_line: "cmd.exe /c echo hello world",
          },
          host: {
            name: "DESKTOP-1234",
          },
        },
        {
          event: {
            code: 3,
          },
          process: {
            pid: 1,
            name: "cmd.exe",
            path: "C:\\Windows\\System32\\cmd.exe",
          },
          source: {
            ip: "192.0.2.100",
          },
          destination: {
            ip: "69.7.235.50",
          },
        },
      ],
      dataset: "",
    };
  },

  methods: {
    maxPages(tab) {
      // Return the max number of pages based on the number of results and the page size of 100
      return Math.ceil(tab.results.length / 100);
    },
    nextPage(tab, page) {
      if(page < 1) {
        page = 1
      }

      if(page > this.maxPages(tab)) {
        page = this.maxPages(tab)
      }
      tab.current_page = page;
    },
    view_log(entry) {
      this.$store.commit("set", [
        "logDrawerMinimize",
        !this.$store.getters.logDrawerMinimize,
      ]);
      this.$store.commit("set", ["searchWorkspaceLog", entry]);
    },
    timeline_datasets(tab) {
      // Return the tab.aggregations.time_buckets.buckets in a format that can be used by the timeline chart
      let data = {
        data: [],
        backgroundColor: "#3c4b64",
        label: "Hits"
      };

      if(tab.aggregations == undefined) {
        return [data]
      }

      for (let bucket in tab.aggregations.time_buckets.buckets) {
        data.data.push(tab.aggregations.time_buckets.buckets[bucket].doc_count);
      }

      return [data];
    },
    timeline_datalabels(tab) {
      // Return the tab.aggregations.time_buckets.buckets in a format that can be used by the timeline chart
      let data = [];

      if(tab.aggregations == undefined) {
        return data
      }

      for (let bucket in tab.aggregations.time_buckets.buckets) {
        data.push(tab.aggregations.time_buckets.buckets[bucket].key_as_string);
      }

      return data;
    },
    fullScreenTable(tab) {
      // Find the table-wrapper and add the full-screen class if it doesn't exist, otherwise remove it
      let log_wrapper = document.querySelector(".table-wrapper");
      if (!log_wrapper.classList.contains("full-screen")) {
        tab.full_screen_log_table = true;
        log_wrapper.classList.add("full-screen");
      } else {
        log_wrapper.classList.remove("full-screen");
        tab.full_screen_log_table = false;
      }

      
    },
    hide_field_selection() {
      // Find the field-selection-toggle and remove the hide class without using refs
      document.querySelector(".field-selection-toggle").classList.add("show");

      // Find the field-selection and add the hide class
      document.querySelector(".field-selection").classList.add("hide");

      // Add the expand class to the search-results
      document.querySelector(".search-results").classList.add("expand");

      // Add the shrink class to the field-selector
      document.querySelector(".field-selector").classList.add("shrink");
    },
    show_field_selection() {
      // Find the field-selection-toggle and add the hide class without using refs
      document.querySelector(".field-selection-toggle").classList.remove("show");

      // Find the field-selection and remove the hide class
      document.querySelector(".field-selection").classList.remove("hide");

      // Replace the d-col-12 on search-results with d-col-10
      document.querySelector(".search-results").classList.remove("expand");

      // Remove the shrink class from the field-selector
      document.querySelector(".field-selector").classList.remove("shrink");
    },
    column_fields(tab) {
      let locked_fields = [{ key: tab.timefield, label: tab.timefield }];
      if (tab.fields.length > 0) {
        return [
          ...locked_fields,
          ...tab.fields.map((field) => {
            return { key: field.name, label: field.name };
          }),
        ];
      } else {
        return [...locked_fields, { key: "_", label: "message" }];
      }
    },

    filtered_selected(tab) {
      return tab.fields.filter((field) => {
        return field.name.toLowerCase().includes(this.field_search.toLowerCase());
      });
    },
    filtered_fields(tab) {
      let fields = this.available_fields(tab).filter((field) => {
        // If the search string is not empty, filter the fields by the search string and selected fields
        if (this.field_search.length > 0) {
          return (
            field.name.toLowerCase().includes(this.field_search.toLowerCase()) &&
            !tab.fields.filter((f) => f.name === field.name).length > 0
          );
        } else {
          // If the search string is empty, only return fields that are not selected
          return !tab.fields.filter((f) => f.name === field.name).length > 0;
        }
      });

      // Sort the fields alphabetically
      return fields.sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
    },
    available_fields(tab) {
      /* Find all the root level keys in the flattened results */
      let keys = [];
      let fields = [];

      this.flattened_results(tab).forEach((result) => {
        Object.keys(result).forEach((key) => {
          if (!keys.includes(key)) {
            keys.push(key);
            fields.push({
              name: key,
            });
          }
        });
      });

      // Remove the tabs timefield from the list
      fields = fields.filter((field) => {
        return field.name !== tab.timefield;
      });
      return fields;
    },
    flattened_results(tab) {
      /* Slice the results by the current page e.g 0-100, 100-200, etc */
      let tab_results = tab.results.slice(
        (tab.current_page - 1) * 100,
        tab.current_page * 100
      );

      /* Flatten the results */
      return tab_results.map((result) => {
        return this.flatten_json(result._source);
      });
    },
    addSearch() {
      // Add a new tab
      this.search_tabs.push({
        name: "New search",
        search: "",
        dataset: "events",
        filters: [],
        date_range: {
          start: null,
          end: null,
        },
        results: [],
        fields: [],
        search_on_change: false,
        search_complete: true,
        search_failed: false,
        failure_reason: "",
        pages: 0,
        current_page: 1,
        hide_empty_fields: false,
        full_screen_log_table: false,
        timefield: '@timestamp',
        show_chart: true
      });

      this.active_tab = this.search_tabs.length - 1;
    },
    removeSearch(i) {
      // Set the active_tab to the previous tab
      this.active_tab = i - 1;

      // Remove the current tab
      this.search_tabs.splice(i, 1);

      // If there are no more tabs, add a new one
      if (this.search_tabs.length == 0) {
        this.addSearch();
      }
    },
    copyValue(value, i, field) {
      // Copy the value to the clipboard
      navigator.clipboard.writeText(value).then(() => {
        // Find the span that contains the value and set its opacity to 0.5
        let span = this.$refs[i + "." + field].find((span) => {
          return span.innerText === value;
        });

        span.style.opacity = 0.5;

        // After 1 second, set the opacity back to 1
        setTimeout(() => {
          span.style.opacity = 1;
        }, 500);
      });
    },
    removeFilter(tab, i) {
      tab.filters.splice(i, 1);
      if (tab.search_on_change) {
        this.search(tab);
      }
    },
    filterByValue(tab, value, field) {
      let _filter = {
        value: value,
        field: field,
        exclude: false,
        operator: "is",
        active: true,
      };

      // If this filter already exists, change it to excluded and replace it
      let existing_filter = tab.filters.find((filter) => {
        return filter.value === value && filter.field === field;
      });

      if (existing_filter) {
        existing_filter.exclude = !existing_filter.exclude;
        _filter = existing_filter;
      } else {
        tab.filters.push(_filter);
      }

      if (tab.search_on_change) {
        this.search(tab);
      }
    },
    flatten_json(o) {
      var out = {};
      function flatten(x, name) {
        /* Flatten everything except arrays */
        if (Object(x) !== x || Array.isArray(x)) {
          out[name] = x;
        } else {
          for (var a in x) {
            flatten(x[a], name ? name + "." + a : a);
          }
        }
      }
      flatten(o);
      return out;
    },
    selectField(tab, field) {
      // If the field is not already selected, add it
      if (!tab.fields.map((f) => f.name).includes(field.name)) {
        tab.fields.push(field);
      }
    },
    deselectField(tab, field) {
      tab.fields = tab.fields.filter((item) => {
        return item.name !== field.name;
      });
    },
    search: function (tab) {
      let query = {
        query: tab.search,
        dataset: tab.dataset,
        filters: tab.filters,
        date_range: tab.date_range,
      };

      tab.search_complete = false;
      this.$store.dispatch("runThreatHunt", query).then((resp) => {
        tab.results = resp.data.response.hits.hits;
        tab.pages = resp.data.pages;
        tab.aggregations = resp.data.response.aggregations;
        tab.timefield = resp.data.timefield;
        tab.search_complete = true;
        tab.search_failed = false;
        tab.failure_reason = "";
        tab.current_page = 1;
      }).catch((err) => {
        tab.search_complete = true;
        tab.search_failed = true;
        tab.failure_reason = err.response.data.message;
        tab.timefield = '@timestamp';
        tab.results = [];
        tab.current_page = 1;
      });
    },
    flatten: function (obj) {
      var result = {};
      function recurse(cur, prop) {
        if (Object(cur) !== cur) {
          result[prop] = cur;
        } else if (Array.isArray(cur)) {
          for (var i = 0, l = cur.length; i < l; i++)
            recurse(cur[i], prop + "[" + i + "]");
          if (l == 0) result[prop] = [];
        } else {
          var isEmpty = true;
          for (var p in cur) {
            isEmpty = false;
            recurse(cur[p], prop ? prop + "." + p : p);
          }
          if (isEmpty && prop) result[prop] = {};
        }
      }
      recurse(obj, "");
      return result;
    },
  },
};
</script>
