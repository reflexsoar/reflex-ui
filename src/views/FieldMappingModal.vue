<template>
  <div>
    <link
      rel="stylesheet"
      href="https://unpkg.com/vue-multiselect@2.1.0/dist/vue-multiselect.min.css"
    />
    <CModal
      :title="`${mode} Field Template`"
      :centered="false"
      :show.sync="modal_status"
      size="xl"
      :closeOnBackdrop="false"
    ><template #header>
        <h5 style="text-transform: capitalize">{{ mode }} Field Template</h5>
        <span class="text-right">
          <button type="button" aria-label="Close" class="close" @click="dismiss()">
            ×
          </button>
          <button
            type="button"
            class="kb"
            aria-label="Documentation"
            onclick="window.open('https://docs.reflexsoar.com/en/latest/field-templates')"
          >
            <CIcon name="cil-book" size="lg" />
          </button>
        </span>
      </template>
      <div>
        <CForm @submit.prevent="submitForm" id="field_mapping_template_form">
          <CTabs
            :fade="false"
            variant="pills"
            :activeTab.sync="active_tab"
            :vertical="{ navs: 'col-md-2', content: 'col-md-10' }"
          >
            <CTab title="Overview">
              <CRow>
                <CCol>
                  <h5>Field Templates</h5>
                  <p>
                    Field templates define the fields that will be used to map a value to
                    an Observable when consuming data from an Input or creating an Event
                    from a Detection Rule. For example, a field template can be created to
                    map a source field to an IP address, a domain, and a file hash.
                  </p>
                </CCol>
              </CRow>
              <CRow>
                <CCol>
                  <CSelect
                    label="Organization"
                    placeholder="Select an organization"
                    v-if="current_user.role.permissions.view_organizations"
                    :value.sync="template.organization"
                    :options="
                      organizations.map((o) => {
                        return { label: o.name, value: o.uuid };
                      })
                    "
                  />
                  <CInput
                    v-model="template.name"
                    label="Template Name"
                    placeholder="Name"
                    required
                  />
                  <CTextarea
                    v-model="template.description"
                    label="Description"
                    placeholder="Description"
                    rows="5"
                  />
                  <label>Tags</label><br />
                  <multiselect
                    v-model="template.tags"
                    :options="tags"
                    @tag="addTag(template, $event)"
                    :multiple="true"
                    :taggable="true"
                    :close-on-select="false"
                    :show-labels="false"
                    placeholder="Tags"
                  /><br />
                  <CRow>
                    <CCol>
                      <CInput
                        v-model.number="template.priority"
                        label="Priority"
                        placeholder="Priority"
                        description="Determines what template takes precedence when multiple templates are used. High priority wins."
                      />
                    </CCol>
                    <CCol
                      ><label
                        >Global Template<br /><small class="text-muted"
                          >Global templates are available to all organizations.</small
                        ></label
                      ><br />
                      <CSwitch
                        :checked.sync="template.is_global"
                        label="Global"
                        labelOn="Yes"
                        labelOff="No"
                        color="success"
                      />
                    </CCol>
                  </CRow>
                </CCol>
              </CRow>
            </CTab>
            <CTab title="Field Settings">
              <CRow>
                <CCol>
                  <h5>Field Settings</h5>
                  <p>
                    Field settings are used to define the field name, data type, and other
                    settings for each field in the template. Fields defined here will be
                    used to map a source fields value to an Observable. The Sigma Field is
                    used to translate the default field after Sigma rule conversion to the
                    field name in a source input. For example, Sigma may default to using
                    <code>winlog.event_data.CommandLine</code> as the field name, but the
                    source input may use <code>process.args</code>.
                  </p>
                  <CAlert color="info" show>
                    <strong>Note:</strong>
                    <p>
                      The Sigma Field is only used when converting a Sigma rule to a
                      Detection Rule. Also setting a data type of <code>none</code> will
                      prevent the fields value from becoming an observable.
                    </p>
                  </CAlert>
                </CCol>
              </CRow>
              <CRow>
                <CCol>
                  <h5>Fields</h5>
                </CCol>
                <CCol class="text-right">
                  <CButton @click="addField()" color="success">Add Field</CButton>
                </CCol>
              </CRow>
              <CRow style="max-height: 450px; overflow: auto; padding-top: 10px">
                <CCol>
                  <CDataTable
                    :items="template.field_mapping"
                    :fields="[
                      { key: 'field', label: 'Source Field' },
                      'data_type',
                      'alias',
                      'sigma_field',
                      'tags',
                      { key: 'tlp', label: 'TLP' },
                      { key: 'admin', label: '' },
                    ]"
                    size="sm"
                    small
                  >
                    <template #field="{ item }">
                      <td>
                        <CInput
                          size="sm"
                          v-model="item.field"
                          placeholder="Source Field Name"
                        />
                      </td>
                    </template>
                    <template #sigma_field="{ item }">
                      <td>
                        <CInput
                          size="sm"
                          v-model="item.sigma_field"
                          placeholder="Sigma Field Name"
                        />
                      </td>
                    </template>
                    <template #data_type="{ item }">
                      <td>
                        <CSelect
                          size="sm"
                          :value.sync="item.data_type"
                          :options="valid_data_types"
                        />
                      </td>
                    </template>
                    <template #alias="{ item }">
                      <td>
                        <CInput size="sm" v-model="item.alias" placeholder="Alias" />
                      </td>
                    </template>
                    <template #tags="{ item }">
                      <td>
                        <multiselect
                          size="sm"
                          v-model="item.tags"
                          :options="tags"
                          @tag="addTag(item, $event)"
                          :multiple="true"
                          :taggable="true"
                          :close-on-select="false"
                          :show-labels="false"
                          placeholder="Tags"
                        /><br />
                      </td>
                    </template>
                    <template #tlp="{ item }">
                      <td>
                        <CSelect
                          :options="[1, 2, 3, 4]"
                          :value.sync="item.tlp"
                          size="sm"
                        />
                      </td>
                    </template>
                    <template #admin="{ item }">
                      <td>
                        <CButton
                          aria-label="Delete Field"
                          @click="deleteField(template.field_mapping.indexOf(item))"
                          size="sm"
                          color="danger"
                          ><CIcon name="cilTrash"
                        /></CButton>
                      </td>
                    </template> </CDataTable
                ></CCol>
              </CRow>
            </CTab>
            <CTab title="Review">
              {{ template }}
            </CTab>
          </CTabs>
        </CForm>
      </div>
      <template #footer>
        <CButton @click="dismiss()" color="secondary">Cancel</CButton>
        <CButton type="submit" color="primary" form="field_mapping_template_form"
          >{{ mode }} Template</CButton
        >
      </template>
    </CModal>
  </div>
