<template>
    <div>
    <div
      v-show="showTools"
      class="tools"
      :style="{
        left: `${x}px`,
        top: `${y}px`
      }"
      @mousedown.prevent=""
    >
      <span
        class="item"
        @mousedown.prevent="handleAction('share')"
      >
          <svg style="width:24px;height:24px" viewBox="0 0 24 24">
            <path fill="#000000" d="M22.46,6C21.69,6.35 20.86,6.58 20,6.69C20.88,6.16 21.56,5.32 21.88,4.31C21.05,4.81 20.13,5.16 19.16,5.36C18.37,4.5 17.26,4 16,4C13.65,4 11.73,5.92 11.73,8.29C11.73,8.63 11.77,8.96 11.84,9.27C8.28,9.09 5.11,7.38 3,4.79C2.63,5.42 2.42,6.16 2.42,6.94C2.42,8.43 3.17,9.75 4.33,10.5C3.62,10.5 2.96,10.3 2.38,10C2.38,10 2.38,10 2.38,10.03C2.38,12.11 3.86,13.85 5.82,14.24C5.46,14.34 5.08,14.39 4.69,14.39C4.42,14.39 4.15,14.36 3.89,14.31C4.43,16 6,17.26 7.89,17.29C6.43,18.45 4.58,19.13 2.56,19.13C2.22,19.13 1.88,19.11 1.54,19.07C3.44,20.29 5.7,21 8.12,21C16,21 20.33,14.46 20.33,8.79C20.33,8.6 20.33,8.42 20.32,8.23C21.16,7.63 21.88,6.87 22.46,6Z" />
        </svg>
      </span>
      <span
        class="item"
        @mousedown.prevent="handleAction('highlight')"
      >
        <svg style="width:24px;height:24px" viewBox="0 0 24 24">
          <path fill="#000000" d="M18.5,1.15C17.97,1.15 17.46,1.34 17.07,1.73L11.26,7.55L16.91,13.2L22.73,7.39C23.5,6.61 23.5,5.35 22.73,4.56L19.89,1.73C19.5,1.34 19,1.15 18.5,1.15M10.3,8.5L4.34,14.46C3.56,15.24 3.56,16.5 4.36,17.31C3.14,18.54 1.9,19.77 0.67,21H6.33L7.19,20.14C7.97,20.9 9.22,20.89 10,20.12L15.95,14.16" />
        </svg>
      </span>
    </div>
    <slot/>
  </div>
</template>

<script>
export default {
  name: 'hoverselect',
  data () {
    return {
      x: 0,
      y: 0,
      showTools: false,
      selectedText: ''
    }
  },
  computed: {
    highlightableEl () {
      return this.$slots.default[0].elm
    }
  },
  mounted () {
    window.addEventListener('mouseup', this.onMouseup)
  },
  beforeDestroy () {
    window.removeEventListener('mouseup', this.onMouseup)
  },
  methods: {
      onMouseup () {
        const selection = window.getSelection()
        const startNode = selection.getRangeAt(0).startContainer.parentNode
        const endNode = selection.getRangeAt(0).endContainer.parentNode
        if (!startNode.isSameNode(this.highlightableEl) || !startNode.isSameNode(endNode)) {
          this.showTools = false
          return
        }
        const { x, y, width } = selection.getRangeAt(0).getBoundingClientRect()
        if (!width) {
          this.showTools = false
          return
        }
        this.x = x + (width / 2)
        this.y = y + window.scrollY - 10
        this.showTools = true
        this.selectedText = selection.toString()
      },
      handleAction (action) {
          this.$emit(action, this.selectedText)
      }
  }
}
</script>
