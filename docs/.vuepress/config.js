module.exports = {
    base: '/WebpackLearnOfVue-site/',
    title: 'webpack4+vue配置教程',
    description: '使用webpack4配置一个类vue脚手架的配置',
    themeConfig: {
        sidebarDepth: 3,
        nav: [
            { text: '首页', link: '/' },
            { text: 'Github', link: 'https://github.com/umbrella22/WebpackLearnOfVue' },
        ],
        sidebar: {
            '/Overview/': [
                {
                    title: '简介',
                    collapsable: false,
                    children: ['/Overview/']
                },
                {
                    title: '基础',
                    collapsable: false,
                    children: genEssentialsSidebar()
                },
                {
                    title: '进阶',
                    collapsable: false,
                    children: genAdvancedSidebar()
                }
            ]
        }
    }
}
function genEssentialsSidebar() {
    const mapArr = [
        '/Overview/basis/',
        '/Overview/basis/CommonTools.md',
        '/Overview/basis/WithVue.md'
    ]
    return mapArr.map(i => {
        return i
    })
}

function genAdvancedSidebar() {
    const mapArr = [
        '/Overview/advanced/'
    ]
    return mapArr.map(i => {
        return i
    })
}