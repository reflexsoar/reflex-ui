<template>
  <div>
    <div class="dropdown" @click.prevent="showDropDown">
      <div class="overselect"></div>
      <select class="form-control form-control-sm">
        <option value="">{{prompt}}</option>
      </select>
    </div>
    <div class="multiselect" v-if="show">
      <ul>
        <li v-for="item in items" :key="item.value">
        <CInputCheckbox :key="item.value" :value="item.value" :label="item.label" @change="select" />
        </li>
      </ul>
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
  z-index: 1000;
  background-clip: padding-box;
  border: 1px solid;
  border-radius: 0.25rem;
  background-color: #fff;
  position: fixed;
  margin-top: 2.5px;
  box-shadow: 0 0.5rem 1rem rgb(0 0 21 / 18%);
  border-color: #d8dbe0;
  ul {
    padding: 5px;
    border: 1px solid #ddd;
    border-top: 0;
    border-radius: 0 0 3px 3px;
    left: 0px;
    position: absolute;
    top: -1rem;
    width: 100%;
    list-style: none;
    max-height: 150px;
    overflow: auto;
  }
  font: clear;
}

.multiselect ul {
  list-style-type: none; /* Remove bullets */
  padding: 5px;
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
    label: String,
    items: Array
  },
  data() {
    return {
      show: false,
      selected: [],
      prompt: "Select..."
    };
  },
  created() {
    window.addEventListener("click", this.close);
  },
  beforeDestroy() {
    window.removeEventListener("click", this.close);
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
        if(this.selected.includes(val.target.value)) {
            this.selected = this.selected.filter((item) => item !== val.target.value);
        } else {
            this.selected.push(val.target.value);
        }
        if(this.selected.length > 0) {
            this.prompt = "Selected: " + this.selected.length + " of " + this.items.length + " items"
        } else {
            this.prompt = "Select...";
        }
        this.$emit("checked", val.target.value);
    },
    clear() {
        for(let item of this.items) {
            item.selected = false;
        }
        this.$emit("checked", null);
    }
  }
};
</script>
