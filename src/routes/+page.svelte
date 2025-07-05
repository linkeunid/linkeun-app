<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { ExternalLink, LogIn, LogOut, User, UserPlus } from '@lucide/svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let searchValue = $state('');
</script>

<svelte:head>
	<title>Home - LinkeunApp</title>
	<meta
		name="description"
		content="Welcome to LinkeunApp - A modern SvelteKit application with authentication and demo features."
	/>
	<meta property="og:title" content="Home - LinkeunApp" />
	<meta
		property="og:description"
		content="Welcome to LinkeunApp - A modern SvelteKit application with authentication and demo features."
	/>
	<meta property="og:type" content="website" />
</svelte:head>

{#if data.user}
	<!-- Welcome section for logged in users -->
	<div class="grid auto-rows-min gap-4 md:grid-cols-3">
		<Card.Root class="md:col-span-2">
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<User class="h-5 w-5" />
					Welcome back, {data.user.name}!
				</Card.Title>
				<Card.Description>Here's what's happening with your account</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-4">
				<div class="space-y-2">
					<p class="text-muted-foreground text-sm">
						<strong>Username:</strong>
						{data.user.username}
					</p>
					<p class="text-muted-foreground text-sm">
						<strong>Email:</strong>
						{data.user.email}
					</p>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title>Quick Actions</Card.Title>
			</Card.Header>
			<Card.Content>
				<form method="post" action="?/logout" use:enhance>
					<Button type="submit" variant="outline" class="flex w-full items-center gap-2">
						<LogOut class="h-4 w-4" />
						Logout
					</Button>
				</form>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Main content area -->
	<div class="bg-muted/50 min-h-[60vh] flex-1 rounded-xl p-6">
		<h2 class="mb-4 text-2xl font-semibold">Dashboard</h2>
		<p class="text-muted-foreground">Your main application content goes here.</p>
	</div>
{:else}
	<!-- Welcome section for guests -->
	<div class="grid auto-rows-min gap-4 md:grid-cols-2">
		<Card.Root>
			<Card.Header>
				<Card.Title>Welcome to LinkeunApp</Card.Title>
				<Card.Description>
					Please sign in to access your account or create a new one to get started.
				</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="flex gap-2">
					<Button href="/auth/login" class="flex items-center gap-2">
						<LogIn class="h-4 w-4" />
						Login
					</Button>
					<Button href="/auth/register" variant="outline" class="flex items-center gap-2">
						<UserPlus class="h-4 w-4" />
						Register
					</Button>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title>Getting Started</Card.Title>
				<Card.Description>Learn how to use the application</Card.Description>
			</Card.Header>
			<Card.Content>
				<p class="text-muted-foreground text-sm">
					Create an account to access all features and start managing your data.
				</p>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Guest content area -->
	<div class="bg-muted/50 flex min-h-[60vh] flex-1 items-center justify-center rounded-xl p-6">
		<div class="text-center">
			<h2 class="mb-2 text-2xl font-semibold">Ready to get started?</h2>
			<p class="text-muted-foreground mb-4">Sign in or create an account to continue.</p>
			<div class="flex justify-center gap-2">
				<Button href="/auth/login" class="flex items-center gap-2">
					<LogIn class="h-4 w-4" />
					Login
				</Button>
				<Button href="/auth/register" variant="outline" class="flex items-center gap-2">
					<UserPlus class="h-4 w-4" />
					Register
				</Button>
			</div>
		</div>
	</div>
{/if}

<Card.Root>
	<Card.Header>
		<Card.Title>Documentation</Card.Title>
		<Card.Description>Learn more about SvelteKit</Card.Description>
	</Card.Header>
	<Card.Content>
		<p class="text-muted-foreground">
			Visit <a
				href="https://svelte.dev/docs/kit"
				target="_blank"
				class="text-primary inline-flex items-center gap-1 hover:underline"
				>svelte.dev/docs/kit
				<ExternalLink class="h-3 w-3" />
			</a> to read the documentation
		</p>
	</Card.Content>
</Card.Root>
