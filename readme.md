# Как запустить

1) Клонируем
2) `docker compose up`
3) Открываем [http://localhost:8080](https://xxxxxxxx.org)

Как должно работать: [ссылка на видео](https://xxxxxxxx.org)

## Если не заработало

Запускаем последовательно отдельные части:

### 1) API (http://localhost:3002)
```
cd ../apps/api
npm i
npm run start
```

### 2) Panel (http://localhost:3001)
```
cd ../apps/panel
npm i
npm run dev
```

### 3) Client (http://localhost:3000)
```
cd ../apps/client
npm i
npm run dev
```

## Кроме того и еще

SFC Card.vue идентичен и в клинетской части и в панели. Результат сохраняется в yml-файл.