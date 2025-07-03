import { env } from '$env/dynamic/private';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	// Require authentication for settings page
	if (!event.locals.user) {
		throw redirect(302, '/auth/login');
	}

	return {
		user: event.locals.user
	};
};

export const actions: Actions = {
	updateProfile: async (event) => {
		if (!event.locals.user) {
			return fail(401, { profileError: 'Authentication required' });
		}

		const formData = await event.request.formData();
		const name = formData.get('name');
		const username = formData.get('username');

		if (!name || !username) {
			return fail(400, {
				profileError: 'Name and username are required',
				profileValues: { name, username }
			});
		}

		try {
			const apiBaseUrl = env.API_BASE_URL || 'http://localhost:3000';
			const sessionToken = event.cookies.get('auth-session');

			if (!sessionToken) {
				return fail(401, { profileError: 'Authentication token missing' });
			}

			const response = await fetch(`${apiBaseUrl}/api/users/profile`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${sessionToken}`
				},
				body: JSON.stringify({ name, username })
			});

			const result = await response.json();

			if (!response.ok || result.error !== null) {
				return fail(response.status || 400, {
					profileError: result.message || 'Failed to update profile',
					profileValues: { name, username }
				});
			}

			// Update the user data in locals
			event.locals.user = {
				...event.locals.user,
				name: name.toString(),
				username: username.toString()
			};

			return {
				profileSuccess: 'Profile updated successfully!'
			};
		} catch (err) {
			console.error('Profile update error:', err);
			return fail(500, {
				profileError: 'An unexpected error occurred while updating profile',
				profileValues: { name, username }
			});
		}
	},

	updatePassword: async (event) => {
		if (!event.locals.user) {
			return fail(401, { passwordError: 'Authentication required' });
		}

		const formData = await event.request.formData();
		const currentPassword = formData.get('currentPassword');
		const newPassword = formData.get('newPassword');
		const confirmPassword = formData.get('confirmPassword');

		if (!currentPassword || !newPassword || !confirmPassword) {
			return fail(400, {
				passwordError: 'All password fields are required'
			});
		}

		if (newPassword !== confirmPassword) {
			return fail(400, {
				passwordError: 'New password and confirmation do not match'
			});
		}

		if (newPassword.toString().length < 6) {
			return fail(400, {
				passwordError: 'New password must be at least 6 characters long'
			});
		}

		try {
			const apiBaseUrl = env.API_BASE_URL || 'http://localhost:3000';
			const sessionToken = event.cookies.get('auth-session');

			if (!sessionToken) {
				return fail(401, { passwordError: 'Authentication token missing' });
			}

			const response = await fetch(`${apiBaseUrl}/api/users/change-password`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${sessionToken}`
				},
				body: JSON.stringify({
					currentPassword,
					newPassword
				})
			});

			const result = await response.json();

			if (!response.ok || result.error !== null) {
				return fail(response.status || 400, {
					passwordError: result.message || 'Failed to update password'
				});
			}

			return {
				passwordSuccess: 'Password updated successfully!'
			};
		} catch (err) {
			console.error('Password update error:', err);
			return fail(500, {
				passwordError: 'An unexpected error occurred while updating password'
			});
		}
	}
};
