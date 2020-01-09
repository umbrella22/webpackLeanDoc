# 使用webpack搭一个最简单的demo

> webpack4.x已经发布很久了，借此机会来好好的学习一下webpack的使用
## 初始化package.json
* 首先是需要初始化package文件，我们新建一个文件夹并且命令行窗口定位到该文件夹，输入` npm init -y ` 回车；需要注意的是这里默认了一路yes它会以文件夹名称来做项目名称，那么就要求文件夹名不能为中文、npm的包名，如果文件夹下面有readme.md文件的话则会默认将其添加到项目描述中。
## 安装初始化webpack基础依赖和展示项目目录
* 现在开始安装webpack，执行命令 ` npm i webpack webpack-cli webpack-dev-server -D ` 这里是安装了，webpack本体，webpack脚手架，webpack热更新服务，因为在webpack4.0中是将webpack和webpack-cli分开了，其实在之前他们是在一起的，至于热更新呢，敲代码每次js变更和html变更都需要手动去刷新页面，非常烦，那么我们就把这个烦人的操作丢给热更新来了，节约时间也防止打断思路。
      ![项目目录](https://upload-images.jianshu.io/upload_images/12094080-20d4eb87d3e328f3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
    + 那么现在我们需要手动初始化一下我们的项目文件夹（如图所示），需要创建一个src，dist这两个文件夹，src文件夹用来放置源码而dist则是放置webpack打包好的文件。（当然，你也可以使用自己的命名规则，只需要修改对应的入口和输出就好啦）再新建一个名为 ` webpack.config.js ` 一定要是这个名字哦，这是webpack识别外部配置文件的一个算是入口吧。现在我们开始来撸代码！
    ```javascript
    const path = require("path")
    module.exports = {
    // 更改webpack寻找模块对应的文件
    resolve:{
        // 此设置是决定了webpack如何去按照什么顺序去搜索文件
        extensions: ['.js', '.json'],
        // 相当实用，它会通过别名将原路径设置成一个新的路径
        alias:{

        }
    },
    // 第一段：入口
    // 这里可以看到我写的就是向webpack导入src文件夹下的index.js文件
    entry: "./src/index.js",
    // 第二段：输出
    output: {
        // 设置输出的文件夹
        // 此处就是输出到了之前创建的dist文件夹中啦~
        path: path.join(__dirname, 'dist'),
        // name是entry名字默认为main，而hash则是打包后文件内容计算出来的hash值
        // hash后面的冒号加数字是代表生成的hash位数
        filename: '[name].[hash:8].js'
    },
    // 第三段：webpack使用的loader
    module: {
        rules: []
    },
    // 第四段：webpack插件
    plugins: [],
    // 第五段：配置webpack热更新服务
    devServer: {
        contentBase: './dist',
        // 此处localhost则默认是本机，如果不是请修改为127.0.0.1
        // 如果是设置为0.0.0.0呢则可以本机和局域网访问了
        // 但是由于启用了自动弹窗，他会默认打开0.0.0.0：端口号
        // 所以本机浏览，还请手动敲127.0.0.1：端口号。
        host: 'localhost',
        // 开启端口
        port: 8080,
        // 是否启动gzip
        compress: true,
        // 是否自动打开浏览器预览，这个和在命令中使用--open效果相同
        // 由于下面的命令已经写了，所以这里就将其注释掉，你也可以在这里设置之后，命令中不再写，看个人喜好
        // open:true

        }
    }
    ```
    + 在这里我们可以看到它可以分成五段，代码中已经有了一部分注释，请结合注释上的字，进行后续的观看。
    ## 插件介绍
* 现在我们可以运行起来了吗？当然不可以，配置好了这个文件仅仅是第一步，我们还需要去配置一下 ` package.json ` 这个文件，现在打开 ` package.json ` ，找到scripts，这个对象里面默认应该是有一个test的才对，我们删掉他，然后把这些敲进去 ` "dev": "webpack-dev-server --open --mode development","build": "webpack --mode development" ` ，你注意到了，dev和build后面跟随的命令是不一样的，现在我来解释一下：
在dev中，这个命令是启动了webpack热更新服务器，其中带了open和mode两个参数，open代表当webpack处理完成之后自动打开默认浏览器预览 ( `同时可以和上文中直接再devSserver中使用open:"true"，是一样的效果` ) ，mode这个参数是webpack中必须要求的，是声明当前的代码环境，`development`当然就是开发环境啦，而相对的生产环境就是 ` production ` 了，至于这两者有什么区别，我们以后再说，现在只需要知道就好了；而build呢，它就是很熟悉的编译了，这个命令会将你的指定文件编译完成并丢进上面你指定的文件夹中（也就是dist文件夹）我们就可以在命令行里去执行`npm run dev`或`npm run build`者两个命令，就可以执行它们啦。
* 现在只是有一个js而已，网页怎么能少了html和css呢，现在我们隆重介绍两个webpack插件和加载器，它们是：`html-webpack-plugin,clean-webpack-plugin,css-loader,style-loader`,既然不是webpack自带的，当然要进行安装了，执行命令 ` npm i html-webpack-plugin clean-webpack-plugin css-loader style-loader -D` 。
    + 现在需要介绍一下插件，首先是末尾都带了plugin的，这类是需要写在 ` plugins `数组中，找到了吗？也就是上面代码的第四段下面的位置，这些plugin都是需要引入，比如：  ` const CleanWebpackPlugin = require("clean-webpack-plugin") ` 这样写在代码顶端；（2019-06-11订正更新，clean-webpack-plugin的3.0版本中需要const {CleanWebpackPlugin} = require("clean-webpack-plugin")这样引入，然后在使用的时候无需任何参数，默认会清空你的dist文件夹，至于想自定义清空文件夹位置，请自行查看插件github地址）当然你写在plugin上面也没问题啦，我们需要注意一下格式嘛，导入的时候都放在代码的顶部，一目了然。在数组中我们需要这样写
    ```javascript
    plugins: [
        new HtmlWebpackPlugin({
                // 以什么html为模板
                template: './src/index.html',
                // 生成的html名称是什么
                filename: 'index.html',
                // 修改掉网页的显示名称
                title: "这是标题",
                // minfy是对html进行压缩，removeAttributeQuotes是为了去掉属性的双引号
                minify: {
                    removeAttributeQuotes: true
                },
                // 在引入的js时候加入查询字符串避免缓存
                hash: true,
            }),
        // 在重新打包的时候自动清空输出文件夹，保持输出文件夹中的文件时最新的
        new CleanWebpackPlugin({}),
    ],
    ```
    + 每一个插件都需要`new`一下，如果有参数的话就是类似` HtmlWebpackPlugin `这个插件这样写啦，好了现在需要根据插件中的配置进行一些文件上的创建，现在我们需要去src文件中创建一个html文件，内容是这样的
    ```html
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title><%= htmlWebpackPlugin.options.title %></title>
    </head>
    <body>
        <div id="app"></div>
    </body>
    </html>
    ```
    + 可能就会有小可爱会问了，` <%= htmlWebpackPlugin.options.title %> `这句代码是什么意思，其实，这个是一个模板，记得前面我们在插件中设置了title了吗？这里就是将那个title赋值过来，现在我们试一下运行dev命令看看是不是页面就直接出来了，是白板没关系，因为你的html本身就没有写任何内容嘛~除了那个页面名称，看一看一定是你设置的名称。
    + 现在我们需要引入js和css主要是css我们需要用到两个loader，也就是之前安装的末尾带了`loader`字样，loader顾名思义是加载器其作用就是通过一定的规则将非js文件处理成标准的js文件加载或者是将js文件加载进去，但是loader和plugin不同的是，loader不需要引入，只需要安装就好，那么他们的位置则是在配置文件的第三段,module对象中的rules数组中。
    > rules的使用是这样的，test代表的是需要处理的文件，支持正则表达式和直接导入的形式，而下面的loader则是有三种写法， use,loader,use+loader，其中use和loader是一样的，而use+loader则不同，这种写法一般是配置loader中所需要的一些参数，当然你使用问好衔接可以的，webpack提供了很多中用法；在下面这段代码中就提供了很多例子供大家参考
   ```javascript
     module: {
        rules: [
            {
                // 使用正则匹配文件
                test: /\.css$/,
                // 规定使用什么加载器处理这个文件
                // 其中，css-loader用于解析css文件中的url路径
                // style-loader用于将css文件变成style标签插入到header中
                // 多个loader的话，需要从右往左写，转换的时候是从右往左处理
                loader: ["style-loader", "css-loader"]
                // 同时也可以写成
                // loader:'style-loader!css-loader'
            },
            // expose-loader虽然可以将某些变量挂载至windows上，但是需要每一个都要在这里挂载非常的不方便
            // 如果非要挂载依赖，针对一些老项目，可以尝试这样去配置
            {
                test: require.resolve('jquery'),
                // 此处是loader写法，问好后面则是需要暴漏的全局变量，为$符号
                use: {
                    loader: 'expose-loader',
                    options: '$'
                }
                // 这里的这loader也可以写成
                // loader:'expose-loader?$'
            }
        ]
    },
    ```
    + 是不是对这个 `expose-loader` 比较好奇？他的作用是什么？是这样的，很多老的项目均使用了jq而我们既然使用了webpack就不好在index.html模板位置使用`script`标签进行载入，除去因为cdn加速或者其他的什么必须使用`script`标签，我们要让webpack对我们的项目有100%的掌控，这样一来可以统一混淆代码，二来减少奇奇怪怪的bug，其实这里是涉及到了nodejs模块化的一个理解，由于在webpack中，它会将代码分成很多个块，而每个代码块之间并不能相互访问对方的变量及方法，这就造成了一个非常尴尬的场景，没法使用jq等这些js库了，所以这个loader就为我们提供了一个入口，它会将我们给他的库文件暴漏至全局，当然这些库必须先符合`CommonJS`规范才可以，不会的小可爱需要自己去学习ES5以上的知识哦！只是这样还不够，我们需要在index.js中去引入，例如这样：` const $ = require('jquery') ` 然后就可以尽情使用jq啦。
    > 但是在很多时候，特别是多入口的时候，我们并不希望有些变量被暴漏到window下，除去jq这样的库还有一些其他我们私有的公共处理方式在使用下面的多入口加载之后，我们还需要使用webpack自己的注入插件 `ProvidePlugin`，怎么用呢？代码如下（当然同样也要满足`CommonJS`规范）：
  ```javascript
    // 首先修改alias中的东西
    resolve:{
        // 此设置是决定了webpack如何去按照什么顺序去搜索文件
        extensions: ['.js', '.json'],
        // 相当实用，它会通过别名将原路径设置成一个新的路径
        alias:{
            // 假设现在在src中我添加了一个base.js公共js
            // 且其中有一个tese函数
            // 不用担心为什么没有文件后缀，在上面已经说明了
             base:path.join(__dirname,'src/base')
        }
    },
    plugins:[
    // 由于webpack生成的代码块作用域并不是全局的
    // 所以需要使用此插件用来自动向模块内部注入需要使用到的来自其他代码块的变量
        new webpack.ProvidePlugin({
            // 这个的意思是向模块内部提供一个来自base的对外暴漏的方法，在这里
            // funcB是webpack让你设置的一个自定义调用名称
            // 在这里的话，它会将base中对外暴漏的任何东西都挂载到funcB这个对象中
            funcB:"base",
        })
    ]
    ```
    > 那么如何调用呢，假设我要在`index.js `中去使用，那么我们就可以直接在index.js中使用 `funcB.test(123)` 这样就可以直接调用到base中的函数了。
* 配置至此，webpack就已经可以完全的为你服务了，现在我们来谈一谈关于入口处的一些事情，因为我们不可能只有一个html，js，css对吧，但是在例子中似乎只介绍了引入单个js文件，现在我们开始解锁多入口模式（不推荐），当我们把`entry`后面的字符串改为一个数组或者是一个对象的时候，没错此时解锁了多入口模式，大概是这样的代码：
```javascript
    // 入口位置可以为一个数组
     entry: ["./src/index.js","./src/base.js"],
    // 还可以放入一个对象,放入一个对象之后，就变成了多入口模式
    // 首先通过每个入口（entry），从各个入口出发找到依赖模块（module），生成chunk（代码块）
    // 最后会将chunk写到文件系统中(Assets)
     entry:{
         index:"./src/index.js",
         base:"./src/base.js",
    },
```
以上代码展示了，entry分别为数组，对象时应该如何引入入口文件，此处需要注意的是，当没有写路径而直接写了名称的时候，例如`jquery`，这个是使用npm进行安装，直接安装到项目的node_modules文件夹内，才可以被webpack正确的识别并且引入；只是引入了没有作用的，记得我们用过的 `html-webpack-plugin` 剩下的工作就交给他来处理了，我们先为其添加一个参数名为`chunks`这个参数是一个数组，然后将每个入口一一放入其中就像这样：
```javascript
    new HtmlWebpackPlugin({
            // 此处是规定产出html的时候引入那些代码块
            // 一般是在入口处为多个文件时使用需要在此处加入，无需顺序
            chunks:['index','base']
        }),
```
::: tip 提示
记住哦，这只是在之前的基础上添加了这个属性而已，而不是重新new一个，别犯傻！这样就将这些代码块都绑定到了index.html中了，然后你就要问了，如果是多个html对应多个js的时候怎么办呢，emm。。。。那就像这样：
:::
```javascript
let pages = ['', '']
pages = pages.map( page => new HtmlWebpackPlugin({
    template: './src/index.html',
    filename: `${page}.html`,
    title: `${page}`,
    hash: true,
    chunks: [`${page}`],
    minify: {
        removeAttributeQuotes: true
    },

}))
```
当然，如果你想使用不同的模板，也可以自行定制，这就不属于webpack的范畴了。