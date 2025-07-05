export interface ApiResponse<T> {
	code: number;
	data: T | T[] | null;
	error: Record<string, any> | null;
	message: string;
	meta: ApiResponseMeta;
}

export interface ApiResponseMeta {
	has_next: boolean;
	has_prev: boolean;
	last_page: number;
	page: number;
	per_page: number;
	total: number;
}
