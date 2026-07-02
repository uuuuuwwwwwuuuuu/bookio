import {
    boolean,
    integer,
    jsonb,
    pgTable,
    text,
    timestamp,
    uuid,
    varchar,
} from 'drizzle-orm/pg-core';
import { v7 as uuidv7 } from 'uuid';

import { organizations } from './organizations.js';

// ==========================================
// 1. ТАБЛИЦА УСЛУГ (SERVICES)
// ==========================================
export const services = pgTable('services', {
    id: uuid('id')
        .primaryKey()
        .$defaultFn(() => uuidv7()),
    organizationId: uuid('organization_id')
        .notNull()
        .references(() => organizations.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(), // Например: "Комбинированный маникюр"
    description: text('description'), // Описание услуги
    duration: integer('duration').notNull(), // Длительность в минутах (например: 60)
    price: integer('price').notNull(), // Стоимость в минорных единицах (копейки/центы). 15 BYN -> 1500
    currency: varchar('currency', { length: 10, enum: ['BYN', 'RUB', 'USD', 'EUR'] })
        .notNull()
        .default('BYN'), // На будущее, если захотим масштабироваться на РФ/Мир
    isActive: boolean('is_active').notNull().default(true), // Можно временно скрыть услугу
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
        .notNull()
        .defaultNow()
        .$onUpdateFn(() => new Date()),
});

// ==========================================
// 2. ТАБЛИЦА РАСПИСАНИЯ (SCHEDULES)
// ==========================================
export const schedules = pgTable('schedules', {
    id: uuid('id')
        .primaryKey()
        .$defaultFn(() => uuidv7()),
    organizationId: uuid('organization_id')
        .notNull()
        .unique() // Пока 1 организация = 1 общий график работы
        .references(() => organizations.id, { onDelete: 'cascade' }),

    // Часовой пояс критически важен. В Беларуси это 'Europe/Minsk'.
    // Без этого при отправке клиенту времени будут возникать баги со сдвигом часовых поясов.
    timezone: text('timezone').notNull().default('Europe/Minsk'),

    // JSONB для гибкой настройки рабочих дней недели.
    // Пример структуры:
    // {
    //   "monday": { "isOpen": true, "intervals": [{ "start": "09:00", "end": "13:00" }, { "start": "14:00", "end": "18:00" }] },
    //   "tuesday": { "isOpen": false, "intervals": [] }
    // }
    weeklyHours: jsonb('weekly_hours').notNull(),

    // Исключения (праздники, больничные, разовые выходные).
    // Пример: { "2026-07-02": { "isOpen": false }, "2026-07-03": { "isOpen": true, "intervals": [{"start": "10:00", "end": "15:00"}] } }
    exceptions: jsonb('exceptions').notNull().default({}),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
        .notNull()
        .defaultNow()
        .$onUpdateFn(() => new Date()),
});

// ==========================================
// 3. ТАБЛИЦА БРОНИРОВАНИЙ (BOOKINGS)
// ==========================================
export const bookings = pgTable('bookings', {
    id: uuid('id')
        .primaryKey()
        .$defaultFn(() => uuidv7()),
    organizationId: uuid('organization_id')
        .notNull()
        .references(() => organizations.id, { onDelete: 'cascade' }),
    serviceId: uuid('service_id')
        .notNull()
        .references(() => services.id, { onDelete: 'restrict' }), // Нельзя удалить услугу, если на нее есть записи

    // Данные клиента
    clientName: varchar('client_name', { length: 255 }).notNull(),
    clientPhone: varchar('client_phone', { length: 60 }).notNull(), // Основной канал связи в СНГ
    clientEmail: varchar('client_email', { length: 300}), // Необязательно для MVP
    clientComment: text('client_comment'), // Пожелания клиента

    // Время записи (храним как UTC timestamp с таймзоной)
    // Важно хранить и старт, и конец, чтобы в будущем SQL-запрос на поиск пересечений работал за $O(1)$
    startTime: timestamp('start_time', { withTimezone: true }).notNull(),
    endTime: timestamp('end_time', { withTimezone: true }).notNull(),

    // Статус бронирования
    // pending — ожидает подтверждения мастером
    // confirmed — подтверждено
    // cancelled_by_master — отменено мастером
    // cancelled_by_client — отменено клиентом
    status: varchar('status', { length: 50, enum: ['pending', 'confirmed', 'cancelled_by_master', 'cancelled_by_client'] })
        .notNull()
        .default('pending'),

    // Поля для связи с Telegram
    // Если клиент записался через Telegram Web App, мы можем сохранить его TG ID,
    // чтобы бот мог автоматически слать ему напоминания о записи бесплатно!
    clientTelegramId: text('client_telegram_id'),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
        .notNull()
        .defaultNow()
        .$onUpdateFn(() => new Date()),
});

// Типы для TypeScript
export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;

export type Schedule = typeof schedules.$inferSelect;
export type NewSchedule = typeof schedules.$inferInsert;

export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
