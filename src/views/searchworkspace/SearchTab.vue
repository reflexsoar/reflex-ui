<template>
  <div>
    <section class="flex-wrapper" id="search">
      <div class="flex-grid">
        <div class="d-col-2">
          <SelectInput
            size="lg"
            :value.sync="dataset"
            :options="datasets"
            style="margin-bottom: 0px"
            :taggable="true"
            :grouped="true"
          />
        </div>
        <div class="d-col-9">
          <CInput
            v-on:keyup.enter="search()"
            v-model="query"
            placeholder="Enter your hunting query"
            required
            style="margin-bottom: 0px"
          >
            <template #append>
              <CButton @click="search()" color="primary" size="sm" class="no-shadow"
                >Search</CButton
              >
            </template>
          </CInput>
        </div>
        <div class="d-col-1">
          <CDropdown color="secondary">
            <template #toggler>
              <button class="btn btn-secondary no-shadow">
                <i class="fas fa-calendar"></i>
              </button>
            </template>
            <div class="date-options">
              <label>Quick select</label>
              <div class="quick-dates">
                <div class="quick-date-part">
                  <select class="form-control" v-model="quick_date_settings.period">
                    <option value="last">Last</option>
                    <option value="next">Next</option>
                  </select>
                </div>
                <div class="quick-date-part">
                  <input
                    type="number"
                    class="form-control"
                    v-model="quick_date_settings.value"
                  />
                </div>
                <div class="quick-date-part">
                  <select class="form-control" v-model="quick_date_settings.unit">
                    <option value="s">Seconds</option>
                    <option value="m">Minutes</option>
                    <option value="h">Hours</option>
                    <option value="d">Days</option>
                    <option value="w">Weeks</option>
                    <option value="M">Months</option>
                    <option value="y">Years</option>
                  </select>
                </div>
                <div class="quick-date-part">
                  <CButton
                    color="secondary"
                    class="btn-block no-shadow"
                    @click="setDateRange()"
                    >Apply</CButton
                  >
                </div>
              </div>
              <hr />
              <label>Commonly Used</label>
              <div class="quick-dates">
                <li class="date-option" v-for="d in quick_dates" @click="setQuickDate(d)">
                  {{ d.label }}
                </li>
              </div>
              <hr />
              <v-date-picker v-model="date_range" mode="dateTime" :masks="masks" is-range>
                <template v-slot="{ inputValue, inputEvents }">
                  <CInput
                    label="Start Date"
                    aria-label="Start Date"
                    :value="inputValue.start"
                    v-on="inputEvents.start"
                  >
                    <template #prepend>
                      <CButton
                        aria-label="Start Date"
                        disabled
                        color="secondary"
                        size="sm"
                        class="no-shadow"
                        ><CIcon name="cil-calendar"
                      /></CButton>
                    </template>
                  </CInput>
                  <CInput
                    label="End Date"
                    aria-label="End Date"
                    :value="inputValue.end"
                    v-on="inputEvents.end"
                  >
                    <template #prepend>
                      <CButton
                        aria-label="End Date"
                        disabled
                        color="secondary"
                        size="sm"
                        class="no-shadow"
                        ><CIcon name="cil-calendar"
                      /></CButton>
                    </template>
                  </CInput>
                  <button class="btn btn-secondary btn-block no-shadow" @click="search()">
                    Apply
                  </button>
                </template>
              </v-date-picker>
              <hr />
              <label>Automatic Refresh</label>
              <div class="quick-dates">
                <div style="width: 10%">
                  <RSwitch :checked.sync="auto_refresh" color="success" />
                </div>
                <div style="width: 40%">
                  <input
                    type="number"
                    class="form-control"
                    v-model.number="refresh_interval"
                    placeholder="Refresh Interval"
                  />
                </div>
                <div style="width: 40%">
                  <select class="form-control" v-model="refresh_interval_unit">
                    <option value="s">Seconds</option>
                    <option value="m">Minutes</option>
                    <option value="h">Hours</option>
                  </select>
                </div>
              </div>
            </div>
          </CDropdown>
        </div>

        <div class="d-col-1 text-right">
          <CDropdown toggler-text="Options" color="secondary">
            <CDropdownItem @click="addSearch()">New Search</CDropdownItem>
            <CDropdownItem @click="search_on_change = !search_on_change">
              <!-- show a checkmark if the search on change is enabled -->
              <span v-if="search_on_change"><i class="fas fa-check"></i>&nbsp;</span>
              Search on change
            </CDropdownItem>
            <CDropdownItem @click="show_chart = !show_chart">
              <!-- show a checkmark if the search on change is enabled -->
              <span v-if="show_chart"><i class="fas fa-check"></i>&nbsp;</span>
              Show chart
            </CDropdownItem>
          </CDropdown>
        </div>
      </div>
    </section>
    <section class="flex-wrapper" id="filter" v-if="filters.length > 0">
      <div class="flex-grid" id="search">
        <div class="d-col-full text-left">
          <!-- horizontal list of badges with a close button that removes the filter -->
          <li class="filter-item" v-for="(filter, i) in filters" :key="i">
            <span class="reflex-filter reflex-badge-secondary tag-list">
              <b>{{ filter.exclude ? "NOT" : "" }}</b> {{ filter.field }}:
              {{ filter.value }}
              <i
                class="fas fa-times"
                @click="removeFilter(filter)"
                style="cursor: pointer; margin-left: 2px"
              ></i>
            </span>
          </li>
        </div>
      </div>
    </section>
    <section class="flex-wrapper" id="results">
      <div class="flex-grid">
        <div
          class="d-col-2 text-left field-selector"
          v-bind:class="hide_field_selection ? 'shrink' : ''"
        >
          <FieldFilter
            :options="available_fields()"
            :fields.sync="fields"
            :hide_field_filter.sync="hide_field_selection"
          />
        </div>
        <div
          class="d-col-10 text-left search-results"
          v-bind:class="hide_field_selection ? 'expand' : ''"
        >
          <div class="flex-grid" style="margin-bottom: 10px" v-if="show_chart">
            <div
              class="d-col-12"
              style="background-color: #fff; border: 1px solid #ddd; padding: 10px"
            >
              <div class="text-right">
                <CButtonGroup>
                  <CDropdown
                    toggler-text="Chart Type"
                    color="secondary"
                    size="sm"
                    style="background-color: none; padding: 5px"
                  >
                    <template #toggler-content>
                      <b>Chart type:</b>&nbsp;{{ chart_type ? chart_type : "bar" }}
                    </template>
                    <CDropdownItem @click="chart_type = 'bar'">Bar</CDropdownItem>
                    <CDropdownItem @click="chart_type = 'line'">Line</CDropdownItem>
                    <CDropdownItem @click="chart_type = 'pie'">Pie</CDropdownItem>
                  </CDropdown>
                  <CDropdown
                    color="secondary"
                    size="sm"
                    style="background-color: none; padding: 5px"
                  >
                    <template #toggler-content>
                      <b>Group by:</b>&nbsp;{{ chart_group_by }}
                    </template>
                    <div style="max-height: 200px; overflow-y: scroll">
                      <CDropdownItem
                        v-for="field in available_fields()"
                        @click="chart_group_by = field.name"
                        v-if="field.type == 't'"
                      >
                        <span v-if="chart_group_by == field.name"
                          ><i class="fas fa-check"></i>&nbsp;</span
                        >
                        {{ field.name }}
                      </CDropdownItem>
                    </div>
                  </CDropdown>
                </CButtonGroup>
              </div>
              <ResultsChart
                :datasets="timeline_datasets(aggregations)"
                :labels="timeline_datalabels(aggregations)"
              />
            </div>
          </div>
          <LogTable
            :fields="column_fields()"
            :sortFields="sort_by"
            :items="results"
            :totalItems="total_results"
            :tab="tab"
            @viewLog="view_log"
            @filterAdded="filterByValue"
            @deselectField="deselectField"
            :search_complete="search_complete"
          />
        </div>
      </div>
    </section>
    <LogDrawer @filterAdded="filterByValue" :tab="tab" />
  </div>
