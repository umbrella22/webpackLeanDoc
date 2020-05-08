# 如何优化webpack配置
> 想了很久，在之前的webpack教程中，也仅仅只是教了大家，如何使用webapck4手撸一份vue可用的配置，但是在我的实际工作中，会遇到很多需要优化的地方，例如：cdn加速， gzip等这些操作，再加上，原本的那一份教程，在css和css预处理器的操作上，有很多的不足和细微的问题。现在一点点的捋出来，希望能够帮到大家。
- 首先就是关于css和css预处理器的设置上，由于当时时间问题，很草率地就直接自己写上了，问题是没有问题，但是相比vue-cli2生成的那个配置，我还是有很多的不足，现在我就在vue-cli2的基础上，对其进行修改，接上篇的配置信息，我们还需要在utlis.js中添加对css的处理代码如下
## 关于部分css类的loader的优化方案
```JavaScript
// 将css类loader放到这里一并处理，不再写在dev和prod中了
exports.cssLoaders = function (options) {
    options = options || {}

    const cssLoader = {
        loader: 'css-loader',
        options: {
            sourceMap: options.sourceMap
        }
    }

    const postcssLoader = {
        loader: 'postcss-loader',
        options: {
            sourceMap: options.sourceMap
        }
    }

    // 这里就是生成loader和其对应的配置
    function generateLoaders(loader, loaderOptions) {
        const loaders = options.usePostCSS ? [cssLoader, postcssLoader] : [cssLoader]

        if (loader) {
            loaders.push({
                loader: loader + '-loader',
                options: Object.assign({}, loaderOptions, {
                    sourceMap: options.sourceMap
                })
            })
        }

        // 当配置信息中开启此项时，启用css分离压缩
        // 这一项在生产环境时，是默认开启的
        if (options.extract) {
            return [MiniCssPlugin.loader].concat(loaders)
        } else {
            // 如果不开启则让vue-style-loader来处理
            return ['vue-style-loader'].concat(loaders)
        }
    }

    // https://vue-loader.vuejs.org/en/configurations/extract-css.html
    return {
        css: generateLoaders(),
        postcss: generateLoaders(),
        less: generateLoaders('less'),
        sass: generateLoaders('sass', { indentedSyntax: true }),
        scss: generateLoaders('sass'),
        stylus: generateLoaders('stylus'),
        styl: generateLoaders('stylus')
    }
}

// 根据上面的函数遍历出来的各个css预处理器的loader进行最后的拼装
exports.styleLoaders = function (options) {
    const output = []
    const loaders = exports.cssLoaders(options)

    for (const extension in loaders) {
        const loader = loaders[extension]
        output.push({
            test: new RegExp('\\.' + extension + '$'),
            use: loader
        })
    }

    return output
}
```
- 完整的utils.js呢，我也放上来吧，以免有的朋友不大知道这段代码该加在什么位置
```JavaScript
'use strict'
const path = require('path')
const packageConfig = require('../package.json')
const config = require('../config')
// 这里为什么要引入这个呢，由于webpack4的原因，需要用到这个插件的loader
const MiniCssPlugin = require('mini-css-extract-plugin');

// 将资源文件合并到config文件中的配置项中
exports.assetsPath = function (_path) {
    const assetsSubDirectory = process.env.NODE_ENV === 'production'
        ? config.build.assetsSubDirectory
        : config.dev.assetsSubDirectory

    return path.posix.join(assetsSubDirectory, _path)
}
// 将css类loader放到这里一并处理，不再写在dev和prod中了
exports.cssLoaders = function (options) {
    options = options || {}

    const cssLoader = {
        loader: 'css-loader',
        options: {
            sourceMap: options.sourceMap
        }
    }

    const postcssLoader = {
        loader: 'postcss-loader',
        options: {
            sourceMap: options.sourceMap
        }
    }

    // 这里就是生成loader和其对应的配置
    function generateLoaders(loader, loaderOptions) {
        const loaders = options.usePostCSS ? [cssLoader, postcssLoader] : [cssLoader]

        if (loader) {
            loaders.push({
                loader: loader + '-loader',
                options: Object.assign({}, loaderOptions, {
                    sourceMap: options.sourceMap
                })
            })
        }

        // 当配置信息中开启此项时，启用css分离压缩
        // 这一项在生产环境时，是默认开启的
        if (options.extract) {
            return [MiniCssPlugin.loader].concat(loaders)
        } else {
            return ['vue-style-loader'].concat(loaders)
        }
    }

    // https://vue-loader.vuejs.org/en/configurations/extract-css.html
    // 返回对应的loader
    return {
        css: generateLoaders(),
        postcss: generateLoaders(),
        less: generateLoaders('less'),
        sass: generateLoaders('sass', { indentedSyntax: true }),
        scss: generateLoaders('sass'),
        stylus: generateLoaders('stylus'),
        styl: generateLoaders('stylus')
    }
}

// 根据上面的函数遍历出来的各个css预处理器的loader进行最后的拼装
// 这里的options就是在调用的时候向内传递一些loader的配置信息，比如map文件等
exports.styleLoaders = function (options) {
    const output = []
    const loaders = exports.cssLoaders(options)

    for (const extension in loaders) {
        const loader = loaders[extension]
        output.push({
            test: new RegExp('\\.' + extension + '$'),
            use: loader
        })
    }

    return output
}
// 当出现报错时，弹出系统弹窗告知出现错误
exports.createNotifierCallback = () => {
    const notifier = require('node-notifier')

    return (severity, errors) => {
        if (severity !== 'error') return

        const error = errors[0]
        const filename = error.file && error.file.split('!').pop()
        // 这里是设置当出现错误时，给你的，标题，错误信息，错误文件地址，以及图标
        notifier.notify({
            title: packageConfig.name,
            message: severity + ': ' + error.name,
            subtitle: filename || '',
            icon: path.join(__dirname, 'logo.png')
        })
    }
}

// 获取本地局域网ip
exports.getNetworkIp = () => {
    const os = require('os');
    let needHost = ''; // 打开的host
    try {
        // 获得网络接口列表
        let network = os.networkInterfaces();
        for (let dev in network) {
            let iface = network[dev];
            for (let i = 0; i < iface.length; i++) {
                let alias = iface[i];
                if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                    needHost = alias.address;
                }
            }
        }
    } catch (e) {
        needHost = 'localhost';
    }
    return needHost;
}
```
- 然后我们需要在原webpack.dev.js和webpack.prod.js中去修改我们之前的rules：
```JavaScript
    //  开发环境下
    ...
    mode: 'development',
    devtool: config.dev.devtool,
    module: {
        // 将之前的rules数组直接替换成下面的样子
        rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap, usePostCSS: true })
    },
    output: {
        filename: '[name].js',
    }
    ...
    // 生产环境下
    mode: 'production',
    devtool: config.build.productionSourceMap ? config.build.devtool : false,
    module: {
        // 将之前的rules数组直接替换成下面的样子
        rules: utils.styleLoaders({
            // 是否开启css的map映射
            sourceMap: config.build.productionSourceMap,
            // 该选项是是否开启css分离压缩的选项
            extract: true,
            // 是否使用postcss-loader添加浏览器前缀
            usePostCSS: true
        })
    },
    output: {
        path: config.build.assetsRoot,
    },
    ...
```
- 好啦，大家应该就很清楚了，在这里我们使用了`utlis`中的`styleLoaders`函数，由上面的代码我们就就可以知道，该函数接收至多三个对象 ` sourceMap `，` extract `，` usePostCSS `；他们均是一个布尔值，从左到右分别表示，是否打开css的map文件，是否开启css抽取压缩，是否为一些css样式添加浏览器前缀。至此，我们就可以彻底的放心大胆的使用市面上已有的css预处理器，因为在`utlis`中的`cssLoaders`函数中，我们看到，它会返回你设置好的所有的预处理器loader，这样我们就不用再两个webpack文件中都要去设置，只需要当出了新的css预处理器的时候，加到这里就好了。
## 当依赖库十分庞大时，使用dll功能解决dev缓慢的问题
> 很多时候，项目的依赖非常的多，这就导致了每次更改之后热更新需要等很久的时候，那么此时，我们就需要使用dll来解决这个问题了，当然，和win上的dll文件是有很大的区别的，我们需要使用的是 webpack自带的 `DllPlugin`插件，现在附上我的代码:
```JavaScript

const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpackbar = require('webpackbar')
module.exports = {
    mode: 'development',
    entry: {
        // 这里就是添加
        vendor: ['axios', 'element-ui', 'vue', 'vue-router', 'echarts']
    },
    output: {
        filename: '[name].dll.js',
        path: path.resolve(__dirname, 'dist'),
        library: '_dll_[name]',
    },
    plugins: [
        new CleanWebpackPlugin(),//clean dist
        new webpack.DllPlugin({
            name: '_dll_[name]',
            path: path.join(__dirname, 'dist', '[name].manifest.json'),
        }),
        new webpackbar({
            name: "抽取依赖中",
        })
    ],
};
```

