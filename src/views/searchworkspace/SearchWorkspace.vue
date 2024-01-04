<template>
  <div>
    <CTabs
      addNavWrapperClasses="page-nav"
      addTabClasses="page-nav-tab-body"
      addNavClasses="page-nav-tab"
      :activeTab.sync="active_tab"
    >
      <CTab v-for="(tab, i) in log_searches" :key="i" >
        
        <template #title>
          {{ tab.name }}&nbsp;
            <button class="field-value-control"
            @click="removeSearch(i)"
            
          ><i
            class="fas fa-times"></i></button>
        </template>
        <SearchTab :tab="tab" @newSearch="addSearch" />

        
        
      </CTab>
    </CTabs>
  </div>
</template>

<style scoped>

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
  font-size:12.8px !important;
}

.date-option {
  list-style: none;
  width: 50%;
  cursor: pointer;
  margin-bottom: 4px;
  color: #321fdb;
}

.add-field-alias-btn {
  background: #3c4b64;
  border-radius: 25%;
  border: none;
  width: 18px;
  height: 18px;
  cursor: pointer;
  color: #fff;
  padding: 0px;
  margin-right: 5px;
  line-height: 2;
  font-size: 1vmin;
}

.no-shadow {
  box-shadow: none !important;
}

.filter-item {
  float: left;
  list-style: none;
  display: flex;
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


.field-type {
  padding: 2px 2px 2px 0px;
  text-align: center;
  width: 15px;
  display: inline-block;
  line-height: 1.2;
  font-weight: 500;
  color: #fff;
  background-color: #3c4b64;
  border-radius: 2px;
  font-size: 11px;
  font-style: italic;
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
  line-height: 1.2;
  font-weight: 500;
  padding: 6px 8px 6px 6px;
  margin-bottom: 4px;
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

import { mapState } from "vuex";
import VueJsonPretty from "vue-json-pretty";
import "vue-json-pretty/lib/styles.css";
import draggable from "vuedraggable";
import SelectInput from "../components/SelectInput.vue";
import {v4 as uuidv4} from 'uuid';

import LogDrawer from "@/views/searchworkspace/LogDrawer.vue";

import ValuePopover from "@/views/searchworkspace/ValuePopover.vue";
import LogTable from "@/views/searchworkspace/LogTable.vue";
import ResultsChart from "@/views/searchworkspace/ResultsChart.vue";
import SearchTab from "@/views/searchworkspace/SearchTab.vue";

import { CChartBar } from "@coreui/vue-chartjs";

import RSwitch from "@/views/components/Switch.vue";

export default {
  name: "SearchWorkspace",
  components: {
    VueJsonPretty,
    SelectInput,
    draggable,
    CChartBar,
    LogDrawer,
    ValuePopover,
    LogTable,
    RSwitch,
    ResultsChart,
    SearchTab
  },
  computed: {
    ...mapState(["current_user", "log_searches"]),
  },
  created() {
    this.$store.commit("set", ["logDrawerMinimize", true]);

    if(this.log_searches.length == 0) {
      this.addSearch()
    }
  },
  data() {
    return {
      active_tab: 0,
      masks: {
        modelValue: 'YYYY-MM-DD'
      },
      quick_date_settings: {
        period: 'last',
        value: 4,
        unit: 'd'
      },
      field_filters: [],
      hunt_query: "",
      quick_dates: [
        {
          'start': this.startOfToday(), // Set this to todays 00:00:00,
          'end': this.endOfToday(), // Set this to todays 23:59:59,
          'label': 'Today'
        },
        {
          'start': this.startOfWeek(), // Set this to the start of the week at 00:00:00,
          'end': this.endOfWeek(), // Set this to the end of the week at 23:59:59,
          'label': 'This week'
        },
        {
          'start': 'now-15m',
          'end': 'now',
          'label': 'Last 15 minutes'
        },
        {
          'start': 'now-30m',
          'end': 'now',
          'label': 'Last 30 minutes'
        },
        {
          'start': 'now-1h',
          'end': 'now',
          'label': 'Last 1 hour'
        },
        {
          'start': 'now-24h',
          'end': 'now',
          'label': 'Last 24 hours'
        },
        {
          'start': 'now-7d',
          'end': 'now',
          'label': 'Last 7 days'
        },
        {
          'start': 'now-30d',
          'end': 'now',
          'label': 'Last 30 days'
        },
        {
          'start': 'now-90d',
          'end': 'now',
          'label': 'Last 90 days'
        },
        {
          'start': 'now-1y',
          'end': 'now',
          'label': 'Last 1 year'
        }
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
              value: 'agent-logs',
              label: 'Agent Logs'
            }
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
      dataset: "",
      refresh_timers: []
    };
  },
  watch: {
    // Watch all the log_searches auto_refresh values
    log_searches: {
      handler: function (val, oldVal) {
        // For each tab in val, find its associated tab in oldVal and if
        // auto_refresh has changed then start or stop the timer
        for(let i = 0; i < val.length; i++) {
          
            if(val[i].auto_refresh) {
              // If no timer exists
              if(!this.refresh_timers[val[i].uuid]) {
                // Start the timer
                this.startAutoRefresh(val[i])
              }
            } else {
              // If a timer exists
              if(this.refresh_timers[val[i].uuid]) {
                // Stop the timer
                this.stopAutoRefresh(val[i])
              }
            }
        }
      },
      deep: true
    }
  },
  methods: {
    startAutoRefresh(tab) {
      if(tab.auto_refresh) {
        this.refresh_timers[tab.uuid] = setInterval(() => {
          this.search(tab)
        }, tab.refresh_interval * 1000)
      }
    },
    stopAutoRefresh(tab) {
      if(this.refresh_timers[tab.uuid]) {
        clearInterval(this.refresh_timers[tab.uuid])
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
    setDateRange(tab) {

      if(this.quick_date_settings.period == 'last') {
        tab.date_range = {
          start: 'now-' + this.quick_date_settings.value + this.quick_date_settings.unit,
          end: 'now'
        }
      } else {
        tab.date_range = {
          start: 'now+' + this.quick_date_settings.value + this.quick_date_settings.unit,
          end: 'now'
        }
      }

      if(tab.search_on_change) {
        this.search(tab)
      }
    },
    setQuickDate(tab, date) {
      tab.date_range = {
        start: date.start,
        end: date.end,
      };

      if(tab.search_on_change) {
        this.search(tab)
      }
    },
    renameSearch() {
      alert(1);
    },
    maxPages(tab) {
      // Return the max number of pages based on the number of results and the page size of 100
      return Math.ceil(tab.results.length / 100);
    },
    nextPage(tab, page) {
      if (page < 1) {
        page = 1;
      }

      if (page > this.maxPages(tab)) {
        page = this.maxPages(tab);
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
    timeline_datasets(aggs) {
      // Return the tab.aggregations.time_buckets.buckets in a format that can be used by the timeline chart
      let data = {
        data: [],
        backgroundColor: "#3c4b64",
        label: "Hits",
      };

      console.log("datasets was called")

      if (aggs == undefined) {
        return [data];
      }

      for (let bucket in aggs.time_buckets.buckets) {
        data.data.push(aggs.time_buckets.buckets[bucket].doc_count);
      }

      return [data];
    },
    timeline_datalabels(tab) {
      // Return the tab.aggregations.time_buckets.buckets in a format that can be used by the timeline chart
      let data = [];

      console.log("datalabels was called")

      if (tab.aggregations == undefined) {
        return data;
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
    toggleFieldSelection(tab) {
      if(tab.hide_field_selection === undefined) {
        tab.hide_field_selection = true;
      } else {
        tab.hide_field_selection = !tab.hide_field_selection;
      }
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
        return field.name.toLowerCase().includes(tab.field_search.toLowerCase());
      });
    },
    filtered_fields(tab) {
      let fields = this.available_fields(tab).filter((field) => {
        // If the search string is not empty, filter the fields by the search string and selected fields
        if (tab.field_search != undefined && tab.field_search.length > 0) {
          return (
            field.name.toLowerCase().includes(tab.field_search.toLowerCase()) &&
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
        return 'n'
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
    available_fields(tab) {
      /* Find all the root level keys in the flattened results */
      let keys = [];
      let fields = [];

      this.flattened_results(tab).forEach((result) => {
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
      // Add a new tab'
      let new_search = {
        name: "New search",
        search: "",
        dataset: "events",
        filters: [],
        date_range: {
          start: null,
          end: null,
        },
        results: [],
        total_results: 0,
        fields: [],
        field_search: "",
        sort_by: [],
        search_on_change: false,
        search_complete: true,
        search_failed: false,
        failure_reason: "",
        pages: 0,
        current_page: 1,
        hide_empty_fields: false,
        hide_field_selection: false,
        full_screen_log_table: false,
        timefield: "@timestamp",
        show_chart: true,
        uuid: uuidv4(),
        auto_refresh: false,
        refresh_interval: 5,
        refresh_interval_unit: 'm',
        chart_type: 'bar',
        chart_group_by: null
      }

      // Save the search to the store
      //this.$store.commit('add_log_search', new_search)
      this.log_searches.push(new_search)

      this.active_tab = this.log_searches.length - 1;

    },
    removeSearch(i) {      
      // Get the UUID of the tab to remove
      let tab = this.log_searches[i];

      // Remove the search from the state
      this.$store.commit('remove_log_search', tab.uuid)

      // If there are no more tabs, add a new one
      if (this.log_searches.length == 0) {
        this.addSearch();
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
        value && typeof value === "string" && (value.match(
          /^([0-9]{1,3}\.){3}[0-9]{1,3}(:[0-9]{1,5})?(\/([0-9]|[1-2][0-9]|3[0-2]))?$/)
          || value.match(
            /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}(:[0-9]{1,5})?(\/([0-9]|[1-2][0-9]|3[0-2]))?$/)
        )
      )
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
      tab.filters.splice(i, 1);
      if (tab.search_on_change) {
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

      if (tab.search == undefined || tab.search.length == 0) {
        tab.search = "*";
      }

      let query = {
        query: tab.search,
        dataset: tab.dataset,
        filters: tab.filters,
        date_range: tab.date_range,
      };

      tab.search_complete = false;
      this.$store
        .dispatch("runThreatHunt", query)
        .then((resp) => {
          tab.results = resp.data.response.hits.hits;
          tab.total_results = resp.data.response.hits.total.value;
          tab.pages = resp.data.pages;
          tab.aggregations = resp.data.response.aggregations;
          tab.timefield = resp.data.timefield;
          tab.search_complete = true;
          tab.search_failed = false;
          tab.failure_reason = "";
          tab.current_page = 1;
          this.$store.commit('update_log_search', tab)
        })
        .catch((err) => {
          tab.search_complete = true;
          tab.search_failed = true;
          tab.failure_reason = err.response.data.message;
          tab.timefield = "@timestamp";
          tab.results = [];
          tab.total_results = 0;
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
