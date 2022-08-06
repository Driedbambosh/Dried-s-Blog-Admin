<template>
  <div class="dashboard-container">
    <div style="display: flex">
      <!-- 实时展示 -->
      <div style="border: none; width: 65%" class="ql-container ql-snow">
        <div
          v-if="
            content[0] !== '' && content[0] !== undefined && content[0] !== null
          "
          class="ql-editor"
          v-html="content[0]"
        ></div>
        <div v-else class="ql-editor" v-html="article"></div>
      </div>
      <!-- <el-table class="tableList" :data="articlesList" border>
        <el-table-column prop="title" label="标题"> </el-table-column>
        <el-table-column label="封面">
          <template slot-scope="scope">
            <img style="width: 60px" :src="scope.row.picture" alt="" />
          </template>
        </el-table-column>
        <el-table-column prop="introduction" label="简介"> </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" @click="getArticleDetails(scope.row._id)"
              >查看</el-button
            >
          </template>
        </el-table-column>
      </el-table> -->
      <div style="display: none" id="editorBox" class="editorBox">
        <quill-editor
          v-model="content[0]"
          ref="myQuillEditor"
          v-maxWindow
          :options="editorOption"
          @focus="onEditorFocus($event)"
          @blur="onEditorBlur($event)"
          @change="onEditorChange($event)"
          class="editor"
        ></quill-editor>
        <form
          action
          method="post"
          enctype="multipart/form-data"
          id="uploadFormMulti"
        >
          <input
            style="display: none"
            :id="uniqueId"
            type="file"
            name="file"
            multiple
            accept="image/jpg, image/jpeg, image/png, image/gif"
            @change="uploadImg('uploadFormMulti')"
          />
        </form>
      </div>
      <div style="display: none" id="editButton" class="editButton">
        <el-form
          v-loading="loading"
          ref="form"
          :model="edit"
          label-width="120px"
        >
          <el-form-item label="标题">
            <el-input v-model="edit.title"></el-input>
          </el-form-item>
          <el-form-item label="介绍">
            <el-input v-model="edit.introduction"></el-input>
          </el-form-item>
          <el-form-item label="标签">
            <el-select
              v-model="edit.label"
              multiple
              value-key="_id"
              filterable
              allow-create
              default-first-option
              placeholder="请选择文章标签"
            >
              <el-option
                v-for="(item,index) in options"
                :key="index"
                :label="item.labelName"
                :value="item"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="封面">
            <el-upload
              class="avatar-uploader"
              action="/my-blog/qiniu/upload"
              :headers="token"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload"
            >
              <img v-if="edit.picture" :src="edit.picture" class="avatar" />
              <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            </el-upload>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="sendarticle">提交</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-button
        class="showEdit"
        id="showEdit"
        type="primary"
        icon="el-icon-arrow-up"
        @click="editUp"
      ></el-button>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { getToken } from "@/utils/auth";
import Prism from "prismjs";
import anime from "animejs";
import {
  sendArticle,
  getArticle,
  getArticleDetail,
  sendImage,
} from "@/api/article";
import {
  getLabel
} from "@/api/label";
import hljs from "highlight.js";
import "highlight.js/styles/sunburst.css";
import { Quill } from "vue-quill-editor";

import imageResize from "quill-image-resize-module"; // 调整大小组件。
Quill.register("modules/imageResize", imageResize);

