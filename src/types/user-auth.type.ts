export interface UserAuthResponse {
	code: number;
	data: UserAuthData;
	error: Record<string, any> | null;
	message: string;
}

export interface UserAuthData {
	expires_in: number;
	token: string;
	user: User;
}

export interface User {
	id: number;
	username: string;
	email: string;
	name: string;
	created_at: Date;
	updated_at: Date;
}
