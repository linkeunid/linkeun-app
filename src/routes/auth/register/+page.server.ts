import { env } from '$env/dynamic/private';
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
			const apiBaseUrl = env.API_BASE_URL || 'http://localhost:3000';
			const response = await fetch(`${apiBaseUrl}/api/auth/register`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ email, username, name, password })
			});

			const result = await response.json();

			if (!response.ok || result.error !== null) {
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
		} catch (err) {
			console.error('Registration error:', err);
			return fail(500, {
				error: 'An unexpected error occurred during registration',
				values: { email, username, name }
			});
		}
	}
};
