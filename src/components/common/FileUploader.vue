<template>
  <Row type="flex">
    <!-- 此处capture属性只要添加，不管值为什么，都会在ios中作用，如果为空，则默认会打开相机，导致无法选择相册 -->
    <input v-if="isAndroid" type="file" style="display: none;" ref="fileInput" :multiple="multiple && !mobile"
           :accept="accept" :capture="capture || ''"
           @change="handleSelectFile">
    <input v-else type="file" style="display: none;" ref="fileInput" :multiple="multiple && !mobile"
           @change="handleSelectFile">

    <Col>
    <div class="upload">
      <slot name="before-toolbar"></slot>

      <div class="upload-toolbar" v-if="showToolBar">
        <Button :size="uploadBtnSize" :type="uploadBtnType"
                :loading="isUploading"
                v-if="!immediate"
                @click="handleUploadFile">
          <span v-if="!isUploading">点击上传</span>
          <span v-else>上传中...</span>
        </Button>
      </div>

      <slot name="after-toolbar"></slot>

      <Row class="upload-container" type="flex" justify="start" align="top">
        <div class="upload-item" v-for="file in files"
             :class="{'unupload': file.status !== STATUS_UPLOADED , 'upload-item-last': !multiple}"
             :disabled="disabled"
             :style="itemCustomStyle ? itemCustomStyle : itemStyle">
          <Row class="upload-item-container" type="flex" justify="center" align="middle">
            <img :src="file.url" v-if="isImage(file)">
            <Col v-else class="upload-item-container-inner">
            <i class="icon iconfont"
               :class="iconClassFilter(file.type)"
               style="font-size: 40px;"></i>
            <span class="help upload-item-filename">
                    {{ file.name }}
                  </span>
            </Col>
          </Row>

          <Row type="flex" justify="center" align="middle" class="ivu-btn-group-dark upload-item-mask">
            <Button-group :size="buttonGroupSize">
              <Button type="text"
                      v-show="couldOperate(file)"
                      @click="handleDeleteClick(file)">
                <Icon type="trash-a"></Icon>
                <br>
                删除
              </Button>
              <Button type="text"
                      v-show="viewable && isImage(file)"
                      @click="handlePreviewFile(file)">
                <Icon type="eye"></Icon>
                <br>
                查看
              </Button>
            </Button-group>

            <div class="upload-item-status" v-if="!isUploaded(file)">
              <span class="help">{{ statusFilter(file.status) }}</span>
            </div>
          </Row>
        </div>

        <div class="upload-item js-add-file"
             title="点击添加文件"
             v-show="showAddFile"
             @click="handleSelectClick" :disabled="disabled"
             :style="itemCustomStyle ? itemCustomStyle : itemStyle">
          <Row class="upload-item-container" type="flex" justify="center" align="middle">
            <Icon type="ios-plus-empty" size="60"></Icon>
          </Row>

          <div class="upload-item-mask"></div>
        </div>

        <div class="upload-item"
             title="点击重新加载"
             v-show="!initSuccess"
             :style="itemCustomStyle ? itemCustomStyle : itemStyle">
          <Row class="upload-item-container" type="flex"
               justify="center" align="middle"
               style="position:relative; z-index: 100;">
            <Col class="upload-item-container-inner">
            <div class="error-img" :style="errorImgSize"></div>
            <h4 class="help">初始化出错了</h4>
            <Button size="small" @click="initFileList" :loading="isIniting">重新加载</Button>
            </Col>
          </Row>
        </div>

        <div class="upload-item upload-item-last"
             title="当前没有文件"
             v-show="showNoFile"
             :style="itemCustomStyle ? itemCustomStyle : itemStyle">
          <Row class="upload-item-container" type="flex" justify="center" align="middle">
            <Col class="upload-item-container-inner">
            <div class="error-img" :style="errorImgSize"></div>
            <h4 class="help">还没有文件</h4>
            </Col>
          </Row>
        </div>
      </Row>

      <slot name="after-container"></slot>

      <Row>
        <span class="error-msg" v-for="message in errorMessages">{{ message.content }}</span>
      </Row>
    </div>
    </Col>

    <Modal
      v-model="isPreviewing"
      @on-cancel="handleClosePreview"
      title="图片预览">
      <div class="preview-container">
        <img ref="PREVIEWIMAGE" :src="previewingFile.url" :style="previewImageStyle">
      </div>
      <div slot="footer">
        <Row type="flex" align="middle" style="margin-bottom: 10px;">
          <span class="small-head">图片大小调节：</span>
          <ButtonGroup>
            <Button type="ghost" icon="minus"
              :disabled="disabledZoomOut()"
              @click="handleZoomOut"></Button>
            <Button type="ghost" icon="plus" 
              :disabled="disabledZoomIn()"
              @click="handleZoomIn"></Button>
          </ButtonGroup>
        </Row>
        <Button type="primary" size="large" long @click="handleClosePreview">
          关闭图片预览
        </Button>
      </div>
    </Modal>

    <Modal
      v-model="isDeleting"
      title="确认删除文件？"
      @on-ok="handleDeleteFile">
      确定删除文件吗，服务器上的文件将会从服务器移除？
    </Modal>
  </Row>
