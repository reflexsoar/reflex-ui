<template>
    <div><link
      rel="stylesheet"
      href="https://unpkg.com/vue-multiselect@2.1.0/dist/vue-multiselect.min.css"
    />
        <CModal size="lg" :show.sync="modalStatus" :closeOnBackdrop="false">
            <template #header>
                <h5 style="text-transform: capitalize">{{mode}} Detection Repository</h5>
                <span class="text-right">
                        <button type="button" aria-label="Close" class="close" @click="dismiss()">
                            ×
                        </button>
                        <button type="button" class="kb" aria-label="Documentation"
                            onclick="window.open('https://docs.reflexsoar.com/en/latest/detections')">
                            <CIcon name="cil-book" size="lg" />
                        </button>
                    </span>
            </template>
            <p>Detection Repositories allow for grouping multiple detections into logical buckets for the purpose of sharing them across ReflexSOAR instances or tenants.</p>
            <!-- Show the organization multiselect if the current user is in the default_org -->
            <template v-if="current_user.default_org">
                <label>Organization</label>
                <CSelect :value.sync="repository.organization" :options="org_options" placeholder="Select an organization"/>
            </template>

            <CInput v-model="repository.name" placeholder="Repository Name" label="Name" />
            <CTextarea rows=5 v-model="repository.description" placeholder="Repository Description" label="Description" />

            
            <!-- share_type and repo_type picker -->
            <CRow>
                <CCol>
                    <label>Repository Type</label>
                    <CSelect :value.sync="repository.repo_type" :options="repo_type_options" placeholder="Select a repository type"/>
                </CCol>
                <CCol>
                    <label>Share Type</label>
                    <CSelect :value.sync="repository.share_type" :options="share_options" placeholder="Select a share type"/>
                </CCol>
            </CRow>
            <template v-if="current_user.default_org && repository.share_type == 'local-shared' && repository.repo_type == 'local'">
                <label>Access Scope</label>
                <p>Access scope defines what Organizations can access and synchronize the detections in this repository.  If left empty, this will be accessible by all tenants in the ReflexSOAR instance.</p>
                <multiselect v-model="repository.access_scope" :options="org_options" :multiple="true" :close-on-select="false" placeholder="Select an access scope" label="label" track-by="value"/><br>
            </template>
            <!-- Tags multiselect -->
            <label>Tags</label>
            <multiselect
                v-model="repository.tags"
                placeholder="Select tags to apply to this input"
                :taggable="true"
                tag-placeholder="Add new tag"
                :options="tag_list"
                :multiple="true"
                @tag="addTag"
                :close-on-select="false"
            >
            </multiselect>
            <template v-slot:footer>
                <CButton color="secondary" @click="dismiss()">Cancel</CButton>
                <CButton v-if="mode == 'Create'" color="primary" @click="createRepository()">Create</CButton>
                <CButton v-if="mode == 'Edit'" color="primary" @click="editRepository()">Edit</CButton>
            </template>
        </CModal>
    </div>
</template>

<script>
import { mapState } from "vuex";

export default {
    name: "DetectionRepositoryModal",
    props: {
        show: Boolean,
        repository: {
            type: Object,
            default: () => {
                return {
                    name: "",
                    description: "",
                    organization: "",
                    tags: [],
                    repo_type: "local",
                    share_type: "private",
                    access_scope: []
                };
            }
        },
        mode: {
            type: String,
            default: "Create"
        }
    },
    computed: {
        ...mapState(["current_user","organizations"]),
        org_options() {
            return this.organizations.map((org) => {
                return {
                    label: org.name,
                    value: org.uuid,
                };
            });
        },
        share_options() {
            if(this.repository.repo_type == "local") {
                return [
                    'private','local-shared'
                ]
            } else {
                return [
                    'external-private', 'external-public'
                ]
            }
        }
    },
    data() {
        return {
            modalStatus: false,
            loading: false,
            error: false,
            error_message: "",
            test_failed: false,
            tag_list: [],
            repo_type_options: [
                'local',
                'remote'
            ],
            share_type_options: [
                'private','local-shared', 'external-private', 'external-public'
            ]
        };
    },
    watch: {
        show: function () {
            if(this.show) {
                if(this.current_user.default_org) {
                    this.$store.dispatch('getOrganizations', {page_size: 10000}).then(() => {
                        this.modalStatus = this.show;
                    })
                } else {
                    this.modalStatus = this.show;
                }

                // If the mode is edit then we need to get the tags for the repository take
                // the tags from the repository object and add them to tag_list
                if(this.mode == "Edit") {
                    this.repository.tags.forEach((tag) => {
                        this.tag_list.push(tag);
                    })

                    if(this.current_user.default_org) {
                        if(this.repository.access_scope != undefined) {
                            this.repository.access_scope = this.organizations.filter((org) => {
                                return this.repository.access_scope.includes(org.uuid);
                            }).map((org) => {
                                return {
                                    label: org.name,
                                    value: org.uuid,
                                };
                            });
                        }
                    }
                }
            }
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
        createRepository() {
            this.$store.dispatch('createDetectionRepository', {data: this.repository}).then(() => {
                this.modalStatus = false;
                this.$emit("update:show", this.modalStatus);
            }).catch((error) => {
                this.error = true;
                this.error_message = error.response.data.message;
            })
        },
        editRepository() {
            let uuid = this.repository.uuid;
            let repo_data = JSON.parse(JSON.stringify(this.repository));
            delete repo_data.uuid;
            
            // Update the access_scope settings so its just a list of UUIDs
            if(repo_data.access_scope) {
                repo_data.access_scope = repo_data.access_scope.map((org) => {
                    return org.value;
                })
            }
            this.$store.dispatch('updateDetectionRepository', {uuid: uuid, data: repo_data}).then(() => {
                this.modalStatus = false;
                this.$emit("update:show", this.modalStatus);
            }).catch((error) => {
                this.error = true;
                this.error_message = error.response.data.message;
            })
        },
        addTag(newTag) {
            this.repository.tags.push(newTag);
            this.tag_list.push(newTag);
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