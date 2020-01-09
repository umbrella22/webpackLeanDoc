# 结合vue配置一个环境分离的配置
> 前两篇讲到了几个常用的插件和loader，那么大家对webpack也有了一个最基本的认识，知道了它是如何配置并正常工作的，那么这篇我将通过vue来具体的想大家说明如何根据环境进行对应的操作。（其实是我不大想使用vue3.0脚手架生成，但是我又想使用webpack4.0....所以就仿照vue2.x脚手架生成的webpack配置，完成webpack4.0的配置）
## package.json文件介绍
- 首先我们需要一些额外的`plugin`和`loader`现在我贴出我的`package.json`文件；你可以直接复制下来然后放到`package.json`文件中也是可以使用的。
```json
{
  "name": "learn-vue",
  "version": "1.0.0",
  "description": "",
  "scripts": {
    "dev": "webpack-dev-server --inline --config webpack/webpack.dev.js",
    "start": "npm run dev",
    "build": "node webpack/build.js"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
    "echarts": "^4.6.0",
    "element-ui": "^2.13.0",
    "vue": "^2.6.11",
    "vue-router": "^3.1.3"
  },
  "devDependencies": {
    "@babel/cli": "^7.7.7",
    "@babel/core": "^7.7.7",
    "@babel/plugin-syntax-dynamic-import": "^7.7.4",
    "@babel/plugin-transform-runtime": "^7.7.6",
    "@babel/preset-env": "^7.7.7",
    "@babel/runtime": "^7.7.7",
    "autoprefixer": "^9.7.3",
    "babel-loader": "^8.0.6",
    "clean-webpack-plugin": "^3.0.0",
    "compression-webpack-plugin": "^3.1.0",
    "css-loader": "^3.4.1",
    "file-loader": "^5.0.2",
    "friendly-errors-webpack-plugin": "^1.7.0",
    "hard-source-webpack-plugin": "^0.13.1",
    "html-webpack-plugin": "^3.2.0",
    "mini-css-extract-plugin": "^0.9.0",
    "node-notifier": "^6.0.0",
    "node-sass": "^4.13.0",
    "optimize-css-assets-webpack-plugin": "^5.0.3",
    "ora": "^4.0.3",
    "portfinder": "^1.0.25",
    "postcss-import": "^12.0.1",
    "postcss-loader": "^3.0.0",
    "postcss-url": "^8.0.0",
    "sass-loader": "^8.0.0",
    "terser-webpack-plugin": "^2.3.2",
    "url-loader": "^3.0.0",
    "vue-loader": "^15.8.3",
    "vue-template-compiler": "^2.6.11",
    "webpack": "^4.41.5",
    "webpack-cdn-plugin": "^3.2.0",
    "webpack-cli": "^3.3.10",
    "webpack-dev-server": "^3.10.1",
    "webpack-merge": "^4.2.2",
    "webpackbar": "^4.0.0"
  }
}





```
## 文件目录介绍
- 然后便是文件目录的结构介绍，既然我们需要根据环境进行代码分离，那么我们势必需要很多的配置文件，现在我贴上我自己的目录结构：
```
├─config
│      dev.env.js
│      index.js
│      prod.env.js
│
├─dist
│
├─src
│  │  App.vue
│  │  index.html
│  │  main.js
│  │
│  ├─router
│  │      index.js
│  │
│  └─views
│          Helloworld.vue
│
├─webpack
│       build.js
│       utils.js
│       webpack.base.js
│       webpack.dev.js
│       webpack.prod.js
├─.babelrc
├─.postcssrc.js
└─package.json
```
## config文件夹说明
 > 现在我来介绍下这几个文件夹，首先是 `config` 文件夹，该文件夹中存储着抽离出来需要随时变更的webpack配置信息，总不能我们老是去变更webpack的配置文件，那样不仅仅会很麻烦而且很容易改错，那么我们就将需要经常变更的变量抽离出来，放到这里，这里分index，dev，prod三个文件，其中index文件中包含着这些配置信息，我们来看一看都写了什么：
 ```js
 'use strict'
const path = require('path')

module.exports = {
    // 对应dev环境的快捷设置
    dev: {
        assetsSubDirectory: 'static',
        assetsPublicPath: '/',
        // 使用webpack进行端口代理，一般是用于跨域
        proxyTable: {},
        // 使用什么devtools
        devtool: 'cheap-module-eval-source-map',
        // 这是设置的是局域网和本地都可以访问
        host: '0.0.0.0',
        // 端口号
        port: 8080,
        // 是否自动打开浏览器
        autoOpenBrowser: false,
        errorOverlay: true,
        // 是否使用系统提示弹出错误简略信息
        notifyOnErrors: true,
        poll: false,
    },
    //  对应build环境的快捷设置
    build: {
        // 模板index
        index: path.resolve(__dirname, '../dist/index.html'),

        // 此处决定打包的文件夹
        assetsRoot: path.resolve(__dirname, '../dist'),
        assetsSubDirectory: 'static',
        // 针对vue，如果你想通过双击index打开你的页面的话
        // 你就需要更改为'./'即可
        assetsPublicPath: '/',
        
        /**
         * 打包时是否启用map
         */

        productionSourceMap: false,
        devtool: '#source-map',

        // 此处配置是是否启动webpack打包检测你可以通过使用以下命令进行启动
        // `npm run build --report`
        // 或者你也可以直接设置true或者false来直接进行控制
        bundleAnalyzerReport: process.env.npm_config_report,
    }
}
 ```
