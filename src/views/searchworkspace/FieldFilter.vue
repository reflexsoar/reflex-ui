<template>
    <div>
  <div class="field-selection" v-bind:class="hide_field_selection ? 'hide' : ''">
    <CInput v-model="field_search" placeholder="Search fields">
      <template #append>
        <CButton
          color="secondary"
          class="no-shadow"
          size="sm"
          @click="toggleFieldSelection()"
          ><i class="fa-solid fa-square-caret-left"></i
        ></CButton>
      </template>
    </CInput>
    <div class="field-list-wrapper">
      <div class="field-group-header">
        Selected Fields
        <span v-if="fields.length > 0" class="reset-fields" @click="clearFields()"
          >| Clear All</span
        >
      </div>
      <draggable
        v-model="selected_fields"
        group="selected_fields"
        @start="drag = true"
        @end="drag = false"
      >
        <div v-for="(field, i) in selected_fields" :key="i" :ref="field.name">
          <div class="flex-grid field-picker-item text-left">
            <div class="d-col-1">
              <span class="field-type">{{ field.type }}</span>
            </div>
            <div class="d-col-10">
              <div class="field-name">{{ field.name }}</div>
            </div>
            <div class="d-col-1">
              <div class="field-picker-hide" @click="deselectField(field)">
                <i class="fas fa-times" />
              </div>
            </div>
          </div>
        </div>
      </draggable>
      <div class="field-group-header">Available</div>
      <div v-for="field in filtered_fields()" :key="field.name" :ref="field.name">
        <div class="flex-grid field-picker-item text-left">
          <div class="d-col-1">
            <span class="field-type">{{ field.type }}</span>
          </div>
          <div class="d-col-10">
            <div class="field-name">{{ field.name }}</div>
          </div>
          <div class="d-col-1">
            <div class="field-picker-show" @click="selectField(field)">
              <i class="fas fa-eye" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="field-selection-toggle" v-bind:class="hide_field_selection ? 'show' : ''">
    <CButton
      @click="toggleFieldSelection()"
      size="sm"
      color="secondary"
      class="no-shadow"
      v-c-tooltip="{ content: 'Show Fields', placement: 'right' }"
      ><i class="fa-solid fa-square-caret-right"></i
    ></CButton>
  </div>
  </div>
</template>

<style scoped>
.no-shadow {
  box-shadow: none !important;
}

.field-type {
  padding: 2px 2px 2px 0px;
  text-align: center;
  width: 15px;
  display: inline-block;
  line-height: 1.2;
  font-weight: 500;
  color: #fff;
  background-color: #3c4b64;
  border-radius: 2px;
  font-size: 11px;
  font-style: italic;
}

.field-selector.shrink {
  width: auto;
}

.field-list-wrapper .collapse {
  max-width: 0%;
}

/* Transition the shrink and expand classes */
.field-selector.shrink,
.search-results.expand {
  transition: width 0.5s ease-in-out;
}

/* Transition the collapse class */
.field-list-wrapper .collapse {
  transition: max-width 1s ease-in-out;
}

.field-list-wrapper {
  overflow-x: hidden;
  overflow-y: auto;
  min-height: calc(100vh - 330px);
  max-height: calc(100vh - 330px);
}

.field-name {
  overflow: hidden;
  white-space: nowrap;
  /* ellipsis */
  text-overflow: ellipsis;
  max-width: 95%;
}

.field-selection-toggle {
  display: none;
}

/* Create a show class that shows the field-selection-toggle */
.field-selection-toggle.show {
  display: block;
}

/* Create a hide class that hides the field-selection div */
.field-selection.hide {
  display: none;
}

.field-picker-item {
  margin: 0;
  padding: 0px;
  padding-left: 5px;
  margin-bottom: 4px;
}

.field-picker-item div[class^="d-col-"] {
  padding: 0 !important;
}

.reset-fields {
  font-weight: normal;
  cursor: pointer;
}

</style>

<script>
import draggable from "vuedraggable";

export default {
  name: "FieldFilter",
  components: {
    draggable,
  },
  props: {
    options: {
        type: Array,
        default: () => [],
    },
    fields: {
      type: Array,
      default: () => [],
    },
    hide_field_filter: {
      type: Boolean,
      default: false,
    },
  },
  created() {
    this.selected_fields = this.fields;
  },
  data() {
    return {
      field_search: "",
      drag: false,
      selected_fields: [],
      hide_field_selection: false
    };
  },
  methods: {
    filtered_fields() {
      let fields = this.options.filter((field) => {
        // If the search string is not empty, filter the fields by the search string and selected fields
        if (this.field_search != undefined && this.field_search.length > 0) {
          return (
            field.name.toLowerCase().includes(this.field_search.toLowerCase()) &&
            !this.selected_fields.filter((f) => f.name === field.name).length > 0
          );
        } else {
          // If the search string is empty, only return fields that are not selected
          return !this.selected_fields.filter((f) => f.name === field.name).length > 0;
        }
      });

      // Sort the fields alphabetically
      return fields.sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
    },
    selectField(field) {
      if (!this.selected_fields.includes(field)) {
        this.selected_fields.push(field);
        this.$emit("update:fields", this.selected_fields);
      }
    },
    deselectField(field) {
      if (this.selected_fields.includes(field)) {
        this.selected_fields.splice(this.selected_fields.indexOf(field), 1);
        this.$emit("update:fields", this.selected_fields);
      }
    },
    toggleFieldSelection(tab) {
      if (this.hide_field_selection === undefined) {
        this.hide_field_selection = true;
      } else {
        this.hide_field_selection = !this.hide_field_selection;
      }
      this.$emit("update:hide_field_filter", this.hide_field_selection);
    },
    clearFields() {
        this.selected_fields = [];
        this.$emit("update:fields", this.selected_fields);
    }
  },
  watch: {
    selected_fields: {
      handler: function (val, oldVal) {
        this.$emit("update:fields", this.selected_fields);
      },
      deep: true,
    },
    fields : {
        handler: function(val, oldVal) {
            this.selected_fields = val;
        },
        deep: true,
    },
  },
};
</script>
