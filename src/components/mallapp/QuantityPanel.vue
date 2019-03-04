<template>
  <v-touch class="app-quantity-panel" ref="root" @press="press($event)">
    <Button icon="minus" :disabled="value <= 1" @click.stop="minus"></Button>
    <input type="text" v-model="value" @focus="openFullScreen($event)" readonly/>
    <Button icon="plus" @click.stop="plus"></Button>

    <transition name="fade">
      <div class="app-quantity-panel app-quantity-panel-full" v-show="fullscreen">
        <div class="app-quantity-panel-full-inner" @click.stop>
          <h1>修改购买数量</h1>
          <div class="app-quantity-panel app-quantity-panel-big">
            <Button icon="minus" :disabled="tmpValue <= 1" @click.stop="minus1"></Button>
            <input type="number" v-model="tmpValue"/>
            <Button icon="plus" @click.stop="plus1"></Button>
          </div>
          <div class="app-menus">
            <Button @click="cancel">取消</Button>
            <Button class="primary" @click="apply">确定</Button>
          </div>
        </div>
      </div>
    </transition>
  </v-touch>
</template>

<script>
  import Emitter from 'iview/src/mixins/emitter'

  export default {
    mixins: [Emitter],
    data () {
      return {
        tmpValue: 0,
        fullscreen: false
      }
    },
    props: {
      value: {
        type: Number,
        default: 1
      },
      max: {
        type: Number,
        default: null
      },
      root: Object
    },
    methods: {
      updateValue: function (value) {
        if (value == null || isNaN(value) || value <= 0) {
          value = 1
        }

        if (this.max != null && !isNaN(this.max) && this.max >= 0 && value > this.max) {
          value = this.max
        }

        this.$emit('input', value)
        this.$emit('change', value)
        this.dispatch('FormItem', 'on-form-change', value)
      },
      minus: function () {
        this.updateValue(this.value - 1)
      },
      plus: function () {
        this.updateValue(this.value + 1)
      },
      minus1: function () {
        this.tmpValue--
      },
      plus1: function () {
        this.tmpValue++
      },
      apply: function () {
        this.updateValue(Number(this.tmpValue) || this.value || 1)
        this.cancel()
      },
      cancel: function () {
        window.history.back()
      },
      openFullScreen: function (evt) {
        this.tmpValue = this.value
        this.fullscreen = true
        evt.target.blur()
        this.root.modalIncepter(this.closeFullScreen)
      },
      closeFullScreen: function () {
        this.fullscreen = false
      },
      press: function (evt) {
        this.$emit('press', evt)
      }
    },
    watch: {
      $route: 'closeFullScreen'
    }
  }
</script>

<style lang="less">
  .app-quantity-panel {
    display: flex;
    flex-direction: row;
    position: relative;

    &:after {
      pointer-events: none;
      width: 300%;
      height: 300%;
      border: #dddee1 solid 1px;
      border-radius: .6rem;
      position: absolute;
      top: 0;
      left: 0;
      transform-origin: 0 0;
      transform: scale(.33333);
      content: '';
    }

    button {
      padding: .5rem;
      font-size: 1rem;
      line-height: 1rem;
      position: relative;
      border: none;

      &:after {
        position: absolute;
        content: '';
        width: 1px;
        height: 100%;
        background-color: #dddee1;
        top: 0;
        transform: scaleX(.33);
      }

      &:disabled {
        color: #bbbec4;
      }

      &:first-of-type {
        border-radius: .2rem 0 0 .2rem;

        &:after {
          right: 0;
          transform-origin: 100% 0;
        }
      }

      &:last-of-type {
        border-radius: 0 .2rem .2rem 0;

        &:after {
          left: 0;
          transform-origin: 0 0;
        }
      }
    }

    input {
      border: none;
      text-align: center;
      width: 3rem;
      font-size: 1rem;
      height: auto;
      line-height: 1rem;
    }

    &-full {
      background-color: rgba(0, 0, 0, .2);
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 200;
      display: flex;
      justify-content: center;
      align-items: center;

      &-inner {
        width: 80%;
        background-color: white;
        display: flex;
        flex-direction: column;
        align-items: center;
        border-radius: .3rem;
        overflow: hidden;

        h1 {
          font-size: 1.2rem;
          line-height: 4rem;
        }

        .app-menus {
          align-self: stretch;

          button {
            padding: 1rem;
            height: auto;
            border-radius: 0;
            border: none;

            > span {
              font-size: 1rem;
            }
          }
        }
      }
    }

    &-big {
      margin-bottom: 1.5rem;

      button {
        font-size: 1.5rem;
        padding: .8rem 1rem;
      }

      input {
        font-size: 1.5rem;
        width: 8rem;
      }
    }
  }
</style>
