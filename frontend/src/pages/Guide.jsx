import { motion } from 'framer-motion'
import {
  BookOpen, Lightbulb, MessageSquare, Wand2, Settings,
  FileText, Sparkles, HelpCircle, ChevronRight
} from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function Guide() {
  return (
    <div className="pb-16">
      <div className="mb-8">
        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
          <BookOpen className="w-6 h-6 inline mr-2 text-primary-600" />
          使用指南
        </h2>
        <p className="text-sm text-slate-500">快速上手 EduSkillKit</p>
      </div>

      <div className="space-y-6">
        {/* Section 1 */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900">什么是「技能」</h3>
          </div>
          <div className="pl-12 space-y-3 text-sm text-slate-600 leading-relaxed">
            <p>
              技能（Skill）是 EduSkillKit 的核心概念。每个技能背后是一套<span className="font-semibold text-slate-800">由教学专家与提示词工程师联合打磨的结构化指令集</span>，
              包含角色设定、认知框架、输出规范和质量约束四个层次。
            </p>
            <p>
              和普通聊天的区别：普通对话给 AI 一段话，回复质量完全取决于你怎么问。
              技能把「怎么问」这件事固化下来了——你只管填参数（课程主题、学情、课时这些），
              系统自动组装完整的指令链，确保输出符合教学规范、结构完整、可直接使用。
            </p>
            <p>
              每个技能包含：元数据（名称、分类、标签）、参数定义（支持文本/多行/下拉/数字四种类型）、
              Jinja2 提示词模板、以及可选的参考资源文件。
            </p>
          </div>
        </motion.div>

        {/* Section 2 */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.05 }} className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900">如何使用技能</h3>
          </div>
          <ol className="pl-12 space-y-3">
            {[
              '进入「技能对话」页面，按分类浏览或搜索找到你需要的技能',
              '点击技能卡片进入对话界面，右侧填写参数（带 * 号为必填项）',
              '点击「执行」按钮，也可以在底部输入框补充说明后再发送',
              'AI 基于技能模板 + 你填的参数生成输出，支持流式显示',
              '如需附加参考材料，点输入框左侧回形针上传 Word / PDF / Excel / TXT',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </motion.div>

        {/* Section 3 */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.1 }} className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-primary-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900">如何创建自定义技能</h3>
          </div>
          <div className="pl-12 space-y-3 text-sm text-slate-600 leading-relaxed">
            <p>进入「创建技能」页面，按四步向导操作：</p>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {[
                { step: '第一步', title: '描述问题', desc: '填写技能名称、描述、适用场景和要解决的教学问题' },
                { step: '第二步', title: '定义参数', desc: '设置用户需要填写的参数，包括名称、类型、说明和默认值' },
                { step: '第三步', title: '生成模板', desc: '点击「用 AI 生成」，系统根据描述自动生成提示词模板，可手动编辑' },
                { step: '第四步', title: '预览发布', desc: '确认 SKILL.md 内容无误后保存，新技能立即出现在技能库' },
              ].map(({ step, title, desc }) => (
                <div key={step} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-xs font-bold text-primary-600 mb-1">{step}：{title}</div>
                  <p className="text-xs text-slate-500">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Section 4 */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.15 }} className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center">
              <Settings className="w-5 h-5 text-primary-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900">模型配置</h3>
          </div>
          <div className="pl-12 space-y-3 text-sm text-slate-600 leading-relaxed">
            <p>
              在「设置」页面切换大模型提供商和调整生成参数。目前支持 9 家国产大模型：
              DeepSeek、通义千问、智谱清言、月之暗面、腾讯混元、零一万物、百川智能、讯飞星火、MiMo。
            </p>
            <p>可调参数说明：</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: '温度', range: '0 ~ 2', desc: '越低越确定，越高越发散' },
                { name: '最大输出', range: '256 ~ 32768', desc: '控制回复的 token 上限' },
                { name: 'Top P', range: '0 ~ 1', desc: '采样概率质量，影响用词多样性' },
                { name: '频率惩罚', range: '-2 ~ 2', desc: '抑制重复用词' },
                { name: '话题惩罚', range: '-2 ~ 2', desc: '抑制重复已提过的内容' },
              ].map(({ name, range, desc }) => (
                <div key={name} className="flex items-start gap-2 text-xs">
                  <span className="font-semibold text-slate-700 whitespace-nowrap">{name}</span>
                  <span className="text-slate-400">{range}</span>
                  <span className="text-slate-500">— {desc}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400">
              API Key 支持两种配置方式：在项目根目录 .env 文件中写入，或直接在设置页面输入。
            </p>
          </div>
        </motion.div>

        {/* Section 5 */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.2 }} className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900">文件上传</h3>
          </div>
          <div className="pl-12 text-sm text-slate-600 leading-relaxed">
            <p className="mb-3">支持以下格式，上传后内容自动拼接到消息中一并发送：</p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { ext: '.docx', desc: 'Word 文档，提取段落和格式' },
                { ext: '.pdf', desc: 'PDF 文件，逐页提取文字' },
                { ext: '.xlsx', desc: 'Excel 表格，转为 Markdown' },
                { ext: '.txt', desc: '纯文本，直接读取' },
              ].map(({ ext, desc }) => (
                <div key={ext} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                  <div className="text-xs font-bold text-primary-600 mb-0.5">{ext}</div>
                  <div className="text-[11px] text-slate-500">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Section 6: FAQ */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.25 }} className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-primary-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900">常见问题</h3>
          </div>
          <div className="pl-12 space-y-4">
            {[
              {
                q: 'API Key 填错了怎么办？',
                a: '进「设置」页面重新填写即可，也可以直接改项目根目录的 .env 文件。',
              },
              {
                q: '对话记录存在哪里？',
                a: '本地 SQLite 数据库（data/eduskilk.db），不上传任何第三方服务器。',
              },
              {
                q: '自定义技能能分享吗？',
                a: '能。技能以 SKILL.md 文件存在 skills/ 目录下，复制文件夹就行。',
              },
              {
                q: '怎么安装部署？',
                a: 'pip install eduskilk 然后 eduskilk 启动。也可以从 GitHub 克隆源码运行。',
              },
            ].map(({ q, a }, i) => (
              <div key={i}>
                <p className="text-sm font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-primary-500" />
                  {q}
                </p>
                <p className="text-sm text-slate-600 pl-5">{a}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
