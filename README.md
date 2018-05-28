## 安装&使用
```
npm install
or
yarn install

// 调试
npm run dev

// 生产
npm run build
npm run start

```

## 一、为什么要用vueSSR
### `vueSSR`对比`静态vueSPA`优势
- 更好的SEO
- 加载速度更快（后续会给出两种页面渲染流程对比）
- 实现彻底前后端分离（可以让服务端同学更专注于业务逻辑）

## 二、vueSPA和vueSSR从发起请求到用户可看到内容都经历了什么？
步骤|vueSSR|vueSPA
---|---|---
step1|发起请求|发起请求
step2|请求数据（`server`）|返回页面数据（html、js、css）
step3|渲染并返回页面|ajax请求数据(`页面空白`)
step4|用户看到有数据的页面|vue渲染数据插入dom（`页面空白`）
step5| - |用户看到有数据的页面

`注`：现在vue的生态可以说非常的繁荣，基本上想要的东西都有现成的，使用起来也是非常方便。那么同时也带来了一个问题，就是spa打包后的js文件非常大。例如使用`iview`、`ant`、`element`这些优秀的组件库打包的js文件动辄1M+，首次请求时将会造成很长的页面空白时间，很显然这不是我们想要的。

## 三、改造开始
#### `声明!` 项目中部分代码引自官方，在此统一说明，后续不再一一指出，如有异议请联系我。
1. 文件目录

```
|—— build (webpack配置文件引用官方，本文不做讲解)
|  |—— setup-dev-server.js
|  |—— vue-loader.config.js
|  |—— webpack.base.config.js
|  |—— webpack.client.config.js
|  |—— webpack.server.config.js
|—— data (假数据文件，不需要关心)
|  |—— data.json
|  |—— markdown教程.md
|  |—— mgd使用教程.md
|—— package-lock.json
|—— package.json
|—— server.js （服务端逻辑）
|—— serverApi （假接口文件，不需要关心）
|  |—— de-markdown.js
|—— src（开发文件，本次教程的核心）
|  |—— app（主页面文件）
|  |  |—— index
|  |  |  |—— App.vue
|  |  |  |—— entry-client.js
|  |  |  |—— entry-server.js
|  |  |  |—— index.html
|  |  |  |—— index.js
|  |  |  |—— router.js
|  |  |  |—— store.js
|  |—— components（组件文件）
|  |  |—— about-me（'关于我'页面组件）
|  |  |  |—— about-me.vue
|  |  |—— article（'文章'页面组件）
|  |  |  |—— article.vue
|  |  |—— page（'文章列表'页面组件）
|  |  |  |—— page.vue
|  |—— static（资源文件）
|  |  |—— index.css
```
首先是我们的`index.html`模板文件

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>blog</title>
    <meta charset="utf-8">
  </head>
  <body>
  <!--这里的标签是用于在服务端渲染的时候直接插入渲染结果的锚点标签-->
  <!--vue-ssr-outlet-->
  </body>
</html>

```
`App.vue`文件

```js
<template>
    <div id="app">
        <Row type="flex" class="head-bar">
            <Col type="flex" justify="center" align="middle" class="item" span="2" offset="2">
                我的blog
            </Col>
            <Col type="flex" justify="center" class="item" align="middle" span="4">
            </Col>
            <Col align="middle" span="12" offset="2">
                <Menu mode="horizontal" theme="light">
                    <router-link :to="{ name: 'home'}">
                        <Menu-item key="1" name="1">
                            <Icon type="ios-paper"></Icon>
                            文章列表
                        </Menu-item>
                    </router-link>
                    <router-link :to="{ name: 'aboutMe'}">
                        <Menu-item key="2" name="2">
                            <Icon type="person"></Icon>
                            about me
                        </Menu-item>
                    </router-link>
                </Menu>
            </Col>
        </Row>
        <br/>
        <Row class="content" type="flex" justify="center">
            <Col span="18" align="middle" style="padding:10px;font-size:12px;">
                Copyright © 2016 - 2018 jsnows All rights reserved.
            </Col>
        </Row>
    </div>
</template>

<script>
    
    // 组件实例对象

    export default {
        components: {

        },
        data: function() {
            return {
                
            }
        },
        computed: {

        },
        methods: {
            
        },
        beforeCreate() {
            
        },
        created() {
            
        }
        
    }

    
