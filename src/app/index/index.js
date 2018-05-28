import Vue from 'vue'

// 引入我们的视图、状态、路由组件
import App from './App.vue'
import { createStore } from './store'
import { createRouter } from './router'
// 引入iview组件库，后续就可以在template里直接调用，为所欲为！
import iView from 'iview'

Vue.use(iView)

// 提供返回一个vue实例的工厂函数
export function createApp () {
    const store = createStore()
    const router = createRouter()
    const app = new Vue({
        router,
        store,
        render: h => h(App)
    })

    return { app, router, store }
}
