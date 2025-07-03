import { env } from '$env/dynamic/private';
import type { UserAuthResponse } from '@/types/user-auth.type';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		return redirect(302, '/');
	}
	return {};
};

export const actions: Actions = {
	login: async (event) => {
		const formData = await event.request.formData();
		const username = formData.get('username');
		const password = formData.get('password');

		if (!username || !password) {
			return fail(400, {
				error: 'Missing username or password',
				values: { username }
			});
		}

		try {
			const apiBaseUrl = env.API_BASE_URL || 'http://localhost:3000';
			const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ username, password })
			});

			const result: UserAuthResponse = await response.json();

			if (!response.ok || result.error !== null) {
				return fail(response.status || 400, {
					error: result.message || 'Login failed',
					values: { username }
				});
			}

			// Set auth token cookie
			const { token, expires_in, user } = result.data;
			event.cookies.set('auth-session', token, {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				secure: process.env.NODE_ENV === 'production',
				maxAge: expires_in
			});

			// Store user data for the current request
			event.locals.user = user;
		} catch (err) {
			console.error('Login error:', err);
			return fail(500, {
				error: 'An unexpected error occurred during login',
				values: { username }
			});
		}

		// Redirect to dashboard or home page
		throw redirect(303, '/');
	}
};
