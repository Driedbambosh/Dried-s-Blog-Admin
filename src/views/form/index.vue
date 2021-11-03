<template>
  <div class="dashboard-container">
    <div class="dashboard-text">Hello: {{ nickName }}</div>
    <el-upload
      action="/my-blog/github/updateImage"
      :headers="token"
      list-type="picture-card"
      :on-preview="handlePictureCardPreview"
      :on-remove="handleRemove"
    >
      <i class="el-icon-plus"></i>
    </el-upload>
    <div v-html="article"></div>
    <div v-for="item in articlesList" :key="item.id">
      <div @click="getArticleDetails(item._id)">标题:{{ item.title }}</div>
    </div>
    <div>
      <div style="border: 1px solid #ccc">
        <!-- 工具栏 -->
        <Toolbar
          style="border-bottom: 1px solid #ccc"
          :editorId="editorId"
          :defaultConfig="toolbarConfig"
          :mode="mode"
        />

        <!-- 编辑器 -->
        <Editor
          style="height: 500px"
          :editorId="editorId"
          :defaultConfig="editorConfig"
          :defaultContent="getDefaultContent"
          :mode="mode"
          @onCreated="onCreated"
          @onChange="onChange"
          @onDestroyed="onDestroyed"
          @onMaxLength="onMaxLength"
          @onFocus="onFocus"
          @onBlur="onBlur"
          @customAlert="customAlert"
          @customPaste="customPaste"
        />
      </div>
      <div>
        <el-button type="primary" @click="upArtical">提交</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { getToken } from "@/utils/auth";
import {
  Editor,
  Toolbar,
  getEditor,
  removeEditor,
} from "@wangeditor/editor-for-vue";
import cloneDeep from "lodash.clonedeep";
import Prism from "prismjs";
import "@wangeditor/editor/dist/css/style.css";
import { sendArticle, getArticle, getArticleDetail } from "@/api/article";
import { createEditor } from "@wangeditor/editor";
export default {
  name: "Dashboard",

  components: { Editor, Toolbar },
  created() {
    this.getArticleMet();
  },
  computed: {
    ...mapGetters(["nickName"]),
    // 注意，深度拷贝 content ，否则会报错
    getDefaultContent() {
      return cloneDeep(this.defaultContent);
    },
  },
  // 及时销毁 editor
  beforeDestroy() {
    const editor = getEditor(this.editorId);
    if (editor == null) return;

    // 销毁，并移除 editor
    editor.destroy();
    removeEditor(this.editorId);
  },
  data() {
    return {
      token: {
        authorization: "Bearer " + getToken(),
      },
      editorId: "w-e-1",
      // 富文本编辑器数据
      editorHtml: "",
      articlesList: [],
      article: "",
      toolbarConfig: {
        /* 工具栏配置 */
      },
      defaultContent: [
        {
          type: "paragraph",
          children: [{ text: "一行文字" }],
        },
      ],
      editorConfig: {
        placeholder: "请输入内容...",
        // 其他编辑器配置
        // 菜单配置
      },
      mode: "default", // or 'simple'

      curContent: [],
    };
  },
  methods: {
    getArticleMet() {
      getArticle().then((res) => {
        this.articlesList = res.data.data;
      });
    },
    // 获取文章详情
    getArticleDetails(id) {
      const that = this;
      getArticleDetail({
        articleId: id,
      }).then((res) => {
        const content = res.data.article;
        const editor = createEditor({ content });
        that.article = editor.getHtml();
        this.$nextTick(() => {
          Prism.highlightAll()
        })
      });
    },
    upArtical() {
      const editor = getEditor(this.editorId);
      console.log(editor.children);
      sendArticle({
        title: "标题",
        article: editor.children,
      }).then((res) => {
        console.log(res);
      });
    },
    handlePictureCardPreview() {},
    handleRemove() {},
    onCreated(editor) {
      console.log("onCreated", editor);
    },
    onChange(editor) {
      this.curContent = editor.children;
      this.editorHtml = editor.getHtml();
    },
    onDestroyed(editor) {
      console.log("onDestroyed", editor);
    },
    onMaxLength(editor) {
      console.log("onMaxLength", editor);
    },
    onFocus(editor) {
      console.log("onFocus", editor);
    },
    onBlur(editor) {
      console.log("onBlur", editor);
    },
    customAlert(info, type) {
      window.alert(`customAlert in Vue demo\n${type}:\n${info}`);
    },
    customPaste(editor, event, callback) {
      // console.log(editor,callback);
      // 自定义插入内容
      // editor.insertText('xxx')
      // 返回值（注意，vue 事件的返回值，不能用 return）
      // callback(false) // 返回 false ，阻止默认粘贴行为
      // callback(true) // 返回 true ，继续默认的粘贴行为
    },

    // insertText() {
    //     // 获取 editor 实例，即可执行 editor API
    //     const editor = getEditor(this.editorId)
    //     if (editor == null) return
    //     if (editor.selection == null) return

    //     // 在选区插入一段文字
    //     editor.insertText('一段文字')
    // },
  },
};
</script>
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


