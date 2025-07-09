import { createServerApiClient } from '$lib/api/server-client.js';
import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import type { Actions, PageServerLoad } from '../$types';
import type { UpdateLinkPayload } from '../../types/update-links.type';

const updateLinkSchema = z.object({
	original_url: z.string().url('Please enter a valid URL').optional(),
	custom_alias: z.string().optional(),
	password: z.string().optional(),
	description: z.string().optional()
});

export const load: PageServerLoad = async ({ locals, cookies, params }) => {
	if (!locals.user) {
		return {
			notLoggedIn: true
		};
	}

	const sessionToken = cookies.get('auth-session');
	if (!sessionToken) {
		return {
			notLoggedIn: true
		};
	}

	try {
		// Fetch the existing link data using shortCode
		const apiClient = createServerApiClient(sessionToken);
		const response = await apiClient.get(`/api/s/${params.id}/detail`);

		// console.log('response', response.data);

		return {
			notLoggedIn: false,
			link: response.data.data || response.data
		};
	} catch (error: any) {
		console.error('Error fetching link:', error);

		if (error.response?.status === 404) {
			throw redirect(302, '/links');
		}

		return {
			notLoggedIn: false,
			error: 'Failed to load link data'
		};
	}
};

export const actions: Actions = {
	default: async ({ request, cookies, params }) => {
		const formData = await request.formData();
		const data = Object.fromEntries(formData);

		const result = updateLinkSchema.safeParse(data);

		if (!result.success) {
			return fail(400, {
				error: result.error.issues[0].message,
				data
			});
		}

		const sessionToken = cookies.get('auth-session');
		if (!sessionToken) {
			return fail(401, {
				error: 'You must be logged in to update links',
				data
			});
		}

		try {
			const apiClient = createServerApiClient(sessionToken);

			const payload: UpdateLinkPayload = {};

			// Only include fields that were provided and are not empty
			if (result.data.original_url) {
				payload.original_url = result.data.original_url;
			}

			if (result.data.custom_alias && result.data.custom_alias.trim() !== '') {
				payload.custom_alias = result.data.custom_alias;
			}

			if (result.data.password !== undefined) {
				payload.password = result.data.password.trim() === '' ? undefined : result.data.password;
			}

			if (result.data.description !== undefined) {
				payload.description =
					result.data.description.trim() === '' ? undefined : result.data.description;
			}

			// Use PATCH method as per API specification
			const response = await apiClient.patch(`/api/s/${params.id}`, payload);
			const responseData = response.data;

			return {
				success: true,
				link: responseData.data || responseData
			};
		} catch (error: any) {
			if (error.response) {
				// API responded with error status
				const errorResult = error.response.data || {};
				return fail(error.response.status, {
					error: errorResult.message || errorResult.error || 'Failed to update link',
					data
				});
			} else {
				// Network or other error
				return fail(500, {
					error: 'Network error: Failed to update link',
					data
				});
			}
		}
	}
};
