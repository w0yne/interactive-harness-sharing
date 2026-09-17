// The documents, dates and versions form one illustrative project, not execution evidence.
export const WORKSPACE_VIEWS = [
  { id: 'timeline', label: '文档时间线' },
  { id: 'workspace', label: '工作区' },
]

export const PROJECT_HISTORY = [
  {
    id: 'scope', folder: 'requirement', file: '2026-09-10T09-00-scope.md',
    at: '2026-09-10T09:00:00+08:00', time: '09-10 09:00', type: '需求记录',
    title: '确认兼容范围', short: '需求约束',
    write: 'AI 整理人的范围确认，记录本次约束。',
    read: 'AI 评估方案和检查实现时，核对需求边界。',
    body: '# 接口调整的需求范围\n\n- 原有调用方继续使用现有入口与返回结构。\n- 本次不迁移调用方。\n- 实现方案尚未确定，先调查当前依赖。',
    state: { scope: '保留现有调用方，不迁移接口使用方。', decision: '方案待调查后确定。', progress: '需求已确认，进入技术调查。' },
    references: [],
  },
  {
    id: 'research', folder: 'tech', file: '2026-09-10T11-20-interface-study.md',
    at: '2026-09-10T11:20:00+08:00', time: '09-10 11:20', type: '技术调查',
    title: '记录调用关系', short: '调用关系调查',
    write: 'AI 阅读代码，将调用关系和限制整理为技术记录。',
    read: 'AI 比较方案时复用调查，代码变化后核对差异。',
    body: '# 调用关系调查\n\n- 原有调用方依赖现有返回字段。\n- 直接替换返回结构需要同步修改调用方。\n- 可在现有入口保留兼容适配，把内部实现与外部契约分开。\n\n依据：需求范围与当前代码的调用关系。',
    state: { progress: '调查完成，已找到兼容适配的位置。' },
    references: ['scope'],
  },
  {
    id: 'decision', folder: 'tech', file: '2026-09-11T10-00-compatibility-adr.md',
    at: '2026-09-11T10:00:00+08:00', time: '09-11 10:00', type: 'ADR',
    title: '确定兼容方案', short: '兼容方案 ADR',
    write: 'AI 将确认后的方案、适用条件和理由写成 ADR。',
    read: 'AI 实现、复核或评估后续变更时，读取决定与理由。',
    body: '# ADR：保留兼容入口\n\n## 决定\n在现有入口保留兼容适配，不要求原有调用方同步迁移。\n\n## 理由\n当前交付范围允许调整内部实现，但不包含调用方迁移。\n\n## 适用条件\n本决定针对现有调用方。新增接口需求另行评估。',
    state: { decision: '保留现有入口，通过兼容适配隔离内部变更。', progress: '方案已确认，等待实施。' },
    references: ['scope', 'research'],
  },
  {
    id: 'goal', folder: 'goals', file: 'GOAL-2026-09-11T14-00.md',
    at: '2026-09-11T14:00:00+08:00', time: '09-11 14:00', type: '目标快照',
    title: '形成执行目标', short: '实施目标',
    snapshot: true,
    write: 'AI 将一次委托整理为范围、约束、验收条件和进度。',
    read: 'AI 执行与恢复任务时，按同一份目标核对剩余工作。',
    body: '# 兼容适配的执行目标\n\n## 范围\n实现 ADR 中约定的适配层，不改调用方。\n\n## 验收\n- 原有入口与返回字段保持兼容。\n- 检查结果记录对应代码版本。\n\n## 当前进度\n实现与验证待开始。',
    state: { progress: '执行范围与验收条件已明确。' },
    references: ['decision'],
  },
  {
    id: 'verification', folder: 'tech', file: '2026-09-12T16-00-compatibility-check.md',
    at: '2026-09-12T16:00:00+08:00', time: '09-12 16:00', type: '验证记录',
    title: '保存版本与检查结果', short: '兼容检查记录',
    write: 'AI 记录检查对象、代码版本、观察结果与覆盖范围。',
    read: 'AI 接续开发或复核变更时，确认哪些结论仍适用于当前版本。',
    body: '# 兼容检查记录\n\n版本：`demo-c1`（示意版本）。\n\n- 约定的返回字段兼容样例已通过检查。\n- 调用方未修改。\n- 结论仅针对本次记录的版本和检查范围。\n\n相关实现与接口说明保存在交付仓库。',
    state: { progress: '兼容适配已形成 demo-c1，已记录该版本的检查结果。' },
    references: ['scope', 'goal'],
  },
  {
    id: 'handoff', folder: 'handoff', file: '2026-09-12T17-30-handoff.md',
    at: '2026-09-12T17:30:00+08:00', time: '09-12 17:30', type: '会话交接',
    title: '留下会话检查点', short: '交接记录',
    write: 'AI 在交接时整理状态，并引用已有决定、代码和检查记录。',
    read: '后续 AI 从检查点定位当前工作，再按需读回关联资料。',
    body: '# 会话交接\n\n- 已完成：兼容适配与约定范围的检查。\n- 代码版本：`demo-c1`。\n- 方案依据：兼容方案 ADR。\n- 验证依据：对应版本的兼容检查记录。\n- 后续工作：需求变化时先核对 ADR 的适用条件。',
    state: { progress: '已形成交接检查点，代码、决定和检查记录均可定位。' },
    references: ['decision', 'verification'],
  },
  {
    id: 'change', folder: 'issues', file: '2026-09-14T09-00-versioned-api.md',
    at: '2026-09-14T09:00:00+08:00', time: '09-14 09:00', type: '变更记录',
    title: '记录新增需求', short: '新增接口需求',
    write: 'AI 将新增要求与已有方案的关系记录为待处理事项。',
    read: 'AI 分析变更影响时，区分旧方案仍适用的部分和新增范围。',
    body: '# 新增版本化接口需求\n\n新的调用方希望使用独立版本入口。\n\n- 原有调用方仍保持兼容。\n- 旧 ADR 只覆盖现有入口，没有规定新入口的形式。\n- 需要评估新旧入口如何共存，并记录新的决定。',
    state: { scope: '保留原有调用方，同时评估独立版本入口。', progress: '新增需求已记录，尚未决定新入口方案。' },
    references: ['scope', 'decision', 'handoff'],
  },
  {
    id: 'revision', folder: 'tech', file: '2026-09-14T14-00-versioned-api-adr.md',
    at: '2026-09-14T14:00:00+08:00', time: '09-14 14:00', type: '追加 ADR',
    title: '追加新的接口决定', short: '新入口 ADR',
    write: 'AI 追加新决定，并引用它补充的旧 ADR。',
    read: 'AI 同时读取新旧决定，理解哪些约束延续、哪些范围扩大。',
    body: '# ADR：新旧入口并存\n\n## 新决定\n保留原有兼容入口，另设版本化入口供新的调用方使用。\n\n## 与旧决定的关系\n旧 ADR 对已有调用方的兼容要求继续有效。本记录补充新入口的设计约定。\n\n原 ADR 保留，不回改为仿佛一开始就有这一需求。',
    state: { scope: '原有调用方继续兼容，为新调用方增加版本化入口。', decision: '旧入口继续兼容，新调用方使用独立版本入口。', progress: '新增方案已确认，新入口尚未实现。' },
    references: ['decision', 'change'],
  },
  {
    id: 'todo', folder: 'todos', file: 'TODO-2026-09-14T16-00.md',
    at: '2026-09-14T16:00:00+08:00', time: '09-14 16:00', type: '待办快照',
    title: '更新后续工作', short: '当前待办',
    snapshot: true,
    write: 'AI 更新待办状态，引用问题、方案和交付依据。',
    read: 'AI 开始下一项任务时，从待办定位目标及相关知识。',
    body: '# 当前待办\n\n- 已完成：demo-c1 的兼容适配与对应检查。\n- 待实现：新 ADR 约定的版本化入口。\n- 待验证：新旧入口共存时的行为。\n\n后续进度在这份工作清单中维护，历史决定仍通过 ADR 查询。',
    state: { progress: '待办已更新：实现新入口，并验证新旧入口共存。' },
    references: ['verification', 'revision'],
  },
]

