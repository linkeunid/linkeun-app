import { createApiClient } from '$lib/api/client.js';
import type { PwnedPasswordsResponse } from '@/routes/tools/types/pwnedpasswords.type.';
import { createQuery } from '@tanstack/svelte-query';

export interface BreachCheckParams {
	password: string;
}

export const fetchBreachCheck = async (password: string): Promise<number> => {
	if (!password) return 0;

	// Create SHA-1 hash of password
	const encoder = new TextEncoder();
	const data = encoder.encode(password);
	const hashBuffer = await crypto.subtle.digest('SHA-1', data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hashHex = hashArray
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('')
		.toUpperCase();

	// Send first 5 characters to API
	const prefix = hashHex.substring(0, 5);
	const suffix = hashHex.substring(5);

	const apiClient = createApiClient();
	const response = await apiClient.get<PwnedPasswordsResponse>(
		`https://api.pwnedpasswords.com/range/${prefix}`
	);

	const text = response.data;
	const lines = text.split('\n');

	for (const line of lines) {
		const [hashSuffix, count] = line.split(':');
		if (hashSuffix === suffix) {
			return parseInt(count, 10);
		}
	}

	return 0;
};

export const useBreachCheck = (params: BreachCheckParams) => {
	return createQuery({
		queryKey: ['breach-check', params.password],
		queryFn: () => fetchBreachCheck(params.password),
		enabled: !!params.password,
		staleTime: 5 * 60 * 1000,
		retry: (failureCount, error: any) => {
			if (error?.response?.status === 401) return false;
			return failureCount < 3;
		}
	});
};
