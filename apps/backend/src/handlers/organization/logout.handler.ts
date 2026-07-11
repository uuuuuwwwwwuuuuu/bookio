import { createFactory } from 'hono/factory';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db } from '@/db.js';
import { and, eq } from 'drizzle-orm';
import { members, organizations } from '@bookio/db';
import { prepareError, prepareSuccess } from '@/utils/prepareResponse.js';

const factory = createFactory().createHandlers;

const logoutOrganizationSchema = z.object({
    userId: z.string(),
    organizationId: z.string(),
    organizationPassword: z.string().optional()
});

export const logoutOrganizationHandler = factory(
    zValidator('json', logoutOrganizationSchema),
    async (c) => {
        const { userId, organizationId, organizationPassword } = c.req.valid('json');

        const [member] = await db
            .select()
            .from(members)
            .where(and(eq(members.userId, userId), eq(members.organizationId, organizationId)));

        if (!member) {
            return c.json(prepareError('Member not found'), 404);
        }

        if (member.role === 'owner') {
            const [organization] = await db.select().from(organizations).where(eq(organizations.id, organizationId));
            if (!organization) {
                return c.json(prepareError('Organization not found'), 404);
            }

            if (organization.password !== organizationPassword) {
                return c.json(prepareError('Invalid organization password'), 401);
            }

            const [deletedOrganization] = await db.delete(organizations).where(eq(organizations.id, organizationId)).returning();

            if (deletedOrganization) {
                return c.json(prepareSuccess('Organization deleted successfully'));
            } else {
                return c.json(prepareError('Failed to delete organization'), 500);
            }
        }

        await db
            .delete(members)
            .where(and(eq(members.userId, userId), eq(members.organizationId, organizationId)));

        return c.json(prepareSuccess('Member deleted successfully'));
    },
);
