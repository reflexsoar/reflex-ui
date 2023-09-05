<template>
  <CModal :show.sync="show" size="lg" :title="title">
    <div class="text-center" v-if="loading">
      <CSpinner />
    </div>
    <div v-else  style="max-height: 50vh; overflow-y: auto;">
      <h1>{{ title }}</h1>
      <div v-for="section in release_notes.sections" :key="section.title">
        <h2>{{ section.title }}</h2>
        <div v-for="item in section.items" :key="item.title">
          <h4>{{ item.title }}</h4>
          <div><vue-markdown>{{ item.description }}</vue-markdown></div>
        </div>
      </div>
    </div>

    <template #footer>
      <CInputCheckbox
        :checked.sync="dont_show_again"
        label="Don't show this again"
      ></CInputCheckbox
      ><CButton @click="dismiss()" color="primary">Dismiss</CButton>
    </template>
  </CModal>
</template>

<script>
export default {
  name: "WhatsNewModal",
  data() {
    return {
      show: false,
      dont_show_again: false,
      release_notes: {},
      title: "What's New in ",
    };
  },
  beforeCreate() {},
  created() {
    // Get the whatsnew.json file from the server and parse it
    this.loading = true;
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "/release-notes/whatsnew.json", false);
    xhr.send(null);
    this.release_notes = JSON.parse(xhr.responseText);
    this.loading = false;

    this.title += this.release_notes.version;
    this.dont_show_key = "whats_new_dont_show_again-"+this.release_notes.version;

    // If the user has already dismissed the modal, then we don't want to show it again
    this.dont_show_again = localStorage.getItem(this.dont_show_key) === "true";
    if(this.release_notes === null) {
        this.show = false;
    } else {
        this.show = this.dont_show_again === true ? false : true;
    }    
  },
  methods: {
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
