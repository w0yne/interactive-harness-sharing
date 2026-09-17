<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

/* 黑客帝国竖排代码雨:固定背景层、≤10% ambient。用户确认保留的两点之一。
 * 它固定在视口、不随摄像机移动 → 作恒定的"世界氛围"。语料脱敏(无客户/partner 名)。*/
const canvas = ref(null)
let raf = 0, running = true, onResize = null

const SRC =
  'claude CLAUDE.md /compact /handoff /goal /loop git aws-developer Closes#N ' +
  'terraform validate apply ECS memory MEMORY.md tech-notes aidlc immutable ' +
  'replay offset fold append-only ultracode tmux send-keys Stop-hook {}<>/#:= partner'
const CHARS = Array.from(new Set(SRC.replace(/\s+/g, '').split(''))).filter(Boolean)
const rc = () => CHARS[(Math.random() * CHARS.length) | 0]

onMounted(() => {
  const cv = canvas.value
  const ctx = cv.getContext('2d')
  let W = 0, H = 0, fontSize = 18, colW = 24, drops = [], speeds = []
  const resize = () => {
    W = cv.width = window.innerWidth; H = cv.height = window.innerHeight
    fontSize = Math.max(14, Math.round(W / 95)); colW = Math.round(fontSize * 1.25)
    const n = Math.ceil(W / colW)
    drops = Array.from({ length: n }, () => Math.random() * -40)
    speeds = Array.from({ length: n }, () => 0.12 + Math.random() * 0.18)
  }
  const draw = () => {
    raf = requestAnimationFrame(draw)
    if (!running) return
    ctx.fillStyle = 'rgba(10,14,10,0.10)'; ctx.fillRect(0, 0, W, H)
    ctx.font = fontSize + 'px ui-monospace, monospace'; ctx.textAlign = 'center'
    for (let i = 0; i < drops.length; i++) {
      const x = i * colW + colW / 2, y = Math.floor(drops[i]) * fontSize
      if (y > 0 && y < H + fontSize) {
        ctx.fillStyle = Math.random() > 0.975 ? '#9effb0' : (Math.random() > 0.9 ? '#00FF41' : '#0d6b2e')
        ctx.fillText(rc(), x, y)
      }
      drops[i] += speeds[i]
      if (y > H && Math.random() > 0.975) { drops[i] = Math.random() * -20; speeds[i] = 0.12 + Math.random() * 0.18 }
    }
  }
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  resize(); onResize = resize; window.addEventListener('resize', resize)
  if (!reduce) draw()
  else { ctx.font = fontSize + 'px ui-monospace, monospace'; ctx.textAlign = 'center'; ctx.fillStyle = '#0d6b2e'; for (let i = 0; i < drops.length; i++) for (let r = 2; r < H / fontSize; r += 4) if (Math.random() > 0.7) ctx.fillText(rc(), i * colW + colW / 2, r * fontSize) }
})
onUnmounted(() => { cancelAnimationFrame(raf); if (onResize) window.removeEventListener('resize', onResize) })
</script>

<template>
  <canvas ref="canvas" id="rain"></canvas>
</template>
