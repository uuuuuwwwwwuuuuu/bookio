import { db } from '@/db.js';

export const isOrganizationExists = async (slug: string) => {
    const organization = await db.query.organizations.findFirst({
        where: (organizations, { eq }) => eq(organizations.slug, slug),
        columns: { id: true },
    });
    return !!organization;
};
