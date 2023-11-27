<template>
  <div>
    <CRow>
      <CCol>
        <h3 class="page-sub-header">Agent Tags</h3>
      </CCol>
      <CCol class="text-right">
        <CButton @click="createTag()" v-if="current_user.permissions['create_agent_tag']" color="primary">Create Tag</CButton>
      </CCol>
    </CRow>
    <CRow>
      <CCol>
        <CCard>
          <CCardBody>
            <CDataTable
              :items="agent_tags"
              :fields="fields"
              pagination
              :items-per-page="25"
              :loading="loading"
            >
              <template #namespace="{ item }">
                <td>
                    <AgentTag :namespace="item.namespace" :value="item.value" :color="item.color" />
                </td>
              </template>
              <template #query="{ item }">
                <td>
                  <pre class="query">{{ item.query }}</pre>
                </td>
              </template>
              <template #actions="{ item }">
                <td class="text-right">
                  <CDropdown toggler-text="Actions" color="secondary" size="sm">
                    <CDropdownItem @click="editTag(item.uuid)">Edit</CDropdownItem>
                    <CDropdownItem @click="deletePrompt(item.uuid)">Delete</CDropdownItem>
                  </CDropdown>
                </td>
              </template>
            </CDataTable>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
    <AgentTagWizard :show.sync="show_tag_wizard" :tag="tag" :mode="wizard_mode" />
    <CModal
      :show.sync="show_delete_confirm"
      size="md"
      title="Confirm Delete"
      color="danger"
      :close-on-backdrop="false"
      :close-on-esc="false"
      :centered="true"
      v-if="target_tag"
    >
        <b>Warning!</b>
        <p>Are you sure you want to delete the tag <AgentTag :namespace="target_tag.namespace" :value="target_tag.value" :color="target_tag.color" />?</p>
        <p>If this tag is used in any other tags or is used to assign policies to agents, those tags and policies may not work as expected.</p>

        <template #footer>
            <CRow>
                <CCol class="text-right">
                <CButton color="secondary" @click="cancelDelete()">Cancel</CButton>&nbsp;
                <CButton color="danger" @click="deleteTag(target_tag.uuid)">Delete</CButton>
                </CCol>
            </CRow>
        </template>
    </CModal>
  </div>
</template>

<style>
.query {
  background: #0e0e0e;
  color: #ccc !important;
  border: 1px solid rgb(216, 219, 224);
  border-radius: 0.25rem;
  box-shadow: inset 0 1px 1px rgb(0 0 21 / 8%);

  max-height: 400px;
  overflow-y: auto;

  /* you must provide font-family font-size line-height. Example: */
  font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
  font-size: 12px;
  line-height: 1.5;
  padding: 8px;
  
}
</style>

<script>
import { mapState } from "vuex";

import AgentTagWizard from './AgentTagWizard.vue';
import AgentTag from "./AgentTag.vue";

export default {
  name: "AgentTags",
  computed: mapState(["current_user", "agent_tags"]),
  components: {
    AgentTagWizard,
    AgentTag
  },
  data() {
    return {
      loading: false,
      fields: [{ key: "namespace", label: "Tag"}, "description", "query", { key: "actions", label: "" }],
      show_tag_wizard: false,
      show_delete_confirm: false,
      target_tag: null,
      wizard_mode: "create",
      tag: { 
        namespace: null,
        value: null,
        dynamic: true,
        description: null,
        query: null,
        color: "#" + Math.floor(Math.random() * 16777215).toString(16),
      }
    };
  },
  methods: {
    createTag() {
        this.tag = { 
        namespace: null,
        value: null,
        dynamic: true,
        description: null,
        query: null,
        color: "#" + Math.floor(Math.random() * 16777215).toString(16),
      };
        this.wizard_mode = "create";
        this.show_tag_wizard = true;
    },
    editTag(uuid) {
        this.tag = this.agent_tags.find((tag) => tag.uuid === uuid);
        this.wizard_mode = "edit";
        this.show_tag_wizard = true;
    },
    deletePrompt(uuid) {
        this.target_tag = this.agent_tags.find((tag) => tag.uuid === uuid);
        this.show_delete_confirm = true;
    },
    deleteTag() {
        this.$store.dispatch("deleteAgentTag", { uuid: this.target_tag.uuid }).then(() => {
            this.show_delete_confirm = false;
            this.target_tag = null;
        });
    },
    cancelDelete() {
        this.show_delete_confirm = false;
        this.target_tag = null;
    }
  },
  created() {
    this.loading = true;
    this.$store.dispatch("getAgentTags", {}).then(() => {
      this.loading = false;
    });
  },
};
</script>
