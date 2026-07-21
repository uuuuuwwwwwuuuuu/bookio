import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createFactory } from "hono/factory";
import { db } from "@/db.js";
import { testSchema } from "@schemas/test.schema.js";

const factory = createFactory().createHandlers;

const testHandler = factory(
    zValidator('query', testSchema),
    async (c) => {
        const { bookingFormId } = c.req.valid('query');

        const form = await db.query.bookingForms.findFirst({
            where: (bookingForms, { eq }) => eq(bookingForms.id, bookingFormId),
            with: {
                organization: true,
                fields: true
            }
        })

        return c.json(form);
    }
);

const test = new Hono()
    .get('/', ...testHandler);

export default test;
