<template>
  <Cascader placeholder="请选择商品分类"
    :data="data"
    :value="value"
    :load-data="loadData"
    @on-change="handleChange"></Cascader>
</template>

<script>
/* *
 * 主要封装获取商品分类等工作
 * 触发on-change事件
 * 触发input事件，用于v-model
 * 分发on-form-change事件，用于Form验证
 */

import Emitter from 'iview/src/mixins/emitter'

export default {
  mixins: [Emitter],
  data () {
    return {
      data: []
    }
  },
  props: {
    value: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    handleChange (value, selectedData) {
      this.$emit('on-change', value, selectedData)
      this.$emit('input', value)
      this.dispatch('FormItem', 'on-form-change', value)
    },
    getList (parentId) {
      let data = {
        page: 1,
        size: 100000,
        orderBy: [
          { property: 'createdTime', order: 'desc' }
        ],
        queryFilter: [
          {
            property: 'isEnable',
            op: '=',
            value: 0
          }
        ]
      }

      if (parentId) {
        data.queryFilter.push({
          property: 'parentId',
          op: '=',
          value: parentId
        })
      } else {
        data.queryFilter.push({
          property: 'level',
          op: '=',
          value: '1'
        })
      }

      return this.$http.post('/market/goods/category/search', data)
    },
    init () {
      this.getList().then(res => {
        res.content.forEach(d => {
          this.data.push({
            label: d.categoryName,
            value: d.id,
            level: d.level,
            loading: false,
            children: []
          })
        })
      })
    },
    /* 加载下级 */
    loadData (item, callback) {
      item.loading = true
      this.getList(item.value).then(res => {
        if (res.content && res.content.length !== 0) {
          res.content.forEach(d => {
            let child = {
              label: d.categoryName,
              value: d.id
            }
            if (item.level === '1') {
              child.level = d.level
              child.loading = false
              child.children = []
            }
            item.children.push(child)
          })
          item.loading = false
          callback()
        } else {
          item.loading = false
          /* 通过删除loading属性使其不再加载子级 */
          delete item.loading
          callback()
        }
      }).catch(error => {
        console.error(error)
        item.loading = false
        callback()
      })
    }
  },
  mounted () {
    this.init()
  }
}
</script>
