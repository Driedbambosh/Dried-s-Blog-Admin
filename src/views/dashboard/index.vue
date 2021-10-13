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
    <div>
    <div>
          <button @click="insertText">insert text</button>
      </div>
      <div style="border: 1px solid #ccc;">
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
  </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getToken} from '@/utils/auth'
import { Editor, Toolbar, getEditor, removeEditor } from '@wangeditor/editor-for-vue'
import cloneDeep from 'lodash.clonedeep'
export default {
  name: 'Dashboard',
  
  components: { Editor, Toolbar },
  computed: {
    ...mapGetters([
      'name'
    ]),
     // 注意，深度拷贝 content ，否则会报错
     getDefaultContent() {
         return cloneDeep(this.defaultContent)
     }
  },
  // 及时销毁 editor
    beforeDestroy() {
        const editor = getEditor(this.editorId)
        if (editor == null) return

        // 销毁，并移除 editor
        editor.destroy()
        removeEditor(this.editorId)
    },
  data() {
    return {
      token: {
        authorization: 'Bearer ' + getToken()
      },
      editorId: 'w-e-1',

      toolbarConfig: { /* 工具栏配置 */ },
      defaultContent: [
          {
              type: 'paragraph',
              children: [{ text: '一行文字' }],
          },
      ],
      editorConfig: {
          placeholder: '请输入内容...',
          // 其他编辑器配置
          // 菜单配置
      },
      mode: 'default', // or 'simple'
      curContent: []
    }
  },
  methods: {
    handlePictureCardPreview() {

    },
    handleRemove() {
      
    },
    onCreated(editor) {
            console.log('onCreated', editor)
        },
        onChange(editor) {
            console.log('onChange', editor.children)
            this.curContent = editor.children
        },
        onDestroyed(editor) {
            console.log('onDestroyed', editor)
        },
        onMaxLength(editor) {
            console.log('onMaxLength', editor)
        },
        onFocus(editor) {
            console.log('onFocus', editor)
        },
        onBlur(editor) {
            console.log('onBlur', editor)
        },
        customAlert(info, type) {
            window.alert(`customAlert in Vue demo\n${type}:\n${info}`)
        },
        customPaste(editor, event, callback) {
            console.log('ClipboardEvent 粘贴事件对象', event)

            // 自定义插入内容
            editor.insertText('xxx')

            // 返回值（注意，vue 事件的返回值，不能用 return）
            callback(false) // 返回 false ，阻止默认粘贴行为
            // callback(true) // 返回 true ，继续默认的粘贴行为
        },

        insertText() {
            // 获取 editor 实例，即可执行 editor API
            const editor = getEditor(this.editorId)
            if (editor == null) return
            if (editor.selection == null) return

            // 在选区插入一段文字
            editor.insertText('一段文字')
        },
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
