<template>
  <div ref="listPanel">
    <div ref="listBox" class="app-list-body" :class="{'app-list-body-disabled': clacable || refreshing}"
         @scroll="scroll">
      <slot name="items"></slot>
      <Button type="text" long size="large" class="app-list-more" v-if="pageable" :disabled="busy || refreshing"
              @click="loadMore">{{(busy || refreshing) ? '加载中...' : '点击加载更多'}}
      </Button>
    </div>
    <div ref="listRefresh" class="app-list-refresh" :style="{height: distance + 'px'}">
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" amlns:xlink="http://www.w3.org/1999/xlink"
           class="app-list-refresh-icon" :class="{'app-list-refresh-icon-run': refreshing}" viewBox="0 0 48 48"
           width="48px" height="48px"
           :style="{transform: `rotate(${360 * (distance / refreshDistance)}deg)`}">
        <circle stroke="#2d8cf0" stroke-width="5" cx="24" cy="24" r="16" fill="transparent"
                :stroke-dasharray="`${90 * (distance / refreshDistance)}, 100`"></circle>
        <path d="M24,0 L24,16 36,8z" fill="#2d8cf0"
              :transform="`rotate(${(20 + 90 * (distance / refreshDistance)) * 360 / 100}, 24, 24)`"></path>
      </svg>
    </div>
    <slot name="anchor"></slot>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        distance: 0,
        startDistance: 0,
        clacable: false,
        isRefreshable: false,
        refreshing: false,
        checkFigner: false,
        busy: false
      }
    },
    props: {
      refreshable: {
        type: Boolean,
        default: true
      },
      pageable: {
        type: Boolean,
        default: true
      },
      refreshDistance: {
        type: Number,
        default: 80
      }
    },
    methods: {
      scroll: function (e) {
        if (!this.refreshing && !this.clacable) {
          this.$emit('scroll', e)
        }
      },
      getElement: function () {
        return this.$refs.listBox
      },
      touchStart: function (e) {
        if (!this.refreshing) {
          this.$refs.listRefresh.classList.remove('cancel')
          this.clacable = false
          this.checkFigner = false
          this.isRefreshable = false
          if (this.refreshable && e.targetTouches.length === 1 && this.$refs.listBox.scrollTop === 0) {
            this.isRefreshable = true
            this.distance = 0
            this.startDistance = e.targetTouches[0].pageY
          }
        }
      },
      touchMove: function (e) {
        if (!this.refreshing && this.isRefreshable) {
          if (e.targetTouches.length === 1) {
            if (this.checkFigner === false && e.targetTouches[0].pageY > this.startDistance) {
              this.clacable = true
            }
            this.checkFigner = true
            if (this.refreshable && this.clacable) {
              let distance = e.targetTouches[0].pageY - this.startDistance
              if (distance < 0) distance = 0
              if (distance > this.refreshDistance) distance = this.refreshDistance
              this.distance = distance
            }
          }
        }
      },
      touchEnd: function (e) {
        this.clacable = false
        this.checkFigner = false
        this.isRefreshable = false
        if (this.distance === this.refreshDistance) {
          this.refreshing = true
          this.$emit('refresh', () => {
            this.refreshing = false
            this.$refs.listRefresh.classList.add('cancel')
            this.distance = 0
          })
        } else {
          this.$refs.listRefresh.classList.add('cancel')
          this.distance = 0
        }
      },
      loadMore: function () {
        this.busy = true
        this.$emit('nextpage', () => {
          this.busy = false
        })
      }
    },
    mounted () {
      this.$refs.listPanel.addEventListener('touchstart', this.touchStart)
      this.$refs.listPanel.addEventListener('touchmove', this.touchMove)
      this.$refs.listPanel.addEventListener('touchend', this.touchEnd)
    }
  }
</script>

<style lang="less">
  @keyframes app-refresh-icon-run-fn {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .app-list-body {
    flex-grow: 1;
    flex-shrink: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;

    &-disabled {
      overflow-y: hidden;
    }
  }

  .app-list-refresh {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;

    &.cancel {
      transition: height 500ms;
    }

    &-icon {
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 50%;
      padding: .5rem;
      background-color: white;
      box-shadow: 0 0 .5rem rgba(0, 0, 0, .2);
      margin-bottom: .5rem;

      &-run {
        animation-name: app-refresh-icon-run-fn;
        animation-duration: 1s;
        animation-iteration-count: infinite;
      }
    }
  }

  .app-list-more {
    font-size: .8rem;
    padding: .8rem 1rem 1rem 1rem;
    height: auto;
    line-height: normal;
  }
</style>
