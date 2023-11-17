<template>
  
    <CBadge :style="{ backgroundColor: color, color: getFontColor(color) }" class="tag tag-list">
      {{ namespace }}: {{ value }}
    </CBadge>
</template>

<script>
import { mapState } from "vuex";

const Color = require("color");

export default {
  name: "AgentTag",
  props: {
    namespace: {
      type: String,
      required: false,
      default: "unknown"
    },
    value: {
      type: String,
      required: false,
      default: "unknown"
    },
    color: {
      type: String,
      required: false,
      default: "#000000"
    }
  },
  methods: {
    getFontColor(color) {
      if (Color(color).isDark()) {
        return "white";
      } else {
        return "black";
      }
    },
  },
};
</script>
