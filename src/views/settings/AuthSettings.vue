<template>
  <div>
    <CRow class="page-sub-header">
      <CCol>
        <h2>Authentication Settings</h2>
        <CAlert :show.sync="alert.show" :color="alert.color" :fade="false" closeButton>
        {{ alert.message }}
      </CAlert>
    </CCol>      
    </CRow>
    <CRow>
      <CCol>
        <CCard>
          <CCardBody>
            <CTabs
              :fade="false"
              variant="pills"
              :activeTab.sync="active_tab"
              :vertical="{ navs: 'col-md-2', content: 'col-md-10' }"
            >
              <CTab title="SSO Realms">
                <CRow>
                  <CCol><h5>Single Sign-On Providers</h5></CCol>
                  <CCol class="text-right">
                    <CButton @click="show_provider_modal = true" color="primary"
                      >Create New Provider</CButton
                    >
                  </CCol>
                </CRow>
                <CRow>
                  <CCol>
                    <CDataTable
                      :items="sso_providers"
                      :fields="sso_provider_fields"
                      :responsive="false"
                      :loading="loading"
                      :noItemsView="{
                        noResults: 'No SSO Providers Found',
                        noItems: 'No SSO Providers',
                      }"
                    >
                      <template #name="{ item }">
                        <td>
                          <CBadge class="tag tag-sm" color="success" v-if="item.active"
                            >Active</CBadge
                          ><CBadge class="tag tag-sm" color="danger" v-else
                            >Inactive</CBadge
                          >&nbsp;<b>{{ item.name }}</b>
                        </td>
                      </template>
                      <template #updated_by="{ item }">
                        <td>
                          {{ item.created_by.username }}
                        </td>
                      </template>
                      <template #updated_at="{ item }">
                        <td>
                          {{ item.updated_at | moment("from", "now") }}
                        </td>
                      </template>

                      <template #created_at="{ item }">
                        <td>
                          {{ item.created_at | moment("from", "now") }}
                        </td>
                      </template>
                      <template #manage="{ item }">
                        <td class="text-right">
                          <CDropdown color="secondary" toggler-text="Manage" size="sm">
                            <CDropdownItem
                              v-if="!item.active"
                              @click="activateProvider(item.uuid)"
                              >Activate</CDropdownItem
                            >
                            <CDropdownItem v-else @click="deactivateProvider(item.uuid)"
                              >Deactivate</CDropdownItem
                            >
                            <CDropdownItem @click="downloadManifest(item.uuid)"
                              >Download Manifest</CDropdownItem
                            >
                            <CDropdownItem @click="editProvider(item.uuid)"
                              >Edit</CDropdownItem
                            >
                            <CDropdownItem @click="deleteProvider(item.uuid)"
                              >Delete</CDropdownItem
                            >
                          </CDropdown>
                        </td>
                      </template>
                    </CDataTable>
                  </CCol>
                </CRow>
              </CTab>
              <CTab title="Role Mappings">
                <CRow>
                  <CCol><h5>Role Mappings</h5></CCol>
                  <CCol class="text-right">
                    <CButton @click="createRoleMapping()" color="primary"
                      >Create Role Mapping</CButton
                    >
                  </CCol>
                </CRow>
                <CRow>
                  <CCol>
                    <CDataTable
                      :items="sso_role_mappings"
                      :fields="role_mapping_fields"
                      :responsive="false"
                      :loading="loading"
                      :noItemsView="{
                        noResults: 'No Role Mappings Found',
                        noItems: 'No Role Mappings',
                      }"
                    >
                      <template #name="{ item }">
                        <td>
                          <CBadge class="tag" color="success" v-if="item.active"
                            >Active</CBadge
                          ><CBadge class="tag" color="danger" v-else
                            >Inactive</CBadge
                          >&nbsp;<b>{{ item.name }}</b>
                        </td>
                      </template>
                      <template #updated_by="{ item }">
                        <td>
                          {{ item.created_by.username }}
                        </td>
                      </template>
                      <template #updated_at="{ item }">
                        <td>
                          {{ item.updated_at | moment("from", "now") }}
                        </td>
                      </template>

                      <template #created_at="{ item }">
                        <td>
                          {{ item.created_at | moment("from", "now") }}
                        </td>
                      </template>
                      <template #manage="{ item }">
                        <td class="text-right">
                          <CDropdown color="secondary" toggler-text="Manage" size="sm">
                            <CDropdownItem
                              v-if="!item.active"
                              @click="activateMappingPolicy(item.uuid)"
                              >Activate</CDropdownItem
                            >
                            <CDropdownItem
                              v-else
                              @click="deactivateMappingPolicy(item.uuid)"
                              >Deactivate</CDropdownItem
                            >
                            <CDropdownItem @click="editMappingPolicy(item.uuid)"
                              >Edit</CDropdownItem
                            >
                            <CDropdownItem @click="startDeleteMappingPolicy(item.uuid)"
                              >Delete</CDropdownItem
                            >
                          </CDropdown>
                        </td>
                      </template>
                    </CDataTable>
                  </CCol>
                </CRow>
              </CTab>
            </CTabs>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
    <SSOProviderModal :show.sync="show_provider_modal" :mode="provider_modal_mode" :provider="sso_provider" />
    <RoleMapModal
      :show.sync="show_mapping_modal"
      :mode="mapping_modal_mode"
      :role_mapping="role_mapping"
    />
    <CModal
      :show.sync="warn_mapping_delete"
      color="danger"
      :centered="true"
      title="Delete Confirmation"
    >
      <p>Are you sure you want to delete this role mapping?</p>
      <template #footer>
        <CRow>
          <CCol class="text-right">
            <CButton color="secondary" @click="warn_mapping_delete = false"
              >Cancel</CButton
            >&nbsp;
            <CButton
              color="danger"
              @click="deleteMappingPolicy()"
              v-bind:disabled="submitted"
              ><CSpinner v-if="submitted" size="sm" />&nbsp;Delete</CButton
            >
          </CCol>
        </CRow>
      </template>
    </CModal>
  </div>
