import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/zh-CN' // lang i18n
import './plugins/VueQuillEditor.js'
import '@/styles/index.scss' // global css


import App from './App'
import store from './store'
import router from './router'

import '@/icons' // icon
import '@/permission' // permission control

/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online ! ! !
 */
if (process.env.NODE_ENV === 'production') {
  const { mockXHR } = require('../mock')
  mockXHR()
}


const domList = [
  {
    dom: `<svg  t="1637824425355" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="10463"><path d="M243.2 780.8v-179.2H153.6v179.2c0 49.28 40.32 89.6 89.6 89.6h179.2v-89.6H243.2zM780.8 153.6h-179.2v89.6h179.2v179.2h89.6V243.2c0-49.28-40.32-89.6-89.6-89.6zM243.2 243.2h179.2V153.6H243.2c-49.28 0-89.6 40.32-89.6 89.6v179.2h89.6V243.2z m537.6 537.6h-179.2v89.6h179.2c49.28 0 89.6-40.32 89.6-89.6v-179.2h-89.6v179.2z" p-id="10464" fill="#000000"></path></svg>`,
    tit: "最大化",
    id: "maxId",
    display: "block",
  },
  {
    dom: `<svg t="1637824296192" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6336"><path d="M341.065143 910.189714v-146.285714c0-53.686857-43.885714-97.572571-97.572572-97.572571h-146.285714a48.786286 48.786286 0 0 0 0 97.499428h146.285714v146.285714a48.786286 48.786286 0 1 0 97.499429 0z m-292.571429-617.910857c0 26.916571 21.796571 48.786286 48.713143 48.786286h146.285714c53.686857 0 97.572571-43.885714 97.572572-97.572572v-146.285714a48.786286 48.786286 0 0 0-97.499429 0v146.285714h-146.285714a48.786286 48.786286 0 0 0-48.786286 48.786286z m910.409143 0a48.786286 48.786286 0 0 0-48.713143-48.786286h-146.285714v-146.285714a48.786286 48.786286 0 1 0-97.499429 0v146.285714c0 53.686857 43.885714 97.572571 97.499429 97.572572h146.285714a48.786286 48.786286 0 0 0 48.713143-48.786286z m0 422.765714a48.786286 48.786286 0 0 0-48.713143-48.713142h-146.285714c-53.686857 0-97.572571 43.885714-97.572571 97.572571v146.285714a48.786286 48.786286 0 1 0 97.499428 0v-146.285714h146.285714a48.786286 48.786286 0 0 0 48.786286-48.786286z" fill="#000000" p-id="6337"></path></svg>`,
    tit: "还原",
    id: "minId",
    display: "none",
  },
];

/**@ bing
 *2021-12-22
 * v-maxWindow: 只针对 vue-quill-editor组件  最大化最小化
 */
Vue.directive("maxWindow", {
  //属性名称maxWindow，前面加v- 使用
  bind(el, binding, vnode, oldVnode) {
    setTimeout(() => {
      let dialogHeaderEl = el.querySelector(".ql-toolbar");

      domList.map((item) => {
        let dom = document.createElement("span");

        dom.className = "ql-formats";

        dom.innerHTML = `<button title="${item.tit}" style="display:${item.display}" id="${item.id}"  type="button" class="ql-clean">${item.dom}</button>`;

        dialogHeaderEl.appendChild(dom);
      });

      //最大化
      document.getElementById("maxId").onclick = () => {
        el.style.width = 100 + "vw";
        el.style.height = 100 + "vh";
        el.style.position = "fixed";
        el.style.top = 0;
        el.style.left = 0;
        el.style.zIndex = 9999;
        el.style.background = "white";
        document.getElementById("sidebar-container").style.visibility = "hidden";
        document.getElementById("editButton").style.visibility = "hidden";
        document.getElementById("showEdit").style.visibility = "hidden";
        document.getElementById("maxId").style.display = "none";
        document.getElementById("minId").style.display = "block";
      };
      //最小化
      document.getElementById("minId").onclick = () => {
        document.getElementById("sidebar-container").style.visibility = "";
        document.getElementById("editButton").style.visibility = "";
        document.getElementById("showEdit").style.visibility = "";
        el.style.width = "";
        el.style.height = "";
        el.style.position = "";
        el.style.top = '';
        el.style.left = '';
        el.style.zIndex = '';
        el.style.background = '';
        document.getElementById("maxId").style.display = "block";
        document.getElementById("minId").style.display = "none";
      };
    }, 0);
  },
});

// set ElementUI lang to EN
Vue.use(ElementUI)
// 如果想要中文版 element-ui，按如下方式声明
// Vue.use(ElementUI)

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
