<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { ArrowRight, AudioLines, ExternalLink, Image as ImageIcon, Mic } from 'lucide-vue-next'
import { gsap } from 'gsap'
import Terminal from './Terminal.vue'
import { decodeText } from '../composables/useDecode'
import { REMOTE_VIEWS, CONVERSATION, REMOTE_OPTIONS, TERMINAL_BACKENDS, HOOK_VIEWS, ADAPTERS } from '../data/participation'

const titleText = '语音与终端遥控'
const root = ref(null)
const title = ref(null)
const body = ref(null)
const mode = ref('voice')
const eventId = ref('voice')
const adapterId = ref('claude')
const backendId = ref('tmux')
const codeId = ref('payload')
const event = computed(() => CONVERSATION.find(item => item.id === eventId.value))
const adapter = computed(() => ADAPTERS[adapterId.value])
const backend = computed(() => TERMINAL_BACKENDS[backendId.value])
const example = computed(() => adapter.value.examples[codeId.value])
const media = window.matchMedia('(prefers-reduced-motion: reduce)')
const reducedMotion = ref(media.matches)
let contentMotion
let headingMotion
let detailMotion
let revision = 0
let detailRevision = 0
let disposed = false

async function changeMode(value, focusTab = false) {
  if (mode.value === value) return
  const token = ++revision
  detailRevision += 1
  detailMotion?.revert()
  contentMotion?.revert()
  mode.value = value
  await nextTick()
  if (disposed || revision !== token) return
  body.value.scrollTop = 0
  if (focusTab) root.value.querySelector(`#remote-tab-${value}`)?.focus({ preventScroll: true })
  if (media.matches) return
  contentMotion = gsap.context(() => {
    gsap.fromTo('.human-material', { autoAlpha: .3, y: 14 }, {
      autoAlpha: 1, y: 0, duration: .45, ease: 'power3.out', stagger: .08,
    })
  }, body.value)
}

async function changeDetail(kind, value) {
  const target = kind === 'event' ? eventId : kind === 'backend' ? backendId : kind === 'agent' ? adapterId : codeId
  if (target.value === value) return
  const token = ++detailRevision
  detailMotion?.revert()
  target.value = value
  await nextTick()
  if (disposed || detailRevision !== token || media.matches) return
  detailMotion = gsap.context(() => {
    gsap.fromTo('.detail-motion', { autoAlpha: .45, y: 7 }, {
      autoAlpha: 1, y: 0, duration: .25, ease: 'power2.out',
    })
  }, body.value)
}

function moveTab(event, index) {
  let target
  if (event.key === 'ArrowRight') target = (index + 1) % REMOTE_VIEWS.length
  else if (event.key === 'ArrowLeft') target = (index + REMOTE_VIEWS.length - 1) % REMOTE_VIEWS.length
  else if (event.key === 'Home') target = 0
  else if (event.key === 'End') target = REMOTE_VIEWS.length - 1
  else return
  event.preventDefault()
  event.stopPropagation()
  changeMode(REMOTE_VIEWS[target].id, true)
}

function reduced() {
  reducedMotion.value = media.matches
  if (!media.matches) return
  revision += 1
  detailRevision += 1
  contentMotion?.revert()
  detailMotion?.revert()
  headingMotion?.kill()
  if (title.value) title.value.textContent = titleText
}
onMounted(() => {
  if (!media.matches) {
    title.value.textContent = ''
    headingMotion = decodeText(title.value, titleText, { duration: .85, delay: .28 })
  }
  media.addEventListener('change', reduced)
})
onUnmounted(() => {
  disposed = true
  revision += 1
  detailRevision += 1
  contentMotion?.revert()
  detailMotion?.revert()
  headingMotion?.kill()
  media.removeEventListener('change', reduced)
})
</script>

