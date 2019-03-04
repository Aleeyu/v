<template>
  <div :class="[prefixCls, disabled ? `${prefixCls}-disabled` : '', type !== 'input' ? `${prefixCls}-btn` : '']"
       v-clickoutside="handleClose">
    <div ref="reference" :class="[prefixCls + '-rel']">
      <slot v-if="type === 'input'">
        <Input
          :class="[prefixCls + '-editor']"
          :readonly="true"
          :disabled="disabled"
          :size="size"
          :placeholder="placeholder"
          :value="value"
          @on-focus="handleFocus">
        </Input>
        <div :class="[prefixCls + '-preview']" style="width: 12px; height: 12px; border: rgba(0,0,0,.1) solid 1px;"
             :style="{backgroundColor: value}"></div>
        <Icon :type="icon" :class="[prefixCls + '-arrow']"></Icon>
      </slot>
      <slot v-if="type !== 'input'">
        <Button :disabled="disabled" :icon="icon" :size="size" :type="type" @click="handleClick">
          <div :class="[prefixCls + '-preview']" style="border: rgba(0,0,0,.1) solid 1px;"
               :style="{backgroundColor: value}"></div>
        </Button>
      </slot>
    </div>

    <input type="color"
           ref="html5Color"
           v-model="html5Color"
           v-on:change="updateValue(html5Color)">

    <transition :name="transition">
      <Drop v-show="opened" :placement="placement" ref="drop" :class="[prefixCls + '-drop']">
        <div class="hd">
          <div class="colorView" v-bind:style="`background-color: ${hoverColor || value || defaultColor}`"></div>
          <Button size="small" type="ghost"
                  v-on:click="handleDefaultColor"
                  v-on:mouseover="hoverColor = defaultColor"
                  v-on:mouseout="hoverColor = null"
          >默认颜色
          </Button>
          <Button size="small" type="warning" @click="handleClear" v-if="clearable">清除</Button>
        </div>
        <div class="bd">
          <h4>主题颜色</h4>
          <ul>
            <li class="color-item" v-for="color in tColor"
                v-bind:style="{ backgroundColor: color }"
                v-on:mouseover="hoverColor = color"
                v-on:mouseout="hoverColor = null"
                v-on:click="updateValue(color)"></li>
          </ul>
          <ul>
            <li v-for="item in colorPanel">
              <ul>
                <li class="color-item"
                    v-for="color in item"
                    v-bind:style="{ backgroundColor: color }"
                    v-on:mouseover="hoverColor = color"
                    v-on:mouseout="hoverColor = null"
                    v-on:click="updateValue(color)"
                ></li>
              </ul>
            </li>
          </ul>
          <h4>标准颜色</h4>
          <ul>
            <li class="color-item"
                v-for="color in bColor"
                v-bind:style="{ backgroundColor: color }"
                v-on:mouseover="hoverColor = color"
                v-on:mouseout="hoverColor = null"
                v-on:click="updateValue(color)"
            ></li>
          </ul>
          <h4 v-on:click="triggerHtml5Color">更多颜色...</h4>
        </div>
      </Drop>
    </transition>
  </div>
</template>

