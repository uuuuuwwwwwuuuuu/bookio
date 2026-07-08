import { db } from '@/db.js';
import { organizations } from '@bookio/db';
import { eq } from 'drizzle-orm';

export const isOrganizationExists = async (slug: string) => {
    const [organization] = await db.select().from(organizations).where(eq(organizations.slug, slug));
    return !!organization;
};