</script>

<style src="../../../node_modules/iview/dist/styles/iview.css"></style>
<style src="../../../node_modules/highlight.js/styles/github.css"></style>
<style src="static/index.css"></style>
```
- 这里的东西很简单就是使用`iview`组件做布局，用过`vue`的同学应该很容易就能看懂

---
`index.css`文件

```html
.head-bar{
    background-color: #fff;
    box-shadow:0px 1px 1px #888888;
    border-top:5px solid #484848;
}
.head-bar .item{
    font-size:18px;
    padding: 14px;
}
.content{
    transition: ease 1s;
}
.content .title,.desc,.tag{
    font-size: 20px;
    color:#444;
}
.content .title{
    /*height:47px;*/
    overflow: hidden;
    text-overflow:ellipsis;
    white-space: nowrap;
    display: block;
}
.content .title:hover{
    color:#30aec9;
}
.content .desc{
    font-size: 14px;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    margin:10px 0 10px;
    -webkit-line-clamp: 4;
    overflow: hidden;
}
*{
    -webkit-tap-highlight-color:transparent;
}
.textarea{
    overflow:auto;
    background-attachment:fixed;
    background-repeat:no-repeat;
    border-style:solid;
    border-color:#FFFFFF;
    border-radius: 5px;
    float:left;
    width:100%;
    height:100%;
    overflow:auto;
    outline:none;
    resize:none;
    margin: 0 2px;
    padding:10px;
    background-color:#e1d2b2;
    color:#4d4d4d;
}
.div{
    float:left;
    width:100%;
    height:100%;
    margin: 0 2px;
    padding:10px;
    overflow:auto;
}
.showDiv{
    position:absolute;
    top:0px;
    left:0px;
    background-color:#fff;
    padding:10px;
    overflow:auto;
    padding-left:20px;
    height:0%;
    width:0%;
    transition:ease .5s;
}
.trans{
    height:100%;
    width:100%;
}
.button{
    color:#fff;
}
pre{border:1px solid #a9a9a9; border-radius: 5px; padding:20px;}
pre {
  margin-top: 0;
  margin-bottom: 1rem;
  overflow: auto;
  -ms-overflow-style: scrollbar;
}
code,
kbd,
pre,
samp {
  font-family: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}
code {
  font-size: 87.5%;
  color: #e83e8c;
  word-break: break-word;
}
pre {
  display: block;
  font-size: 87.5%;
  color: #363636;
}
pre code {
  font-size: inherit;
  color: inherit;
  word-break: normal;
}
p{
    margin-bottom: 10px;
    text-indent:2rem;
}
table{
    width: 100%;
}
th,tr,td{
    text-align:center;
    border:1px solid #000;
}
h1,h2,h3,h4,h5,h6{
    padding-top: 1rem;
    padding-bottom: 1rem;
}
```

`router.js`我们的路由文件（`注意，里面有个知识点`）

```js
import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router)
const routes = []
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
```

`store.js`状态管理文件

```js
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
// dispatch执行actions里面的方法
let actions = {
    
}
// commit执行mutations里面的方法
let mutations = {
    
}
// 所需要的数据都定义在state里面 
let state = {
    // 先定义这两个参数，后面page组件和article组件会用到
    data:{},
    text:''
}
// 这里是返回一个新的vuex对象实例，至于为什么看route.js的解释
export function createStore() {
    return new Vuex.Store({
        state,
        actions,
        mutations
    })
}
```

`index.js`应用的实例文件

```js
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

```

接下来就是`entry-client.js`和`entry-server.js`两个入口文件。为什么是两个呢？从名字上就可以看出了，一个是在`服务端调用`的，一个是在`浏览器端调用`的，那么为什么两端都要调呢？下面就给大家展示一张流程图，看看从请求进入到返回结果到最终呈现给用户，这个过程都经历了什么。

<img style="width:80%" src="https://jsnows-images.oss-cn-beijing.aliyuncs.com/ssr%E6%9C%8D%E5%8A%A1%E7%AB%AF%E6%89%A7%E8%A1%8C%E6%B5%81%E7%A8%8B.png">

ok，照着这个思路我们从请求进来开始编写，也就是第一步`server.js`

- 这里我们会用到`express`框架来开发`server`端程序

```js
// server.js
const fs = require('fs')
const path = require('path')
const LRU = require('lru-cache')
const express = require('express')
const compression = require('compression')
const microcache = require('route-cache')
const resolve = file => path.resolve(__dirname, file)