而dev和prod文件则则是这样的，dev.env.js：
```js
'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  // 设置运行环境
  NODE_ENV: '"development"'
})
```
prod.env.js：
```js
'use strict'
module.exports = {
  NODE_ENV: '"production"'
}
```
::: tip 
在这里我们可以直接使用不同的开发环境进行关键词设置，然后这里同样还能存放服务器地址，这样的话就可以不同的环境连接不同的服务器，就不需要手动去更改了。但是需要在webpack的插件中新增一个webpack的一个插件，稍后会提到。dist文件夹，就不多提了，打包之后的文件都在这里。src文件夹，我们的源码存放地点，因为使用的是vue，我就仿照vue2.x的脚手架的目录结构了，这里大家看着做个参考就好。那么重点就是我们的这个webpack文件夹了，这里，存放了webpack的配置信息，让我们挨个探索~
:::
```js
// 首先是我们的webpack.base文件
'use strict'
const path = require('path');
const utils = require('./utils')
const config = require('../config')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const webpackbar = require('webpackbar')
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');

function resolve(dir) {
    return path.join(__dirname, '..', dir)
}
module.exports = {
    context: path.resolve(__dirname, '../'),
    entry: {
        app: './src/main.js'
    },
    output: {
        filename: utils.assetsPath('js/[name].[chunkhash:8].js'),
        chunkFilename: utils.assetsPath('js/[name].[chunkhash:8].bundle.js'),
        path: config.build.assetsRoot,
        publicPath: process.env.NODE_ENV === 'production'
            ? config.build.assetsPublicPath
            : config.dev.assetsPublicPath
    },
    resolve: {
        extensions: ['.js', '.vue', '.json'],
        alias: {
            '@': resolve('src'),
        }
    },
    module: {
        rules: [{
            test: /\.vue$/,
            use: 'vue-loader'
        },
        {
            test: /\.js$/,
            loader: 'babel-loader?cacheDirectory=true',
            include: [resolve('src'), resolve('test'), resolve('node_modules/webpack-dev-server/client')]
        },
        {
            test: /\.(gif|png|jpe?g|svg)$/,
            use: [{
                loader: 'url-loader',
                options: {
                    limit: 8192,
                    name: utils.assetsPath('image/[name]-[hash:8].[ext]')
                }
            }]
        },
        {
            test: /\.(woff|woff2|eot|ttf|otf)$/,
            use: [{
                loader: 'url-loader',
                options: {
                    limit: 8192,
                    name: utils.assetsPath('fonts/[name]-[hash:8].[ext]')
                }
            }]
        }
        ]
    },
    plugins: [
        new VueLoaderPlugin(),
        new webpackbar({
            name: "示例",
        }),
        new HardSourceWebpackPlugin()
    ],
};
```
- 在这里我们将公共部分的loader提取出来进行，在这里我们也将字体和js以及图片文件分离开归类各个文件夹，而`VueLoaderPlugin`这个插件由于vue2.5以后均需要载入所以我就放在这里了。我们再看看剩下的两个webpack文件。
```js
// webpack.dev.js
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');
const common = require('./webpack.base.js');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const config = require("../config")
const portfinder = require('portfinder')
const utils = require('./utils')
const dev = require('../config/dev.env')
// 这些配置信息是在config文件夹的index中设置的
const HOST = process.env.HOST
const PORT = process.env.PORT && Number(process.env.PORT)

const options = merge(common, {
    devtool: config.dev.devtool,
    module: {
        rules: [
          // 由于这里我可能会用到scss，所以就直接添加了sass-loader用来处理
          // 如果你们需要less，stylus预处理器，就请自行添加吧~规则在前面有说哦。
            {
                test: /\.css$/,
                use: ['vue-style-loader', 'css-loader']
            },
            {
                test: /\.scss/,
                use: ['vue-style-loader', 'css-loader', 'sass-loader']
            },
        ]
    },
    output: {
        filename: '[name].js',
    },
    devServer: {
        // 日志等级
        clientLogLevel: 'warning',
        // 当使用history出现404时则自动调回index页
        historyApiFallback: true,
        contentBase: path.join(__dirname, "../dist"),
        // 热加载模式
        hot: true,
        // 启用gzip
        compress: false,
        // 设置webpackdevServer地址
        host: HOST || config.dev.host,
        // 设置webpackdevServer端口
        port: PORT || config.dev.port,
        // 设置是否自动打开浏览器
        open: config.dev.autoOpenBrowser,
        // 当编译器出现错误时，在全屏覆盖显示错误位置
        overlay: config.dev.errorOverlay
            ? { warnings: false, errors: true }
            : false,
        // 从config文件中读取端口代理设置
        proxy: config.dev.proxyTable,
        // 启用简洁报错
        quiet: true,
        // 启用监听文件变化
        watchOptions: {
            poll: config.dev.poll,
        }
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': dev
        }),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'src/index.development.html',
            chunksSortMode: 'none',
            inject: 'body',
            hash: true
        }),
        new webpack.HotModuleReplacementPlugin()
    ]
});
// 使用portfinder来检查端口占用问题，如果发现端口出现被占用的情况
// 则端口号+1，直到找到可以使用的端口为止，默认情况是8000到25565
// 当然你还可以自己设置搜索范围，详情请查看：https://www.npmjs.com/package/portfinder

// 这里还使用了FriendlyErrorsPlugin对控制台输出信息进行简略友好化输出。
// 详情使用请查看：https://www.npmjs.com/package/friendly-errors-webpack-plugin

// 当一切准备就绪就通过Promise.resolve方法抛出处理好的webpack配置信息
// 出现错误则是Promise.reject方法抛出错误信息供开发者调试修改
module.exports = new Promise((resolve, reject) => {
    portfinder.basePort = process.env.PORT || config.dev.port
    portfinder.getPort((err, port) => {
        if (err) {
            reject(err)
        } else {
            process.env.PORT = port
            options.devServer.port = port
            options.plugins.push(new FriendlyErrorsPlugin({
                compilationSuccessInfo: {
                    messages: [`您的项目已成功启动`],
                    notes: [`本机访问请在vscode的终端中按住左ctrl键点击: http://127.0.0.1:${port} \n `, `局域网访问地址: http://${utils.getNetworkIp()}:${port}`],
                },
                onErrors: config.dev.notifyOnErrors
                    ? utils.createNotifierCallback()
                    : undefined
            }))

            resolve(options)
        }
    })
})
```
```js
// webpack.prod.js
const path = require('path');
const webpack = require('webpack');
const common = require('./webpack.base.js');
const merge = require('webpack-merge');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const config = require('../config')
const utils = require('./utils')
const env = require('../config/prod.env')

