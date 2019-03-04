<template>
  <Row>
    <div v-if="displayData.length > 0" style="border: 1px solid #dddee1; border-radius: 4px">
      <Button style="margin:1px"
              v-for="(item, index) in displayData"
              @click="removeData(index)"
              :key="item.id"
              :value="index">
        {{item.label}}
        <Icon class="btnIcon" type="ios-close-empty"></Icon>
      </Button>
    </div>
    <Cascader :data="checkSouceData" :load-data="loadData" v-model=bindData change-on-select @on-change="checkOnchangge"></Cascader>
  </Row>
</template>

<script>
  export default {
    name: 'check-picker',
    data () {
      return {
        name: '',
        value: '',
        midData: [],
        checkData: [],
        // 当前一级的列表数据
        currentList: [],
        // 当前的标签名称
        currentLabel: [],
        // 当前显示和即将上传的数据
        // displayData: [],
        // 上一次选择的值
        lastSelect: [],
        // 选择器绑定值
        bindData: [],
        checkSouceData: []
      }
    },
    props: {
      data: {
        type: Array,
        default: []
      }
    },
    methods: {
      checkOnchangge: function (data) {
        this.lastSelect = this.currentLabel
        this.currentLabel = []
        console.log(data)
        for (let i = 0; i < data.length; i++) {
          // 根据value获取label，返回值在currentLabel中
          this.getLabel(this.checkSouceData, data[i])
        }
        let lastStr = this.lastSelect.join(' / ')
        let curStr = this.currentLabel.join(' / ')
        let pushdata = {
          label: curStr,
          value: data
        }
        // 替换最后一个的条件 不包含上一次选择，不是首次选择，上一次选择不为空
        if (curStr.indexOf(lastStr) !== -1 && this.displayData.length > 0 && lastStr !== '') {
          this.displayData[this.displayData.length - 1] = pushdata
        } else {
          this.displayData.push(pushdata)
        }
        this.$emit('on-change', this.displayData)
      },
      getLabel: function (data, value) {
        for (let i = 0; i < data.length; i++) {
          if (data[i].value === value) {
            this.currentLabel.push(data[i].label)
          } else if (typeof (data[i].children) === 'object') {
            if (data[i].children.length > 0) {
              let newdata = data[i].children
              this.getLabel(newdata, value)
            }
          }
        }
      },
      removeData: function (v) {
        this.bindData = []
        this.displayData.splice(v, 1)
      },
      switchData: function (data, next) {
        let back = []
        for (let i = 0; i < data.length; i++) {
          if (next) {
            back.push({
              value: data[i].id,
              label: data[i].name,
              children: [],
              loading: false
            })
          } else {
            back.push({
              value: data[i].id,
              label: data[i].name,
              children: []
            })
          }
        }
        return back
      },
      getAreaList: function () {
        this.$http.get('/system/dict/region/_/subs').then((res) => {
          this.checkSouceData = this.switchData(res, true)
        })
      },
      loadData (item, callback) {
        item.loading = true;
        this.$http.get(`/system/dict/region/${item.value}/subs`).then((res) => {
          this.currentList = res
          if (res.length > 0) {
            this.$http.get(`/system/dict/region/${res[0].id}/subs`).then((secondRes) => {
              let next = false
              if (secondRes.length > 0) {
                next = true
              }
              this.insertData(item.value, this.checkSouceData, res, next)
              item.loading = false;
              callback();
            })
          }
        })
      },
      insertData: function (value, data, insert, next) {
        for (let i in data) {
          if (data[i].value === value) {
            data[i].children = this.switchData(insert, next)
            break
          } else if (data[i].children.length > 0) {
            this.insertData(value, data[i].children, insert)
          }
        }
      }
    },
    computed: {
      displayData () {
        return this.data
      }
    },
    mounted: function () {
      this.getAreaList()
    }
  }
</script>

<style scoped>
  .btnIcon {
    font-size: 18px;
    color: #666;
    float: right;
    position: relative;
    left: 7px;
  }
</style>
