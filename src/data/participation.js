// Illustrative messages and configuration.
export const REMOTE_VIEWS = [
  { id: 'voice', label: '语音交互' },
  { id: 'terminal', label: '终端选择' },
  { id: 'hooks', label: 'Hook 适配' },
]

export const VOICE_TEXT = '先读需求和现有代码，把接口变更的影响整理出来。现有调用方不要改，方案写进技术文档。'

export const CONVERSATION = [
  {
    id: 'voice', from: '我', kind: 'human', label: '语音转文字',
    text: VOICE_TEXT,
    title: '语音在客户端转成文字',
    detail: '飞书客户端完成转写，再发送普通文字消息。bridge 不接收这段原始音频，也不承担语音识别。',
    terminal: [
      { k: 'cmt', t: '// 消息示意 · 飞书客户端已完成转写' },
      { k: 'str', t: 'message_type: text' },
      { k: 'out', t: VOICE_TEXT },
      { k: 'cmt', t: '// 后续传输和终端输入均使用这段文字' },
    ],
  },
  {
    id: 'input', from: '飞书', kind: 'status', label: '发送与处理',
    text: '文字消息送入原生 CLI，工作仍在原来的项目中继续。',
    title: '远端输入落到同一个 pane',
    detail: 'bridge 通过 WebSocket 收到消息，解析当前目标 pane，写入文字并提交。项目上下文、配置与工具仍由原生 coding agent 持有。',
    terminal: [
      { k: 'cmt', t: '// tmux 中的原生 CLI · 交互示意' },
      { prompt: '>', k: 'cmd', type: true, t: VOICE_TEXT },
      { k: 'out', t: '读取项目规则、需求文档与相关代码。' },
      { k: 'str', t: '当前范围：分析影响并形成方案，不改调用方。' },
    ],
  },
  {
    id: 'reply', from: 'agent', kind: 'agent', label: '文字与终端截图',
    text: '已整理调用关系和受影响文件，方案写入 tech/interface-change.md。调用方未修改。',
    title: '回复与终端现场一起回传',
    detail: '一轮结束后，共享回调提取 agent 的回复，捕获目标 pane 并渲染终端截图，再通过飞书 API 返回对应聊天。',
    terminal: [
      { k: 'cmt', t: '// 终端现场示意' },
      { k: 'out', t: '已整理调用关系和受影响文件。' },
      { k: 'str', t: '方案：tech/interface-change.md' },
      { k: 'out', t: '调用方未修改。' },
      { k: 'cmt', t: '// 回传内容：回复文字 + 当前 pane 的终端截图' },
    ],
  },
]

export const REMOTE_OPTIONS = [
  {
    name: 'Claude Code', route: 'Remote Control',
    description: '从浏览器或 Claude App 继续本机会话，执行与文件访问留在本机。',
    url: 'https://code.claude.com/docs/en/remote-control',
  },
  {
    name: 'Codex', route: 'Remote connections',
    description: '远程访问已连接主机的项目与会话，也可连接 SSH 主机。',
    url: 'https://developers.openai.com/codex/remote-connections',
  },
  {
    name: 'OpenClaw', route: 'Gateway / agent 接入',
    description: '通过消息渠道接入；外部 coding agent 可走 ACP 等适配路径。',
    url: 'https://docs.openclaw.ai/tools/acp-agents',
  },
  {
    name: 'Kiro Crew', route: 'Gateway / ACP',
    description: 'Gateway 通过 ACP 驱动 Kiro CLI，可经 SSH 隧道连接远端 Gateway。',
    url: 'https://kiro.dev/docs/crew/installation',
  },
]

