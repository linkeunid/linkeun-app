import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, cookies }) => {
	const sessionToken = cookies.get('auth-session');

	// Just check authentication and pass necessary data to client
	return {
		notLoggedIn: !locals.user || !sessionToken,
		sessionToken: sessionToken || null
	};
};
