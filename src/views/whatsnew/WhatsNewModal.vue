<template>
  <CModal :show.sync="show" size="xl" title="test">
    <template #header>
      <CRow style="width: 100%">
        <CCol>
          <h3>What's New!</h3>
        </CCol>
        <CCol class="text-right" col=4>
          <CSelect
            :options="versions"
            @change="getReleaseNotes"
            :value.sync="version"
            style="margin-bottom: 0px"
            :horizontal="{label: 'col-sm-5', input: 'col-sm-7'}"
            label="Version"
          />
        </CCol>
      </CRow>
    </template>
    <div class="text-center" v-if="loading">
      <CSpinner />
    </div>
    <div v-else>
      <CRow>
        <CCol>
          <h1>{{ title }}</h1>
        </CCol>
      </CRow>
      <CRow style="max-height: 50vh; overflow-y: auto">
        <CCol>
          <div v-for="section in release_notes.sections" :key="section.title">
            <h2>{{ section.title }}</h2>
            <div v-for="item in section.items" :key="item.title">
              <h4>{{ item.title }}</h4>
              <div>
                <vue-markdown>{{ item.description }}</vue-markdown>
              </div>
            </div>
          </div>
        </CCol>
      </CRow>
    </div>

    <template #footer>
      <CRow style="width: 100%">
        <CCol>
          <CInputCheckbox
            :checked.sync="dont_show_again"
            label="Don't show this again"
          ></CInputCheckbox
          >
        </CCol>
        <CCol class="text-right">
          <CButton @click="dismiss()" color="primary">Dismiss</CButton>
        </CCol>
      </CRow>
    </template>
  </CModal>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "WhatsNewModal",
  computed: {
    ...mapState(["release_notes", "previous_versions"]),
    title() {
      return "What's New in " + this.release_notes.version;
    },
    versions() {
      let sorted_versions = this.previous_versions.sort((a, b) => {
        return a - b;
      });
      return ['current', ...sorted_versions]
    }
  },
  data() {
    return {
      show: false,
      dont_show_again: false,
      version: "current",
      loading: false,
    };
  },
  beforeCreate() {},
  created() {
    // Get the whatsnew.json file from the server and parse it

    this.getReleaseNotes();
    this.dont_show_key = "whats_new_dont_show_again-" + this.release_notes.version;

    // If the user has already dismissed the modal, then we don't want to show it again
    this.dont_show_again = localStorage.getItem(this.dont_show_key) === "true";
    if (this.release_notes === null) {
      this.show = false;
    } else {
      this.show = this.dont_show_again === true ? false : true;
    }
  },
  methods: {
    getReleaseNotes() {
      this.loading = true;
      this.$store.dispatch("getReleaseNotes", { version: this.version }).then((resp) => {
        this.loading = false;
      });
    },
    dismiss() {
      // If this.dont_show_again is true, then we don't want to show the modal again
      // add a localStorage item to indicate that
      if (this.dont_show_again) {
        localStorage.setItem(this.dont_show_key, true);
      }
      this.$emit("update:show", false);
      this.show = false;
    },
  },
};
</script>
