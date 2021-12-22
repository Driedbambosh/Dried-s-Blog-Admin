<template>
  <div class="board">
    <el-table v-loading="loading" class="tableList" :data="articlesList" border>
      <el-table-column prop="title" label="标题"> </el-table-column>
      <el-table-column prop="userId.nickName" label="作者"> </el-table-column>
      <el-table-column label="封面">
        <template slot-scope="scope">
          <img style="width: 60px" :src="scope.row.picture" alt="" />
        </template>
      </el-table-column>
      <el-table-column prop="introduction" label="简介"> </el-table-column>
      <el-table-column prop="createdAt" label="创建时间">
        <template slot-scope="scope">
          {{ isoTime(scope.row.createdAt) }}
          <!-- {{new Date(scope.row.createdAt)}} -->
        </template>
      </el-table-column>
      <el-table-column prop="updatedAt" label="更新时间">
        <template slot-scope="scope">
          {{ isoTime(scope.row.updatedAt) }}
          <!-- {{new Date(scope.row.createdAt)}} -->
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button type="text" @click="getArticleDetails(scope.row._id)"
            >编辑</el-button
          >
          <el-popconfirm
            @onConfirm="deleteArticle(scope.row._id)"
            title="确定删除吗？"
          >
            <el-button type="text" slot="reference">删除</el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog title="编辑" :visible.sync="dialogFormVisible">
      
      <div slot="footer" style="text-align:left" class="dialog-footer">
        <el-form style="padding-bottom: 20px" :model="form">
        <el-form-item label="标题" label-width="120px">
          <el-input v-model="form.title" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="简介" label-width="120px">
          <el-input v-model="form.introduction"></el-input>
        </el-form-item>
        <el-form-item label="封面" label-width="120px">
          <el-upload
            class="avatar-uploader"
            action="/my-blog/github/updateImage"
            :headers="token"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="form.picture" :src="form.picture" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
        <el-form-item>
          <quill-editor
            v-model="form.article"
            ref="myQuillEditor"
            :options="editorOption"
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
        </el-form-item>
      </el-form>
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="sendArticle">确 定</el-button>
      </div>
    </el-dialog>
    <el-pagination
      background
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page.sync="currentPage1"
      :page-sizes="[10, 30, 60]"
      :page-size="pageSize"
      layout="total, prev, pager, next,sizes, jumper"
      :total="total"
    >
    </el-pagination>
  </div>
</template>

<script>
import {
  getArticle,
  getArticleDetail,
  deleteArticle,
  editArticle,
} from "@/api/article";
import { getToken } from "@/utils/auth";
import hljs from "highlight.js";
import "highlight.js/styles/sunburst.css";
import moment from "moment";
import { Quill } from "vue-quill-editor";
import imageResize from "quill-image-resize-module"; // 调整大小组件。
import { sendImage } from "@/api/article";
import { mapGetters } from "vuex";
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
  name: "articleList",
  data() {
    return {
      uniqueId: "uniqueId",
      token: {
        authorization: "Bearer " + getToken(),
      },
      form: {
        title: "",
        introduction: "",
        pictur: "",
        article: ``,
      },
      edit: {},
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
      articlesList: [],
      loading: false,
      currentPage1: 1,
      pageSize: 10,
      total: 0,
      dialogFormVisible: false,
    };
  },
  computed: {
    // iso格式转换
    isoTime() {
      return (index) => {
        return moment(index, ["YYYY", moment.ISO_8601]).format(
          "YYYY-MM-DD h:mm:ss"
        );
      };
    },
    //当前富文本实例
    editor() {
      return this.$refs.myQuillEditor.quill;
    },
  },
  created() {
    this.getArticleMet();
  },
  mounted() {
    var _this = this;
    var imgHandler = async function (image) {
      if (image) {
        var fileInput = document.getElementById(_this.uniqueId); //隐藏的file文本ID
        fileInput.click(); //加一个触发事件
      }
    };
    _this.editor.getModule("toolbar").addHandler("image", imgHandler);
  },
  methods: {
    sendArticle() {
      editArticle(this.form).then((res) => {
        if (res.status == 200) {
          this.$message.success("编辑成功");
          this.dialogFormVisible = false;
          this.getArticleMet();
        } else {
          this.$message.warning(res.statusText);
        }
      });
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.getArticleMet();
    },
    handleCurrentChange(val) {
      this.currentPage1 = val;
      this.getArticleMet();
    },
    // 获取文章列表
    getArticleMet() {
      this.loading = true;
      getArticle({
        pageSize: this.pageSize,
        pageNo: this.currentPage1,
      }).then((res) => {
        this.loading = false;
        this.total = res.data.total;
        this.articlesList = res.data.data;
        this.$forceUpdate();
      });
    },
    // 封面上传
    handleAvatarSuccess(res, file) {
      if (file.response.status == 200) {
        this.$message.success(file.response.message);
        this.form.picture = file.response.url;
      } else {
        this.$message.warning(file.response.message);
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
    // 获取文章详情
    getArticleDetails(id) {
      const that = this;
      getArticleDetail({
        articleId: id,
      }).then((res) => {
        this.form = res.data;
        this.dialogFormVisible = true;
      });
    },
    deleteArticle(id) {
      const that = this;
      deleteArticle({ articleId: id }).then((res) => {
        this.getArticleMet();
        if (res.status == 200) {
          this.$message.success("删除成功");
        } else {
          this.$message.success(res.statusText);
        }
        this.visible = false;
      });
    },
    uploadImg: async function () {
      var _this = this;
      //构造formData对象
      var formData = new FormData();
      formData.append("file", document.getElementById(_this.uniqueId).files[0]);
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
<style scoped>
.board {
  padding: 20px;
}
.editButton {
  width: 20%;
}
</style>