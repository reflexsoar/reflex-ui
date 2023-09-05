<template>
  <CModal title="Export Events" :centered="false" size="lg" :show.sync="modalStatus">
    <CAlert :show.sync="error" color="danger">
      {{ error_message }}
    </CAlert>
    <p>Use the below wizard to create a filtered export of Events from the system.</p>
    <v-date-picker
      v-model="report_params.date_range"
      mode="dateTime"
      :masks="masks"
      is-range
    >
      <template v-slot="{ inputValue, inputEvents }">
        <CRow>
          <CCol>
            <CInput
              label="Start Date"
              :value="inputValue.start"
              v-on="inputEvents.start"
              key="event_picker_start_date"
            >
              <template #prepend-content><CIcon name="cil-calendar" /> </template>
            </CInput>
          </CCol>
          <CCol>
            <CInput
              label="End Date"
              :value="inputValue.end"
              v-on="inputEvents.end"
              key="event_picker_end_date"
            >
              <template #prepend-content><CIcon name="cil-calendar" /> </template>
            </CInput>
          </CCol>
        </CRow>
      </template>
    </v-date-picker>
    <CInput
      label="Report Name"
      v-model="report_params.report_name"
      placeholder="My Report"
      description="OPTIONAL - A friendly name to identify this report"
    />
    <RMultiCheck
      label="Fields"
      :items="available_fields"
      :value.sync="report_params.fields"
    />
    <RMultiCheck
      label="Statuses"
      :items="status_options"
      :value.sync="report_params.statuses"
    />
    <RMultiCheck
      label="Severities"
      :items="severity_options"
      :value.sync="report_params.severities"
    />
    <label style="margin-bottom: 0px">Export Format</label>
    <BlockSwitch
      :checked.sync="report_params.as_json"
      label="Export as JSON"
      description="Export the events as JSON instead of CSV"
    >
      <template #labelOn> JSON </template>
      <template #labelOff> CSV </template>
    </BlockSwitch>
    <template #footer>
      <CButton color="secondary" @click="dismiss()">Cancel</CButton>
      <CButton color="primary" @click="generateReport()" v-bind:disabled="submitted"><span v-if="submitted"><CSpinner size="sm"/>&nbsp;</span>Export</CButton>
    </template>
  </CModal>
</template>

<script>
import { mapState } from "vuex";

import RMultiCheck from "../components/MultiCheck";
import BlockSwitch from "../components/BlockSwitch";

export default {
  name: "EventExportWizard",
  props: {
    show: Boolean,
  },
  components: {
    RMultiCheck,
    BlockSwitch,
  },
  watch: {
    show: function () {
      this.modalStatus = this.show;
      this.$emit("update:show", this.modalStatus);
      if (this.show) {
        this.default_params();
      }
    },
    modalStatus: function () {
      if (!this.modalStatus) {
        this.$emit("update:show", this.modalStatus);
      }
    },
  },
  data() {
    return {
      error: false,
      error_message: "",
      submitted: false,
      modalStatus: this.show,
      available_fields: [
        {
          label: "Title",
          value: "title",
          description: "The title of the Event",
        },
        {
          label: "Description",
          value: "description",
          description: "The description of the Event",
        },
        {
          label: "Severity",
          value: "severity",
          description: "The severity of the Event",
        },
        {
          label: "Risk Score",
          value: "risk_score",
          description: "The risk score of the Event",
        },
        {
          label: "Status",
          value: "status.name",
          description: "The name of the Status",
        },
        {
          label: "Status Description",
          value: "status.description",
          description: "The description of the Status",
        },
        {
          label: "Created At",
          value: "created_at",
          description: "The date the event was created in ReflexSOAR",
        },
        {
          label: "Event Original Date",
          value: "original_date",
          description: "The date the event was originally occurred",
        },
        {
          label: "Updated At",
          value: "updated_at",
          description: "The date the event was last updated in ReflexSOAR",
        },
        {
          label: "Dismissed By Rule",
          value: "dismissed_by_rule",
          description: "Was the Event dismissed by Event Rule",
        },
        {
          label: "Case",
          value: "case",
          description: "The Case the Event is associated with",
        },
        {
          label: "Dismissed By",
          value: "dismissed_by.username",
          description: "The User that dismissed the Event",
        },
        {
          label: "Dismiss Reason",
          value: "dismiss_reason",
          description: "The reason the Event was dismissed",
        },
        {
          label: "Dismissed At",
          value: "dismissed_at",
          description: "The date the Event was dismissed",
        },
        {
          label: "Dismiss Comment",
          value: "dismiss_comment",
          description: "The comment associated with the dismissal",
        },
        {
            label: "Source",
            value: "source",
            description: "The source of the Event",
        },
        {
            label: "Detection Rule",
            value: "detection_id",
            description: "The detection rule that triggered the Event",
        }
      ],
      severity_options: [
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
      start_date: "",
      end_date: "",
      status_options: [
        {
          label: "New",
          value: "New",
        },
        {
          label: "Open",
          value: "Open",
        },
        {
          label: "Closed",
          value: "Closed",
        },
        {
          label: "Dismissed",
          value: "Dismissed",
        },
      ],
      masks: {
        input: "YYYY-MM-DD h:mm A",
      },
      report_params: {
        report_name: "event-export",
        statuses: ["New", "Open", "Closed", "Dismissed"],
        fields: [],
        severities: [],
        as_json: false,
        date_range: {
          start: "",
          end: "",
        },
      },
    };
  },
  methods: {
    today() {
      let d = new Date();
      d.setHours(23, 59, 59, 0);
      return d;
    },
    days_ago(offset) {
      let d = new Date();
      d.setDate(d.getDate() - offset);
      d.setHours(0, 0, 0, 0);
      return d;
    },
    default_params() {
      this.error = false;
      this.error_message = "";
      this.report_params = {
        report_name: "event-export",
        statuses: ["New", "Open", "Closed", "Dismissed"],
        fields: [
          "title",
          "description",
          "status.name",
          "status.description",
          "created_at",
          "updated_at",
          "dismissed_by_rule",
          "case",
          "dismissed_by.username",
          "dismiss_reason",
          "dismissed_at",
          "dismiss_comment",
          "original_date",
          "severity",
          "risk_score",
          "source",
          "detection_id",

        ],
        severities: [1, 2, 3, 4],
        as_json: false,
        date_range: {
          start: this.days_ago(30),
          end: this.today(),
        },
      };
    },
    dismiss() {
      this.modalStatus = false;
    },
    generateReport() {
      this.submitted = true;
      this.$store
        .dispatch("getEventExport", this.report_params)
        .then((resp) => {
          // Download the file as a blob
          let blob = new Blob([resp.data]);
          let link = document.createElement("a");
          link.href = window.URL.createObjectURL(blob);
          console.log(resp);
          if (this.report_params.as_json) {
            link.download = this.report_params.report_name+".ndjson";
          } else {
            link.download = this.report_params.report_name+".csv";
          }
          link.click();
          this.submitted = false;
          this.dismiss();
        })
        .catch((err) => {
          this.error = true;
          this.error_message = err.response.data.message;
          this.submitted = false;
        });
    },
  },
};
</script>
