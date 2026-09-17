<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { ArrowRight } from 'lucide-vue-next'
import { gsap } from 'gsap'
import Rain from './components/Rain.vue'
import SoulDocument from './components/SoulDocument.vue'
import WorkspaceContext from './components/WorkspaceContext.vue'
import HumanParticipation from './components/HumanParticipation.vue'
import AgentTeamChapter from './components/AgentTeamChapter.vue'
import ClosingScene from './components/ClosingScene.vue'
import { TOPICS, NAV_ORDER, TITLE } from './data/topics'

const CHAPTERS = { p1: SoulDocument, p2: WorkspaceContext, p3: HumanParticipation, p4: AgentTeamChapter }
const view = ref('title')
const openId = ref(null)
const roomVisible = ref(false)
const busy = ref(false)
const panelsRef = ref(null)
const roomRef = ref(null)
const isOpen = computed(() => view.value === 'open')
const index = computed(() => NAV_ORDER.indexOf(openId.value))
const media = window.matchMedia('(prefers-reduced-motion: reduce)')
let stageMotion
let accentMotion
let version = 0
let disposed = false

function panels() { return panelsRef.value?.querySelectorAll('.panel') || [] }
function inners() { return panelsRef.value?.querySelectorAll('.panel-inner') || [] }
function accent(value) {
  accentMotion?.kill()
  accentMotion = gsap.to(':root', { '--accent-presence': value, duration: media.matches ? 0 : .7, ease: 'power2.out' })
}
function beginMotion() {
  stageMotion?.kill()
  busy.value = true
  return ++version
}
function current(token) { return !disposed && token === version }
function finish(token) { if (current(token)) busy.value = false }

async function enterOverview() {
  if (busy.value) return
  const token = beginMotion()
  roomVisible.value = false
  openId.value = null
  view.value = 'overview'
  accent(.4)
  await nextTick()
  if (!current(token)) return
  if (media.matches) {
    gsap.set(panels(), { yPercent: 0, rotateX: 0 })
    gsap.set(inners(), { autoAlpha: 1, y: 0 })
    finish(token)
    return
  }
  // The panel count changes; the original curtain timing stays intact.
  stageMotion = gsap.timeline({ onComplete: () => finish(token) })
    .fromTo(panels(), { yPercent: -100, rotateX: 26, transformOrigin: '50% 0%' }, {
      yPercent: 0, rotateX: 0, duration: .85, ease: 'power3.out',
      stagger: { each: .08, from: 'center' },
    }, 0)
    .fromTo(inners(), { autoAlpha: 0, y: 22 }, {
      autoAlpha: 1, y: 0, duration: .5, ease: 'back.out(1.5)',
      stagger: { each: .08, from: 'center' },
    }, .45)
}

async function reveal(id, token) {
  if (!current(token)) return
  openId.value = id
  roomVisible.value = true
  view.value = 'open'
  accent(TOPICS.find(topic => topic.id === id).accent)
  await nextTick()
  if (!current(token)) return
  stageMotion = gsap.fromTo(roomRef.value, {
    autoAlpha: 0, rotateX: -42, y: 90, transformOrigin: '50% 100%',
  }, {
    autoAlpha: 1, rotateX: 0, y: 0, duration: media.matches ? 0 : .7,
    ease: 'back.out(1.25)', onComplete: () => finish(token),
  })
}

function liftCurtain(id) {
  if (busy.value || view.value !== 'overview' || !NAV_ORDER.includes(id)) return
  const token = beginMotion()
  view.value = 'open'
  openId.value = id
  roomVisible.value = false
  if (media.matches) {
    gsap.set(panels(), { yPercent: -100, rotateX: 0 })
    reveal(id, token)
    return
  }
  stageMotion = gsap.to(panels(), {
    yPercent: -100, duration: .72, ease: 'power3.inOut',
    stagger: { each: .06, from: NAV_ORDER.indexOf(id), grid: 'auto' },
    onComplete: () => reveal(id, token),
  })
}

function dropCurtain() {
  if (busy.value || !isOpen.value) return
  const token = beginMotion()
  const from = index.value
  gsap.set(inners(), { autoAlpha: 1, y: 0 })
  const drop = () => {
    if (!current(token)) return
    roomVisible.value = false
    accent(.4)
    stageMotion = gsap.fromTo(panels(), { yPercent: -100, rotateX: 0 }, {
      yPercent: 0, duration: media.matches ? 0 : .62, ease: 'power3.inOut',
      stagger: media.matches ? 0 : { each: .05, from, grid: 'auto' },
      onComplete: () => {
        if (!current(token)) return
        openId.value = null
        view.value = 'overview'
        finish(token)
      },
    })
  }
  stageMotion = gsap.to(roomRef.value, {
    autoAlpha: 0, y: 60, rotateX: -30, duration: media.matches ? 0 : .3,
    ease: 'power2.in', onComplete: drop,
  })
}

