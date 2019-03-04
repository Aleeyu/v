<template>
  <Row type="flex">
    <Col span="24" v-if="sortedBoxList.length > 0">
      <span style="font-weight:bold">箱码：</span>
      <span v-for="(value, key) in sortedBoxList" :key="key">
        {{value.length > 1 ? `${value[0]} - ${value[value.length - 1]}` : value[0]}}{{key === (sortedBoxList.length - 1) ? '' : '，'}}
      </span>
    </Col>
    <Col span="24" v-if="caseList.length > 0">
      <span style="font-weight: bold">盒码：</span>
      <span v-for="(value, key) in caseList" :key="key">
        {{value}}{{key === (caseList.length - 1) ? '' : '，'}}
      </span>
    </Col>
  </Row>
</template>
  
<script>
export default {
  data () {
    return {}
  },
  props: {
    boxList: {
      type: Array,
      default: () => {
        return []
      }
    },
    caseList: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  methods: {
    sortBoxListCode (boxList) {
      let first = null
      let dif = 1
      let index = 0
      let res = []

      boxList.forEach(e => {
        first 
        ? (e - first) === dif
          ? (
            dif++,
            res[index].push(e)
          )
          : (
            first = e,
            dif = 1,
            index++,
            res.push([e])
          )
        : (
          first = e,
          res.push([e])
        )
      })

      return res
    }
  },
  computed: {
    sortedBoxList () {
      return this.sortBoxListCode(this.boxList)
    }
  }
}
</script>
