<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { gsap } from 'gsap'
import { ArrowLeft, ArrowRight, FileText, Pause, Play, RotateCcw, TerminalSquare } from 'lucide-vue-next'
import Terminal from './Terminal.vue'
import { COLLABORATION_ROSTER } from '../data/collaboration'
import { DISPATCH_EDGES, DISPATCH_STAGES } from '../data/dispatch-flow'

const root = ref(null)
const diagram = ref(null)
const phase = ref(0)
const accepted = computed(() => phase.value === 5)
const stage = computed(() => DISPATCH_STAGES[phase.value])
const bounds = ref({})
const size = ref({ width: 620, height: 400 })
const nodes = new Map()
const media = window.matchMedia('(prefers-reduced-motion: reduce)')
const reduced = ref(media.matches)
const paused = ref(false)
const sessions = computed(() => [
  { id: 'headmaster', lines: stage.value.coordinator, status: stage.value.coordinatorStatus },
  { id: 'handyman', lines: stage.value.worker, status: stage.value.workerStatus },
].map(item => ({ ...item, profile: COLLABORATION_ROSTER.find(member => member.name === item.id) })))
const graphNodes = computed(() => [
  { id: 'headmaster', label: 'headmaster', sub: '派发 / 验收', x: 24, y: 13, actor: true },
  { id: 'handyman', label: 'handyman', sub: '接口索引任务', x: 76, y: 13, actor: true },
  { id: 'task', label: 'TASK.md', sub: '目标 · 范围 · 验收', x: 24, y: 53, available: true },
  { id: 'result', label: 'RESULT.md', sub: phase.value < 3 ? '尚未写入' : accepted.value ? '回执已核对' : 'done · 待验收', x: 76, y: 53, available: phase.value >= 3 },
  { id: 'artifact', label: 'api-index.md', sub: phase.value < 3 ? '尚未生成' : accepted.value ? '产物已验收' : '接口索引', x: 76, y: 86, available: phase.value >= 3 },
])
const edges = computed(() => stage.value.edges.map(id => DISPATCH_EDGES.find(edge => edge.id === id)))
let motion
let playback
let observer
let frame = 0
let revision = 0
let disposed = false

function setNode(id, element) {
  if (element) nodes.set(id, element)
  else nodes.delete(id)
}
function port(box, side) {
  if (side === 'left') return { x: box.x - box.width / 2 - 5, y: box.y }
  if (side === 'right') return { x: box.x + box.width / 2 + 5, y: box.y }
  return { x: box.x, y: box.y + (side === 'top' ? -1 : 1) * (box.height / 2 + 5) }
}
function pathFor(edge) {
  const from = bounds.value[edge.from]
  const to = bounds.value[edge.to]
  if (!from || !to) return ''
  const a = port(from, edge.start)
  const b = port(to, edge.end)
  if (edge.signal) return `M${a.x},${a.y} L${b.x},${b.y}`
  if (edge.outside) {
    if (edge.start === 'left') {
      const x = 12, radius = 18
      return `M${a.x},${a.y} L${x + radius},${a.y} Q${x},${a.y} ${x},${a.y - radius} L${x},${b.y + radius} Q${x},${b.y} ${x + radius},${b.y} L${b.x},${b.y}`
    }
    const x = size.value.width - 10
    return `M${a.x},${a.y} C${x},${a.y} ${x},${b.y} ${b.x},${b.y}`
  }
  const mid = (a.y + b.y) / 2
  return `M${a.x},${a.y} C${a.x},${mid} ${b.x},${mid} ${b.x},${b.y}`
}
function clearMotion() { motion?.revert(); motion = null; playback = null }
function pause() {
  paused.value = true
  revision += 1
  playback?.pause()
}
function togglePlayback() {
  if (!paused.value) { pause(); return }
  paused.value = false
  if (playback) playback.resume()
  else animate()
}

