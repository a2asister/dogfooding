import RichTextEditor from './RichTextEditor.vue'

export { RichTextEditor }

export default {
  install(app) {
    app.component('RichTextEditor', RichTextEditor)
  }
}
