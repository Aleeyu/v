<template>
  <div :class="[prefixCls, readOnly ? `${prefixCls}-readonly` : '', disabled ? `${prefixCls}-disabled` : '']">
    <div :class="[prefixCls + '-comm']" v-if="!disabled">
      <div class="comm-group">
        <Tooltip content="源码" placement="top">
          <Button @click="isCodeMode = !isCodeMode" icon="code" :type="isCodeMode ? 'ghost' : 'text'" :size="size"
                  class="comm-item"></Button>
        </Tooltip>
      </div>

      <div class="comm-group" v-show="showItem">
        <Tooltip content="撤消" placement="top">
          <Button @click="execute('undo')" icon="undo" type="text" :size="size"
                  :disabled="!hasChange || unoperable.undo"
                  class="comm-item"></Button>
        </Tooltip>
        <Tooltip content="重做" placement="top">
          <Button @click="execute('redo')" icon="redo" type="text" :size="size"
                  :disabled="!hasChange || unoperable.redo"
                  class="comm-item"></Button>
        </Tooltip>
      </div>

      <div class="comm-group" v-show="showItem">
        <Tooltip content="样式" placement="top">
          <Select v-model="range.className" @on-change="changeStyle" placeholder="样式" :disabled="!range.enable">
            <Option value="global-html-editor-title"
                    :style="{fontSize: `${calcFontSize(16)}${fontSizeUnit}`, fontWeight: 'bold'}">标题
            </Option>
            <Option value="global-html-editor-title1"
                    :style="{fontSize: `${calcFontSize(12)}${fontSizeUnit}`, fontWeight: 'bold'}">标题 1
            </Option>
            <Option value="global-html-editor-title2"
                    :style="{fontSize: `${calcFontSize(10.5)}${fontSizeUnit}`, fontWeight: 'bold'}">标题 2
            </Option>
          </Select>
        </Tooltip>
        <Tooltip content="字号" placement="top">
          <Select v-model="range.fontSize" @on-change="changeFontSize" placeholder="字号" style="width: 70px;"
                  :disabled="unoperable.fontSize">
            <Option :value="9">9</Option>
            <Option :value="10">10</Option>
            <Option :value="10.5">10.5</Option>
            <Option :value="11">11</Option>
            <Option :value="12">12</Option>
            <Option :value="14">14</Option>
            <Option :value="16">16</Option>
            <Option :value="18">18</Option>
            <Option :value="20">20</Option>
            <Option :value="22">22</Option>
            <Option :value="24">24</Option>
            <Option :value="26">26</Option>
            <Option :value="28">28</Option>
            <Option :value="36">36</Option>
          </Select>
        </Tooltip>

        <Tooltip content="居左对齐" placement="top">
          <Button @click="execute('justifyLeft')" icon="align-left" :type="range.alignLeft ? 'ghost' : 'text'"
                  :size="size"
                  class="comm-item"></Button>
        </Tooltip>

        <Tooltip content="居中对齐" placement="top">
          <Button @click="execute('justifyCenter')" icon="align-center" :type="range.alignCenter ? 'ghost' : 'text'"
                  :size="size"
                  class="comm-item"></Button>
        </Tooltip>

        <Tooltip content="居右对齐" placement="top">
          <Button @click="execute('justifyRight')" icon="align-right" :type="range.alignRight ? 'ghost' : 'text'"
                  :size="size"
                  class="comm-item"></Button>
        </Tooltip>

        <Tooltip content="两端对齐" placement="top">
          <Button @click="execute('justifyFull')" icon="align-justify" :type="range.alignJustify ? 'ghost' : 'text'"
                  :size="size"
                  class="comm-item"></Button>
        </Tooltip>
      </div>

      <div class="comm-group" v-show="showItem">
        <Tooltip content="加粗" placement="top">
          <Button @click="execute('bold')" icon="bold" :type="range.bold ? 'ghost' : 'text'" :size="size"
                  class="comm-item"></Button>
        </Tooltip>
        <Tooltip content="斜体" placement="top">
          <Button @click="execute('italic')" icon="italic" :type="range.italic ? 'ghost' : 'text'" :size="size"
                  class="comm-item"></Button>
        </Tooltip>
        <Tooltip content="下划线" placement="top">
          <Button @click="execute('underline')" icon="underline" :type="range.underline ? 'ghost' : 'text'"
                  :size="size" class="comm-item"></Button>
        </Tooltip>
        <Tooltip content="删除线" placement="top">
          <Button @click="execute('strikeThrough')" icon="strikethrough"
                  :type="range.strikeThrough ? 'ghost' : 'text'" :size="size" class="comm-item"></Button>
        </Tooltip>
        <Tooltip content="上标" placement="top">
          <Button @click="execute('superscript')" icon="superscript"
                  :type="range.superscript ? 'ghost' : 'text'" :size="size" class="comm-item"></Button>
        </Tooltip>
        <Tooltip content="下标" placement="top">
          <Button @click="execute('subscript')" icon="subscript"
                  :type="range.subscript ? 'ghost' : 'text'" :size="size" class="comm-item"></Button>
        </Tooltip>
      </div>

      <div class="comm-group" v-show="showItem">
        <Tooltip content="文本颜色" placement="top">
          <color-picker v-model="range.foreColor" icon="font" @change="changeForeColor" type="text" class="comm-item"
                        :size="size"
                        :disabled="range.length === 0"></color-picker>
        </Tooltip>
        <Tooltip content="背景色" placement="top">
          <color-picker v-model="range.backColor" icon="font-back" @change="changeBackColor" type="text"
                        class="comm-item" :size="size"
                        :disabled="range.length === 0"></color-picker>
        </Tooltip>
      </div>

      <div class="comm-group" v-show="showItem">
        <Tooltip content="编号列表" placement="top">
          <Button @click="execute('insertOrderedList')" icon="ol"
                  :type="range.ol ? 'ghost' : 'text'" :size="size" class="comm-item"></Button>
        </Tooltip>
        <Tooltip content="项目列表" placement="top">
          <Button @click="execute('insertUnorderedList')" icon="ul"
                  :type="range.ul ? 'ghost' : 'text'" :size="size" class="comm-item"></Button>
        </Tooltip>
        <Tooltip content="减少缩进量" placement="top">
          <Button @click="execute('outdent')" icon="dedent" type="text" :size="size" class="comm-item"></Button>
        </Tooltip>
        <Tooltip content="增加缩进量" placement="top">
          <Button @click="execute('indent')" icon="indent" type="text" :size="size" class="comm-item"></Button>
        </Tooltip>
      </div>

      <div class="comm-group" v-show="showItem">
        <Tooltip content="语法检查" placement="top" v-show="spellcheck != null">
          <Button @click="spellcheckable = !spellcheckable" :type="spellcheckable ? 'ghost' : 'text'" :size="size"
                  class="comm-item"
                  icon="spellcheck"></Button>
        </Tooltip>
        <Tooltip content="清除样式" placement="top">
          <Button @click="execute('removeFormat')" type="text" :size="size" class="comm-item"
                  :disabled="range.length === 0" icon="erase"></Button>
        </Tooltip>
      </div>

    </div>
    <div :class="[prefixCls + '-content']" :style="{height: height + 'px'}">
      <iframe ref="html-editor-iframe" frameborder="0" allowtransparency="true"
              style="width: 100%; height: 100%;"></iframe>

      <div class="count" v-show="showCount && !isCodeMode">字数: {{ count }}</div>
    </div>
  </div>
