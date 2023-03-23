<template>
    <div>
        <CModal :show.sync="modal_status">
            TEST
        </CModal>
    </div>
</template>

<script>

export default {
    name: "DetectionRepositoryModal",
    props: {
        show: Boolean,
        repository: {
            type: Object,
            default: () => {}
        },
        modal_mode: {
            type: String,
            default: "Create"
        }
    },
    data() {
        return {
            modal_status: false,
            loading: false,
            error: false,
            error_message: "",
            selected_detections: []
        }
    },
    watch: {
        show: function() {
            this.error = false;
            this.error_message = "";
            this.modal_status = this.show;
        },
        modal_status: function() {
            if (this.modal_status) {
                this.error = false,
                this.error_message = ""
            }
            this.$emit("update:show", this.modal_status)
            if (!this.modal_status) {
                this.dismiss()
            }
        }
    },
    methods: {
        dismiss() {
            this.error = false,
            this.error_message = ""
            this.modal_status = false
            this.$emit("update:show", this.modal_status)
        }
    }
}
</script>