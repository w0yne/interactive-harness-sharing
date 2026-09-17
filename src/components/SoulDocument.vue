<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { MessageSquareText, X } from 'lucide-vue-next'
import { gsap } from 'gsap'
import { decodeText } from '../composables/useDecode'
import { SOUL_DOCUMENTS, SOUL_NOTES } from '../data/soul'

const titleText = 'SOUL.md'
const root = ref(null)
const title = ref(null)
const reader = ref(null)
const annotation = ref(null)
const documentId = ref('soul')
const selected = ref(null)
const currentDocument = computed(() => SOUL_DOCUMENTS.find(doc => doc.id === documentId.value))
const note = computed(() => selected.value ? SOUL_NOTES[selected.value.annotation] : null)
const scrollPositions = Object.fromEntries(SOUL_DOCUMENTS.map(doc => [doc.id, 0]))
const media = window.matchMedia('(prefers-reduced-motion: reduce)')
let headingMotion
let noteMotion
let noteTrigger
let noteRevision = 0
let documentRevision = 0
let renderedDocumentId = 'soul'
let disposed = false

function closeNote(restoreFocus = true) {
  noteRevision += 1
  noteMotion?.revert()
  selected.value = null
  if (restoreFocus && noteTrigger?.isConnected) noteTrigger.focus({ preventScroll: true })
  noteTrigger = null
}

async function selectSection(section, event) {
  if (selected.value?.id === section.id) { closeNote(); return }
  const revision = ++noteRevision
  noteMotion?.revert()
  noteTrigger = event.currentTarget
  selected.value = section
  await nextTick()
  if (disposed || revision !== noteRevision) return
  annotation.value.scrollTop = 0
  if (media.matches) return
  noteMotion = gsap.context(() => {
    gsap.fromTo(annotation.value, { autoAlpha: .3, y: 10 }, {
      autoAlpha: 1, y: 0, duration: .35, ease: 'power2.out',
    })
  }, root.value)
}

async function selectDocument(id, focusTab = false) {
  if (id === documentId.value || !SOUL_DOCUMENTS.some(doc => doc.id === id)) return
  const revision = ++documentRevision
  scrollPositions[renderedDocumentId] = reader.value.scrollTop
  closeNote(false)
  documentId.value = id
  await nextTick()
  if (disposed || revision !== documentRevision) return
  reader.value.scrollTop = scrollPositions[id]
  renderedDocumentId = id
  if (focusTab) root.value.querySelector(`#soul-tab-${id}`)?.focus({ preventScroll: true })
}

function followReference(event) {
  const link = event.target.closest('a')
  const id = link?.getAttribute('href')?.slice(1)
  if (!SOUL_DOCUMENTS.some(doc => doc.id === id)) return
  event.preventDefault()
  selectDocument(id, true)
}

function moveTab(event, index) {
  let target
  if (event.key === 'ArrowRight') target = (index + 1) % SOUL_DOCUMENTS.length
  else if (event.key === 'ArrowLeft') target = (index + SOUL_DOCUMENTS.length - 1) % SOUL_DOCUMENTS.length
  else if (event.key === 'Home') target = 0
  else if (event.key === 'End') target = SOUL_DOCUMENTS.length - 1
  else return
  event.preventDefault()
  event.stopPropagation()
  selectDocument(SOUL_DOCUMENTS[target].id, true)
}

function escapeNote(event) {
  if (!selected.value) return
  event.preventDefault()
  event.stopPropagation()
  closeNote()
}

function motionChanged() {
  if (!media.matches) return
  noteRevision += 1
  noteMotion?.revert()
  headingMotion?.kill()
  if (title.value) title.value.textContent = titleText
}

onMounted(() => {
  media.addEventListener('change', motionChanged)
  if (media.matches) return
  title.value.textContent = ''
  headingMotion = decodeText(title.value, titleText, { duration: .85, delay: .28 })
})

onUnmounted(() => {
  disposed = true
  noteRevision += 1
  documentRevision += 1
  media.removeEventListener('change', motionChanged)
  noteMotion?.revert()
  headingMotion?.kill()
})
</script>