async function animate() {
  const token = ++revision
  clearMotion()
  await nextTick()
  if (disposed || token !== revision || !root.value) return
  if (media.matches || paused.value) return
  motion = gsap.context(() => {
    const timeline = gsap.timeline({ defaults: { ease: 'power2.out' } })
    playback = timeline
    timeline.fromTo('.dispatch-session.active .terminal', { autoAlpha: .6 }, { autoAlpha: 1, duration: .35, clearProps: 'opacity,visibility' }, 0)
    timeline.fromTo('.dispatch-session.active .ln', { autoAlpha: 0, y: 5 }, { autoAlpha: 1, y: 0, duration: .25, stagger: .08, clearProps: 'opacity,visibility,transform' }, 0)
    if (phase.value === 3) {
      const produced = ['artifact', 'result'].map(id => root.value.querySelector(`[data-node="${id}"]`))
      timeline.fromTo(produced, { autoAlpha: .15 }, { autoAlpha: 1, duration: .35, stagger: .3, clearProps: 'opacity,visibility' }, 0)
    }
    root.value.querySelectorAll('.dispatch-path').forEach((path, index) => {
      if (!path.getAttribute('d')) return
      const length = path.getTotalLength()
      if (!path.classList.contains('signal')) timeline.fromTo(path, { strokeDasharray: length, strokeDashoffset: length }, { strokeDashoffset: 0, duration: .55 }, index * .3)
      const dot = root.value.querySelector(`[data-dot="${path.dataset.edge}"]`)
      const cursor = { progress: 0 }
      const start = path.getPointAtLength(0)
      gsap.set(dot, { attr: { cx: start.x, cy: start.y }, autoAlpha: 0 })
      timeline.to(dot, { autoAlpha: 1, duration: .15 }, .25 + index * .3)
      // Motion follows the measured path, including reverse-direction notifications.
      timeline.to(cursor, {
        progress: 1, duration: 1.6, repeat: -1, ease: 'none',
        onUpdate: () => {
          const point = path.getPointAtLength(cursor.progress * length)
          dot.setAttribute('cx', point.x)
          dot.setAttribute('cy', point.y)
        },
      }, .25 + index * .3)
    })
  }, root.value)
}
function measure() {
  cancelAnimationFrame(frame)
  frame = requestAnimationFrame(() => {
    if (disposed || !diagram.value) return
    // offset geometry excludes the parent chapter's GSAP entrance transform.
    size.value = { width: diagram.value.clientWidth, height: diagram.value.clientHeight }
    bounds.value = Object.fromEntries([...nodes].map(([id, element]) => [
      id, { x: element.offsetLeft, y: element.offsetTop, width: element.offsetWidth, height: element.offsetHeight },
    ]))
    animate()
  })
}
function selectPhase(index) {
  if (!Number.isInteger(index) || index < 0 || index >= DISPATCH_STAGES.length) return
  phase.value = index
  animate()
}
function motionChanged() { reduced.value = media.matches; animate() }
onMounted(() => {
  observer = new ResizeObserver(measure)
  observer.observe(diagram.value)
  nodes.forEach(element => observer.observe(element))
  media.addEventListener('change', motionChanged)
  document.fonts?.ready.then(() => { if (!disposed) measure() })
  measure()
})
onBeforeUnmount(() => {
  disposed = true
  revision += 1
  cancelAnimationFrame(frame)
  observer?.disconnect()
  media.removeEventListener('change', motionChanged)
  clearMotion()
})
defineExpose({ pause })
</script>