// vueSSR最终将实例转为模板的方法
const {createBundleRenderer} = require('vue-server-renderer')

// =====================下|不需要关心(假数据接口配置)
let bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync(path.join(__dirname,'./data/data.json'));
const db = low(adapter);
const deMark = require('./serverApi/de-markdown.js');
// =====================上|不需要关心(假数据接口配置)

// 判断是否为生产环境
const isProd = process.env.NODE_ENV === 'production'
// 判断是否需要缓存
const useMicroCache = process.env.MICRO_CACHE !== 'false'

// 初始化一个服务端应用
const app = express()

// =====================下|不需要关心(假数据接口配置)
// 设置请求参数大小上限50M
app.use(bodyParser.urlencoded({ extended: true ,limit: '50mb'}));
app.use(bodyParser.json({limit: '50mb'}));
// 设置请求头允许所有源，避免出现跨域报错
app.all('*',function (req,res,next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods","POST,GET");
    next();
});
// =====================上|不需要关心(假数据接口配置)

function createRenderer(bundle, options) {
    // 返回一个渲染函数
    return createBundleRenderer(bundle, Object.assign(options, {
        // 设置缓存，用法参考下面链接
        // https://github.com/isaacs/node-lru-cache
        cache: LRU({
            max: 1000,
            maxAge: 1000 * 60 * 15
        }),
        basedir: resolve('./dist'),
        runInNewContext: false
    }))
}

let renderer
let readyPromise
// html模板路径
const templatePath = resolve('./src/app/index/index.html')

if (isProd) {
    // 生产环境直接应用打包后的manifest文件
    const template = fs.readFileSync(templatePath, 'utf-8')
    const bundle = require('./dist/vue-ssr-server-bundle.json')
    const clientManifest = require('./dist/vue-ssr-client-manifest.json')
    renderer = createRenderer(bundle, {
        template,
        clientManifest
    })
} else {
    // 开发环境
    console.log('文件打包中……')
    // setup-dev-server是一个webpack的server文件
    // 说白了效果等于上面的直接引用的效果，只不过会检测文件的修改实时更新
    // 可以一边调试一边看
    readyPromise = require('./build/setup-dev-server')(
        // 传入app主要是为了设置webpack-dev-middleware
        app,
        // 传入html模板文件的路径，为了后续拼接页面用
        templatePath,
        // webpack会把打包后的文件传进回调里
        (bundle, options) => {
            console.log('打包完成。');
            renderer = createRenderer(bundle, options)
        }
    )
}

// 设置为资源文件并缓存
const serve = (path, cache) => express.static(resolve(path), {
    maxAge: cache && isProd ? 1000 * 60 * 60 * 24 * 30 : 0
})

app.use(compression({threshold: 0}))
app.use('/dist', serve('./dist', true))

app.use(microcache.cacheSeconds(1, req => useMicroCache && req.originalUrl))

function render(req, res) {
    const s = Date.now()
    const handleError = err => {
        if (err.url) {
            res.redirect(err.url)
        } else if (err.code === 404) {
            res.status(404).send('404 | Page Not Found')
        } else {
            res.status(500).send('500 | Internal Server Error')
            console.error(`error during render : ${req.url}`)
            console.error(err.stack)
        }
    }

    const context = {
        title: 'blog',
        // 这里传入我们请求的路劲
        url: req.url
    }
    renderer.renderToString(context, (err, html) => {
        // 1.匹配路由
        // 将context传入renderToString，该方法会判断我们设置的路由中有没有这个路径
        // 如果没有就返回err
        // 如果有就会执行entry-server.js里的内容
        // 那么这个entry-server.js在调用createRenderer配置过了，可以查看上面的代码
        if (err) {
            return handleError(err)
        }
        console.log(html)
        // 5.返回带有数据的页面
        res.send(html)
        if (!isProd) {
            console.log(`whole request: ${Date.now() - s}ms`)
        }
    })
}

