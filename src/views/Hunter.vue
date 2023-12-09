<template>
  <div>
    <CTabs
      addNavWrapperClasses="page-nav"
        addTabClasses="page-nav-tab-body"
        addNavClasses="page-nav-tab"
    >
      <CTab :title="tab.name" v-for="tab, i in search_tabs">
        <section class="flex-wrapper" id="search">          
          <div class="flex-grid">
          <div class="d-col-1">
              <CSelect size="lg" v-model="search_proxy" :options="['production', 'development']" style="margin-bottom: 0px" />
            </div>
            <div class="d-col-10">
              <CInput
                size="lg"
                v-on:keyup.enter="search(tab.search)"
                v-model="tab.search"
                placeholder="Enter your hunting query"
                required
                style="margin-bottom: 0px"
                >
              </CInput>
            </div>
            <div class="d-col-1">
              <!-- Date picker -->
              <input type="date" id="start" name="trip-start"
                    value="2021-01-01"
                    min="2021-01-01" max="2021-12-31">
            </div>
            <div class="d-col-1">
              <CButton type="submit" class="btn btn-block btn-primary" style="margin-bottom: 0px"
                    >Search</CButton
                  >
            </div>
            </div>
        </section>
        <section class="flex-wrapper" id="filter" v-if="field_filters.length > 0">
          <div class="flex-grid" id="search">
            <div class="d-col-all text-left">
              <!-- horizontal list of badges with a close button that removes the filter -->
              <li style="display: inline; margin-right: 2px" v-for="filter, i in field_filters" :key="i">
                <span class="reflex-badge reflex-badge-secondary tag-list">
                  <b>{{ filter.exclude ? 'NOT' : '' }}</b> {{ filter.field }}: {{ filter.value }}
                  <i class="fas fa-times" @click="field_filters.splice(i, 1)" style="cursor: pointer"></i>
                </span>
              </li>
            </div>
          </div>
        </section>
        <section class="flex-wrapper" id="results">
          <div class="flex-grid">
            <div class="d-col-2 text-left">
              <CInput v-model="field_search" placeholder="Search fields"/>
              <div class="field-list-wrapper">
                <div class="field-group-header">Selected Fields</div>
                <div
                  v-for="field in filtered_selected"
                  :key="field.name"
                  :ref="field.name"
                  @click="deselectField(field)"
                >
                  <div class="flex-grid field-picker-item  text-left">
                    <div class="d-col-1">
                      <div class="reflex-badge reflex-badge-info">
                        {{ field.type.length > 2 ? field.type[0] : field.type }}
                      </div>
                    </div>
                    <div class="d-col-10">
                      <div class="field-name">{{ field.name }}</div>
                    </div>
                    <div class="d-col-1">
                      <div class="field-picker-hide">
                        <i class="fas fa-eye-slash" />
                      </div>
                    </div>
                  </div>
                </div>
                <div class="field-group-header">Available</div>
                <div
                  v-for="field in filtered_fields"
                  :key="field.name"
                  
                  :ref="field.name"
                  @click="selectField(field)"
                >
                  <div class="flex-grid field-picker-item text-left">
                  <div class="d-col-1">
                    <div class="reflex-badge reflex-badge-info">
                      {{ field.type.length > 2 ? field.type[0] : field.type }}
                    </div>
                  </div>
                  <div class="d-col-10">
                    <div class="field-name">{{ field.name }}</div>
                  </div>
                  <div class="d-col-1">
                    <div class="field-picker-show">
                      <i class="fas fa-eye" />
                    </div>
                  </div>
                  </div>
                  </div>
                </div>
            </div>
            <div class="d-col-10 text-left">
              <CCard>
                <div class="table-wrapper">
                <table class="log-table">
                  <thead>
                  <tr>
                    <th class="fitwidth">
                    </th>
                    <th v-for="field in column_fields" :key="field.key">
                      {{ field.label }}
                    </th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-if="flattened_results.length == 0">
                    <td class="text-center" colspan="100%">No results</td>
                  </tr>
                  <tr v-for="(result,i) in flattened_results" :key="result._id" v-else>
                    <td class="fitwidth">
                      <label><i class="fa-solid fa-up-right-and-down-left-from-center expand-icon"></i></label>
                      <input type="checkbox" class="row-checkbox">                      
                    </td>
                    <td v-for="field in column_fields" :key="field.key" class="fitwidth field-value">
                      <span v-if="field.key === '_'">
                        <span v-for="(v, k) in result" :key="k">
                          <span class="reflex-badge reflex-badge-secondary">{{ k }}</span>
                          <span class="reflex-badge">{{ v }}</span>
                        </span>
                      </span>
                      <span v-else>
                        <span class="reflex-badge" :ref="i+'.'+field.key">{{ result[field.key] }}</span>
                        <span class="field-value-controls">
                          <label>
                          <button class="field-value-control" @click="copyValue(result[field.key], i, field.key)">
                            <i class="fas fa-clipboard" />
                          </button>
                          <button class="field-value-control" v-on:click="filterByValue(result[field.key], field.key)">
                            <i class="fas fa-filter" />
                          </button>
                          </label>
                          </span>
                      </span>
                    </td>
                  </tr>
                  </tbody>
                </table>
                </div>
              </CCard>
            </div>
          </div>
        </section>
      </CTab>
    </CTabs>
  </div>
</template>

<style scoped>

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

.field-list-wrapper .collapse {
  max-width: 0%;
}

