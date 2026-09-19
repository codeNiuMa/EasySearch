# EasySearch

> 少一点信息流，多一点主动选择。

EasySearch 是一个低干扰的搜索起点。它不聚合内容、不展示热榜，也不会在打开页面时加载推荐信息流。用户只需要选择搜索入口、输入关键词，就能直接抵达目标网站的搜索结果页。

项目最初是一个用于学习 Python 和 CustomTkinter 的桌面小工具，现在已经改造为无需后端、可以直接静态部署的网页应用。

在线使用：[https://codeniuma.github.io/EasySearch/](https://codeniuma.github.io/EasySearch/)

## 核心理念

许多网站的首页同时承担推荐、广告、热榜和内容分发等功能。即使原本只是想搜索一个明确的问题，也很容易在进入首页后被其他内容打断。

EasySearch 将搜索过程缩短为三个动作：

1. 选择目标网站；
2. 输入明确的关键词；
3. 直接打开搜索结果页。

页面自身不抓取搜索结果，也不需要接入各网站的 API。只有用户提交搜索时，浏览器才会打开相应的目标地址。

## 功能

- 内置 Google、百度、Bing、Yahoo、DuckDuckGo、Yandex、搜狗和 Brave Search 等通用搜索入口；
- 内置维基百科、Google Scholar、GitHub、Stack Overflow、知乎、Reddit、哔哩哔哩、YouTube、小红书、什么值得买和高德地图等垂直入口；
- 优先显示各来源网站的官方图标；图标不可用时自动回退为字母标记；
- 桌面端采用左右分栏：左侧入口库独立滚动，右侧搜索区保持稳定；移动端自动切换为纵向布局；
- 支持按类型筛选搜索入口；
- 支持用户添加自己的搜索地址模板；
- 自动记住上次使用的搜索入口和明暗主题；
- 支持桌面端、平板和移动端布局；
- 支持 `/` 聚焦搜索框、`Alt + 1～9` 切换入口、`Enter` 搜索；
- 提供浅色与深色模式；
- 支持 AI 助手读取入口列表并预填搜索内容，但不会自动提交或访问外部网站。

## 隐私与网络请求

EasySearch 的交互逻辑全部在浏览器中运行：

- 不包含统计、广告或用户追踪代码；
- 不加载第三方字体、广告或推广图片；
- 品牌图标直接取自对应网站或其官方静态资源域名，不经过第三方图标代理；请求不包含搜索词，并使用 `no-referrer`；
- 不向 EasySearch 服务器上传搜索词；
- 自定义入口、主题和最后使用的入口只保存在浏览器的 `localStorage` 中；
- 不需要账号、数据库或后端服务。

提交搜索时，关键词会被编码后填入所选网站的搜索地址。这是应用产生的主要外部网络请求。

## 项目结构

```text
EasySearch/
├── dist/
│   ├── index.html       # 页面结构与元信息
│   ├── styles.css       # 响应式布局、主题与组件样式
│   └── app.js           # 搜索入口、交互、本地配置和 WebMCP
├── .github/workflows/
│   └── pages.yml        # GitHub Pages 自动部署工作流
├── README.md            # 项目说明
├── sousuo.py            # 旧版 Python 桌面应用
├── engine_config.json   # 旧版搜索入口配置
├── add_engine.py        # 旧版入口维护脚本
├── jsonsort.py          # 旧版配置排序脚本
└── test.py              # 旧版测试脚本
```

网页版本没有构建步骤，也没有 npm 或 Python 运行时依赖。`dist/` 中的文件就是最终可部署产物。

## 本地使用

最简单的方式是直接用浏览器打开：

```text
dist/index.html
```

也可以使用任意静态文件服务器，把站点根目录指向 `dist/`。

## 添加自定义入口

点击页面左侧的“添加自定义入口”，填写名称和搜索地址模板。模板必须使用 `{query}` 标记关键词所在的位置，例如：

```text
https://developer.mozilla.org/zh-CN/search?q={query}
```

当用户搜索 `CSS Grid` 时，EasySearch 会将关键词安全编码并生成对应的目标地址。

自定义入口仅保存在当前浏览器中。清理站点数据、更换浏览器或设备后，需要重新添加。

## 修改内置入口

内置入口定义在 `dist/app.js` 顶部的 `DEFAULT_ENGINES` 数组中。每个入口包含：

```js
{
  id: "example",
  name: "Example",
  mark: "E",
  category: "通用",
  color: "#2457d6",
  icon: "https://example.com/favicon.ico",
  template: "https://example.com/search?q={query}"
}
```

- `id`：稳定且唯一的英文标识；
- `name`：页面显示名称；
- `mark`：入口卡片上的单字或字母标记；
- `category`：所属分类；
- `color`：入口标记颜色；
- `icon`：可选的官方网站图标地址；加载失败时会显示 `mark`；
- `template`：必须包含 `{query}` 的搜索地址模板。

修改后可以运行以下命令检查 JavaScript 语法：

```powershell
node --check .\dist\app.js
```

## AI 助手支持

在支持 WebMCP 的浏览器环境中，EasySearch 暴露两个受限工具：

- `list_search_engines`：读取当前可用的搜索入口；
- `prepare_search`：选择入口并将关键词填入搜索框。

`prepare_search` 只负责准备搜索，不会代替用户提交，也不会自动打开第三方网站。这一边界与项目“明确意图、主动出发”的理念保持一致。

## GitHub Pages 部署

仓库通过 GitHub Actions 自动发布 `dist/`。每次向 `main` 分支推送提交后，`.github/workflows/pages.yml` 都会上传静态文件并更新 GitHub Pages。

GitHub 仓库需要在 **Settings → Pages → Build and deployment** 中选择 **GitHub Actions** 作为发布来源。

也可以将 `dist/` 部署到其他支持静态文件的网站托管服务。需要确保：

- 站点入口为 `dist/index.html`；
- `index.html`、`styles.css` 和 `app.js` 保持在同一目录；
- 托管服务能够以 UTF-8 返回文本文件。

## 旧版 Python 程序

仓库根目录中的 Python 文件保留作为项目演进记录。旧版使用 CustomTkinter 构建桌面界面，新的网页版本不再依赖它们。

后续如果不再需要维护桌面版本，可以将这些文件移动到单独的 `legacy/` 目录；当前版本暂不删除，以便对照早期设计与数据。

## 许可证

项目目前尚未添加开源许可证。在明确许可范围之前，仓库中的代码默认保留作者权利。