// =====================下|不需要关心(假数据接口)
app.get('/home',function(req,res){
    var page = req.query.page;
    var data = {
        code:0,
        data:{
            list:db.get('articles').value().slice((page-1)*10,page*10),
            total:db.get('articles').value().length
        }
    }
    res.end(JSON.stringify(data));
})
app.get('/text',function(req,res){
    if(!req.query.file_name){
        var data = {
            code:-1,
            message:'无效参数'
        }
        res.end(JSON.stringify(data));
        return
    }
    fs.exists(path.join(__dirname,`./data/${req.query.file_name}.md`), function(status){
        if(!status){
            var data = {
                code:-2,
                message:'文章未找到'
            }
            res.end(JSON.stringify(data));
        }else{
            if(fs.readFileSync(path.join(__dirname,`./data/${req.query.file_name}.md`))){
                var text = deMark(fs.readFileSync(path.join(__dirname,`./data/${req.query.file_name}.md`)).toString());
                var data = {
                    code:0,
                    data:text
                }
                res.end(JSON.stringify(data));
            }
        }
    })
})
// =====================上|不需要关心(假数据接口)

// 这个逻辑是如果是生产环境就直接调用render方法，否则等readyPromise完成（webpack-dev-server启动完成）后调用render方法
app.get('*', isProd ? render : (req, res) => {
    // 0.收到请求
    readyPromise.then(() => render(req, res))
})

const port = process.env.PORT || 8081;
app.listen(port, () => {
    console.log(`server started at localhost:${port}`)
})
```
这个文件所有要点都写在代码里了，主要看`0.收到请求`和`1.匹配路由`。然后其他的配置搭配着看。后面的步骤看`entry-server.js`。

```js
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

```
在`entry-server.js`中包含了`1.路由匹配的逻辑`、`2.实例vue`、以及`3.数据预取`的步骤。还有由`renderToString`执行的`4.拼装页面`以及`server.js`中的res.send(html)`5.返回带有数据的页面`

### `注意！`至此服务端的事情就都做完了

接下来是`entry-client.js`
```js
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
```
现在我们就可以执行`npm run dev`命令来看看效果了

不出意外是下面的这个效果吧
<img style="width:80%" src="https://jsnows-images.oss-cn-beijing.aliyuncs.com/%E5%B1%95%E7%A4%BAssr1.png">
看到这个效果，那么恭喜你，vueSSR核心流程你已经完成了
那么我们在`components`文件夹下添加三个组件
```
|--about-me
|  |--about-me.vue
|--article
|  |--article.vue
|--page
|  |--page.vue
```

`about-me.vue`

```js
<template>
<div>
    <Row class="content" type="flex" justify="center">
        <Col span="18" style="padding:20px;font-size:18px;box-shadow: 0px 2px 2px #888888;">
            <div class="headImgBox">
                <img src="https://jsnows-images.oss-cn-beijing.aliyuncs.com/20510811.jpeg" class="headImg">
                <p class="holderImg">图片加载中...</p>
            </div>
            <p style="text-indent:0rem;margin-bottom:10px;">
                <a style="background:#4ab122;" class="tags">nodeJS</a>
                <a style="background:#39a97e;" class="tags">Vue</a>
                <a style="background:#4cadc9;" class="tags">React</a>
                <a style="background:#0cbdb7;" class="tags">React Native</a>
                <a style="background:#bc0214;" class="tags">HTML5</a>
                <a style="background:#07ac97;" class="tags">Electron</a>
                <a style="background:#666666;" class="tags">Express</a>
                <a style="background:#3c3c3c;" class="tags">Github</a>
            </p>
            <p>hi，我是一名前端攻城狮（目前就职于<a target="view_window" href="http://www.doumi.com">斗米</a>），极其喜欢前端开发（涉猎不仅限于前端），专注于研究前端高效开发、模块化开发、前后端分离、跨平台开发方案。热爱开源，我的开源markdown编辑器（<a target="view_window" href="https://github.com/Jsnows/mgd">MGD</a>）基于<a target="view_window" href="https://cn.vuejs.org/">vue</a>、<a target="view_window" href="https://electronjs.org/">electron(跨平台桌面应用开发方案)</a>实现,欢迎<a target="view_window" href="https://github.com/Jsnows/mgd">star</a>。</p>
            <p style="font-size:14px;text-indent:0rem;">E-Mail : qiongxuecui@163.com</p>
            <p style="font-size:14px;text-indent:0rem;">QQ : 2643145092（非技术交流勿扰）</p>
            <p style="font-size:14px;text-indent:0rem;">Github : <a target="view_window" href="https://github.com/Jsnows">https://github.com/Jsnows</a></p>
        </Col>
    </Row>
