import { env } from '$env/dynamic/private';
import type { UserAuthResponse } from '@/types/user-auth.type';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch, cookies, locals, url }) => {
	const { token } = params;

	if (locals.user) {
		return redirect(302, '/');
	}

	if (!token) {
		throw error(400, 'Token is required');
	}

	try {
		const apiBaseUrl = env.API_BASE_URL || 'http://localhost:3000';
		const response = await fetch(`${apiBaseUrl}/api/auth/verify/${token}`);
		const result: UserAuthResponse = await response.json();

		console.log(result);

		// If verification is successful, automatically log the user in
		if (response.ok && result.code === 200 && result.data) {
			const { token: authToken, expires_in, user } = result.data;

			// Set auth token cookie (same as login)
			cookies.set('auth-session', authToken, {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				secure: process.env.NODE_ENV === 'production',
				maxAge: expires_in
			});

			// Store user data for the current request
			locals.user = user;

			// Redirect to homepage since user is now logged in
			throw redirect(303, '/');
		}

		// If verification failed, return error data for display
		return {
			success: false,
			message: result.message,
			user: null,
			token: null,
			statusCode: result.code
		};
	} catch (err) {
		// Handle redirect throws - SvelteKit redirects have a specific structure
		if (err && typeof err === 'object' && 'status' in err && 'location' in err) {
			throw err;
		}

		console.error('Verification API error:', err);
		return {
			success: false,
			message: 'Failed to verify token. Please try again.',
			user: null,
			token: null,
			statusCode: 500
		};
	}
};
