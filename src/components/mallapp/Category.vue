<template>
  <div class="app-setting app-common-layout">
    <div class="app-banner bottom-border">
      <div class="app-banner-button" @click="back">
        <Button type="text" icon="chevron-left"></Button>
      </div>
      <div class="app-banner-title category app-search">
        <form action="" style="width:100%">
          <input style="width:100%" type="search" v-model="keyword" placeholder="输入商品名称快速查找" @keydown="productByName"/>
        </form>
      </div>
      <div class="app-banner-button right">
        <Msg></Msg>
      </div>
    </div>
    <div v-if="!error1" class="app-body app-common-body app-category-panel">
      <list-panel class="app-category-left" :refreshable="false" :pageable="false">
        <div v-if="menus && menus[0]" slot="items">
          <p @click="getcateGoryByid(item.id)" :class="[selected === item.id ? 'app-category-panel-item-active' : 'app-category-panel-item']" v-for="item in menus" :key="item.id" :name="item.id">{{item.categoryName}}</p>
        </div>
      </list-panel>
      <list-panel v-if="!error2" class="app-category-right" :refreshable="false" :pageable="false">
        <div v-for="item in category" :key="item.id" class="app-category-twolevel" slot="items">
          <h4>{{item.categoryName}}</h4>
          <div class="app-category-box">
            <div class="app-category-item" v-for="d in item.list" :key="d.id" @click="product(d)">
              <img :src="d.coverImage || '/static/images/default-image.png'">
              <p>{{d.categoryName}}</p>
            </div>
          </div>
        </div>
      </list-panel>
      <error-view slot="items" v-if="error2" :error="error2"></error-view>
    </div>
    <error-view slot="items" v-if="error1" :error="error1"></error-view>
  </div>
</template>

<script>
  import ListPanel from '@/components/mallapp/ListPanel'
  import Msg from '@/components/mallapp/Msg'
  export default {
    components: {ListPanel, Msg},
    data () {
      return {
        selected: '',
        keyword: '',
        category: [],
        ids: [],
        menus: [],
        busy: false,
        error2: null,
        error1: null
      }
    },
    methods: {
      shown: function () {
        this.keyword = '';
        this.getcateGory()
      },
      back: function () {
        this.$router.back()
      },
      productByName: function (e) {
        if (e.keyCode === 13) {
          e.preventDefault();
          if (this.keyword) {
            this.$router.push({
              path: '/mallapp/product',
              query: {
                productName: this.keyword
              }
            })
          }
        }
      },
      product: function (d) {
        this.$router.push({
          path: '/mallapp/product',
          query: {
            categoryId: d.id
          }
        })
      },
      getcateGory: function () {
        this.error1 = null;
        let o = {
          _loading: true,
          page: 1,
          size: 100,
          orderBy: [{property: 'categoryName', order: 'asc'}],
          queryFilter: [{property: 'level', op: '=', value: '1'}, {property: 'status', op: '=', value: '0'}]
        }
        this.$http.post('/wechat/customer/market/goods/category/search', o).then(res => {
          this.menus = res.content
          if (res.content.length === 0) {
            this.error1 = {
              title: '未能找到分类',
              content: '目前好像还没有分类'
            }
            return;
          }
          this.getcateGoryByid(this.menus[0].id)
        }).catch(res => {
          this.$Message.error(this.$C.MSG_COMM_GET_FAIL.format('商品类别'))
        }).finally(() => {
          this.busy = false
        })
      },
      getcateGoryByid: function (id) {
        this.selected = id
        this.error2 = null;
        this.ids = [];
        let o = {
          _loading: true,
          page: 1,
          size: 100,
          orderBy: [{property: 'categoryName', order: 'asc'}],
          queryFilter: [{property: 'parentId', op: '=', value: id}, {property: 'status', op: '=', value: '0'}]
        }
        this.$http.post('/wechat/customer/market/goods/category/search', o).then(res => {
          if (res.content.length === 0) {
            this.error2 = {
              title: '未能找到分类',
              content: '目前好像还没有分类'
            }
          } else {
            for (var i = 0; i < res.content.length; i++) {
              this.ids.push(res.content[i].id)
            }
            this.getCategoryDetail(res.content)
          }
        }).catch(res => {
          this.$Message.error(this.$C.MSG_COMM_GET_FAIL.format('商品类别'))
        }).finally(() => {
          this.busy = false
        })
      },
      getCategoryDetail: function (cont) {
        for (var i = 0; i < cont.length; i++) {
          cont[i].list = []
        }
        let o = {
          _loading: true,
          page: 1,
          size: 100,
          orderBy: [{property: 'categoryName', order: 'asc'}],
          queryFilter: [{property: 'parentId', op: 'in', value: this.ids.join(',')}, {property: 'status', op: '=', value: '0'}]
        }
        this.$http.post('/wechat/customer/market/goods/category/search', o).then(res => {
          for (var i = 0; i < res.content.length; i++) {
            // if (res.content[i].parent.id === cont[i].id) {
            //   cont[i].list.push(res.content[i])
            // }
            for (var j = 0; j < cont.length; j++) {
              if (res.content[i].parent.id === cont[j].id) {
                cont[j].list.push(res.content[i])
              }
            }
          }
          this.category = cont
          console.log(this.category)
        }).catch(res => {
          this.$Message.error(this.$C.MSG_COMM_GET_FAIL.format('商品类别'))
        }).finally(() => {
          this.busy = false
        })
      }
    },
    computed: {
      actid: function () {
        let d = 0
        d = this.menus && this.menus[0] && this.menus[0].id
        return d
      }
    },
    mounted: function () {
      // this.getcateGory()
    }
  }
</script>

<style lang="less">
.app-category {
  &-panel {
    display: flex;
    flex-direction: row;
  }
  &-panel-item {
    padding: 1rem;
    border-bottom: 1px solid #e9eaec;
    text-align: center;
  }
  &-panel-item-active {
    padding: 1rem;
    border-bottom: 1px solid #e9eaec;
    text-align: center;
    color: #2d8cf0;
    background: #f5f5f5;
  }
  &-left {
    width: 25%;
    display: flex;
    flex-direction: row;
    background: white;
  }

  &-right {
    padding:10px;
    flex-grow: 1;
    flex-shrink: 1;
    display: flex;
    flex-direction: row;
  }
  &-item{
    width: 32%;
    text-align: center;
    display: inline-block;
    padding: 1rem;
    img{
      width:100%;  vertical-align: bottom
    }
  }
  &-twolevel{
  width: 100%;
      padding: 4px 0;
  }
  &-twolevel > h4{
    font-weight: bold;
    padding: 4px;
  }
  &-box{
    background: white;
  }
  &-item > p{
    overflow: hidden;
  text-overflow:ellipsis;
  white-space: nowrap;
  }
}
.app-banner-button{
  width: auto;
}
</style>
