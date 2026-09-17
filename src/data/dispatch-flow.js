import { ARTIFACT_PATH, TASK_DIRECTORY } from './collaboration'

const line = (k, t) => ({ k, t })

export const DISPATCH_STAGES = [
  {
    id: 'contract', label: '写入契约', active: 'headmaster', edges: ['write-task'],
    description: 'TASK 写清目标、输入、范围和验收。接口索引交给 handyman：按任务能力分工，不用固定职业角色限制模型。',
    coordinatorStatus: '编写 TASK', workerStatus: '等待任务',
    coordinator: [
      line('cmd', 'dispatch to handyman · 整理 post / wait 接口'),
      line('out', `${TASK_DIRECTORY}/TASK.md`),
      line('ok', '目标、输入、范围、验收条件已写入。'),
    ],
    worker: [
      line('cmt', 'Kiro CLI · 独立会话'),
      line('out', '等待任务通知。'),
    ],
  },
  {
    id: 'dispatch', label: '发送通知', active: 'headmaster', edges: ['notify-worker'],
    description: '按 TEAM 中的身份查询当前终端，发送 TASK 地址并回读确认。Socket 传递的是“去读文件”，不是任务正文。',
    coordinatorStatus: '定位并通知', workerStatus: '收到文件地址',
    coordinator: [
      line('cmd', 'cmux list-panels → title: handyman'),
      line('out', 'read-screen 确认状态，再 send / send-key'),
      line('ok', '回读终端，确认已接收任务。'),
    ],
    worker: [
      line('out', '请读取并执行：'),
      line('str', `${TASK_DIRECTORY}/TASK.md`),
      line('cmt', '完成后写 RESULT.md，并通知 headmaster。'),
    ],
  },
  {
    id: 'execute', label: '读取并执行', active: 'handyman', edges: ['read-task'],
    description: 'Worker 读取契约和指定版本的源码，在约定范围内完成工作。具体查找与整理方法由模型判断。',
    coordinatorStatus: '继续其他工作', workerStatus: '读取源码',
    coordinator: [
      line('out', '任务已派发，等待回执通知。'),
      line('cmt', '需要检查时，status 读取文件与终端活动。'),
    ],
    worker: [
      line('cmd', '读取 TASK.md → mcp.rs / bus.rs'),
      line('out', '核对参数、默认值与返回分支。'),
      line('cmt', `写入范围：${ARTIFACT_PATH} 与 RESULT.md`),
    ],
  },
  {
    id: 'result', label: '产物与回执落盘', active: 'handyman', edges: ['write-artifact', 'write-result'],
    description: '先保存接口索引，再写 RESULT，列明产物和未决项。done 表示已交回回执，此时尚未通过验收。',
    coordinatorStatus: '等待通知', workerStatus: '已交付 · 待验收',
    coordinator: [
      line('out', '任务进度尚未更新。'),
      line('cmt', '收到回执后再对照 TASK 核验。'),
    ],
    worker: [
      line('ok', `${ARTIFACT_PATH} 已保存。`),
      line('ok', 'RESULT.md · Status: done'),
      line('out', '已列出产物；未运行服务验证运行时行为。'),
    ],
  },
  {
    id: 'notify', label: '回传通知', active: 'handyman', edges: ['notify-coordinator'],
    description: '回执落盘后主动通知 Coordinator 收取。通知失败不会删除文件，但需要主动检查任务目录。',
    coordinatorStatus: '收到回执地址', workerStatus: '推送完成',
    coordinator: [
      line('out', '[dispatch] handyman done → RESULT ready'),
      line('str', `${TASK_DIRECTORY}/RESULT.md`),
    ],
    worker: [
      line('cmd', 'dispatch-notify.sh <task-dir> handyman done'),
      line('out', '通知 headmaster 读取 RESULT.md。'),
      line('cmt', '通知不承载验收结论。'),
    ],
  },
  {
    id: 'collect', label: '核验并收取', active: 'headmaster', edges: ['collect-task', 'collect-result', 'collect-artifact'],
    description: 'collect 同时读 TASK、RESULT 和接口索引，逐项核对验收条件；通过后才更新原 spec。存在缺口则退回任务继续处理。',
    coordinatorStatus: '验收通过 · 示意', workerStatus: '任务已接受',
    coordinator: [
      line('cmd', 'dispatch collect · TASK + RESULT + 实际产物'),
      line('ok', '参数、默认值、返回分支及源码定位已核对。'),
      line('ok', '本次示例通过验收 → 更新 spec Task 2。'),
    ],
    worker: [
      line('out', '交付物已被接受。'),
      line('cmt', '若需返工，读取 TASK.md 中追加的 Rework。'),
    ],
  },
]

export const DISPATCH_EDGES = [
  { id: 'write-task', from: 'headmaster', to: 'task', start: 'bottom', end: 'top' },
  { id: 'notify-worker', from: 'headmaster', to: 'handyman', start: 'right', end: 'left', signal: true },
  { id: 'read-task', from: 'task', to: 'handyman', start: 'right', end: 'bottom' },
  { id: 'write-result', from: 'handyman', to: 'result', start: 'bottom', end: 'top' },
  { id: 'write-artifact', from: 'handyman', to: 'artifact', start: 'right', end: 'right', outside: true },
  { id: 'notify-coordinator', from: 'handyman', to: 'headmaster', start: 'left', end: 'right', signal: true },
  { id: 'collect-task', from: 'task', to: 'headmaster', start: 'top', end: 'bottom' },
  { id: 'collect-result', from: 'result', to: 'headmaster', start: 'left', end: 'bottom' },
  { id: 'collect-artifact', from: 'artifact', to: 'headmaster', start: 'left', end: 'left', outside: true },
]