<template>
  <section ref="root" class="soul-scene" aria-labelledby="soul-title" @keydown.esc="escapeNote">
    <header class="soul-heading">
      <p>01 / 跨工具的项目规则</p>
      <h1 id="soul-title" ref="title" :aria-label="titleText">{{ titleText }}</h1>
    </header>

    <div class="soul-workbench">
      <article class="source-document">
        <nav class="document-tabs" role="tablist" aria-label="SOUL.md 相关文件">
          <button v-for="(doc, index) in SOUL_DOCUMENTS" :key="doc.id" :id="`soul-tab-${doc.id}`"
            type="button" role="tab" :aria-selected="documentId === doc.id" aria-controls="soul-reader"
            :tabindex="documentId === doc.id ? 0 : -1" @click="selectDocument(doc.id)"
            @keydown="moveTab($event, index)">{{ doc.filename }}</button>
        </nav>
        <div class="document-bar"><span>{{ currentDocument.filename }}</span></div>
        <div id="soul-reader" ref="reader" class="document-body" role="tabpanel"
          :aria-labelledby="`soul-tab-${documentId}`" tabindex="0" @click="followReference">
          <div :key="documentId" class="document-content" lang="en">
            <section v-for="section in currentDocument.sections" :key="section.id"
              class="source-section" :class="[`depth-${section.depth}`, { selected: selected?.id === section.id }]">
              <component :is="`h${section.depth + 1}`" class="source-heading">
                <button v-if="section.annotation" type="button" class="annotated-heading"
                  :aria-expanded="selected?.id === section.id" aria-controls="soul-annotation"
                  :title="`${section.title} · 中文批注`" @click="selectSection(section, $event)">
                  <span v-html="section.heading"></span>
                  <MessageSquareText :size="16" :stroke-width="1.5" aria-hidden="true" />
                </button>
                <span v-else v-html="section.heading"></span>
              </component>
              <div class="markdown-body" v-html="section.html"></div>
            </section>
          </div>
        </div>
      </article>

      <aside id="soul-annotation" ref="annotation" v-show="note" class="soul-margin"
        role="region" aria-label="条文解释" aria-live="polite" aria-atomic="true">
        <template v-if="note">
          <header class="annotation-header">
            <p>{{ note.ref }}</p>
            <button type="button" class="close-note" aria-label="关闭批注" title="关闭批注" @click="closeNote()">
              <X :size="20" :stroke-width="1.5" aria-hidden="true" />
            </button>
          </header>
          <h2>{{ note.title }}</h2>
          <pre v-if="note.code"><code>{{ note.code }}</code></pre>
          <p v-for="paragraph in note.paragraphs" :key="paragraph" class="annotation-text">{{ paragraph }}</p>
        </template>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.soul-scene { position: absolute; inset: 0; display: flex; flex-direction: column; padding: 76px 4.5vw 30px; letter-spacing: 0; }
