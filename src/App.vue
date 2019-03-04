<template>
  <div id="app">
    <router-view></router-view>
    <Modal id="app-signinpanel-mini" v-model="needSignin" :closable="false" :mask-closable="false" class-name="mini">
      <signinpanel :mini="true" @signed="signed"></signinpanel>
      <div slot="footer"></div>
    </Modal>
    <div id="app-loading" :class="{show: loading}">
      <div id="app-loading-inner">
        <Spin></Spin>
        <b>LOADING</b>
      </div>
    </div>
  </div>
</template>

<script>
  import signinpanel from '@/components/common/SigninPanel'

  export default {
    name: 'app',
    components: {signinpanel},
    data () {
      return {
        needSignin: false,
        loading: false
      }
    },
    methods: {
      signin: function () {
        this.needSignin = true
      },
      signed: function () {
        this.needSignin = false
      },
      cancelSignin: function () {
        this.needSignin = false
      },
      showLoading: function () {
        this.loading = true
      },
      hideLoading: function () {
        this.loading = false
      }
    },
    watch: {
      needSignin: function (v) {
        window.localStorage.setItem('globalNeedSignin', v)
      }
    }
  }
</script>

<style lang="less">
  body, html, #app {
    word-break: break-all;
  }

  .ivu-color-picker {
    > input {
      display: none;
    }

    &-disabled {
      .ivu-color-picker-preview {
        opacity: .2;
      }
    }

    &-btn {
      display: inline-block;
      vertical-align: middle;

      .ivu-color-picker-rel > button {
        position: relative;

        .ivu-color-picker-preview {
          bottom: 8px;
          margin: 0;
          top: auto;
          left: 8px;
          width: 16px;
          height: 3px;
        }
      }
    }
  }

  .ivu-color-picker-rel {
    .ivu-input {
      padding-left: 24px;
      padding-right: 24px;
    }

    .ivu-color-picker-arrow {
      position: absolute;
      top: 50%;
      right: 8px;
      line-height: 1;
      margin-top: -7px;
      font-size: 14px;
      color: #80848f;
      transition: all .2s ease-in-out;
      pointer-events: none;
    }

    .ivu-color-picker-preview {
      position: absolute;
      top: 50%;
      left: 8px;
      line-height: 1;
      margin-top: -6px;
      color: #80848f;
      transition: all .2s ease-in-out;
      pointer-events: none;
    }
  }

  .ivu-color-picker-drop {
    width: 180px;
    max-height: 280px;
    white-space: normal;

    .hd {
      padding: 0 12px;
      white-space: nowrap;

      .colorView {
        width: 24px;
        height: 24px;
        border-radius: 2px;
        border: rgba(0, 0, 0, .1) solid 1px;
        display: inline-block;
        vertical-align: middle;
        transition: background-color 275ms;
      }
    }

    .bd {
      padding: 0 10px;

      h4 {
        padding: 0 2px;
        color: #80848f;
      }

      ul {
        line-height: normal;
        list-style: none;
        margin: 0;
        padding: 0;
      }

      li {
        display: inline-block;
        width: 12px;
        height: 12px;
        margin: 0 2px;

        > ul > li {
          margin: 0;
        }
      }

      li.color-item {
        transition: all 275ms;
        border-radius: 1px;
        cursor: pointer;

        &:hover {
          transform: scale(1.3);
          box-shadow: 0 0 3px rgba(0, 0, 0, .6);
        }
      }
    }
  }

  .ivu-html-editor {
    border: #dddee1 solid 1px;
    border-radius: 4px;

    &-comm {
      background-color: #f8f8f9;
      position: relative;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;

      &:after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 1px;
        background-color: #dddee1;
      }

      button.comm-item,
      .ivu-color-picker-rel > button {
        padding: 2px 6px;
        border-radius: 2px;
        margin: 0;
      }

      button.ivu-btn-ghost {
        background-color: rgba(0, 0, 0, .1);

        &:hover {
          background-color: transparent;
        }
      }

      .ivu-select-placeholder {
        height: auto !important;
        line-height: 1 !important;
      }

      .ivu-select-selection {
        border: none !important;
        background-color: transparent;
        box-shadow: none !important;
        height: auto !important;
        padding: 6px 0 !important;
        margin: 3px 0 !important;
      }

      .ivu-select-selected-value {
        height: auto !important;
        line-height: 1 !important;
      }

      .ivu-select .ivu-select-dropdown {
        width: auto !important;
      }

      div.comm-group {
        border: #dddee1 solid 1px;
        border-width: 1px 1px 1px 0;
        margin-top: -1px;
        padding: 0 3px;
        white-space: nowrap;
      }
    }

    &-disabled {
      .ivu-html-editor-content {
        background-color: #f3f3f3;
      }
    }

    &-content {
      position: relative;

      .count {
        position: absolute;
        bottom: 0;
        right: 0;
        padding: 0 5px;
        background-color: #80848f;
        border-radius: 4px 0 0 0;
        color: white;
        opacity: .6;
        transition: opacity 275ms;

        &:hover {
          opacity: 1;
        }
      }
    }

    .ivu-color-picker-btn .ivu-color-picker-preview {
      bottom: 2px !important;
      left: 6px !important;
      width: 15px !important;
    }
  }

  textarea.ivu-input {
    resize: none;
  }

  .ivu-select-selected-value {
    text-overflow: clip;
  }

  .ivu-form-item-required .ivu-form-item-label:before {
    display: none !important;
  }

  .ivu-table-wrapper {
    margin: 20px 0;

    .ivu-table-cell {
      margin: 10px 0;
    }
  }

  .ivu-table-no-border {
    border: none;

    > .ivu-table {
      &:after, &:before {
        display: none !important;
      }

      tr:last-of-type td {
        border-bottom: none;
      }
    }
  }

  .ivu-table-banner {
    margin-bottom: -21px;
    border: #dddee1 solid 1px;
    padding: 10px;
    background-color: #f8f8f9;
    border-radius: 2px 2px 0 0;
  }

  .ivu-table-column-editable .ivu-table-cell {
    margin: 0 4px 0 0;
    padding: 0;
    overflow: visible;
  }

  .v-table {
    display: table;
    border-collapse: collapse;
    width: 100%;

    > * {
      display: table-cell;
    }
  }

  .v-top {
    vertical-align: top;
  }

  .v-bottom {
    vertical-align: bottom;
  }

  .v-middle {
    vertical-align: middle;
  }

  .v-inline > * {
    display: inline-block;
    vertical-align: middle;
  }

  .v-inline-top > * {
    vertical-align: top;
  }

  .v-inline-bottom > * {
    vertical-align: bottom;
  }

  .v-inline-end {
    text-align: right;
  }

  .clear-both {
    clear: both;
  }

  .ivu-form-label-top .ivu-form-item-label {
    padding: 0 0 5px 0;
  }

  #app-signinpanel-mini .ivu-modal-footer {
    display: none !important;
  }

  @keyframes loading-fade-in {
    0% {
      height: 100%;
      opacity: 0;
    }

    50% {
      height: 100%;
      opacity: 0;
    }

    100% {
      height: 100%;
      opacity: 1;
    }
  }

  #app-loading {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 0;
    opacity: 0;
    overflow: hidden;
    z-index: 999999;
    background-color: rgba(0, 0, 0, .2);

    &.show {
      height: 100%;
      opacity: 1;
      animation: loading-fade-in 275ms;
    }
  }

  #app-loading-inner {
    position: absolute;
    text-align: center;
    top: 37.5%;
    left: 50%;
    width: 120px;
    height: 64px;
    padding: 1rem 0;
    background-color: white;
    margin-left: -60px;
    border-radius: .2rem;
    box-shadow: 0 0 5px rgba(0, 0, 0, .1);
    display: flex;
    flex-direction: column;
    align-items: center;

    .ivu-spin {
      margin-bottom: 5px;
    }

    b {
      display: block;
      letter-spacing: .4rem;
      margin-left: .4rem;
      font-size: 12px;
      font-weight: normal;
      transform: scale(.8);
      color: #bbbec4;
    }
  }
</style>
