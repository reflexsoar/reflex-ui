<template>
  <div>
    <CModal title="Save Event View" :show.sync="modalStatus">
      <CAlert v-if="error" color="danger">{{ error_message }}</CAlert>
      <p>
        <CInput
          label="View Name"
          v-model="view_name"
          placeholder="Enter a name for the view"
          description="This rule will be saved for future use."
        ></CInput>
        <label>Shared View</label><br />
        <CSwitch
          label-on="Yes"
          label-off="No"
          :checked.sync="shared"
          color="success"
        ></CSwitch
        ><br />
        <small class="text-muted"
          >A shared view can be used by anyone else in the tenant but only edited by the
          creator.</small
        >
      </p>
      <template v-slot:footer>
        <CButton color="secondary" @click="dismiss()">Cancel</CButton>
        <CButton color="primary" @click="createView()">Create</CButton>
      </template>
    </CModal>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "SaveViewModal",
  props: {
    show: Boolean,
    filter_string: String,
  },
  computed: {
    ...mapState(["current_user"]),
    repositories() {
      return this.detection_repositories.map((repo) => {
        return {
          label: repo.name,
          value: repo.uuid,
        };
      });
    },
  },
  data() {
    return {
      modalStatus: false,
      loading: false,
      error: false,
      error_message: "",
      view_name: "",
      shared: false,
    };
  },
  watch: {
    show: function () {
      this.error = false;
      this.error_message = "";
      this.modalStatus = this.show;
    },
    modalStatus: function () {
      if (this.modalStatus) {
        this.test_failed = true;
      }
      this.$emit("update:show", this.modalStatus);
      if (!this.modalStatus) {
        this.dismiss();
      }
    },
  },
  methods: {
    createView() {
      this.$store
        .dispatch("createEventView", {
          name: this.view_name,
          filter_string: this.filter_string,
          shared: this.shared,
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
    dismiss() {
      this.error = false;
      this.error_message = "";
      this.modalStatus = false;
      this.$emit("update:show", this.modalStatus);
    },
  },
};
</script>
