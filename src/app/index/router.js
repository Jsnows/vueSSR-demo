import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router)

const Page = () => import('components/page/page.vue')
const Article = () => import('components/article/article.vue')
const aboutMe = () => import('components/about-me/about-me.vue')

const routes = [
    {
        path: '/',
        name:'home',
        component: Page
    },
    {
        path: '/article',
        name:'article',
        component: Article
    },{
        path: '/about-me',
        name: 'aboutMe',
        component: aboutMe
    }
]
// 这里我们需要提供一个可以复用的工厂函数，
// 每次请求的时候都要创建一个新的路由实例，
// 因为服务端程序会长时间保持运行状态，
// 如果不为每次请求创建一个新的实例，
// 那么之后的请求都会复用第一次请求的实例。说白了就是会出问题！
// 后续的store以及index文件同理
// 官方解释👇
// https://ssr.vuejs.org/zh/guide/structure.html#%E9%81%BF%E5%85%8D%E7%8A%B6%E6%80%81%E5%8D%95%E4%BE%8B

// SPA通常是这样写的。自行对比一下看看区别在哪
// export default new Router({
//     mode: 'history',
//     fallback: false,
//     routes: routes
// })

export function createRouter() {
    return new Router({
        mode: 'history',
        fallback: false,
        routes: routes
    });
}