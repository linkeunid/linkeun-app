export interface Link {
	clicks_count: number;
	created_at: Date;
	custom_alias: null | string;
	deleted_at: null;
	description: null | string;
	id: number;
	is_active: boolean;
	is_private: boolean;
	original_url: string;
	short_code: string;
	updated_at: Date;
	user_id: number;
}
