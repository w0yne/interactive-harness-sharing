<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { FilePlus2, FileText, Pause, Play, RotateCcw } from 'lucide-vue-next'
import { gsap } from 'gsap'
import FileTree from './FileTree.vue'
import KnowledgeDocument from './KnowledgeDocument.vue'
import { decodeText } from '../composables/useDecode'
import {
  WORKSPACE_VIEWS, PROJECT_HISTORY, PROJECT_FILES, KNOWLEDGE_FOLDERS,
  READ_WRITE_EXAMPLE, projectStateAt, buildKnowledgeTree,
} from '../data/workspace'

const root = ref(null)
const title = ref(null)
const treeRoot = ref(null)
const stream = ref(null)
const scan = ref(null)
const recordPane = ref(null)
const workspacePane = ref(null)
const view = ref('timeline')
const visibleCount = ref(3)
const activeIndex = ref(0)
const workspaceFile = ref('research')
const workspaceSection = ref('folder')
const workspaceSections = [
  { id: 'folder', label: '目录职责' },
  { id: 'usage', label: 'AI 读写' },
  { id: 'organization', label: '维护与增量' },
]
const incrementOpen = ref(false)
const playState = ref('idle')
const reduced = ref(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
const media = window.matchMedia('(prefers-reduced-motion: reduce)')
const rows = new Map()
const visibleRecords = computed(() => PROJECT_HISTORY.slice(0, visibleCount.value))
const activeFile = computed(() => PROJECT_FILES[view.value === 'timeline'
  ? PROJECT_HISTORY[activeIndex.value].id : workspaceFile.value])
const folder = computed(() => KNOWLEDGE_FOLDERS.find(item => item.id === activeFile.value.folder))
const references = computed(() => activeFile.value.references.map(id => PROJECT_FILES[id]))
const projectState = computed(() => projectStateAt(activeIndex.value))
const tree = computed(() => buildKnowledgeTree({
  view: view.value, visibleCount: visibleCount.value, selectedFile: activeFile.value.id,
  selectedFolder: activeFile.value.folder, incrementOpen: incrementOpen.value,
  showOrganization: workspaceSection.value === 'organization',
}))
const replayLabel = computed(() => playState.value === 'playing' ? '暂停 Replay'
  : playState.value === 'paused' ? '继续 Replay' : '播放 Replay')
let playback
let playbackContext
let fragmentMotion
let headingMotion
let playbackRevision = 0
let renderRevision = 0
let disposed = false

function keepVisible(container, element) {
  if (!container || !element) return
  const viewport = container.getBoundingClientRect()
  const item = element.getBoundingClientRect()
  if (item.bottom > viewport.bottom) container.scrollTop += item.bottom - viewport.bottom + 8
  else if (item.top < viewport.top) container.scrollTop += item.top - viewport.top - 8
}

async function revealTreeFile(id) {
  await nextTick()
  if (disposed || activeFile.value.id !== id) return
  const container = treeRoot.value?.querySelector('.ft-body')
  keepVisible(container, container?.querySelector(`[data-node-id="${id}"]`))
}

function stopReplay() {
  playbackRevision += 1
  playback?.kill()
  playbackContext?.revert()
  playback = undefined
  playbackContext = undefined
  playState.value = 'idle'
}

async function animateContent(kind = 'document', firstNewIndex = 0) {
  const revision = ++renderRevision
  fragmentMotion?.revert()
  await nextTick()
  if (disposed || revision !== renderRevision) return
  if (recordPane.value) recordPane.value.scrollTop = 0
  revealTreeFile(activeFile.value.id)
  if (reduced.value) return
  fragmentMotion = gsap.context(() => {
    const targets = kind === 'append'
      ? [...root.value.querySelectorAll('.history-event')].slice(firstNewIndex)
      : kind === 'workspace'
        ? root.value.querySelectorAll('.ft-row, .folder-heading')
        : root.value.querySelectorAll('.document-fragment')
    if (!targets.length) return
    gsap.fromTo(targets, { autoAlpha: .4, x: kind === 'workspace' ? -8 : 12 }, {
      autoAlpha: 1, x: 0, duration: .35, stagger: kind === 'workspace' ? .025 : .07,
      ease: 'power2.out', clearProps: 'opacity,visibility,transform',
    })
  }, root.value)
}

function selectRecord(index) {
  if (index < 0 || index >= visibleCount.value) return
  stopReplay()
  activeIndex.value = index
  animateContent()
}

function appendRecords() {
  if (visibleCount.value === PROJECT_HISTORY.length) return
  stopReplay()
  const previous = visibleCount.value
  visibleCount.value = Math.min(PROJECT_HISTORY.length, previous + 2)
  activeIndex.value = visibleCount.value - 1
  animateContent('append', previous)
  nextTick(() => {
    if (!disposed && view.value === 'timeline') keepVisible(stream.value, rows.get(activeFile.value.id))
  })
}

async function startReplay() {
  if (view.value !== 'timeline') return
  stopReplay()
  const revision = playbackRevision
  activeIndex.value = 0
  playState.value = 'playing'
  await nextTick()
  if (disposed || revision !== playbackRevision || view.value !== 'timeline') return
  fragmentMotion?.revert()
  if (recordPane.value) recordPane.value.scrollTop = 0
  playbackContext = gsap.context(() => {
    playback = gsap.timeline({
      paused: true,
      onComplete: () => {
        if (!disposed && revision === playbackRevision) playState.value = 'complete'
      },
    })
    visibleRecords.value.forEach((doc, index) => {
      const row = rows.get(doc.id)
      playback.call(() => {
        if (disposed || revision !== playbackRevision) return
        activeIndex.value = index
        keepVisible(stream.value, row)
        revealTreeFile(doc.id)
        if (recordPane.value) recordPane.value.scrollTop = 0
      })
      if (!reduced.value && row) {
        playback.fromTo(scan.value, { y: row.offsetTop, autoAlpha: .85 }, {
          y: row.offsetTop + row.offsetHeight, autoAlpha: .85, duration: .65,
          ease: 'power1.inOut', immediateRender: false,
        }).to({}, { duration: 1.15 })
      } else {
        playback.to({}, { duration: 1.8 })
      }
    })
    if (playState.value === 'playing') playback.play()
  }, root.value)
}

function toggleReplay() {
  if (playState.value === 'playing') {
    playback?.pause()
    playState.value = 'paused'
  } else if (playState.value === 'paused') {
    playState.value = 'playing'
    playback?.play()
  } else startReplay()
}

async function selectView(id, focusTab = false) {
  if (view.value === id) return
  stopReplay()
  view.value = id
  await animateContent(id === 'workspace' ? 'workspace' : 'document')
  if (disposed || view.value !== id) return
  if (focusTab) root.value.querySelector(`#knowledge-tab-${id}`)?.focus({ preventScroll: true })
}

function moveTab(event, index) {
  let target
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') target = 1 - index
  else if (event.key === 'Home') target = 0
  else if (event.key === 'End') target = WORKSPACE_VIEWS.length - 1
  else return
  event.preventDefault()
  event.stopPropagation()
  selectView(WORKSPACE_VIEWS[target].id, true)
}

function selectTree(id) {
  if (id.startsWith('folder-')) {
    const target = KNOWLEDGE_FOLDERS.find(item => `folder-${item.id}` === id)
    if (!target) return
    workspaceSection.value = 'folder'
    workspaceFile.value = target.example
    if (view.value !== 'workspace') selectView('workspace')
    else {
      if (workspacePane.value) workspacePane.value.scrollTop = 0
      animateContent()
    }
  } else if (PROJECT_FILES[id]) {
    openDocument(id)
  }
}

async function selectWorkspaceSection(id, focus = false) {
  if (!workspaceSections.some(item => item.id === id)) return
  workspaceSection.value = id
  await animateContent()
  if (disposed || workspaceSection.value !== id) return
  if (focus) root.value.querySelector(`#workspace-section-${id}`)?.focus({ preventScroll: true })
}
function moveWorkspaceTab(event, index) {
  let target
  if (event.key === 'ArrowRight') target = (index + 1) % workspaceSections.length
  else if (event.key === 'ArrowLeft') target = (index + workspaceSections.length - 1) % workspaceSections.length
  else if (event.key === 'Home') target = 0
  else if (event.key === 'End') target = workspaceSections.length - 1
  else return
  event.preventDefault()
  event.stopPropagation()
  selectWorkspaceSection(workspaceSections[target].id, true)
}

async function openDocument(id, focusReader = false) {
  if (!PROJECT_FILES[id]) return
  if (view.value === 'timeline') {
    const index = PROJECT_HISTORY.findIndex(doc => doc.id === id)
    if (index < 0 || index >= visibleCount.value) return
    selectRecord(index)
  } else {
    workspaceFile.value = id
    if (workspaceSection.value === 'organization') workspaceSection.value = 'folder'
    if (workspacePane.value) workspacePane.value.scrollTop = 0
    animateContent()
  }
  await nextTick()
  if (disposed || activeFile.value.id !== id) return
  if (focusReader) root.value.querySelector('.record-text')?.focus({ preventScroll: true })
}

function setRow(id, element) {
  if (element) rows.set(id, element)
  else rows.delete(id)
}

function motionChanged() {
  reduced.value = media.matches
  stopReplay()
  renderRevision += 1
  fragmentMotion?.revert()
  headingMotion?.kill()
  if (title.value) title.value.textContent = '项目知识库'
}

onMounted(() => {
  media.addEventListener('change', motionChanged)
  window.addEventListener('resize', stopReplay)
  if (reduced.value) return
  title.value.textContent = ''
  headingMotion = decodeText(title.value, '项目知识库', { duration: .85, delay: .28 })
  animateContent('append')
})

onUnmounted(() => {
  disposed = true
  renderRevision += 1
  stopReplay()
  fragmentMotion?.revert()
  headingMotion?.kill()
  media.removeEventListener('change', motionChanged)
  window.removeEventListener('resize', stopReplay)
})
</script>

<template>
  <section ref="root" class="knowledge-scene" aria-labelledby="knowledge-title">
    <header class="knowledge-heading">
      <div><p class="eyebrow">02 / 文档与工作区</p><h1 id="knowledge-title" ref="title" aria-label="项目知识库">项目知识库</h1></div>
      <nav role="tablist" aria-label="项目知识库视角">
        <button v-for="(item, index) in WORKSPACE_VIEWS" :key="item.id" :id="`knowledge-tab-${item.id}`"
          type="button" role="tab" :aria-selected="view === item.id" aria-controls="knowledge-panel"
          :tabindex="view === item.id ? 0 : -1" @click="selectView(item.id)"
          @keydown="moveTab($event, index)">{{ item.label }}</button>
      </nav>
    </header>
    <div class="knowledge-intro">
      <p>文档按时间记录项目演进，按目录分工；大部分由 AI 在工作中写入和读取。</p>
      <span>示例项目</span>
    </div>

    <div class="knowledge-columns">
      <aside ref="treeRoot" class="knowledge-tree" aria-label="项目文档目录">
        <FileTree :nodes="tree" title="项目文件" interactive @select="selectTree" />
        <div class="tree-audience"><FileText :size="16" aria-hidden="true" /><span>主要读写者 <b>AI</b></span><span>人的确认与判断写入相关记录</span></div>
        <p class="tree-caption">同一组资料：按时间读回项目过程，按目录查找相关知识。</p>
      </aside>

      <div id="knowledge-panel" class="knowledge-panel" role="tabpanel"
        :aria-labelledby="`knowledge-tab-${view}`" tabindex="0">
        <div v-if="view === 'timeline'" class="timeline-grid">
          <div class="timeline-stream">
            <div class="replay-controls">
              <button type="button" class="replay-button" :aria-label="replayLabel" :title="replayLabel" @click="toggleReplay">
                <Pause v-if="playState === 'playing'" :size="17" aria-hidden="true" />
                <Play v-else :size="17" aria-hidden="true" /><span>Replay</span>
              </button>
              <button type="button" class="icon-button" title="从头回放" aria-label="从头回放" @click="startReplay"><RotateCcw :size="17" aria-hidden="true" /></button>
              <button type="button" class="icon-button append-button" title="追加记录" aria-label="追加记录"
                :disabled="visibleCount === PROJECT_HISTORY.length" @click="appendRecords"><FilePlus2 :size="18" aria-hidden="true" /></button>
              <span class="record-count">{{ activeIndex + 1 }} / {{ visibleCount }}</span>
            </div>
            <div ref="stream" class="timeline-scroll" tabindex="0" role="region" aria-label="按时间排列的文档">
              <ol class="history-list">
                <li v-for="(doc, index) in visibleRecords" :key="doc.id" :ref="el => setRow(doc.id, el)"
                  class="history-event" :class="{ selected: activeIndex === index, read: index < activeIndex }">
                  <button type="button" :aria-pressed="activeIndex === index" :title="PROJECT_FILES[doc.id].path" @click="selectRecord(index)">
                    <span class="history-dot" aria-hidden="true"></span>
                    <span class="event-meta"><time :datetime="doc.at">{{ doc.time }}</time><span>{{ doc.type }}</span></span>
                    <strong>{{ doc.title }}</strong>
                  </button>
                </li>
                <li ref="scan" v-show="!reduced && (playState === 'playing' || playState === 'paused')" class="replay-scan" aria-hidden="true"></li>
              </ol>
            </div>
            <p class="timeline-caption">新的记录继续追加，旧的决定和当时的依据仍可读取。</p>
            <details class="supporting-detail">
              <summary>事件日志与 Replay</summary>
              <p>与事件溯源相似，记录按顺序累积。AI 沿时间线读取需求、决定和结果，理解项目如何走到当前状态。</p>
              <p>Kafka 用 offset 标识消息顺序；这里用带时间戳的文件组织历史。滚动待办和目标文件的历史状态通过快照或版本记录读取。</p>
            </details>
          </div>
          <div ref="recordPane" class="record-pane" tabindex="0" role="region" aria-label="文档与项目状态">
            <div class="document-fragment">
              <KnowledgeDocument :document="activeFile" :references="references" @select="openDocument($event, true)" />
              <section class="project-state" aria-live="polite">
                <h3>截至 {{ PROJECT_HISTORY[activeIndex].time }}</h3>
                <dl>
                  <div><dt>范围</dt><dd>{{ projectState.scope }}</dd></div>
                  <div><dt>决定</dt><dd>{{ projectState.decision }}</dd></div>
                  <div><dt>进展</dt><dd>{{ projectState.progress }}</dd></div>
                </dl>
              </section>
            </div>
          </div>
        </div>

        <div v-else ref="workspacePane" class="workspace-view" tabindex="0" role="region" aria-label="目录职责与 AI 读写">
          <header class="folder-heading"><h2>{{ folder.name }}</h2><span>{{ folder.label }}</span></header>
          <nav class="workspace-tabs" role="tablist" aria-label="工作区内容">
            <button v-for="(section, index) in workspaceSections" :id="`workspace-section-${section.id}`" :key="section.id" type="button" role="tab"
              :aria-selected="workspaceSection === section.id" :tabindex="workspaceSection === section.id ? 0 : -1" aria-controls="workspace-section-content"
              @click="selectWorkspaceSection(section.id)" @keydown="moveWorkspaceTab($event, index)">{{ section.label }}</button>
          </nav>
          <div id="workspace-section-content" class="workspace-section-content" role="tabpanel" :aria-labelledby="`workspace-section-${workspaceSection}`">
          <div v-if="workspaceSection === 'folder'" class="folder-facts">
          <p class="folder-responsibility">{{ folder.responsibility }}</p>
          <dl class="folder-usage">
            <div><dt>AI 什么时候写</dt><dd>{{ folder.write }}</dd></div>
            <div><dt>AI 什么时候读</dt><dd>{{ folder.read }}</dd></div>
          </dl>
          <p class="folder-lifecycle">{{ folder.lifecycle }}</p>
          </div>

          <section v-else-if="workspaceSection === 'usage'" class="read-write-example">
            <h3>{{ READ_WRITE_EXAMPLE.title }}</h3>
            <div v-for="direction in ['read', 'write']" :key="direction" class="file-set">
              <span>{{ direction === 'read' ? 'AI 读取' : 'AI 写回' }}</span>
              <div><button v-for="id in READ_WRITE_EXAMPLE[direction]" :key="id" type="button"
                :title="PROJECT_FILES[id].path" @click="openDocument(id)"><FileText :size="13" aria-hidden="true" />{{ PROJECT_FILES[id].short }}</button></div>
            </div>
          </section>

          <div v-else class="workspace-organization">
          <section class="supporting-detail">
            <h3>归属与版本管理</h3>
            <p>内部工作记录由私有仓库跟踪；正式代码与交付文档在共享仓库维护；外部参考登记来源与版本。</p>
            <p>可见性、Git 跟踪与使用者分别确定。.gitignore 避免重复跟踪，不提供访问隔离。</p>
          </section>
          <section class="supporting-detail">
            <h3>跨增量继续使用</h3>
            <p>只识别一个活跃文档目录的流程，在增量完成后归档过程记录，再建立下一增量的工作目录。</p>
            <p>AI 读取已合并代码与可复用的技术分析；跨增量接口保留在项目层。已有独立 specs / plans 的工具沿用其原生机制。</p>
            <label class="increment-toggle"><input v-model="incrementOpen" type="checkbox">展开增量归档目录</label>
          </section>
          </div>
          <div v-if="workspaceSection !== 'organization'" class="document-fragment workspace-document">
            <KnowledgeDocument :document="activeFile" :references="references" :show-usage="false" @select="openDocument($event, true)" />
          </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.knowledge-scene { position: absolute; inset: 0; display: flex; flex-direction: column; padding: 76px 4.5vw 26px; letter-spacing: 0; }
.knowledge-heading, .knowledge-intro, .knowledge-columns { width: 100%; max-width: 1760px; margin-inline: auto; }
.knowledge-heading { display: flex; align-items: end; justify-content: space-between; gap: 30px; flex-shrink: 0; }
.eyebrow { font: 12px/1.6 var(--mono); color: var(--accent); margin-bottom: 6px; }
h1 { color: var(--ink); font: 650 36px/1.4 var(--sans); min-height: 51px; }
nav { display: flex; gap: 26px; border-bottom: 1px solid var(--matrix-dim); }
nav button { padding: 12px 4px; background: none; border: 0; border-bottom: 2px solid transparent; color: var(--ink-soft); font: 16px/1.5 var(--sans); cursor: pointer; }
nav button[aria-selected="true"] { color: var(--accent-soft); border-bottom-color: var(--accent); }
.knowledge-intro { display: flex; justify-content: space-between; align-items: baseline; gap: 20px; margin-block: 12px 22px; }
.knowledge-intro p { color: var(--ink-soft); font: 16px/1.8 var(--sans); }
.knowledge-intro > span { flex-shrink: 0; color: var(--ink-soft); font: 11px/1.6 var(--sans); }
.knowledge-columns { display: grid; grid-template-columns: minmax(330px, 29%) minmax(0,1fr); gap: 30px; flex: 1; min-height: 0; }
.knowledge-tree { display: flex; flex-direction: column; min-height: 0; min-width: 0; gap: 12px; }
.knowledge-tree :deep(.filetree) { flex: 1; min-height: 0; display: flex; flex-direction: column; border-radius: 6px; }
.knowledge-tree :deep(.ft-body) { flex: 1; min-height: 0; max-height: none; padding: 10px 6px 8px; font-size: 13px; scrollbar-gutter: stable; overscroll-behavior: contain; }
.knowledge-tree :deep(.ft-row) { min-height: 27px; padding-block: 3px; gap: 5px; white-space: normal; border-radius: 3px; align-items: baseline; }
.knowledge-tree :deep(.ft-name) { min-width: 0; overflow-wrap: anywhere; }
.knowledge-tree :deep(.ft-note) { font-size: 11px; margin-left: 4px; }
.knowledge-tree :deep(.ft-tag) { font-size: 9px; margin-left: 2px; padding-inline: 4px; }
.knowledge-tree :deep(.ft-row.hl) { background: rgba(217,119,87,.09); }
.knowledge-tree :deep(.ft-row.hl .ft-name) { color: var(--accent-soft); }
.knowledge-tree :deep(button.ft-row:hover) { background: rgba(127,174,132,.1); }
.tree-audience { display: flex; flex-wrap: wrap; align-items: center; gap: 5px 9px; color: #a6dae6; font: 12px/1.7 var(--sans); }
.tree-audience b { color: var(--matrix); font-weight: 500; margin-left: 5px; }
.tree-audience > span:last-child { flex-basis: 100%; color: var(--ink-soft); font-size: 11px; padding-left: 25px; }
.tree-caption { color: var(--ink-soft); font: 12px/1.8 var(--sans); }
.knowledge-panel { min-width: 0; min-height: 0; }
.timeline-grid { display: grid; grid-template-columns: minmax(250px,.8fr) minmax(0,1.2fr); gap: 26px; height: 100%; min-height: 0; }
.timeline-stream { min-width: 0; min-height: 0; display: flex; flex-direction: column; }
.replay-controls { display: flex; align-items: center; gap: 9px; height: 42px; margin-bottom: 12px; flex-shrink: 0; }
.replay-controls button { display: inline-flex; align-items: center; justify-content: center; gap: 9px; border: 1px solid var(--matrix-dim); border-radius: 4px; color: var(--ink); background: rgba(0,255,65,.025); cursor: pointer; height: 36px; }
.replay-button { width: 110px; font: 14px/1.5 var(--mono); }
.replay-controls .replay-button { color: var(--accent-soft); border-color: var(--accent); }
.icon-button { width: 36px; flex-shrink: 0; }
.replay-controls button:hover:not(:disabled) { background: rgba(217,119,87,.1); }
.replay-controls button:disabled { opacity: .3; cursor: default; }
.append-button { margin-left: auto; }
.record-count { min-width: 36px; text-align: right; color: var(--ink-soft); font: 11px var(--mono); }
.timeline-scroll { flex: 1; min-height: 160px; overflow: auto; scrollbar-gutter: stable; overscroll-behavior: contain; scrollbar-color: var(--matrix-dim) transparent; }
.history-list { position: relative; list-style: none; margin: 0; padding: 0; }
.history-list::before { position: absolute; content: ''; top: 21px; bottom: 45px; left: 8px; width: 1px; background: var(--matrix-link); }
.history-event { position: relative; height: 60px; }
.history-event button { position: relative; display: grid; grid-template-columns: 19px minmax(0,1fr); grid-template-rows: 21px 25px; gap: 0 10px; width: 100%; height: 60px; padding: 6px 8px 8px 0; text-align: left; border: 0; background: transparent; color: var(--ink-soft); cursor: pointer; border-radius: 4px; }
.history-event.selected button { background: rgba(217,119,87,.08); }
.history-event button:hover { background: rgba(127,174,132,.08); }
.history-dot { width: 9px; height: 9px; grid-row: span 2; background: var(--bg); border: 1px solid var(--matrix-link); border-radius: 50%; margin: 6px 0 0 4px; z-index: 1; }
.selected .history-dot { border-color: var(--accent); background: var(--accent); }
.read .history-dot { background: var(--matrix); border-color: var(--matrix); }
.event-meta { display: flex; flex-wrap: nowrap; align-items: baseline; justify-content: space-between; gap: 8px; font: 11px/1.8 var(--mono); }
.event-meta > span { font-family: var(--sans); color: #a6dae6; }
.history-event strong { font: 550 15px/1.7 var(--sans); color: var(--ink); }
.history-event.selected strong { color: var(--accent-soft); }
.replay-scan { position: absolute; top: 0; left: 0; right: 0; height: 2px; background: var(--accent); box-shadow: 0 0 12px rgba(217,119,87,.45); pointer-events: none; z-index: 2; }
.timeline-caption { color: var(--ink-soft); font: 12px/1.8 var(--sans); margin-top: 14px; }
.record-pane { min-width: 0; min-height: 0; overflow-y: auto; padding-right: 7px; scrollbar-gutter: stable; overscroll-behavior: contain; }
.project-state { border-top: 1px solid var(--matrix-dim); padding-top: 15px; margin-top: 17px; }
.project-state h3 { color: var(--accent-soft); font: 12px/1.7 var(--mono); margin-bottom: 8px; }
.project-state dl > div { display: grid; grid-template-columns: 35px minmax(0,1fr); gap: 9px; margin-top: 7px; }
.project-state dt { color: var(--ink-soft); font: 12px/1.8 var(--sans); }
.project-state dd { color: var(--ink); font: 13px/1.8 var(--sans); }
.workspace-view { display: flex; flex-direction: column; height: 100%; min-height: 0; padding-right: 15px; }
.workspace-tabs { flex-shrink: 0; margin-bottom: 14px; gap: 22px; }
.workspace-tabs button { padding: 6px 0 9px; font-size: 13px; }
.workspace-section-content { display: flex; flex-direction: column; flex: 1; min-height: 0; }
.folder-facts, .read-write-example { flex-shrink: 0; }
.folder-heading { display: flex; align-items: baseline; gap: 20px; margin-bottom: 12px; flex-shrink: 0; }
.folder-heading h2 { color: var(--matrix); font: 600 26px/1.4 var(--mono); }
.folder-heading > span { color: var(--accent-soft); font: 15px var(--sans); }
.folder-responsibility { color: var(--ink); font: 17px/1.8 var(--sans); }
.folder-usage { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; margin-top: 18px; }
.folder-usage > div { border-top: 1px solid var(--matrix-dim); padding-top: 12px; }
.folder-usage dt { color: #a6dae6; font: 13px/1.8 var(--sans); margin-bottom: 7px; }
.folder-usage dd { color: var(--ink-soft); font: 15px/1.9 var(--sans); }
.folder-lifecycle { color: var(--ink-soft); font: 13px/1.8 var(--sans); margin-block: 16px 24px; }
.workspace-document { display: flex; flex: 1; min-height: 0; max-width: 1000px; }
.workspace-document :deep(.knowledge-document) { display: flex; flex-direction: column; flex: 1; min-height: 0; }
.workspace-document :deep(.record-heading), .workspace-document :deep(.document-references), .workspace-document :deep(.document-bar) { flex-shrink: 0; }
.workspace-document :deep(.document-window) { display: flex; flex-direction: column; flex: 1; min-height: 0; }
.workspace-document :deep(.record-text) { flex: 1; min-height: 0; height: auto; padding-bottom: 16px; }
.read-write-example { margin-bottom: 20px; }
.read-write-example h3 { font: 600 17px/1.6 var(--sans); color: var(--ink); margin-bottom: 12px; }
.file-set { display: grid; grid-template-columns: 75px minmax(0,1fr); gap: 10px; margin: 10px 0; align-items: baseline; }
.file-set > span { color: var(--matrix); font: 13px/1.8 var(--sans); }
.file-set > div { display: flex; flex-wrap: wrap; gap: 6px 18px; }
.file-set button { display: inline-flex; align-items: center; gap: 5px; color: #a6dae6; background: none; border: 0; border-bottom: 1px solid var(--matrix-dim); padding: 4px 0; font: 13px/1.7 var(--sans); cursor: pointer; }
.file-set button:hover { color: var(--accent-soft); }
.supporting-detail { border-top: 1px solid var(--matrix-dim); margin-top: 16px; padding-top: 10px; flex-shrink: 0; }
.supporting-detail summary { color: var(--accent-soft); font: 13px/1.8 var(--sans); cursor: pointer; padding: 4px 0; }
.supporting-detail p { color: var(--ink-soft); font: 13px/1.85 var(--sans); margin-top: 10px; }
.workspace-organization .supporting-detail { margin-top: 0; padding-block: 14px 24px; }
.workspace-organization h3 { color: var(--accent-soft); font: 600 17px/1.8 var(--sans); }
.workspace-organization p { font-size: 15px; line-height: 1.9; }
.increment-toggle { display: inline-flex; align-items: center; gap: 10px; color: #a6dae6; font: 13px/1.8 var(--sans); margin-top: 18px; cursor: pointer; }
.increment-toggle input { accent-color: var(--accent); }
button:focus-visible, [tabindex="0"]:focus-visible, summary:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; }
@media (max-height: 950px) {
  .knowledge-scene { padding-top: 65px; padding-bottom: 22px; }
  h1 { font-size: 32px; min-height: 45px; }
  .knowledge-intro { margin-block: 8px 17px; }
  .knowledge-intro p { font-size: 15px; }
}
@media (min-width: 1700px) {
  .knowledge-columns { grid-template-columns: minmax(400px,27%) minmax(0,1fr); gap: 40px; }
  .timeline-grid { grid-template-columns: minmax(300px,.85fr) minmax(0,1.15fr); gap: 32px; }
  .knowledge-tree :deep(.ft-body) { font-size: 14px; }
  .history-event, .history-event button { height: 76px; }
  .history-event button { padding-block: 14px; }
  .history-event strong { font-size: 16px; }
  .event-meta { font-size: 12px; }
}
@media (prefers-reduced-motion: reduce) {
  .knowledge-tree :deep(.ft-row) { animation: none; }
}
</style>
