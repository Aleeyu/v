<template>
  <Row class="outer-container">
    <Row class="print-container">
      <Row class="no-print action-bar" type="flex" justify="space-between">
        <Button type="primary" @click="print">打印</Button>
      </Row>
      <slot name="content">
      </slot>
    </Row>
  </Row>  
</template>

<script>
export default {
  data () {
    return {}
  },
  methods: {
    print: function () {
      window.print()
    }
  }
}
</script>


<style scoped>
.outer-container {
  background: #fff;
}

.action-bar {
  position: absolute;
  top: 20px;
}
</style>
