<script setup>
import { computed } from 'vue'

/* 文件树的单个节点(自递归)。
 *  node = { name, kind:'dir'|'file', step?, hl?, note?, children?,
 *           repo:'private'|'shared', link:true(软链接), sub:true(子 git repo) }
 *  只渲染 step >= node.step 的节点(逐步"长出来")。纯展示假体(脱敏:名称已抽象)。 */
const props = defineProps({
  node: { type: Object, required: true },
  step: { type: Number, default: 99 },
  depth: { type: Number, default: 0 },
  zone: { type: String, default: '' },   // 继承的归属区:'private' | 'shared'(整支子树同色调)
  notes: { type: Boolean, default: true },
  interactive: { type: Boolean, default: false },
})
const emit = defineEmits(['select'])
const selectable = computed(() => props.interactive && props.node.selectable)
const visible = computed(() => props.step >= (props.node.step ?? -1))
const isDir = computed(() => props.node.kind === 'dir')
const kids = computed(() => props.node.collapsed ? [] : (props.node.children || []).filter((c) => props.step >= (c.step ?? -1)))
// 本节点所属区:自身声明的 repo 优先,否则继承父级 zone
const zone = computed(() => props.node.repo || props.zone)
</script>

<template>
  <div v-if="visible" class="ft-row-wrap">
    <component :is="selectable ? 'button' : 'div'" class="ft-row"
         :type="selectable ? 'button' : undefined" :aria-label="selectable ? node.name : undefined"
         :aria-pressed="selectable ? !!node.hl : undefined" :data-node-id="node.id"
         :class="[zone ? 'z-' + zone : '', node.band ? 'band band-' + node.band : '', { hl: node.hl, dim: node.dim, dir: isDir, child: depth > 0, fresh: node.step === step }]"
         @click="selectable && emit('select', node.id)"
         :style="{ paddingLeft: (depth * 26 + 8) + 'px', '--guide': ((depth - 1) * 26 + 16) + 'px' }">
      <span class="ft-ico" :class="{ link: node.link, sub: node.sub }">{{ node.link ? '↳' : node.sub ? '◉' : isDir ? (node.collapsed ? '▸' : node.children ? '▾' : '▸') : '·' }}</span>
      <span class="ft-name">{{ node.name }}</span>
      <span v-if="node.repo === 'private'" class="ft-tag priv">private</span>
      <span v-if="node.repo === 'shared'" class="ft-tag shared">shared</span>
      <span v-if="node.link" class="ft-tag link">symlink</span>
      <span v-if="node.sub" class="ft-tag sub">sub-repo</span>
      <span v-if="node.note && notes" class="ft-note">{{ node.note }}</span>
      <span v-if="node.bandLabel" class="band-label">{{ node.bandLabel }}</span>
    </component>
    <FileTreeNode v-for="(c, i) in kids" :key="c.name + i" :node="c" :step="step" :depth="depth + 1" :zone="zone" :notes="notes"
      :interactive="interactive" @select="emit('select', $event)" />
  </div>
</template>

<style>
/* 非 scoped:供 FileTree 容器内统一控制 */
.ft-row { position: relative; display: flex; align-items: center; gap: 7px; padding: 5px 8px; border-radius: 7px; white-space: nowrap; }
button.ft-row { width: 100%; border: 0; background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer; }
button.ft-row:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; }
/* 子节点:一条竖向引导线,让层级一眼可辨 */
.ft-row.child::before { content: ''; position: absolute; left: var(--guide, 16px); top: 0; bottom: 0; width: 1px; background: var(--matrix-dim); opacity: .6; }
.ft-row.dir .ft-name { color: var(--ink); font-weight: 650; }
.ft-row:not(.dir) .ft-name { color: var(--ink-soft); }
.ft-row .ft-ico { color: var(--matrix); opacity: .7; width: 1em; text-align: center; flex-shrink: 0; }
.ft-row.hl { background: rgba(217,119,87,.1); }
.ft-row.hl .ft-name { color: var(--accent); }
.ft-row.hl .ft-ico { color: var(--accent); opacity: 1; }
.ft-row.dim { opacity: .42; }
.ft-ico.link { color: var(--ink-soft); opacity: .85; }
.ft-ico.sub { color: #8fcfdd; opacity: .9; }
.ft-note { font-family: var(--sans); font-size: .8em; color: var(--ink-soft); opacity: .7; margin-left: 8px; white-space: normal; }
.ft-row.hl .ft-note { color: var(--accent); opacity: .9; }
/* 归属区:只用文件名字体颜色区分(不加背景/色条,保持干净)。
 * private = 暖中性(米/陶土),shared = 冷青(可外发的"正式"区);整支子树同色。 */
.ft-row.z-private .ft-name { color: #d9b89c; }
.ft-row.z-private.dir .ft-name { color: #e3c4a6; }
.ft-row.z-shared .ft-name { color: #8fcfdd; }
.ft-row.z-shared.dir .ft-name { color: #a6dae6; }
/* 高亮(聚焦)仍盖过区色 */
.ft-row.hl .ft-name, .ft-row.hl.dir .ft-name { color: var(--accent); }
/* 受众轴成组框选:连续紫色括框(top 起、mid 续、end 收)+ 组标签只在 end 行写一次 */
.ft-row.band { position: relative; background: rgba(168,130,255,.1); }
.ft-row.band .ft-name { color: #c4adff; }
.ft-row.band::after { content: ''; position: absolute; left: 2px; right: 2px; top: 0; bottom: 0; border: 1px solid #a882ff; border-top: none; border-bottom: none; pointer-events: none; }
.ft-row.band-top::after { border-top: 1px solid #a882ff; border-top-left-radius: 8px; border-top-right-radius: 8px; }
.ft-row.band-end::after { border-bottom: 1px solid #a882ff; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; }
.band-label { position: absolute; right: 12px; bottom: -10px; font-family: var(--sans); font-size: .78em; font-weight: 800; color: var(--bg); background: #a882ff; padding: 2px 10px; border-radius: 7px; white-space: nowrap; z-index: 2; }

/* repo / 链接 / 子 repo 标签(低调中性,不抢色)*/
.ft-tag { font-family: var(--sans); font-size: .66em; font-weight: 700; letter-spacing: .03em; padding: 1px 7px; border-radius: 5px; margin-left: 7px; flex-shrink: 0; }
.ft-tag.priv { color: #d9b89c; background: rgba(217,160,125,.1); border: 1px solid rgba(217,160,125,.28); }
.ft-tag.shared { color: #8fcfdd; background: rgba(120,190,210,.1); border: 1px solid rgba(120,190,210,.3); }
.ft-tag.link { color: var(--ink-soft); background: rgba(127,174,132,.08); border: 1px solid var(--matrix-dim); }
.ft-tag.sub { color: #8fcfdd; background: rgba(120,190,210,.08); border: 1px dashed rgba(120,190,210,.4); }
.ft-row.fresh { animation: ft-grow .45s ease; }
@keyframes ft-grow { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }
</style>