</template>

<style scoped>
.filter-item {
  float: left;
  list-style: none;
  display: flex;
}

.reflex-filter {
  background-color: #3c4b64;
  color: #fff;
  border-radius: 2px;
  padding: 2px 5px;
  margin: 0 2px;
  line-height: 1.2;
  font-weight: 500;
  padding: 6px 8px 6px 6px;
  margin-bottom: 4px;
}

.field-selector.shrink {
  width: auto;
}

.search-results.expand {
  width: 98%;
}

hr {
  margin-top: 10px;
  margin-bottom: 10px;
}

.quick-dates {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.quick-date-part {
  width: 22%;
}

.date-options {
  padding: 10px;
  width: 450px;
  font-size: 12.8px !important;
}

.date-option {
  list-style: none;
  width: 50%;
  cursor: pointer;
  margin-bottom: 4px;
  color: #321fdb;
}
.no-shadow {
  box-shadow: none !important;
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
import SelectInput from "@/views/components/SelectInput.vue";
import RSwitch from "@/views/components/Switch.vue";
import LogTable from "@/views/searchworkspace/LogTable.vue";
import LogDrawer from "@/views/searchworkspace/LogDrawer.vue";
import ResultsChart from "@/views/searchworkspace/ResultsChart.vue";
import FieldFilter from "@/views/searchworkspace/FieldFilter.vue";

import draggable from "vuedraggable";

export default {
  name: "SearchTab",
  components: {
    SelectInput,
    RSwitch,
    LogTable,
    LogDrawer,
    ResultsChart,
    FieldFilter,
    draggable,
  },
  props: {
    tab: {
      type: Object,
      default: "",
    },
  },
  data() {
    return {
      query: "",
      field_search: "",
      filters: [],
      fields: [],
      search_on_change: false,
      auto_refresh: false,
      show_chart: false,
      chart_type: "bar",
      chart_group_by: "",
      sort_by: [],
      refresh_interval: 5,
      refresh_interval_unit: "m",
      results: [],
      total_results: 0,
      pages: 0,
      aggregations: undefined,
      timefield: "@timestamp",
      current_page: 1,
      dataset: "",
      date_range: {
        start: "now-15m",
        end: "now",
      },
      search_complete: true,
      search_failed: false,
      failure_reason: "",
      hide_field_selection: false,
      quick_date_settings: {
        period: "last",
        value: 4,
        unit: "d",
      },
      masks: {
        modelValue: "YYYY-MM-DD",
      },
      quick_dates: [
        {
          start: this.startOfToday(), // Set this to todays 00:00:00,
          end: this.endOfToday(), // Set this to todays 23:59:59,
          label: "Today",
        },
        {
          start: this.startOfWeek(), // Set this to the start of the week at 00:00:00,
          end: this.endOfWeek(), // Set this to the end of the week at 23:59:59,
          label: "This week",
        },
        {
          start: "now-15m",
          end: "now",
          label: "Last 15 minutes",
        },
        {
          start: "now-30m",
          end: "now",
          label: "Last 30 minutes",
        },
        {
          start: "now-1h",
          end: "now",
          label: "Last 1 hour",
        },
        {
          start: "now-24h",
          end: "now",
          label: "Last 24 hours",
        },
        {
          start: "now-7d",
          end: "now",
          label: "Last 7 days",
        },
        {
          start: "now-30d",
          end: "now",
          label: "Last 30 days",
        },
        {
          start: "now-90d",
          end: "now",
          label: "Last 90 days",
        },
        {
          start: "now-1y",
          end: "now",
          label: "Last 1 year",
        },
      ],
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
            {
              value: "agent-logs",
              label: "Agent Logs",
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
    };
  },
  created() {
    this.query = this.tab.search;
    this.results = this.tab.results;
    this.date_range = this.tab.date_range;
    this.dataset = this.tab.dataset;
    this.search_on_change = this.tab.search_on_change;
    this.auto_refresh = this.tab.auto_refresh;
    this.refresh_interval = this.tab.refresh_interval;
    this.refresh_interval_unit = this.tab.refresh_interval_unit;
    this.show_chart = this.tab.show_chart;
    this.hide_field_selection = this.tab.hide_field_selection;
    this.chart_type = this.tab.chart_type;
    this.chart_group_by = this.tab.chart_group_by;
    this.fields = this.tab.fields;
    this.filters = this.tab.filters;
    this.sort_by = this.tab.sort_by;
  },
  methods: {
    toggleFieldSelection(tab) {
      if (this.hide_field_selection === undefined) {
        this.hide_field_selection = true;
      } else {
        this.hide_field_selection = !this.hide_field_selection;
      }
    },
    view_log(entry) {
      this.$store.commit("set", [
        "logDrawerMinimize",
        !this.$store.getters.logDrawerMinimize,
      ]);
      this.$store.commit("set", ["searchWorkspaceLog", entry]);
    },
    setDateRange() {
      if (this.quick_date_settings.period == "last") {
        this.date_range = {
          start: "now-" + this.quick_date_settings.value + this.quick_date_settings.unit,
          end: "now",
        };
      } else {
        this.date_range = {
          start: "now+" + this.quick_date_settings.value + this.quick_date_settings.unit,
          end: "now",
        };
      }

      if (this.search_on_change) {
        this.search();
      }
    },
    setQuickDate(date) {
      this.date_range = {
        start: date.start,
        end: date.end,
      };

      if (this.search_on_change) {
        this.search();
      }
    },
    startOfToday() {
      // Returns the start of today in ISO format in the UTC timezone
      let date = new Date();

      // Convert to UTC time
      date.setMinutes(date.getMinutes() - date.getTimezoneOffset());

      // Set the hours to 0, minutes to 0, seconds to 0, and milliseconds to 0
      date.setHours(0, 0, 0, 0);

      return date.toISOString();
    },
    endOfToday() {
      // Returns the end of today in ISO format in the UTC timezone
      let date = new Date();

      // Convert to UTC time
      date.setMinutes(date.getMinutes() - date.getTimezoneOffset());

      // Set the hours to 23, minutes to 59, seconds to 59, and milliseconds to 999
      date.setHours(23, 59, 59, 999);

      return date.toISOString();
    },
    endOfWeek() {
      // Returns the last day of the week in ISO format in the UTC timezone
      let date = new Date();

      // Convert to UTC time
      date.setMinutes(date.getMinutes() - date.getTimezoneOffset());

      let day = date.getDay();
      let diff = date.getDate() + (day == 0 ? 0 : 7) - day; // adjust when day is sunday
      date.setDate(diff);

      // Set the hours to 23, minutes to 59, seconds to 59, and milliseconds to 999
      date.setHours(23, 59, 59, 999);

      return date.toISOString();
    },
    startOfWeek() {
      // Returns the first day of the week in ISO format in the UTC timezone
      let date = new Date();

      // Convert to UTC time
      date.setMinutes(date.getMinutes() - date.getTimezoneOffset());

      let day = date.getDay();
      let diff = date.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
      date.setDate(diff);

      // Set the hours to 0, minutes to 0, seconds to 0, and milliseconds to 0
      date.setHours(0, 0, 0, 0);

      return date.toISOString();
    },
    removeFilter(filter) {
      this.filters = this.filters.filter((f) => {
        return f.field != filter.field || f.value != filter.value;
      });

      if (this.search_on_change) {
        this.search();
      }
    },
    timeline_datasets(aggs) {
      // Return the tab.aggregations.time_buckets.buckets in a format that can be used by the timeline chart
      let data = {
        data: [],
        backgroundColor: "#3c4b64",
        label: "Hits",
      };

      console.log("datasets was called");

      if (aggs == undefined) {
        return [data];
      }

      console.log(aggs);

      for (let bucket in aggs.time_buckets.buckets) {
        data.data.push(aggs.time_buckets.buckets[bucket].doc_count);
      }

      return [data];
    },
    timeline_datalabels(aggs) {
      // Return the tab.aggregations.time_buckets.buckets in a format that can be used by the timeline chart
      let data = [];

      console.log("datalabels was called");

      if (aggs == undefined) {
        return data;
      }

      for (let bucket in aggs.time_buckets.buckets) {
        data.push(aggs.time_buckets.buckets[bucket].key_as_string);
      }

      return data;
    },
    column_fields() {
      let locked_fields = [{ key: this.timefield, label: this.timefield }];
      if (this.fields.length > 0) {
        return [
          ...locked_fields,
          ...this.fields.map((field) => {
            return { key: field.name, label: field.name };
          }),
        ];
      } else {
        return [...locked_fields, { key: "_", label: "message" }];
      }
    },
    isArray(value) {
      // Returns true if the value is an array
      return value && typeof value === "object" && value.constructor === Array;
    },
    isIpAddress(value) {
      if (value === undefined) {
        return false;
      }

      return (
        value &&
        typeof value === "string" &&
        (value.match(
          /^([0-9]{1,3}\.){3}[0-9]{1,3}(:[0-9]{1,5})?(\/([0-9]|[1-2][0-9]|3[0-2]))?$/
        ) ||
          value.match(
            /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}(:[0-9]{1,5})?(\/([0-9]|[1-2][0-9]|3[0-2]))?$/
          ))
      );
    },
    isDomainName(value) {
      // Returns true if the value is a domain name
      return (
        value &&
        typeof value === "string" &&
        value.match(/^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6}$/)
      );
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
      this.filters.splice(i, 1);
      if (this.search_on_change) {
        this.search(tab);
      }
    },
    filterByValue(tab, value, field, exclude = false) {
      let _filter = {
        value: value,
        field: field,
        exclude: exclude,
        operator: "is",
        active: true,
      };

      // If this filter already exists, change it to excluded and replace it
      let existing_filter = this.filters.find((filter) => {
        return filter.value === value && filter.field === field;
      });

      if (existing_filter) {
        existing_filter.exclude = !existing_filter.exclude;
        _filter = existing_filter;
      } else {
        this.filters.push(_filter);
      }

      if (this.search_on_change) {
        this.search(tab);
      }
    },
    filtered_fields() {
      let fields = this.available_fields().filter((field) => {
        // If the search string is not empty, filter the fields by the search string and selected fields
        if (this.field_search != undefined && this.field_search.length > 0) {
          return (
            field.name.toLowerCase().includes(this.field_search.toLowerCase()) &&
            !this.fields.filter((f) => f.name === field.name).length > 0
          );
        } else {
          // If the search string is empty, only return fields that are not selected
          return !this.fields.filter((f) => f.name === field.name).length > 0;
        }
      });

      // Sort the fields alphabetically
      return fields.sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
    },
    field_type(value) {
      // Return the field type based on the value
      if (this.isIpAddress(value)) {
        return "ip";
      } else if (this.isDomainName(value)) {
        return "d";
      } else if (value === true || value === false) {
        return "b";
      } else if (typeof value === "number") {
        return "#";
      } else if (value === null) {
        return "n";
      } else if (typeof value === "object") {
        return "o";
      } else if (typeof value === "string") {
        return "t";
      } else if (this.isArray(value)) {
        return "a";
      } else {
        return "t";
      }
    },
    available_fields() {
      /* Find all the root level keys in the flattened results */
      let keys = [];
      let fields = [];

      this.flattened_results().forEach((result) => {
        Object.keys(result).forEach((key) => {
          if (!keys.includes(key)) {
            keys.push(key);
            fields.push({
              type: this.field_type(result[key]),
              name: key,
            });
          }
        });
      });

      // Remove the tabs timefield from the list
      fields = fields.filter((field) => {
        return field.name !== this.timefield;
      });
      return fields;
    },
    flattened_results() {
      /* Slice the results by the current page e.g 0-100, 100-200, etc */
      let results = this.results.slice(
        (this.current_page - 1) * 100,
        this.current_page * 100
      );

      /* Flatten the results */
      return results.map((result) => {
        return this.flatten_json(result._source);
      });
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
    selectField(field) {
      // If the field is not already selected, add it
      if (!this.fields.map((f) => f.name).includes(field.name)) {
        this.fields.push(field);
      }
    },
    deselectField(field) {
      this.fields = this.fields.filter((item) => {
        return item.name !== field.name;
      });
    },
    addSearch() {
      this.$emit("newSearch");
    },
    search() {
      if (this.query == undefined || this.query.length == 0) {
        this.query = "*";
      }

      let query = {
        query: this.query,
        dataset: this.dataset,
        filters: this.filters,
        date_range: this.date_range,
      };

      this.search_complete = false;
      this.$store
        .dispatch("runSearch", query)
        .then((resp) => {
          this.results = resp.data.response.hits.hits;
          this.total_results = resp.data.response.hits.total.value;
          this.pages = resp.data.pages;
          this.aggregations = resp.data.response.aggregations;
          this.timefield = resp.data.timefield;
          this.search_complete = true;
          this.search_failed = false;
          this.failure_reason = "";
          this.current_page = 1;

          this.updateTab();
        })
        .catch((err) => {
          this.search_complete = true;
          this.search_failed = true;
          this.failure_reason = err.response.data.message;
          this.timefield = "@timestamp";
          this.results = [];
          this.total_results = 0;
          this.current_page = 1;

          this.updateTab();
        });
    },
    updateTab() {
      let tab_update = JSON.parse(JSON.stringify(this.tab));
      tab_update.results = this.results;
      tab_update.total_results = this.total_results;
      tab_update.pages = this.pages;
      tab_update.aggregations = this.aggregations;
      tab_update.timefield = this.timefield;
      tab_update.search_complete = this.search_complete;
      tab_update.search_failed = this.search_failed;
      tab_update.failure_reason = this.failure_reason;
      tab_update.current_page = this.current_page;
      tab_update.filters = this.filters;
      tab_update.sort_by = this.sort_by;
      tab_update.fields = this.fields;
      tab_update.search_on_change = this.search_on_change;
      tab_update.auto_refresh = this.auto_refresh;
      tab_update.refresh_interval = this.refresh_interval;
      tab_update.refresh_interval_unit = this.refresh_interval_unit;
      tab_update.show_chart = this.show_chart;
      tab_update.hide_field_selection = this.hide_field_selection;
      tab_update.chart_type = this.chart_type;
      tab_update.chart_group_by = this.chart_group_by;
      tab_update.search = this.query;
      tab_update.search_complete = this.search_complete;
      tab_update.dataset = this.dataset;
      tab_update.date_range = this.date_range;

      this.$store.commit("update_log_search", tab_update);
    },
  },
};
</script>
