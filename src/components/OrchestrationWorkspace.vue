<script setup>
import { nextTick, ref, watch } from 'vue'
import CoordinationComparison from './CoordinationComparison.vue'
import DispatchFlow from './DispatchFlow.vue'

const emit = defineEmits(['tail-ready'])
const root = ref(null)
const flow = ref(null)
const mode = ref('compare')
const modes = [
  { id: 'compare', label: '机制对照' },
  { id: 'tradeoffs', label: '运行取舍' },
  { id: 'flow', label: '派发过程' },
]
let revision = 0

async function changeMode(id, focus = false) {
  if (id === mode.value || !modes.some(item => item.id === id)) return
  const token = ++revision
  flow.value?.pause()
  mode.value = id
  await nextTick()
  if (token !== revision || !root.value) return
  if (focus) root.value.querySelector(`#dispatch-mode-${id}`)?.focus({ preventScroll: true })
}
function modeKey(event, index) {
  let next
  if (event.key === 'ArrowRight') next = (index + 1) % modes.length
  else if (event.key === 'ArrowLeft') next = (index + modes.length - 1) % modes.length
  else if (event.key === 'Home') next = 0
  else if (event.key === 'End') next = modes.length - 1
  else return
  event.preventDefault()
  event.stopPropagation()
  changeMode(modes[next].id, true)
}
watch(mode, id => emit('tail-ready', id === 'flow'), { immediate: true })
defineExpose({ pause: () => flow.value?.pause() })
</script>

<template>
  <section ref="root" class="orchestration-workspace">
    <nav class="dispatch-modes" role="tablist" aria-label="Dispatch 内容">
      <button v-for="(item, index) in modes" :id="`dispatch-mode-${item.id}`" :key="item.id" type="button" role="tab"
        :aria-selected="mode === item.id" :tabindex="mode === item.id ? 0 : -1" aria-controls="dispatch-content"
        @click="changeMode(item.id)" @keydown="modeKey($event, index)">{{ item.label }}</button>
    </nav>
    <div id="dispatch-content" role="tabpanel" :aria-labelledby="`dispatch-mode-${mode}`">
      <DispatchFlow v-if="mode === 'flow'" ref="flow" />
      <CoordinationComparison v-else :view="mode" />
    </div>
  </section>
</template>

<style scoped>
.orchestration-workspace { display: flex; flex-direction: column; height: 100%; min-width: 0; min-height: 0; }
.dispatch-modes { display: flex; gap: 22px; margin-bottom: 16px; border-bottom: 1px solid var(--matrix-dim); flex-shrink: 0; }
.dispatch-modes button { padding: 4px 0 10px; border: 0; border-bottom: 2px solid transparent; color: var(--ink-soft); background: none; font: 14px/1.8 var(--sans); cursor: pointer; }
.dispatch-modes button[aria-selected="true"] { color: var(--accent-soft); border-bottom-color: var(--accent); }
#dispatch-content { flex: 1; min-height: 0; min-width: 0; }
button:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; }
</style>