/* Slide tra

.field-value-controls {
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
}

.field-value:hover .field-value-controls {
  opacity: 1;
}

.field-value-control {
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  color: #999;
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
  
}

.log-table th, .log-table td {
  text-align: left;
  padding: 8px;
}

.log-table tr {
  font-family: "Roboto Mono";
}

.log-table tr:nth-child(even){background-color: #f2f2f2}

.log-table th {
  background-color: light-grey;
}

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
  padding-top:2px;
  vertical-align: middle;
  margin-left: 5px;
}

.field-value {
  font-family: "Roboto Mono";
  font-size: 12px;
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

.flex-wrapper {
  margin-left: -30px;
  margin-right: -30px;
  
  margin-bottom: .5rem;
}

.flex-grid {
	display: flex;
	justify-content: space-between;
	text-align: center;
}

.flex-grid:nth-child(odd) div[class^="d-col-"] {padding: 0.5rem 0.5rem;}
.flex-grid:nth-child(even) div[class^="d-col-"] {padding: 0.5rem 0.5rem;}

@media (min-width: 980px) {

	.flex-grid {margin-top: 2rem;}
	.flex-grid:first-child {margin-top: 0;}
	
	.d-col-1 						{width: 7.05%;}
	.d-col-2 						{width: 15.5%;}
	.d-col-3, 
	.d-col-thirds 					{width: 23.95%;}
	.d-col-4, 
	.d-col-quarters 				{width: 32.4%;}
	.d-col-5 						{width: 40.85%;}
	.d-col-6, 
	.d-col-halfs					{width: 49.3%;}
	.d-col-7 						{width: 57.75%;}
	.d-col-8 						{width: 66.2%;}
	.d-col-9 						{width: 74.65%;}
	.d-col-10 						{width: 83.1%;}
	.d-col-11 						{width: 91.55%;}
	.d-col-12, 
	.d-col-full 					{width: 100%;}
}

@media only screen and (min-width: 661px) and (max-width: 979px) {	
	
	.flex-grid {flex-flow: row wrap;}
	
	.t-col-4,
	.t-col-6,
	.t-col-12 {margin-top: 2rem}
	
	.t-col-4 		{width: 31.46%	}
	.t-col-6 		{width: 48.6%;}
	.t-col-12 		{width: 100%;}
	
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

export default {
  name: "ObservableHistory",
  components: {
    VueJsonPretty,
  },
  data() {
    return {
      field_filters: [],
      hunt_query: "",
      search_tabs: [
        {
          name: 'Malicious DNS requests',
          search: 'event.code: 22 AND dns.question.name: *.evil.com'
        },
        {
          name: 'User logins from new countries',
          search: 'event.code:4624 AND NOT geoip.country_iso_code:US AND NOT geoip.country_iso_code:CA'
        }
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
      search_proxy: 'production'
    };
  },
  computed: {
    column_fields () {
      let locked_fields = [{key: 'created_at', label: '@timestamp'}]
      if(this.selected_fields.length > 0) {
          return [...locked_fields, ...this.selected_fields.map((field) => {
            return { key: field.name, label: field.name };
            })]
      } else {
        return [...locked_fields, { key: '_', label: 'message' }]
      }
    },
    available_fields() {
      /* Find all the root level keys in the flattened results */
      let keys = [];
      let fields = [];

      this.flattened_results.forEach((result) => {
        Object.keys(result).forEach((key) => {
          if (!keys.includes(key)) {
            keys.push(key);
            fields.push({
              type: "text",
              name: key,
            });
          }
        });
      });
      return fields;
    },
    flattened_results() {
      return this.results.map((result) => {
        return this.flatten_json(result["_source"]);
      });
    },
    filtered_selected() {
      return this.selected_fields.filter((field) => {
        return field.name.toLowerCase().includes(this.field_search.toLowerCase());
      });
    },
    filtered_fields() {
      return this.available_fields.filter((field) => {
        // If the search string is not empty, filter the fields by the search string and selected fields
        if (this.field_search.length > 0) {
          return (
            field.name.toLowerCase().includes(this.field_search.toLowerCase()) &&
            !this.selected_fields.includes(field)
          );
        } else {
          // If the search string is empty, only return fields that are not selected
          return !this.selected_fields.includes(field);
        }
      });
    },
  },
  methods: {
    copyValue(value, i, field) {

      // Copy the value to the clipboard
      navigator.clipboard.writeText(value).then(() => {
        
         // Find the span that contains the value and set its opacity to 0.5
        let span = this.$refs[i+'.'+field].find((span) => {
          return span.innerText === value
        })

        span.style.opacity = 0.5

        // After 1 second, set the opacity back to 1
        setTimeout(() => {
          span.style.opacity = 1
        }, 500)

      });
      
    },
    filterByValue(value, field) {
      let _filter = {
        'value': value,
        'field': field,
        'exclude': false,
        'operator': 'is',
        'active': true
      }

      // If this filter already exists, change it to excluded and replace it
      let existing_filter = this.field_filters.find((filter) => {
        return filter.value === value && filter.field === field
      })

      if(existing_filter) {
        existing_filter.exclude = !existing_filter.exclude
        _filter = existing_filter
      } else {
        this.field_filters.push(_filter)
      }


    },
    flatten_json(o) {
      var out = {};
      function flatten(x, name) {
        if (typeof x == "object" && x !== null) {
          Object.keys(x).forEach(function (a) {
            flatten(x[a], name ? name + "." + a : a);
          });
        } else {
          out[name] = x;
        }
      }
      flatten(o);
      return out;
    },
    selectField(field) {
      this.selected_fields.push(field);
    },
    deselectField(field) {
      this.selected_fields = this.selected_fields.filter((item) => {
        return item !== field;
      });
    },
    search: function (value) {
      let query = {
        query: value
      };
      this.$store.dispatch("runThreatHunt", query).then((resp) => {
        this.hunt_complete = false;
        this.results = resp.data.hits.hits;
        if (this.results.length > 0) {
          this.hunt_complete = true;
        }
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
