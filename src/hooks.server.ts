import { env } from '$env/dynamic/private';
import { paraglideMiddleware } from '$lib/paraglide/server';
import * as auth from '$lib/server/auth';
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
		});
	});

const handleAuth: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(auth.sessionCookieName);

	if (!sessionToken) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	// Validate JWT token by calling your API profile endpoint
	try {
		const apiBaseUrl = env.API_BASE_URL || 'http://localhost:3000';
		const response = await fetch(`${apiBaseUrl}/api/users/profile`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${sessionToken}`
			}
		});

		if (response.ok) {
			const result = await response.json();
			if (result.error === null && result.data) {
				event.locals.user = result.data;
				event.locals.session = {
					id: 'jwt',
					userId: result.data.id,
					expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
				};
			} else {
				// Invalid token
				auth.deleteSessionTokenCookie(event);
				event.locals.user = null;
				event.locals.session = null;
			}
		} else {
			// Invalid token
			auth.deleteSessionTokenCookie(event);
			event.locals.user = null;
			event.locals.session = null;
		}
	} catch (err) {
		console.error('Auth validation error:', err);
		event.locals.user = null;
		event.locals.session = null;
	}

	return resolve(event);
};

export const handle: Handle = sequence(handleParaglide, handleAuth);
