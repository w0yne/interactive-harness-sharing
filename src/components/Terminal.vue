<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { gsap } from 'gsap'

/* 非执行终端展示。
 *  - 窗口栏:红黄绿灯 + 标题。body 内逐行"打字机"输出,自动滚到底,像真终端。
 *  - lines:[{ prompt?, k?, t, type?, hl? }] —— k 是行类型(cmd/out/err/ok/cmt/str/kw),
 *      type=true 走逐字打字;hl=true 出现时陶土高亮闪一下。
 *  - play prop 由 false→true 触发播放;reduced-motion 直接静态铺出。
 *  这是 UI 假体(展示用),不接真实 shell。 */
const props = defineProps({
  title: { type: String, default: '~/project — claude' },
  lines: { type: Array, default: () => [] },
  play:  { type: Boolean, default: true },
  cps:   { type: Number, default: 52 },
  // 待命态:还没开跑时,显示 Claude Code 等待输入的样子(输入框 + > + 闪烁光标)
  idle:        { type: Boolean, default: false },
  idlePlaceholder: { type: String, default: '等待消息…  (飞书语音将注入到这里)' },
})
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const bodyRef = ref(null)
let tl = null
const typingCalls = new Set()
let playbackVersion = 0
let disposed = false

function stop() {
  playbackVersion += 1
  tl?.kill()
  tl = null
  typingCalls.forEach(call => call.kill())
  typingCalls.clear()
}

function typeText(el, text, cps, version) {
  let i = 0
  const step = () => {
    if (disposed || version !== playbackVersion) return
    i += 1
    el.textContent = text.slice(0, i)
    if (i < text.length) {
      const call = gsap.delayedCall(1 / cps, () => {
        typingCalls.delete(call)
        step()
      })
      typingCalls.add(call)
    }
  }
  step()
}

function renderStatic() {
  stop()
  if (disposed) return
  const body = bodyRef.value; if (!body) return
  body.innerHTML = ''
  props.lines.forEach((L) => {
    const ln = document.createElement('span'); ln.className = 'ln'
    if (L.prompt) { const p = document.createElement('span'); p.className = 'prompt'; p.textContent = L.prompt + ' '; ln.appendChild(p) }
    const t = document.createElement('span'); t.className = L.k || 'out'; t.textContent = L.t
    ln.appendChild(t); body.appendChild(ln)
  })
}

function run() {
  stop()
  if (disposed) return
  const body = bodyRef.value; if (!body) return
  body.innerHTML = ''
  if (reduce) { renderStatic(); return }
  const version = playbackVersion
  tl = gsap.timeline()
  const autoscroll = () => { body.scrollTop = body.scrollHeight }
  tl.eventCallback('onUpdate', autoscroll)
  props.lines.forEach((L) => {
    const ln = document.createElement('span'); ln.className = 'ln'
    if (L.prompt) { const p = document.createElement('span'); p.className = 'prompt'; p.textContent = L.prompt + ' '; ln.appendChild(p) }
    const t = document.createElement('span'); t.className = L.k || 'out'
    if (!L.type) t.textContent = L.t
    ln.appendChild(t); body.appendChild(ln)
    gsap.set(ln, { autoAlpha: 0, y: 6 })
    tl.to(ln, { autoAlpha: 1, y: 0, duration: 0.2 })
    if (L.type) { tl.add(() => typeText(t, L.t, props.cps, version)); tl.to({}, { duration: Math.min(1.1, L.t.length / props.cps + 0.15) }) }
    if (L.hl) tl.fromTo(ln, { backgroundColor: 'rgba(217,119,87,.18)' }, { backgroundColor: 'rgba(0,0,0,0)', duration: 0.8 })
    tl.to({}, { duration: 0.12 })
  })
}

watch([() => props.play, () => props.lines], () => { if (props.play) run(); else renderStatic() })
onMounted(() => { if (props.play) run(); else renderStatic() })
onUnmounted(() => { disposed = true; stop() })
defineExpose({ run })
</script>

<template>
  <div class="terminal">
    <div class="terminal-bar"><i class="r"></i><i class="y"></i><i class="g"></i><span>{{ title }}</span></div>
    <!-- 待命态的占位展示。 -->
    <div v-if="idle" class="terminal-idle">
      <div class="idle-box">
        <span class="idle-prompt">&gt;</span>
        <span class="idle-ph">{{ idlePlaceholder }}</span>
        <span class="idle-cursor"></span>
      </div>
      <div class="idle-hint">⏸ idle · tmux 会话持续驻留,等待下一条指令</div>
    </div>
    <!-- 逐行展示预置文本。 -->
    <div v-show="!idle" class="terminal-body" ref="bodyRef"></div>
  </div>
</template>

<style scoped>
.terminal { width: 100%; text-align: left; background: var(--bg-deep, #05070a); border: 1px solid var(--matrix-dim); border-radius: 10px; overflow: hidden;
  box-shadow: 0 0 60px rgba(0,255,65,.06), inset 0 0 80px rgba(0,0,0,.4); }
.terminal-bar { display: flex; align-items: center; gap: 7px; padding: 10px 14px; border-bottom: 1px solid var(--matrix-dim); }
.terminal-bar i { width: 11px; height: 11px; border-radius: 50%; display: inline-block; background: #333; }
.terminal-bar i.r { background: #ff5f56; } .terminal-bar i.y { background: #ffbd2e; } .terminal-bar i.g { background: #27c93f; }
.terminal-bar span { margin-left: 8px; font-family: var(--mono); font-size: 12px; color: var(--ink-soft); }
.terminal-body { padding: 18px 20px; font-family: var(--mono); font-size: clamp(12px,1.1vw,15px); line-height: 1.7; min-height: 200px; max-height: 46vh; overflow-y: auto; }

/* 待命态:Claude Code 等待输入的样子 */
.terminal-idle { padding: 26px 20px; min-height: 200px; display: flex; flex-direction: column; gap: 16px; justify-content: center; }
.idle-box { display: flex; align-items: center; gap: 10px; border: 1px solid var(--matrix-dim); border-radius: 10px; padding: 14px 16px; background: rgba(0,255,65,.03); }
.idle-prompt { font-family: var(--mono); font-size: clamp(14px,1.4vw,18px); color: var(--matrix); font-weight: 700; }
.idle-ph { font-family: var(--mono); font-size: clamp(12px,1.1vw,15px); color: var(--ink-soft); opacity: .6; }
.idle-cursor { width: 9px; height: 1.1em; background: var(--matrix); margin-left: -4px; animation: blink 1.05s step-end infinite; box-shadow: 0 0 8px rgba(0,255,65,.5); }
@keyframes blink { 0%,50% { opacity: 1; } 50.01%,100% { opacity: 0; } }
.idle-hint { font-family: var(--mono); font-size: clamp(10px,1vw,13px); color: var(--ink-soft); opacity: .5; }
.terminal-body :deep(.ln) { display: block; white-space: pre-wrap; word-break: break-word; }
.terminal-body :deep(.prompt) { color: var(--matrix); }
.terminal-body :deep(.cmd) { color: var(--ink); }
.terminal-body :deep(.out) { color: var(--ink-soft); }
.terminal-body :deep(.err) { color: var(--accent); }
.terminal-body :deep(.ok)  { color: var(--matrix); }
.terminal-body :deep(.cmt) { color: #5a7d7d; }
.terminal-body :deep(.kw)  { color: var(--accent); font-weight: 600; }
.terminal-body :deep(.str) { color: #b6d97d; }
</style>