</template>

<style scope>
@import "https://unpkg.com/vue-multiselect@2.1.0/dist/vue-multiselect.min.css";
</style>

<script>
import { vSelect } from "vue-select";
import { mapState } from "vuex";
export default {
  name: "FieldMappingModal",
  props: {
    show: Boolean,
    template: {
      type: Object,
      default: () => {
        return {
          tags: [],
        };
      },
    },
    mode: {
      type: String,
      default: "Create",
    },
  },
  data() {
    return {
      modal_status: this.show,
      modal_action: this.mode == "Create" ? this.createTemplate : this.updateTemplate,
      selected_list: "",
      lists: [],
      lists_formatted: [],
      active_tab: 0,
      tags: [],
    };
  },
  computed: {
    ...mapState(["valid_data_types", "current_user", "organizations"]),
    organization_options() {
      if (this.organizations == null) return [];
      return this.organizations.map((o) => {
        return { label: o.name, value: o.uuid };
      });
    },
  },
  watch: {
    show: function () {
      this.modal_status = this.show;
    },
    modal_status: function () {
      this.$emit("update:show", this.modal_status);
      if (!this.modal_status) {
        this.reset();
      } else {
        if (this.template == null) {
          this.$set(this, "template", {});
        } else {
          if (this.template.tags != null) {
            this.tags = this.template.tags;
          }
          if (this.template.priority == null) {
            this.$set(this.template, "priority", 1);
          }
        }
      }
    },
  },
  created() {},
  methods: {
    addTag(item, t) {
      if (item.tags == null) {
        this.$set(item, "tags", []);
      }
      item.tags.push(t);
      this.tags.push(t);
    },
    submitForm() {
      if (this.mode == "Create") {
        this.createTemplate();
      } else {
        this.updateTemplate();
      }
    },
    createTemplate() {
      this.$store
        .dispatch("createFieldTemplate", this.template)
        .then(() => {
          this.dismiss();
        })
        .catch((err) => {
          console.log(err);
        });
    },
    updateTemplate() {
      delete this.template.created_by;
      delete this.template.created_at;
      delete this.template.updated_at;
      delete this.template.updated_by;
      let uuid = this.template.uuid;
      delete this.template.uuid;
      this.$store
        .dispatch("updateFieldTemplate", { uuid: uuid, template: this.template })
        .then(() => {
          this.dismiss();
        })
        .catch((err) => {
          console.log(err);
        });
    },
    addField() {
      if (this.template.field_mapping == null) {
        this.$set(this.template, "field_mapping", []);
      }
      if (this.template.field_mapping && this.template.field_mapping.length > 0) {
        this.template.field_mapping.splice(0, 0, {
          field: "",
          data_type: "none",
          alias: "",
          sigma_field: "",
          tags: [],
          tlp: 1,
        });
      } else {
        this.template.field_mapping.splice(0, 0, {
          field: "",
          data_type: "none",
          alias: "",
          sigma_field: "",
          tags: [],
          tlp: 1,
        });
      }
    },
    deleteField(id) {
      this.template.field_mapping.splice(id, 1);
    },
    reset() {
      this.selected_list = "";
      this.active_tab = 0;
    },
    dismiss() {
      this.reset();
      this.modal_status = false;
    },
  },
};
</script>
