<template>
  <div class="board">
    <el-button style="margin-bottom:10px" type="primary" @click="newLabel">新增</el-button>
    <el-table v-loading="loading" class="tableList" :data="labelList" border>
      <el-table-column prop="labelName" label="标签名称"> </el-table-column>
      <el-table-column prop="color" label="颜色"> </el-table-column>
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
          <el-button type="text" @click="editLabel(scope)"
            >编辑</el-button
          >
          <el-popconfirm
            @onConfirm="deleteLabel(scope.row._id)"
            title="确定删除吗？"
          >
            <el-button type="text" slot="reference">删除</el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :title="modelStatus" :visible.sync="dialogFormVisible">
      <el-form style="padding-bottom: 20px" :model="form">
        <el-form-item label="标签名称" label-width="120px">
          <el-input v-model="form.labelName"></el-input>
        </el-form-item>
        <el-form-item label="颜色" label-width="120px">
          <el-color-picker v-model="form.color"></el-color-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button v-if="modelStatus == '新增'" type="primary" @click="sendLabel">确 定</el-button>
        <el-button v-else type="primary" @click="sendLabelEdit">编 辑</el-button>
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
import { sendLabel,getLabel,deleteLabel,editLabel } from "@/api/label";
import { getToken } from "@/utils/auth";
import moment from "moment";

export default {
  name: "labelList",
  data() {
    return {
      token: {
        authorization: "Bearer " + getToken(),
      },
      modelStatus: '',// 新增状态
      form: {
          labelName: '',
          color: '',
          id:'',
      },
      labelList: [],
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
  },
  created() {
    this.getLabelList();
  },
  mounted() {},
  methods: {
    newLabel() {
        this.dialogFormVisible = true;
        this.modelStatus = '新增'
        this.form.labelName = ''
        this.form.color = ''
    },
    editLabel(data) {
        this.dialogFormVisible = true;
        this.modelStatus = '编辑'
        this.form.labelName = data.row.labelName
        this.form.color = data.row.color
        this.form.id = data.row._id
        console.log(data);
    },
    sendLabel() {
        sendLabel({
            labelName: this.form.labelName,
            color: this.form.color
        }).then(res => {
            if(res.status == 200) {
                this.$message.success('添加成功!')
                this.getLabelList()
                this.dialogFormVisible = false;
            }else {
                this.$message.warning(res.statusText)
            }
        })
    },
    sendLabelEdit() {
        editLabel({
            labelName: this.form.labelName,
            color: this.form.color,
            id: this.form.id,
        }).then(res => {
            if(res.status == 200) {
                this.$message.success('添加成功!')
                this.getLabelList()
                this.dialogFormVisible = false;
            }else {
                this.$message.warning(res.statusText)
            }
        })
    },
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
      this.getLabelList();
    },
    handleCurrentChange(val) {
      this.currentPage1 = val;
      this.getLabelList();
    },
    // 获取标签列表
    getLabelList() {
      this.loading = true;
      getLabel({
        pageSize: this.pageSize,
        pageNo: this.currentPage1,
      }).then((res) => {
        this.loading = false;
        this.total = res.data.total;
        this.labelList = res.data.data;
        this.$forceUpdate();
      });
    },
    deleteLabel(id) {
      const that = this;
      deleteLabel({ labelId: id }).then((res) => {
        this.getLabelList();
        if (res.status == 200) {
          this.$message.success("删除成功");
        } else {
          this.$message.success(res.statusText);
        }
        this.visible = false;
      });
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