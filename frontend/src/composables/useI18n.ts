import { ref, computed } from 'vue'
import zhCN from '../locales/zh-CN'
import enUS from '../locales/en-US'

type Locale = 'zh-CN' | 'en-US'

const locales: Record<Locale, typeof zhCN> = {
  'zh-CN': zhCN,
  'en-US': enUS
}

const currentLocale = ref<Locale>((localStorage.getItem('locale') as Locale) || 'zh-CN')
const messages = ref(locales[currentLocale.value])

export function useI18n() {
  const locale = computed(() => currentLocale.value)
  const t = computed(() => messages.value)

  const setLocale = (newLocale: Locale): void => {
    currentLocale.value = newLocale
    messages.value = locales[newLocale]
    localStorage.setItem('locale', newLocale)
    document.documentElement.lang = newLocale
  }

  const toggleLocale = (): void => {
    const newLocale: Locale = currentLocale.value === 'zh-CN' ? 'en-US' : 'zh-CN'
    setLocale(newLocale)
  }

  return {
    locale,
    t,
    setLocale,
    toggleLocale
  }
}
