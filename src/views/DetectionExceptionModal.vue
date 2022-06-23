<template>
  <div>
    <link
      rel="stylesheet"
      href="https://unpkg.com/vue-multiselect@2.1.0/dist/vue-multiselect.min.css"
    />
    <CModal
      title="Create Detection Exception"
      :centered="false"
      size="xl"
      :show.sync="modalStatus"
      :closeOnBackdrop="false"
    >{{rule_uuid}} {{exceptions}}
    </CModal>
  </div>
</template>
<style scoped>
.modal-body {
  padding-left: 0px;
}
</style>
<script>
export default {
  name: "DetectionExceptionModal",
  props: {
    show: Boolean,
    exception: Object,
    rule: Object,
    mode: {
      type: String,
      default: "Create",
    },
  },
  watch: {
    show: function () {
      this.error = false;
      this.error_message = "";
      if (this.mode == "Edit") {
        this.step = 0;
      }
      this.modalStatus = this.show;
    },
    modalStatus: function () {
      if (this.modalStatus) {
        this.$store.dispatch("getMitreTactics", {});
        this.$store.dispatch("getMitreTechniques", {});
        this.test_failed = true;
        this.loadData();
      }
      this.$emit("update:show", this.modalStatus);
      if (!this.modalStatus) {
        this.reset();
      }
    },
  }
}
</script>