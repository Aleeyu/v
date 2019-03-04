<template>
  <div :class="classes" v-clickoutside="handleClose">

    <div :class="[prefixCls + '-selection']" ref="reference" @click="toggleMenu">
      <span :class="[prefixCls + '-placeholder']" v-show="showPlaceholder">{{ localePlaceholder }}</span>
      <span :class="[prefixCls + '-selected-value']" v-show="!showPlaceholder">{{ rawValue || unmatchText || '请选择'
        }}</span>
      <Icon type="ios-close" :class="[prefixCls + '-arrow']" v-show="showCloseIcon" @click.native.stop="clear"></Icon>
      <Icon type="chevron-right" :class="[prefixCls + '-arrow']"></Icon>
    </div>

    <transition :name="transitionName">
      <Drop v-show="visible" :placement="placement" ref="drop"
            :class="[prefixCls + '-drop', prefixCls + '-city-panel', searchable ? null : (prefixCls + '-nosearch')]"
            :style="dropStyles"
            @click.native="onPopClicked">
        <Input placeholder="请输入关键字" v-model.trim="keyword" :readonly="busy" style="width: 200px; margin-bottom: 10px;"
               v-if="searchable" :maxlength="10">
        <Button icon="search" @click="queryCities" :loading="busy" slot="append"></Button>
        </Input>

        <div class="levels" @click.stop="" @scroll.stop="">
          <div style="display: flex; flex-direction: column; min-width: 210px" class="flex provinces">
            <h5>省份/直辖市</h5>
            <div ref="provinceList" class="flex list">
              <div v-for="p in provinces" :key="p.id" @click.stop="loadCities(p)"
                   :class="{selected: p.id === selecting.province}">
                <span class="flex">{{ p.name }}</span>
                <Spin v-if="loading.city && p.id === selecting.province">
                  <Icon type="load-c" size=14         class="spin-icon-load" color="white"></Icon>
                </Spin>
                <Icon v-if="!leafOnly" :type="ids.indexOf(p.id) > -1 ? 'android-checkbox': 'android-checkbox-blank'"
                      :class="{checked: ids.indexOf(p.id) > -1}"
                      @click.native.stop="checkProvince(p)"></Icon>
              </div>
            </div>
          </div>

          <div style="display: flex; flex-direction: column;min-width: 210px" class="flex cities"
               v-if="selectingCities.length !== 0">
            <h5 v-if="mobile">{{ this.selecting.provinceName }}</h5>
            <h5 v-else>城市</h5>
            <div ref="cityList" class="flex list">
              <div v-for="p in selectingCities" :key="p.id" @click.stop="loadAreas(p)"
                   :class="{selected: p.id === selecting.city}">
                <span class="flex">{{ p.name }}</span>
                <Spin v-if="loading.area && p.id === selecting.city">
                  <Icon type="load-c" size=14         class="spin-icon-load" color="white"></Icon>
                </Spin>
                <Icon v-if="!leafOnly" :type="ids.indexOf(p.id) > -1 ? 'android-checkbox': 'android-checkbox-blank'"
                      :class="{checked: ids.indexOf(p.id) > -1}"
                      @click.native.stop="checkCity(p)"></Icon>
              </div>
            </div>
          </div>

          <div style="display: flex; flex-direction: column;min-width: 210px" class="flex areas"
               v-if="selectingAreas.length !== 0">
            <h5 v-if="mobile">{{ this.selecting.provinceName }} / {{ this.selecting.cityName }}</h5>
            <h5 v-else>区域</h5>
            <div ref="areaList" class="flex list">
              <div v-for="p in selectingAreas" :key="p.id" @click.stop="loadStreets(p)"
                   :class="{selected: p.id === selecting.area}">
                <span class="flex">{{ p.name }}</span>
                <Icon v-if="!leafOnly" :type="ids.indexOf(p.id) > -1 ? 'android-checkbox': 'android-checkbox-blank'"
                      :class="{checked: ids.indexOf(p.id) > -1}"
                      @click.native.stop="checkArea(p)"></Icon>
              </div>
            </div>
          </div>
        </div>
      </Drop>
    </transition>
  </div>
</template>

