import { createFactory } from 'hono/factory';
import { zValidator } from '@hono/zod-validator';
import { db } from '@/db.js';
import { members, organizations } from '@bookio/db';
import { prepareError, prepareSuccess } from '@/utils/prepareResponse.js';
import { eq } from 'drizzle-orm';
import { organizationSchema } from '@schemas/organization/create.schema.js';

const factory = createFactory().createHandlers;

export const createOrganizationHandler = factory(zValidator('json', organizationSchema), async (c) => {
    const { name, password, userId, slug } = c.req.valid('json');

    const [existingOrganization] = await db.select().from(organizations).where(eq(organizations.slug, slug));

    if (existingOrganization) {
        return c.json(prepareError('Organization with this slug already exists'), 400);
    }

    const [organization] = await db.insert(organizations).values({ name, password, slug }).returning();

    const [member] = await db.insert(members).values({
        organizationId: organization.id,
        userId,
        role: 'owner'
    }).returning();

    if (!member) {
        return c.json(prepareError('Failed to create member'), 500);
    }

    return c.json(prepareSuccess({
        organization: {
            name: organization.name,
            id: organization.id,
            createdAt: organization.createdAt,
            secretKey: organization.secretKey,
        },
        role: member.role,
    }));
});
