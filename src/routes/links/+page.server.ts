import { env } from '$env/dynamic/private';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url, cookies }) => {
	const search = url.searchParams.get('search') ?? '';

	const sessionToken = cookies.get('auth-session');

	// Check if user is logged in (both locals.user and sessionToken must exist)
	if (!locals.user || !sessionToken) {
		return {
			links: { data: [] },
			error: null,
			notLoggedIn: true
		};
	}

	const apiBaseUrl = env.API_BASE_URL || 'http://localhost:3000';

	try {
		// Fetch ALL data for client-side pagination, sorting, and filtering
		const response = await fetch(
			`${apiBaseUrl}/api/s?search=${encodeURIComponent(search)}&sortBy=updated_at&sort=desc&per_page=1000&page=1`,
			{
				method: 'GET',
				headers: {
					Authorization: `Bearer ${sessionToken}`,
					'Content-Type': 'application/json'
				}
			}
		);

		if (!response.ok) {
			if (response.status === 401) {
				return {
					links: { data: [] },
					error: null,
					notLoggedIn: true
				};
			}

			const errorResult = await response.json().catch(() => ({}));
			return {
				links: { data: [] },
				error: errorResult.message || errorResult.error || 'Failed to fetch links',
				notLoggedIn: false
			};
		}

		const result = await response.json();

		return {
			links: result.code === 200 ? result : { data: [] },
			error: result.code !== 200 ? result.message || result.error || 'Failed to fetch links' : null,
			notLoggedIn: false
		};
	} catch (error) {
		console.error('Error fetching links:', error);
		return {
			links: { data: [] },
			error: 'Network error: Failed to fetch links',
			notLoggedIn: false
		};
	}
};