<script type="text/ecmascript-6">
  import iInput from 'iview/src/components/input/input.vue'
  import Drop from 'iview/src/components/select/dropdown.vue'
  import clickoutside from 'iview/src/directives/clickoutside'
  import {oneOf} from 'iview/src/utils/assist'
  import Emitter from 'iview/src/mixins/emitter'

  const prefixCls = 'ivu-select';

  export default {
    name: 'CityPicker',
    mixins: [Emitter],
    components: {iInput, Drop},
    directives: {clickoutside},
    data () {
      return {
        keyword: '',
        busy: false,
        prefixCls: prefixCls,
        visible: false,
        provinces: [],
        cities: [],
        areas: [],
        selectingCities: [],
        selectingAreas: [],
        touchStartPosition: 0,
        touchStartScroll: 0,
        touchTarget: null,
        loading: {
          city: false,
          area: false
        },
        selected: {
          province: null,
          provinceName: null,
          city: null,
          cityName: null,
          area: null,
          areaName: null
        },
        selecting: {
          province: null,
          provinceName: null,
          city: null,
          cityName: null,
          area: null,
          areaName: null
        },
        ids: this.multiple ? [] : '',
        names: this.multiple ? [] : ''
      }
    },
    props: {
      mobile: {
        type: Boolean,
        default: false
      },
      value: {
        type: [Array, String],
        default () {
          return this.multiple ? [] : ''
        }
      },
      province: String,
      city: String,
      area: String,
      provinceName: String,
      cityName: String,
      areaName: String,
      disableCity: {
        type: Boolean,
        default: false
      },
      disableArea: {
        type: Boolean,
        default: false
      },
      filterable: {
        type: Boolean,
        default: false
      },
      readonly: {
        type: Boolean,
        default: false
      },
      multiple: {
        type: Boolean,
        default: true
      },
      disabled: {
        type: Boolean,
        default: false
      },
      clearable: {
        type: Boolean,
        default: true
      },
      searchable: {
        type: Boolean,
        default: false
      },
      unmatchText: String,
      confirm: {
        type: Boolean,
        default: false
      },
      fullPath: {
        type: Boolean,
        default: false
      },
      open: {
        type: Boolean,
        default: null
      },
      leafOnly: {
        type: Boolean,
        default: false
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
      }
    },
    methods: {
      onPopClicked: function () {
        if (this.mobile) {
          this.visible = false
        }
      },
      toggleMenu () {
        if (this.disabled) {
          return false
        }
        this.visible = !this.visible
      },
      hideMenu () {
        this.visible = false
      },
      handleClose () {
        this.hideMenu();
      },
      clear: function () {
        this.ids = this.multiple ? [] : ''
        this.names = this.multiple ? [] : ''
        this.selecting.province = null
        this.selecting.city = null
        this.selecting.area = null
        this.selecting.provinceName = null
        this.selecting.cityName = null
        this.selecting.areaName = null
        this.selectingCities = []
        this.selectingAreas = []

        this.updateValue()
      },
      updateValue: function () {
        let value = this.multiple ? this.ids.map((id, inx) => {
          return {id: id, name: this.names[inx]}
        }) : this.ids

        this.$emit('input', value)
        this.$emit('change', value)
        if (!this.multiple) {
          this.selected = Object.assign({}, this.selecting)
          this.cities = this.selectingCities
          this.areas = this.selectingAreas
          this.$emit('select-changed', this.selected)
          this.$emit('update:province', this.selected.province)
          this.$emit('update:city', this.selected.city)
          this.$emit('update:area', this.selected.area)
          this.$emit('update:provinceName', this.selected.provinceName)
          this.$emit('update:cityName', this.selected.cityName)
          this.$emit('update:areaName', this.selected.areaName)
        }
        this.dispatch('FormItem', 'on-form-change', value)

        if (!this.multiple) {
          this.visible = false
        }
      },
      analysis: function () {
        if (this.multiple) {
          if (Array.isArray(this.value)) {
            for (let v of this.value) {
              if (this.$isPlainObject(v)) {
                this.ids.push(v.id)
                this.names.push(v.name)
              }
            }
          }
        } else if (this.value === '' || this.value == null) {
          if (this.province != null) {
            this.selected.province = this.province
          }
        } else {
          this.findPaths([], this.value, (paths) => {
            if (this.$isArray(paths, true)) {
              let last = paths[paths.length - 1]
              this.ids = last.id
              this.names = last.name

              this.selected.province = paths[0].id
              this.selected.provinceName = paths[0].name
              this.selecting.province = paths[0].id
              this.selecting.provinceName = paths[0].name

              if (paths.length > 1) {
                this.selected.city = paths[1].id
                this.selected.cityName = paths[1].name
                this.selecting.city = paths[1].id
                this.selecting.cityName = paths[1].name
                this.loadCitiesById(paths[1], false)
              }

              if (paths.length > 2) {
                this.selected.area = paths[2].id
                this.selected.areaName = paths[2].name
                this.selecting.area = paths[2].id
                this.selecting.areaName = paths[2].name
                this.loadAreasById(paths[2], false)
              }
            }
          })
        }
      },
      findPaths: function (arr, v, callback) {
        if (v) {
          this.$http.get(`/system/dict/region/${this.value}`).then(res => {
            arr.unshift(res)
            if (res.pid != null) {
              this.findPaths(arr, res.pid, callback)
            } else if (typeof callback === 'function') {
              callback(arr)
            }
          }).catch(res => {
            arr = null
            this.names = this.unmatchText || ''
            if (typeof callback === 'function') {
              callback(arr)
            }
          })
        }
      },
      loadProvinces: function () {
        if (!this.busy) {
          this.busy = true
          this.$http.get('/system/dict/region/_/subs').then((res) => {
            this.busy = false
            this.provinces = res
            if (this.selected.province) {
              for (let p of this.provinces) {
                if (p.id === this.selected.province) {
                  this.selected.provinceName = p.name
                  break;
                }
              }

              if (!this.multiple) {
                this.ids = this.selected.province
                this.names = this.selected.provinceName
                this.selecting.province = this.selected.province
                this.selecting.provinceName = this.selected.provinceName
                if (!this.disableCity) {
                  this.loadCitiesById(this.selected.province, false, true)
                }
              }
            }
          }).catch(res => {
            this.busy = false
          })
        }
      },
      loadCities: function (p) {
        if (!this.busy && this.selecting.province !== p.id) {
          this.selecting.province = p.id
          this.selecting.provinceName = p.name
          this.selecting.city = null
          this.selecting.cityName = null
          this.selecting.area = null
          this.selecting.areaName = null

          this.selectingCities = []
          this.selectingAreas = []
          if (this.disableCity) {
            this.check(p)
          } else {
            this.loadCitiesById(p)
          }
        }
      },
      loadCitiesById: function (p, checkable = true, loadSub = false) {
        let isObj = this.$isPlainObject(p)
        this.busy = true
        this.loading.city = true
        this.$http.get(`/system/dict/region/${isObj ? p.id : p}/subs`).then((res) => {
          this.busy = false
          if (this.$isArray(res, true)) {
            this.selectingCities = res
            if (!isObj && this.selectingCities != null && !this.disableCity) {
              this.cities = res
              for (let c of res) {
                if (c.id === this.city) {
                  this.selected.city = c.id
                  this.selected.cityName = c.name
                  break
                }
              }

              if (loadSub) {
                if (this.selected.city) {
                  this.ids = this.selected.city
                  this.names = this.selected.cityName
                  this.selecting.city = this.selected.city
                  this.selecting.cityName = this.selected.cityName
                }
                if (!this.disableArea) {
                  this.loadAreasById(this.selected.city, false, true)
                }
              }
            }
          } else if (checkable) {
            this.check(p)
          }
        }).catch(res => {
          this.busy = false
        }).finally(() => {
          this.loading.city = false
        })
      },
      loadAreas: function (p) {
        if (!this.busy && this.selecting.city !== p.id) {
          this.selecting.city = p.id
          this.selecting.cityName = p.name
          this.selecting.area = null
          this.selecting.areaName = null

          this.selectingAreas = []
          if (this.disableArea) {
            this.check(p)
          } else {
            this.loadAreasById(p)
          }
        }
      },
      loadAreasById: function (p, checkable = true, loadSub = false) {
        let isObj = this.$isPlainObject(p)
        this.busy = true
        this.loading.area = true
        this.$http.get(`/system/dict/region/${isObj ? p.id : p}/subs`).then((res) => {
          this.busy = false
          if (this.$isArray(res, true)) {
            this.selectingAreas = res
            if (!isObj && this.selectingAreas != null && !this.disableArea) {
              this.areas = res
              for (let a of res) {
                if (a.id === this.area) {
                  this.selected.area = a.id
                  this.selected.areaName = a.name
                  break
                }
              }

              if (loadSub && this.selected.area) {
                this.ids = this.selected.area
                this.names = this.selected.areaName
                this.selecting.area = this.selected.area
                this.selecting.areaName = this.selected.areaName
              }
            }
          } else if (checkable) {
            this.check(p)
          }
        }).catch(res => {
          this.busy = false
        }).finally(() => {
          this.loading.area = false
        })
      },
      loadStreets: function (p) {
        this.selecting.area = p.id
        this.selecting.areaName = p.name
        if (this.leafOnly) {
          this.check(p)
        }
      },
      checkProvince: function (p) {
        this.selecting.province = p.id
        this.selecting.provinceName = p.name
        this.selecting.city = null
        this.selecting.cityName = null
        this.selecting.area = null
        this.selecting.areaName = null

        this.check(p)
      },
      checkCity: function (p) {
        this.selecting.city = p.id
        this.selecting.cityName = p.name
        this.selecting.area = null
        this.selecting.areaName = null

        this.check(p)
      },
      checkArea: function (p) {
        this.selecting.area = p.id
        this.selecting.areaName = p.name

        this.check(p)
      },
      check: function (p) {
        if (this.multiple) {
          let inx = this.ids.indexOf(p.id)
          if (inx >= 0) {
            this.ids.splice(inx, 1)
            this.names.splice(inx, 1)
          } else {
            this.ids.push(p.id)
            this.names.push(p.name)
          }
        } else {
          this.ids = p.id
          this.names = p.name
        }

        this.updateValue()
      },
      queryCities: function () {
        if (!this.busy) {
          if (this.keyword) {
            this.busy = true
            this.$http.get(`/system/dict/region/search?name=${this.keyword}`).then((res) => {
              this.provinces = []
              this.cities = []
              if (Array.isArray(res)) {
                for (let r of res) {
                  if (r.pid) {
                    this.cities.push(r)
                  } else {
                    this.provinces.push(r)
                  }
                }
              }
            }).finally(() => {
              this.busy = false
            })
          } else {
            this.loadProvinces()
          }
        }
      }
    },
    computed: {
      dropStyles () {
        let s = {}
        if (!this.mobile) {
          if (this.placement && (this.placement === 'bottom-end' || this.placement === 'top-end')) {
            s.right = 0
          } else {
            s.left = 0
          }
        }
        return s
      },
      classes () {
        return [
          `${prefixCls}`,
          {
            [`${prefixCls}-visible`]: this.visible,
            [`${prefixCls}-disabled`]: this.disabled,
            [`${prefixCls}-single`]: true,
            [`${prefixCls}-show-clear`]: this.showCloseIcon,
            [`${prefixCls}-${this.size}`]: !!this.size
          }
        ];
      },
      transitionName () {
        return this.mobile ? 'fade' : (this.placement && this.placement.indexOf('bottom') >= 0 ? 'slide-up' : 'slide-down')
      },
      localePlaceholder () {
        if (this.placeholder === undefined) {
          return this.t('i.select.placeholder')
        } else {
          return this.placeholder
        }
      },
      showPlaceholder () {
        let status = false

        if (!this.multiple && !this.ids) {
          status = true
        } else if (Array.isArray(this.ids)) {
          if (!this.ids.length) {
            status = true
          }
        } else if (this.ids === null) {
          status = true
        }

        return status
      },
      showCloseIcon () {
        return this.clearable && !this.showPlaceholder
      },
      rawValue: function () {
        let rv = ''
        if (this.multiple) {
          rv = this.names.join(', ')
        } else {
          if (this.fullPath) {
            let nas = []
            let obj = this.selected
            if (this.visible) {
              obj = this.selecting
            }
            if (obj.provinceName) {
              nas.push(obj.provinceName)
            }
            if (obj.cityName) {
              nas.push(obj.cityName)
            }
            if (obj.areaName) {
              nas.push(obj.areaName)
            }

            if (nas.length > 0) {
              rv = nas.join(' / ')
            } else {
              rv = this.unmatchText || ''
            }
          } else {
            rv = this.names || this.unmatchText || ''
          }
        }
        return rv
      }
    },
    mounted: function () {
      this.analysis()
      this.loadProvinces()
    },
    watch: {
      visible: function (val, oldVal) {
        if (this.mobile) {
          window.localStorage.setItem('popup-opened', String(val))
        }

        if (val) {
          if (this.mobile) {
            this.selecting.province = null
            this.selecting.provinceName = null
            this.selecting.city = null
            this.selecting.cityName = null
            this.selecting.area = null
            this.selecting.areaName = null
            this.selectingCities = []
            this.selectingAreas = []
          } else {
            setTimeout(() => {
              if (this.selecting.province && this.$refs.hasOwnProperty('provinceList')) {
                let pl = this.$refs.provinceList
                let plSel = pl.querySelector('.selected')
                if (plSel) {
                  pl.scrollTop = plSel.offsetTop - plSel.offsetHeight
                }
              }
              if (this.selecting.city && this.$refs.hasOwnProperty('cityList')) {
                let cl = this.$refs.cityList
                let clSel = cl.querySelector('.selected')
                if (clSel) {
                  cl.scrollTop = clSel.offsetTop - clSel.offsetHeight
                }
              }
              if (this.selecting.area && this.$refs.hasOwnProperty('areaList')) {
                let al = this.$refs.areaList
                let alSel = al.querySelector('.selected')
                if (alSel) {
                  al.scrollTop = alSel.offsetTop - alSel.offsetHeight
                }
              }
            }, 0)
          }
        } else {
          this.selecting = Object.assign({}, this.selected)
          this.selectingCities = this.cities
          this.selectingAreas = this.areas
        }
      }
    }
  }