</template>

<script>
  import {oneOf} from 'iview/src/utils/assist'

  /* 上传的前缀url */
  const PREFIX_URL = '/doc';
  /* 用只增的id作为本地文件唯一标识 */
  const generate = function () {
    let id = 0;
    return () => {
      return '__id__' + id++;
    };
  }
  const nextId = generate();

  /* 向父组件抛出的事件代码 */
  /* 文件列表信息变化事件 */
  const ON_CHANGE = 'on-change';
  /* 成功事件 */
  const ON_SUCCESS = 'on-success';
  /* 失败事件 */
  const ON_FAILED = 'on-failed';
  /* 成功/失败的类型 */
  const EVENT_INIT = 'INIT';
  const EVENT_UPLOAD = 'UPLOAD';
  const EVENT_DELETE = 'DELETE';
  const EVNET_CHANGE = 'CHANGE';

  /* 允许接受的文件类型 */
  let ACCEPT_LIST = [];

  /* 监听文件url数据的上一次结果 */
  let lastUrlList;

  /* 图片预览相关 */
  const PREVIEW_MAX_WIDTH = 480;
  const PREVIEW_MAX_HEIGHT = 430;

  export default {
    name: 'fileUploader',
    data: function () {
      return {
        /* 未上传状态 */
        STATUS_UNUPLOAD: 'UNUPLOAD',
        /* 已上传状态 */
        STATUS_UPLOADED: 'UPLOADED',
        /* 上传中状态 */
        STATUS_UPLOADING: 'UPLOADING',
        /* 上传失败状态 */
        STATUS_UPLOAD_FAILED: 'UPLOAD_FAILED',
        /* 删除中状态 */
        STATUS_DELETING: 'DELETING',
        /* 删除失败状态 */
        STATUS_DELETE_FAILED: 'DELETE_FAILED',
        /* 初始化是否成功 */
        initSuccess: false,
        /* 是否正在初始化 */
        isIniting: false,
        isDeleting: false,
        /* 判断是否是安卓平台 */
        isAndroid: false,
        toBeDeleteFile: {},
        isPreviewing: false,
        previewingFile: {},
        isUploading: false,
        errorMessages: [],
        files: [],
        previewImageStyle: {
          maxHeight: `${PREVIEW_MAX_HEIGHT}px`,
          maxWidth: `${PREVIEW_MAX_WIDTH}px`
        },
        previewImageOriginWidth: null,
        previewImageOriginHeight: null
      };
    },
    props: {
      /* 初始化传入的文件所属信息 */
      entId: {
        type: String,
        required: true
      },
      typeKey: {
        type: String,
        required: true
      },
      /* 单个文件最大大小限制，单位KB */
      maxSize: {
        type: Number,
        default: 512
      },
      /* 总文件最大大小限制，单位KB */
      maxTotalSize: {
        type: Number,
        default: 2056
      },
      /* 文件数量限制，为0时无限制 */
      maxFileCount: {
        type: Number,
        default: 0
      },
      /* 支持的文件类型 */
      accept: {
        type: String,
        default: '*'
      },
      /* 是否显示查看按钮 */
      viewable: {
        type: Boolean,
        default: true
      },
      /* 删除是否进行确认 */
      confirm: {
        type: Boolean,
        default: true
      },
      /* 错误消息显示方法 */
      toastMessage: {
        type: Boolean,
        default: false
      },
      /* 是否支持多个文件 */
      multiple: {
        type: Boolean,
        default: true
      },
      /* 是否在选择文件后立即上传 */
      immediate: {
        type: Boolean,
        default: false
      },
      uploadBtnType: {
        type: String
      },
      uploadBtnSize: {
        type: String,
        default: 'small'
      },
      /* 是否显示toolbar */
      showToolBar: {
        type: Boolean,
        default: true
      },
      /* 是否禁用 */
      disabled: {
        type: Boolean,
        default: false
      },
      /* item的大小，单位是px，最小值为128 */
      itemSize: {
        type: [Number, String],
        default: 128
      },
      capture: {
        type: String,
        default: null,
        validator (value) {
          return oneOf(value, ['camera', 'camcorder', 'microphone']);
        }
      },
      itemCustomStyle: {
        type: Object,
        default: null
      },
      mobile: {
        type: Boolean,
        default: false
      }
    },
    methods: {
      /* 判断文件是否是图片类型 */
      isImage: function (file) {
        return file.type.startsWith('image/');
      },
      /* 判断文件是否上传 */
      isUploaded: function (file) {
        return file.status === this.STATUS_UPLOADED;
      },
      /* 判断文件能否操作 */
      couldOperate: function (file) {
        return !this.disabled &&
          file.status !== this.STATUS_UPLOADING &&
          file.status !== this.STATUS_DELETING;
      },
      /* 返回状态的文本 */
      statusFilter: function (status) {
        switch (status) {
          case this.STATUS_UNUPLOAD:
            return '未上传';
          case this.STATUS_UPLOADED:
            return '已上传';
          case this.STATUS_UPLOADING:
            return '上传中';
          case this.STATUS_UPLOAD_FAILED:
            return '上传失败';
          case this.STATUS_DELETING:
            return '删除中';
          case this.STATUS_DELETE_FAILED:
            return '删除失败';
        }
      },
      /* 根据文档的类型返回对应的class */
      iconClassFilter: function (type) {
        switch (type) {
          case 'application/vnd.ms-excel':
            return 'icon-geshi_wendangxls';
          case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
            return 'icon-geshi_wendangxlsx';
          case 'application/msword':
            return 'icon-geshi_wendangdoc';
          case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            return 'icon-geshi_wendangdocx';
          case 'application/vnd.ms-powerpoint':
            return 'icon-geshi_wendangppt';
          case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
            return 'icon-geshi_wendangpptx';
          case 'application/pdf':
            return 'icon-geshi_wendangpdf';
          case 'text/plain':
            return 'icon-geshi_wendangtxt';
          default:
            return 'icon-geshi_weizhi';
        }
      },
      /* 提示错误信息 */
      showErrorMessage: function (message) {
        if (this.toastMessage) {
          this.$Message.error(message)
        } else {
          let messageId = nextId();
          let messageObj = {
            id: messageId,
            content: message
          };
          this.errorMessages.push(messageObj);
          /* 定时清除错误信息 */
          setTimeout(() => {
            let index = this.errorMessages.findIndex(message => message.id === messageId);
            if (index !== -1) {
              this.errorMessages.splice(index, 1);
            }
          }, 5000);
        }
      },
      /* 计算文件的返回url */
      computeUrlList: function () {
        let fileUrls;
        if (this.immediate) {
          /* 立即上传开启时，将忽略上传失败的文件 */
          fileUrls = this.files.filter(file => file.status !== this.STATUS_UPLOAD_FAILED)
            .map(file => file.url);
        } else {
          fileUrls = this.files.map(file => file.url);
        }
        /* urlList可能是字符串 */
        let urlList;
        if (this.multiple) {
          urlList = fileUrls;
        } else {
          urlList = fileUrls.length > 0 ? fileUrls[0] : '';
        }
        return urlList;
      },
      /* 向外部传递事件 */
      emit: function (success, eventType) {
        let event = {
          entId: this.entId,
          typeKey: this.typeKey,
          type: eventType,
          success: success,
          list: this.computeUrlList()
        };
        if (eventType === EVNET_CHANGE) {
          if (lastUrlList !== event.list) {
            lastUrlList = event.list;
            this.$emit(ON_CHANGE, event);
          }
        } else {
          this.$emit(success ? ON_SUCCESS : ON_FAILED, event);
        }
      },
      /* 向外部传递成功事件 */
      emitSuccess: function (eventType) {
        this.emit(true, eventType);
      },
      /* 向外部传递失败事件 */
      emitFailed: function (eventType) {
        this.emit(false, eventType);
      },
      /* 向外部传递change事件 */
      emitChange: function () {
        this.emit(true, EVNET_CHANGE);
      },
      /* 获取初始列表信息 */
      initFileList: function (entId) {
        this.files = [];
        this.isIniting = true;
        this.$http.get('/doc/serachbyentandtype', {
          params: {
            entId: this.entId,
            typeKey: this.typeKey
          }
        }).then(data => {
          this.initSuccess = true;
          if (Array.isArray(data)) {
            data.forEach(value => {
              this.files.push({
                id: value.id,
                status: this.STATUS_UPLOADED,
                url: value.publishUrl,
                size: value.docSize,
                name: value.docName,
                type: value.docType
              });
            });
          }
          this.emitSuccess(EVENT_INIT);
        }).catch(error => {
          console.error(error);
          this.initSuccess = false;
          this.emitFailed(EVENT_INIT);
        }).finally(() => {
          this.isIniting = false;
        });
      },
      /* 重新计算总大小 */
      handleUpadteSize: function () {
        let tempSize = 0;
        this.files.forEach(file => {
          tempSize += file.size
        });
        this.currentTotalSize = Math.round(tempSize / 1024);
      },
      handleSelectClick: function () {
        if (!this.disabled) {
          this.$refs.fileInput.click();
        }
      },
      /* 预处理选择文件，用于先删除替换的文件 */
      preHandleSelectFile: function () {
        let files = this.$refs.fileInput.files;

        /* 如果单文件模式，原文件删除失败时抛出异常 */
        /* 如果多文件模式，原文件删除失败时不抛出异常 */
        return this.handleDeleteFile().then(() => {
          return files;
        }).catch(error => {
          if (this.multiple) {
            return files;
          } else {
            throw error;
          }
        });
      },
      /* 处理选择的文件 */
      handleSelectFile: function () {
        this.preHandleSelectFile().then(files => {
          let filesCount = files.length;
          /* 暂时记录已添加的文件数量 */
          let tempFileCount = this.files.length;

          for (let i = 0; i < files.length; i++) {
            let file = files[i];

            /* 检查文件数量 */
            if (this.maxFileCount !== 0 && this.maxFileCount <= tempFileCount) {
              this.showErrorMessage(`${file.name}添加失败，已达到文件数量限制`);
              break;
            }
            /* 检查文件格式 */
            if (this.accept !== '*' && ACCEPT_LIST.indexOf(file.type) === -1) {
              this.showErrorMessage(`${file.name}添加失败，不是符合格式要求的文件`);
              continue;
            }
            /* 检查文件大小, 单位KB */
            let fileSize = Math.round(file.size / 1024);
            if (fileSize > this.maxSize) {
              this.showErrorMessage(`${file.name}(${fileSize}KB)添加失败，已超出单个文件大小限制(${this.maxSize}KB)`);
              continue;
            } else if (this.currentTotalSize + fileSize > this.maxTotalSize) {
              this.showErrorMessage(`${file.name}(${fileSize}KB)添加失败，当前文件总大小(${this.currentTotalSize + fileSize}KB)已超出总文件大小限制(${this.maxTotalSize}KB)`);
              continue;
            }

            tempFileCount += 1;

            let self = this;
            if (self.isImage(file)) {
              /* 如果是图片，在读取后处理 */
              let reader = new FileReader();
              reader.readAsDataURL(file);
              reader.onload = function () {
                self.files.push({
                  id: nextId(),
                  status: self.STATUS_UNUPLOAD,
                  url: this.result,
                  type: file.type,
                  size: file.size,
                  name: file.name,
                  origin: file
                });
                filesCount -= 1;

                /* 如果设置为立即上传，且所有文件都遍历完，则执行上传操作 */
                if (self.immediate && filesCount === 0) {
                  self.handleUploadFile();
                }
              }
            } else {
              self.files.push({
                id: nextId(),
                status: self.STATUS_UNUPLOAD,
                type: file.type,
                size: file.size,
                name: file.name,
                origin: file
              });
              filesCount -= 1;

              if (self.immediate && filesCount === 0) {
                self.handleUploadFile();
              }
            }
          }
        }).finally(() => {
          /* 清空fileInput里的文件 */

          let fileInput = this.$refs.fileInput;
          /* 创建表单 */
          let form = document.createElement('form');
          document.body.appendChild(form);
          /* 记录原位置 */
          let parent = fileInput.parentNode;
          /* 表单添加fileInput并清空 */
          form.appendChild(fileInput);
          form.reset();
          /* 还原fileInput位置 */
          parent.insertBefore(fileInput, parent.firstChild);
          document.body.removeChild(form);
        });
      },
      /* 处理点击删除 */
      handleDeleteClick: function (file) {
        this.toBeDeleteFile = file;
        if (this.confirm) {
          this.isDeleting = true;
        } else {
          this.handleDeleteFile();
        }
      },
      /* 处理删除文件 */
      handleDeleteFile: function () {
        let index = this.files.findIndex(file => this.toBeDeleteFile.id === file.id);
        /* 未找到该文件，直接返回成功 */
        if (index === -1) {
          return Promise.resolve(true);
        }

        /* 直接删除本地文件 */
        if (this.toBeDeleteFile.status !== this.STATUS_UPLOADED &&
          this.toBeDeleteFile.status !== this.STATUS_DELETE_FAILED) {
          this.files.splice(index, 1);
          this.toBeDeleteFile = {};
          this.emitSuccess(EVENT_DELETE);
          return Promise.resolve(true);
        }

        /* 请求删除服务器文件 */
        this.files[index].status = this.STATUS_DELETING;
        return this.$http.delete(`${PREFIX_URL}/${this.toBeDeleteFile.id}`).then(data => {
          this.files.splice(index, 1);
          this.emitSuccess(EVENT_DELETE);
          return true;
        }).catch(error => {
          this.files[index].status = this.STATUS_DELETE_FAILED;
          this.emitFailed(EVENT_DELETE);
          this.showErrorMessage('文件删除失败，请稍后重试！');
          throw error;
        }).finally(() => {
          this.toBeDeleteFile = {};
        });
      },
      /* 处理上传文件，支持多文件同时上传 */
      handleUploadFile: function () {
        this.errorMessages = [];

        let toBeUploadFiles = this.files.filter(file => file.status === this.STATUS_UNUPLOAD ||
          file.status === this.STATUS_UPLOAD_FAILED);

        if (toBeUploadFiles.length > 0) {
          this.isUploading = true;
        } else {
          return false;
        }

        let formData = new FormData();
        toBeUploadFiles.forEach(file => {
          file.status = this.STATUS_UPLOADING
          formData.append('files', file.origin, file.origin.name);
        });

        this.$http.post(`${PREFIX_URL}/${this.entId}/${this.typeKey}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          timeout: 0
        }).then(data => {
          toBeUploadFiles.forEach((file, index) => {
            file.id = data[index].id;
            file.url = data[index].publishUrl;
            file.status = this.STATUS_UPLOADED;
          });
          this.emitSuccess(EVENT_UPLOAD);
        }).catch(error => {
          console.error(error);
          toBeUploadFiles.forEach((file) => {
            file.status = this.STATUS_UPLOAD_FAILED
          });
          this.emitFailed(EVENT_UPLOAD);
          this.showErrorMessage('文件上传失败，请稍后重试！');
        }).finally(() => {
          this.isUploading = false;
        });
      },
      /* 处理显示大图预览 */
      handlePreviewFile: function (file) {
        let image = new Image();
        image.addEventListener('load', () => {
          this.previewImageOriginHeight = image.naturalHeight;
          this.previewImageOriginWidth = image.naturalWidth;
        });
        image.src = file.url;
        this.isPreviewing = true;
        this.previewingFile = file;
      },
      /* 处理关闭大图预览 */
      handleClosePreview: function () {
        this.isPreviewing = false;
        this.previewingFile = {};
        this.previewImageStyle = {
          maxHeight: `${PREVIEW_MAX_HEIGHT}px`,
          maxWidth: `${PREVIEW_MAX_WIDTH}px`
        };
        this.previewImageOriginHeight = null;
        this.previewImageOriginWidth = null;
      },
      handleZoomIn: function () {
        let maxHeight = parseInt(this.previewImageStyle.maxHeight.replace('px', '')) * 1.2;
        let maxWidth = parseInt(this.previewImageStyle.maxWidth.replace('px', '')) * 1.2;
        this.previewImageStyle = {
          maxHeight: `${maxHeight}px`,
          maxWidth: `${maxWidth}px`
        };
      },
      handleZoomOut: function () {
        let maxHeight = parseInt(this.previewImageStyle.maxHeight.replace('px', '')) * 0.8;
        let maxWidth = parseInt(this.previewImageStyle.maxWidth.replace('px', '')) * 0.8;
        if (maxHeight < PREVIEW_MAX_HEIGHT) {
          maxHeight = PREVIEW_MAX_HEIGHT;
        }
        if (maxWidth < PREVIEW_MAX_WIDTH) {
          maxWidth = PREVIEW_MAX_WIDTH;
        }
        this.previewImageStyle = {
          maxHeight: `${maxHeight}px`,
          maxWidth: `${maxWidth}px`
        };
      },
      disabledZoomIn: function () {
        if (!this.$refs.PREVIEWIMAGE) return true

        let maxHeight = parseInt(this.previewImageStyle.maxHeight.replace('px', ''));
        let maxWidth = parseInt(this.previewImageStyle.maxWidth.replace('px', ''));
        if (maxWidth >= this.previewImageOriginWidth && maxHeight >= this.previewImageOriginHeight) {
          return true
        }
        return false
      },
      disabledZoomOut: function () {
        if (!this.$refs.PREVIEWIMAGE) return true

        let maxHeight = parseInt(this.previewImageStyle.maxHeight.replace('px', ''));
        let maxWidth = parseInt(this.previewImageStyle.maxWidth.replace('px', ''));
        if (maxWidth <= PREVIEW_MAX_WIDTH && maxHeight <= PREVIEW_MAX_HEIGHT) {
          return true
        }
        return false
      },
      /* 提供给外部的上传文件的方法 */
      uploadAllFile: function () {
        this.handleUploadFile();
      },
      /* 提供给外部的删除全部文件的方法 */
      deleteAllFile: function () {
        /* 删除失败的文件 */
        let deleteFailedFiles = [];
        /* 经过删除操作的文件数量 */
        let deletedCount = 0;

        this.files.every(file => {
          /* 本地文件，直接删除 */
          if (file.status !== this.STATUS_UPLOADED &&
            file.status !== this.STATUS_DELETE_FAILED) {
            deletedCount += 1;
            if (deletedCount === this.files.length) {
              this.files = deleteFailedFiles;
            }
            return true;
          }

          /* 服务器文件，需要请求进行删除 */
          file.status = this.STATUS_DELETING;
          this.$http.delete(`${PREFIX_URL}/${file.id}`).then(data => {
            this.emitSuccess(EVENT_DELETE);
          }).catch(error => {
            console.error(error);
            file.status = this.STATUS_DELETE_FAILED;
            deleteFailedFiles.push(file);
            this.emitFailed(EVENT_DELETE);
            this.errorMessages.push('文件删除失败，请稍后重试！');
          }).finally(() => {
            deletedCount += 1;
            if (deletedCount === this.files.length) {
              this.files = deleteFailedFiles;
            }
          });
        });
      }
    },
    computed: {
      /* 是否显示添加文件 */
      showAddFile: function () {
        /* 如果初始化失败 */
        if (!this.initSuccess) {
          return false;
        }
        /* 如果被禁用或者不支持多文件 */
        if (this.disabled) {
          return false;
        }
        /* 如果只支持单文件 */
        if (!this.multiple && this.files.length > 0) {
          return false;
        }
        /* 如果限制文件上传数量 */
        if (this.maxFileCount !== 0) {
          return this.files.length < this.maxFileCount;
        }
        return true;
      },
      /* 是否显示没有文件 */
      showNoFile: function () {
        /* 如果初始化失败 */
        if (!this.initSuccess) {
          return false;
        }
        if (this.disabled && this.files.length === 0) {
          return true;
        }
      },
      /* 格式化的允许的文件类型 */
      formattedAccept: function () {
        return this.accept.replace('image/*', 'image/gif,image/jpeg,image/png,image/svg,image/bmp');
      },
      itemStyle: function () {
        let style = {};
        if (this.itemSize > 128) {
          style['width'] = style['height'] = `${this.itemSize}px`;
        }
        return style;
      },
      /* 错误图片的大小样式 */
      errorImgSize: function () {
        let style = {};
        let size = 55;
        if (this.itemSize >= 160 && this.itemSize <= 200) {
          size = 75;
        } else if (this.itemSize > 200 && this.itemSize <= 260) {
          size = 95;
        } else if (this.itemSize > 260) {
          size = 100;
        }
        style['width'] = style['height'] = `${size}px`;
        return style;
      },
      /* 操作按钮组的大小 */
      buttonGroupSize: function () {
        let size = null;
        if (this.itemSize >= 160) {
          size = 'large';
        }
        return size;
      }
    },
    watch: {
      files: {
        deep: true,
        handler: function (val, oldVal) {
          this.handleUpadteSize();
          this.emitChange();
        }
      },
      entId: function (val, oldVal) {
        this.initFileList(val);
      }
    },
    mounted: function () {
      ACCEPT_LIST = this.formattedAccept.split(',');

      this.isAndroid = navigator.userAgent.indexOf('Android') > -1 || navigator.userAgent.indexOf('Adr') > -1; // android终端

      if (this.entId) {
        this.initFileList();
      }
    }
  }
</script>

<style scoped>
  .error-msg {
    display: block;
    color: #ed3f14;
    font-size: 12px;
    margin-bottom: 5px;
  }

  .position-center {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translateX(-50%) translateY(-50%);
  }

  .upload-toolbar {
    margin-bottom: 5px;
  }

  .upload-container {
    user-select: none;
  }

  .upload-item {
    cursor: pointer;
    height: 128px;
    width: 128px;
    margin-right: 5px;
    margin-bottom: 5px;
    border-radius: 2px;
    position: relative;
  }

  .upload-item:before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    border: rgba(0, 0, 0, .1) solid 1px;
    z-index: 2;
  }

  .upload-item-last {
    margin: 0;
  }

  .js-add-file:first-child {
    margin: 0;
  }

  .upload-item:not([disabled]):hover {
    border-color: #2d8cf0;
    color: #2d8cf0;
  }

  .upload-item-container {
    width: 100%;
    height: 100%;
    margin-bottom: 5px;
    z-index: 1;
  }

  .upload-item-container img {
    height: 100%;
    width: 100%;
  }

  .upload-item-container-inner {
    text-align: center;
    width: 90%;
  }

  .upload-item-containe-inner .icon {
    display: block;
  }

  .upload-item-mask {
    display: none;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 3;

    background: rgba(28, 36, 56, 0.9);
    border-radius: 2px;
    color: #fff;
    padding: 3px 5px;
    text-align: left;
  }

  .upload-item:hover .upload-item-mask,
  .upload-item.unupload .upload-item-mask {
    display: flex;
  }

  .js-add-file:hover .upload-item-mask {
    display: none;
  }

  .js-add-file[disabled] .upload-item-mask {
    display: block;
  }

  .upload-item-status {
    position: absolute;
    bottom: 0;
    right: 5px;
  }

  .upload-item-filename {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .preview-container {
    margin: auto;
    overflow: auto;
    text-align: center;
    max-height: 440px;
  }

  @media screen and (max-height: 640px) {
    .preview-container {
      height: 340px;
    }
  }

  .error-img {
    margin: auto;
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center center;
    background-image: url(/static/images/error.gif);
  }

  div >>> .ivu-modal {
    top: 30px;
  }
</style>
