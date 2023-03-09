<template>
    <div>
        <CModal title="Add Detections to Repository" size="lg" :show.sync="modalStatus">
            <label>Detections</label>
            <CMultiSelect v-model="selected_detections" :search="true" :options="detection_options" :multiple="true"/>
        TODO: Add a drop down to select the repository to add to
        TODO: Add a button to create a new repo from this modal if the one the user wants doesnt exist
        </CModal>
    </div>
</template>

<script>
import { mapState } from "vuex";

export default {
    name: "AddToRepositoryModal",
    props: {
        show: Boolean,
    },
    computed: {
        ...mapState(["current_user", "detections"]),
        detection_options: function() {
            return this.detections.map((detection) => {
                return {
                    text: detection.name,
                    value: detection.uuid,
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
            test_failed: false,
            repositories: [{text:'Awesome', value:'awesome'}],
            selected_detections: []
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
        }
    },
    methods: {
        dismiss() {
            this.error = false;
            this.error_message = "";
            this.modalStatus = false;
            this.$emit("update:show", this.modalStatus);
        }
    }
}
</script>