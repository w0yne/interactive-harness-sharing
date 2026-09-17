<script setup>
import { ArrowDown, ArrowUp, Database, FileText, TerminalSquare } from 'lucide-vue-next'
import { COORDINATION_COMPARISON } from '../data/collaboration'

defineProps({ view: { type: String, default: 'compare' } })
</script>

<template>
  <section class="coordination-comparison" aria-label="Message Bus 与 File Contract 对照">
    <template v-if="view === 'compare'">
    <p class="coordination-context">两种方式都保留独立的原生 CLI。tmux / cmux 承载终端会话，消息服务或文件契约组织协作。</p>
    <div class="mechanism-columns">
      <section class="mechanism bus">
        <header><h2>Message Bus</h2><span>tmux-mobile Team</span></header>
        <p class="mechanism-purpose">成员通过消息持续交流，服务维护寻址、等待和待回复关系。</p>
        <div class="mechanism-diagram" role="img" aria-label="tmux 中的独立 CLI 通过 MCP post 和 wait 连接 Team 消息服务，SQLite 保存消息、游标与待回复关系。">
          <div class="agent-row">
            <div v-for="name in ['Agent A', 'Agent B', 'Agent C']" :key="name" class="diagram-node">
              <TerminalSquare :size="17" aria-hidden="true" /><span>{{ name }}</span>
            </div>
          </div>
          <div class="diagram-link"><span><ArrowDown :size="16" aria-hidden="true" /> MCP post</span><span><ArrowUp :size="16" aria-hidden="true" /> MCP wait</span></div>
          <div class="diagram-hub">
            <strong>Team 消息服务</strong>
            <span>@name / @all · requires_reply</span>
          </div>
          <div class="diagram-link"><ArrowDown :size="16" aria-hidden="true" /><span>持久化 / 按游标读取</span><ArrowUp :size="16" aria-hidden="true" /></div>
          <div class="storage-node"><Database :size="21" aria-hidden="true" /><div><strong>SQLite</strong><span>消息 · 成员游标 · 待回复关系</span></div></div>
        </div>
        <p class="mechanism-support"><strong>运行支撑</strong>tmux panes · Heartbeat · Keepalive · Supervisor</p>
        <p class="mechanism-example"><strong>例如</strong>设计过程中持续交换发现，用消息引用共享文件，协调下一项工作。</p>
      </section>

      <section class="mechanism files">
        <header><h2>File Contract</h2><span>Dispatch + Orchestration</span></header>
        <p class="mechanism-purpose">任务与回执先写入文件，终端信号通知对方读取，按契约验收。</p>
        <div class="mechanism-diagram" role="img" aria-label="Coordinator 与 worker 通过共享 TASK、RESULT 和产物交接任务；cmux socket 双向通知对方读取文件，Coordinator collect 后验收。">
          <div class="agent-row"><div class="diagram-node coordinator"><TerminalSquare :size="17" aria-hidden="true" /><span>Coordinator</span><small>to / status / collect</small></div></div>
          <div class="diagram-link"><ArrowDown :size="16" aria-hidden="true" /><span>写 TASK / collect 回执与产物</span><ArrowUp :size="16" aria-hidden="true" /></div>
          <div class="diagram-hub contract-hub">
            <strong><FileText :size="20" aria-hidden="true" /> TASK.md / RESULT.md</strong>
            <span>目标 · 范围 · 验收 · 产物引用</span>
          </div>
          <div class="diagram-link"><ArrowDown :size="16" aria-hidden="true" /><span>读 TASK / 写 RESULT 与产物</span><ArrowUp :size="16" aria-hidden="true" /></div>
          <div class="agent-row">
            <div v-for="name in ['Worker A', 'Worker B', 'Worker C']" :key="name" class="diagram-node">
              <TerminalSquare :size="17" aria-hidden="true" /><span>{{ name }}</span>
            </div>
          </div>
        </div>
        <p class="mechanism-support"><strong>通知通道</strong>cmux socket · 双向通知“请读取文件”</p>
        <p class="mechanism-example"><strong>例如</strong>派发边界明确的独立任务，成员落盘后通知，整合者读取并验收。</p>
      </section>
    </div>
    </template>
    <template v-else>
    <table class="mechanism-table">
      <caption>运行与交接对照</caption>
      <colgroup><col class="axis-column"><col><col></colgroup>
      <thead><tr><th scope="col">维度</th><th scope="col">Message Bus</th><th scope="col">File Contract</th></tr></thead>
      <tbody>
        <tr v-for="row in COORDINATION_COMPARISON" :key="row.axis">
          <th scope="row">{{ row.axis }}</th><td>{{ row.bus }}</td><td>{{ row.files }}</td>
        </tr>
      </tbody>
    </table>
    <p class="coordination-verdict">持续的多方交流需要消息寻址与等待管理；边界明确的异步任务可以用文件交接，减少额外服务。两者都需要检查实际产物：收到回复或出现 RESULT，不等于验收通过。</p>
    </template>
  </section>
