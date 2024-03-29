<template>
  <div>
    <CModal title="Load/Update Event View" :show.sync="modalStatus" size="lg">
      <CAlert v-if="error" color="danger">{{ error_message }}</CAlert>
        <div v-if="loading">
          <CSpinner color="primary" />
        </div>
        <div v-else>
          <p>Select a view to load or edit.  The Event Queue will immediately be refreshed upon clicking <b>Load</b>.</p>
          <SelectInput
                :value.sync="selected_view"
                :options="event_views"
                option_label="name"
                option_key="uuid"
                placeholder="Select a view"
            >
              <template #option="{ option }">
                    <CCol col="10" class="event-view-option-name">
                       {{ option.name }}
                    </CCol>
                    <CCol class="text-right" v-if="option.shared">
                      <CBadge color="info">Shared</CBadge>
                    </CCol>
              </template>
            </SelectInput>
        </div>
        <span v-if="view != null && view.created_by.uuid == current_user.uuid"><br>
          <label>Update view?</label><br />
          <CSwitch label-on="Yes" label-off="No" :checked.sync="update_view" color="success"></CSwitch><br />
          <div v-if="update_view"><br>
            <h3>Update View</h3>
            <p>Users can rename and update their own views. Shared views can only be updated by the creator.</p>
            <CInput label="View Name" v-model="view.name" placeholder="Enter a name for the view"></CInput>
            <label>Shared View</label><br />
            <CSwitch label-on="Yes" label-off="No" :checked.sync="view.shared" color="success"></CSwitch><br />
          </div>
        </span>
      
      <template v-slot:footer>
        <CButton color="secondary" @click="dismiss()">Cancel</CButton>
        <CButton color="info" v-if="view != null && update_view" @click="saveView()">Update</CButton>
        <CButton color="primary" @click="loadView()">Load</CButton>
      </template>
    </CModal>
  </div>
</template>

<style scoped>
.event-view-option-name {
  padding-left: 0px;
}
</style>

<script>
import { mapState } from "vuex";

import SelectInput from "@/views/components/SelectInput.vue";

export default {
  name: "LoadViewModal",
  components: {
    SelectInput
  },
  props: {
    show: Boolean,
    filter_string: String,
  },
  computed: {
    ...mapState(["current_user", "event_views", "observable_filters"])
  },
  data() {
    return {
      modalStatus: false,
      loading: false,
      error: false,
      error_message: "",
      view_name: "",
      shared: false,
      selected_view: null,
      update_view: false,
      view: null
    };
  },
  watch: {
    show: function () {
      this.error = false;
      this.error_message = "";
      this.modalStatus = this.show;
    },
    selected_view: function () {
      // Clone the view so we can edit it without affecting the original
      this.view = this.event_views.find((view) => view.uuid == this.selected_view)
    },
    modalStatus: function () {
      if (this.modalStatus) {
        this.selected_view = null;
        this.update_view = false;
        this.view = null;
        this.listViews();
      }
      this.$emit("update:show", this.modalStatus);
      if (!this.modalStatus) {
        this.dismiss();
      }
    },
  },
  methods: {
    saveView() {
      let saved_filter_string = JSON.stringify(this.observable_filters)
      this.$store
        .dispatch("updateEventView", {
          uuid: this.view.uuid,
          data: {
            name: this.view.name,
            filter_string: saved_filter_string,
            shared: this.view.shared
          }
        })
        .then(() => {
          this.error = false;
          this.dismiss();
        })
        .catch((error) => {
          this.error = true;
          this.error_message = error.response.data.message;
        });
    },
    listViews() {
      this.loading = true;
      this.$store.dispatch("getEventViews", {}).then(() => {
        this.loading = false;
      }).catch((error) => {
        this.loading = false;
        this.error = true;
        this.error_message = error.response.data.message;
      });
    },
    loadView() {
      // Convert the filter string into a filter object
      if (this.selected_view.filter_string) {
        let filter = JSON.parse(this.selected_view.filter_string);
        this.$store.commit('update_observable_filters', filter)
        this.dismiss();
      }
    },
    dismiss() {
      this.error = false;
      this.error_message = "";
      this.modalStatus = false;
      this.$emit("update:show", this.modalStatus);
    },
  },
};
</script>