<script>
  import iInput from 'iview/src/components/input/input.vue'
  import Drop from 'iview/src/components/select/dropdown.vue'
  import clickoutside from 'iview/src/directives/clickoutside'
  import {oneOf} from 'iview/src/utils/assist'
  import Emitter from 'iview/src/mixins/emitter'

  const prefixCls = 'ivu-color-picker'

  export default {
    name: 'ColorPicker',
    mixins: [Emitter],
    components: {iInput, Drop},
    directives: {clickoutside},
    props: {
      // 当前颜色值
      value: {
        type: String,
        required: true
      },
      type: {
        type: String,
        default: 'input',
        validator (value) {
          return oneOf(value, ['input', 'primary', 'ghost', 'dashed', 'text', 'info', 'success', 'warning', 'error']);
        }
      },
      icon: {
        type: String,
        default: 'paintbucket'
      },
      // 默认颜色
      defaultColor: {
        type: String,
        default: '#000000'
      },
      readonly: {
        type: Boolean,
        default: false
      },
      disabled: {
        type: Boolean,
        default: false
      },
      editable: {
        type: Boolean,
        default: true
      },
      clearable: {
        type: Boolean,
        default: true
      },
      confirm: {
        type: Boolean,
        default: false
      },
      open: {
        type: Boolean,
        default: null
      },
      size: {
        validator (value) {
          return oneOf(value, ['small', 'large']);
        }
      },
      placeholder: {
        type: String,
        default: ''
      },
      placement: {
        validator (value) {
          return oneOf(value, ['top', 'top-start', 'top-end', 'bottom', 'bottom-start', 'bottom-end', 'left', 'left-start', 'left-end', 'right', 'right-start', 'right-end']);
        },
        default: 'bottom-start'
      },
      options: {
        type: Object
      }
    },
    data () {
      return {
        prefixCls: prefixCls,
        showClose: false,
        visible: false,
        hoverColor: null,
        // 主题颜色
        tColor: ['#000000', '#ffffff', '#eeece1', '#1e497b', '#4e81bb', '#e2534d', '#9aba60', '#8165a0', '#47acc5', '#f9974c'],
        // 颜色面板
        colorConfig: [
          ['#7f7f7f', '#f2f2f2'],
          ['#0d0d0d', '#808080'],
          ['#1c1a10', '#ddd8c3'],
          ['#0e243d', '#c6d9f0'],
          ['#233f5e', '#dae5f0'],
          ['#632623', '#f2dbdb'],
          ['#4d602c', '#eaf1de'],
          ['#3f3150', '#e6e0ec'],
          ['#1e5867', '#d9eef3'],
          ['#99490f', '#fee9da']
        ],
        // 标准颜色
        bColor: ['#c21401', '#ff1e02', '#ffc12a', '#ffff3a', '#90cf5b', '#00af57', '#00afee', '#0071be', '#00215f', '#72349d'],
        html5Color: this.value
      }
    },
    computed: {
      opened () {
        return this.open === null ? this.visible : this.open;
      },
      transition () {
        if (this.placement === 'bottom-start' || this.placement === 'bottom' || this.placement === 'bottom-end') {
          return 'slide-up';
        } else {
          return 'slide-down';
        }
      },
      // 颜色面板
      colorPanel () {
        let colorArr = []
        for (let color of this.colorConfig) {
          colorArr.push(this.gradient(color[1], color[0], 5))
        }
        return colorArr
      }
    },
    methods: {
      handleClose () {
        if (this.open !== null) return;
        this.visible = false;
      },
      handleFocus () {
        if (this.readonly) return;
        this.visible = true;
      },
      handleClick () {
        if (this.readonly) return
        this.visible = !this.visible
      },
      handleIconClick () {
        if (this.showClose) {
          this.handleClear();
        } else if (!this.disabled) {
          this.handleFocus();
        }
      },
      handleClear () {
        this.updateValue('')
        this.$emit('on-clear');
      },
      triggerHtml5Color () {
        this.$refs.html5Color.value = this.value;
        this.$refs.html5Color.click()
      },
      // 更新组件的值 value
      updateValue (value) {
        value = value.toUpperCase()
        this.$emit('input', value)
        this.$emit('change', value)
        this.visible = false
        this.dispatch('FormItem', 'on-form-change', value)
      },
      // 设置默认颜色
      handleDefaultColor () {
        this.updateValue(this.defaultColor)
      },
      // 格式化 hex 颜色值
      parseColor (hexStr) {
        if (hexStr.length === 4) {
          hexStr = '#' + hexStr[1] + hexStr[1] + hexStr[2] + hexStr[2] + hexStr[3] + hexStr[3]
        } else {
          return hexStr
        }
      },
      // RGB 颜色 转 HEX 颜色
      rgbToHex (r, g, b) {
        let hex = ((r << 16) | (g << 8) | b).toString(16)
        return '#' + new Array(Math.abs(hex.length - 7)).join('0') + hex
      },
      // HEX 转 RGB 颜色
      hexToRgb (hex) {
        hex = this.parseColor(hex)
        let rgb = []
        for (let i = 1; i < 7; i += 2) {
          rgb.push(parseInt('0x' + hex.slice(i, i + 2)))
        }
        return rgb
      },
      // 计算渐变过渡颜色
      gradient (startColor, endColor, step) {
        // 讲 hex 转换为 rgb
        let sColor = this.hexToRgb(startColor)
        let eColor = this.hexToRgb(endColor)

        // 计算R\G\B每一步的差值
        let rStep = (eColor[0] - sColor[0]) / step
        let gStep = (eColor[1] - sColor[1]) / step
        let bStep = (eColor[2] - sColor[2]) / step

        let gradientColorArr = []
        // 计算每一步的hex值
        for (let i = 0; i < step; i++) {
          gradientColorArr.push(this.rgbToHex(parseInt(rStep * i + sColor[0]), parseInt(gStep * i + sColor[1]), parseInt(bStep * i + sColor[2])))
        }
        return gradientColorArr
      }
    },
    watch: {
      visible (val) {
        if (val) {
          this.$refs.drop.update();
          if (this.open === null) this.$emit('on-open-change', true);
        } else {
          if (this.picker) this.picker.resetView && this.picker.resetView(true);
          this.$refs.drop.destroy();
          if (this.open === null) this.$emit('on-open-change', false);
        }
      },
      open (val) {
        if (val === true) {
          this.visible = val;
          this.$emit('on-open-change', true);
        } else if (val === false) {
          this.$emit('on-open-change', false);
        }
      }
    },
    mounted () {
      if (this.open !== null) this.visible = this.open;
    }
  }
</script>
