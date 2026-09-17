import { marked } from 'marked'
import soul from '../content/SOUL.md?raw'
import changelog from '../content/SOUL.changelog.md?raw'
import naming from '../content/SOUL.naming-convention.md?raw'

// Only bundled presentation excerpts are rendered.
function document(id, filename, source, annotations) {
  const sections = []
  for (const token of marked.lexer(source)) {
    if (token.type === 'heading') {
      const title = token.depth === 1 ? filename : token.text
      sections.push({
        id: `${id}-${sections.length}`,
        title,
        heading: marked.parseInline(title),
        depth: token.depth,
        annotation: annotations[token.text],
        tokens: [],
      })
    } else if (sections.length) {
      sections.at(-1).tokens.push(token)
    }
  }
  return {
    id, filename,
    sections: sections.map(({ tokens, ...section }) => ({ ...section, html: marked.parser(tokens) })),
  }
}

export const SOUL_DOCUMENTS = [
  document('soul', 'SOUL.md', soul, {
    SOUL: 'purpose',
    'First Law — English Only': 'language',
    'Second Law — Supremacy': 'priority',
    'Third Law — Changelog Externalized': 'external-history',
    "2.1 Content Ownership: Follows the Project's Repo Topology": 'ownership',
    'Section 3. Injection-Entry Files Are Frozen': 'entries',
    'Section 4. Commit Rules': 'commit',
    'Section 5. Public / Visibility Gate (Human Confirmation Required)': 'visibility',
    'Section 6. Project File Layout': 'layout',
    'Section 7. Handoff Rule (`handoff/`)': 'handoff',
    'Section 8. Tech Docs (`tech/`)': 'technical-records',
    '8.1 Expert Docs (`tech/expert/`)': 'expert',
    'Section 9. Goals (`goals/`)': 'goals',
    'Section 10. Todos (`todos/`)': 'todos',
    'Section 13. History Snapshots Are Not Rewritten': 'history',
    'Section 14. Single Source of Truth + Drift Feedback': 'current-facts',
    'Section 16. Parallel Session Rules': 'sessions',
    'Section 17. Multi-Increment Workflow (Spec/Skill-Driven)': 'increments',
  }),
  document('changelog', 'SOUL.changelog.md', changelog, {
    'SOUL Change Log': 'changelog',
    '2026-06-20T19-50 · Claude Code': 'topology-change',
    '2026-06-14T14-43 · Claude Code': 'numbering-change',
    '2026-06-14T14-36 · Claude Code': 'authority-change',
    '2026-06-13T17-36 · Claude Code': 'log-format',
    '2026-06-13T17-28 · Claude Code': 'external-history',
  }),
  document('naming', 'SOUL.naming-convention.md', naming, {
    'SOUL Naming & Numbering Convention': 'convention',
    '1. Why numbering at all': 'stable-reference',
    '2. Two tiers: Laws (meta) and Sections (body)': 'tiers',
    '3. Section numbering': 'levels',
    '4. How to reference a section': 'citations',
    '5. Inserting new content — numbers are NEVER renumbered': 'insertion',
    '6. Deprecating a section': 'deprecation',
  }),
]

