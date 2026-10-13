# Cell Demo

中性粒细胞主角的可操作微观白模世界。16:9 场景画面没有字幕，画面外仅提供操作介绍。

## 操作

| 操作 | 功能 |
| --- | --- |
| WASD / 方向键 | 移动 |
| Q / E | 下降 / 上升 |
| Shift | 加速 |
| 鼠标拖动 / 滚轮 / 双指 | 旋转 / 缩放视角 |
| M / 地图按钮 | 打开地图，点击节点前往片区 |
| C / 细胞按钮 | 切换细胞操控与摄影机飞行 |
| 空格 | 探索时吞噬附近细菌；导览时播放 / 暂停 |
| F / 准星按钮 | 重新对准主角 |
| 播放按钮 | 进入 75 秒四幕导览 |
| 指南针按钮 | 切换探索与导览 |
| 1–4 / 下方圆点 | 跳转四幕 |
| R | 从头播放导览 |
| H / 信息按钮 | 显示或隐藏操作介绍 |

地图方框标记细菌较多的片区，环形节点标记螺旋血管。世界包含上层血管、组织空间和下层腔室。

## 文件

- `index.html`、`scene.mjs`、`exploration.mjs`、样式文件与 `vendor/`：完整实时白模及交互。
- `artwork/first-frame-00s-life-science.png`：基于导览 0 秒血管内白模生成的生命科学演示风格首帧。
- `artwork/first-frame-00s-whitebox.png`：对应的导览 0 秒灰阶参考。
- `artwork/first-frame-00s-prompt.txt`：0 秒首帧的完整生成提示词。
- `artwork/first-frame-life-science.png`、`first-frame-whitebox.png`、`first-frame-prompt.txt`：之前的组织环境概念图、参考及提示词，保留作其他阶段参考。
- `resources/neutrophil-atlas.worldkit.zip`：Atlas 工具校验的静态视觉资产包，包含中性粒细胞与四幕基础场景，不含程序化实时动画或 48 片区扩展世界。
- `resources/neutrophil-whitebox-actor.glb`：可导入 Blender 的中性粒细胞静态模型。

完整可探索世界由浏览器中的程序化场景生成，不依赖 Atlas 凭据。
