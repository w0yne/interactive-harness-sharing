import { createApp } from 'vue'
import App from './App.vue'
import './styles/tokens.css'
import './styles/app.css'

// 只用 gsap core(摄像机 = tween #world 的 transform);不需要 ScrollTrigger/Flip。
import { gsap } from 'gsap'
gsap.defaults({ ease: 'power3.out' })

createApp(App).mount('#app')
