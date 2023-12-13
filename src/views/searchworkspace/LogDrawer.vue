<template>
  <CRightDrawer
    fixed
    :minimize="minimize"
    :show="show"
    :aside="true"
    colorScheme="light"
    @update:show="(value) => $store.commit('set', ['logDrawerShow', value])"
  >
    <CRow style="padding: 10px 10px 10px 10px">
      <CCol>
        <h3>Expanded Log</h3>
      </CCol>
      <CCol class="text-right">
        <CButton color="secondary" @click="showEmptyFields = !showEmptyFields">
          {{ showEmptyFields ? "Hide" : "Show" }} Empty Fields
        </CButton>&nbsp;
        <CButton
          color="secondary"
          @click="$store.commit('set', ['logDrawerMinimize', true])"
          >Close</CButton
        >
      </CCol>
    </CRow>
    <CRow>
      <CCol>
        <hr style="margin-bottom: 0px; margin-top: 0px" />
        <CTabs :activeTab.sync="activeTab" class="tabbed">
          <CTab title="Field View">
            <CCardBody>
            <div class="table-wrapper">
            <table class="log-table">
                <thead>
                <tr>
                    <th></th>
                    <th>Field</th>
                    <th>Value</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="field in logAsTable(searchWorkspaceLog)" class="log-value" v-if="(field.value != undefined || field.value != null) || showEmptyFields">
                    <td class="field-value-controls fitwidth">
                        <button class="field-value-control" @click="copyValue(field.value)">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="field-value-control" @click="filterByValue(field)">
                            <i class="fas fa-plus"></i>
                        </button>
                        
                        <button class="field-value-control" @click="filterByValue(field, true)">
                            <i class="fas fa-minus"></i>
                        </button>
                    </td>
                    <td class="field-value">{{ field.key }}</td>
                    <td class="field-value">
                        <span v-if="field.value == undefined || field.value == null" class="empty-value">empty</span>
                        <span v-else>{{ field.value }}</span>
                    </td>
                </tr>
                </tbody>
            </table>
            </div>
            </CCardBody>
          </CTab>

          <CTab title="JSON View">
            {{ searchWorkspaceLog }}
          </CTab>
        </CTabs>
      </CCol>
    </CRow>
  </CRightDrawer>
</template>

<style scoped>

.table-wrapper {
  overflow-x: auto;
  overflow-y: auto;
  min-height: calc(100vh - 175px);
  max-height: calc(100vh - 175px);
}

.field-value-controls {
  opacity: 0;
}
.log-value:hover .field-value-controls {
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

.log-table {
  margin: auto;
  border-collapse: collapse;
  width: 100%;
  max-width: 100%;
}

.log-table thead {
  /* Make the table header stick to the top */
  position: sticky;
  top: 0;
  background-color: #fff;
  z-index: 1;
  border-bottom: 1px solid #ddd;
}

.log-table tbody {
  overflow-y: scroll;
  overflow-x: scroll;
  width: 100%;
  height: 100% !important;
}

.log-table th.fitwidth,
.log-table td.fitwidth {
  /* Make the table cells expand to fit the content */
  width: 1px;
  white-space: nowrap;
}

.log-table th,
.log-table td {
  text-align: left;
  padding: 8px;
}

.log-table tr {
  max-height: 25px;
}

.log-table tr:nth-child(even) {
  background-color: #f2f2f2;
}

.log-table th {
  background-color: light-grey;
}


.tab-container {
  overflow-y: scroll;
  overflow-x: scroll;
  max-height: calc(100vh - 200px);
}

.c-sidebar {
  width: 60% !important;
  overflow-y: visible;
}

.c-sidebar.c-sidebar-fixed {
  z-index: 1052;
}

.c-sidebar-minimized.c-sidebar-fixed {
  width: 0px !important;
  z-index: 1052;
}

.modal-body {
  padding-left: 0px;
}

.empty-value {
  color: #aaa;
}
</style>

<script>
import { mapState } from "vuex";

import nav from "../../containers/_nav";
import CRightDrawer from "../CRightDrawer";

export default {
  name: "LogDrawer",
  nav,
  components: {
    CRightDrawer,
  },
  props: {
    log: {},
    organization: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      activeTab: 0,
      showEmptyFields: false,
    };
  },
  computed: {
    show() {
      return this.$store.state.logDrawerShow;
    },
    minimize() {
      return this.$store.state.logDrawerMinimize;
    },
    ...mapState(["current_user", "searchWorkspaceLog"]),
  },
  methods: {
    logAsTable(log) {
      return Object.keys(log).map((key) => {
        return {
          key: key,
          value: log[key],
        };
      });
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
    filterByValue(field, exlude=false) {
        console.log(field)
    }
  }
};
</script>
