export const COLLABORATION_VIEWS = [
  { id: 'demo', label: 'Kiro Agent Army 演示', description: '从实际录屏观察独立会话、Team 通信和文件交接。' },
  { id: 'analysis', label: '协作拆解', description: '研究与分析汇入同一设计，再展开并行实现、交叉验证与结果汇总。' },
  { id: 'dispatch', label: 'Dispatch 与 Orchestration', description: 'tmux-mobile 的消息服务与 Dispatch 的文件契约：任务如何送达，结果如何交接。' },
]

export const COORDINATION_COMPARISON = [
  {
    axis: '任务与产物',
    bus: 'post 发送请求与文件引用，wait 接收消息；需求、代码与报告仍保存在共享工作区。',
    files: 'TASK 写目标、范围和验收；RESULT 写结论与产物位置。终端信号只携带文件地址。',
  },
  {
    axis: '等待与交付',
    bus: 'requires_reply 登记待回复关系；读完新消息后仍欠回复，wait 返回 Blocked，提示先回应。',
    files: '有 TASK、无 RESULT 表示尚未交回回执。done 或 blocked 都可写入 RESULT，由 collect 核对产物。',
  },
  {
    axis: '进程中断后',
    bus: 'SQLite 保存消息、游标与待回复关系；服务恢复后还需重建连接、接管会话。关闭团队会清理房间记录。',
    files: '任务目录保留输入、范围、回执与引用，接手者据此继续；仍需核对产物版本和外部执行状态。',
  },
  {
    axis: '运行状态',
    bus: 'Presence 显示成员状态；Heartbeat 更新活动，Keepalive 维持等待，Supervisor 处理进程协调。',
    files: 'status 读取回执和终端活动。TEAM 只记身份与配置，发送前现场解析成员对应的终端。',
  },
  {
    axis: '运行依赖',
    bus: 'tmux 托管 CLI，另有常驻 Team 服务、SQLite、MCP 连接和状态协调逻辑。',
    files: 'cmux 托管 CLI；共享文件、dispatch skill 和通知脚本完成派发，无需额外的 Team 消息服务。',
  },
  {
    axis: '通知与响应',
    bus: '消息到达可唤醒正在 wait 的成员；持续交互由消息服务协调。',
    files: '任务和回执落盘后主动推送通知，不依赖盲轮询。通知失败时文件仍可读取，但需主动检查。',
  },
]

export const DAG_PHASES = [
  { label: '派发研究任务', explanation: 'Lead 确定目标，Researcher 与 Analyst 同时开始工作。此处的 dispatch 表示任务派发，不等同于后面的文件派发 skill。' },
  { label: '研究与分析协作', explanation: '研究技术栈和标准、理解源代码的工作同时展开，并交换发现。' },
  { label: '明确需求与条件', explanation: '分析结果形成需求与接受条件，为共同设计提供输入。' },
  { label: '汇入同一设计', explanation: '研究和分析汇入一个 design 同步点，形成两个实现分支共同读取的约定。' },
  { label: '从设计并行实现', explanation: '两个 Engineer 都从同一设计取得任务，而不是各自沿一份不同的方案开始。' },
  { label: '区分写入范围', explanation: '并行工作分别形成产物；明确文件范围，降低同时修改同一文件的冲突。' },
  { label: '交叉验证', explanation: '实现者检查另一方的产物，结论需要对应具体实现和检查依据。' },
  { label: '限制返工轮次', explanation: '图中的协作约定限制检查和返工轮次，未解决的问题回到 Lead 处理。' },
  { label: '汇总产物', explanation: '最后汇总实现、检查依据与报告。图展示协作结构，不代表本次重新执行了视频中的任务。' },
]

export const TEAM_RUNTIME = [
  { name: '独立 CLI 会话', detail: '每个 pane 中运行独立 agent，各自持有上下文、model 与 effort 配置。' },
  { name: 'MCP post / wait', detail: 'Team 服务负责消息、游标与待回复关系；具体任务拆分和推进仍由 agent 完成。' },
  { name: '共享工作区', detail: '需求、设计、实现与检查记录通过文件交接，消息引用产物位置。' },
]

export const COLLABORATION_ROSTER = [
  {
    name: 'headmaster', model: 'claude-opus-4.8', effort: 'High',
    responsibility: '拆解与派发任务，整合结果并向人汇报。成员自主选择任务范围内的实现方法。',
    charter: 'decomposes work, dispatches via `orchestration/dispatch/`, aggregates results, sole reporter of completion to the human.',
  },
  {
    name: 'architect', model: 'claude-opus-4.8', effort: 'xHigh',
    responsibility: '负责任务范围内的架构与设计。对技术上不成立的指派提出异议，未解决的分歧交人决定。',
    charter: 'owns architecture and design decisions within a dispatched task; may push back on a technically unsound assignment (escalate to human on conflict).',
  },
  {
    name: 'fullstack', model: 'claude-sonnet-5', effort: 'High',
    responsibility: '在被指派的范围内负责实现，包括代码、测试与构建。',
    charter: 'owns implementation (code, tests, build) within the dispatched scope.',
  },
  {
    name: 'reviewer', model: 'claude-opus-4.8', effort: 'Max',
    responsibility: '检查交付物并给出 review 结论。不满足验收条件时，记录问题并退回执行者。',
    charter: 'owns review verdicts; may reject a deliverable. A rejection returns the task to the worker via the dispatch folder, not silently overridden.',
  },
  {
    name: 'handyman', model: 'auto', effort: '—',
    responsibility: '承担快速查询、一次性脚本和文件整理。任务小、输入完整、可独立完成；复杂设计与实现仍由对应成员负责。',
    charter: "Keep its tasks small and self-contained; not a fallback for another role's core domain.",
  },
]

export const TASK_FOLDER = '2026-07-07T12-00-api-index'

export const TASK_DIRECTORY = `orchestration/dispatch/${TASK_FOLDER}`

export const ARTIFACT_PATH = 'docs/api-index.md'

export const TEAM_VIDEO = {
  duration: '4:41', src: 'media/team-demo.mp4',
  cues: [
    { time: 0, label: '团队与会话' },
    { time: 105, label: '产物查看' },
    { time: 250, label: '团队反馈' },
  ],
}
