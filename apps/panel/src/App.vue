<script setup>
import { ref, computed, h } from 'vue'
import { compileTemplate } from '@vue/compiler-sfc'
import Codemirror from "codemirror-editor-vue3"
import 'codemirror/mode/css/css.js'
import 'codemirror/mode/htmlmixed/htmlmixed.js'
import Card from './components/Card.vue'

const baseURL = import.meta.env.VITE_API_URL || ''
const template = ref('')
const validTemplate = ref('')
const isInvalidTemplate = ref(false)
const css = ref('')
const ts = ref(0)
const updateKey = ref(Date.now())
const cardData = ref({})
const loaded = ref(false)

const dataUrlList = [
  `${baseURL}/api/v1/card-template`,
  `${baseURL}/api/v1/cards/1`,
]

Promise.all(dataUrlList.map(url => fetch(url).then(resp => resp.json())))
  .then(data => {
    template.value = data[0].template
    validTemplate.value = data[0].template
    css.value = data[0].css
    ts.value = data[0].ts
    cardData.value = data[1]
    loaded.value = true
  })
  .catch(error => {
    console.error('Error:', error)
  })

// === Editor options, logic... ===

const tabs = ['Template', 'CSS']
const activeTab = ref('Template')
const editorCode = computed({
  get() {
    return activeTab.value === 'Template' ? template.value : css.value
  },
  set(value) {
    if (activeTab.value === 'Template') {
      template.value = value

    } else {
      css.value = value
    }
  }
})

const editorOptions = {
  mode: 'css',
  theme: 'default',
  indentUnit: 2,
  tabSize: 2,
  indentWithTabs: false,
}

let timerId = 0

const validateTemplate = (html) => {
  const cmp = compileTemplate({
    source: html,
    id: 'templateValidate',
  })
  const doubleQuotesInsideTags = html.match(/<([^>]+?)(""|'')(.*?)>/gm)
  return cmp.errors.length === 0 && !doubleQuotesInsideTags
}

const changeCode = () => {
  clearTimeout(timerId)
  timerId = setTimeout(() => {
    if (activeTab.value === 'Template') {
      if (validateTemplate(template.value)) {
        validTemplate.value = template.value
        isInvalidTemplate.value = false
      } else {
        isInvalidTemplate.value = true
      }
    }
    updateKey.value = Date.now()
  }, 333)
}

const saveInProgress = ref(false)
const showSaveMessage = ref(false)

const save = () => {
  saveInProgress.value = true
  fetch(`${baseURL}/api/v1/card-template`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      template: template.value,
      css: css.value,
    })
  })
    .then(response => response.json())
    .then(data => {
      updateKey.value = Date.now()
      showSaveMessage.value = true
      setTimeout(() => {
        showSaveMessage.value = false
      }, 2000)
      setTimeout(() => {
        saveInProgress.value = false
      }, 300)
    })
    .catch((error) => {
      console.error('Error:', error)
    })
}
</script>

<template>
  <main class="main-container" :class="{ 'save-in-progress': saveInProgress }">
    <section class="editor-container">
      <header class="editor-header">
        <section class="editor-tabs">
          <button
            v-for="tab in tabs"
            :key="tab"
            class="tab"
            :class="{ 'tab__active': activeTab === tab }"
            @click="activeTab = tab"
          >
            {{ tab }}
          </button>
        </section>
        <section v-if="loaded" class="save-button-wrap">
          <span class="save-message" :class="{ 'save-message__active': showSaveMessage }">Saved!</span>
          <span class="save-message save-message_error" :class="{ 'save-message__active': isInvalidTemplate }">Invalid template!</span>
          <button class="save-button" :disabled="isInvalidTemplate" @click="save">Save</button>
        </section>
      </header>
      <div class="editor-wrap">
        <Codemirror
          v-model:value="editorCode"
          :options="editorOptions"
          :border="false"
          class="editor"
          @change="changeCode"
        />
      </div>
    </section>
    <section class="preview">
      <Card
        v-if="loaded"
        product-id="1"
        mode="editor"
        :data="cardData"
        :template="validTemplate"
        :css="css"
        :ts="ts"
        :key="updateKey"
      />
    </section>
  </main>
</template>

<style scoped>
  .main-container {
    padding: 40px;
    position: relative;
    display: grid;
    min-height: 100vh;
    background-color: #fffcec;
    box-sizing: border-box;
    grid-template-columns: 1fr 600px;
  }
  @media (max-width: 1350px) {
    .main-container {
      grid-template-columns: 1fr;
    }
  }
  @media (max-width: 768px) {
    .main-container {
      padding: 20px;
    }
  }
  .save-in-progress {
    pointer-events: none;
  }
  .editor-container {
    display: grid;
    padding: 40px;
    background-color: hotpink;
    grid-template-rows: auto 1fr;
  }
  @media (max-width: 1350px) {
    .editor-container {
      min-height: 400px;
    }
  }
  @media (max-width: 768px) {
    .editor-container {
      padding: 20px;
    }
  }
  .editor-header {
    position: relative;
    background-color: #e8e8e8f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  @media (max-width: 768px) {
    .editor-header {
      font-size: 14px;
    }
  }
  .editor-wrap {
    position: relative;
    background-color: #f0f0f0;
    box-shadow: 0 0 20px #b7b7b74d;
  }
  .editor {
    position: absolute;
    top: 0; left: 0;
    width: 100%;
    height: 100%;
    font-size: 18px;
  }
  @media (max-width: 768px) {
    .editor {
      font-size: 14px;
    }
  }
  .preview {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    box-sizing: border-box;
    background-color: #f0f0f0;
    background-color: lightblue;
  }
  .tab {
    padding: 10px 20px;
    background-color: #f0f0f0;
    border: none;
    cursor: pointer;
    font-weight: 500;
    transition: color 0.2s;
  }
  .tab:hover {
    color: #3139fb;
  }
  .tab__active {
    background-color: #fff;
  }
  .save-button-wrap {
    position: relative;
    display: flex;
    height: 100%;
  }
  .save-message {
    position: absolute;
    right: 100%;
    top: 50%;
    transform: translateY(-50%);
    margin-right: 20px;
    display: flex;
    align-items: center;
    color: #3139fb;
    font-weight: 500;
    opacity: 0;
    transition: opacity 0.4s ease;
    white-space: nowrap;
  }
  @media (max-width: 768px) {
    .save-message {
      top: 100%;
      right: 0;
      margin-right: 0;
      z-index: 1;
      background: bisque;
      padding: 5px 10px;
      transform: translate(0, 0);
      min-width: 70px;
      justify-content: center;
    }
  }
  .save-message_error {
    color: red;
  }
  .save-message__active {
    opacity: 1;
  }
  .save-button {
    padding: 0 20px;
    background-color: #3139fb;
    color: #fff;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  .save-button:hover {
    background-color: #1f25b0;
  }
  .save-button:disabled {
    background-color: #ccc;
    cursor: default;
  }
  .code textarea {
    width: 100%;
  }
</style>

