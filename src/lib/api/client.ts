import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { env } from '$env/dynamic/public';

export class ApiClient {
	private client: AxiosInstance;
	private baseURL: string;

	constructor(sessionToken?: string) {
		this.baseURL = env.PUBLIC_API_BASE_URL || 'http://localhost:3000';
		
		this.client = axios.create({
			baseURL: this.baseURL,
			headers: {
				'Content-Type': 'application/json',
				...(sessionToken && { Authorization: `Bearer ${sessionToken}` })
			}
		});
	}

	async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
		return this.client.get(url, config);
	}

	async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
		return this.client.post(url, data, config);
	}

	async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
		return this.client.put(url, data, config);
	}

	async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
		return this.client.delete(url, config);
	}

	async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
		return this.client.patch(url, data, config);
	}

	// Helper method to get the base URL
	getBaseURL(): string {
		return this.baseURL;
	}

	// Helper method to update authorization token
	setAuthToken(token: string): void {
		this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
	}

	// Helper method to remove authorization token
	removeAuthToken(): void {
		delete this.client.defaults.headers.common['Authorization'];
	}
}

// Factory function to create API client instances
export const createApiClient = (sessionToken?: string): ApiClient => {
	return new ApiClient(sessionToken);
};