</template>

<style scoped>
.coordination-comparison { min-width: 0; }
.coordination-context { color: var(--ink-soft); font: 14px/1.8 var(--sans); margin-bottom: 20px; }
.mechanism-columns { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 48px; }
.mechanism { --mechanism-color: #a6dae6; min-width: 0; border-top: 2px solid var(--mechanism-color); padding-top: 12px; }
.mechanism.files { --mechanism-color: var(--matrix-2); }
.mechanism header { display: flex; justify-content: space-between; align-items: baseline; gap: 20px; }
.mechanism h2 { color: var(--mechanism-color); font: 600 22px/1.5 var(--mono); }
.mechanism header > span { color: var(--ink-soft); font: 12px/1.8 var(--mono); }
.mechanism-purpose { min-height: 50px; margin-top: 8px; color: var(--ink); font: 14px/1.8 var(--sans); }
.mechanism-diagram { display: grid; grid-template-rows: 52px 36px 76px 36px 52px; align-items: stretch; padding: 8px 12px; margin-block: 4px 14px; }
.agent-row { display: flex; align-items: stretch; justify-content: center; gap: 16px; min-width: 0; }
.diagram-node { display: flex; align-items: center; justify-content: center; gap: 10px; min-width: 0; flex: 1; max-width: 165px; padding: 10px; border: 1px solid var(--matrix-dim); border-radius: 4px; color: var(--ink); background: var(--bg-deep); font: 13px/1.6 var(--mono); }
.diagram-node svg { color: var(--mechanism-color); flex-shrink: 0; }
.diagram-node.coordinator { flex-wrap: wrap; max-width: 290px; gap: 2px 10px; padding-block: 5px; border-color: var(--accent); }
.coordinator small { flex-basis: 100%; text-align: center; color: var(--accent-soft); font: 11px/1.5 var(--mono); }
.diagram-link { display: flex; align-items: center; justify-content: center; gap: 15px; color: var(--ink-soft); font: 12px/1.6 var(--mono); }
.diagram-link > span { display: inline-flex; align-items: center; gap: 8px; }
.diagram-link svg { color: var(--mechanism-color); flex-shrink: 0; }
.diagram-hub { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 7px; border-block: 1px solid var(--mechanism-color); background: rgba(166,218,230,.04); }
.diagram-hub strong { display: inline-flex; align-items: center; gap: 9px; color: var(--mechanism-color); font: 550 18px/1.5 var(--mono); }
.diagram-hub > span { color: var(--ink-soft); font: 12px/1.6 var(--mono); }
.contract-hub { border-block-style: dashed; background: rgba(0,204,53,.04); }
.storage-node { display: flex; align-items: center; justify-content: center; gap: 14px; color: var(--mechanism-color); }
.storage-node > div { display: flex; flex-direction: column; gap: 3px; }
.storage-node strong { font: 550 14px/1.6 var(--mono); }
.storage-node span { color: var(--ink-soft); font: 12px/1.6 var(--sans); }
.mechanism-support, .mechanism-example { color: var(--ink-soft); font: 13px/1.85 var(--sans); }
.mechanism-support { min-height: 38px; border-top: 1px solid var(--matrix-dim); padding-top: 10px; }
.mechanism-support strong, .mechanism-example strong { color: var(--mechanism-color); font-weight: 500; margin-right: 14px; }
.mechanism-example { margin-top: 6px; }
.mechanism-table { width: 100%; table-layout: fixed; border-collapse: collapse; text-align: left; font: 14px/1.75 var(--sans); }
.mechanism-table caption { text-align: left; color: var(--ink); font: 600 18px/1.6 var(--sans); margin-bottom: 12px; }
.axis-column { width: 130px; }
.mechanism-table th, .mechanism-table td { vertical-align: top; padding: 10px 18px; border-bottom: 1px solid var(--matrix-dim); overflow-wrap: anywhere; }
.mechanism-table thead { font: 13px/1.8 var(--mono); }
.mechanism-table thead th:nth-child(2) { color: #a6dae6; }
.mechanism-table thead th:nth-child(3) { color: var(--matrix-2); }
.mechanism-table tbody th { color: var(--ink); font-weight: 500; }
.mechanism-table th:first-child { padding-left: 0; }
.mechanism-table td, .mechanism-table thead th:first-child { color: var(--ink-soft); }
.coordination-verdict { color: var(--ink); font: 15px/1.9 var(--sans); margin-top: 20px; max-width: 1150px; }
@media (max-height:950px) {
  .coordination-context { margin-bottom: 14px; }
  .mechanism-columns { gap: 36px; }
  .mechanism-purpose { min-height: 50px; }
  .mechanism-diagram { grid-template-rows: 48px 32px 68px 32px 48px; padding-inline: 0; margin-bottom: 10px; }
}
</style>
