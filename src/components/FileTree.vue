<script setup>
import { computed } from 'vue'
import FileTreeNode from './FileTreeNode.vue'

/* 可复用的 IDE 风格文件树外壳(②③幕共用)。
 *  nodes:树形数组(见 FileTreeNode);step:当前步,逐步生长;title:窗口栏标题。 */
const props = defineProps({
  nodes: { type: Array, default: () => [] },
  step:  { type: Number, default: 99 },
  title: { type: String, default: 'PROJECT' },
  notes: { type: Boolean, default: true },   // 是否显示作用注释(Step1 关掉)
  interactive: { type: Boolean, default: false },
})
const emit = defineEmits(['select'])
const shown = computed(() => props.nodes.filter((n) => props.step >= (n.step ?? -1)))
</script>

<template>
  <div class="filetree">
    <div class="ft-bar"><i class="r"></i><i class="y"></i><i class="g"></i><span>{{ title }}</span></div>
    <div class="ft-body">
      <FileTreeNode v-for="(n, i) in shown" :key="n.name + i" :node="n" :step="step" :depth="0" :notes="notes"
        :interactive="interactive" @select="emit('select', $event)" />
    </div>
  </div>
</template>

<style scoped>
.filetree { width: 100%; text-align: left; background: rgba(5,8,6,.78); border: 1px solid var(--matrix-dim); border-radius: 10px; overflow: hidden; box-shadow: inset 0 0 70px rgba(0,255,65,.04); }
.ft-bar { display: flex; align-items: center; gap: 7px; padding: 9px 13px; border-bottom: 1px solid var(--matrix-dim); }
.ft-bar i { width: 10px; height: 10px; border-radius: 50%; background: #333; }
.ft-bar i.r { background: #ff5f56; } .ft-bar i.y { background: #ffbd2e; } .ft-bar i.g { background: #27c93f; }
.ft-bar span { margin-left: 8px; font-family: var(--mono); font-size: 12px; color: var(--ink-soft); letter-spacing: .05em; }
.ft-body { padding: 12px 8px; font-family: var(--mono); font-size: clamp(12px,1.15vw,15px); line-height: 1.5; max-height: 56vh; overflow-y: auto; }
</style>
