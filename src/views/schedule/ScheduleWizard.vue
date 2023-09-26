<template>
  <div>
    <CModal
      :title="title"
      :show.sync="modal_status"
      class="modal-wide"
      size="xl"
      :close-on-backdrop="false"
      style="width: 800px"
    >
      <CTabs
        variant="pills"
        :activeTab.sync="step"
        :fade="true"
        :vertical="{ navs: 'col-md-2', content: 'col-md-10' }"
      >
        <CTab title="General Settings">
          <h3>General Settings</h3>
          <p>Define the name and description of the schedule.  Schedules are used to determine when certain components of Reflex are allowed to run.</p>
          <CRow v-if="current_user.default_org">
            <CCol>
              <SelectInput
                :options="formatted_organizations"
                label="Organization"
                placeholder="Select an organization"
                :value.sync="schedule.organization"
                description="Select an organization related to this item."
              />
            </CCol>
          </CRow>
          <CRow>
            <CCol>
              <CInput
                label="Schedule Name"
                v-model="schedule.name"
                placeholder="Name"
              ></CInput>
            </CCol>
          </CRow>
          <CRow>
            <CCol>
              <CTextarea
                label="Description"
                v-model="schedule.description"
                placeholder="Description"
              ></CTextarea>
            </CCol>
          </CRow>
        </CTab>
        <CTab title="Schedule">
            <h3>Daily Schedule</h3>
            <p>Configure the days of the week the schedule allows actions to run.  Selecting <code>Custom Hours</code> will allow for configuring up to 5 individual time windows per day.</p>
            <CRow>
                <CCol>
                    <SelectInput label="Timezone" option_value="value" option_label="label" :options="timezones" :value.sync="schedule.timezone" placeholder="Select a timezone" description="Select the timezone for this schedule."/>
                </CCol>
            </CRow>
            <CRow>
                <CCol>
                    <h3>Days</h3>
                </CCol>
            </CRow>
            <CRow v-for="day, i in ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']" :key="i" style="margin-bottom: 10px">
                <CCol col=2>
                    <CInputCheckbox :label="capitalize(day)" :checked.sync='schedule[day].active'/>
                    
                </CCol>
                <CCol col=2>
                    <CInputCheckbox label="Custom Hours" :checked.sync='schedule[day].custom' @change="checkDayActive(day)"/>
                </CCol>
                    <CCol v-if="schedule[day].custom" clas="text-right">
                        <CRow v-for="period,p in schedule[day].hours" :key="p">
                            <CCol>
                                <CInput v-model="period.start" type="time" placeholder="Start Time"/>
                            </CCol>
                            <CCol col=1>
                                to
                            </CCol>
                            <CCol>
                                <CInput v-model="period.end" type="time" placeholder="End Time"/>
                            </CCol>
                            <CCol col=2>
                                <CButton color="danger" size="sm" @click="removeTimeWindow(day, p)">-</CButton>
                            </CCol>
                        </CRow>
                    </CCol>
                    <CCol col=1 v-if="schedule[day].custom" class="text-right">
                        <CButton color="primary" size="sm" @click="addTimeWindow(day)">+</CButton>
                    </CCol>
                </CRow>
            </CRow>
        </CTab>
        <CTab title="Review">
            <CAlert :show="error" color="danger">
                {{ error_message}}
            </CAlert>

            {{ schedule }}
        </CTab>
      </CTabs>
      <template #footer>
        <CButton color="secondary" @click="dismiss()">Dismiss</CButton>
        <CButton
          v-if="mode == 'create' && step == 2"
          @click="createSchedule()"
          color="primary"
          ><span v-if="submitted"><CSpinner size="sm" />&nbsp;</span
          >Create</CButton
        >
        <CButton
          v-if="mode == 'edit' && step == 2"
          @click="editSchedule()"
          color="primary"
          :disabled="submitted"
          ><span v-if="submitted"><CSpinner size="sm" />&nbsp;</span
          >Save</CButton
        >
        
        </template>
    </CModal>
  </div>
</template>
<script>
import { mapState } from "vuex";

import SelectInput from "../components/SelectInput.vue";

