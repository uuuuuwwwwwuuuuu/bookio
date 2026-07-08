import { Hono } from 'hono';
import { createOrganizationHandler } from '@handlers/organization/create.handler.js';
import { getOrganizationHandler } from '@handlers/organization/get.handler.js';
import { isOrganizationExistsHandler } from '@/handlers/organization/isExists.handler.js';
import { connectOrganizationHandler } from '@/handlers/organization/connect.handler.js';
import { logoutOrganizationHandler } from '@/handlers/organization/logout.handler.js';

const organizations = new Hono()
    .post('/create', ...createOrganizationHandler)
    .post('/logout', ...logoutOrganizationHandler)
    .post('/is-exists', ...isOrganizationExistsHandler)
    .put('/connect', ...connectOrganizationHandler)
    .get('/', ...getOrganizationHandler);

export default organizations;
