<template>
  <CRow>
    <CCol xs="12" lg="12">
      <CRow>
        <CCol>
          <h2>Hunter</h2>
        </CCol> </CRow
      ><CForm id="hunt-form" @submit.prevent="search">
        <CRow>
          <CCol xs="12" lg="10">
            <CInput
              v-on:keyup.enter="search(hunt_query)"
              v-model="hunt_query"
              placeholder="Enter your hunting query"
              required
            ></CInput>
          </CCol>
          <CCol xs="12" lg="2">
            <CButton type="submit" class="btn btn-block btn-primary">Hunt</CButton>
          </CCol>
        </CRow></CForm
      >
      <CCard>
        <CTabs>
          <CTab title="All Events">
            <CCardBody>
              <div v-for="event in events">
                <div style="padding-bottom: 5px">
                  <span v-for="(k, v) in flatten(event)"
                    ><CBadge color="secondary" size="sm">{{ v }}</CBadge
                    ><CBadge>{{ k }}</CBadge
                    >&nbsp;</span
                  ><br />
                </div>
              </div>
            </CCardBody>
          </CTab>
          <CTab title="Process Creation">
            <CCardBody>
              <div v-for="event in events">
                <div v-if="event.event.code == 1" style="padding-bottom: 5px">
                  <span v-for="(k, v) in flatten(event)"
                    ><CBadge color="secondary" size="sm">{{ v }}</CBadge
                    ><CBadge>{{ k }}</CBadge
                    >&nbsp;</span
                  ><br />
                </div>
              </div>
            </CCardBody>
          </CTab>
          <CTab title="Network Connection">
            <CCardBody>
              <div v-for="event in events">
                <div v-if="event.event.code == 3" style="padding-bottom: 5px">
                  <span v-for="(k, v) in flatten(event)"
                    ><CBadge color="secondary" size="sm">{{ v }}</CBadge
                    ><CBadge>{{ k }}</CBadge
                    >&nbsp;</span
                  ><br />
                </div>
              </div>
            </CCardBody>
          </CTab>
          <CTab title="File Creation"> </CTab>
          <CTab title="Registry Modification"> </CTab>
        </CTabs>
      </CCard>

      <CRow v-if="hunt_complete">
        <CCol>
          <CRow v-for="hit in this.results" :key="hit._id">
            <CCol lg="12">
              <CCard>
                <CCardHeader>
                  {{ hit._source.message }}
                </CCardHeader>
                <CCardBody>
                  <vue-json-pretty
                    v-model="selected_fields"
                    :showLength="true"
                    :path="'_source'"
                    :data="hit"
                    selectableType="multiple"
                    :deepCollapseChildren="true"
                    :deep="2"
                  ></vue-json-pretty>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </CCol>
      </CRow>
      <CRow v-else>
        <CCol xs="12" lg="12">
          <center><h3>No events found.</h3></center>
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
      hunt_complete: true,
      fields: ["_index"],
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
    };
  },
  methods: {
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
