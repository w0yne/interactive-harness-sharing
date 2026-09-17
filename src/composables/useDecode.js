import { gsap } from 'gsap'

/* ============================================================================
 * useDecode — 黑客帝国"解码"文字效果:从随机字符 scramble → 凝结成真实文字。
 * Operator 从乱码里"读"出意义的视觉化。用于:节点标题凝现、房间标题解码而出。
 * 不依赖 GSAP 付费插件(ScrambleText),手写一个轻量版即可。
 * ==========================================================================*/

const GLYPHS = 'ｱｲｳｴｵｶｷｸ01<>/{}#:=$_ABCDEF0123456789日code'

const rnd = () => GLYPHS[(Math.random() * GLYPHS.length) | 0]

/* 把 el.textContent 从乱码解码成 final。
 * 逐位"锁定":随进度 p,前 p×len 个字符锁成真值,其余持续滚动乱码。 */
export function decodeText(el, final, { duration = 0.9, delay = 0 } = {}) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce) { el.textContent = final; return gsap.timeline() }
  const chars = Array.from(final)
  const n = chars.length
  const state = { p: 0 }
  return gsap.to(state, {
    p: 1, duration, delay, ease: 'power2.out',
    onUpdate: () => {
      const locked = Math.floor(state.p * n)
      let out = ''
      for (let i = 0; i < n; i++) {
        if (chars[i] === ' ' || chars[i] === '\n') { out += chars[i]; continue }
        out += i < locked ? chars[i] : rnd()
      }
      el.textContent = out
    },
    onComplete: () => { el.textContent = final },
  })
}

/* 对一个容器内带 data-decode 的元素批量解码(stagger)。返回 timeline。 */
export function decodeAll(root, { stagger = 0.08, duration = 0.8 } = {}) {
  const els = Array.from(root.querySelectorAll('[data-decode]'))
  const tl = gsap.timeline()
  els.forEach((el, i) => {
    const final = el.getAttribute('data-decode') || el.textContent
    tl.add(decodeText(el, final, { duration }), i * stagger)
  })
  return tl
}
