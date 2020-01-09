# webpack常用的工具
> 之前我们只是简单的说明了如何将html，css，js使用webpack进行打包操作，但是我们页面不可能没有图片这些东西，所以这篇则是着重介绍几个必不可少的loader和plugin，来完善我们页面的基础需求，在这里大家可能要先预习一下ejs模板的一些语法知识，不然可能会看不懂（虽然我也会解释啦）。
* 首先是loader的介绍，这次我们要用到的loader可就有点多了，他们分别是：`url-loader`，`postcss-loader`，`babel-loader`；记得使用npm命令安装哦
    - 先来介绍一下 `url-loader` ，该loader可以在规定范围内处理图片，将其变成base64字符串，这样可以减少http请求数对于超出规定范围的则会使用 `file-loader` 进行解析，不用担心，`url-loader` 本身已经封装好了 `file-loader` 所以就无需安装，并且你还可以将以前需要 `file-loader` 解析的全部交由 `url-loader`去解析理论上是可行的，它会处理你的js，css中对图片的引用好了就介绍到这里，让我们上代码，还记得上一章节里我说的哪个结构吗？不记得是需要回去温习一遍的哦：
    ```javascript
    // url-loader是在规定最小范围内将图片等转换成base64字符内嵌到页面中
            {
                test: /\.(png|jpg|gif|svg|bmp|eot|woff|woff2|ttf)/,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 5 * 1024,
                        outputPath: 'images',
                    }
                }
            },
    ```
    使用正则在匹配字体和图片文件，这里的`limit`就是设置超过这个值就会交由 `file-loader` 去解析，而低于且包括这个大小的均会被解析成base64，outputPath则是设置输出的位置，默认是在dist目录中，在这里就是dist/images文件夹里了。那么有个糟糕的问题，我们在html中直接使用img标签的怎么办，这个是不被`url-loader`去识别处理的，而且如果使用 `html-withimg-loader` 则会导致 `html-webpack-plugin`不去处理html中的模板代码，所以我们索性就去直接使用模板语法就好了 ``` <img src="<%= require('./image/amy.jpg')%>" alt=""> ``` 像这样去写，就能被正确解析了。
    - 这样之后我们就发现基本上该有的功能是齐了，但是呢如果是我们使用了`transform`这个css属性，那么就需要对其做兼容写法，但是这样是肯定很繁琐，总不能每个我都要写吧，所以，我们就可以使用 `postcss-loader` ，通过他配置的插件可以对css进行一些处理，比如添加前缀这种；既然是loader那么就是需要配置了，这个loader需要放在你css处理的最右边，因为需要他先去处理css，然后交由`css-loader` 去处理，我们需要去`webpack.config.js`文件的同级目录去新建一个` postcss.config.js ` 然后我们需要输入
    ```javascript
    module.exports = {
    "plugins": {
      "postcss-import": {},
      "postcss-url": {},
      "autoprefixer": {}
        }
    }
    ```
    当然，这里的插件我们也是要安装的，直接 `npm i postcss-import postcss-loader postcss-url -D`
     至于他们是干嘛的，大家可以去参考postcss的文档啦，这里就不作过多的阐述。
    - 要是我们使用了es6的语法呢？浏览器它没有办法去支持那么我们的代码就这样作废了？当然不会，我们可以使用 ` babel-loader ` 对我们的js代码进行"降级"处理，在使用 ` babel-loader ` 的时候我们需要以下几个依赖 ` npm i babel-core babel-plugin-transform-runtime babel-preset-env babel-preset-stage-0 -D` 其中env是转换es6，stage-0为将所有es6语法全部转换为es5，但是这里需要注意的是，` babel-loader `的版本直接安装是8.x的，但是其对应的依赖还是没有升级到，所以我们需要安装7版本的，` npm i babel-loader@7 -D ` 就好了，现在我们需要去配置一下webpack的文件：
    ```javascript
    // 既然是loader，那么也是在老位置，接着
            {
                test: /\.js/,
                exclude: /(node_modules)/,
                loader: 'babel-loader'
            }
    ```
在这里我新加了一个`exclude`这个是告知loader忽略某个文件夹，毕竟我们总不能一股脑把依赖也编译了把，这样就太傻了耗时还不讨好~，至此就完成了所有的开发需要的操作，我们可以随意的在代码中使用最新的技术，而不用担心大部分的兼容问题。
但是现在我们还需要做一件事情，就是在和package.json同级目录下，新建一个名为 ` .babelrc ` 没错，文件名就叫这个，然后在里面写上
```javascript
{
    "presets": [
        ["env", {
            "modules": false,
            "targets": {
                "browsers": ["> 1%", "last 2 versions", "not ie <= 8"]
            }
        }],
        "stage-0"
    ],
    "env": {
        "test": {
            "presets": ["env", "stage-0"]
        }
    }
}
```
   在这里则是配置babel-loader的转换规则，大体的意思就是将代码转换为第0阶段，并且代码兼容市面上使用率大于1%的浏览器，并且不再兼容ie8。而且这里的一个modules为false则是关闭对es6语法中import和export的转换并且当build环境被设置为 ` production ` 时，将会启动代码压缩功能，（在文章下面的代码压缩部分会有详细说明）这个代码压缩的同时也会对代码进行检查，只打包引用的方法或者代码块；但是这个功能依赖es6语法的import和export，故这里关闭对这个的转换，来使这个设置项生效。
  
