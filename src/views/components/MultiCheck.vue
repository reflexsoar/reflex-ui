<template>
  <div>
    {{ filtered_items }}
    <div v-if="expanded">
      <input
        v-if="searchable"
        type="text"
        :class="{ 'form-control-sm': size === 'sm', 'form-control': true }"
        v-model="search"
        placeholder=""
      />
      <ul class="select-list">
        <li v-for="item in filtered_items" :key="item.value">
          <CRow>
            <CCol>
              <CInputCheckbox
                :inline="true"
                :key="item.value"
                :value="item.value"
                :label="item[labelField]"
                @change="select"
                :checked="selected.includes(item.value)"
              >
                <template #label>
                  <label class="form-check-label"
                    >{{ item[labelField]
                    }}<small v-if="item.description"
                      >&nbsp;-&nbsp;<span class="muted">{{
                        item.description
                      }}</span></small
                    ></label
                  >
                </template>
              </CInputCheckbox>
            </CCol>
            <CCol v-if="showCount" class="text-right">
                <CBadge class="text-right" style="margin-top: 0px" color="primary">{{
                  item.count ? item.count : 0
                }}</CBadge>
              </CCol>
          </CRow>
        </li>
      </ul>
    </div>
    <div v-else>
      <label v-if="label">{{ label }}</label>
      <div class="dropdown" @click.prevent="showDropDown">
        <div class="overselect"></div>
        <select :class="{ 'form-control-sm': size === 'sm', 'form-control': true }">
          <option value="">{{ prompt }}</option>
        </select>
      </div>
      <div class="multiselect" v-if="show">
        <ul>
          <input
            v-if="searchable"
            type="text"
            :class="{ 'form-control-sm': size === 'sm', 'form-control': true }"
            v-model="search"
            placeholder=""
          />
          <li v-for="item in filtered_items" :key="item.value">
            <CRow>
              <CCol>
                <CInputCheckbox
                  :inline="true"
                  :key="item.value"
                  :value="item.value"
                  :label="item.label"
                  @change="select"
                  :checked="selected.includes(item.value)"
                >
                  <template #label>
                    <label class="form-check-label"
                      >{{ item.label
                      }}<small v-if="item.description"
                        >&nbsp;-&nbsp;<span class="muted">{{
                          item.description
                        }}</span></small
                      ></label
                    >
                  </template>
                </CInputCheckbox>
              </CCol>
              <CCol v-if="showCount" class="text-right">
                <CBadge class="text-right" style="margin-top: 0px" color="primary">{{
                  item.count ? item.count : 0
                }}</CBadge>
              </CCol>
            </CRow>
          </li>
        </ul>
      </div>
      <br v-if="label" />
    </div>
  </div>
</template>

<style scoped>
.dropdown {
  position: relative;
}

.block {
  display: inline-block;
}

.multiselect {
  width: auto;
  max-width: 90%;
  z-index: 1000;
  background-clip: padding-box;
  border: 1px solid;
  border-radius: 0.25rem;
  background-color: #fff;
  position: absolute;
  margin-top: 2.5px;
  box-shadow: 0 0.5rem 1rem rgb(0 0 21 / 18%);
  border-color: #d8dbe0;
  overflow-y: scroll;
  max-height: 300px;
  overflow-x: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.select-list {
  list-style-type: none; /* Remove bullets */
  padding: 5px;
  margin-bottom: 5px;
}

.multiselect ul {
  list-style-type: none; /* Remove bullets */
  padding: 5px;
  margin-bottom: 5px;
}

.multiselect ul li input {
  vertical-align: middle;
}

.multiselect ul li {
  padding: 5px;
  font-size: 14px;
  font-weight: normal;
}

.overselect {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}
</style>

<script>
export default {
  name: "RMultiCheck",
  props: {
    label: {
      type: String,
      default: "",
    },
    items: Array,
    size: {
      type: String,
      default: "md",
    },
    showCount: {
      type: Boolean,
      default: false,
    },
    value: {
      type: Array,
      default: () => [],
    },
    default_prompt: {
      type: String,
      default: "Select...",
    },
    expanded: {
      type: Boolean,
      default: false,
    },
    labelField: {
      type: String,
      default: "label",
    },
    searchable: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      show: false,
      selected: [],
      prompt: "Select...",
      search: "",
    };
  },
  created() {
    window.addEventListener("click", this.close);
    if (this.value.length > 0) {
      this.selected = this.value;
      this.prompt = "Selected: " + this.selected_count + " of " + this.items.length;
    } else {
      this.prompt = this.default_prompt;
    }
  },
  beforeDestroy() {
    window.removeEventListener("click", this.close);
  },
  watch: {
    value() {
      this.selected = this.value;
      if (this.selected.length > 0) {
        this.prompt = "Selected: " + this.selected_count + " of " + this.items.length;
      } else {
        this.prompt = this.default_prompt;
      }
    },
  },
  computed: {
    filtered_items() {
      if (this.search === "") {
        return this.items;
      }
      return this.items.filter((item) => {
        return item.label.toLowerCase().includes(this.search.toLowerCase());
      });
    },
    selected_count() {
      return this.selected.filter((o) => this.items.find((i) => i.value === o)).length;
    },
  },
  methods: {
    close(e) {
      if (!this.$el.contains(e.target)) {
        this.show = false;
      }
    },
    showDropDown() {
      this.show = !this.show;
    },
    select(val) {
      if (this.selected.includes(val.target.value)) {
        this.selected = this.selected.filter((item) => item !== val.target.value);
      } else {
        this.selected.push(val.target.value);
      }
      if (this.selected.length > 0) {
        this.prompt =
          "Selected: " + this.selected_count + " of " + this.items.length + " items";
      } else {
        this.prompt = "Select...";
      }
      this.$emit("checked", this.selected);
      this.$emit("update:value", this.selected);
    },
    clear() {
      for (let item of this.items) {
        item.selected = false;
      }
      this.$emit("checked", null);
      this.$emit("update:value", null);
    },
  },
};
</script>
