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
                    v-if="current_user.permissions.view_organizations"
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
                        description="Determines what template takes precedence when multiple templates are used. The lower the priority the higher the precedence. Example 1 overrides 100."
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
                    used to map a source fields value to an Event Signature, Event Tag or an Observable.  Signature fields will be
                    applied in alphanumeric order to create a signature hash for the event using a method like
                    <code>signature = sha1(event.title + fielda + fieldb + fieldc)</code>.
                    <h6>Field Attributes</h6>
                    <li><b>Signature Field</b> - If enabled, the field will be used as part of the signature hash for the event.</li>
                    <li><b>Tag Field</b> - If enabled, the field will be used to create a tag from the fields value on an event.</li>
                    <li><b>Observable Field</b> - If enabled (default: true), the field will be used to create an observable for the event.</li>
                  </p>
                  <hr>
                  <!--<CAlert color="info" show>
                    <strong>Note:</strong>
                    <p>
                      The Sigma Field is only used when converting a Sigma rule to a
                      Detection Rule. Also setting a data type of <code>none</code> will
                      prevent the fields value from becoming an observable.
                    </p>
                  </CAlert>-->
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
                <table class="table table-sm table-middle">
                  <tr>
                    <th>Source Field</th>
                    <th>Data Type</th>
                    <th>Alias</th>
                    <th>Signature</th>
                    <th>Tag</th>
                    <th>Observable</th>
                    <th></th>
                  </tr>
                  <tbody>
                    <tr v-for="f, i in template.field_mapping" :key="i">
                      <td>
                        <CInput size="sm" v-model="f.field" placeholder="Source field name"/>
                      </td>
                      <td>
                        <CSelect size="sm" :value.sync="f.data_type" :options="valid_data_types"/>
                      </td>
                      <td>
                        <CInput size="sm" v-model="f.alias" placeholder="Alias"/>
                      </td>
                      <td class="checkbox-field">
                        <input type="checkbox" v-model="f.signature_field"/>
                      </td>
                      <td class="checkbox-field">
                        <input type="checkbox" v-model="f.tag_field"/>
                      </td>
                      <td class="checkbox-field">
                        <input type="checkbox" v-model="f.observable_field"/>
                      </td>
                      <td>
                        <CButton
                          aria-label="Delete Field"
                          @click="deleteField(f)"
                          size="sm"
                          color="danger"
                          ><CIcon name="cilTrash"
                        /></CButton>
                      </td>
                    </tr>
                  </tbody>  
                </table>
                </CCol>
              </CRow>
              <CRow>
                <CCol>
                  <span class="small text-muted">*Signature, Tag and Observable field settings will be supported in a future release.</span>
                </CCol>
              </CRow>
            </CTab>
            <!--<CTab title="Signature Field Ordering">
              <h5>Signature Field Ordering</h5>
              <p>Drag and drop the fields to set the order in which they will be used to create a signature.  Changing the order of these fields will result in a different signature being generated for any events or detections using this template.</p>
              <draggable v-model="template.signature_fields" v-bind="dragOptions" >
              <div v-for="(f, i) in template.signature_fields" class="signature-field" :key="i">
                  <div class="drag-handle">
                    <i class="fas fa-grip-lines"></i>
                  </div>
                  <div class="field-name">
                    {{ f }}
                  </div>
                </div>
                
              </draggable><br>

              <h6>Hash Calculation Preview</h6>
              <span v-if="template.signature_fields === undefined || template.signature_fields.length == 0">No fields have been selected to be used in the signature.</span>
              <span v-else>
              <p>Below is how the hash will be calculated based on the order of the fields above.</p>
              
              <p><code>signature = sha1(event_title + {{ template.signature_fields.join(" + ") }})</code></p>
              </span>
            </CTab>-->
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



.signature-field {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 5px;
  padding-top: 10px;
  padding-bottom: 10px;
  border: 1px solid #cfcfcf;
  border-radius: 5px;
  margin-bottom: 5px;
  cursor: move;
}

.signature-field .drag-handle {
  width: 5%;
  /* Center the icon in the div */
  display: flex;
  align-items: center;
  justify-content: center;
}

.signature-field .field-name {
  width: 95%;
  display: flex;  
}

.ghost {
  opacity: 0.5;
  background-color: #cfcfcf;
}

</style>

<script>
import { vSelect } from "vue-select";
import { mapState } from "vuex";

import draggable from "vuedraggable";

export default {
  name: "FieldMappingModal",
  props: {
    show: Boolean,
    template: {
      type: Object,
      default: () => {
        return {
          tags: [],
          field_mapping: [],
        };
      },
    },
    mode: {
      type: String,
      default: "Create",
    },
  },
  components: {
    draggable
  },
  data() {
    return {
      modal_status: this.show,
      modal_action: this.mode == "Create" ? this.createTemplate : this.updateTemplate,
      selected_list: "",
      lists: [],
      lists_formatted: [],
      field_mapping: [],
      active_tab: 0,
      tags: [],
      field_columns: [
        { key: 'field', label: 'Source Field' },
        'data_type',
        'alias',
        { key: 'signature_field', label: "Signature"},
        { key: 'tag_field', label: "Tags"},
        { key: 'observable_field', label: "Observable"},
        { key: 'admin', label: '' },
      ],
      dragOptions: {
        animation: 0,
        group: "signature_fields",
        disabled: false,
        ghostClass: "ghost"
      }
    };
  },
  computed: {
    ...mapState(["valid_data_types", "current_user", "organizations"]),
    organization_options() {
      if (this.organizations == null) return [];
      return this.organizations.map((o) => {
        return { label: o.name, value: o.uuid };
      });
    }
    
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
          this.$set(this, "template", {
            field_mapping: [],
            tags: []
          });
        } else {
          if (this.template.tags != null) {
            this.tags = this.template.tags;
          }
          if (this.template.priority == null) {
            this.$set(this.template, "priority", 1);
          }
        }

        this.field_mapping = this.template.field_mapping;
      }
    },
  },
  created() {},
  methods: {
    updateField(field) {
      console.log(field);
    },
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

      if (this.template.is_global === null) {
        this.template.is_global = false;
      }

      // Ensure that all the fields don't have a null value for tags
      this.template.field_mapping.forEach((f) => {
        if (f.tags == null) {
          this.$set(f, "tags", []);
        }
      });

      // Fix for editing templates without tags
      if (this.template.tags == null) {
        this.$set(this.template, "tags", []);
      }
      
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
          signature_field: false,
          tag_field: false,
          observable_field: true,
          tags: [],
          tlp: 1,
        });
      } else {
        this.template.field_mapping.splice(0, 0, {
          field: "",
          data_type: "none",
          alias: "",
          sigma_field: "",
          signature_field: false,
          tag_field: false,
          observable_field: true,
          tags: [],
          tlp: 1,
        });
      }
    },
    deleteField(item) {
      let id = this.template.field_mapping.indexOf(item);
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
