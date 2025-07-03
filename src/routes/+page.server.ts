import { env } from '$env/dynamic/private';
import * as auth from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	return {
		user: event.locals.user
	};
};

export const actions: Actions = {
	logout: async (event) => {
		if (!event.locals.session) {
			throw redirect(302, '/');
		}

		// Clear the auth cookie
		auth.deleteSessionTokenCookie(event);

		// Optionally call logout API endpoint
		if (event.locals.session && event.cookies.get(auth.sessionCookieName)) {
			try {
				const apiBaseUrl = env.API_BASE_URL || 'http://localhost:3000';
				await fetch(`${apiBaseUrl}/api/auth/logout`, {
					method: 'POST',
					headers: {
						Authorization: `Bearer ${event.cookies.get(auth.sessionCookieName)}`
					}
				});
			} catch (err) {
				console.error('Logout API error:', err);
				// Continue with logout even if API call fails
			}
		}

		throw redirect(302, '/auth/login');
	}
};
