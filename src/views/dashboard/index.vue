<template>
  <div class="app-container">
    <h1 style="margin-left: 120px">Hello: {{ $store.state.user.nickName }}</h1>
    <el-form
      v-loading="loading"
      style="width: 50%"
      ref="form"
      :model="userInfo"
      label-width="120px"
    >
      <el-form-item label="昵称">
        <el-input v-model="userInfo.nickName" />
      </el-form-item>
      <el-form-item label="头像">
        <el-upload
          class="avatar-uploader"
          action="/my-blog/github/updateImage"
          :headers="token"
          :show-file-list="false"
          :on-success="handleAvatarSuccess"
          :before-upload="beforeAvatarUpload"
        >
          <img v-if="userInfo.avatar" :src="userInfo.avatar" class="avatar" />
          <i v-else class="el-icon-plus avatar-uploader-icon"></i>
        </el-upload>
      </el-form-item>
      <el-form-item label="账号">
        <el-input disabled v-model="userInfo.userName" />
      </el-form-item>
      <el-form-item label="介绍">
        <el-input v-model="userInfo.introduction" type="textarea" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">保存</el-button>
        <el-button @click="onCancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { getToken } from "@/utils/auth";
import { getInfo, userEdit } from "@/api/user";

export default {
  data() {
    return {
      userInfo: {},
      loading: false,
      token: {
        authorization: "Bearer " + getToken(),
      },
    };
  },
  created() {
    this.getUserInfo();
  },
  methods: {
    getUserInfo() {
      this.loading = true;
      getInfo().then((res) => {
        this.userInfo = res.data[0];
        delete this.userInfo.isLogin;
        delete this.userInfo.updated;
        delete this.userInfo.passWord;
        delete this.userInfo.__v;
        delete this.userInfo._id;
        this.loading = false;
      });
    },
    onSubmit() {
      this.loading = true;
      userEdit(this.userInfo).then((res) => {
        if (res.status == 200) {
          this.$message.success("编辑成功");
        } else {
          this.$message.warning("编辑失败");
        }
        this.$store.dispatch('user/getInfo')
        this.loading = false;
      });
    },
    onCancel() {
      this.getUserInfo();
    },
    handleAvatarSuccess(res, file) {
      this.userInfo.avatar = file.response.url;
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