::: warning 注意
此时你需要在index.development.html中引入这个输出的dll文件才算真的完成了dll化操作。

但是在webpack4中其实这个优化已经无所谓了，因为webpack4已经做了很多优化，这就让dll化并不能达到预期效果。
::: 

- 然后我们在package.json中添加脚本 ` "dll":"webpack --config webpack.vendor.js" `在每次添加了大型依赖之前可以将其加入vendor数组内，并且执行 ` npm run dll `，这样每次编译的时候，就不会带上那些大型依赖，也就不会导致每次更改一个字编译都要等很久的囧场景了~

## 使用hard-source-webpack-plugin解决dev缓慢问题
在dll化开始疲软之后，hard-source-webpack-plugin插件走入了大家的视野中，为模块提供中间缓存步骤。为了查看结果，您需要使用此插件运行webpack两次：第一次构建将花费正常的时间。第二次构建将显着加快（大概提升90%的构建速度）该插件已经被webpack5纳入默认优化方案中了，而在webpack4中我们也同样可以享受到这90%的加速！
```bash
npm install --save-dev hard-source-webpack-plugin 或 yarn add --dev hard-source-webpack-plugin
```
然后我们在webpack.base.js中引入并添加插件即可！
::: warning 提示
在当前例子中，我已经默认添加该插件，所以大家可以不用重复操作哦。
:::
## 使用happypack让重构速度更上一层楼
happypack是将任务分解成多个子进程让他们并发执行，之后将结果返回给子进程，由于js是单线程模型，每次webpack编译时都是一核有难多核围观，所以借助happypack能够迅速提升webpack的编译速度。
首先我们安装它：
```bash
npm i -D happypack
```
然后在`webpack.base.js`文件中新增：
```js
const os = require("os")
const HappyPack = require("happypack")
// 设置进程池大小同当前cpu的核心数
const HappyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length })
// ...rules
        {
            test: /\.js$/,
            // 此处是使用happypack中的loader去接管对js的操作其中id是指的是你happypack实例中的id
            use: 'happypack/loader?id=HappyRendererBabel',
            include: [resolve('src'), resolve('test'), resolve('node_modules/webpack-dev-server/client')]
        },
// ...插件位置
        new HappyPack({
            // 名称
            id: 'HappyRendererBabel',
            // 使用的loader，配置同rules中的配置这里是配置了babel-loader
            loaders: [{
                loader: 'babel-loader',
                options: {
                    cacheDirectory: true
                }
            }],
            threadPool: HappyThreadPool
        }),
```
::: warning 注意
但是在对于url-loader和file-loader,happypack支持并不佳，所以不建议对这些loader进行使用，同样对于css而言也并不推荐，因为当你忘记共享进程池时，同样会导致编译缓慢。
:::
happypack中的参数
- `id: Sting` 用唯一的标识符 id 来代表当前的 HappyPack 是用来处理一类特定的文件.
- `loaders: Array`  用法和 webpack Loader 配置中一样.
- `threads: Number` 代表开启几个子进程去处理这一类型的文件，默认是3个，类型必须是整数。
- `verbose: Boolean` 是否允许 HappyPack 输出日志，默认是 `true`。
- `threadPool: HappyThreadPool` 代表共享进程池，即多个 HappyPack 实例都使用同一个共享进程池中的子进程去处理任务，以防止资源占用过多。
- `verboseWhenProfiling: Boolean` 开启`webpack --profile` ,仍然希望HappyPack产生输出。
- `debug: Boolean` 启用debug 用于故障排查。默认 `false`。
## 关于cdn加速的一些建议
> 随着需求越来越多，各种依赖库也越来越多，如果是跨平台应用还好，资源加载都在本地，不需要用户从我们服务器下载，但是，线上的站怎么办，我们的服务器带宽有限，压根就没法顾及这些，此时，cdn会给我们一些帮助，使用cdn可以将我们的一些依赖放在他们的服务器中分发，好处不言而喻，在去除了依赖库的情况下，我们的代码再加上进行了压缩，分包等一系列处理，不仅仅只是缩短了首屏启动的时间，那么现在来贴代码：
```JavaScript
// 在原打包分析下添加或者除配置对象中的任意位置
// 这里有涉及到config文件夹中index文件的build对象
// 那么我们肯定也要在config文件中做对应的设置了
if (config.build.cdn) {
    // 此处是从config中读取NeedCdnModuleName
    options.externals = config.build.NeedCdnModuleName
    // 这里按需加载了一个依赖，所以，您需要安装它
    const WebpackCdnPlugin = require('webpack-cdn-plugin');
    options.plugins.push(new WebpackCdnPlugin({
        modules: config.build.NeedCdnModuleAddress
    }))
}
```
- 关于config文件夹中index文件的内容则是在其build对象下新添代码
```JavaScript
build:{
        // 此处配置可使用插件自动配置需要cdn加速的模块
        // 你可能需要执行 npm i webpack-cdn-plugin -D 命令来安装这个依赖
        cdn: false,
        // 需要说明的是，这个里，用于配置需要被webpack忽略的依赖包名
        // 左边是npm安装时的名字，而右边则是该包对全局暴漏的名字
        // 如果不知道全局名称怎么办，
        // 详情配置请参考：https://webpack.docschina.org/configuration/externals/
        // 该插件默认走的是https://unpkg.com cdn服务器
        NeedCdnModuleName: {
            vue: 'Vue',
            'vue-router': 'VueRouter',
        },
        // 这里则是被webpack忽略之后，加载cdn
        // name表示该模块在npm中的命名，var表示该模块全局变量名称，应当和上面右侧设置一致
        // path则代表是该模块在unpkg中的文件路径，如果不清楚清去该站点自行查询。
        // 详情配置请参考：https://www.npmjs.com/package/webpack-cdn-plugin
        NeedCdnModuleAddress: [{
            name: 'vue',
            var: 'Vue',
            path: 'dist/vue.runtime.min.js',
        }, {
            name: 'vue-router',
            var: 'VueRouter',
            path: 'dist/vue-router.min.js',
        }],
}
```
> 这里需要提一下，在vue中，当你在main中引入了依赖库的css时，如果你没有判断就直接使用import的话，css则部分时没有加入cdn的，这里需要注意一下，在demo中，我会追加跟多本文中额外的信息，毕竟很多东西只看文章还是太抽象，结合代码学习，是最快的。
## 关于启用gzip
> 有时候，我们即使使用了cdn加速，剔除了所有的依赖，但是我们站本身的代码就非常的庞大，分包之后依旧还有100k以上的大小时，（可能你们会说100k没什么嘛，可以忽略了，那么这个就可以忽略查看）我们可以启用gzip，将我们的代码放到压缩包中在传到用户计算机上时，由浏览器解压执行；此时我们需要使用 ` compression-webpack-plugin `，该插件支持三种压缩算法 `brotliCompress` 和 `gzip` 还有 `zopfli` 至于哪种更好，就不在本文的阐述范围内了，上代码：
```JavaScript
// 您可以选择添加在cdn下面
// 当config中对应项为true时,启用gzip功能
if (config.build.gzip) {
    const CompressionPlugin = require('compression-webpack-plugin');
    options.plugins.push(new CompressionPlugin({
        // 这里如果算法为brotliCompress的话,需要将gz改为br
        filename: '[path].gz[query]',
        // 压缩算法,这里的话,你可以选择brotliCompress和gzip还有zopfli,当然这一切要取决于用户的浏览器支持哪种压缩模式
        // 若要使用brotliCompress算法,需要nodejs11.7以上.并且后缀名为.br
        algorithm: 'gzip',
        // 根据config文件设置的情况对什么文件进行压缩
        test: new RegExp(
            '\\.(' +
            config.build.productionGzipExtensions.join('|') +
            ')$'
        ),
        // 超过该大小就会压缩(单位:字节)
        threshold: 10240,
        // 压缩比,官方给的解释设置0.8是最佳了.至于计算公式,就是minRatio = 压缩后的大小 / 原来的大小
        // 当压缩比比这个低的话,就会进行压缩处理,如果设置成1的话,就是全部都处理了.
        minRatio: 0.8,
        // 是否删除原文件(默认也是false)
        // 这这里并不推荐删除源文件,因为需要照顾到不支持gzip的浏览器
        deleteOriginalAssets: false,
    })
    )
}
```
- 同样附上config中的代码
```JavaScript   
// 此处配置是是否使用gzip功能对代码进行高强度的压缩(值得注意的是gzip功能需要nginx做出对应的配置,谨慎开启)
// 你可能需要执行 npm i compression-webpack-plugin -D 命令来安装这个依赖
// 因为本包中可能会不带这项依赖，毕竟不是每个人都需要
gzip: false,
// 这里设置需要被压缩的文件后缀默认是只压缩css和js
productionGzipExtensions: ['js', 'css']
```
- 这里，注释中也说明了，需要nginx或者您所知道您项目中所使用承载页面具备 `httpServer` 的服务器中去配置，开启gzip或是其他的压缩选项。
## 关于控制台的友好化输出
> 在Nuxt中我发现其控制台的进度条不仅仅可以给开发者一个进度告知，并且还会显示当前正在加载什么，幸运的是，他们将这个插件开源了出来，废话不多说，开整！
- 首先是安装该插件 ` npm i webpackbar -D ` 然后在我们的webpack公共配置中加入
```JavaScript
const webpackbar = require('webpackbar')
/*这里是其他代码*/
// 在插件数组中加入
plugins: [
    // 该插件支持一个名称，可用于控制台输出
        new webpackbar({
            name: "",
        })
    ],
```
然后我们重启一次webpack，就看到对应的效果了。其实还有更多的webpack的操作台输出插件，但是它们在win上表现非常差，所以我就不再介绍~