const options = merge(common, {
    mode: "production",
    devtool: config.build.productionSourceMap ? config.build.devtool : false,
    output: {
        path: config.build.assetsRoot,
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    MiniCssPlugin.loader,
                    {
                        loader: 'css-loader'
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                          // 是否开启css映射，根据config文件设置决定
                            sourceMap: config.build.productionSourceMap
                        }
                    }]
            },
            {
                test: /\.scss$/,
                use: [
                    MiniCssPlugin.loader,
                    {
                        loader: 'css-loader'
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            sourceMap: config.build.productionSourceMap
                        }
                    },
                    'sass-loader']
            },
            {
                test: /\.styl(us)?$/,
                use: [
                    MiniCssPlugin.loader,
                    {
                        loader: 'css-loader'
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            sourceMap: config.build.productionSourceMap
                        }
                    },
                    'stylus-loader']
            }
        ]

    },
    optimization: {
        splitChunks: {
            chunks: "async",
            cacheGroups: {
                vendor: { 
                    // 将第三方模块提取出来
                    minSize: 30000,
                    minChunks: 1,
                    test: /node_modules/,
                    chunks: 'initial',
                    name: 'vendor',
                    priority: 1
                },
                commons: {
                    test: /[\\/]src[\\/]common[\\/]/,
                    name: 'commons',
                    minSize: 30000,
                    minChunks: 3,
                    chunks: 'initial',
                    priority: -1,
                    // 这个配置允许我们使用已经存在的代码块
                    reuseExistingChunk: true 
                }
            }
        },
        runtimeChunk: { name: 'runtime' },
        minimizer: [
            new TerserPlugin({
                test: /\.js(\?.*)?$/i,
                // 是否开启多线程
                parallel: true,
                // 是否开启映射
                sourceMap: config.build.productionSourceMap,
                terserOptions: {
                    warnings: false,
                    // 去除打印
                    compress: {
                        warnings: false,
                        drop_console: true,
                        drop_debugger: true,
                        pure_funcs: ['console.log']
                    },
                    // 去除注释，当设置为true时，会保留注释
                    // 当然这个默认是false
                    output: {
                        comments: false,
                    },
                }
            }),
            new OptimizeCssAssetsPlugin({
                assetNameRegExp: /\.css$/g,
                cssProcessorOptions: {
                    safe: true,
                    autoprefixer: { disable: true },
                    mergeLonghand: false,
                    discardComments: {
                        // 移除css中的注释
                        removeAll: true 
                    }
                },
                canPrint: true
            })
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': env
        }),
        new CleanWebpackPlugin(),
        new MiniCssPlugin({
            filename: utils.assetsPath('css/[name].css'),
            chunkFilename: utils.assetsPath('css/[name].[contenthash:8].css')
        }),
        new webpack.HashedModuleIdsPlugin(),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'src/index.production.html',
            inject: 'body',
            chunksSortMode: 'none',
            minify: {
                collapseWhitespace: true,
                removeComments: true,
                minifyJS: true,
                minifyCSS: true
            }
        }),
    ],
    stats: {
        // 显示所有模块
        maxModules: Infinity,
        // 显示模块为何被引入
        reasons: true,
    }
});
// 当config中对应项为true时，启用打包分析
if (config.build.bundleAnalyzerReport) {
    const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
    prodWebpackConf.plugins.push(new BundleAnalyzerPlugin())
}
module.exports = options;
```
## utils和build文件介绍
- 那么在这两个文件中你们都看到了utils文件，而在package.json中打包命令执行的却是一个build.js而不是webpack.prod.js现在，我就来隆重的介绍这两个工具文件，他们是美化日志输出的小帮手，即使是敲代码，我们也要干干净净的看log，控制台要整洁对于错误和警告都要一目了然~话不多说，上代码
```js
//  utils.js
'use strict'
const path = require('path')
const packageConfig = require('../package.json')
const config = require('../config')

