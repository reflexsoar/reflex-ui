<template>
  <div :class="rightDrawerClasses" @click="rightDrawerClick">
    <slot></slot>
  </div>
</template>

<style scoped>
.c-right-drawer {
  position: relative;
  display: flex;
  flex: 0 0 256px;
  flex-direction: column;
  order: -1;
  width: 256px;
  padding: 0;
  box-shadow: none;
}
</style>

<script>
export default {
  name: 'CRightDrawer',
  props: {
    fixed: {
      type: Boolean,
      default: true
    },
    unfoldable: Boolean,
    overlaid: Boolean,
    breakpoint: {
      type: [String, Boolean],
      default: 'lg',
      validator: val => [false, '', 'sm', 'md', 'lg', 'xl'].includes(val)
    },
    minimize: Boolean,
    show: {
      type: [Boolean, String],
      default: 'responsive'
    },
    size: {
      type: String,
      validator: (val) => ['', 'sm', 'lg', 'xl'].includes(val)
    },
    hideOnMobileClick: {
      type: Boolean,
      default: true
    },
    aside: Boolean,
    colorScheme: {
      type: String,
      default: 'dark'
    },
    dropdownMode: {
      type: String,
      default: 'openActive',
      validator: (mode) => {
        return [
          '', 'openActive', 'close', 'closeInactive', 'noAction'
        ].includes(mode)
      }
    }
  },
  provide () {
    const state = {}
    Object.defineProperty(state, 'minimize', {
      get: () => this.minimize && !this.unfoldable
    })
    return { 
      state,
      dropdownMode: this.dropdownMode 
    }
  },
  data () {
    return {
      open: this.show,
    }
  },
  watch: {
    show (val) {
      this.open = val
    },
    open: {
      immediate: true,
      handler (val) {
        val === true ? this.createBackdrop() : this.removeBackdrop()
      }
    }
  },
  // mounted () {
  //   if (this.open === true) {
  //     this.createBackdrop()
  //   }
  // },
  beforeDestroy () {
    this.removeBackdrop()
  },
  computed: {
    rightDrawerClasses () {
      const haveResponsiveClass = this.breakpoint && this.open === 'responsive'
      return [
        'c-right-drawer',
        `c-right-drawer-${this.colorScheme}`,
        {
          'c-right-drawer-show': this.open === true,
          [`c-right-drawer-${this.breakpoint}-show`]: haveResponsiveClass,
          'c-right-drawer-fixed': this.fixed && !this.overlaid,
          'c-right-drawer-right': this.aside,
          'c-right-drawer-minimized': this.minimize && !this.unfoldable,
          'c-right-drawer-unfoldable': this.minimize && this.unfoldable,
          'c-right-drawer-overlaid': this.overlaid,
          [`c-right-drawer-${this.size}`]: this.size
        }
      ]
    }
  },
  methods: {
    rightDrawerClick (e) {
      if (this.hideOnMobileClick && this.isOnMobile()) {
        e.target.closest('a.c-right-drawer-nav-link') ? this.closeRightDrawer() : null
      }
    },
    closeRightDrawer () {
      this.open = this.overlaid ? false : 'responsive'
      this.$emit('update:show', this.open)
    },
    isOnMobile () {
      return Boolean(getComputedStyle(this.$el).getPropertyValue('--is-mobile'))
    },
    rightDrawerCloseListener (e) {
      if (
        document.getElementById(this._uid + 'backdrop') &&
        !this.$el.contains(e.target)
      ) {
        this.closeRightDrawer()
      }
    },
    createBackdrop () {
      const backdrop = document.createElement('div')
      if (this.overlaid) {
        document.addEventListener('click', this.rightDrawerCloseListener, true)
      } else {
        backdrop.addEventListener('click', this.closeRightDrawer)
      }
      backdrop.className = 'c-right-drawer-backdrop c-show'
      backdrop.id = this._uid + 'backdrop'
      document.body.appendChild(backdrop)
    },
    removeBackdrop () {
      const backdrop = document.getElementById(this._uid + 'backdrop')
      if (backdrop) {
        document.removeEventListener('click', this.rightDrawerCloseListener)
        backdrop.removeEventListener('click', this.closeRightDrawer)
        document.body.removeChild(backdrop)
      }
    }
  }
}
</script>