</template>

<script>
import SSOProviderModal from "./SSOProviderModal";
import RoleMapModal from "./RoleMapModal";

import { mapState } from "vuex";

export default {
  name: "AuthenticationSettings",
  components: {
    SSOProviderModal,
    RoleMapModal,
  },
  computed: {
    ...mapState(["sso_providers", "sso_role_mappings", "loading"]),
  },
  created() {
    this.$store.dispatch("getSSOProviders");
    this.$store.dispatch("getRoleMappingPolicies");
  },
  data() {
    return {
      show_provider_modal: false,
      show_mapping_modal: false,
      provider_modal_mode: "create",
      mapping_modal_mode: "create",
      warn_mapping_delete: false,
      active_tab: 0,
      sso_provider_fields: [
        "name",
        "created_at",
        "updated_at",
        "updated_by",
        { key: "manage", label: "", _classes: "text-right" },
      ],
      role_mapping_fields: [
        "name",
        "created_at",
        "updated_at",
        "updated_by",
        { key: "manage", label: "", _classes: "text-right" },
      ],
      provider_uuid: "",
      mapping_uuid: "",
      role_mapping: {},
      sso_provider: {},
      submitted: false,
      alert: {
        show: false,
        color: "success",
        message: "",
      },
    };
  },
  methods: {
    createRoleMapping() {
      this.role_mapping = {
        name: "",
        role_mappings: [],
      };
      this.mapping_modal_mode = "create";
      this.show_mapping_modal = true;
    },
    editProvider(provider) {
      this.provider_modal_mode = "edit";
      this.sso_provider = this.sso_providers.find((item) => {
        return item.uuid === provider;
      });
      this.show_provider_modal = true;
    },
    activateProvider(provider) {
      this.$store.dispatch("activateSSOProvider", provider);
    },
    deactivateProvider(provider) {
      this.$store.dispatch("deactivateSSOProvider", provider);
    },
    activateMappingPolicy(mapping) {
      this.$store.dispatch("activateRoleMappingPolicy", mapping);
    },
    deactivateMappingPolicy(mapping) {
      this.$store.dispatch("deactivateRoleMappingPolicy", mapping);
    },
    startDeleteMappingPolicy(mapping) {
      this.warn_mapping_delete = true;
      this.mapping_uuid = mapping;
    },
    deleteMappingPolicy() {
      this.submitted = true;
      this.$store
        .dispatch("deleteRoleMappingPolicy", { uuid: this.mapping_uuid })
        .then(() => {
          this.warn_mapping_delete = false;
          this.mapping_uuid = "";
          this.submitted = false;
        })
        .catch((err) => {
          this.submitted = false;
          this.warn_mapping_delete = false;
          this.mapping_uuid = "";
          this.alert.message = err.response.data.message;
          this.alert.color = "danger";
          this.alert.show = true;
        });
    },
    editMappingPolicy(mapping) {
      this.mapping_modal_mode = "edit";
      //this.$store.dispatch("getRoleMappingPolicy", mapping.uuid);
      this.role_mapping = this.sso_role_mappings.find((item) => {
        return item.uuid === mapping;
      });
      this.show_mapping_modal = true;
    },
  },
};
</script>