.soul-heading, .soul-workbench { width: 100%; max-width: 1720px; margin-inline: auto; }
.soul-heading { flex-shrink: 0; padding-bottom: 22px; }
.soul-heading > p { color: var(--accent); font: 13px/1.5 var(--mono); margin-bottom: 7px; }
h1 { font: 650 42px/1.2 var(--mono); color: var(--ink); min-height: 51px; }
.soul-workbench { display: grid; grid-template-columns: minmax(0, 1fr) 350px; gap: 46px; flex: 1; min-height: 0; }
.source-document { display: flex; flex-direction: column; min-width: 0; min-height: 0; border: 1px solid var(--matrix-dim); border-radius: 8px; background: rgba(3,8,5,.88); overflow: hidden; }
.document-tabs { display: flex; flex-shrink: 0; min-height: 49px; border-bottom: 1px solid var(--matrix-dim); background: rgba(0,255,65,.025); }
.document-tabs button { display: flex; align-items: center; min-width: 0; padding: 13px 17px; border: 0; border-right: 1px solid var(--matrix-dim); border-bottom: 2px solid transparent; background: transparent; color: var(--ink-soft); font: 13px/1.5 var(--mono); cursor: pointer; }
.document-tabs button[aria-selected="true"] { background: rgba(0,255,65,.045); color: var(--ink); border-bottom-color: var(--accent); }
.document-tabs button:hover { color: var(--accent-soft); }
.document-bar { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 11px 25px; border-bottom: 1px solid var(--matrix-dim); color: var(--matrix); font: 12px/1.6 var(--mono); flex-shrink: 0; }
.document-body { flex: 1; min-height: 0; overflow-y: auto; scrollbar-gutter: stable; scrollbar-color: var(--matrix-dim) transparent; overscroll-behavior: contain; }
.document-content { padding: 23px 24px 60px 18px; max-width: 1100px; }
.source-section { border-left: 2px solid transparent; padding: 15px 17px 17px; }
.source-section + .source-section { margin-top: 14px; }
.source-section.selected { border-left-color: var(--accent); background: rgba(217,119,87,.045); }
.source-section.depth-3 { margin-left: 18px; margin-top: 0; }
.source-heading { color: var(--matrix); font: 550 18px/1.65 var(--mono); margin: 0 0 12px; overflow-wrap: anywhere; }
.depth-1 .source-heading { font-size: 26px; color: var(--ink); margin-bottom: 18px; }
.depth-3 .source-heading { font-size: 16px; }
.annotated-heading { display: flex; align-items: baseline; gap: 15px; width: 100%; padding: 0; border: 0; background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer; }
.annotated-heading > span { min-width: 0; }
.annotated-heading svg { flex-shrink: 0; align-self: center; color: var(--ink-soft); opacity: .65; }
.annotated-heading:hover, .annotated-heading[aria-expanded="true"] { color: var(--accent-soft); }
.annotated-heading:hover svg, .annotated-heading[aria-expanded="true"] svg { color: var(--accent); opacity: 1; }
.markdown-body { color: var(--ink); font: 15px/1.85 var(--mono); overflow-wrap: anywhere; }
.markdown-body :deep(p) { margin: 0 0 12px; }
.markdown-body :deep(p:last-child) { margin-bottom: 0; }
.markdown-body :deep(ul) { margin: 10px 0 0; padding-left: 23px; }
.markdown-body :deep(li) { padding-left: 4px; margin-bottom: 9px; }
.markdown-body :deep(li::marker) { color: var(--matrix-link); }
.markdown-body :deep(strong) { font-weight: 650; color: #d3e5d5; }
.markdown-body :deep(blockquote) { border-left: 2px solid var(--matrix-link); padding-left: 18px; margin: 0; color: #acbdae; }
.markdown-body :deep(code) { color: #a6dae6; font: inherit; }
.markdown-body :deep(pre) { white-space: pre-wrap; overflow-wrap: anywhere; padding: 18px 0; margin: 14px 0; border-top: 1px solid var(--matrix-dim); border-bottom: 1px solid var(--matrix-dim); font: 13px/1.8 var(--mono); }
.markdown-body :deep(a) { color: var(--accent-soft); text-decoration: underline; text-underline-offset: 4px; }
.markdown-body :deep(a:hover) { color: var(--ink); }
.source-heading :deep(code) { font: inherit; }
.soul-margin { min-width: 0; min-height: 0; align-self: start; max-height: 100%; overflow-y: auto; overscroll-behavior: contain; scrollbar-color: var(--matrix-dim) transparent; padding: 60px 4px 20px 0; }
.annotation-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 18px; }
.annotation-header p { color: var(--accent); font: 12px/1.7 var(--mono); }
.close-note { display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; flex-shrink: 0; border: 0; background: transparent; color: var(--ink-soft); cursor: pointer; border-radius: 4px; }
.close-note:hover { background: var(--matrix-dim); color: var(--ink); }
.soul-margin h2 { font: 650 26px/1.6 var(--sans); color: var(--ink); margin-bottom: 22px; }
.soul-margin pre { white-space: pre-wrap; overflow-wrap: anywhere; color: #a6dae6; font: 14px/1.9 var(--mono); margin-bottom: 22px; padding-block: 14px; border-block: 1px solid var(--matrix-dim); }
.annotation-text { color: var(--ink-soft); font: 17px/1.95 var(--sans); margin-bottom: 16px; }
button:focus-visible, .document-body:focus-visible, .markdown-body :deep(a:focus-visible) { outline: 2px solid var(--accent); outline-offset: 3px; }
.document-tabs button:focus-visible { outline-offset: -4px; }
@media (max-height: 950px) {
  .soul-scene { padding-top: 65px; padding-bottom: 22px; }
  .soul-heading { padding-bottom: 17px; }
  h1 { font-size: 36px; min-height: 44px; }
  .soul-workbench { gap: 36px; }
  .soul-margin { padding-top: 56px; }
  .soul-margin h2 { font-size: 24px; }
}
</style>
