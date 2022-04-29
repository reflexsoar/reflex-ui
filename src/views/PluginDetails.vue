<template>
  <CRow>
    <CCol col v-if="loading">
      <div style="margin: auto; text-align:center; verticle-align:middle;">
        <CSpinner color="dark" style="width:6rem;height:6rem;" />
      </div>
    </CCol>
    <CCol col="12" v-if="!loading">
      <CAlert :show.sync="alert" color="success" closeButton>{{alert_message}}</CAlert>
      <span v-if="plugin.manifest.config_template">
        <CButton color="primary" @click="showModal">Add Configuration</CButton>
        <br />
        <br />
      </span>
      <CCard class="shadow-sm bg-white rounded">
        <CCardHeader>
          <CRow>
            <CCol col="12" lg="6" sm="12" class="text-left">
              <CRow>
                <CCol col="12" lg="6" sm="12">
                  <h1>{{plugin.name}}</h1>
                </CCol>
              </CRow>
              <CRow>
                <CCol col="12" lg="6" sm="12">{{plugin.description}}</CCol>
              </CRow>
            </CCol>
            <CCol col="12" lg="6" sm="12" class="text-right">
              <img
                style="max-width:50%; max-height: 200px;"
                :src="`data:image/png;base64,${plugin.logo}`"
              />
            </CCol>
          </CRow>
        </CCardHeader>
        <CCardBody>
          <CRow>
            <CCol col="6">
              <CSwitch color="success" label-on="On" label-off="Off" v-bind:checked="plugin.enabled"/><br>
              <b>Checksum:</b> {{ plugin.file_hash }}
            </CCol>
            <CCol col="6">
              <b>Date Created:</b>
              {{plugin.created_at | moment('LLLL')}}
              <br />
              <b>Last Updated:</b>
              {{plugin.modified_at | moment('from', 'now')}}
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>
    </CCol>
    <CCol>
      <CCard class="shadow-sm bg-white rounded">
        <CCardHeader>
          <b>Supported actions</b>
        </CCardHeader>
        <CListGroup flush>
          <CListGroupItem v-for="action in plugin.manifest.actions" :key="action.name">
            <b>{{action.name}}</b>
            <br />
            {{action.description}}
          </CListGroupItem>
        </CListGroup>
      </CCard>
    </CCol>
    <CCol v-if="plugin.configs && plugin.configs.length > 0">
      <CCard class="shadow-sm bg-white rounded">
        <CCardHeader>
          <b>Configs</b>
        </CCardHeader>
        <CListGroup flush>
          <CListGroupItem
            v-for="config in plugin.configs"
            :key="config.name"
            class="flex-column align-items-start"
          >
            <div class="d-flex w-100 justify-content-between">
              <h5 class="mb-1">{{config.name}}</h5>
              <small>Created {{config.created_at | moment('from', 'now')}}</small>
            </div>
            <p class="mb-1">{{config.description}}</p>
            <small>{{config.config}}</small>
          </CListGroupItem>
        </CListGroup>
      </CCard>
    </CCol>
    <CModal title="New Config" color="dark" :centered="true" size="lg" :show.sync="configModal">
      <div>
        <CForm>
          <CInput
            placeholder="Configuration Name"
            required
            v-model="name"
            label="Configuration Name"
          ></CInput>
          <CTextarea
            placeholder="Enter a description for the configuration.  The more detail the better."
            required
            v-model="description"
            label="Description"
            rows="3"
          ></CTextarea>
          <div v-if="plugin.manifest.config_template">
            <h4>Plugin Options</h4>
            <CInput
              required
              v-for="field in configFields"
              :key="field.name"
              v-model="configValues[field.name]"
              :label="field.name | firstLetter"
              :placeholder="field.placeholder"
            ></CInput>
          </div>
        </CForm>
      </div>
      <template #footer>
        <CButton @click="createConfig()" color="primary">Create</CButton>
      </template>
    </CModal>
  </CRow>
</template>

<script>
import { mapState } from "vuex";
import { template } from "@babel/core";
export default {
  name: "PluginDetails",
  data() {
    return {
      uuid: this.$route.params.uuid,
      plugin: {},
      name: "",
      description: "",
      loading: true,
      cardCollapse: true,
      collapse: {},
      toggleCollapse: true,
      configModal: false,
      configFields: [],
      configValues: {},
      alert: 0,
      alert_message: "",
    };
  },
  created() {
    this.$store.dispatch("getPlugin", this.$route.params.uuid).then((resp) => {
      this.plugin = resp.data;
      this.loading = false;
    });
  },
  methods: {
    showModal() {
      this.reset();
      this.configModal = true;
      for (let field in this.plugin.manifest.config_template) {
        this.configValues[field] = null;
        this.configFields.push({
          name: field,
          placeholder: this.plugin.manifest.config_template[field],
        });
      }
    },
    reset() {
      this.configValues = {};
      this.configFields = [];
      this.name = "";
      this.description = "";
    },
    createConfig() {
      let config = this.configValues;
      let name = this.name;
      let description = this.description;
      let uuid = this.uuid;
      this.$store.dispatch("createPluginConfig", {
        name,
        description,
        config,
        plugin_uuid: uuid,
      });
      this.plugin.configs.push({
        name: name,
        description: description,
        config: config,
      });
      this.alert_message = "Successfully created plugin configuration";
      this.alert = 10;
      this.configModal = false;
    },
    expandAll() {
      for (const c in this.collapse) {
        if (!this.collapse[c]) {
          this.collapse[c] = true;
        }
      }

      this.toggleCollapse = false;
    },
    collapseAll() {
      for (const c in this.collapse) {
        if (this.collapse[c]) {
          this.collapse[c] = false;
        }
      }
      this.toggleCollapse = true;
    },
  },
  filters: {
    firstLetter: function (value) {
      if (!value) return "";
      value = value.charAt(0).toUpperCase() + value.slice(1);
      return value;
    },
    capitalize: function (value) {
      if (!value) return "";
      value = value.toString();
      return value.toUpperCase();
    },
    truncate: function (value) {
      let maxLength = 250;
      if (!value) return "";
      value = value.toString();
      if (value.length > maxLength) {
        return value.substring(0, maxLength) + "...";
      } else {
        return value.substring(0, maxLength);
      }
    },
  },
};
</script>
