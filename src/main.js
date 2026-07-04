import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style.css'
import App from './App.vue'

const app = createApp(App)
app.use(ElementPlus)

/* DEBUG START — 极简 vue-router 注册,只为让 useRouter()/useRoute() 不报错
 * 正式开发时删除 DEBUG START 与 DEBUG END 之间的全部代码即可。
 * 届时请用 vue-router 的 createRouter() + 真实路由表替换。 */
import { createRouter, createWebHashHistory } from 'vue-router'
import NotFoundPage       from './components/status/NotFoundPage.vue'
import ForbiddenPage      from './components/status/ForbiddenPage.vue'
import ServerErrorPage    from './components/status/ServerErrorPage.vue'
import NetworkErrorPage   from './components/status/NetworkErrorPage.vue'
import MaintenancePage    from './components/status/MaintenancePage.vue'
import EmptyPage          from './components/status/EmptyPage.vue'
import SessionExpiredPage from './components/status/SessionExpiredPage.vue'

const debugRouter = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/404',         component: NotFoundPage },
    { path: '/403',         component: ForbiddenPage },
    { path: '/500',         component: ServerErrorPage },
    { path: '/network',     component: NetworkErrorPage },
    { path: '/maintenance', component: MaintenancePage },
    { path: '/empty',       component: EmptyPage },
    { path: '/session',     component: SessionExpiredPage },
  ],
})

app.use(debugRouter)
debugRouter.isReady().then(() => app.mount('#app'))
/* DEBUG END */