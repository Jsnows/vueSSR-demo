// entry-server.js
import { createApp } from './index'


export default context => {
    return new Promise((resolve, reject) => {
        // 2.初始化vue实例
        // 前面写App.vue、store.js、router.js有说明，这里不做详细说明
        const { app, router, store } = createApp()
        // 这个是传入的context
        const { url } = context

        // 这里就是路由匹配的代码在server.js里的1.路由匹配里逻辑对应
        const { fullPath } = router.resolve(url).route
        if (fullPath !== url) {
            // 匹配不正确返回
            return reject({ url: fullPath })
        }

        router.push(url)

        router.onReady(() => {
            // 这个方法会返回所有的路由，就是我们写在router=[]里的东西
            // 例如下面的东西，会把所有的component返回给你
            // {
            //     path: '/',
            //     name:'home',
            //     component: {
            //         name:'page',
            //         asyncData({store,route}){
            //             return store.dispatch('xxx')
            //         },
            //         render (h) {
            //             return h(Page)
            //         }
            //     }
            // }
            const matchedComponents = router.getMatchedComponents()
            // 如果没有说明没有设置路由，你没设置怎会有对吧 ←_←
            if (!matchedComponents.length) {
                // 直接丢出vue实例
                return resolve(app)
            }
            // 3.数据预取
            // 执行所有的asyncData方法，等待这些方法全部执行成功以后将赋值的store.state传递给context.state
            // 为什么要将store.state传递给context.state？主要是为了给浏览器端state赋值用后续会讲到
            // 注意：asyncData要返回Promise对象。
            Promise.all(matchedComponents.map(({ asyncData }) => asyncData && asyncData({
                store,
                route: router.currentRoute
            }))).then(() => {
                context.state = store.state
                // 返回实例对象
                // 之后renderToString就会4.拼装页面
                // 然后5.返回带有数据的页面
                resolve(app)
            }).catch(reject)

        }, reject)

    })
}