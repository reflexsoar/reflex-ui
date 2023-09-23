<template>
  <div class="wrapper">
    <slot name="label">
      <label v-if="label"> {{ label }} </label>
    </slot>
    <div class="select-btn">
      <span v-if="selections.length == 0">{{ placeholder }}</span>
      <span v-if="selections.length > 0 && asTags"><CBadge v-for="item, i in selections" class="tag selected-option" color="secondary">{{ getSelectedLabel(item) }}&nbsp;<i @click="select(item)" class="fas fa-x"></i></CBadge></span>
      <span v-if="selections.length > 0 && !asTags">Selected {{ selections.length }} of {{ options.length }} items.</span>
      <i class="fas fa-chevron-down"></i>
    </div>
    <div class="content">
      <div class="search">
        <input type="text" placeholder="Search..." v-model="search" />
      </div>
      <ul class="options" v-if="filtered_options.length > 0">
        <li
          v-for="(option, i) in filtered_options"
          :key="i"
          class="option"
          @click="select(option)"
        >
          <div style="width: 98%">
            <input type="checkbox" class="checkbox" :value="option" :checked="isSelected(option)">&nbsp;
              <slot name="option" :option="option">{{ optionValue(option) }}</slot>
            </input>
          </div>
          <div>
            <CBadge v-if="showCount" class="tag tag-sm" color="secondary">{{ option.count ? option.count : 0 }}</CBadge>
          </div>
          
        </li>
      </ul>
      <span v-else class="no-results">No options found</span>
    </div>
    <slot name="description">
      <small v-if="description" class="form-text text-muted"> {{ description }} </small>
    </slot>
  </div>
</template>

<style>
.wrapper {
  width: 100%;
  margin: 0 auto;
  position: relative;
  margin-bottom: 10px;
}

.selected-option {
  margin-right: 5px;
  cursor: pointer;
}

.selected-option i {
  transform: rotate(0deg) !important;
}

.wrapper ul {
  padding-left: 0px;
  padding-bottom: 5px;
  background: #fff;
}

.select-btn,
.options li {
  display: flex;
  cursor: pointer;
  align-items: center;
  line-height: 1.5;
}

.select-btn {
  height: calc(1.5em + 0.75rem + 2px);
  line-height: 1.5;
  display: flex;
  cursor: pointer;
  padding: 0.375rem 0.75rem;
  border-radius: 0.25rem;
  border: 1px solid #d8dbe0;
  background: #fff;
  align-items: center;
  justify-content: space-between;
  color: rgb(107, 119, 133);
}

.select-btn i {
  transition: transform 0.3s linear;
}

.wrapper.active .select-btn {
  cursor: default;
}

.wrapper.active .select-btn i {
  transform: rotate(-180deg);
}

.content {
  position: absolute;
  z-index: 2;
  width: 100%;
  display: none;
  margin-top: 5px;
  padding: 5px 5px 0px 5px;
  border-radius: 0.25rem;
  background: #fff;
  border: 1px solid #d8dbe0;
  margin-bottom: 10px;
}

.wrapper.active .content {
  display: block;
}

.content .search {
  position: relative;
}

.search i {
  left: 15px;
  line-height: 2.5;
  position: absolute;
}

.search input {
  height: calc(1.5em + 0.75rem + 2px);
  width: 100%;
  padding: 0.375rem 0.75rem;
  border-radius: 0.25rem;
  border: 1px solid #d8dbe0;
  background: #fff;
}

.search input:focus {
  color: #768192;
  background-color: #fff;
  border-color: #958bef;
  outline: 0;
  -webkit-box-shadow: 0 0 0 0.2rem rgba(50, 31, 219, 0.25);
  box-shadow: 0 0 0 0.2rem rgba(50, 31, 219, 0.25);
}

.select-btn i {
  font-size: 80%;
}

.content .options {
  margin-top: 10px;
  max-height: 200px;
  overflow-y: auto;
}

.options::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 0.25rem;
}

.options::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 0.25rem;
}

.options li {
  padding: 10px;
  border-radius: 0.25rem;
}

.options li:hover {
  background: #b2ffb2;
}

.no-results {
  display: flex;
  justify-content: center;
  padding: 10px;
  font-weight: 500;
}

.selected {
  background-color: rgb(243, 243, 243);
}

.options li.selected:hover {
  background-color: rgb(255, 106, 106);
  color: #fff;
}
</style>

<script>
export default {
  name: "MultiPicker",
  props: {
    options: {
      type: Array,
      default: [],
    },
    label: String,
    description: String,
    option_key: {
      type: String,
      default: "value",
    },
    option_label: {
      type: String,
      default: "label",
    },
    required: {
      type: Boolean,
      default: false,
    },
    value: {
      type: Array,
      default: null,
    },
    placeholder : {
      type: String,
      default: "Select an option"
    },
    asTags: {
      type: Boolean,
      default: false
    },
    showCount: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      selected: null,
      selections: [],
      search: "",
    };
  },
  computed: {
    filtered_options: function () {
      return this.options.filter((o) => {
        if (typeof o === "string") {
          return o.toLowerCase().includes(this.search.toLowerCase());
        }

        return o[this.option_label].toLowerCase().includes(this.search.toLowerCase());
      });
    },
  },
  watch: {
    value: function () {
      this.selected = this.value;
    },
  },
  methods: {
    optionValue(option) {
        if (typeof option === "string") {
            return option;
        }
    
        return option[this.option_label];
    },
    isSelected(option) {
      if (typeof option === "string") {
        return this.selections.includes(option);
      }

      return this.selections.includes(option[this.option_key]);
    },
    select(option) {
      // Get the value from the option using the key_field prop
      if (option) {

        let selected_option = "";

        if (typeof option === "string") {
          selected_option = option;
        } else {
          selected_option = option;
        }
        
        if (typeof option === "object" && this.selections.includes(option[this.option_key])) {
          this.selections.splice(this.selections.indexOf(option[this.option_key]), 1);
          this.$emit("update:value", this.selections);
          return;
        } else if (typeof option === "string" && this.selections.includes(option)) {
          this.selections.splice(this.selections.indexOf(option), 1);
          this.$emit("update:value", this.selections);
          return;
        }

        if (typeof option === "object" && this.option_key in option) {
          this.selections.push(option[this.option_key])
        } else {
          this.selections.push(option)
        }
      } else {
        this.selections = [];
      }

      this.$emit("update:value", this.selections);
    },
    getSelectedLabel(val) {

      let selected = this.options.find(
        (option) => option[this.option_key] === val
      );

      if (selected == undefined) {
        return val
      }

      if (selected) {
        if (this.option_label in selected) {
          return selected[this.option_label];
        }
        return val;
      }
    }
  },
  mounted() {
    this.wrapper = this.$el;
    
    let selectBtn = this.wrapper.querySelector(".select-btn");
    let searchBox = this.wrapper.querySelector("input");

    if (this.value) {
      this.selections = this.value;
    }

    selectBtn.addEventListener("click", () => {
      this.wrapper.classList.toggle("active");

      // Add an event handler that when clicked outside of the wrapper, it will
      // close the wrapper
      document.addEventListener("click", (e) => {
        if (!this.wrapper.contains(e.target)) {
          this.wrapper.classList.remove("active");
          this.search = "";
        }
      });

      // If the wrapper is active, focus the search input
      if (this.wrapper.classList.contains("active")) {
        this.wrapper.querySelector("input").focus();
      }
    });
  },
};
</script>
