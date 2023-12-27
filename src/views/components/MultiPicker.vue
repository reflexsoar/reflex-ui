<template>
  <div class="wrapper">
    <slot name="label">
      <label v-if="label"> {{ label }} </label>
    </slot>
    <div class="select-btn">
      <span v-if="selections === null || selections.length == 0">{{ placeholder }}</span>
      <span v-if="selections && selections.length > 0 && asTags" class="selected-items">
        <div v-for="(item, i) in selections" :key="i" class="tag selected-option" color="secondary">
          <span class="option-text">{{ getSelectedLabel(item) }}</span>
          <i @click="select(item)" class="fas fa-x tag-remove"></i>
          <div class="option-tooltip">
            {{ getSelectedLabel(item) }}
          </div>
        </div></span>
        
      <span v-if="selections && selections.length > 0 && !asTags">Selected {{ selections.length }} of {{ options.length }} items.</span>
      <i class="fas fa-chevron-down"></i>
    </div>
    <div class="content">
      <div class="search">
        <input type="text" placeholder="Search..." v-model="search" />
      </div>
      <ul class="options" v-if="filtered_options.length > 0 || taggable">
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
            <CBadge v-if="showCount" class="tag" color="secondary">{{ option.count ? option.count : 0 }}</CBadge>
          </div>
        </li>
        <li class="option" v-if="search.length > 0 && taggable && !validOption(search) && !alreadySelected(search)" @click="select(search, true)"> 
          <div style="width: 98%">
              <input type="checkbox" class="checkbox" :value="search" :checked="isSelected(search)">&nbsp;
                <slot name="option" :option="search">{{ optionValue(search) }}</slot>
              </input>
              <span class="add-new-value">
                <slot name="new-value-placeholder">{{ newValuePlacholder }}
                </slot>
              </span>
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

.add-new-value {
  color: #999;
  /* Make this all the way to the right */
  float: right
}

.selected-option {
  margin-right: 5px;
  cursor: pointer;
  display: flex;
  border-radius: 0.25rem;
  padding: 2px 5px;
  background: #3c4b64;
  align-items: center;
  justify-content: space-between;
  color: #fff;
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
  min-height: calc(1.5em + 0.75rem + 2px);
  height: auto;
  line-height: 1.5;
  display: flex;
  overflow-y: scroll;
  cursor: pointer;
  font-weight: 400;
  padding: 0.375rem 0.75rem;
  padding-top: 4px;
  padding-bottom: 4px;
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

th > .wrapper {
  margin-bottom: 0px !important;
}

.content {
  position: absolute;
  z-index: 2000 !important;
  width: 100%;
  display: none;
  margin-top: 5px;
  padding: 5px 5px 0px 5px;
  border-radius: 0.25rem;
  background: #fff;
  border: 1px solid #d8dbe0;
  margin-bottom: 10px;
  font-weight: 400;
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

.selected-items {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  row-gap:4px;
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
  padding-top: 5px;
  padding-bottom: 5px;
  padding-left: 10px;
  paddnig-right: 10px;
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

.no-results-tag {
  display: flex;
  justify-content: center;
  /* Allow the words to wrap */
  flex-wrap: wrap;
  padding: 10px;
}

.selected {
  background-color: rgb(243, 243, 243);
}

.options li.selected:hover {
  background-color: rgb(255, 106, 106);
  color: #fff;
}

.tag-remove {
  /* This should float to the right over the tag */
  float: right;
  margin-left: 5px;
  cursor: pointer;
}

.option-text {
  display: block;
  overflow-x: hidden;
  text-overflow: ellipsis;
  text-wrap: nowrap;
  max-width: 225px;
}

.option-tooltip {
  display: none;
  position: absolute;
  z-index: 1000;
  background: red;
  padding: 2px;
  padding-left: 5px;
  padding-right: 5px;
  border-radius: 0.25rem;
  /* Make the tooltip appear above the tag */
  transform: translate(0, -125%);
  /* Center the tooltip text*/
  text-align: center;
  color: #fff;
  background: #000;
  font-size: 95%;
}

/* Draw a triangle on the bottom of the tooltip */
.option-tooltip::after {
  content: "";
  position: absolute;
  bottom: -10px;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: #000 transparent transparent transparent;
}

.selected-option:hover .option-tooltip {
  display: block;
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
    taggable: {
      type: Boolean,
      default: false,
    },
    newValuePlacholder: {
      type: String,
      default: "Add new value"
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
      let options = [...this.options]

      // Add the selected items to the bottom of the list if they are not already in the list
      if (this.selections) {
        this.selections.forEach((selection) => {

          if(typeof selection === "string") {
            
            if(!options.includes(selection)) {
              options.push(selection)
            }
          } else {
          // If the selection is not one of the option_keys, add it to the list
          if (!options.find((option) => option[this.option_key] === selection)) {
            options.push({
              [this.option_key]: selection,
              [this.option_label]: selection,
            });
          } }
        });
      }
      
      return options.filter((o) => {
        if (typeof o === "string") {
          return o.toLowerCase().includes(this.search.toLowerCase());
        }

        return o[this.option_label].toLowerCase().includes(this.search.toLowerCase());
      });
    },
  },
  watch: {
    value: function () {
      this.selections = this.value;
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
      if (this.selections === null) {
        return false;
      }

      if (typeof option === "string") {
        return this.selections.includes(option);
      }

      return this.selections.includes(option[this.option_key]);
    },
    select(option, tag=false) {

      if (this.selections === null) {
        this.selections = [];
      }

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
          this.$emit("removeOption", option)
          return;
        } else if (typeof option === "string" && this.selections.includes(option)) {
          this.selections.splice(this.selections.indexOf(option), 1);
          this.$emit("update:value", this.selections);
          this.$emit("removeOption", option)
          return;
        }

        if (typeof option === "object" && this.option_key in option) {
          this.selections.push(option[this.option_key])
        } else {
          this.selections.push(option)
        }

        if(tag) {
         this.$emit("addOption", option);
        }
      } else {
        this.selections = [];
      }

      this.$emit("update:value", this.selections);
    },
    validOption(val) {
      /* Return true of the search value is contained in any of the options */
      return this.options.filter((o) => {
        if (typeof o === "string") {
          return o.toLowerCase().includes(val.toLowerCase());
        }
  
        return o[this.option_label].toLowerCase().includes(val.toLowerCase());
      }).length > 0
    },
    alreadySelected(val) {
      /* Return true of the search value is contained in any of the options */
      return this.selections.filter((o) => {
        if (typeof o === "string") {
          return o.toLowerCase().includes(val.toLowerCase());
        }
  
        return o[this.option_label].toLowerCase().includes(val.toLowerCase());
      }).length > 0
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
