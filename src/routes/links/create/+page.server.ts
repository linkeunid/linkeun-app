import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import { createServerApiClient } from '$lib/api/server-client.js';
import type { CreateLinkPayload } from '../types/create-links.type';
import type { Actions, PageServerLoad } from './$types';

const createLinkSchema = z.object({
	original_url: z.string().url('Please enter a valid URL'),
	custom_alias: z.string().optional(),
	password: z.string().optional(),
	description: z.string().optional()
});

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		return {
			notLoggedIn: true
		};
	}

	return {
		notLoggedIn: false
	};
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const data = Object.fromEntries(formData);

		const result = createLinkSchema.safeParse(data);

		if (!result.success) {
			return fail(400, {
				error: result.error.issues[0].message,
				data
			});
		}

		const sessionToken = cookies.get('auth-session');
		if (!sessionToken) {
			return fail(401, {
				error: 'You must be logged in to create links',
				data
			});
		}

		try {
			const apiClient = createServerApiClient(sessionToken);
			
			const payload: CreateLinkPayload = {
				original_url: result.data.original_url
			};

			if (result.data.custom_alias && result.data.custom_alias.trim() !== '') {
				payload.custom_alias = result.data.custom_alias;
			}

			if (result.data.password && result.data.password.trim() !== '') {
				payload.password = result.data.password;
			}

			if (result.data.description && result.data.description.trim() !== '') {
				payload.description = result.data.description;
			}

			const response = await apiClient.post('/api/s/', payload);
			const responseData = response.data;

			return {
				success: true,
				link: responseData.data || responseData
			};
		} catch (error: any) {
			console.error('Error creating link:', error);
			
			if (error.response) {
				// API responded with error status
				const errorResult = error.response.data || {};
				return fail(error.response.status, {
					error: errorResult.message || errorResult.error || 'Failed to create link',
					data
				});
			} else {
				// Network or other error
				return fail(500, {
					error: 'Network error: Failed to create link',
					data
				});
			}
		}
	}
};