* 现在就是我们的plugin介绍时间了， `mini-css-extract-plugin，optimize-css-assets-webpack-plugin，copy-webpack-plugin，uglifyjs-webpack-plugin`还有webpack原生自带的HotModuleReplacementPlugin和NamedModulesPlugin。
    - 别看这么多，他们每个的用处基本是一样的，现在先来介绍功能相同的也是最好使用的 ` optimize-css-assets-webpack-plugin 和 uglifyjs-webpack-plugin ` 他们二者都是压缩功能，前者是压缩css而后者则是压缩js，用法很简单，在插件的位置直接 `new` 完事！就像这样：
    ::: warning 需要注意的是：
    ` uglifyjs-webpack-plugin `在webpack4中其实是已经不推荐使用了，转而使用的是 ` terser-webpack-plugin ` 二者效果是一样的，但是在使用的方法却迥然不同。
    :::
    ```javascript
    new OptimizeCSSAssetsPlugin(),
    new UgliftjsWebpackPlugin()
    ```
    ```javascript
    // 当你使用terser-webpack-plugin时
    module:{
        // module中设置的loader
    },
    optimization:{
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
    plugins:[]
    ```
    ::: danger 这里要格外注意
    当你使用了 ` uglifyjs-webpack-plugin ` + ` optimize-css-assets-webpack-plugin ` 组合的方法时，二者的使用位置和方法和原来完全不一样！
    :::
    而 `mini-css-extract-plugin` 是有点不同的，他是将css全部提取出来放到一个css文件中，这样有个好处，减少了http的请求数，但是如果过大的话，反而会有坏处，但是不用担心，因为这个是可以配置的，这个插件的配置有点复杂我们需要将 `style-loader` 替换为 ` { loader: MiniCssExtractPlugin.loader, options: { publicPath: '../' } }, ` 为了方便大家我就直接写上来啦，这里是使用了该插件自带的一个loader，然后设置了 `publicPath` 其实这里是为了，下面做铺垫，现在我们要去插件那里去设置导出的规则
    ```javascript
    plugins:[
        
        new MiniCssExtractPlugin({
                filename: "[name].[chunkhash:8].css",
                chunkFilename: "[id].css"
            }),
    ]，
    // 这里是为了配置css导出的路径，也就是之前上面的publicPath为什么要../的原因，其实运行起来就知道了。
    optimization: {
        // 是否对代码进行压缩，必须在production环境下才会生效！
        minimize: true,
        splitChunks: {
            cacheGroups: {
                styles: {
                    name: 'css/index',
                    test: /\.css$/,
                    chunks: 'all',
                    enforce: true
                }
            }
        }
    },
    ```
    要注意哦，`optimization` 和 `plugins` 是同级的，不要搞错了，这里我就不做过多阐述了，命名方式和之前是一样的，这样，就可以将css全部提取都dist目录下的css文件夹啦。
    - 现在来说说 `copy-webpack-plugin` 这个插件，该插件的功能是将目录或者为念拷贝到指定目录，例如
    ```javascript
    new CopyWebpackPlugin([{
            from: path.join(__dirname, 'public'),
            to: path.join(__dirname, 'dist', 'public')
        }]),
    ```
    ::: tip 提示
    这里，`from`就是需要将什么文件夹或者目录移动到`to`中设置的地方，是不是很简单易懂,当然，如果需要拷贝移动的目录中是空的，它将不会去移动这个目录哦~
    :::
* 而webpack自带的两个插件呢，我们需要先引入webpack，` const webpack = require('webpack') `，然后在插件位置直接 ` new webpack.HotModuleReplacementPlugin(), new webpack.NamedModulesPlugin()`，这两个插件比较特殊，它是为了devServer中的hot，inline这两个选项服务（要在devServer中加入并且设置为true才行哦），这两个插件是在你做了更改时，只替换被你更改的那部分模块，不刷新浏览器，并且以模块名来代替原本的id，当然，这里可能有的小伙伴加了但是发现并没有实现预期的不刷新浏览器，这是因为模块更换会触发一个冒泡效果，当这个冒泡被最外层的容器模块捕捉的时候，由于没有任何方法来处理它，所以就直接触发了浏览器刷新来达到更新页面的目的，所以需要我们自己去捕捉这个问题这里我会说明一下如何捕捉和处理，但是至于到底要不要这样做。就得看你们自己了，因为我个人觉得是没太大必要。因为只是js必须要这样处理，而css则不需要因为css-loader已经内置了该功能。
```javascript
// 我们需要再最外层的容器模块中加入下面的代码
// 最外层的容器模块代表着承载所有模块的入口代码
if(module.hot){
    module.hot.accept('发生更改的模块文件名', () => {
    // 此处是当模块发生更改之后，需要执行什么行为，一般的就是重新挂载一次模块
    })
}
```
* 当我们的项目需要使用`bootstrap`怎么办，其实非常方便，如果已经向上面那样配置好了，只需要 `npm i bootstrap` 然后再主js中`import`也好 `require` 也罢，均可以正常生效。
> 至此webpack的配置就完成了，但是我们还需要对配置文件进行优化，我们需要区分开开发环境和生产环境，让开发环境下对代码不进行混淆压缩，开生产环境中则反之，这就是下一次要说的问题啦~