</div>
</template>

<script>
    export default {
        components: {
            
        },
        data: function() {
            return {
                holder:true
            }
        },
        methods: {
            
        },
        created () {
            
        }
    }

    
</script>

<style>
    .tags{
        padding:5px 12px 5px;
        border-radius:5px;
        color:#fff;
        font-size: 12px;
        margin-right: 5px;
    }
    .tags:hover{
        color:#fff;
    }
    .headImgBox{
        width:200px;
        height:200px;
        border-radius:100px;
        float:left;
        margin-right:20px;
        background:#e0e0e0;
        color:#bbbbbb;
    }
    .headImg{
        width:200px;
        border-radius:100px;
        float:left;
        margin-right:20px;
        position:absolute;
        z-index:1;
    }
    .holderImg{
        position:absolute;
        left:8%;
        top:43%;
    }
</style>
```
`article.vue`

```js
<template>
    <Row class="content" type="flex" justify="center">
        <Col span="18" style="padding:20px;font-size:18px;box-shadow: 0px 2px 2px #888888;" v-html="text">
        </Col>
    </Row>
</template>

<script>

    export default {
        asyncData:({store,route})=>{
            return store.dispatch('GET_ARTICLE',route.query.name)
        },
        components: {
           
        },
        data: function() {
            return {
                R:'',
                textMark:this.$store.state.text
            }
        },
        computed: {
            text(){
                let self = this;
                return self.textMark;
            }
        },
        methods: {
           
        },
        created () {
            
        }
    }
</script>
```
`page.vue`

```js
<template>
    <Row v-if="listData" class="content" type="flex" justify="center">
        <Col justify="center" span="16">
            <template v-for="(item,index) in listData">
                <Row style="box-shadow: 0px 2px 2px #888888;">
                    <Row>
                        <Col style="padding:10px;" span="16">
                                <a @click="detail(item.file_name)" class="title">{{item.name}}</a>
                            <div class="desc">{{item.desc}}</div>
                            <div class="tag">
                                <template v-for="(icon,iIndex) in item.icons">
                                    <Icon style="margin:0 5px 0;" size="20" :type="icon"></Icon>
                                </template>
                            </div>
                            <span style="font-size:12px;color:#a1a1a1;">发表于 {{item.createTime}}</span>
                        </Col>
                        <Col span="4" offset="4">
                            <img style="height:100px;" :src="item.img"/>
                        </Col>
                    </Row>
                </Row>
                <br/>
                <br/>
            </template>
            <Row class="content" type="flex" justify="center">
                <Col align="middle">
                    <Page @on-change="toPage" :total="allNum"></Page>
                </Col>
            </Row>
        </Col>
        <Col span="5" offset="1" class="slidebar">
            <Affix>
                <h3 align="middle" class="solid-title">github好玩项目推荐
                </h3>
                <ul class="githublist">
                    <li><Icon type="social-github"></Icon><a class="project-name" target="view_window" href="https://github.com/robbyrussell/oh-my-zsh">《oh-my-zsh》好玩的shell工具</a></li>
                    <li><Icon type="social-github"></Icon><a class="project-name" target="view_window" href="https://github.com/Jsnows/mgd">《MGD》开源markdown编辑器</a></li>
                    <li><Icon type="social-github"></Icon><a class="project-name" target="view_window" href="https://github.com/guangqiang-liu/OneM">《OneM》RN写的完整项目</a></li>
                </ul>
            </Affix>
        </Col>
    </Row>
</template>

<script>
    import axios from 'axios'

    export default {
        asyncData({store,route}){
            return store.dispatch('GET_LIST_DATA')
        },
        components: {
            
        },
        data: function() {
            return {
                listData:this.$store.state.data.list,
                page:1,
                allNum:this.$store.state.data.total
            }
        },
        computed: {

        },
        methods: {
            detail(name){
                window.location.href = window.location.href + 'article?'+'name='+name;
                // window.open(url);
            },
            toPage(page){
                let self = this;
                self.page = page;
                self.getData();
            },
            getData(){
                let self = this;
                axios.get(`http://10.216.98.70:8081/home?page=${self.page}`)
                    .then(data=>{
                        self.listData = data.data.list;
                        console.log(data.data);
                        self.allNum = data.data.total;
                    })
                    .catch(err=>{console.log(err)})
            }
        },
        created () {
            let self = this;
        }
    }

    
