# World Model

可在浏览器中探索、操作的三维白模场景集合。每个场景放在独立目录中，可共享整个场景库入口，也可直接分享某个模型。

- [公开场景库](https://zr15504328511-debug.github.io/world-model/)
- [Cell Demo：直接操作白模](https://zr15504328511-debug.github.io/world-model/cell%20demo/)

## 已有场景

| 目录 | 内容 | 操作体验 |
| --- | --- | --- |
| `cell demo/` | 中性粒细胞微观世界；48 个片区、16 种空间形态、三层空间及 75 秒四幕导览 | 移动、升降、地图跳转、自由观察、吞噬交互 |

![Cell Demo 导览 0 秒血管内首帧](cell%20demo/artwork/first-frame-00s-life-science.png)

首帧图片由内置 ImageGen 以导览 0 秒的血管内白模画面为参考生成，呈现血管壁、红细胞和悬浮的中性粒细胞。实时场景保持灰阶白模，图片没有替代可操作场景。原组织环境概念图仍保留在 `cell demo/artwork/first-frame-life-science.png`。

## 本地运行

需要 Node.js 22 或更新版本，无需安装 npm 依赖。

```sh
npm start
```

打开 `http://127.0.0.1:3190/`，从场景库进入 Cell Demo。浏览器通过本地文件加载全部三维运行库，不调用 Atlas API，也不需要 ChatGPT 登录。

## 添加其他白模

1. 在仓库根目录创建新的场景目录，如 `robot demo/`，将可独立运行的 `index.html` 和相关资源放进去。
2. 在 `models.json` 中追加该场景的 `id`、`title`、`description`、`detail`、`path`、`preview` 和 `frame`。
3. 提交后 GitHub Pages 更新，场景库入口会自动显示新场景。

目录名带空格时，网址使用 `%20`。场景资源尽量使用相对路径，以便部署在项目网址下。

## 发布

仓库使用 GitHub Pages 从 `main` 分支的根目录发布，`.nojekyll` 保留普通静态网站结构。GitHub 上的代码上传与 Pages 网站发布是两个步骤；Pages 状态完成后即可匿名访问。

没有上传 Atlas 密钥、私有技能配置、原项目 Git 元数据或本机凭据。第三方 Three.js 的 MIT 许可证位于各场景的 `vendor/THREE-LICENSE.txt`。
