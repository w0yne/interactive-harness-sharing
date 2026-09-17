<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Maximize, Minimize, Pause, Play, RotateCcw } from 'lucide-vue-next'
import { DAG_PHASES, TEAM_RUNTIME } from '../data/collaboration'

const frame = ref(null)
const viewer = ref(null)
const phase = ref(0)
const playing = ref(false)
const ready = ref(false)
const failed = ref(false)
const reloadKey = ref(0)
const fullscreenActive = ref(false)
const explanation = computed(() => DAG_PHASES[phase.value])
const media = window.matchMedia('(prefers-reduced-motion: reduce)')
const reduced = ref(media.matches)
const src = `${import.meta.env.BASE_URL}media/team-dag.html`
let loadTimer

function send(command, index) {
  frame.value?.contentWindow?.postMessage({ type: 'team-dag-control', command, phase: index }, location.origin)
}
function pause() { send('pause'); playing.value = false }
function selectPhase(event) { send('phase', Number(event.target.value)) }
function receive(event) {
  if (event.source !== frame.value?.contentWindow || event.origin !== location.origin ||
      event.data?.type !== 'team-dag-state' || !Number.isInteger(event.data.phase) ||
      event.data.phase < 0 || event.data.phase >= DAG_PHASES.length) return
  clearTimeout(loadTimer)
  ready.value = true
  failed.value = false
  phase.value = event.data.phase
  playing.value = event.data.playing === true
}
function loaded() {
  clearTimeout(loadTimer)
  loadTimer = setTimeout(() => { if (!ready.value) failed.value = true }, 8000)
  send('state')
}
function retry() {
  pause()
  clearTimeout(loadTimer)
  ready.value = false
  failed.value = false
  reloadKey.value += 1
}
function fullscreen() {
  if (document.fullscreenElement === viewer.value) document.exitFullscreen?.().catch(() => {})
  else viewer.value?.requestFullscreen?.().catch(() => {})
}
function fullscreenChanged() { fullscreenActive.value = document.fullscreenElement === viewer.value }
function escapeFullscreen(event) {
  if (document.fullscreenElement !== viewer.value) return
  event.preventDefault()
  event.stopPropagation()
  document.exitFullscreen?.().catch(() => {})
}
function motionChanged() {
  reduced.value = media.matches
  pause()
}
onMounted(() => {
  window.addEventListener('message', receive)
  document.addEventListener('fullscreenchange', fullscreenChanged)
  media.addEventListener('change', motionChanged)
})
onBeforeUnmount(() => {
  pause()
  clearTimeout(loadTimer)
  window.removeEventListener('message', receive)
  document.removeEventListener('fullscreenchange', fullscreenChanged)
  media.removeEventListener('change', motionChanged)
})
defineExpose({ pause })
</script>