// 工具栏配置
const toolbarOptions = [
  ["bold", "italic", "underline", "strike"], // 加粗 斜体 下划线 删除线 -----['bold', 'italic', 'underline', 'strike']
  ["blockquote", "code-block"], // 引用  代码块-----['blockquote', 'code-block']
  [{ header: 1 }, { header: 2 }], // 1、2 级标题-----[{ header: 1 }, { header: 2 }]
  [{ list: "ordered" }, { list: "bullet" }], // 有序、无序列表-----[{ list: 'ordered' }, { list: 'bullet' }]
  [{ script: "sub" }, { script: "super" }], // 上标/下标-----[{ script: 'sub' }, { script: 'super' }]
  [{ indent: "-1" }, { indent: "+1" }], // 缩进-----[{ indent: '-1' }, { indent: '+1' }]
  [{ direction: "rtl" }], // 文本方向-----[{'direction': 'rtl'}]
  [{ size: ["small", false, "large", "huge"] }], // 字体大小-----[{ size: ['small', false, 'large', 'huge'] }]
  [{ header: [1, 2, 3, 4, 5, 6, false] }], // 标题-----[{ header: [1, 2, 3, 4, 5, 6, false] }]
  [{ color: [] }, { background: [] }], // 字体颜色、字体背景颜色-----[{ color: [] }, { background: [] }]
  [{ font: [] }], // 字体种类-----[{ font: [] }]
  [{ align: [] }], // 对齐方式-----[{ align: [] }]
  ["clean"], // 清除文本格式-----['clean']
  ["image", "video"], // 链接、图片、视频-----['link', 'image', 'video']
];
export default {
  name: "Dashboard",
  created() {
    this.getLabelData();
  },
  mounted() {
    var _this = this;
    var imgHandler = async function(image) {
      if (image) {
        var fileInput = document.getElementById(_this.uniqueId); //隐藏的file文本ID
        fileInput.click(); //加一个触发事件
      }
    };
    _this.editor.getModule("toolbar").addHandler("image", imgHandler);
    // 解决画面闪烁
    setTimeout(() => {
      document.getElementById("editorBox").style.display = "block";
      document.getElementById("editButton").style.display = "block";
    }, 500);
  },
  computed: {
    ...mapGetters(["nickName"]),
    //当前富文本实例
    editor() {
      return this.$refs.myQuillEditor.quill;
    },
  },
  data() {
    return {
      articlesList: [],
      article: ``,
      loading: false,
      userInfo: {},
      token: {
        authorization: "Bearer " + getToken(),
      },
      uniqueId: "uniqueId",
      content: [], // 富文本编辑器默认内容
      showEdit: false,
      edit: {},
      options: [], //文章标签
      editorOption: {
        //  富文本编辑器配置
        modules: {
          //工具栏定义的
          toolbar: toolbarOptions,
          syntax: {
            highlight: (text) => {
              return hljs.highlightAuto(text).value; // 这里就是代码高亮需要配置的地方
            },
          },
          imageResize: {
            displayStyles: {
              backgroundColor: "black",
              border: "none",
              color: "white",
            },
            modules: ["Resize", "DisplaySize", "Toolbar"],
          },
        },
        //主题
        theme: "snow",
        placeholder: "请输入正文",
      },
    };
  },
  methods: {
    // 获取文章标签
    getLabelData() {
      getLabel({
        pageSize: 99999,
        pageNo: 1,
      }).then(res => {
        this.options = res.data.data
      })
    },
    // 获取文章列表
    getArticleMet() {
      getArticle().then((res) => {
        this.articlesList = res.data.data;
        this.$forceUpdate();
      });
    },
    // 提交文章
    sendarticle() {
      this.loading = true;
      this.edit.article = this.content[0];
      const that = this;
      sendArticle(this.edit).then((res) => {
        if (res.status == 200) {
          that.$message.success(res.data.message);
          this.edit = {};
          this.content[0] = "";
          // this.getArticleMet();
        } else {
          that.$message.warning(res.data.message);
        }
      });
      this.loading = false;
    },
    // 封面上传
    handleAvatarSuccess(res, file) {
      if (res.status == "200") {
        this.$message.success(res.msg);
        this.edit.picture = res.imageUrl;
      } else {
        this.$message.warning(res.msg);
      }
      this.$forceUpdate();
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === "image/jpeg" || file.type === "image/png";
      const isLt2M = file.size / 1024 / 1024 < 4;

      if (!isJPG) {
        this.$message.error("上传头像图片只能是 JPG/PNG 格式!");
      }
      if (!isLt2M) {
        this.$message.error("上传头像图片大小不能超过 4MB!");
      }
      return isJPG && isLt2M;
    },
    editUp() {
      if (!this.showEdit) {
        anime({
          targets: [".editorBox"],
          bottom: "100px",
          duration: 1000,
          loop: false,
        });
        anime({
          targets: [".editButton"],
          bottom: "20px",
          duration: 1000,
          loop: false,
        });
        // anime({
        //   targets: [".tableList"],
        //   right: "-700px",
        //   duration: 1000,
        //   loop: false,
        // });
        this.rotate();
      } else {
        anime({
          targets: [".editorBox"],
          bottom: "-500px",
          duration: 1000,
          loop: false,
        });
        anime({
          targets: [".editButton"],
          bottom: "-500px",
          duration: 1000,
          loop: false,
        });
        // anime({
        //   targets: [".tableList"],
        //   right: "10px",
        //   duration: 1000,
        //   loop: false,
        // });
        this.rotateF();
      }
      this.showEdit = !this.showEdit;
    },
    rotate() {
      anime({
        targets: [".showEdit"],
        duration: 1000,
        rotate: 180,
        loop: false,
      });
    },
    rotateF() {
      anime({
        targets: [".showEdit"],
        duration: 1000,
        rotate: 0,
        loop: false,
      });
    },

    // 获取文章详情
    getArticleDetails(id) {
      const that = this;
      getArticleDetail({
        articleId: id,
      }).then((res) => {
        this.article = res.data.article;
      });
    },
    // 准备富文本编辑器
    onEditorReady() {},
    // 富文本编辑器 失去焦点事件
    onEditorBlur() {},
    // 富文本编辑器 获得焦点事件
    onEditorFocus() {},
    // 富文本编辑器 内容改变事件
    onEditorChange() {},
    uploadImg: async function() {
      var _this = this;
      //构造formData对象
      var formData = new FormData();
      formData.append("file", document.getElementById(_this.uniqueId).files[0]);
      console.log(formData);
      try {
        //调用上传文件接口
        sendImage(formData).then((res) => {
          //返回上传文件的地址
          let url = res.data.url;
          if (url != null && url.length > 0) {
            let Range = _this.editor.getSelection();
            url = url.indexOf("http") != -1 ? url : "http:" + url;
            //上传文件成功之后在富文本中回显(显示)
            _this.editor.insertEmbed(
              Range != null ? Range.index : 0,
              "image",
              url
            );
          } else {
            _this.$message.warning("图片上传失败");
          }
          //成功之后,将文件的文本框的value置空
          document.getElementById(_this.uniqueId).value = "";
        });
      } catch ({ message: msg }) {
        document.getElementById(_this.uniqueId).value = "";
        _this.$message.warning(msg);
      }
    },
  },
};
</script>
<style>
.line {
  text-align: center;
}
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
<style lang="scss">
.ql-editor {
  background-color: #fff;
}
.showEdit {
  position: fixed;
  z-index: 10;
  right: 20px;
  bottom: 20px;
}
.editorBox {
  position: fixed;
  bottom: -500px;
  width: 55%;
  background-color: #fff;
  // background-color: pink;
}
pre,
code {
  font-family: Consolas;
}
.editor {
  line-height: normal !important;
  height: 500px;
}
.ql-snow .ql-tooltip[data-mode="link"]::before {
  content: "请输入链接地址:";
}
.ql-snow .ql-tooltip.ql-editing a.ql-action::after {
  border-right: 0px;
  content: "保存";
  padding-right: 0px;
}

