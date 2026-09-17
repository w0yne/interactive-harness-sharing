<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { gsap } from 'gsap'
defineEmits(['overview', 'restart'])
const root = ref(null)
const media = window.matchMedia('(prefers-reduced-motion: reduce)')
let motion
const notes = [
  { name: 'SOUL.md', text: '共用一份项目规则，明确授权，保留模型的判断空间。' },
  { name: '项目文件', text: '分别维护历史、当前事实和待办，使下一会话有据可查。' },
  { name: '人 ↔ agent', text: '及时确认重要取舍，按具体版本的变更和检查记录验收。' },
  { name: 'TASK / RESULT', text: '按任务需要分配能力，通过文件交接，用消息协调。' },
]
function motionChanged() {
  if (media.matches) motion?.revert()
}
onMounted(() => {
  media.addEventListener('change', motionChanged)
  motion = gsap.context(() => {
    if (media.matches) return
    gsap.fromTo('.closing-line', { autoAlpha: 0, y: 18 }, {
      autoAlpha: 1, y: 0, duration: .7, ease: 'power3.out', stagger: .18,
    })
  }, root.value)
})
onUnmounted(() => {
  motion?.revert()
  media.removeEventListener('change', motionChanged)
})
</script>

<template>
  <section class="closing-scene" ref="root">
    <p class="closing-line eyebrow">Harness Engineering</p>
    <h2 class="closing-line">四项设计取舍</h2>
    <dl class="closing-notes">
      <div class="closing-line" v-for="note in notes" :key="note.name"><dt>{{ note.name }}</dt><dd>{{ note.text }}</dd></div>
    </dl>
    <p class="closing-line closing-thought">单次短任务可以保持简单。跨会话、跨工具或多人协作时，<br>再根据交接与复核的需要增加机制。</p>
    <footer class="closing-line"><span>Q&A</span><div><button @click="$emit('overview')">回到总览</button><button @click="$emit('restart')">回标题</button></div></footer>
  </section>
</template>

<style scoped>
.closing-scene { height: 100%; width: min(1320px, 90%); margin: auto; padding: 92px 50px 36px; display: flex; flex-direction: column; justify-content: center; letter-spacing: 0; overflow: auto; }
.eyebrow { font: 15px var(--mono); color: var(--accent); margin-bottom: 22px; }
h2 { font: 700 43px/1.45 var(--sans); color: var(--ink); margin-bottom: 32px; }
.closing-notes { display: grid; grid-template-columns: 1fr 1fr; gap: 18px 52px; }
.closing-notes div { padding: 16px 0; border-top: 1px solid var(--matrix-dim); }
dt { font: 17px/1.6 var(--mono); color: var(--matrix); margin-bottom: 8px; }
dd { font-size: 17px; color: var(--ink-soft); }
.closing-thought { color: var(--accent-soft); font-size: 19px; line-height: 1.9; margin-top: 28px; }
footer { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-top: 30px; }
footer > span { font: 25px var(--mono); color: var(--accent); }
footer div { display: flex; gap: 24px; }
button { background: none; color: var(--ink-soft); border: 0; border-bottom: 1px solid var(--matrix-dim); padding: 8px 0; font: 15px var(--sans); cursor: pointer; }
button:hover { color: var(--ink); border-color: var(--accent); }
button:focus-visible { outline: 2px solid var(--accent); outline-offset: 5px; }
@media (max-height: 950px) { .closing-scene { padding-top: 70px; } h2 { font-size: 38px; margin-bottom: 22px; }.closing-notes div { padding: 11px 0; }.closing-thought { margin-top: 20px; } }
</style>
