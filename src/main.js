import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './styles/index.css'
import App from './App.vue'
import { installDebugRouter } from './debug'

const app = createApp(App)
app.use(ElementPlus)

/* 调试模块:挂载一个空跑的 vue-router,
 * 仅供状态页组件能安全调用 useRouter()/useRoute()。
 * 正式开发请移除此 import + 下方 installDebugRouter 调用 + 删除 src/debug。 */
installDebugRouter(app).then(() => app.mount('#app'))