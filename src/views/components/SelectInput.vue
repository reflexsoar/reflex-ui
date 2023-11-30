<template>
  <div class="wrapper">
    <slot name="label">
      <label v-if="label"> {{ label }} </label>
    </slot>
    <div class="select-btn">
      <span v-if="!selected">{{ placeholder }}</span>
      <span v-if="selected">{{ getSelectedLabel() }}</span>
      <i v-if="!loading" class="fas fa-chevron-down"></i>
      <i v-else class="lds-dual-ring-small"></i>
    </div>
    <div class="content">
      <div class="search">
        <input type="text" placeholder="Search..." v-model="search" @input="searchChange" />
      </div>
      <ul class="options" v-if="filtered_options.length > 0 && !loading">
        <li
          v-for="(option, i) in filtered_options"
          :key="i"
          class="option"
          @click="select(option)"
          :class="{ selected: isSelected(option) }"
        >
          <slot name="option" :option="option">{{ optionValue(option) }}</slot>
        </li>
      </ul>
      <span v-else-if="loading" class="no-results"><div class="lds-dual-ring"></div></span>
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

.lds-dual-ring {
  display: inline-block;
  width: 80px;
  height: 80px;
}

.lds-dual-ring-small {
  display: inline-block;
  width: 10px;
  height: 10px;
}

.lds-dual-ring-small:after {
  content: " ";
  display: block;
  height: 10px;
  width: 10px;
  border-radius: 50%;
  border: 6px solid #3c4b64;
  border-color: #3c4b64 transparent #3c4b64 transparent;
  animation: lds-dual-ring 1.2s linear infinite;
}

.lds-dual-ring:after {
  content: " ";
  display: block;
  width: 64px;
  height: 64px;
  margin: 8px;
  border-radius: 50%;
  border: 6px solid #3c4b64;
  border-color: #3c4b64 transparent #3c4b64 transparent;
  animation: lds-dual-ring 1.2s linear infinite;
}

@keyframes lds-dual-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes lds-dual-ring-small {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>

<script>
export default {
  name: "SelectInput",
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
      type: String,
      default: null,
    },
    placeholder : {
      type: String,
      default: "Select an option"
    },
    loading: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      selected: null,
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
    searchChange() {
      /* Only if all existing options have been exhausted */
      this.$emit("search-change", this.search);
    },
    optionValue(option) {
        if (typeof option === "string") {
            return option;
        }
        return option[this.option_label];
    },
    isSelected(option) {
      if (typeof option === "string") {
        return option === this.selected;
      }

      return option[this.option_key] === this.selected;
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
        
        if (typeof option === "object" && option[this.option_key] == this.selected) {
          this.selected = null;
          this.wrapper.classList.remove("active");
          this.$emit("update:value", this.selected);
          return;
        } else if (typeof option === "string" && option == this.selected) {
          this.selected = null;
          this.wrapper.classList.remove("active");
          this.$emit("update:value", this.selected);
          return;
        }

        if (typeof option === "object" && this.option_key in option) {
          this.selected = option[this.option_key];
        } else {
          this.selected = option;
        }
      } else {
        this.selected = null;
      }

      this.search = "";

      this.wrapper.classList.remove("active");

      this.$emit("update:value", this.selected);
    },
    getSelectedLabel() {

      let selected = this.options.find(
        (option) => option[this.option_key] === this.selected
      );

      if (selected == undefined) {
        return this.selected;
      }

      if (selected) {
        if (this.option_label in selected) {
          return selected[this.option_label];
        }
        return selected;
      }
    },
  },
  mounted() {
    this.wrapper = this.$el;
    
    let selectBtn = this.wrapper.querySelector(".select-btn");
    let searchBox = this.wrapper.querySelector("input");

    if (this.value) {
      let selected = this.options.find(
        (option) => option[this.option_key] === this.value
      );

      if (selected == undefined) {
        selected = this.value;
      }

      this.select(selected);
    } else {
        this.selected = null;
    }

    // Select the option when the user presses enter but only if it is
    // the remaining option
    searchBox.addEventListener("keyup", (e) => {
      if (e.key === "Enter") {
        if (this.filtered_options.length === 1) {
          // If the value is already selected, deselect it and set selected to null
          if (this.filtered_options[0][this.option_key] === this.selected) {
            this.select(null);
            return;
          }

          this.select(this.filtered_options[0]);
        }
      }
    });

    selectBtn.addEventListener("click", () => {
      this.wrapper.classList.toggle("active");

      // Add an event handler that when clicked outside of the wrapper, it will
      // close the wrapper
      document.addEventListener("click", (e) => {
        if (!this.wrapper.contains(e.target)) {
          this.wrapper.classList.remove("active");
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
