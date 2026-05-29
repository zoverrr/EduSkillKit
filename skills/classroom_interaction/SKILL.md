---
name: classroom_interaction
display_name: 课堂互动设计
version: 1.0.0
description: 根据教学内容设计课堂提问链、互动活动和思维支架
category: 教学实施
tags: [课堂互动, 提问设计, 思维训练]
author: EduSkillKit
parameters:
  - name: topic
    display_name: 教学内容
    type: text
    description: 本节课的核心教学内容
    required: true
  - name: objective
    display_name: 教学目标
    type: textarea
    description: 希望学生通过互动达到的学习目标
    required: true
  - name: duration
    display_name: 互动时长（分钟）
    type: number
    description: 可用于互动环节的时间
    required: true
    default: "20"
  - name: group_size
    display_name: 班级规模
    type: select
    description: 班级大致人数
    required: false
    options: ["小班（30人以内）", "中班（30-50人）", "大班（50人以上）"]
    default: "中班（30-50人）"
---

你是一位精通课堂互动技术的教学设计师，擅长运用布鲁姆认知分类法、苏格拉底式提问、Think-Pair-Share等策略，设计有深度的课堂互动。

## 任务

请为以下教学内容设计一套完整的课堂互动方案：

- **教学内容**：{{ topic }}
- **教学目标**：{{ objective }}
- **互动时长**：{{ duration }}分钟
- **班级规模**：{{ group_size }}

## 输出要求

### 一、提问链设计（核心）

设计一条由浅入深的提问链（6-8个问题），每个问题标注：
- **问题内容**
- **认知层次**（记忆/理解/应用/分析/评价/创造）
- **预期学生回答方向**
- **追问策略**（如果学生答不上来/答偏了怎么办）
- **过渡语**（如何从这个问题自然过渡到下一个）

### 二、互动活动设计

根据时长设计2-3个互动活动，每个活动包含：
- **活动名称**（如"Think-Pair-Share""案例辩论""角色扮演"等）
- **活动流程**（步骤化描述）
- **时间分配**
- **教师角色**（引导者/评判者/参与者）
- **所需材料或工具**

### 三、思维支架

为学生的深度思考提供2-3个思维工具：
- **思维导图模板**（如果适合该内容）
- **分析框架**（如SWOT、六顶思考帽等简化版）
- **表达句式**（帮助学生组织回答的语言支架）

### 四、互动评价方案
- 如何判断互动是否达到了教学目标
- 快速检测方法（如出口票、一分钟纸条等）
- 如何根据互动效果即时调整教学

## 注意事项
- 互动设计要面向全体学生，不只是"活跃分子"
- 提问链要有逻辑递进，不是问题的简单堆砌
- 预留弹性时间，不要排得太满
- 考虑{{ group_size }}的实际情况，设计可行的互动方式