export const TERMINAL_BACKENDS = {
  tmux: {
    name: 'tmux', status: '本实现的遥控后端',
    hierarchy: 'session → window → pane',
    lifetime: '在主机与 tmux server 持续运行时，detach 不结束 pane 内的进程；本地可以重新 attach。',
    addressing: '用 pane ID 定位输入目标；发送前查询存活面板和身份标记，不长期缓存编号。',
    boundary: '控制文字和按键不依赖 agent 协议；回合结束与回复提取仍需要各工具的适配。',
    lines: [
      { k: 'cmt', t: '// 终端操作示意 · PANE 是现场解析的目标' },
      { k: 'cmd', t: 'tmux list-panes -F "#{pane_id}"' },
      { k: 'cmd', t: 'tmux send-keys -t "$PANE" -l "$TEXT"' },
      { k: 'cmd', t: 'tmux send-keys -t "$PANE" Enter' },
      { k: 'cmd', t: 'tmux capture-pane -p -t "$PANE"' },
    ],
  },
  cmux: {
    name: 'cmux', status: '终端控制接口对照',
    hierarchy: 'workspace / panel / surface',
    lifetime: '以桌面工作区组织终端面板。本地操作与程序化控制面向同一终端现场。',
    addressing: '通过 socket CLI 查询面板，将工作身份解析为当前 surface，再发送输入或读取屏幕。',
    boundary: '已有终端派发实践使用这些接口；这条飞书 bridge 尚未接入 cmux，生命周期与 socket 权限需要独立适配。',
    lines: [
      { k: 'cmt', t: '// 接口示意 · SURFACE 是现场解析的目标' },
      { k: 'cmd', t: 'cmux list-panels' },
      { k: 'cmd', t: 'cmux send --surface "$SURFACE" "$TEXT"' },
      { k: 'cmd', t: 'cmux send-key --surface "$SURFACE" enter' },
      { k: 'cmd', t: 'cmux read-screen --surface "$SURFACE"' },
    ],
  },
}

export const HOOK_VIEWS = [
  { id: 'config', label: 'Hook 配置' },
  { id: 'payload', label: '回调数据' },
  { id: 'extract', label: '文本提取' },
]

export const ADAPTERS = {
  claude: {
    name: 'Claude Code',
    event: 'Stop', location: '.claude/settings.json',
    activation: '项目 settings 中注册命令型 hook，事件名为 Stop。',
    source: 'stdin JSON 提供 transcript_path。',
    extraction: '读取 transcript JSONL，提取最近一条包含正文的 assistant 消息。',
    examples: {
      config: {
        location: '.claude/settings.json · hooks.Stop',
        code: `{
  "hooks": {
    "Stop": [{
      "hooks": [{
        "type": "command",
        "command": "remote-hook"
      }]
    }]
  }
}`,
        note: '配置节选；remote-hook 代表共用的回调命令。项目原有的其他 hooks 保留。',
      },
      payload: {
        location: 'stdin · hook_event_name: Stop',
        code: `{
  "hook_event_name": "Stop",
  "transcript_path": "<session-transcript>.jsonl"
}`,
        note: '回调取得 transcript 的位置，回复正文需要从该文件提取。',
      },
      extract: {
        location: 'extractReply · claude-transcript',
        code: `const path = readTranscriptPath(stdin);
const reply = extractLastAssistantText(
  path,
  maxChars
);

// 跳过只有 tool_use 的记录，
// 提取 assistant 的 text 内容。`,
        note: '共享回调按 adapter 指定的 channel 选择解析方式，得到回复文本。',
      },
    },
  },
  kiro: {
    name: 'Kiro CLI',
    event: 'stop', location: '.kiro/agents/<name>.json',
    activation: 'CLI 需选中注册 stop 事件的 agent 配置；本实现设置项目默认 agent。',
    source: 'stdin JSON 直接提供 assistant_response。',
    extraction: '读取 assistant_response 字段，无需解析 Claude 的 transcript。',
    examples: {
      config: {
        location: '项目 agent 配置 · hooks.stop',
        code: `{
  "name": "remote",
  "hooks": {
    "stop": [{
      "command": "remote-hook"
    }]
  }
}`,
        note: '配置节选，名称为示意。项目默认 agent 通过 .kiro/settings/cli.json 的 chat.defaultAgent 指向该配置。',
      },
      payload: {
        location: 'stdin · hook_event_name: stop',
        code: `{
  "hook_event_name": "stop",
  "cwd": "<project>",
  "assistant_response": "接口分析已写入技术文档。"
}`,
        note: '结束事件直接携带回复正文；不需要读取其他工具的日志格式。',
      },
      extract: {
        location: 'extractReply · stdin-json',
        code: `const payload = JSON.parse(stdin);
const reply =
  typeof payload.assistant_response === "string"
    ? payload.assistant_response
    : "";`,
        note: '提取逻辑简化展示；取得文本后，继续使用同一套截图与飞书发送逻辑。',
      },
    },
  },
}
