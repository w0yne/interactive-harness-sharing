<script setup>
import { onBeforeUnmount, ref } from 'vue'
import { RotateCcw } from 'lucide-vue-next'
import { TEAM_VIDEO as clip } from '../data/collaboration'

const video = ref(null)
const loaded = ref(false)
const failed = ref(false)
const base = import.meta.env.BASE_URL
let disposed = false

function pause() {
  video.value?.pause()
}

function metadata(event) {
  if (disposed || event.target !== video.value) return
  loaded.value = true
}

function seek(time) {
  if (loaded.value && video.value) video.value.currentTime = time
}

function retry() {
  failed.value = false
  loaded.value = false
  video.value?.load()
}

function mediaError(event) {
  if (!disposed && event.target === video.value) failed.value = true
}

onBeforeUnmount(() => {
  disposed = true
  pause()
  video.value?.removeAttribute('src')
  video.value?.load()
})
defineExpose({ pause })
</script>

<template>
  <section class="team-demo">
    <div class="demo-toolbar">
      <span class="clip-title">Kiro Agent Army</span>
      <span class="clip-description">{{ clip.duration }} · 实际录屏</span>
    </div>
    <div class="video-stage">
      <video ref="video" :src="`${base}${clip.src}`"
        :poster="`${base}media/team-demo-poster.jpg`" controls playsinline preload="metadata"
        aria-label="Kiro Agent Army 演示视频" @loadedmetadata="metadata"
        @error="mediaError">
        当前浏览器无法播放该视频。
      </video>
      <div v-if="failed" class="media-error" role="alert">
        <p>视频加载失败</p><button type="button" @click="retry"><RotateCcw :size="17" aria-hidden="true" />重新加载</button>
      </div>
    </div>
    <div class="video-cues" role="group" aria-label="视频关键位置">
      <button v-for="cue in clip.cues" :key="cue.time" type="button" :disabled="!loaded || failed" @click="seek(cue.time)">
        <span>{{ Math.floor(cue.time / 60) }}:{{ String(cue.time % 60).padStart(2, '0') }}</span>{{ cue.label }}
      </button>
    </div>
    <p class="demo-caption">多个 Kiro CLI 会话通过 tmux-mobile Team 通信，在共享工作区中交接需求、设计与产物。</p>
  </section>
</template>

<style scoped>
.team-demo { display: flex; flex-direction: column; height: 100%; min-height: 420px; min-width: 0; gap: 12px; }
.demo-toolbar { display: flex; justify-content: space-between; align-items: center; gap: 20px; flex-shrink: 0; }
.clip-title { color: var(--accent-soft); font: 14px/1.8 var(--mono); }
.clip-description, .demo-caption { color: var(--ink-soft); font: 12px/1.8 var(--sans); }
.video-stage { position: relative; flex: 1; min-height: 250px; container-type: size; overflow: hidden; }
video { display: block; width: min(100cqw, calc(100cqh * 16 / 9)); height: auto; aspect-ratio: 16 / 9; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); object-fit: contain; }
video:fullscreen { width: 100%; height: 100%; position: static; transform: none; }
.media-error { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; gap: 25px; background: rgba(5,8,7,.95); color: var(--ink); font: 16px var(--sans); }
.media-error button { display: inline-flex; align-items: center; gap: 8px; color: var(--accent-soft); border: 1px solid var(--accent); border-radius: 4px; padding: 9px 15px; background: none; cursor: pointer; }
.video-cues { display: flex; flex-wrap: wrap; gap: 10px 28px; flex-shrink: 0; }
.video-cues button { display: inline-flex; align-items: baseline; gap: 10px; padding: 4px 0; border: 0; background: none; color: #a6dae6; font: 13px/1.6 var(--sans); cursor: pointer; }
.video-cues span { color: var(--accent-soft); font: 12px var(--mono); }
button:disabled { opacity: .4; cursor: default; }
button:focus-visible, video:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
.demo-caption { flex-shrink: 0; }
</style>
