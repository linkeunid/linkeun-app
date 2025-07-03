<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Key, LogOut, ShieldCheck, User } from '@lucide/svelte';
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();
</script>

<svelte:head>
	<title>Lucia Demo - LinkeunApp</title>
	<meta
		name="description"
		content="Authentication demo using Lucia for secure user sessions and login management."
	/>
	<meta property="og:title" content="Lucia Demo - LinkeunApp" />
	<meta
		property="og:description"
		content="Authentication demo using Lucia for secure user sessions and login management."
	/>
	<meta property="og:type" content="website" />
</svelte:head>

<div class="grid auto-rows-min gap-4 md:grid-cols-3">
	<Card.Root class="md:col-span-2">
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<ShieldCheck class="h-5 w-5" />
				Lucia Authentication Demo
			</Card.Title>
			<Card.Description>Successfully authenticated using Lucia session management</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
				<User class="h-5 w-5 text-green-600" />
				<div>
					<p class="font-medium text-green-800">Welcome, {data.user.username}!</p>
					<p class="text-sm text-green-600">Your user ID is: {data.user.id}</p>
				</div>
			</div>

			<div class="space-y-2">
				<h3 class="flex items-center gap-2 font-medium">
					<Key class="h-4 w-4" />
					Session Information
				</h3>
				<div class="text-muted-foreground space-y-1 text-sm">
					<p>• Authentication method: Lucia with secure sessions</p>
					<p>• Session storage: Database-backed with automatic cleanup</p>
					<p>• Security: Argon2 password hashing</p>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title>Actions</Card.Title>
		</Card.Header>
		<Card.Content>
			<form method="post" action="?/logout" use:enhance>
				<Button type="submit" variant="outline" class="flex w-full items-center gap-2">
					<LogOut class="h-4 w-4" />
					Sign Out
				</Button>
			</form>
		</Card.Content>
	</Card.Root>
</div>

<div class="bg-muted/50 min-h-[40vh] flex-1 rounded-xl p-6">
	<h2 class="mb-4 text-xl font-semibold">About This Demo</h2>
	<div class="text-muted-foreground space-y-3 text-sm">
		<p>
			This page demonstrates Lucia authentication working alongside your main authentication system.
		</p>
		<p>• Secure session management with automatic expiration</p>
		<p>• Password hashing using Argon2</p>
		<p>• Database integration with SQLite via Drizzle ORM</p>
		<p>• CSRF protection and secure cookie handling</p>
	</div>
</div>
