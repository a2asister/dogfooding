import { createStore } from 'vuex'

export default createStore({
  state: {
    folders: [],
    lists: [],
    selectedTasks: []
  },
  mutations: {
    SET_FOLDERS(state, folders) {
      state.folders = folders
    },
    ADD_FOLDER(state, folder) {
      state.folders.push(folder)
    },
    DELETE_FOLDER(state, folderId) {
      state.folders = state.folders.filter(f => f.id !== folderId)
    },
    SET_LISTS(state, lists) {
      state.lists = lists
    },
    ADD_LIST(state, list) {
      state.lists.push(list)
    },
    DELETE_LIST(state, listId) {
      state.lists = state.lists.filter(l => l.id !== listId)
    },
    TOGGLE_SELECTED_TASK(state, taskId) {
      const index = state.selectedTasks.indexOf(taskId)
      if (index === -1) {
        state.selectedTasks.push(taskId)
      } else {
        state.selectedTasks.splice(index, 1)
      }
    },
    CLEAR_SELECTED_TASKS(state) {
      state.selectedTasks = []
    },
    BATCH_SELECT_TASKS(state, taskIds) {
      state.selectedTasks = taskIds
    }
  },
  actions: {},
  modules: {}
})
