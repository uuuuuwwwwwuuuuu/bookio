import { createFactory } from 'hono/factory';
import { db } from '@/db.js';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { members, organizations } from '@bookio/db';
import { eq } from 'drizzle-orm';
import { prepareError, prepareSuccess } from '@/utils/prepareResponse.js';
import { getMemberByOrgAndUserId } from '@/utils/getMemberByOrgAndUserId.js';

const factory = createFactory().createHandlers;

const organizationSchema = z.object({
    userId: z.string(),
});

export const getUserOrganizationsHandler = factory(
    zValidator('query', organizationSchema),
    async (c) => {
        try {
            const { userId } = c.req.valid('query');

            const selectedData = await db
                .select()
                .from(members)
                .innerJoin(organizations, eq(members.organizationId, organizations.id))
                .where(eq(members.userId, userId));

            const organizationsData = selectedData.map((item) => {
                const {
                    organizations: { secretKey, ...organization },
                    members,
                } = item;

                return {
                    ...organization,
                    role: members.role,
                };
            });

            return c.json(prepareSuccess(organizationsData), 200);
        } catch (error) {
            return c.json(prepareError('Failed to get user organizations'), 500);
        }
    },
);

const getOrganizationDataSchema = z.object({
    userId: z.string(),
    organizationId: z.string(),
});

export const getOrganizationDataHandler = factory(
    zValidator('query', getOrganizationDataSchema),
    async (c) => {
        try {
            const { organizationId, userId } = c.req.valid('query');

            const [organization] = await db
                .select()
                .from(organizations)
                .where(eq(organizations.id, organizationId));

            if (!organization) {
                return c.json(prepareError('Organization not found'), 404);
            }

            const member = await getMemberByOrgAndUserId(organizationId, userId);

            if (!member) {
                return c.json(prepareError('You are not a member of this organization'), 403);
            }

            return c.json(prepareSuccess(organization), 200);
        } catch (error) {
            return c.json(prepareError('Failed to get organization data'), 500);
        }
    },
);
