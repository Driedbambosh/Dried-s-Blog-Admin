<template>
  <div class="board">
    <el-table class="tableList" :data="articlesList" border>
      <el-table-column prop="title" label="标题"> </el-table-column>
      <el-table-column prop="userId.nickName" label="作者"> </el-table-column>
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
          <el-popover placement="top" width="160" v-model="visible">
            <p>确定要删除吗？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="visible = false"
                >取消</el-button
              >
              <el-button type="primary" size="mini" @click="deleteArticle(scope.row._id)"
                >确定</el-button
              >
            </div>
            <el-button slot="reference">删除</el-button>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { getArticle, getArticleDetail, deleteArticle } from "@/api/article";

export default {
  name: "articleList",
  data() {
    return {
      articlesList: [],
      loading: false,
    };
  },
  created() {
    this.getArticleMet();
  },
  methods: {
    // 获取文章列表
    getArticleMet() {
      getArticle().then((res) => {
        this.articlesList = res.data.data;
        this.$forceUpdate();
      });
    },
    // 获取文章详情
    getArticleDetails(id) {
      const that = this;
      getArticleDetail({
        articleId: id,
      }).then((res) => {});
    },
    deleteArticle(id) {
      const that = this;
      deleteArticle({ articleId: id }).then((res) => {
        console.log(res);
        this.getArticleMet();
      });
    },
  },
};
</script>

<style scoped>
.board {
  padding: 20px;
}
.editButton {
  width: 20%;
}
</style>