export const SOUL_NOTES = {
  purpose: {
    ref: 'SOUL.md / 开篇',
    title: '共用规则，分别执行',
    paragraphs: [
      'SOUL 保存项目内共同生效的约定。不同工具读取同一正文，减少规则副本之间的差异。',
      'AI 可以提出跨任务的规则修订，人决定是否采用，再由 AI 编辑。一次任务中的纠偏不会自动成为所有后续工作的规则。',
    ],
  },
  language: {
    ref: 'First Law / Section 1',
    title: '规则语言与对话语言分开',
    paragraphs: ['SOUL 正文统一用英文；与人的交流按 Section 1 使用中文，技术术语保留英文。这是两个不同的约定。'],
  },
  priority: {
    ref: 'Second Law',
    title: '项目规则的优先关系',
    paragraphs: [
      '这里约定的是项目自定义规则之间的关系：出现冲突时以 SOUL 为准。',
      '它不覆盖工具的系统指令，也不能改变运行时权限。规则优先级与权限控制分别处理。',
    ],
  },
  'external-history': {
    ref: 'Third Law',
    title: '当前规则与修订历史分开',
    paragraphs: [
      '执行任务需要当前规则，维护规则才需要查看历史。SOUL.changelog.md 单独记录每次修改，不把旧版本和修改说明混入常驻正文。',
      '每条记录包含时间、修改者和内容，最新记录在前。',
    ],
  },
  ownership: {
    ref: 'Section 2.1',
    title: '按实际仓库结构判断归属',
    paragraphs: [
      '内部分析脚本也可能是代码，接口文档也可能是正式交付。文件后缀不足以决定它属于哪个仓库。',
      '仓库、remote 和忽略规则由 agent 调查；将来是否拆仓、是否公开，由人确认。',
    ],
  },
  entries: {
    ref: 'Section 3',
    title: '多个入口，一份正文',
    code: 'Claude Code\nCLAUDE.md → @SOUL.md\n\nCodex / Kiro IDE\nAGENTS.md → SOUL.md (symlink)',
    paragraphs: [
      '规则在 SOUL 中维护，各工具沿自己的入口读取。入口名称和指向保持稳定，避免后续改动破坏规则加载。',
      '这是一份具体配置；不同工具仍需按各自支持的方式接入。',
    ],
  },
  commit: {
    ref: 'Section 4',
    title: '实现、提交和推送分别授权',
    paragraphs: ['允许修改代码，不包含提交或推送。需要提交时，先确定目标仓库和文件范围；父仓与子仓分别操作。'],
  },
  visibility: {
    ref: 'Sections 5 / 5.1',
    title: '对外共享前检查内容',
    paragraphs: [
      '公开仓库、共享分支和 Issue / PR 都可能向外暴露内容。确认对象应包括将要发布的具体内容，而不只是操作名称。',
      '检查 staged diff 中的凭据、身份信息、客户标记和内部过程材料。已经外发的内容，不能假定通过删除就能完全收回。',
    ],
  },
  layout: {
    ref: 'Section 6',
    title: '目录与规则可以互相定位',
    paragraphs: [
      '目录树指向管理它的 Section；子目录对应子节，例如 tech/ 是 Section 8，tech/expert/ 是 Section 8.1。',
      '新增目录类型时登记目录，并追加新的 Section。既有编号保持不变，后续引用才不会错位。',
    ],
  },
  handoff: {
    ref: 'Section 7',
    title: '让接手者能继续工作',
    paragraphs: [
      'handoff 记录目标、版本、产物位置与下一步，不要求接手者继承完整聊天。',
      '保存位置、文件名和时区也写进规则。handoff skill 提供整理方法，本项目的落盘约定仍由 SOUL 规定。',
    ],
  },
  'technical-records': {
    ref: 'Section 8',
    title: '按文档用途判断命名',
    paragraphs: [
      '一次性技术记录加时间戳，长期维护的参考使用稳定名称。Agent 根据内容判断文档类型，不确定时采用带时间戳的默认值。',
      '分类依据明确之后，具体判断交给模型完成，无需列举每一种文件。',
    ],
  },
  expert: {
    ref: 'Section 8.1',
    title: '稳定入口，持续修订',
    paragraphs: [
      '经过核对的长期知识使用固定文件名，修订记录写在文档内的 Change Log。',
      '发现事实变化时说明差异，经确认再更新。稳定文件名不意味着内容永久不变。',
    ],
  },
  goals: {
    ref: 'Section 9',
    title: '记录本次执行的目标',
    paragraphs: ['goal 文件对应一次具体委托，包含范围、约束、验收条件和当前进度。工作完成后，长期知识与会话交接保存在各自的位置。'],
  },
  todos: {
    ref: 'Section 10',
    title: '待办跨越单次会话',
    paragraphs: ['TODO 随工作进度更新，持续记录还要做什么。handoff 保留交接时的状态，TODO 记录之后发生的进展，两者用途不同。'],
  },
  history: {
    ref: 'Section 13',
    title: '保留历史发生时的语境',
    paragraphs: ['目录改名或代码迁移后，旧交接与决策记录保持原样。项目层维护 old → new 映射，既能找到现位置，也能理解当时的判断。'],
  },
  'current-facts': {
    ref: 'Section 14',
    title: '当前事实需要单独维护',
    paragraphs: ['环境和基础设施等易变信息有一个当前参考入口。发现文档与现况不同，说明差异并请求更新，避免把历史快照当成实时状态。'],
  },
  sessions: {
    ref: 'Sections 16 / 16.1',
    title: '独立会话有各自的工作范围',
    paragraphs: ['这里的 parallel session 指人独立启动的工具会话，与工具内部的 subagent 区分。并行任务使用独立产物目录，避免与主任务的文件混在一起。'],
  },
  increments: {
    ref: 'Section 17',
    title: '工作跨增量，接口保持连续',
    paragraphs: [
      '只识别一个活跃目录的流程，可以在外部归档已完成增量，再启动下一增量。已经支持独立 specs / plans 的工具沿用原生机制。',
      '下一增量读取已合并代码，共同接口保留在项目层。',
    ],
  },
  changelog: {
    ref: 'SOUL.changelog.md',
    title: '修改记录指向具体规则',
    paragraphs: ['每次修改记录受影响的 Section、修改内容与原因。正文提供当前约定，changelog 保留演变过程，后续维护无需依赖当时的聊天。'],
  },
  'topology-change': {
    ref: '2026-06-20 / Section 2.1',
    title: '从文件类型改为实际归属',
    paragraphs: [
      '旧规则把过程文档放父仓、代码放子仓，但内部分析脚本也属于代码，按这个二分法容易放错位置。',
      '修订后先调查仓库结构与共享范围，再按用途决定归属。Section 2.1 的编号保留，标题与规则内容更新。',
    ],
  },
  'numbering-change': {
    ref: '2026-06-14 / 编号建立',
    title: '建立可持续引用的编号',
    paragraphs: ['这条历史记录发生在编号体系建立阶段，当时正文编号仍是 1–15。之后形成 1–17 的基线；已有外部引用后，不再重排编号。'],
  },
  'authority-change': {
    ref: '2026-06-14 / 规则维护',
    title: '谁能改规则，怎样加载规则',
    paragraphs: ['这次修改明确了人决定修订、AI 执笔，以及入口文件需保持稳定。修改者与修改内容同时留下记录。'],
  },
  'log-format': {
    ref: '2026-06-13 / Changelog 格式',
    title: '用列表容纳完整修改说明',
    paragraphs: ['时间和修改者放在标题，改动用列表记录。相较于表格，多行说明和代码符号更容易维护。'],
  },
  convention: {
    ref: 'SOUL.naming-convention.md',
    title: '维护 SOUL.md 时读取的结构规范',
    paragraphs: ['这份文件规定章节如何编号、插入、废弃和引用。执行任务读取 SOUL 正文；修改规则时，再查结构规范与修订历史。'],
  },
  'stable-reference': {
    ref: 'Naming / 1',
    title: '标题可以改，引用不应失效',
    paragraphs: ['技术文档、handoff 和 changelog 都会引用 SOUL。编号用于稳定定位，标题用于说明含义；改写标题不需要批量修改旧引用。'],
  },
  tiers: {
    ref: 'Naming / 2',
    title: 'Law 与 Section 分别编号',
    paragraphs: ['Law 约束 SOUL 自身的语言、优先关系与维护方式；Section 记录项目行为规则。工作目录可以映射到 Section，但提交授权等跨目录规则独立保留。'],
  },
  levels: {
    ref: 'Naming / 3',
    title: '编号最多三层',
    code: 'Section 2\n  2.1\n    2.1.1',
    paragraphs: ['每个编号都有标题。层级与 Markdown 标题级别对应，目录和引用使用同一结构。'],
  },
  citations: {
    ref: 'Naming / 4',
    title: '引用写全 Section',
    code: 'per Section 2.1 (Content Ownership)',
    paragraphs: ['编号定位规则，标题补充含义。统一使用完整的 Section，减少不同缩写带来的阅读歧义。'],
  },
  insertion: {
    ref: 'Naming / 5',
    title: '插入规则，不挤动旧编号',
    code: '2.1\n2.1(A)  ← 新增\n2.2     ← 编号不变',
    paragraphs: ['全新的顶层规则追加到末尾；逻辑上需要插入的条文使用字母后缀。已有文档对 Section 2.2 的引用仍指向同一条规则。'],
  },
  deprecation: {
    ref: 'Naming / 6',
    title: '废弃编号不再分配',
    paragraphs: ['条文停用后保留编号并标为 deprecated。旧引用仍能定位到这项历史规则，不会悄悄指向一条无关的新内容。'],
  },
}
