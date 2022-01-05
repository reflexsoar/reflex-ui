<template>
  <div :class="rightDrawerClasses" @click="rightDrawerClick">
    <slot></slot>
  </div>
</template>

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
    minimize (val) {
      if(val === false) {
        this.createBackdrop()
      } else {
        this.removeBackdrop()
      }
    },
    open: {
      immediate: true,
      handler (val) {
        val === true ? this.createBackdrop() : this.removeBackdrop()
      }
    }
  },
  mounted () {
    if (this.show === true) {
      this.createBackdrop()
    } 
  },
  beforeDestroy () {
    this.removeBackdrop()
  },
  computed: {
    rightDrawerClasses () {
      const haveResponsiveClass = this.breakpoint && this.open === 'responsive'
      return [
        'c-sidebar',
        `c-sidebar-${this.colorScheme}`,
        {
          'c-sidebar-show': this.open === true,
          [`c-sidebar-${this.breakpoint}-show`]: haveResponsiveClass,
          'c-sidebar-fixed': this.fixed && !this.overlaid,
          'c-sidebar-right': this.aside,
          'c-sidebar-minimized': this.minimize && !this.unfoldable,
          'c-sidebar-unfoldable': this.minimize && this.unfoldable,
          'c-sidebar-overlaid': this.overlaid,
          [`c-sidebar-${this.size}`]: this.size
        }
      ]
    }
  },
  methods: {
    rightDrawerClick (e) {
      if (this.hideOnMobileClick && this.isOnMobile()) {
        e.target.closest('a.c-sidebar-nav-link') ? this.closeRightDrawer() : null
      }
    },
    closeRightDrawer () {
      this.$store.commit('set', ['eventDrawerMinimize', true])
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
      if (!this.minimize) {
        backdrop.addEventListener('click', this.closeRightDrawer)
        //document.addEventListener('click', this.rightDrawerCloseListener, true)
      } else {
        backdrop.addEventListener('click', this.closeRightDrawer)
      }
      backdrop.className = 'c-sidebar-backdrop c-show'
      backdrop.id = this._uid + 'backdrop'
      document.body.appendChild(backdrop)
    },
    removeBackdrop () {
      const backdrop = document.getElementById(this._uid + 'backdrop')
      
      if (backdrop) { 
        //document.removeEventListener('click', this.rightDrawerCloseListener)
        backdrop.removeEventListener('click', this.closeRightDrawer)
        document.body.removeChild(backdrop)
      }
    }
  }
}
</script>