<template>
  <section class="human-scene" ref="root" aria-labelledby="remote-title">
    <header class="human-heading">
      <p>03 / 原生 CLI 远程接入</p>
      <h1 id="remote-title" ref="title" :aria-label="titleText">{{ titleText }}</h1>
      <nav class="chapter-tabs" role="tablist" aria-label="远程控制设计">
        <button v-for="(item, index) in REMOTE_VIEWS" :key="item.id" :id="`remote-tab-${item.id}`"
          type="button" role="tab" :aria-selected="mode === item.id" aria-controls="remote-panel"
          :tabindex="mode === item.id ? 0 : -1" @click="changeMode(item.id)"
          @keydown="moveTab($event, index)">{{ item.label }}</button>
      </nav>
    </header>

    <div id="remote-panel" class="human-body" ref="body" role="tabpanel" :aria-labelledby="`remote-tab-${mode}`" tabindex="0">
      <div v-if="mode === 'voice'" class="remote-layout">
        <div class="phone human-material">
          <div class="phone-notch"></div>
          <div class="phone-screen">
            <div class="phone-top"><i></i> 飞书 <small>交互示意</small></div>
            <div class="chat">
              <button v-for="message in CONVERSATION" :key="message.id" type="button" class="msg"
                :class="[message.kind, { selected: eventId === message.id }]"
                :aria-label="message.label" :aria-pressed="eventId === message.id" @click="changeDetail('event', message.id)">
                <span class="message-label">{{ message.from }} · {{ message.label }}</span>
                <span v-if="message.id === 'voice'" class="voice-mark"><Mic :size="18" aria-hidden="true" /><AudioLines :size="28" aria-hidden="true" /><span>客户端转写</span></span>
                {{ message.text }}
                <span v-if="message.id === 'reply'" class="screen-preview" role="img" aria-label="终端截图示意">
                  <span><ImageIcon :size="13" aria-hidden="true" />终端截图</span>
                  <code>方案已写入技术文档<br>调用方未修改。<br>&gt;</code>
                </span>
              </button>
            </div>
          </div>
        </div>
        <div class="native-work human-material">
          <h2 class="voice-reason">飞书：语音输入与远程交互</h2>
          <p class="voice-lead">把背景、约束和要求说完整，再从手机继续操作工作终端。</p>
          <div class="detail-motion">
            <div class="native-heading"><span>{{ event.title }}</span><small>交互示意</small></div>
            <Terminal :key="eventId" title="飞书 → tmux → 原生 coding agent" :lines="event.terminal" :play="!reducedMotion" />
            <p class="moment-detail">{{ event.detail }}</p>
          </div>
          <div class="voice-route" aria-label="语音到终端的输入路径">
            <span :class="{ active: eventId === 'voice' }">飞书客户端<small>语音转文字</small></span><ArrowRight :size="18" aria-hidden="true" />
            <span>消息 bridge<small>传输与路由</small></span><ArrowRight :size="18" aria-hidden="true" />
            <span :class="{ active: eventId !== 'voice' }">tmux 中的 CLI<small>执行与回复</small></span>
          </div>
        </div>
      </div>

      <div v-else-if="mode === 'terminal'" class="terminal-layout">
        <div class="remote-options human-material">
          <h2>远程接入已有多种选择</h2>
          <div class="official-options">
            <article v-for="item in REMOTE_OPTIONS" :key="item.name">
              <header><a :href="item.url" target="_blank" rel="noopener noreferrer">{{ item.name }}<ExternalLink :size="13" aria-hidden="true" /></a><span>{{ item.route }}</span></header>
              <p>{{ item.description }}</p>
            </article>
          </div>
          <div class="terminal-rationale">
            <h3>飞书连接工作终端</h3>
            <p>原来的项目、agent 配置与工具继续使用。输入和反馈通道独立于某一家 agent 的远程客户端。</p>
            <p>终端驻留与原生 Remote Control 处在不同层，也可以组合使用。</p>
          </div>
        </div>
        <div class="backend-work human-material">
          <div class="backend-heading">
            <h2>控制正在工作的终端</h2>
            <div class="choice-group" role="group" aria-label="终端后端">
              <button v-for="(item, id) in TERMINAL_BACKENDS" :key="id" type="button"
                :aria-pressed="backendId === id" @click="changeDetail('backend', id)">{{ item.name }}</button>
            </div>
          </div>
          <div class="detail-motion">
            <p class="implementation-status">{{ backend.status }}</p>
            <code class="terminal-hierarchy">{{ backend.hierarchy }}</code>
            <dl class="backend-properties">
              <div><dt>驻留与接管</dt><dd>{{ backend.lifetime }}</dd></div>
              <div><dt>目标寻址</dt><dd>{{ backend.addressing }}</dd></div>
            </dl>
            <Terminal :title="`${backend.name} · 输入与屏幕读取接口`" :lines="backend.lines" :play="false" />
            <p class="backend-boundary">{{ backend.boundary }}</p>
          </div>
        </div>
      </div>

      <div v-else class="hook-layout">
        <div class="hook-routes human-material">
          <div class="route-lane input-lane" aria-label="文字输入路径">
            <b>输入</b><span>飞书文字消息</span><ArrowRight :size="16" aria-hidden="true" />
            <span>WebSocket / bridge</span><ArrowRight :size="16" aria-hidden="true" />
            <span>定位 session / pane</span><ArrowRight :size="16" aria-hidden="true" /><span>原生 CLI</span>
          </div>
          <div class="route-lane feedback-lane" aria-label="Hook 反馈路径">
            <b>反馈</b><span>原生 CLI</span><ArrowRight :size="16" aria-hidden="true" />
            <span>Stop hook</span><ArrowRight :size="16" aria-hidden="true" />
            <span>共享回调</span><ArrowRight :size="16" aria-hidden="true" /><span>飞书文字与截图</span>
          </div>
          <p>终端可以收发字符，但没有统一的 agent 回合结束事件。反馈由各工具的原生 hook 触发。</p>
        </div>
        <div class="hook-explanation human-material">
          <div class="choice-group agent-choice" role="group" aria-label="已实现的 Hook 适配">
            <button v-for="(item, id) in ADAPTERS" :key="id" type="button"
              :aria-pressed="adapterId === id" @click="changeDetail('agent', id)">{{ item.name }}</button>
          </div>
          <dl class="hook-contract">
            <div><dt>注册位置</dt><dd><code>{{ adapter.location }}</code></dd></div>
            <div><dt>生效方式</dt><dd>{{ adapter.activation }}</dd></div>
            <div><dt>触发事件</dt><dd><code>{{ adapter.event }}</code></dd></div>
            <div><dt>回复来源</dt><dd>{{ adapter.source }}</dd></div>
            <div><dt>文本提取</dt><dd>{{ adapter.extraction }}</dd></div>
          </dl>
          <section class="shared-callback">
            <h3>取得文本后，走同一条回传路径</h3>
            <p>共享回调核对终端身份和待反馈记录，提取回复并捕获当前 pane；终端内容渲染为图片后，与回复文字一起发回对应聊天。</p>
            <p class="return-address"><code>chat_id / message_id</code> 来自入站消息，回信地址保存在本地记录中。</p>
          </section>
          <p class="adapter-scope">已实现：Claude Code、Kiro CLI。Codex 的反馈插件仍是扩展项。</p>
        </div>
        <article class="adapter-source human-material">
          <div class="choice-group code-choice" role="group" aria-label="Hook 示例">
            <button v-for="item in HOOK_VIEWS" :key="item.id" type="button"
              :aria-pressed="codeId === item.id" @click="changeDetail('code', item.id)">{{ item.label }}</button>
          </div>
          <div class="detail-motion">
            <p class="source-path">{{ example.location }}</p>
            <pre tabindex="0" role="region" :aria-label="`${adapter.name} ${HOOK_VIEWS.find(item => item.id === codeId).label}`"><code>{{ example.code }}</code></pre>
            <p class="adapter-explanation">{{ example.note }}</p>
          </div>
          <small>配置与 payload 为示意，提取逻辑按已实现的 adapter 简化。</small>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.human-scene { position: absolute; inset: 0; display: flex; flex-direction: column; padding: 76px 4.5vw 28px; letter-spacing: 0; }
