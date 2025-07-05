import { createServerApiClient } from '$lib/api/server-client.js';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		return redirect(302, '/');
	}
	return {};
};

export const actions: Actions = {
	register: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email');
		const username = formData.get('username');
		const name = formData.get('name');
		const password = formData.get('password');

		if (!email || !username || !name || !password) {
			return fail(400, {
				error: 'Missing required fields',
				values: { email, username, name }
			});
		}

		try {
			const apiClient = createServerApiClient();
			const response = await apiClient.post('/api/auth/register', {
				email,
				username,
				name,
				password
			});

			const result = response.data;

			if (result.error !== null) {
				return fail(response.status || 400, {
					error: result.message || 'Registration failed',
					values: { email, username, name }
				});
			}

			// Registration successful - show success message
			return {
				success: true,
				message:
					result.message ||
					'Registration successful! Please check your email to verify your account.',
				user: result.data
			};
		} catch (err: any) {
			console.error('Registration error:', err);
			
			if (err.response) {
				const errorResult = err.response.data || {};
				return fail(err.response.status, {
					error: errorResult.message || errorResult.error || 'Registration failed',
					values: { email, username, name }
				});
			}
			
			return fail(500, {
				error: 'An unexpected error occurred during registration',
				values: { email, username, name }
			});
		}
	}
};