function exitToTitle() {
  if (busy.value) return
  const token = beginMotion()
  accent(.1)
  const done = () => {
    if (!current(token)) return
    roomVisible.value = false
    openId.value = null
    view.value = 'title'
    gsap.set(panels(), { yPercent: -100, rotateX: 0 })
    finish(token)
  }
  if (media.matches || view.value === 'tail') { done(); return }
  stageMotion = gsap.timeline({ onComplete: done })
    .to(inners(), { autoAlpha: 0, y: 18, duration: .25, ease: 'power2.in', stagger: { each: .05, from: 'edges' } }, 0)
    .to(panels(), {
      yPercent: -100, rotateX: 22, transformOrigin: '50% 0%',
      duration: .6, ease: 'power3.in', stagger: { each: .06, from: 'edges' },
    }, .12)
}

function enterTail() {
  if (busy.value || !isOpen.value || openId.value !== 'p4') return
  const token = beginMotion()
  stageMotion = gsap.to(roomRef.value, {
    autoAlpha: 0, y: 60, rotateX: -30, duration: media.matches ? 0 : .4,
    ease: 'power2.in', onComplete: () => {
      if (!current(token)) return
      roomVisible.value = false
      openId.value = null
      view.value = 'tail'
      accent(1)
      finish(token)
    },
  })
}
function back() {
  if (isOpen.value) dropCurtain()
  else if (view.value === 'overview') exitToTitle()
  else if (view.value === 'tail') enterOverview()
}
function onKey(event) {
  if (busy.value || event.defaultPrevented || event.repeat || event.metaKey || event.ctrlKey || event.altKey ||
      document.querySelector('dialog[open]') || event.target?.closest?.('input, textarea, select, [contenteditable="true"]')) return
  const key = event.key
  if (key === 'Escape') { event.preventDefault(); back() }
  else if (/^[1-4]$/.test(key) && view.value === 'overview') {
    event.preventDefault()
    liftCurtain(`p${key}`)
  } else if (key === 'f') document.documentElement.requestFullscreen?.()
}
function motionChanged() {
  if (!media.matches) return
  // Complete chained transitions, including a curtain callback that starts room entry.
  for (let i = 0; busy.value && stageMotion && i < 4; i += 1) stageMotion.progress(1)
}
onMounted(() => {
  gsap.set(panels(), { yPercent: -100 })
  accent(.1)
  window.addEventListener('keydown', onKey)
  media.addEventListener('change', motionChanged)
})
onUnmounted(() => {
  disposed = true
  version += 1
  stageMotion?.kill()
  accentMotion?.kill()
  window.removeEventListener('keydown', onKey)
  media.removeEventListener('change', motionChanged)
})
</script>

<template>
  <Rain />
  <nav id="topbar" aria-label="分享导航">
    <span class="brand">Harness Engineering</span>
    <span class="spacer"></span>
    <button v-if="isOpen" class="btn accent" :disabled="busy" @click="dropCurtain">回总览</button>
    <button v-else-if="view !== 'title'" class="btn" :disabled="busy" @click="back">{{ view === 'tail' ? '回总览' : '回标题' }}</button>
  </nav>

  <main id="stage">
    <div class="backstage">
      <div v-if="roomVisible && isOpen" ref="roomRef" class="chapter-stage" :inert="busy">
        <component :is="CHAPTERS[openId]" :key="openId" @tail="enterTail" />
      </div>
    </div>
    <div class="curtain" :class="{ lifted: view !== 'overview' }" ref="panelsRef" :inert="view !== 'overview' || busy" :aria-hidden="view !== 'overview'">
      <div v-for="topic in TOPICS" :key="topic.id" class="panel" :class="{ cross: topic.cross }">
        <button class="panel-inner" @click="liftCurtain(topic.id)" :aria-label="`打开${topic.title}`">
          <span class="p-num">{{ topic.num }}</span>
          <span class="p-title">{{ topic.panelTitle || topic.title }}</span>
          <span class="p-short">{{ topic.short }}</span>
          <span class="p-layer">{{ topic.layerLabel }}</span>
          <span class="p-arrow" aria-hidden="true">▲ 掀开</span>
        </button>
      </div>
    </div>
    <div class="flip-scene" :class="{ gone: view !== 'title' }" :inert="view !== 'title' || busy">
      <div class="flip-card">
        <div class="flip-face flip-front" :inert="view !== 'title'" :aria-hidden="view !== 'title'">
          <div class="title-overlay">
            <div class="eyebrow">{{ TITLE.eyebrow }}</div>
            <h1 class="harness-title" :aria-label="TITLE.plain" v-html="TITLE.title"></h1>
            <div class="byline"><span class="by-date">{{ TITLE.date }}</span></div>
            <button type="button" class="enter" aria-label="开始分享" title="开始分享" @click="enterOverview">
              <ArrowRight :size="28" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="view === 'tail'" class="tail-scene">
      <ClosingScene @overview="enterOverview" @restart="exitToTitle" />
    </div>
  </main>
</template>
