export const TOPICS = [
  {
    id: 'p1', num: '01', title: 'SOUL.md', short: '工作约定与模型判断',
    layerLabel: '跨工具规则', cross: true, accent: 0.3,
    oneLiner: '不同 coding agent 读取同一份项目规则，减少副本之间的差异。',
  },
  {
    id: 'p2', num: '02', title: '项目知识库', short: '文档回放与 AI 读写',
    panelTitle: '项目知识库',
    layerLabel: '文档与工作区', cross: false, accent: 0.5,
    oneLiner: '文档按时间记录项目演进，按目录分工，由 AI 在工作中持续写入和读取。',
  },
  {
    id: 'p3', num: '03', title: '语音与终端遥控', short: '输入、终端与 Hook',
    panelTitle: '语音与\n终端遥控',
    layerLabel: '原生 CLI 远程接入', cross: true, accent: 0.75,
    oneLiner: '飞书提供语音转文字入口，终端后端传递输入，各 agent 的 Hook 适配回传回复。',
  },
  {
    id: 'p4', num: '04', title: '多 Agent 协作与编排', short: 'Demo、DAG 与 Dispatch',
    panelTitle: '多 Agent\n协作与编排',
    layerLabel: '独立会话的协作', cross: false, accent: 0.9,
    oneLiner: '按任务需要选择模型与推理投入，用任务文件、产物和消息协调独立会话。',
  },
]

export const NAV_ORDER = TOPICS.map(topic => topic.id)
export const topicById = id => TOPICS.find(topic => topic.id === id)
export const CONFUSIONS = [
  { id: 'c1', q: '规则越短、拆得越细，就越好吗？', to: 'p1', cross: false },
  { id: 'c2', q: '哪些判断该留给模型，而不是写成流程？', to: 'p1', cross: false },
  { id: 'c3', q: '换个会话，怎样把工作接着做？', to: 'p2', cross: true },
  { id: 'c4', q: 'AI 产出这么多，谁该读、该信哪一份？', to: 'p2', cross: false },
  { id: 'c5', q: 'AI 可以一直干活，人应该在哪里介入？', to: 'p3', cross: true },
  { id: 'c6', q: 'agent team 一定要按前后端、测试分工吗？', to: 'p4', cross: false },
  { id: 'c7', q: '多个 agent 怎样协作，而不只是同时开工？', to: 'p4', cross: false },
]
export const QUESTIONS = {
  prompt: '模型能力之外，还有哪些设计值得讨论？',
  hint: '从个人实践出发，交流设计选择与适用前提',
}
export const TITLE = {
  eyebrow: 'TECHNICAL SHARING',
  title: 'Harness Engineering<br>Is Harder Than It Looks<br><span class="title-turn">— Until You Ship One<br>for a Real Customer</span>',
  plain: 'Harness Engineering Is Harder Than It Looks — Until You Ship One for a Real Customer',
  sub: '',
  date: '2026.09',
}
