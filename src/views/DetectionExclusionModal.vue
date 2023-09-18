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
    <CAlert :show="performance_warning" color="warning">
      <strong>Warning:</strong> This exclusion contains a wildcard at the beginning of the value.  This will result in a very expensive query and may cause performance issues.
    </CAlert>
    <CRow>
      <CCol>
        <CTextarea v-model="exclusion.description" label="Description" placeholder="A description of the exclusion and why it is being created"/>
      </CCol>
    </CRow>
    <CRow>
      <CCol>
        <div v-if="isSearchable">
          <label for="exclusion_values">Field Name</label><br>
          <multiselect id="exclusion_field" v-model="exclusion.field" tag-placeholder="Select field" :taggable="true" @tag="setField" placeholder="Select a field" :options="index_fields" :internal-search="false" :searchable="isSearchable" @search-change="getIndexField" :close-on_select="true"/>
        </div>
        <div v-else>
          <CInput v-model="exclusion.field" label="Field Name" description="The field to compare values to"/>
        </div>
      </CCol>
      <CCol>
        <CSelect :value.sync="exclusion.condition" :options='["is","one of","wildcard","regexp","exists"]' @change="checkValues" label="Condition"/>
      </CCol>
    </CRow>
    <CRow>
      <CCol>
        <label for="exclusion_values">Values</label><br>
        <multiselect v-bind:disabled="exclusion.condition == 'exists'" id="exclusion_values" :multiple="allow_multiple" @tag="addExclusionValue"  v-model="exclusion.values" placeholder="Enter the values to exclude" :taggable="true" :close-on-select="!allow_multiple" :options="exclusion_values"/><br>
      </CCol>
    </CRow>
    <CRow>
      <CCol>
        <label for="intel_list">Intel List</label><br>
        <multiselect id="intel_list" v-model="exclusion.list" :options="formatted_lists" track-by="uuid" label="name" :close-on-select="true"
                  :internal-search="false"
                  :searchable="true"
                  @search-change="getThreatList"
                  @select="setList"
                  v-bind:disabled="exclusion.condition == 'exists'"/>
        <small class="form-text text-muted w-100">Optional - If selected the values in this list will be excluded along with any manually provided values</small><br>
      </CCol>
    </CRow>
    <CRow>
      <CCol col=6>
        <CInputCheckbox :value.sync="exclusion.is_global" label="Global Exclusion" description="If checked, this exclusion will always follow the rule when it is consumed in Detection Repositories or Bundles.  It can not be modified without cloning the entire Rule."/>
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
    isSearchable() {
      if(this.rule.source && this.rule.source.uuid !== null) {
        return true
      } else {
        return false
      }
    },
    performance_warning() {
      // If the condition is wildcard and any of the values start with a * or ? then we need to warn the user that this will be a very expensive query
      if(this.exclusion.condition === 'wildcard') {
        let values = this.exclusion.values
        let warning = false
        values.forEach(value => {
          if(value.startsWith('*') || value.startsWith('?')) {
            warning = true
          }
        })
        return warning
      } else {
        return false
      }
    },
    allow_multiple () {
      if(['one of','wildcard'].includes(this.exclusion.condition)) {
        return true
      } else {
        return false
      }
    },
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
    setField(value) {
      this.exclusion.field = value
    },
    addExclusionValue(value) {
      if(this.exclusion_values === null) {
        this.exclusion_values = [value]
      } else { 
        this.exclusion_values.push(value)
      }

      if(this.exclusion.values === null) {
        this.exclusion.values = [value]
      } else {
        this.exclusion.values.push(value);
      }
    },
    checkValues(event) {
      if(this.exclusion.values.length > 1 && event.target.value === 'is') {
        this.exclusion.values = []
      }
    },
    createExclusion() {
      if('exceptions' in this.rule) {
        console.log('exists')
        if(this.rule.exceptions === null) {
          this.$set(this.rule,'exceptions',[this.exclusion])
        } else {
          this.$set(this.rule,'exceptions',[...this.rule.exceptions, this.exclusion])
        }        
      } else {
        this.$set(this.rule,'exceptions',[this.exclusion])
      }
      this.modalStatus = false
    },
    editExclusion() {
      if(this.rule.exceptions.length > 0) {
        this.rule.exceptions = [...this.rule.exceptions.filter(e => e.uuid !== this.exclusion.uuid), this.exclusion]
      } else {
        this.$set(this.rule,'exceptions',[this.exclusion])
      }
      this.$emit('exclusion_saved', true)
      this.modalStatus = false
    },
    getIndexField(search) {
      if(this.rule.source.uuid !== null) {
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
      }      
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