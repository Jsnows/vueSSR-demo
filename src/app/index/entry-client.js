import Vue from 'vue'
import { createApp } from './index'

// 实例vue对象
const { app, router, store } = createApp()

if (window.__INITIAL_STATE__) {
    // 6.将预取数据添加进store
    // 这里renderToString将store内的state数据写进了一个script标签内随着模板一起带了过来
    // 然后读取window.__INITIAL_STATE__替换进页面的store内（名称可以改，使用方法参考下面链接，默认是这个名称）
    // https://ssr.vuejs.org/zh/api/#renderer-%E9%80%89%E9%A1%B9
    store.replaceState(window.__INITIAL_STATE__)
}

router.onReady(() => {
    router.beforeResolve((to, from, next) => {
        // 当做路由跳转的时候也会执行syncData方法
        // 因为服务端渲染我们把一些获取数据的方法写在syncData里面而不是created（当然如果你重复又在周期函数里写了初始化数据的方法也是可以的）
        const matched = router.getMatchedComponents(to)
        const prevMatched = router.getMatchedComponents(from)
        const activated = matched.filter((c, i) => {
            return (prevMatched[i] !== c)
        })
        const asyncDataHooks = activated.map(c => c.asyncData).filter(_ => _)
        if (!asyncDataHooks.length) {
            return next()
        }
        Promise.all(asyncDataHooks.map(hook => hook({ store, route: to })))
            .then(() => {
                next()
            }).catch(next)
    })
    // 这里要注意，当我们所有资源加载完成以后vue会再次渲染一边dom为了和虚拟dom匹配以及挂载一些路由和指令方法
    // 你可是尝试下面的写法在浏览器里看看会发生什么
    // setTimeout(function(){
    //     app.$mount('#app')    
    // },5000)
    app.$mount('#app')
})