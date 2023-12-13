<template>
  <div class="table-wrapper">
    <table class="log-table">
      <thead>
        <tr>
          <th colspan="100%" class="table-controls">
            <button class="field-value-control" @click="fullScreenTable()">
              <i v-if="!full_screen_log_table" class="fas fa-maximize"></i>
              <i v-if="full_screen_log_table" class="fas fa-minimize"></i>
            </button>
          </th>
        </tr>
        <tr>
          <th class="fitwidth" scope="col"></th>
          <th
            scope="col"
            v-for="field in fields"
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
        <tr v-if="items.length == 0 && tab.search_complete">
          <td class="text-center" colspan="100%">
            <span v-if="tab.search_failed">
              <CAlert color="warning">
                <strong>Search failed</strong>
                <br />
                {{ tab.failure_reason }}
              </CAlert>
            </span>
            <span v-else> No results {{ tab.search_failed }} </span>
          </td>
        </tr>
        <tr
          v-for="(result, i) in flattened_results()"
          :key="result._id"
          v-else-if="tab.search_complete"
        >
          <td class="fitwidth">
            <button class="field-value-control" v-on:click="view_log(result)">
              <i class="fa-solid fa-up-right-and-down-left-from-center expand-icon"></i>
            </button>
            <input type="checkbox" class="row-checkbox" />
          </td>
          <td
            v-for="field in fields"
            :key="field.key"
            class="fitwidth field-value"
          >
            <span v-if="field.key === '_'">
              <KeyedResult :result="result" />
            </span>
            <span v-else>
              <span v-if="result[field.key] == undefined" class="empty-value">empty</span>
              <span v-else-if="isArray(result[field.key])">
                <span v-for="(value, index) in result[field.key]" :key="index">
                  <span class="reflex-badge">{{ value }}</span>
                  <span
                    class="field-value-controls"
                    v-if="result[field.key] != undefined"
                  >
                    <button
                      class="field-value-control"
                      @click="copyValue(value, i, field.key)"
                    >
                      <i class="fas fa-clipboard" />
                    </button>
                    <button
                      class="field-value-control"
                      v-on:click="filterByValue(tab, value, field.key)"
                    >
                      <i class="fas fa-plus" />
                    </button>
                    <button
                      class="field-value-control"
                      v-on:click="filterByValue(tab, value, field.key, true)"
                    >
                      <i class="fas fa-minus" />
                    </button> </span
                  ><br />
                </span>
              </span>
              <span :ref="i + '.' + field.key" v-else
                >{{ result[field.key] }}
                <span class="field-value-controls" v-if="result[field.key] != undefined">
                  <button
                    class="field-value-control"
                    @click="copyValue(result[field.key], i, field.key)"
                  >
                    <i class="fas fa-clipboard" />
                  </button>
                  <button
                    class="field-value-control"
                    v-on:click="filterByValue(tab, result[field.key], field.key)"
                  >
                    <i class="fas fa-plus" />
                  </button>
                  <button
                    class="field-value-control"
                    v-on:click="filterByValue(tab, result[field.key], field.key, true)"
                  >
                    <i class="fas fa-minus" />
                  </button> </span
              ></span>
            </span>
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td colspan="100%" class="table-controls">
            <span class="pagination">
              <span
                v-bind:disabled="current_page > 1"
                class="page-number"
                v-on:click="nextPage(current_page - 1)"
              >
                <i class="fa-solid fa-chevron-left"></i>
              </span>
              <span v-for="page in maxPages()">
                <button
                  class="page-number"
                  v-bind:class="page == current_page ? 'active' : null"
                  v-on:click="nextPage(page)"
                >
                  {{ page }}
                </button>
              </span>
              <span
                v-bind:disabled="current_page < maxPages()"
                class="page-number"
                v-on:click="nextPage(current_page + 1)"
              >
                <i class="fa-solid fa-chevron-right"></i>
              </span>
              <span class="result-count"> | {{ items.length }} of {{ totalItems }} results.</span>
            </span>
          </td>
        </tr>
      </tfoot>
    </table>
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

.table-wrapper {
  overflow-x: auto;
  overflow-y: auto;
  min-height: calc(100vh - 275px);
  background-color: #fff;
  max-height: calc(100vh - 275px);
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
  /* Align all text to the top of the cell */
  vertical-align: top;
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

.field-value-controls {
  opacity: 0;
  transition: opacity 0.1s ease-in-out;
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

/* Hide the focus outline on the buttons */
.field-value-control:focus {
  outline: none;
}

.reflex-badge {
  font-size: 12px !important;
}


</style>

<script>
import { isArray } from "lodash";

import KeyedResult from "./KeyedResult.vue";

export default {
  name: "LogTable",
    components: {
        KeyedResult,
    },
  props: {
    tab: {
      type: Object,
      default: () => {},
    },
    items: {
      type: Array,
      default: () => [],
    },
    fields: {
      type: Array,
      default: () => [],
    },
    totalItems: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      current_page: 1,
      full_screen_log_table: false,
      page_size: 50
    };
  },
  methods: {
    isArray,
    flattened_results() {
      /* Slice the results by the current page e.g 0-100, 100-200, etc */
      let tab_results = this.items.slice(
        (this.current_page - 1) * this.page_size,
        this.current_page * this.page_size
      );

      /* Flatten the results */
      return tab_results.map((result) => {
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
    nextPage(page) {
      if (page < 1) {
        page = 1;
      }

      if (page > this.maxPages()) {
        page = this.maxPages();
      }
      this.current_page = page;
    },
    maxPages() {
      if(this.items.length == 0 || this.items === undefined) return 1;
      return Math.ceil(this.items.length / this.page_size);
    },
    fullScreenTable() {
      // Find the table-wrapper and add the full-screen class if it doesn't exist, otherwise remove it
      let log_wrapper = document.querySelector(".table-wrapper");
      if (!log_wrapper.classList.contains("full-screen")) {
        this.full_screen_log_table = true;
        log_wrapper.classList.add("full-screen");
      } else {
        log_wrapper.classList.remove("full-screen");
        this.full_screen_log_table = false;
      }
    },
    deselectField(tab, field) {
      this.$emit("deselectField", tab, field);
    },
    view_log(result) {
      this.$emit("viewLog", result);
    },
    copyValue(value, i, field) {
      this.$emit("copyValue", value, i, field);
    },
    filterByValue(tab, value, key, exclude = false) {
      this.$emit("filterAdded", tab, value, key, exclude);
    }
  },
};
</script>