<template>
  <section ref="root" class="dispatch-flow" aria-labelledby="dispatch-flow-heading">
    <header class="dispatch-flow-heading">
      <div><h2 id="dispatch-flow-heading">从任务契约到产物验收</h2><span>接口索引任务 · 流程示意</span></div>
      <div class="dispatch-controls" role="group" aria-label="派发过程控制">
        <button type="button" :aria-label="paused || reduced ? '播放派发动画' : '暂停派发动画'" :title="paused || reduced ? '播放动画' : '暂停动画'" :disabled="reduced" @click="togglePlayback">
          <Play v-if="paused || reduced" :size="17" aria-hidden="true" /><Pause v-else :size="17" aria-hidden="true" />
        </button>
        <button type="button" aria-label="派发过程回到开头" title="回到开头" @click="selectPhase(0)"><RotateCcw :size="17" aria-hidden="true" /></button>
        <button type="button" aria-label="上一个派发阶段" title="上一个阶段" :disabled="phase === 0" @click="selectPhase(phase - 1)"><ArrowLeft :size="18" aria-hidden="true" /></button>
        <select aria-label="派发阶段" :value="phase" @change="selectPhase(Number($event.target.value))">
          <option v-for="(item, index) in DISPATCH_STAGES" :key="item.id" :value="index">{{ item.label }}</option>
        </select>
        <button type="button" aria-label="下一个派发阶段" title="下一个阶段" :disabled="phase === DISPATCH_STAGES.length - 1" @click="selectPhase(phase + 1)"><ArrowRight :size="18" aria-hidden="true" /></button>
      </div>
    </header>
    <p class="dispatch-stage-description" aria-live="polite">{{ stage.description }}</p>
    <div class="dispatch-layout">
      <div class="dispatch-sessions">
        <section v-for="session in sessions" :key="session.id" class="dispatch-session" :class="{ active: stage.active === session.id }">
          <Terminal :title="`${session.id} · Kiro CLI`" :lines="session.lines" :play="false" />
          <p class="session-profile"><span>{{ session.profile.model }} · {{ session.profile.effort === '—' ? '按任务配置' : session.profile.effort }}</span><span class="session-status">{{ session.status }}</span></p>
        </section>
      </div>
      <div ref="diagram" class="dispatch-diagram" role="group" aria-label="派发过程中当前文件与通知路径">
        <svg :viewBox="`0 0 ${size.width} ${size.height}`" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <marker id="dispatch-file-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="#00cc35" /></marker>
            <marker id="dispatch-signal-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="#e8a07d" /></marker>
          </defs>
          <g v-for="edge in edges" :key="edge.id">
            <path class="dispatch-path" :class="{ signal: edge.signal }" :data-edge="edge.id" :d="pathFor(edge)" :marker-end="`url(#dispatch-${edge.signal ? 'signal' : 'file'}-arrow)`" />
            <circle class="dispatch-dot" :class="{ signal: edge.signal }" :data-dot="edge.id" cx="0" cy="0" r="4" />
          </g>
        </svg>
        <template v-for="node in graphNodes" :key="node.id">
          <div v-if="node.actor" :ref="element => setNode(node.id, element)" class="dispatch-node actor" :class="{ active: stage.active === node.id }" :style="{ left: `${node.x}%`, top: `${node.y}%` }">
            <TerminalSquare :size="18" aria-hidden="true" /><strong>{{ node.label }}</strong><span>{{ node.sub }}</span>
          </div>
          <div v-else :ref="element => setNode(node.id, element)" class="dispatch-node file" :data-node="node.id" :class="{ pending: !node.available, produced: node.id !== 'task' && node.available, accepted }"
            :style="{ left: `${node.x}%`, top: `${node.y}%` }">
            <FileText :size="18" aria-hidden="true" /><strong>{{ node.label }}</strong><span>{{ node.sub }}</span>
          </div>
        </template>
        <p class="signal-label" :class="{ active: phase === 1 || phase === 4 }">cmux socket · 仅通知文件地址</p>
      </div>
    </div>
    <div class="dispatch-flow-foot">
      <div class="dispatch-legend"><span><i></i>文件读写</span><span><i class="signal"></i>终端通知</span></div>
      <span>{{ accepted ? 'spec Task 2 · 验收后更新' : 'spec Task 2 · 未验收' }}</span>
    </div>
  </section>
</template>

