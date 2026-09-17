<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { FileText } from 'lucide-vue-next'
import { marked } from 'marked'

const props = defineProps({
  document: { type: Object, required: true },
  references: { type: Array, default: () => [] },
  showUsage: { type: Boolean, default: true },
})
defineEmits(['select'])
const reader = ref(null)
const content = computed(() => marked.parse(props.document.body))
watch(() => props.document.id, async () => {
  await nextTick()
  if (reader.value) reader.value.scrollTop = 0
})
</script>

<template>
  <article class="knowledge-document">
    <header class="record-heading">
      <p>{{ document.type }} <span>{{ document.time || '持续维护' }}</span></p>
      <h2>{{ document.title }}</h2>
    </header>
    <div class="document-window">
      <div class="document-bar">
        <code>{{ document.path }}</code>
        <span>{{ document.snapshot ? '时点快照 · 示意' : '示意文档' }}</span>
      </div>
      <div ref="reader" class="record-text" tabindex="0" role="region"
        :aria-label="`${document.file} 正文`" v-html="content"></div>
    </div>
    <dl v-if="showUsage" class="document-usage">
      <div><dt>AI 写入</dt><dd>{{ document.write }}</dd></div>
      <div><dt>AI 读取</dt><dd>{{ document.read }}</dd></div>
    </dl>
    <div v-if="references.length" class="document-references">
      <span>引用</span>
      <button v-for="item in references" :key="item.id" type="button"
        :title="item.path" @click="$emit('select', item.id)">
        <FileText :size="13" aria-hidden="true" />{{ item.short }}
      </button>
    </div>
  </article>
</template>

<style scoped>
.knowledge-document { min-width: 0; }
.record-heading { margin-bottom: 14px; }
.record-heading > p { font: 12px/1.6 var(--mono); color: var(--accent-soft); display: flex; flex-wrap: wrap; gap: 8px 15px; margin-bottom: 5px; }
.record-heading > p span { color: var(--ink-soft); }
h2 { color: var(--ink); font: 650 23px/1.5 var(--sans); }
.document-window { border: 1px solid var(--matrix-dim); border-radius: 6px; overflow: hidden; background: rgba(3,8,5,.82); }
.document-bar { display: flex; justify-content: space-between; align-items: baseline; gap: 14px; border-bottom: 1px solid var(--matrix-dim); padding: 11px 15px; }
.document-bar code { color: #a6dae6; font: 12px/1.6 var(--mono); overflow-wrap: anywhere; min-width: 0; }
.document-bar > span { color: var(--ink-soft); font: 10px/1.7 var(--sans); flex-shrink: 0; }
.record-text { height: 230px; overflow: auto; scrollbar-gutter: stable; overscroll-behavior: contain; scrollbar-color: var(--matrix-dim) transparent; padding: 16px 18px 24px; color: var(--ink); font: 14px/1.85 var(--sans); overflow-wrap: anywhere; }
.record-text :deep(h1), .record-text :deep(h2) { font: 600 16px/1.6 var(--sans); color: var(--matrix); margin-bottom: 12px; }
.record-text :deep(h2) { font-size: 14px; margin-top: 17px; }
.record-text :deep(p) { margin-bottom: 10px; }
.record-text :deep(ul) { padding-left: 20px; margin: 8px 0; }
.record-text :deep(li) { margin-bottom: 7px; }
.record-text :deep(code) { font: 13px var(--mono); color: #a6dae6; }
.document-usage { margin-top: 16px; }
.document-usage > div { display: grid; grid-template-columns: 66px minmax(0,1fr); gap: 10px; margin-top: 9px; }
.document-usage dt { color: var(--matrix); font: 12px/1.8 var(--mono); }
.document-usage dd { color: var(--ink-soft); font: 13px/1.8 var(--sans); }
.document-references { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 14px; margin-top: 14px; padding-top: 11px; border-top: 1px solid var(--matrix-dim); }
.document-references > span { color: var(--ink-soft); font: 12px var(--sans); }
.document-references button { display: inline-flex; align-items: center; gap: 5px; padding: 3px 0; color: #a6dae6; font: 12px/1.7 var(--sans); border: 0; border-bottom: 1px solid var(--matrix-dim); background: none; cursor: pointer; }
.document-references button:hover { color: var(--accent-soft); }
button:focus-visible, .record-text:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; }
@media (min-height: 1000px) {
  .record-text { height: 290px; font-size: 15px; }
  .document-usage dd { font-size: 14px; }
}
</style>
