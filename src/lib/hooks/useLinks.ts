import { createApiClient } from '$lib/api/client.js';
import type { ApiResponse } from '@/types/api-response.type';
import { createQuery } from '@tanstack/svelte-query';
import type { Link } from '../../routes/links/types/links.type';

export interface LinkSearchParams {
	search?: string;
	page?: number;
	per_page?: number;
	sortBy?: string;
	sort?: 'asc' | 'desc';
}

export const fetchLinks = async (params: LinkSearchParams, sessionToken: string) => {
	const apiClient = createApiClient(sessionToken);

	const searchParams = new URLSearchParams();
	if (params.search) searchParams.set('search', encodeURIComponent(params.search));
	if (params.page) searchParams.set('page', params.page.toString());
	if (params.per_page) searchParams.set('per_page', params.per_page.toString());
	if (params.sortBy) searchParams.set('sortBy', params.sortBy);
	if (params.sort) searchParams.set('sort', params.sort);

	// Set defaults
	if (!searchParams.has('sortBy')) searchParams.set('sortBy', 'updated_at');
	if (!searchParams.has('sort')) searchParams.set('sort', 'desc');
	if (!searchParams.has('per_page')) searchParams.set('per_page', '10'); // Get all for client-side pagination
	if (!searchParams.has('page')) searchParams.set('page', '1');

	const response = await apiClient.get<ApiResponse<Link[]>>(`/api/s/?${searchParams.toString()}`);
	return response.data;
};

export const useLinks = (getParams: LinkSearchParams, sessionToken: string | null) => {
	return createQuery({
		queryKey: ['links', getParams],
		queryFn: () =>
			fetchLinks(
				{
					search: getParams.search,
					page: getParams.page,
					per_page: getParams.per_page,
					sortBy: getParams.sortBy,
					sort: getParams.sort
				},
				sessionToken!
			),
		enabled: !!sessionToken,
		staleTime: 5 * 60 * 1000,
		retry: (failureCount, error: any) => {
			if (error?.response?.status === 401) return false;
			return failureCount < 3;
		}
	});
};