export default {
  name: "ScheduleWizard",
  components: {
    SelectInput,
  },
  computed: {
    ...mapState(["current_user", "organizations"]),
    formatted_organizations: function () {
      return this.organizations.map(function (org) {
        return {
          value: org.uuid,
          label: org.name,
        };
      });
    },
  },
  props: {
    show: Boolean,
    source_schedule: Object,
    mode: {
      type: String,
      default: "Create",
    },
  },
  methods: {
    capitalize: function (value) {
      if (!value) return "";
      value = value.toString();
      return value.charAt(0).toUpperCase() + value.slice(1);
    },
    checkDayActive(day) {

        if(!this.schedule[day].active && this.schedule[day].custom) {
            this.schedule[day].active = true
        }

        if(this.schedule[day].custom) {
            this.schedule[day].hours = [
                {
                    start: "00:00",
                    end: "23:59"
                }
            ]
        } else {
            this.schedule[day].hours = []
        }
    },
    createSchedule() {
      this.submitted = true;
      this.$store
        .dispatch("createSchedule", this.schedule)
        .then(() => {
          this.submitted = false;
          this.dismiss();
        })
        .catch((error) => {
          this.submitted = false;
          this.error = true;
          this.error_message = error.response.data.message;
          step = this.last_step;
        });
    },
    editSchedule() {
        this.submitted = true;
        let update_payload = {
            name: this.schedule.name,
            description: this.schedule.description,
            organization: this.schedule.organization,
            monday: this.schedule.monday,
            tuesday: this.schedule.tuesday,
            wednesday: this.schedule.wednesday,
            thursday: this.schedule.thursday,
            friday: this.schedule.friday,
            saturday: this.schedule.saturday,
            sunday: this.schedule.sunday,
            timezone: this.schedule.timezone
        }
        this.$store.dispatch("updateSchedule", {
            uuid: this.uuid,
            data: update_payload,
        })
        .then(() => {
            this.submitted = false;
            this.dismiss();
        })
        .catch((error) => {
            this.submitted = false;
            this.error = true;
            this.error_message = error.response.data.message;
            step = this.last_step;
        });
    },
    clearError() {
        this.error = false;
        this.error_message = "";
    },
    addTimeWindow(day) {
        if(this.schedule[day].hours.length < 5) {
            this.schedule[day].hours.push({
                start: "00:00",
                end: "23:59"
            })
        }
    },
    removeTimeWindow(day, index) {
        
        this.schedule[day].hours.splice(index, 1)
        if(this.schedule[day].hours.length == 0) {
            this.schedule[day].custom = false
        }
    },
    dismiss() {
        this.modal_status = false;
        this.clearError();
    }
  },
  watch: {
    show: function () {
      this.error = false;
      this.error_message = "";
      this.modal_status = this.show;
    },
    modal_status: function () {
      if (this.modal_status) {
        this.step = 0;
        this.title = this.capitalize(this.mode) + " Schedule";
        this.schedule = JSON.parse(JSON.stringify(this.source_schedule));
        if (this.mode == "edit") {
          this.uuid = this.schedule.uuid;
          delete this.schedule.uuid;
        }
      }
      this.$emit("update:show", this.modal_status);
      if (!this.modal_status) {
        this.dismiss();
      }
    },
  },
  data() {
    return {
      title: "",
      step: 0,
      submitted: false,
      modal_status: false,
      schedule: {
        name: "",
        description: "",
        organization: "",
        monday: {
          custom: false,
          hours: [],
          active: true
        },
        tuesday: {
          custom: false,
          hours: [],
          active: true
        },
        wednesday: {
          custom: false,
          hours: [],
          active: true
        },
        thursday: {
          custom: false,
          hours: [],
          active: true
        },
        friday: {
          custom: false,
          hours: [],
          active: true
        },
        saturday: {
          custom: false,
          hours: [],
          active: true
        },
        sunday: {
          custom: false,
          hours: [],
          active: true
        },
      },
      timezones: [
        { label: "(UTC-12:00) International Date Line West", value: "Etc/GMT+12" },
        { label: "(UTC-11:00) Coordinated Universal Time-11", value: "Etc/GMT+11" },
        { label: "(UTC-10:00) Hawaii", value: "Pacific/Honolulu" },
        { label: "(UTC-09:00) Alaska", value: "America/Anchorage" },
        { label: "(UTC-08:00) Baja California", value: "America/Santa_Isabel" },
        {
          label: "(UTC-08:00) Pacific Time (US and Canada)",
          value: "America/Los_Angeles",
        },
        { label: "(UTC-07:00) Chihuahua, La Paz, Mazatlan", value: "America/Chihuahua" },
        { label: "(UTC-07:00) Arizona", value: "America/Phoenix" },
        { label: "(UTC-07:00) Mountain Time (US and Canada)", value: "America/Denver" },
        { label: "(UTC-06:00) Central America", value: "America/Guatemala" },
        { label: "(UTC-06:00) Central Time (US and Canada)", value: "America/Chicago" },
        { label: "(UTC-06:00) Saskatchewan", value: "America/Regina" },
        {
          label: "(UTC-06:00) Guadalajara, Mexico City, Monterey",
          value: "America/Mexico_City",
        },
        { label: "(UTC-05:00) Bogota, Lima, Quito", value: "America/Bogota" },
        { label: "(UTC-05:00) Indiana (East)", value: "America/Indiana/Indianapolis" },
        { label: "(UTC-05:00) Eastern Time (US and Canada)", value: "America/New_York" },
        { label: "(UTC-04:30) Caracas", value: "America/Caracas" },
        { label: "(UTC-04:00) Atlantic Time (Canada)", value: "America/Halifax" },
        { label: "(UTC-04:00) Asuncion", value: "America/Asuncion" },
        {
          label: "(UTC-04:00) Georgetown, La Paz, Manaus, San Juan",
          value: "America/La_Paz",
        },
        { label: "(UTC-04:00) Cuiaba", value: "America/Cuiaba" },
        { label: "(UTC-04:00) Santiago", value: "America/Santiago" },
        { label: "(UTC-03:30) Newfoundland", value: "America/St_Johns" },
        { label: "(UTC-03:00) Brasilia", value: "America/Sao_Paulo" },
        { label: "(UTC-03:00) Greenland", value: "America/Godthab" },
        { label: "(UTC-03:00) Cayenne, Fortaleza", value: "America/Cayenne" },
        { label: "(UTC-03:00) Buenos Aires", value: "America/Argentina/Buenos_Aires" },
        { label: "(UTC-03:00) Montevideo", value: "America/Montevideo" },
        { label: "(UTC-02:00) Coordinated Universal Time-2", value: "Etc/GMT+2" },
        { label: "(UTC-01:00) Cape Verde", value: "Atlantic/Cape_Verde" },
        { label: "(UTC-01:00) Azores", value: "Atlantic/Azores" },
        { label: "(UTC+00:00) Casablanca", value: "Africa/Casablanca" },
        { label: "(UTC+00:00) Monrovia, Reykjavik", value: "Atlantic/Reykjavik" },
        {
          label: "(UTC+00:00) Dublin, Edinburgh, Lisbon, London",
          value: "Europe/London",
        },
        { label: "(UTC+00:00) Coordinated Universal Time", value: "Etc/GMT" },
        {
          label: "(UTC+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna",
          value: "Europe/Berlin",
        },
        {
          label: "(UTC+01:00) Brussels, Copenhagen, Madrid, Paris",
          value: "Europe/Paris",
        },
        { label: "(UTC+01:00) West Central Africa", value: "Africa/Lagos" },
        {
          label: "(UTC+01:00) Belgrade, Bratislava, Budapest, Ljubljana, Prague",
          value: "Europe/Budapest",
        },
        { label: "(UTC+01:00) Sarajevo, Skopje, Warsaw, Zagreb", value: "Europe/Warsaw" },
        { label: "(UTC+01:00) Windhoek", value: "Africa/Windhoek" },
        { label: "(UTC+02:00) Athens, Bucharest, Istanbul", value: "Europe/Istanbul" },
        {
          label: "(UTC+02:00) Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius",
          value: "Europe/Kiev",
        },
        { label: "(UTC+02:00) Cairo", value: "Africa/Cairo" },
        { label: "(UTC+02:00) Damascus", value: "Asia/Damascus" },
        { label: "(UTC+02:00) Amman", value: "Asia/Amman" },
        { label: "(UTC+02:00) Harare, Pretoria", value: "Africa/Johannesburg" },
        { label: "(UTC+02:00) Jerusalem", value: "Asia/Jerusalem" },
        { label: "(UTC+02:00) Beirut", value: "Asia/Beirut" },
        { label: "(UTC+03:00) Baghdad", value: "Asia/Baghdad" },
        { label: "(UTC+03:00) Minsk", value: "Europe/Minsk" },
        { label: "(UTC+03:00) Kuwait, Riyadh", value: "Asia/Riyadh" },
        { label: "(UTC+03:00) Nairobi", value: "Africa/Nairobi" },
        { label: "(UTC+03:30) Tehran", value: "Asia/Tehran" },
        {
          label: "(UTC+04:00) Moscow, St. Petersburg, Volgograd",
          value: "Europe/Moscow",
        },
        { label: "(UTC+04:00) Tbilisi", value: "Asia/Tbilisi" },
        { label: "(UTC+04:00) Yerevan", value: "Asia/Yerevan" },
        { label: "(UTC+04:00) Abu Dhabi, Muscat", value: "Asia/Dubai" },
        { label: "(UTC+04:00) Baku", value: "Asia/Baku" },
        { label: "(UTC+04:00) Port Louis", value: "Indian/Mauritius" },
        { label: "(UTC+04:30) Kabul", value: "Asia/Kabul" },
        { label: "(UTC+05:00) Tashkent", value: "Asia/Tashkent" },
        { label: "(UTC+05:00) Islamabad, Karachi", value: "Asia/Karachi" },
        { label: "(UTC+05:30) Sri Jayewardenepura Kotte", value: "Asia/Colombo" },
        {
          label: "(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi",
          value: "Asia/Kolkata",
        },
        { label: "(UTC+05:45) Kathmandu", value: "Asia/Kathmandu" },
        { label: "(UTC+06:00) Astana", value: "Asia/Almaty" },
        { label: "(UTC+06:00) Dhaka", value: "Asia/Dhaka" },
        { label: "(UTC+06:00) Yekaterinburg", value: "Asia/Yekaterinburg" },
        { label: "(UTC+06:30) Yangon", value: "Asia/Yangon" },
        { label: "(UTC+07:00) Bangkok, Hanoi, Jakarta", value: "Asia/Bangkok" },
        { label: "(UTC+07:00) Novosibirsk", value: "Asia/Novosibirsk" },
        { label: "(UTC+08:00) Krasnoyarsk", value: "Asia/Krasnoyarsk" },
        { label: "(UTC+08:00) Ulaanbaatar", value: "Asia/Ulaanbaatar" },
        {
          label: "(UTC+08:00) Beijing, Chongqing, Hong Kong, Urumqi",
          value: "Asia/Shanghai",
        },
        { label: "(UTC+08:00) Perth", value: "Australia/Perth" },
        { label: "(UTC+08:00) Kuala Lumpur, Singapore", value: "Asia/Singapore" },
        { label: "(UTC+08:00) Taipei", value: "Asia/Taipei" },
        { label: "(UTC+09:00) Irkutsk", value: "Asia/Irkutsk" },
        { label: "(UTC+09:00) Seoul", value: "Asia/Seoul" },
        { label: "(UTC+09:00) Osaka, Sapporo, Tokyo", value: "Asia/Tokyo" },
        { label: "(UTC+09:30) Darwin", value: "Australia/Darwin" },
        { label: "(UTC+09:30) Adelaide", value: "Australia/Adelaide" },
        { label: "(UTC+10:00) Hobart", value: "Australia/Hobart" },
        { label: "(UTC+10:00) Yakutsk", value: "Asia/Yakutsk" },
        { label: "(UTC+10:00) Brisbane", value: "Australia/Brisbane" },
        { label: "(UTC+10:00) Guam, Port Moresby", value: "Pacific/Port_Moresby" },
        { label: "(UTC+10:00) Canberra, Melbourne, Sydney", value: "Australia/Sydney" },
        { label: "(UTC+11:00) Vladivostok", value: "Asia/Vladivostok" },
        {
          label: "(UTC+11:00) Solomon Islands, New Caledonia",
          value: "Pacific/Guadalcanal",
        },
        { label: "(UTC+12:00) Coordinated Universal Time+12", value: "Etc/GMT-12" },
        { label: "(UTC+12:00) Fiji, Marshall Islands", value: "Pacific/Fiji" },
        { label: "(UTC+12:00) Magadan", value: "Asia/Magadan" },
        { label: "(UTC+12:00) Auckland, Wellington", value: "Pacific/Auckland" },
        { label: "(UTC+13:00) Nuku'alofa", value: "Pacific/Tongatapu" },
        { label: "(UTC+13:00) Samoa", value: "Pacific/Apia" },
      ],
      error: false,
      error_message: "",
      last_step: 2
    };
  },
};
</script>
