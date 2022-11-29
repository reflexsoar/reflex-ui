<template>
  <div>
    <table class="table">
      <thead style="border-bottom: 1px solid #cfcfcf">
        <tr>
          <td colspan="100%">
            <span v-if="selected.length > 0"
              >Selected {{ selected.length }} items.<span v-if="group_field"
                >&nbsp;</span
              ></span
            >
            <span v-if="group_field !== null">
              <b>Grouped By:</b>&nbsp;
              <span
                class="badge bg-secondary filter-badge"
                @click="selectGroupField(group_field)"
                >{{ group_field | capitalize }}</span
              >
            </span>
            <span class="float-right">
              <slot name="table-controls">
                <Button class="btn btn-sm btn-primary">Export</Button>
              </slot>
            </span>
          </td>
        </tr>
      </thead>
      <thead>
        <tr v-if="group_field === null">
          <th v-if="checkbox" class="col-md-1">
            <input type="checkbox" @click="selectAll" :checked="allSelected" />
          </th>
          <th v-for="field in field_configs" :key="field.key" class="table-column-name">
            <span @click="selectGroupField(field.label)">{{
              field.label | capitalize
            }}</span>
          </th>
        </tr>
        <tr v-else>
          <th v-if="checkbox" class="col-md-1">
            <input type="checkbox" @click="selectAll" :checked="allSelected" />
          </th>
          <th class="table-column-name">
            <span @click="selectGroupField(group_field)">{{
              group_field | capitalize
            }}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, i) in items" :key="i" v-if="group_field === null">
          <td v-if="checkbox">
            <input
              type="checkbox"
              v-bind:checked="selected.includes(item[checkbox_key_field])"
              :value="item[checkbox_key_field]"
              @change="checkboxChange($event)"
            />
          </td>
          <td v-for="field in field_configs" :key="field.key">
            <slot :name="field.key" :item="item">
              {{ item[field.key] }}
            </slot>
          </td>
        </tr>
        <tr v-for="(group, i) in grouped_items" :key="i">
          <td v-if="checkbox">
            <input
              type="checkbox"
              v-bind:checked="selected.includes(i[checkbox_key_field])"
              :value="i[checkbox_key_field]"
              @change="checkboxChange($event)"
            />
          </td>
          <td colspan="100%">
            <slot :name="`group-field-${group_field}`" :item="i">
                <span class="badge bg-secondary filter-badge">{{ i }}</span>
            </slot><span v-if="show_grouped_totals">&nbsp;{{ group.length }} items</span>
            <table class="table">
              <thead>
                <tr>
                  <th
                    v-for="field in field_configs"
                    :key="field.key"
                    class="table-column-name"
                  >
                    <span @click="selectGroupField(field.label)">{{
                      field.label | capitalize
                    }}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, j) in group" :key="j">
                  <td v-for="field in field_configs" :key="field.key">
                    <slot :name="field.key" :item="item">
                      {{ item[field.key] }}
                    </slot>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table-column-name {
  cursor: pointer;
}
.filter-badge {
  font-size: 14px;
  font-weight: normal;
  cursor: pointer;
}
</style>

<script>
export default {
  name: "RDataTable",
  props: {
    items: Array,
    fields: Array,
    striped: Boolean,
    clickableRows: Boolean,
    checkbox: {
      type: Boolean,
      default: false,
    },
    checkbox_key_field: {
      type: String,
      default: "id",
    },
    show_controls: {
      type: Boolean,
      default: true,
    },
    show_grouped_totals: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    field_configs() {
      return this.fields.map((field) => {
        let field_object = {};
        if (typeof field === "string") {
          return {
            key: field,
            label: field.replace(/_/g, " "),
          };
        }
        if (typeof field === "object") {
          if (!field.hasOwnProperty("key") && field.hasOwnProperty("label")) {
            field.key = field.labelfield.replace(/_/g, " ");
          }
          if (!field.hasOwnProperty("label") && field.hasOwnProperty("key")) {
            field.label = field.key;
          }
          console.log(field);
          if (!field.hasOwnProperty("label") && !field.hasOwnProperty("key")) {
            throw new Error("Field must have a key or label property");
          }
        }
        return field;
      });
    },
    grouped_items() {
      let grouped_items = [];
      let groups = {};
      if (this.group_field !== null) {
        this.items.forEach((item) => {
          if (!groups.hasOwnProperty(item[this.group_field])) {
            groups[item[this.group_field]] = [];
          }
            groups[item[this.group_field]].push(item);         
        });
        console.log(groups);
      }
      return groups;
    },
  },
  data: function () {
    return {
      selected: [],
      allSelected: false,
      group_field: null,
    };
  },
  methods: {
    selectAll(e) {
      if (e.target.checked) {
        this.selected = this.items.map((item) => item[this.checkbox_key_field]);
      } else {
        this.selected = [];
      }
    },
    checkboxChange(e) {
      if (this.selected.includes(e.target.value)) {
        this.selected = this.selected.filter((i) => i !== e.target.value);
      } else {
        this.selected.push(e.target.value);
      }
    },
    selectGroupField(field) {
      if (this.group_field === field) {
        this.group_field = null;
      } else {
        this.group_field = field;
      }
    },
  },
  filters: {
    capitalize: function (value) {
      if (!value) return "";
      value = value.toString();
      let words = value.split(" ");
      words = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1));
      return words.join(" ");
    },
  },
};
</script>
