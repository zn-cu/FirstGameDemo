# Fox Platformer Demo

一个小型 HTML5 平台跳跃 demo：两张地图、普通怪、史莱姆国王 boss、二段跳奖励、教程提示、音效和背景音乐。

## 运行

```bash
npm install
npm run dev
```

## 操作

- A / D 或 ← / →：移动
- W / 空格 / ↑：跳跃
- S / ↓：下蹲
- S / ↓ + 空格 / W / ↑：穿过单向平台下落
- Shift / K：短冲刺
- J / 鼠标左键：攻击
- R：重开当前地图

## 项目结构

```text
assets/
  audio/          背景音乐和音效 wav 文件
  images/         角色、敌人、boss、tiles、攻击特效图片
src/
  core/           基础服务和工具：资源加载、音频、碰撞、配置
  data/           地图、关卡对象、切图数据
  render/         Canvas 渲染器和 HUD/UI 绘制
  systems/        玩法系统：玩家、敌人、攻击
  main.js         输入、主循环、系统编排和地图切换
  style.css       页面样式
```

## 当前内容

- 第一张地图：平台跳跃、金币、教程提示、普通史莱姆敌人。
- 第二张地图：全地面 boss 场景，可返回第一张地图末尾。
- Boss：史莱姆国王，拥有远程史莱姆弹和近战跳砸。
- 奖励：击败 boss 后掉落二段跳道具，拾取后弹出能力提示。