<template>
  <section class="team-analysis">
    <div ref="viewer" class="dag-viewer" @keydown.esc="escapeFullscreen">
      <div class="dag-toolbar">
        <button type="button" :disabled="!ready || reduced" :aria-label="playing ? '暂停 DAG' : '播放 DAG'"
          :title="playing ? '暂停 DAG' : '播放 DAG'" @click="send(playing ? 'pause' : 'play')">
          <Pause v-if="playing" :size="18" aria-hidden="true" /><Play v-else :size="18" aria-hidden="true" />
        </button>
        <button type="button" :disabled="!ready" title="DAG 回到开头" aria-label="DAG 回到开头" @click="send('reset')"><RotateCcw :size="17" aria-hidden="true" /></button>
        <select aria-label="DAG 阶段" :value="phase" :disabled="!ready" @change="selectPhase">
          <option v-for="(item, index) in DAG_PHASES" :key="item.label" :value="index">{{ item.label }}</option>
        </select>
        <span class="dag-origin">原协作图 · Research → Design → Build → Validate</span>
        <button type="button" class="expand" :title="fullscreenActive ? '退出全屏 DAG' : '全屏 DAG'"
          :aria-label="fullscreenActive ? '退出全屏 DAG' : '全屏 DAG'" @click="fullscreen">
          <Minimize v-if="fullscreenActive" :size="18" aria-hidden="true" /><Maximize v-else :size="18" aria-hidden="true" />
        </button>
      </div>
      <div class="dag-frame">
        <iframe :key="reloadKey" ref="frame" :src="src" title="SAS→R 团队协作 DAG" tabindex="-1" @load="loaded"></iframe>
        <div v-if="failed" class="dag-error" role="alert"><p>DAG 加载失败</p><button type="button" @click="retry">重新加载</button></div>
      </div>
    </div>
    <aside class="analysis-notes">
    <div class="phase-explanation" aria-live="polite"><h2>{{ explanation.label }}</h2><p>{{ explanation.explanation }}</p></div>
    <div class="runtime-support">
      <section v-for="item in TEAM_RUNTIME" :key="item.name"><h3>{{ item.name }}</h3><p>{{ item.detail }}</p></section>
    </div>
    <p class="dag-boundary">DAG 表达任务依赖；tmux-mobile 提供会话与通信，并不自动决定这张图中的任务拆分。</p>
    </aside>
  </section>
</template>

<style scoped>
.team-analysis { display: grid; grid-template-columns: minmax(0,1fr) 260px; gap: 20px; height: 100%; min-height: 0; min-width: 0; }
.dag-viewer { display: flex; flex-direction: column; min-width: 0; min-height: 0; height: 100%; container-type: size; }
.dag-toolbar { display: flex; align-items: center; gap: 10px; height: 46px; padding-bottom: 12px; flex-shrink: 0; }
.dag-toolbar button { display: inline-flex; justify-content: center; align-items: center; width: 34px; height: 34px; flex-shrink: 0; background: none; border: 1px solid var(--matrix-dim); border-radius: 4px; color: var(--accent-soft); cursor: pointer; }
.dag-toolbar button:disabled { opacity: .35; cursor: default; }
select { color-scheme: dark; color: var(--ink); background: var(--bg-deep); border: 1px solid var(--matrix-dim); padding: 7px 10px; border-radius: 4px; font: 13px/1.5 var(--sans); min-width: 190px; }
.dag-origin { color: var(--ink-soft); font: 11px/1.6 var(--mono); margin-left: 8px; }
.dag-toolbar .expand { margin-left: auto; }
.dag-frame { position: relative; width: min(100cqw, calc((100cqh - 46px) * 16 / 9)); aspect-ratio: 16 / 9; background: #0c0d11; flex-shrink: 0; align-self: center; margin-block: auto; }
iframe { display: block; border: 0; width: 100%; height: 100%; pointer-events: none; }
.dag-error { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; gap: 24px; color: var(--ink); background: var(--bg-deep); }
.dag-error button { padding: 8px 14px; background: none; border: 1px solid var(--accent); color: var(--accent-soft); cursor: pointer; }
.analysis-notes { display: flex; flex-direction: column; gap: 22px; justify-content: center; min-width: 0; }
.phase-explanation h2 { margin-bottom: 10px; }
.phase-explanation h2 { color: var(--accent-soft); font: 600 17px/1.7 var(--sans); }
.phase-explanation p { color: var(--ink); font: 15px/1.85 var(--sans); }
.runtime-support { display: flex; flex-direction: column; gap: 16px; }
.runtime-support section { border-top: 1px solid var(--matrix-dim); padding-top: 12px; }
.runtime-support h3 { color: #a6dae6; font: 550 14px/1.6 var(--sans); margin-bottom: 7px; }
.runtime-support p, .dag-boundary { color: var(--ink-soft); font: 13px/1.8 var(--sans); }
.dag-viewer:fullscreen { width: 100%; height: 100%; background: #0c0d11; padding: 16px; }
button:focus-visible, select:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
</style>
