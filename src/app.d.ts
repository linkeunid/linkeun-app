// See https://svelte.dev/docs/kit/types#app.d.ts

import type { User } from './types/user-auth.type';

// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user: User | null;
			session: {
				id: string;
				userId: number;
				expiresAt: Date;
			} | null;
		}
		// interface Error {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