</template>

<script>
  import ColorPicker from '@/components/common/ColorPicker'
  import {oneOf} from 'iview/src/utils/assist'
  import Emitter from 'iview/src/mixins/emitter'

  const prefixCls = 'ivu-html-editor'
  const fontSizeMaps = {
    supports: ['small', 'medium', 'large', 'x-large', 'xx-large'],
    px: {
      '9': 12,
      '10': 13,
      '10.5': 14,
      '11': 15,
      '12': 16,
      '14': 19,
      '16': 22,
      '18': 24,
      '20': 26,
      '22': 29,
      '24': 32,
      '26': 35,
      '28': 37,
      '36': 48
    },
    rem: {
      '9': 0.75,
      '10': 0.8,
      '10.5': 0.875,
      '11': 0.95,
      '12': 1,
      '14': 1.2,
      '16': 1.4,
      '18': 1.5,
      '20': 1.6,
      '22': 1.8,
      '24': 2,
      '26': 2.2,
      '28': 2.3,
      '36': 3
    }
  }

  export default {
    name: 'HtmlEditor',
    mixins: [Emitter],
    components: {ColorPicker},
    data () {
      return {
        frame: null,
        document: null,
        body: null,
        isCodeMode: false,
        showItem: true,
        hasChange: false,
        count: 0,
        defaultFontSize: 10.5,
        spellcheckable: this.spellcheck,
        unoperable: {
          undo: true,
          redo: true,
          fontSize: true
        },
        range: {
          eanble: false,
          length: 0,
          fontSize: 12,
          foreColor: this.foreColor,
          backColor: this.backColor,
          bold: false,
          italic: false,
          underline: false,
          strikeThrough: false,
          superscript: false,
          subscript: false,
          ol: false,
          ul: false,
          alignLeft: false,
          alignCenter: false,
          alignRight: false,
          alignJustify: false
        },
        prefixCls: prefixCls
      }
    },
    props: {
      value: {
        type: String,
        required: true
      },
      size: {
        validator (value) {
          return oneOf(value, ['small', 'large']);
        }
      },
      height: {
        type: Number,
        default: 200
      },
      readOnly: {
        type: Boolean,
        default: false
      },
      disabled: {
        type: Boolean,
        default: false
      },
      codeMode: {
        type: Boolean,
        default: false
      },
      foreColor: {
        type: String,
        default: '#495060',
        validator (value) {
          return value == null || value === '' || /^#[0-9a-f]{6}$/i.test(value)
        }
      },
      backColor: {
        type: String,
        default: '',
        validator (value) {
          return value == null || value === '' || /^#[0-9a-f]{6}$/i.test(value)
        }
      },
      fontSizeUnit: {
        type: String,
        default: 'pt',
        validator (value) {
          return oneOf(value, ['pt', 'px', 'rem']);
        }
      },
      spellcheck: {
        type: Boolean,
        default: null
      },
      autoFocus: {
        type: Boolean,
        default: false
      },
      showCount: {
        type: Boolean,
        default: true
      }
    },
    methods: {
      init: function () {
        this.isCodeMode = this.codeMode
        this.frame = this.$refs['html-editor-iframe']
        if (this.frame) {
          this.initStyles()
          this.document = this.frame.contentWindow.document
          if (this.document) {
            this.body = this.frame.contentWindow.document.body
            if (this.body) {
              this.updateReadOnly(this.readOnly)
              this.updateDisabled(this.disabled)
              this.updateSpellcheck(this.spellcheckable)
              this.updateMode(this.isCodeMode)
              this.updateUnoperable()
            }
          }
        }
      },
      initStyles: function () {
        let head = this.frame.contentWindow.document.head
        let fs = this.calcFontSize(this.defaultFontSize)
        let css = `
        html {
          font-size: 16px;
        }
        body {
          padding: 10px;
          margin: 0;
          font-size: ${fs}${this.fontSizeUnit};
          font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","\\5FAE\\8F6F\\96C5\\9ED1",Arial,sans-serif;
          line-height: 1.5;
          color: #495060;
        }
        body.disabled {
          color: #ccc;
        }
        body.disabled > * {
          opacity: .6;
        }
        a {
          color: #2d8cf0;
          text-decoration: none;
        }
        a:hover {
          color: #5cadff;
        }
        `

        let style = document.createElement('style')
        style.type = 'text/css';
        if (style.styleSheet) {
          style.styleSheet.cssText = css
        } else {
          style.appendChild(document.createTextNode(css))
        }

        head.appendChild(style)
      },
      dropCheck: function (e) {
        let able = true;
        if (e.dataTransfer.types) {
          for (let i = 0; i < e.dataTransfer.types.length; i++) {
            if (e.dataTransfer.types[i] === 'Files') {
              able = false
              break
            }
          }
        }

        if (able) {
          this.updateValue()
        } else {
          return false;
        }
      },
      clean: function (code) {
        // 防注入
        if (typeof code === 'string') {
          return code.replace(/<\s*\/?\s*(script|head|meta|html)[^<>]*>/ig, '')
        } else {
          return code || ''
        }
      },
      clickCheck: function () {
        document.body.click()
      },
      addListeners: function () {
        this.body.addEventListener('keyup', this.updateValue)
        this.body.addEventListener('click', this.clickCheck)
        this.body.addEventListener('drop', this.dropCheck)
        this.document.addEventListener('selectionchange', this.updateSelection)
      },
      removeListeners: function () {
        this.body.removeEventListener('keyup', this.updateValue)
        this.body.addEventListener('click', this.clickCheck)
        this.body.removeEventListener('drop', this.dropCheck)
        this.document.removeEventListener('selectionchange', this.updateSelection)
      },
      updateReadOnly: function (readonly) {
        if (this.body) {
          this.removeListeners()
          this.body.setAttribute('contenteditable', !readonly && !this.disabled)
          this.showItem = !readonly && !this.isCodeMode
          if (!readonly) {
            this.addListeners()
          }
        }
      },
      updateDisabled: function (disabled) {
        if (this.body) {
          this.removeListeners()
          this.body.setAttribute('contenteditable', !disabled && !this.readOnly)
          if (disabled) {
            this.body.classList.add('disabled')
          } else {
            this.body.classList.remove('disabled')
            this.addListeners()
          }
        }
      },
      updateMode: function (code) {
        if (this.body) {
          let v = this.clean(this.value)
          if (code) {
            this.body.innerText = v
          } else {
            this.body.innerHTML = v
            this.count = this.body.innerText.length
          }

          this.hasChange = false
          this.showItem = !code && !this.readOnly

          if (this.autoFocus) {
            this.body.focus()
          }
        }
      },
      updateSpellcheck: function (v) {
        if (this.body) {
          this.body.setAttribute('spellcheck', v === true)
        }
      },
      updateValue: function () {
        if (this.body) {
          this.hasChange = true
          let value = this.clean(this.isCodeMode ? this.body.innerText : this.body.innerHTML)

          this.$emit('input', value)
          this.$emit('change', value)
          this.visible = false
          this.dispatch('FormItem', 'on-form-change', value)

          this.updateUnoperable()
        }
      },
      updateSelection: function () {
        if (this.document) {
          let sel = this.frame.contentWindow.window.getSelection()
          if (sel.rangeCount) {
            this.range.enable = true

            let rng = sel.getRangeAt(0)
            this.range.length = Math.abs(rng.endOffset - rng.startOffset)
            this.range.bold = this.document.queryCommandState('bold')
            this.range.italic = this.document.queryCommandState('italic')
            this.range.underline = this.document.queryCommandState('underline')
            this.range.strikeThrough = this.document.queryCommandState('strikeThrough')
            this.range.superscript = this.document.queryCommandState('superscript')

            this.range.alignLeft = this.document.queryCommandState('justifyLeft')
            this.range.alignCenter = this.document.queryCommandState('justifyCenter')
            this.range.alignRight = this.document.queryCommandState('justifyRight')
            this.range.alignJustify = this.document.queryCommandState('justifyFull')

            this.range.ol = this.document.queryCommandState('insertOrderedList')
            this.range.ul = this.document.queryCommandState('insertUnorderedList')

            this.range.subscript = this.document.queryCommandState('subscript')
            this.range.foreColor = this.document.queryCommandValue('foreColor') || this.foreColor
            this.range.backColor = this.document.queryCommandValue('backColor') || this.backColor

            let el = rng.commonAncestorContainer;
            if (el.nodeType === 3) {
              el = el.parentNode
            }
            if (el) {
              let computedStyle = this.frame.contentWindow.window.getComputedStyle(el, null)
              this.range.fontSize = this.getFontSize(el.style.fontSize || computedStyle.fontSize)
            }

            this.updateUnoperable()
          } else {
            this.range.length = 0
            this.range.enable = false
          }

          this.body.focus()
        }
      },
      updateUnoperable: function () {
        if (this.document) {
          this.unoperable.undo = !this.document.queryCommandEnabled('undo')
          this.unoperable.redo = !this.document.queryCommandEnabled('redo')
          this.unoperable.fontSize = !this.document.queryCommandEnabled('fontSize')
        }
      },
      changeForeColor: function (color) {
        this.execute('ForeColor', false, color)
      },
      changeBackColor: function (color) {
        this.execute('BackColor', false, color)
      },
      changeStyle: function (classname) {
        let sel = this.frame.contentWindow.window.getSelection()
        if (sel && sel.rangeCount) {
          let rng = sel.getRangeAt(0)
          let el = rng.commonAncestorContainer
          if (el.nodeType === 3) {
            el = el.parentNode
          }

          if (el) {
            alert(classname)
          }
        }
      },
      changeFontSize: function (size) {
        let sel = this.frame.contentWindow.window.getSelection()
        if (sel && sel.rangeCount) {
          let text = sel.toString()
          if (text) {
            let rng = sel.getRangeAt(0)
            let el = rng.commonAncestorContainer
            if (el.nodeType === 3) {
              el = el.parentNode
            }

            let fs = this.calcFontSize(size)
            el.style.fontSize = fs + this.fontSizeUnit
          }
        }
      },
      getFontSize: function (fs) {
        let size = this.defaultFontSize

        if (fs) {
          let fo
          if (fs.indexOf('px') >= 0) {
            fo = fontSizeMaps.px
          } else if (fs.indexOf('rem') >= 0) {
            fo = fontSizeMaps.rem
          } else {
            size = parseFloat(fs)
          }

          fs = parseFloat(fs)
          if (this.$isPlainObject(fo)) {
            for (let k in fo) {
              if (fo[k] === fs) {
                size = parseFloat(k)
                break
              }
            }
          }
        }

        return size
      },
      calcFontSize: function (size) {
        let fs = size

        if (this.fontSizeUnit !== 'pt') {
          fs = fontSizeMaps[this.fontSizeUnit][fs]
        }
        return fs
      },
      execute: function () {
        this.document.execCommand(...arguments)
        this.$nextTick(() => {
          this.updateValue()
          this.updateSelection()
        })
      }
    },
    mounted () {
      this.init()
    },
    watch: {
      readOnly: 'updateReadOnly',
      disabled: 'updateDisabled',
      isCodeMode: 'updateMode',
      spellcheckable: 'updateSpellcheck'
    }
  }
</script>
