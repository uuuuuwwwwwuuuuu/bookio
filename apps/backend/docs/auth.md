# Backend — авторизация (Better Auth)

Бэкенд на [Hono](https://hono.dev/) с авторизацией через [Better Auth](https://www.better-auth.com/).  
Все auth-эндпоинты смонтированы на `/api/auth/*`.

## Как устроено

1. **`src/auth.ts`** — конфигурация Better Auth:
    - провайдер: email + password;
    - БД: PostgreSQL через Drizzle adapter (`@bookio/db`);
    - таблицы: `users`, `sessions`, `accounts`, `verifications`;
    - ID генерируются на стороне БД (UUID v7), не Better Auth.

2. **`src/index.ts`** — маршрут `POST|GET /api/auth/*` проксирует запросы в `auth.handler()`.  
   Для auth включён CORS с `credentials: true` — клиент должен отправлять cookies.

3. **Сессии** — cookie-based. После входа сервер выставляет session cookie; последующие запросы аутентифицируются автоматически.  
   Срок жизни сессии по умолчанию — 7 дней (настройки Better Auth).

## Переменные окружения

Скопируй `.env.example` в `.env`:

| Переменная           | Описание                                                         |
| -------------------- | ---------------------------------------------------------------- |
| `DATABASE_URL`       | PostgreSQL connection string                                     |
| `PORT`               | Порт сервера (по умолчанию `3001`)                               |
| `BETTER_AUTH_SECRET` | Секрет для подписи сессий (≥ 32 символа)                         |
| `BETTER_AUTH_URL`    | Публичный URL бэкенда, напр. `http://localhost:3001`             |
| `TRUSTED_ORIGINS`    | Разрешённые origins через запятую, напр. `http://localhost:3000` |

## Базовый URL

```
http://localhost:3001/api/auth
```

В примерах ниже замени хост/порт на свои значения из `BETTER_AUTH_URL`.

> Email verification и сброс пароля **не настроены** — доступны только регистрация, вход, выход и работа с сессией.

---

## Эндпоинты

### Регистрация

`POST /api/auth/sign-up/email`

```bash
curl -X POST http://localhost:3001/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password1234"
  }'
```

| Поле          | Обязательное | Описание                        |
| ------------- | ------------ | ------------------------------- |
| `name`        | да           | Имя пользователя                |
| `email`       | да           | Email                           |
| `password`    | да           | Пароль (мин. 8 символов)        |
| `image`       | нет          | URL аватара                     |
| `callbackURL` | нет          | URL редиректа после регистрации |

Пример ответа (`200`):

```json
{
    "token": "…",
    "user": {
        "id": "019…",
        "name": "John Doe",
        "email": "john@example.com",
        "emailVerified": false,
        "image": null,
        "createdAt": "2026-07-02T12:00:00.000Z",
        "updatedAt": "2026-07-02T12:00:00.000Z"
    }
}
```

После успешной регистрации в заголовке `Set-Cookie` приходит session cookie.

---

### Вход

`POST /api/auth/sign-in/email`

```bash
curl -X POST http://localhost:3001/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "john@example.com",
    "password": "password1234",
    "rememberMe": true
  }'
```

| Поле          | Обязательное | Описание                                                                  |
| ------------- | ------------ | ------------------------------------------------------------------------- |
| `email`       | да           | Email                                                                     |
| `password`    | да           | Пароль                                                                    |
| `rememberMe`  | нет          | `true` — сессия сохраняется после закрытия браузера (по умолчанию `true`) |
| `callbackURL` | нет          | URL редиректа после входа                                                 |

Пример ответа (`200`):

```json
{
    "redirect": false,
    "token": "…",
    "user": {
        "id": "019…",
        "name": "John Doe",
        "email": "john@example.com",
        "emailVerified": false,
        "image": null,
        "createdAt": "2026-07-02T12:00:00.000Z",
        "updatedAt": "2026-07-02T12:00:00.000Z"
    }
}
```

---

### Текущая сессия

`GET /api/auth/get-session`

```bash
curl http://localhost:3001/api/auth/get-session \
  -b cookies.txt
```

Если пользователь авторизован (`200`):

```json
{
    "session": {
        "id": "019…",
        "userId": "019…",
        "token": "…",
        "expiresAt": "2026-07-09T12:00:00.000Z",
        "createdAt": "2026-07-02T12:00:00.000Z",
        "updatedAt": "2026-07-02T12:00:00.000Z",
        "ipAddress": "127.0.0.1",
        "userAgent": "curl/8.x"
    },
    "user": {
        "id": "019…",
        "name": "John Doe",
        "email": "john@example.com",
        "emailVerified": false,
        "image": null,
        "createdAt": "2026-07-02T12:00:00.000Z",
        "updatedAt": "2026-07-02T12:00:00.000Z"
    }
}
```

Если сессии нет — `null`.

---

### Выход

`POST /api/auth/sign-out`

```bash
curl -X POST http://localhost:3001/api/auth/sign-out \
  -b cookies.txt \
  -c cookies.txt
```

Тело запроса не требуется. Cookie сессии инвалидируется.

---

### Смена пароля

`POST /api/auth/change-password` — требует активной сессии.

```bash
curl -X POST http://localhost:3001/api/auth/change-password \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "currentPassword": "password1234",
    "newPassword": "newpassword5678",
    "revokeOtherSessions": true
  }'
```

| Поле                  | Обязательное | Описание                       |
| --------------------- | ------------ | ------------------------------ |
| `currentPassword`     | да           | Текущий пароль                 |
| `newPassword`         | да           | Новый пароль                   |
| `revokeOtherSessions` | нет          | Завершить все остальные сессии |

---

## Запросы с фронтенда

Для браузерного клиента используй [Better Auth client](https://www.better-auth.com/docs/installation#create-client-instance) с `credentials: "include"`:

```ts
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
    baseURL: 'http://localhost:3001',
});

// Регистрация
await authClient.signUp.email({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password1234',
});

// Вход
await authClient.signIn.email({
    email: 'john@example.com',
    password: 'password1234',
});

// Текущий пользователь
const { data } = await authClient.getSession();
```

Origin фронтенда должен быть в `TRUSTED_ORIGINS`.

---

## Проверка сессии в защищённых роутах

Пример middleware для Hono:

```ts
import { auth } from './auth.js';

app.use('/api/protected/*', async (c, next) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });

    if (!session) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    c.set('user', session.user);
    c.set('session', session.session);
    await next();
});
```

---

## Запуск

```bash
pnpm --filter @bookio/backend dev
```

Сервер стартует на `http://localhost:${PORT}`.
