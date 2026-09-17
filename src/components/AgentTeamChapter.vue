<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, onUnmounted, ref } from 'vue'
import { gsap } from 'gsap'
import { decodeText } from '../composables/useDecode'
import { COLLABORATION_VIEWS } from '../data/collaboration'
import TeamDemo from './TeamDemo.vue'
import TeamAnalysis from './TeamAnalysis.vue'
import OrchestrationWorkspace from './OrchestrationWorkspace.vue'

const emit = defineEmits(['tail'])
const root = ref(null)
const title = ref(null)
const body = ref(null)
const active = ref(null)
const viewId = ref('demo')
const dispatchReady = ref(false)
const view = computed(() => COLLABORATION_VIEWS.find(item => item.id === viewId.value))
const components = { demo: TeamDemo, analysis: TeamAnalysis, dispatch: OrchestrationWorkspace }
const titleText = '多 Agent 协作与编排'
const media = window.matchMedia('(prefers-reduced-motion: reduce)')
let motion
let headingMotion
let revision = 0
let disposed = false

async function changeView(id, focusTab = false) {
  if (id === viewId.value || !components[id]) return
  active.value?.pause?.()
  const token = ++revision
  motion?.revert()
  dispatchReady.value = false
  viewId.value = id
  await nextTick()
  if (disposed || token !== revision) return
  body.value.scrollTop = 0
  if (focusTab) root.value.querySelector(`#collab-tab-${id}`)?.focus({ preventScroll: true })
  if (media.matches) return
  motion = gsap.context(() => {
    gsap.fromTo('.view-content', { autoAlpha: .5, y: 8 }, {
      autoAlpha: 1, y: 0, duration: .3, ease: 'power2.out', clearProps: 'opacity,visibility,transform',
    })
  }, body.value)
}
function onTabKey(event, index) {
  let target
  if (event.key === 'ArrowRight') target = (index + 1) % COLLABORATION_VIEWS.length
  else if (event.key === 'ArrowLeft') target = (index + COLLABORATION_VIEWS.length - 1) % COLLABORATION_VIEWS.length
  else if (event.key === 'Home') target = 0
  else if (event.key === 'End') target = COLLABORATION_VIEWS.length - 1
  else return
  event.preventDefault()
  event.stopPropagation()
  changeView(COLLABORATION_VIEWS[target].id, true)
}
function motionChanged() {
  if (!media.matches) return
  revision += 1
  motion?.revert()
  headingMotion?.kill()
  if (title.value) title.value.textContent = titleText
}
onMounted(() => {
  media.addEventListener('change', motionChanged)
  if (media.matches) return
  title.value.textContent = ''
  headingMotion = decodeText(title.value, titleText, { duration: .85, delay: .28 })
})
onBeforeUnmount(() => active.value?.pause?.())
onUnmounted(() => {
  disposed = true
  revision += 1
  motion?.revert()
  headingMotion?.kill()
  media.removeEventListener('change', motionChanged)
})
</script>

<template>
  <section ref="root" class="agent-team-chapter" aria-labelledby="collaboration-heading">
    <header class="collaboration-heading">
      <p class="eyebrow">04 / 多 Agent</p>
      <div class="heading-row">
        <h1 id="collaboration-heading" ref="title" :aria-label="titleText">{{ titleText }}</h1>
        <nav role="tablist" aria-label="团队协作视角">
          <button v-for="(item, index) in COLLABORATION_VIEWS" :key="item.id" :id="`collab-tab-${item.id}`"
            type="button" role="tab" :aria-selected="viewId === item.id" aria-controls="collab-panel"
            :tabindex="viewId === item.id ? 0 : -1" @click="changeView(item.id)"
            @keydown="onTabKey($event, index)">{{ item.label }}</button>
        </nav>
      </div>
      <p class="view-description">{{ view.description }}</p>
    </header>
    <div id="collab-panel" ref="body" class="collaboration-body" role="tabpanel" :aria-labelledby="`collab-tab-${viewId}`" tabindex="0">
      <div class="view-content"><component :is="components[viewId]" :key="viewId" ref="active" @tail-ready="dispatchReady = $event" /></div>
    </div>
    <footer v-if="viewId === 'dispatch' && dispatchReady" class="collaboration-footer">
      <span>协调机制取决于交互频率、交接方式与运行成本。</span>
      <button type="button" @click="emit('tail')">尾幕 <span aria-hidden="true">→</span></button>
    </footer>
  </section>
</template>

<style scoped>
.agent-team-chapter { position: absolute; inset: 0; display: flex; flex-direction: column; padding: 76px 4.5vw 24px; letter-spacing: 0; }
.collaboration-heading, .collaboration-body, .collaboration-footer { width: 100%; max-width: 1720px; margin-inline: auto; }
.collaboration-heading { flex-shrink: 0; }
.eyebrow { color: var(--accent); font: 12px/1.6 var(--mono); margin-bottom: 7px; }
.heading-row { display: flex; justify-content: space-between; align-items: center; gap: 24px; }
h1 { font: 650 34px/1.4 var(--sans); color: var(--ink); min-height: 48px; }
nav { display: flex; flex-shrink: 0; border-bottom: 1px solid var(--matrix-dim); }
nav button { padding: 10px 14px; border: 0; border-bottom: 2px solid transparent; background: none; color: var(--ink-soft); font: 14px/1.6 var(--sans); cursor: pointer; }
nav button[aria-selected="true"] { color: var(--accent-soft); border-bottom-color: var(--accent); }
.view-description { color: var(--ink-soft); font: 15px/1.8 var(--sans); margin: 12px 0 20px; }
.collaboration-body { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; scrollbar-gutter: stable; }
.view-content { height: 100%; min-height: 0; }
.collaboration-footer { display: flex; align-items: center; justify-content: space-between; gap: 28px; flex-shrink: 0; margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--matrix-dim); }
.collaboration-footer > span { color: var(--ink-soft); font: 12px/1.8 var(--sans); }
.collaboration-footer button { display: inline-flex; align-items: center; gap: 16px; padding: 7px 0; border: 0; border-bottom: 1px solid var(--accent); background: none; color: var(--accent-soft); font: 15px/1.6 var(--sans); cursor: pointer; }
.collaboration-footer button span { font-size: 22px; }
button:focus-visible, [role="tabpanel"]:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
@media (max-height:950px) {
  .agent-team-chapter { padding-top: 66px; padding-bottom: 20px; }
  h1 { font-size: 30px; min-height: 42px; }
  .view-description { margin-block: 10px 16px; }
}
</style>