</script>

<style lang="less">
  .ivu-select-nosearch {
    padding: 0 !important;

    .levels {
      border: none !important;
    }
  }

  .ivu-select-dropdown {
    width: max-content;
  }

  @keyframes ivu-select-icon-load {
    from {
      transform: rotate(0deg);
    }
    50% {
      transform: rotate(180deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .ivu-select-city-panel {
    min-width: 210px !important;
    padding: 8px;
    max-height: 300px;
    display: flex;
    flex-direction: column;
    white-space: nowrap;
    overflow: hidden;
    .spin-icon-load {
      animation: ivu-select-icon-load 1s linear infinite;
    }

    .flex {
      flex-grow: 1;
      flex-shrink: 1;
    }

    .levels {
      border: #dddee1 solid 1px;
      border-radius: 2px;
      display: flex;
      flex-direction: row;
    }

    .cities, .areas {
      border-left: #dddee1 solid 1px;
    }

    h5 {
      background-color: #f8f8f9;
      border-bottom: #e9eaec solid 1px;
      padding: 10px;
    }

    .list {
      min-width: 160px;
      overflow-x: hidden;
      overflow-y: auto;

      > div {
        position: relative;
        padding: 10px;
        font-size: 12px;
        cursor: pointer;
        display: flex;
        flex-direction: row;
        align-items: center;

        &:hover {
          background-color: #f8f8f9;
        }

        &.selected {
          background-color: #2d8cf0;
          color: white;

          .ivu-icon {
            color: rgba(255, 255, 255, .2);

            &:hover, &.checked {
              color: white;
            }
          }
        }

        .ivu-icon {
          color: rgba(0, 0, 0, .1);
          font-size: 16px;

          &:hover, &.checked {
            color: #2d8cf0;
          }
        }
      }
    }
  }

  .mark-as-app {
    .ivu-select-city-panel {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, .6);
      max-height: none;
      min-width: 0;
      margin: 0;
      border-radius: 0;
      display: flex;
      flex-direction: row;
      justify-content: flex-end;

      .levels {
        position: relative;
        border: none;
        width: 70%;
        box-shadow: 0 0 1rem rgba(0, 0, 0, .25);

        > .flex {
          position: absolute;
          background-color: white;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        h5, .list > div {
          font-size: 1rem;
        }

        h5 {
          border: none;
          background-color: #2d8cf0;
          color: white;
        }
      }

      .cities, .areas {
        border: none;
      }
    }
  }
</style>
