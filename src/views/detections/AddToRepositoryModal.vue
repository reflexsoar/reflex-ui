<template>
    <div>
        <CModal title="Add Detections to Repository" size="lg" :show.sync="modalStatus">
            <p>Select the Detection Repository to add the <b>{{ detection_ids.length }}</b> selected Detections to.</p>
            <label>Repository</label>
            <CSelect :value.sync="selected_repository" :options="repositories" placeholder="Select a repository"/>
            <template v-slot:footer>
                <CButton color="secondary" @click="dismiss()">Cancel</CButton>
                <CButton color="primary" @click="addToRepository()">Add</CButton>
            </template>
        </CModal>
    </div>
</template>

<script>
import { mapState } from "vuex";

export default {
    name: "AddToRepositoryModal",
    props: {
        show: Boolean,
        detection_ids: {
            type: Array,
            default: () => []
        }
    },
    computed: {
        ...mapState(["current_user", "detection_repositories"]),
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
            test_failed: false,
            selected_repository: ""
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
        addToRepository() {
            this.$store.dispatch('addDetectionToRepository', {
                uuid: this.selected_repository,
                detections: this.detection_ids
            }).then(() => {
                this.$emit('rule_added', true)
                this.dismiss();
            })
        },
        dismiss() {
            this.error = false;
            this.error_message = "";
            this.modalStatus = false;
            this.$emit("update:show", this.modalStatus);
            this.$emit("update:detection_ids", []);
        }
    }
}
</script>