const technicalReference = {
  id: 'reference', folder: 'tech', file: 'interface-reference.md',
  type: '长期参考', title: '当前接口参考', short: '接口参考',
  write: 'AI 汇总经过核对的接口知识，变化经确认后持续更新。',
  read: 'AI 查阅当前约定，再沿引用追溯决定与验证过程。',
  body: '# 当前接口参考\n\n## 已有实现\n`demo-c1` 提供现有调用方使用的兼容入口。\n\n## 已确认的设计\n新的调用方将使用独立版本入口；目前尚未实现。\n\n## 维护方式\n当前事实在本文件更新，设计依据指向对应 ADR，检查结果指向具体版本的验证记录。',
  references: ['decision', 'verification', 'revision'],
}

export const PROJECT_FILES = Object.fromEntries(
  [...PROJECT_HISTORY, technicalReference].map(doc => [doc.id, { ...doc, path: `${doc.folder}/${doc.file}` }]),
)

export const KNOWLEDGE_FOLDERS = [
  {
    id: 'requirement', name: 'requirement/', label: '需求与约束', example: 'scope',
    responsibility: '保存要解决的问题、范围和已确认的约束。',
    write: 'AI 整理人的输入与确认，形成可以引用的需求记录。',
    read: '设计、实施、验收和需求变更时，AI 核对目标与边界。',
    lifecycle: '保留各次确认的记录；新需求引用并补充原有范围。',
  },
  {
    id: 'tech', name: 'tech/', label: '技术知识', example: 'research',
    responsibility: '保存调研、代码分析、ADR、验证记录和长期技术参考。',
    write: 'AI 将调查结果、已确认的决定和检查依据写入；长期参考持续维护。',
    read: 'AI 评估方案、修改实现或回答技术问题时，复用已有知识。',
    lifecycle: '调查和 ADR 保留当时语境；长期参考更新当前事实，并引用历史依据。',
  },
  {
    id: 'handoff', name: 'handoff/', label: '会话检查点', example: 'handoff',
    responsibility: '记录一次会话结束时的状态、未决事项和相关产物位置。',
    write: 'AI 交接时整理检查点，引用已有文档与代码。',
    read: '下一个会话或另一个 AI 取得交接入口，并沿引用读取资料。',
    lifecycle: '每次交接追加一份带时间戳的记录，不覆盖前一次快照。',
  },
  {
    id: 'goals', name: 'goals/', label: '执行目标', example: 'goal',
    responsibility: '约定一次委托的目标、范围、限制、验收条件与执行进度。',
    write: 'AI 根据委托形成目标文件，执行期间持续更新进度。',
    read: 'AI 开始、继续或恢复这一任务时，对照目标推进。',
    lifecycle: '随本次执行维护；完成后把长期知识与交接信息留在对应目录。',
  },
  {
    id: 'todos', name: 'todos/', label: '跨会话待办', example: 'todo',
    responsibility: '持续记录还要做什么，以及每项工作的当前状态。',
    write: 'AI 随进度增加、更新或完成任务，关联需求、问题与方案。',
    read: 'AI 接续工作、选择下一项任务时，查找目标和所需资料。',
    lifecycle: '滚动更新的工作清单；通过 Git 历史或快照查询以往状态。',
  },
  {
    id: 'issues', name: 'issues/', label: '问题与变更', example: 'change',
    responsibility: '保存需要处理的问题、范围变更、调查结果与处置记录。',
    write: 'AI 记录发现、待确认事项和后续处理决定。',
    read: 'AI 分析影响、排查相关问题或验收处理结果时，读取已有记录。',
    lifecycle: '按事项持续维护，引用相关技术记录与任务，不重复保存整份方案。',
  },
]

