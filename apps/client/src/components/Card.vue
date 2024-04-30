<script setup>
import { ref, defineAsyncComponent, onMounted } from 'vue'
import { compileStyle } from '@vue/compiler-sfc'

const baseURL = import.meta.env.VITE_API_URL || '';

const props = defineProps({
  productId: {
    type: String,
    required: true
  },
  mode: {
    type: String,
    default: 'default'
  },
  data: {
    type: Object,
    default: () => ({})
  },
  template: {
    type: String,
    default: ''
  },
  css: {
    type: String,
    default: ''
  }
})

const cardData = ref({
  card_title: '',
  img_src: '',
  card_text: ''
})
const templateDefault = `
  <div class="defaut-card">
    <div class="defaut-card__img-wrap">
      <img :src="cardData.img_src" class="defaut-card__img" />
    </div>
    <h2 class="defaut-card__title">{{ cardData.card_title }}</h2>
    <p class="defaut-card__text">{{ cardData.card_text }}</p>
  </div>
`;
const dataUrlList = props.mode === 'editor' ?
      [] :
      [
        `${baseURL}/api/v1/cards/${props.productId}`,
        `${baseURL}/api/v1/card-template`,
      ]

const dataLoaded = ref(false)
const cmpRef = ref(null)

const cmp = defineAsyncComponent(
  () => {
    return new Promise((resolve) => {
      Promise.all(dataUrlList.map(url => fetch(url).then(resp => resp.json())))
        .then(data => {
          cardData.value = props.mode === 'editor' ? props.data : data[0]
          dataLoaded.value = true
          resolve({
            template: (props.mode === 'editor' ? props.template : data[1].template) || templateDefault,
            setup() {
              onMounted(() => {
                const el = cmpRef.value.$el;
                const scopeId = el.getAttributeNames().find(attr => attr.startsWith('data-v-')).replace('data-v-', '');
                el.querySelectorAll('*').forEach(el => el.setAttribute(`data-v-${scopeId}`, ''))
                const style = document.createElement('style')
                const { code } = compileStyle({
                  source: props.mode === 'editor' ? props.css : data[1].css,
                  id: scopeId,
                  scoped: true
                })
                style.textContent = code
                document.head.appendChild(style)
              })
              return { cardData }
            }
          })
        })
        .catch(error => {
          console.error('Error:', error)
        })
    })
  }
)
</script>

<template>
  <cmp ref="cmpRef" />
</template>

<style scoped>
  .defaut-card {
    position: relative;
    max-width: 450px;
    width: 100%;
    background-color: #fafafa;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 0 60px #0003444d;
  }
  .defaut-card__img-wrap {
    position: relative;
    width: 100%;
    height: 300px;
    background-color: #666;
  }
  .defaut-card__img {
    position: absolute;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .defaut-card__title {
    color: hotpink;
    font-weight: 500;
    margin: 16px 0 10px 0;
  }
  .defaut-card__text {
    color: #666;
    font-size: 16px;
    line-height: 1.2;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
  }
  .defaut-card__button-wrap {
    display: flex;
    justify-content: center;
    margin-top: 16px;
  }
  .defaut-card__button {
    position: absolute;
    bottom: -80px;
    padding: 10px 20px;
    background-color: #3139fb;
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  .defaut-card__button:hover {
    background-color: #1f24b8;
  }
</style>