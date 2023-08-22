<template>
  <div>
    <CRow class="page-sub-header">
      <CCol><h2>Authentication Settings</h2></CCol>
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
                            <CDropdownItem @click="viewURLs(item.uuid)"
                              >View SP URLs</CDropdownItem
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
                    <CButton @click="show_mapping_modal = true" color="primary"
                      >Create Role Mapping</CButton
                    >
                  </CCol>
                </CRow>
                <CRow>
                  <CCol>
                    <CDataTable
                      :items="role_mappings"
                      :fields="role_mapping_fields"
                      :responsive="false"
                      :loading="loading"
                      :noItemsView="{
                        noResults: 'No Role Mappings Found',
                        noItems: 'No Role Mappings',
                      }"
                    ></CDataTable>
                  </CCol>
                </CRow>
              </CTab>
            </CTabs>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
    <SSOProviderModal :show.sync="show_provider_modal" :mode="provider_modal_mode" />
    <RoleMapModal :show.sync="show_mapping_modal" :mode="mapping_modal_mode" />
    <SPUrlsModal :show.sync="show_sp_urls" :provider_uuid="provider_uuid" />
  </div>
</template>

<script>
import SSOProviderModal from "./SSOProviderModal";
import RoleMapModal from "./RoleMapModal";
import SPUrlsModal from "./SPUrlsModal";

import { mapState } from "vuex";

export default {
  name: "AuthenticationSettings",
  components: {
    SSOProviderModal,
    RoleMapModal,
    SPUrlsModal
  },
  computed: {
    ...mapState(["sso_providers", "role_mappings", "loading"]),
  },
  created() {
    this.$store.dispatch("getSSOProviders");
    //this.$store.dispatch("getRoleMappings");
  },
  data() {
    return {
      show_provider_modal: false,
      show_mapping_modal: false,
      provider_modal_mode: "create",
      mapping_modal_mode: "create",
      active_tab: 0,
      sso_provider_fields: [
        "name",
        "created_at",
        "updated_at",
        "updated_by",
        { key: "manage", label: "", _classes: "text-right" },
      ],
      role_mapping_fields: ["name", { key: "manage", label: "", _classes: "text-right" }],
      provider_uuid: "",
      show_sp_urls: false,
    };
  },
  methods: {
    viewURLs(provider_uuid) {
      this.provider_uuid = provider_uuid;
      this.show_sp_urls = true;
    },
    editProvider(provider) {
      this.provider_modal_mode = "edit";
      //this.$store.dispatch("getSSOProvider", provider.uuid);
      this.show_provider_modal = true;
    },
    activateProvider(provider) {
      this.$store.dispatch("activateSSOProvider", provider);
    },
    deactivateProvider(provider) {
      this.$store.dispatch("deactivateSSOProvider", provider);
    },
    editMapping(mapping) {
      this.mapping_modal_mode = "edit";
      //this.$store.dispatch("getRoleMapping", mapping.uuid);
      this.show_mapping_modal = true;
    },
  },
};
</script>
