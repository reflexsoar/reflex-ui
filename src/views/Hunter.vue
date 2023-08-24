<template>
  <CRow>
    <CCol xs="12" lg="12">
      <CRow class="page-heading page-heading-row">
        <CCol>
          <CRow>
            <CCol col=2>
              <h1>Search</h1>
            </CCol>
            <CCol col=8>
              <CForm id="hunt-form" @submit.prevent="search">
                <CInput size="lg" v-on:keyup.enter="search(hunt_query)" v-model="hunt_query" placeholder="Enter your hunting query" required><template #append>
                    <CButton type="submit" class="btn btn-block btn-primary">Search</CButton>
                  </template>
                </CInput>
              </CForm>
            </CCol>
          </CRow>
        </CCol>
      </CRow>
      <CRow>
        <CCol col=3>
          <div class="reflex-card">
              <h3>Fields</h3>
              <CInput v-model="field_search" placeholder="Search fields"/>
              <div class="field-group-header">
                Selected Fields
              </div>
              <div v-for="field in filtered_selected" :key="field.name" class="field-picker-item" :ref="field.name" @click="deselectField(field)">
                <div class="reflex-badge reflex-badge-info">{{ field.type.length > 2 ? field.type[0]  : field.type }}</div>
                {{ field.name }}
                <div class="field-picker-hide">
                  <i class="fas fa-eye-slash"/>
                </div>
                </div>
              <label>Available</label>
              <div v-for="field in filtered_fields" :key="field.name" class="field-picker-item" :ref="field.name" @click="selectField(field)">
                <div class="reflex-badge reflex-badge-info">{{ field.type.length > 2 ? field.type[0]  : field.type }}</div>
                {{ field.name }}
                <div class="field-picker-show">
                  <i class="fas fa-eye"/>
                </div>
                </div>
          </div>
        </CCol>
        <CCol>
          
          <CCard><CRow v-if="hunt_complete">
        <CCol>
          
        <CDataTable
              :items="flattened_results"
              :fields="selected_fields.length > 0 ? selected_fields.map((field) => { return { key: field.name, label: field.name } }) : ['created_at',{key: '_', label:'Document'}] "
              :size="sm"
              :bordered="true"
              :striped="true"
              :hover="true"
              :items-per-page="10"
              :pagination="true"
              :footer-props="{
                'show-current-page': true,
                'show-first-last-page': true
              }"
            >
              <template #_="{item}">
                <td style="overflow-x: hidden; white-space:nowrap; max-width: 800px">
                  <span v-for="v,k in item" :key="k">
                    <span class='reflex-badge reflex-badge-secondary'>{{ k }}</span> <span class='reflex-badge'>{{ v }}</span>
                  </span>
                </td>
              </template>
            </CDataTable>
         
        </CCol>
      </CRow>
      <CRow v-else>
        <CCol xs="12" lg="12">
          <center>
            <h3>No events found.</h3>
          </center>
        </CCol>
      </CRow></CCard>
        </CCol>
      </CRow>
      
    </CCol>
  </CRow>
</template>

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
      hunt_query: "",
      results: [],
      selected_fields: [],
      field_search: "",
      hunt_complete: true,
      fields: [
        {
          type: 'keyword',
          name: "event.code",
        },
        {
          type: 'keyword',
          name: "process.pid",
        },
        {
          type: 'keyword',
          name: "process.name",
        },
        {
          type: 'keyword',
          name: "process.path",
        },
        {
          type: 'keyword',
          name: "process.command_line",
        },
        {
          type: 'ip',
          name: "source.ip",
        },
        {
          type: 'ip',
          name: "destination.ip",
        },
        {
          type: 'text',
          name: "message",
        },
        {
          type: 'meta',
          name: "_source"
        }
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
          }
        }
      ]
    };
  },
  computed: {
    available_fields() {
      /* Find all the root level keys in the flattened results */
      let keys = [];
      let fields = []
      
      this.flattened_results.forEach((result) => {
        Object.keys(result).forEach((key) => {
          if (!keys.includes(key)) {
            keys.push(key);
            fields.push({
              type: "text",
              name: key
            })
          }
        });
      });
      return fields
    },
    flattened_results() {
      return this.results.map((result) => {
        return this.flatten_json(result['_source']);
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
        query: this.hunt_query,
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
