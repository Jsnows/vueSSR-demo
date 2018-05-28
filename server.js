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