// 将资源文件合并到config文件中的配置项中
exports.assetsPath = function (_path) {
    const assetsSubDirectory = process.env.NODE_ENV === 'production'
        ? config.build.assetsSubDirectory
        : config.dev.assetsSubDirectory

    return path.posix.join(assetsSubDirectory, _path)
}
// 当出现报错时，使用node-notifier弹出系统消息弹窗告知出现错误
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
// 这里也就是为何我在config文件中设置了host为0.0.0.0
// 这样的话除了本地开发可预览，和开发机在同一个局域网访问
// 该计算机ip和端口一样可以访问，灵感来自react的控制台。
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
::: tip 提示
在build.js中我已经对部分文字进行翻译和本土化操作，凡是字符串中带中文的地方均可以修改
:::
```js
// build.js
'use strict'
process.env.NODE_ENV = 'production'

const ora = require('ora')
const rm = require('rimraf')
const path = require('path')
const chalk = require('chalk')
const webpack = require('webpack')
const config = require('../config')
const webpackConfig = require('./webpack.prod')
// 设置进度条文字
const spinner = ora('正在打包...')
// 开启进度条
spinner.start()

rm(path.join(config.build.assetsRoot, config.build.assetsSubDirectory), err => {
  if (err) throw err
  webpack(webpackConfig, (err, stats) => {
    // webpack执行打包操作之后关闭进度条
    spinner.stop()
    if (err) throw err
    process.stdout.write(stats.toString({
      // 开启控制台颜色输出
      colors: true,
      // 是否显示打包了源码文件
      modules: false,
      // 如果你是typescript,开启此项则会导致报错
      children: false, 
      // 后面这两个个人感觉和开启了modules没太大区别，只是显示更加简略一些
      // 是否显示生成的文件块
      chunks: false,
      // 显示打包的代码块来源
      chunkModules: false
    }) + '\n\n')
    // 当打包失败时
    if (stats.hasErrors()) {
      console.log(chalk.red('  打包失败\n'))
      process.exit(1)
    }
    // 当打包成功时
    console.log(chalk.cyan(' 打包成功\n'))
  })
})
```
## 配置babel
- 那么大家看明白了吗？以上代码很多都是来自vue2.x脚手架，因为我觉得这些东西比脚手架3.0的控制台更加直观明了，但是我还是非常非常的喜欢V3的ui功能，相比控制台更加的美观，但是却不够方便，现在我们还差两样东西，在配置文件中我们配置了babel和postcss看过前两个文章的小伙伴一定清楚，这两个小家伙同样也需要配置信息，那么废话不多说，上代码！
```js
// .babelrc
{
  "presets": [
    ["@babel/preset-env", {
      "modules": false,
      "targets": {
        "browsers": ["> 1%", "last 2 versions", "not ie <= 8"]
      }
    }]
  ],
  "plugins": ["@babel/transform-runtime"]
}
```
::: warning 需要注意的是：
此处你们会发现和上两个文章均不同，这里要注意啦！（敲黑板）在这里我直接升级了babel的版本使用的是版本7，那么以前的那一套就全部被废弃，现在的env就需要使用上面的配置而无需 `babel-preset-stage-x` 这个插件了，而 `runtime` 则也是换成了对应的版本。
:::
## 配置postcss
```js
// .postcssrc.js
// https://github.com/michael-ciniawsky/postcss-load-config
module.exports = {
  "plugins": {
    "postcss-import": {},
    "postcss-url": {},
    // to edit target browsers: use "browserslist" field in package.json
    "autoprefixer": {}
  }
}
```
> postcss则没有任何变化还是和之前一样

 至此，针对webpack的配置就告一段落了，稍后我会放上我这个示例的最后完成文件，当然是针对vue的，因为最近一直也在学习vue啦~~~如果文档有落后的地方我会及时更新的。嘻嘻，那么我们webpack5.0见~