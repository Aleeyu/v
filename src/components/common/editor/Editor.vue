<template>
  <div ref="editor"></div>
</template>

<script>
  import Editor from 'wangeditor';

  export default {
    name: 'editor',
    data () {
      return {
        editor: undefined,
        content: ''
      }
    },
    props: {
      /* 默认内容 */
      defaultContent: String,
      /* 图片上传的entId */
      entId: {
        type: String,
        required: true
      },
      /* 图片上传的typeKey */
      typeKey: {
        type: String,
        required: true
      },
      /* 是否禁用 */
      /* TODO: 实现全面的禁用 */
      disabled: {
        type: Boolean,
        default: false
      }
    },
    methods: {
      /* 设置内容方法 */
      setContent: function (content) {
        this.editor.txt.html(content);
        this.editor.change();
      },
      /* 获取内容方法 */
      getContent: function () {
        return this.content;
      },
      focus: function () {
        this.editor.initSelection();
      }
    },
    mounted () {
      this.editor = new Editor(this.$refs.editor);
      this.editor.customConfig.onchange = html => {
        this.content = html;
        this.$emit('on-change', this.content);
      };

      /* 自定义文件上传 */
      this.editor.customConfig.customUploadImg = (files, insert) => {
        let formData = new FormData();
        let fileCount = 0;
        files.forEach(file => {
          if (file.type.startsWith('image/')) {
            formData.append('files', file, file.name);
            fileCount += 1;
          }
        });
        if (fileCount === 0) {
          return false;
        }

        this.$http.post(`/doc/${this.entId}/${this.typeKey}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }).then(data => {
          data.forEach(value => {
            this.editor.txt.append(`<img src=${value.publishUrl} style="max-width: 100%">`);
          });
          this.editor.change();
        }).catch(error => {
          console.error(error);
        });
      };

      this.editor.customConfig.menus = [
        'head',
        'bold',
        'italic',
        'underline',
        'strikeThrough',
        'foreColor',
        'backColor',
        'link',
        'list',
        'justify',
        'quote',
        'image',
        'table',
        'video',
        'undo',
        'redo'
      ];

      this.editor.create();

      /* 设置默认内容 */
      if (this.defaultContent) {
        this.editor.txt.html(this.defaultContent);
        this.editor.change();
      }
      /* 禁用或启用编辑功能 */
      this.editor.$textElem.attr('contenteditable', !this.disabled);
    },
    watch: {
      disabled: function (newVal, oldVal) {
        this.editor.$textElem.attr('contenteditable', !newVal);
      },
      defaultContent: function (newVal, oldVal) {
        this.editor.txt.html(newVal);
        this.editor.change();
      }
    }
  }
</script>

<style>
/* 修复toolbar在宽度不够时，进行换行 */
.w-e-toolbar {
  flex-wrap: wrap;
}
/* 修复IE10下的段落bug */
.w-e-text blockquote p {
  margin: 0;
}
</style>
