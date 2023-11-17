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
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
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