<style scoped>
.dispatch-flow { display: flex; flex-direction: column; height: 100%; min-width: 0; min-height: 0; }
.dispatch-flow-heading { display: flex; justify-content: space-between; align-items: center; gap: 24px; flex-shrink: 0; }
.dispatch-flow-heading h2 { color: var(--ink); font: 600 22px/1.5 var(--sans); }
.dispatch-flow-heading > div:first-child { display: flex; align-items: baseline; gap: 18px; }
.dispatch-flow-heading span { color: var(--ink-soft); font: 12px/1.8 var(--sans); }
.dispatch-controls { display: flex; align-items: center; gap: 9px; }
.dispatch-controls button { display: inline-flex; width: 34px; height: 34px; align-items: center; justify-content: center; border: 1px solid var(--matrix-dim); border-radius: 4px; color: var(--accent-soft); background: none; cursor: pointer; flex-shrink: 0; }
.dispatch-controls button:disabled { opacity: .3; cursor: default; }
.dispatch-controls select { width: 168px; padding: 7px 9px; color-scheme: dark; color: var(--ink); background: var(--bg-deep); border: 1px solid var(--matrix-dim); border-radius: 4px; font: 13px/1.5 var(--sans); }
.dispatch-stage-description { color: var(--ink-soft); font: 15px/1.85 var(--sans); min-height: 56px; margin-block: 10px; flex-shrink: 0; }
.dispatch-layout { display: grid; grid-template-columns: minmax(0,.9fr) minmax(0,1.1fr); gap: 38px; align-items: stretch; flex: 1; min-height: 0; }
.dispatch-sessions { display: flex; flex-direction: column; gap: 20px; min-width: 0; min-height: 0; }
.dispatch-session { display: flex; flex-direction: column; flex: 1; min-height: 0; min-width: 0; opacity: .6; }
.dispatch-session.active { opacity: 1; }
.dispatch-session :deep(.terminal) { display: flex; flex-direction: column; flex: 1; min-height: 0; border-radius: 6px; box-shadow: none; }
.dispatch-session.active :deep(.terminal) { border-color: var(--accent); }
.dispatch-session :deep(.terminal-body) { flex: 1; min-height: 0; max-height: none; padding: 12px 16px; font: 13px/1.75 var(--mono); }
.dispatch-session :deep(.terminal-bar) { padding-block: 7px; flex-shrink: 0; }
.session-profile { display: flex; justify-content: space-between; gap: 20px; margin-top: 6px; color: var(--ink-soft); font: 11px/1.7 var(--mono); flex-shrink: 0; }
.session-status { color: var(--accent-soft); }
.dispatch-diagram { position: relative; min-width: 0; min-height: 0; }
.dispatch-diagram > svg { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
.dispatch-path { fill: none; stroke: var(--matrix-2); stroke-width: 1.7; }
.dispatch-path.signal { stroke: var(--accent-soft); stroke-dasharray: 5 6; }
.dispatch-dot { fill: var(--matrix); opacity: 0; visibility: hidden; }
.dispatch-dot.signal { fill: var(--accent-soft); }
.dispatch-node { position: absolute; transform: translate(-50%,-50%); display: grid; grid-template-columns: 18px minmax(0,1fr); align-items: center; gap: 4px 10px; width: 190px; min-height: 70px; padding: 12px; border: 1px solid var(--matrix-dim); border-radius: 6px; background: var(--bg-deep); color: var(--ink); text-align: left; }
.dispatch-node strong { font: 550 14px/1.6 var(--mono); }
.dispatch-node span { grid-column: 1 / -1; color: var(--ink-soft); font: 12px/1.7 var(--sans); }
.dispatch-node.actor svg { color: var(--accent-soft); }
.dispatch-node.actor.active { border-color: var(--accent); }
.dispatch-node.file { border-color: var(--matrix-2); }
.dispatch-node.file svg { color: var(--matrix-2); }
.dispatch-node.pending { opacity: .35; border-style: dashed; border-color: var(--matrix-dim); cursor: default; }
.dispatch-node.accepted span { color: var(--matrix-2); }
.signal-label { position: absolute; top: 27%; left: 50%; transform: translateX(-50%); width: max-content; max-width: 100%; color: var(--ink-soft); font: 11px/1.8 var(--mono); opacity: .5; }
.signal-label.active { color: var(--accent-soft); opacity: 1; }
.dispatch-legend { display: flex; gap: 24px; color: var(--ink-soft); font: 12px/1.6 var(--sans); }
.dispatch-legend span { display: flex; align-items: center; gap: 10px; }
.dispatch-legend i { width: 28px; border-top: 2px solid var(--matrix-2); }
.dispatch-legend i.signal { border-color: var(--accent-soft); border-top-style: dashed; }
.dispatch-flow-foot { display: flex; justify-content: space-between; align-items: center; gap: 24px; border-top: 1px solid var(--matrix-dim); padding-top: 12px; margin-top: 14px; flex-shrink: 0; }
.dispatch-flow-foot > span { color: var(--ink-soft); font: 12px/1.8 var(--mono); }
button:focus-visible, select:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
@media (max-height:950px) {
  .dispatch-sessions { gap: 15px; }
}
</style>
