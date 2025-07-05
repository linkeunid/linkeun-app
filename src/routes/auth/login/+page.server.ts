import { createServerApiClient } from '$lib/api/server-client.js';
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
			const apiClient = createServerApiClient();
			const response = await apiClient.post<UserAuthResponse>('/api/auth/login', {
				username,
				password
			});

			const result = response.data;

			if (result.error !== null) {
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
		} catch (err: any) {
			console.error('Login error:', err);
			
			if (err.response) {
				const errorResult = err.response.data || {};
				return fail(err.response.status, {
					error: errorResult.message || errorResult.error || 'Login failed',
					values: { username }
				});
			}
			
			return fail(500, {
				error: 'An unexpected error occurred during login',
				values: { username }
			});
		}

		// Redirect to dashboard or home page
		throw redirect(303, '/');
	}
};