export const READ_WRITE_EXAMPLE = {
  title: '评估新增版本入口',
  read: ['scope', 'research', 'decision', 'change'],
  write: ['revision', 'reference', 'todo'],
}

export function projectStateAt(index) {
  return PROJECT_HISTORY.slice(0, index + 1).reduce((state, doc) => ({ ...state, ...doc.state }), {})
}

export function buildKnowledgeTree({ view, visibleCount, selectedFile, selectedFolder, incrementOpen, showOrganization = true }) {
  const available = view === 'timeline'
    ? PROJECT_HISTORY.slice(0, visibleCount).map(doc => PROJECT_FILES[doc.id])
    : Object.values(PROJECT_FILES)
  const folders = KNOWLEDGE_FOLDERS.map(folder => ({
    id: `folder-${folder.id}`, name: folder.name, kind: 'dir', selectable: true,
    hl: folder.id === selectedFolder, note: view === 'workspace' ? folder.label : '',
    collapsed: view === 'workspace' && folder.id !== selectedFolder,
    children: available.filter(doc => doc.folder === folder.id).map(doc => ({
      id: doc.id, name: doc.file, kind: 'file', selectable: true, hl: doc.id === selectedFile,
    })),
  }))
  return [{
    id: 'project', name: 'project/', kind: 'dir', children: [
      { name: 'README.md', note: '资料入口' },
      { name: 'SOUL.md', note: '工作约定' },
      ...folders,
      ...(view === 'workspace' && showOrganization ? [
        { name: 'shared-repo/', kind: 'dir', repo: 'shared', sub: true, collapsed: true,
          children: [{ name: 'src/' }, { name: 'docs/' }], note: '交付代码与文档' },
        { name: 'project-ref/', kind: 'dir', link: true, note: '外部参考' },
        { id: 'active', name: 'aidlc-docs/', kind: 'dir', collapsed: !incrementOpen, hl: incrementOpen,
          children: [{ name: 'aidlc-state.md', note: '当前增量' }] },
        { id: 'archive', name: 'aidlc-docs.archive/', kind: 'dir', collapsed: !incrementOpen, hl: incrementOpen,
          children: [{ name: '01-compatibility/', kind: 'dir', note: '已完成的过程记录' }] },
      ] : []),
    ],
  }]
}