.human-heading, .human-body { width: 100%; max-width: 1720px; margin-inline: auto; }
.human-heading { display: grid; grid-template-columns: 1fr auto; gap: 8px 30px; padding-bottom: 22px; flex-shrink: 0; }
.human-heading > p { grid-column: 1/-1; color: var(--accent); font: 13px var(--mono); }
h1 { font: 700 38px/1.4 var(--sans); min-height: 54px; }
.chapter-tabs { display: flex; gap: 4px; align-self: center; border-bottom: 1px solid var(--matrix-dim); }
.chapter-tabs button { border: 0; border-bottom: 2px solid transparent; padding: 12px 16px; background: none; color: var(--ink-soft); font: 15px var(--sans); cursor: pointer; }
.chapter-tabs button[aria-selected="true"] { color: var(--accent-soft); border-color: var(--accent); }
.human-body { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; scrollbar-gutter: stable; }
.remote-layout { display: grid; grid-template-columns: 360px minmax(0, 1fr); gap: 6vw; align-items: center; min-height: 100%; padding-block: 10px; }
.phone { width: 360px; border: 2px solid #345a3e; border-radius: 36px; padding: 12px; background: #050805; box-shadow: 0 20px 60px rgba(0,0,0,.4); }
.phone-notch { height: 14px; width: 95px; background: #14241a; border-radius: 10px; margin: 0 auto 10px; }
.phone-screen { background: #0b140e; border-radius: 23px; padding: 15px 12px 18px; overflow: hidden; }
.phone-top { display: flex; align-items: center; gap: 8px; font: 12px var(--mono); color: var(--ink-soft); padding: 0 3px 16px; }
.phone-top i { width: 6px; height: 6px; border-radius: 50%; background: var(--matrix); }
.phone-top small { margin-left: auto; font-size: 10px; }
.chat { display: flex; flex-direction: column; gap: 13px; }
.msg { text-align: left; border: 1px solid var(--matrix-dim); border-radius: 8px; color: var(--ink); font: 14px/1.8 var(--sans); padding: 11px 13px; background: rgba(0,255,65,.03); max-width: 94%; cursor: pointer; }
.msg.human { align-self: flex-end; border-color: rgba(217,119,87,.3); background: rgba(217,119,87,.06); }
.msg.agent, .msg.status { align-self: flex-start; }
.msg.status { font-size: 12px; color: var(--ink-soft); background: none; }
.msg.selected { border-color: var(--accent); box-shadow: 0 0 0 1px rgba(217,119,87,.2); }
.message-label { display: block; font: 11px/1.6 var(--mono); color: var(--ink-soft); margin-bottom: 6px; }
.voice-mark { display: flex; align-items: center; gap: 12px; margin: 8px 0 13px; color: var(--accent-soft); }
.voice-mark > span { font: 11px var(--sans); color: var(--ink-soft); }
.screen-preview { display: block; margin-top: 12px; padding: 10px 12px; background: #050b07; border-left: 2px solid var(--matrix-link); }
.screen-preview > span { display: flex; align-items: center; gap: 6px; color: var(--ink-soft); font: 10px var(--sans); margin-bottom: 9px; }
.screen-preview code { color: #9cbb9f; font: 11px/1.8 var(--mono); }
.native-work { min-width: 0; }
h2 { color: var(--ink); font: 650 25px/1.5 var(--sans); }
h3 { color: var(--matrix); font: 600 18px/1.6 var(--sans); }
.voice-reason { font-size: 28px; }
.voice-lead { color: var(--ink-soft); font: 17px/1.9 var(--sans); margin: 14px 0 30px; }
.native-heading { display: flex; justify-content: space-between; gap: 20px; margin-bottom: 13px; color: var(--accent-soft); font-size: 16px; }
.native-work :deep(.terminal-body) { height: 245px; max-height: 245px; font-size: 15px; }
.moment-detail { color: var(--ink-soft); font: 16px/1.9 var(--sans); min-height: 62px; margin-top: 20px; }
.voice-route { display: grid; grid-template-columns: 1fr 18px 1fr 18px 1fr; align-items: center; gap: 22px; margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--matrix-dim); color: var(--ink-soft); }
.voice-route > span { font: 16px/1.7 var(--sans); }
.voice-route small { display: block; margin-top: 5px; }
.voice-route > .active { color: var(--accent-soft); }
.voice-route svg { color: var(--matrix-link); }
.terminal-layout { display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1.1fr); gap: 64px; align-items: center; min-height: 100%; padding-block: 15px; }
.remote-options, .backend-work { min-width: 0; }
.official-options { margin-top: 20px; }
.official-options article { padding: 16px 0; border-bottom: 1px solid var(--matrix-dim); }
.official-options header { display: flex; justify-content: space-between; align-items: baseline; gap: 15px; }
.official-options a { display: inline-flex; align-items: center; gap: 8px; color: #a6dae6; font: 600 16px/1.6 var(--sans); text-decoration: none; }
.official-options a:hover { color: var(--accent-soft); }
.official-options header > span { color: var(--ink-soft); font: 12px/1.7 var(--mono); }
.official-options p { color: var(--ink-soft); font: 14px/1.9 var(--sans); margin-top: 8px; }
.terminal-rationale { margin-top: 24px; }
.terminal-rationale p { color: var(--ink-soft); font: 15px/1.9 var(--sans); margin-top: 10px; }
.backend-work { padding-left: 34px; border-left: 1px solid var(--matrix-dim); }
.backend-heading { display: flex; align-items: center; justify-content: space-between; gap: 18px; }
.backend-heading h2 { font-size: 22px; }
.choice-group { display: flex; gap: 4px; border-bottom: 1px solid var(--matrix-dim); }
.choice-group button { border: 0; border-bottom: 2px solid transparent; padding: 10px 13px; background: transparent; color: var(--ink-soft); font: 14px/1.5 var(--sans); cursor: pointer; white-space: nowrap; }
.choice-group button[aria-pressed="true"] { color: var(--accent-soft); border-bottom-color: var(--accent); }
.implementation-status { color: var(--accent-soft); font: 12px/1.7 var(--sans); margin: 20px 0 8px; }
.terminal-hierarchy { display: block; color: var(--matrix); font: 18px/1.8 var(--mono); }
.backend-properties { margin: 18px 0 24px; }
.backend-properties > div { display: grid; grid-template-columns: 78px minmax(0,1fr); gap: 14px; margin-top: 12px; }
.backend-properties dt { color: #a6dae6; font: 13px/1.8 var(--sans); }
.backend-properties dd { color: var(--ink-soft); font: 14px/1.8 var(--sans); }
.backend-work :deep(.terminal-body) { height: 218px; max-height: 218px; min-height: 0; font-size: 13px; }
.backend-boundary { color: var(--ink-soft); font: 13px/1.9 var(--sans); margin-top: 18px; min-height: 50px; }
.hook-layout { display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr); gap: 28px 52px; padding-block: 12px; min-height: 100%; align-content: center; }
.hook-routes { grid-column: 1/-1; }
.route-lane { display: grid; grid-template-columns: 55px minmax(0,1fr) 16px minmax(0,1.1fr) 16px minmax(0,1.1fr) 16px minmax(0,1fr); gap: 14px; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--matrix-dim); }
.route-lane b { font: 13px/1.6 var(--sans); color: var(--ink-soft); }
.route-lane > span { color: var(--matrix); font: 16px/1.7 var(--mono); }
.feedback-lane > span { color: var(--accent-soft); }
.route-lane svg { color: var(--matrix-link); }
.hook-routes > p { margin-top: 14px; color: var(--ink-soft); font: 14px/1.9 var(--sans); }
.hook-explanation { min-width: 0; }
.agent-choice { width: fit-content; margin-bottom: 18px; }
.hook-contract > div { display: grid; grid-template-columns: 70px minmax(0,1fr); gap: 14px; padding: 9px 0; }
.hook-contract dt { color: var(--ink-soft); font: 13px/1.8 var(--sans); }
.hook-contract dd { color: var(--ink); font: 14px/1.8 var(--sans); }
.hook-contract code { font: 13px/1.8 var(--mono); color: #a6dae6; overflow-wrap: anywhere; }
.shared-callback { margin-top: 20px; padding-top: 18px; border-top: 1px solid var(--matrix-dim); }
.shared-callback h3 { font-size: 17px; }
.shared-callback p { margin-top: 10px; color: var(--ink-soft); font: 14px/1.9 var(--sans); }
.shared-callback .return-address { font-size: 12px; }
.return-address code { color: #a6dae6; font-family: var(--mono); }
.adapter-scope { margin-top: 18px; color: var(--ink-soft); font: 12px/1.9 var(--sans); }
.adapter-source { border: 1px solid var(--matrix-dim); border-radius: 8px; background: rgba(5,8,6,.8); padding: 18px 24px; min-width: 0; align-self: start; }
.code-choice { margin-bottom: 20px; }
.source-path { color: var(--accent-soft); font: 12px/1.7 var(--mono); margin-bottom: 16px; }
pre { white-space: pre-wrap; overflow-wrap: anywhere; color: var(--ink); font: 14px/1.8 var(--mono); height: 275px; overflow: auto; scrollbar-gutter: stable; overscroll-behavior: contain; }
.adapter-explanation { color: var(--ink-soft); font: 14px/1.9 var(--sans); min-height: 54px; margin: 16px 0 12px; }
small { color: var(--ink-soft); font: 11px/1.7 var(--sans); }
button:focus-visible, a:focus-visible, pre:focus-visible, [role="tabpanel"]:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
@media (max-height: 950px) {
  .human-scene { padding-top: 66px; padding-bottom: 22px; }
  .human-heading { padding-bottom: 12px; }
  h1 { font-size: 32px; min-height: 45px; }
  .remote-layout { gap: 5vw; }
  .msg { padding: 9px 11px; font-size: 13px; }
  .chat { gap: 10px; }
  .voice-lead { margin-bottom: 22px; }
  .voice-reason { font-size: 25px; }
  .native-work :deep(.terminal-body) { height: 225px; max-height: 225px; }
  .official-options article { padding-block: 12px; }
  .terminal-layout { gap: 44px; }
  .hook-layout { gap: 20px 42px; padding-block: 5px; align-content: start; }
  .route-lane { padding-block: 9px; }
  .route-lane > span { font-size: 14px; }
  .hook-contract > div { padding-block: 7px; }
  .shared-callback { margin-top: 12px; padding-top: 12px; }
  .adapter-source { padding: 14px 20px; }
  pre { height: 250px; font-size: 13px; }
}
</style>