</script>

<style src="../../../node_modules/highlight.js/styles/github.css"></style>
<style>
    .slidebar{
        border-radius:10px;
        box-shadow:0px 2px 1px #888888;
        border:1px solid #ebebeb;
        background: #c9c9c9;
    }
    .solid-title{
        border-bottom:1px solid #626262;
        margin: 0px 10px;
        color:#555;
        font-weight:400;
    }
    .githublist{
        font-size:18px;
        list-style:none;
        padding:5px 0px 20px 10px;
        border-top:1px solid #e7e7e7;
        margin: 0px 10px;
    }
    .project-name{
        color:#686868;
        font-size:14px;
        margin-left:5px;
        margin-bottom:5px;
    }
    .project-name:hover{
        color:#000;
    }
</style>
```
在组件`syncData`方法里我们`dispatch`了一些`actions`方法，这些我们需要再加进`store.js`文件里
```js
import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

// 这里改成你自己的本地ip!!!!
let url = 'http://ip:8081/'

Vue.use(Vuex)
// dispatch执行actions里面的方法
let actions = {
    GET_LIST_DATA:function({commit}){
        return new Promise((resolve, reject) => {
            // 调用我们的假接口，可在server.js查看
            // /home接口
            axios.get(`${url}home?page=1`).then((data)=>{
                commit('SET_DATA',data.data)
                resolve()
            })
        })
    },
    GET_ARTICLE:function({commit},name){
        return new Promise((resolve, reject) => {
            // 调用我们的假接口，可在server.js查看
            // /text接口
            axios.get(`${url}text?file_name=${encodeURI(name)}`).then((data)=>{
                commit('SET_TEXT',data.data)
                resolve()
            }).catch((err)=>{
                reject(err)
            })
        })
    }
}

// commit执行mutations里面的方法
let mutations = {
    SET_DATA:(state,{data}) => {
        state.data = data
    },
    SET_TEXT:(state,{data}) => {
        state.text = data
    }
}
let state = {
    data:{},
    text:''
}
export function createStore() {
    return new Vuex.Store({
        state,
        actions,
        mutations
    })
}
```


组件写好了那么我们在修改一下`router.js`文件添加进我们的路由

```js
import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router)

// ========================下|新增加的
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
// ========================上|新增加的


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
```
最后一步在`App.vue`里面添加路由标签
```js
<template>
    <div id="app">
        <Row type="flex" class="head-bar">
            <Col type="flex" justify="center" align="middle" class="item" span="2" offset="2">
                我的blog
            </Col>
            <Col type="flex" justify="center" class="item" align="middle" span="4">
            </Col>
            <Col align="middle" span="12" offset="2">
                <Menu mode="horizontal" theme="light">
                    <router-link :to="{ name: 'home'}">
                        <Menu-item key="1" name="1">
                            <Icon type="ios-paper"></Icon>
                            文章列表
                        </Menu-item>
                    </router-link>
                    <router-link :to="{ name: 'aboutMe'}">
                        <Menu-item key="2" name="2">
                            <Icon type="person"></Icon>
                            about me
                        </Menu-item>
                    </router-link>
                </Menu>
            </Col>
        </Row>
        <br/>
        <!--在这里修改了|下-->
        <router-view></router-view>
        <!--在这里修改了|上-->
        <Row class="content" type="flex" justify="center">
            <Col span="18" align="middle" style="padding:10px;font-size:12px;">
                Copyright © 2016 - 2018 jsnows All rights reserved.
            </Col>
        </Row>
    </div>
</template>

<script>

    // 组件实例对象

    export default {
        components: {

        },
        data: function() {
            return {

            }
        },
        computed: {

        },
        methods: {

        },
        beforeCreate() {

        },
        created() {

        }

    }


</script>

<style src="../../../node_modules/iview/dist/styles/iview.css"></style>
<style src="../../../node_modules/highlight.js/styles/github.css"></style>
<style src="static/index.css"></style>
```

OK,到这里 ~ 一切都大功告成了。
使用命令`npm run dev`就可以查看了