## 自动上传已经打包好的代码
> 很多时候，前端代码打包好了，都要自己手动去上传到服务器的对应目录，但针对linux的服务器，几乎很多前端是非常非常不愿意去碰的因为对命令的不熟悉，又或者不愿意去触碰那个只有黑洞洞的命令行窗口等一些原因，将上传这个工作甩手给了后端大佬，又或是运维大佬，但是他们又不懂前端，如果出现报错，或者环境问题，他们可能就直接告诉你，代码有问题，然后你排查了又没问题，很浪费时间。

所以我将node-scp2这个包封装成webpack插件，利用它将我们打包好的文件上传到具有ssh的服务器中。使用非常便利。

```bash
npm i webpack-autoupload-plugin --save--dev
```

```JavaScript
// 使用方法
const AutoUploadPlugin = require("webpack-autoupload-plugin")

plugins:[
    new AutoUploadPlugin({
        ip: '',
        user: '',
        password: '',
        src: '',
        dist: ''
    })
]
```
参数说明:

参数|类型|说明
--|:--:|--
ip|String|您的服务器ip
user|String|您的服务器登录用户名
password|String|您的服务器登录密码
src|String|需要上传的文件夹路径
dist|String|服务器中的文件夹路径

- 然后在你打包完成之后，该插件就会自动上传到你所设置的服务器地址啦，是不是相当的方便呢~
