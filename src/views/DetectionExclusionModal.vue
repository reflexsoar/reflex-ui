<template>
  <div>
    <link
      rel="stylesheet"
      href="https://unpkg.com/vue-multiselect@2.1.0/dist/vue-multiselect.min.css"
    />
    <CModal
      :title="`${mode} Detection Exclusion`"
      :centered="false"
      size="xl"
      :show.sync="modalStatus"
      :closeOnBackdrop="false"
    >
    <h5>Exclusion</h5>
    <p>An exclusion can be added to prevent a detection rule from firing on very specific criteria.</p>
    <CRow>
      <CCol>
        <CTextarea v-model="exclusion.description" label="Description" placeholder="A description of the exclusion and why it is being created"/>
      </CCol>
    </CRow>
    <CRow>
      <CCol>
        <label for="exclusion_values">Field Name</label><br>
        <multiselect id="exclusion_field" v-model="exclusion.field" placeholder="Select a field" :options="index_fields" :internal-search="false" @search-change="getIndexField" :close-on_select="true"/>
        <!--<CInput v-model="exclusion.field" label="Field Name" description="The field to compare values to"/>-->
      </CCol>
      <CCol>
        <CSelect :value.sync="exclusion.condition" :options='["is","one of"]' label="Condition"/>
      </CCol>
    </CRow>
    <CRow>
      <CCol>
        <label for="exclusion_values">Values</label><br>
        <multiselect id="exclusion_values" :multiple="true" @tag="addExclusionValue" v-model="exclusion.values" placeholder="Enter the values to exclude" :taggable="true" :close-on-select="false" :options="exclusion_values"/><br>
      </CCol>
    </CRow>
    <CRow>
      <CCol>
        <label for="intel_list">Intel List</label><br>
        <multiselect id="intel_list" v-model="exclusion.list" :options="formatted_lists" track-by="uuid" label="name" :close-on-select="true"
                  :internal-search="false"
                  :searchable="true"
                  @search-change="getThreatList"
                  @select="setList"/>
        <small class="form-text text-muted w-100">Optional - If selected the values in this list will be excluded along with any manually provided values</small><br>
      </CCol>
    </CRow>
    <template #footer>
        <CButton @click="dismiss()" color="secondary">Dismiss</CButton>
        <CButton
          v-if="mode == 'Create'"
          @click="createExclusion()"
          color="primary"
          :disabled="submitted"
          ><span v-if="submitted"><CSpinner size="sm" />&nbsp;</span
          >Create</CButton
        >
        <CButton
          v-if="mode == 'Edit'"
          @click="editExclusion()"
          color="primary"
          :disabled="submitted"
          ><span v-if="submitted"><CSpinner size="sm" />&nbsp;</span
          >Save</CButton
        >
      </template>
    </CModal>
  </div>
</template>
<style scoped>
.modal-body {
  padding-left: 0px;
}
</style>
<script>
import { mapState } from "vuex";

export default {
  name: "DetectionExclusionModal",
  props: {
    show: Boolean,
    exclusion: Object,
    rule: Object,
    mode: {
      type: String,
      default: "Create",
    },
  },
  computed: {
    formatted_lists () {
      return this.lists.map(list => { return {'name': list.name, 'uuid': list.uuid}})
    }, ...mapState(['lists','index_fields'])
  },
  data () {
    return {
      modalStatus: this.show,
      exclusion_values: [],
      submitted: false
    }
  },
  watch: {
    show: function () {
      this.error = false;
      this.error_message = "";
      if (this.mode == "Edit") {
        this.step = 0;
      }
      this.modalStatus = this.show;
    },
    modalStatus: function () {
      if (this.modalStatus) {
        this.getThreatList()
        this.getIndexField()
        this.test_failed = true;
      }
      this.$emit("update:show", this.modalStatus);
      if (!this.modalStatus) {
        this.reset();
      }
    },
  },
  methods: {
    addExclusionValue(value) {
        this.exclusion_values.push(value)
        this.exclusion.values.push(value);
    },
    createExclusion() {
      if('exceptions' in this.rule) {
        if(this.rule.exceptions === null) {
          this.rule.exceptions = [this.exclusion]
        } else {
          this.rule.exceptions.push(this.exclusion)
        }        
      } else {
        this.rule.exceptions = [this.exclusion]
      }      
      this.modalStatus = false
    },
    editExclusion() {
      if(this.rule.exceptions > 0) {
        this.rule.exceptions = [...this.rule.exceptions.filter(e => e.uuid !== this.exclusion.uuid), this.exclusion]
      } else {
        this.rule.exceptions = [this.exclusion]
      }
      this.modalStatus = false
    },
    getIndexField(search) {
      let organization = this.rule.organization
      let uuid = this.rule.source.uuid
      let params = {
        organization: organization,
        uuid: uuid
      }
      if(search) {
        params['name__like'] = search
      }
      this.$store.dispatch('getInputIndexFields', params)
    },
    getThreatList(search) {
      let organization = this.rule.organization
      let params = {
        organization: organization
      }
      if(search) {
        params['name__like'] = search
      }
      this.$store.dispatch('getLists', params)
    },
    setList(list) {
      this.exclusion.list = list
    },
    reset() {
    },
    dismiss() {
      this.modalStatus = false
    }
  }
}
</script>