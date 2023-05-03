<template>
    <div>
        <CModal title="Remove Detections from Repository" size="lg" :show.sync="modalStatus">
            <p>Select the Detection Repository to remove the <b>{{ detection_ids.length }}</b> selected Detections from.</p>
            <label>Repository</label>
            <CSelect :value.sync="selected_repository" :options="repositories" placeholder="Select a repository"/>
            <template v-slot:footer>
                <CButton color="secondary" @click="dismiss()">Cancel</CButton>
                <CButton color="danger" @click="removeFromRepository()">Remove</CButton>
            </template>
        </CModal>
    </div>
</template>

<script>
import { mapState } from "vuex";

export default {
    name: "RemoveFromRepositoryModal",
    props: {
        show: Boolean,
        detection_ids: {
            type: Array,
            default: () => []
        },
        selected_repos: {
            type: Array,
            default: () => []
        }
    },
    computed: {
        ...mapState(["current_user", "detection_repositories"]),
        repositories() {
            return this.detection_repositories.filter((repo) => this.selected_repos.includes(repo.uuid)).map((repo) => {
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
        removeFromRepository() {
            this.$store.dispatch('removeDetectionFromRepository', {
                uuid: this.selected_repository,
                detections: this.detection_ids
            }).then(() => {
                this.$emit('rule_removed', true)
                this.dismiss()
            })     
        },
        dismiss() {
            this.error = false;
            this.error_message = "";
            this.modalStatus = false;
            this.$emit("update:show", this.modalStatus);
            this.$emit("update:detection_ids", []);
            this.$emit("update:selected_repos", []);
        }
    }
}
</script>