.ql-snow .ql-tooltip[data-mode="video"]::before {
  content: "请输入视频地址:";
}

.ql-snow .ql-picker.ql-size .ql-picker-label::before,
.ql-snow .ql-picker.ql-size .ql-picker-item::before {
  content: "14px";
}
.ql-snow .ql-picker.ql-size .ql-picker-label[data-value="small"]::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="small"]::before {
  content: "10px";
}
.ql-snow .ql-picker.ql-size .ql-picker-label[data-value="large"]::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="large"]::before {
  content: "18px";
}
.ql-snow .ql-picker.ql-size .ql-picker-label[data-value="huge"]::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="huge"]::before {
  content: "32px";
}

.ql-snow .ql-picker.ql-header .ql-picker-label::before,
.ql-snow .ql-picker.ql-header .ql-picker-item::before {
  content: "文本";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="1"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="1"]::before {
  content: "标题1";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="2"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="2"]::before {
  content: "标题2";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="3"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="3"]::before {
  content: "标题3";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="4"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="4"]::before {
  content: "标题4";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="5"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="5"]::before {
  content: "标题5";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="6"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="6"]::before {
  content: "标题6";
}

.ql-snow .ql-picker.ql-font .ql-picker-label::before,
.ql-snow .ql-picker.ql-font .ql-picker-item::before {
  content: "标准字体";
}
.ql-snow .ql-picker.ql-font .ql-picker-label[data-value="serif"]::before,
.ql-snow .ql-picker.ql-font .ql-picker-item[data-value="serif"]::before {
  content: "衬线字体";
}
.ql-snow .ql-picker.ql-font .ql-picker-label[data-value="monospace"]::before,
.ql-snow .ql-picker.ql-font .ql-picker-item[data-value="monospace"]::before {
  content: "等宽字体";
}
</style>

<style scoped>
/* 表格 */
table {
  border-collapse: collapse;
}
table th,
table td {
  border: 1px solid #ccc;
  min-width: 50px;
  height: 20px;
  text-align: left;
}
table th {
  background-color: #f1f1f1;
  text-align: center;
}

/* 代码块 */
pre > code {
  display: block;
  border: 1px solid hsl(0, 0%, 91%);
  border-radius: 4px 4px;
  text-indent: 0;
  background-color: #fafafa;
  padding: 10px;
  font-size: 14px;
}

/* 引用 */
blockquote {
  display: block;
  border-left: 8px solid #d0e5f2;
  padding: 10px 10px;
  margin: 10px 0;
  background-color: #f1f1f1;
}

/* 列表 */
ul,
ol {
  margin: 10px 0 10px 20px;
}

/* 分割线 */
hr {
  display: block;
  width: 90%;
  margin: 20px auto;
  border: 0;
  height: 1px;
  background-color: #ccc;
}
</style>
<style lang="scss" scoped>
.editButton {
  position: fixed;
  right: 120px;
  bottom: -500px;
  width: 20%;
}
.tableList {
}
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
</style>
