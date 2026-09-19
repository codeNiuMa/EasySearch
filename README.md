# EasySearch

> 少一点信息流，多一点主动选择。

EasySearch 是一个低干扰的搜索起点。它跳过网站首页的热榜、推荐和信息流，让用户选择目标网站、输入关键词，然后直接进入对应的搜索结果页。

**在线使用：** [https://codeniuma.github.io/EasySearch/](https://codeniuma.github.io/EasySearch/)

## 为什么做这个项目

很多网站的首页同时承担内容推荐、广告和热点分发功能。即使只是想查一个明确的问题，也可能在真正开始搜索前被其他内容打断。

EasySearch 将过程缩短为三步：

1. 选择搜索入口；
2. 输入关键词；
3. 直接打开搜索结果。

页面不聚合搜索结果，也不需要各网站的 API。它只负责安全编码关键词并生成目标搜索地址。

## 主要功能

- 桌面端采用左右分栏：左侧入口库独立滚动，右侧搜索区保持稳定；
- 移动端自动切换为“先搜索、后选择入口”的纵向布局；
- 内置 19 个通用、知识、开发、社区、视频、生活和地图入口；
- 支持分类筛选以及 `/`、`Alt + 1～9`、`Enter` 快捷键；
- 优先显示来源网站的官方图标，加载失败时回退为字母标记；
- 支持添加、删除自定义搜索入口；
- 自动记住主题、最后选择的入口和自定义配置；
- 提供浅色与深色主题，并适配桌面、平板和手机；
- 支持 WebMCP 助手读取入口列表并预填搜索内容，但不会自动提交。

## 内置入口

| 分类 | 搜索入口 |
| --- | --- |
| 通用 | Google、百度、Bing、Yahoo、DuckDuckGo、Yandex、搜狗、Brave Search |
| 知识 | 维基百科、Google Scholar |
| 开发 | GitHub、Stack Overflow |
| 社区 | 知乎、Reddit |
| 视频 | 哔哩哔哩、YouTube |
| 生活 | 小红书、什么值得买 |
| 地图 | 高德地图 |

## 使用方法

1. 在左侧选择目标网站；
2. 在右侧输入要查找的内容；
3. 按 `Enter` 或点击“直达搜索”；
4. 搜索结果会在新标签页中打开。

### 快捷键

| 快捷键 | 作用 |
| --- | --- |
| `/` | 聚焦搜索框 |
| `Alt + 1～9` | 切换前 9 个搜索入口 |
| `Enter` | 使用当前入口搜索 |

## 自定义入口

点击“添加自定义入口”，填写名称和搜索地址模板。模板必须使用 `{query}` 标记关键词所在位置，例如：

```text
https://developer.mozilla.org/zh-CN/search?q={query}
```

搜索 `CSS Grid` 时，EasySearch 会将关键词编码后替换 `{query}`，再打开生成的地址。

- 点击右上角关闭按钮、点击“取消”或按 `Esc`，都会直接退出且不保存内容；
- 保存后的自定义入口只存在当前浏览器中；
- 清理站点数据、更换浏览器或设备后，需要重新添加。

## 隐私与网络请求

EasySearch 的交互逻辑全部在浏览器中运行：

- 不包含统计、广告或用户追踪代码；
- 不需要账号、数据库或后端服务；
- 不向 EasySearch 服务器上传搜索词；
- 主题、入口和自定义配置仅保存在浏览器 `localStorage` 中；
- 品牌图标直接来自对应网站或其官方静态资源域名，不经过第三方图标代理；
- 图标请求不包含搜索词，并使用 `no-referrer`；
- 只有提交搜索后，浏览器才会把关键词发送给所选网站。

## 项目结构

```text
EasySearch/
├── dist/
│   ├── index.html       # 页面结构与元信息
│   ├── styles.css       # 双栏布局、响应式样式与主题
│   └── app.js           # 搜索入口、交互、本地配置与 WebMCP
├── .github/workflows/
│   └── pages.yml        # GitHub Pages 自动部署
├── README.md            # 项目说明
├── sousuo.py            # 旧版 Python 桌面应用
├── engine_config.json   # 旧版搜索入口配置
├── add_engine.py        # 旧版入口维护脚本
├── jsonsort.py          # 旧版配置排序脚本
└── test.py              # 旧版测试脚本
```

网页版本没有构建步骤，也没有 npm 或 Python 运行时依赖。`dist/` 中的文件就是完整的静态网站。

## 本地运行

可以直接用浏览器打开 `dist/index.html`，也可以让任意静态文件服务器将站点根目录指向 `dist/`。

修改 JavaScript 后，可执行语法检查：

```powershell
node --check .\dist\app.js
```

## 修改内置入口

内置入口位于 `dist/app.js` 顶部的 `DEFAULT_ENGINES` 数组中：

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

字段说明：

- `id`：稳定且唯一的英文标识；
- `name`：页面显示名称；
- `mark`：图标不可用时显示的字母或单字；
- `category`：入口所属分类；
- `color`：字母回退标记的背景色；
- `icon`：官方网站图标地址；
- `template`：包含 `{query}` 的搜索地址模板。

## GitHub Pages 部署

每次向 `main` 分支推送提交后，`.github/workflows/pages.yml` 会自动发布 `dist/`。

仓库需要在 **Settings → Pages → Build and deployment** 中使用 **GitHub Actions** 作为发布来源。

## 项目沿革

EasySearch 最初是一个用于学习 Python 和 CustomTkinter 的桌面小工具。仓库根目录中的 Python 文件保留为演进记录，网页版本已经不再依赖这些文件。

## 许可证

项目目前尚未添加开源许可证。在明确许可范围前，仓库代码默认保留作者权利。
