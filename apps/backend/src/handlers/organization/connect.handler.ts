import { z } from 'zod';
import { createFactory } from 'hono/factory';
import { zValidator } from '@hono/zod-validator';
import { db } from '@/db.js';
import { members, organizations } from '@bookio/db';
import { and, eq } from 'drizzle-orm';
import { prepareError, prepareSuccess } from '@/utils/prepareResponse.js';

const connectOrganizationSchema = z.object({
    slug: z.string(),
    password: z.string(),
    userId: z.string(),
});

const factory = createFactory().createHandlers;

export const connectOrganizationHandler = factory(
    zValidator('json', connectOrganizationSchema),
    async (c) => {
        const { slug, password, userId } = c.req.valid('json');

        const [organization] = await db
            .select()
            .from(organizations)
            .where(eq(organizations.slug, slug));

        if (!organization) {
            return c.json(prepareError('Organization not found'), 404);
        }

        if (organization.password !== password) {
            return c.json(prepareError('Invalid password'), 401);
        }

        const [member] = await db
            .select()
            .from(members)
            .where(and(eq(members.organizationId, organization.id), eq(members.userId, userId)));

        if (member) {
            return c.json(prepareError('You are already a member of this organization'), 400);
        }

        const [newMember] = await db
            .insert(members)
            .values({
                organizationId: organization.id,
                userId,
                role: 'member',
            })
            .returning();

        if (!newMember) {
            return c.json(prepareError('Failed to add you to the organization'), 500);
        }

        return c.json(
            prepareSuccess({
                member: newMember,
            }),
        );
    },
);
