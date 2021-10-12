<template>
  <div class="dashboard-container">
    <div class="dashboard-text">name: {{ name }}</div>
    <el-upload
      action="/my-blog/github/updateImage"
      :headers='token'
      list-type="picture-card"
      :on-preview="handlePictureCardPreview"
      :on-remove="handleRemove">
      <i class="el-icon-plus"></i>
    </el-upload>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getToken} from '@/utils/auth'

export default {
  name: 'Dashboard',
  computed: {
    ...mapGetters([
      'name'
    ])
  },
  data() {
    return {
      token: {
        authorization: 'Bearer ' + getToken()
      }
    }
  },
  methods: {
    handlePictureCardPreview() {

    },
    handleRemove() {
      
    }
  }
}
</script>

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
