# Fox Platformer Demo

一个用 HTML5 Canvas 和 Vite 制作的横版平台动作 demo。当前版本围绕“史莱姆森林 -> 河畔森林 -> 千立学校”的主线推进，并包含树屋、河流和 Boss 房等隐藏地图。

## 运行

```bash
npm install
npm run dev
```

浏览器打开 Vite 输出的本地地址即可游玩，通常是：

```text
http://localhost:5173
```

构建检查：

```bash
npm run build
```

## 操作

- `A / D` 或方向键左右：移动
- `W / 空格` 或方向键上：跳跃
- `S` 或方向键下：下蹲，从单向平台下落
- `Shift`：冲刺
- `J` 或鼠标左键：近战攻击
- `K`：获得法杖后远程攻击
- `E`：与 NPC、树屋和大门交互
- `B`：打开或关闭背包
- `R`：使用血瓶；死亡或通关后重新开始

## 关卡流程

### 关卡 1：史莱姆森林

第一章主地图。玩家开局移动一步后触发穿越对白，随后可以和老村长对话接取任务。

核心目标是击杀史莱姆并收集 10 个史莱姆粘液。完成后再次和老村长对话，可以获得新手法杖，解锁 `K` 键远程攻击。地图后段的树屋可以进入隐藏地图“史莱姆王庭”。第一关末尾出口在获得法杖后进入主线第二章“河畔森林”。

### 隐藏地图：史莱姆王庭

树屋进入的隐藏 Boss 房。进入后入口关闭，击败史莱姆国王后解锁出口。史莱姆国王有 10 点生命，掉落 3 个史莱姆粘液。

### 关卡 2：河畔森林

扩充后的森林河畔地图，包含哥布林、平台路线、金币、血瓶和多段河流。第三条河流是假河流，玩家落入后不会扣血，而是进入隐藏地图“水底洞窟”。

河畔森林末尾出口进入第三章“千立学校”。

### 隐藏地图：水底洞窟

水底洞窟使用独立背景和石头地面素材。Boss 为哥布林长老，击败后通过传送门返回河畔森林开头。

### 关卡 3：千立学校

学校主题地图，敌人包括普通书本怪和精英书籍怪。精英书籍怪使用链子远程攻击。地图右侧的大门通往隐藏 Boss 房。

### 隐藏地图：千立学校 Boss 房

Boss 为雪乃。雪乃使用 4 帧行走、4 帧投掷攻击动画，并会投掷书包弹道。击败雪乃后右侧出口解锁。

## 系统

- 生命值：玩家最大生命值为 15。
- 血瓶：最多携带 3 个，每次恢复 2 点生命。
- 掉落：普通史莱姆掉落 1 个史莱姆粘液，史莱姆国王掉落 3 个。
- 背包：按 `B` 打开背包，以格子显示材料数量。
- 法杖：收集 10 个史莱姆粘液并向老村长交任务后解锁。
- 金币：金币被拾取后不会因为重新进入地图而刷新。
- 对话：开局旁白只触发一次；老村长支持任务前后不同对话。
- Boss 门：隐藏 Boss 房会根据 Boss 击败状态开启或关闭出口。

## 数值

伤害公式记录在 [docs/numerical-system.md](docs/numerical-system.md)。

```text
物理伤害 = 攻击力 - 防御力
魔法伤害 = 魔法攻击力 - 魔法防御力
```

最终伤害有保底，避免出现 0 伤害。

当前平衡目标是休闲难度：小怪通常 1-2 下能解决，精英怪需要几次攻击，Boss 需要观察技能但不要求长时间反复磨血。

## 主要素材

图片位于 `assets/images/`：

- 玩家：`hero_idle.png`、`hero_walk.png`、`hero_jump.png`、`hero_crouch.png`、`hero_sword_attack.png`、`hero_magic_attack.png`、`hero_avatar.png`
- 道具：`health_potion.png`、`magic_staff.png`、`magic.png`、`slime_mucus.png`、`backpack_icon.png`
- 地图：`forest_background.png`、`tiles.png`、`river_strip.png`、`underwater_cave_background.png`、`stone_tiles.png`、`school_background.png`、`school_tiles.png`
- 入口：`treehouse_entrance.png`、`school_boss_gate.png`
- 敌人：`enemy_slime.png`、`enemy_goblin_walk.png`、`enemy_goblin_attack.png`、`enemy_book_walk.png`、`enemy_book_attack.png`、`enemy_elite_book_walk.png`、`enemy_elite_book_attack.png`
- Boss：`boss_slime_king.png`、`boss_slime_king_attack.png`、`boss_goblin_elder.png`、`boss_goblin_elder_skill.png`、`boss_yukino_walk.png`、`boss_yukino_attack.png`、`yukino_bag_projectile.png`
- NPC：`npc_old_village_chief_idle.png`

音频位于 `assets/audio/`，包括场景音乐、Boss 音乐、攻击音效和 Boss 击败音效。

## 项目结构

```text
assets/
  audio/                音乐和音效
  images/               角色、敌人、Boss、道具和地图素材

docs/
  numerical-system.md   数值、伤害公式和攻防配置

src/
  core/                 资源、音频、碰撞和全局配置
  data/                 关卡数据、进度状态和数值配置
  render/               Canvas 渲染、HUD、背景和特效
  systems/              玩家、敌人和攻击逻辑
  main.js               主循环、输入、关卡切换、掉落和对话
```

## 清理说明

本次整理已移除第一关通往第三章的测试入口，以及对应的测试入口渲染和碰撞代码。项目中旧的未引用素材 `hero_staff_projectile.png`、本地预览输出、构建产物、日志和编辑器临时目录也已清理。
