import type { Directive, DirectiveBinding } from 'vue'

interface ScrollAnimateOptions {
  threshold?: number
  rootMargin?: string
  once?: boolean
  animation?: 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'zoom-in' | 'flip-x' | 'flip-y'
  delay?: number
}

const observerMap = new WeakMap<Element, IntersectionObserver>()

const scrollAnimate: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding<ScrollAnimateOptions | string>) {
    const options = typeof binding.value === 'string' 
      ? { animation: binding.value as ScrollAnimateOptions['animation'] }
      : binding.value || {}

    const {
      threshold = 0.1,
      rootMargin = '0px 0px -50px 0px',
      once = true,
      animation = 'fade-up',
      delay = 0
    } = options

    el.classList.add('scroll-animate', `animate-${animation}`)

    if (delay > 0) {
      el.style.transitionDelay = `${delay}ms`
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add('is-visible')
            if (once) {
              observer.unobserve(el)
            }
          } else if (!once) {
            el.classList.remove('is-visible')
          }
        })
      },
      { threshold, rootMargin }
    )

    observer.observe(el)
    observerMap.set(el, observer)
  },

  unmounted(el: HTMLElement) {
    const observer = observerMap.get(el)
    if (observer) {
      observer.disconnect()
      observerMap.delete(el)
    }
  }
}

export default scrollAnimate
