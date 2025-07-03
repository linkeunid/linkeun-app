<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { ArrowLeft, Lock, LogIn, User, UserPlus } from '@lucide/svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
	<title>Lucia Login - LinkeunApp</title>
	<meta name="description" content="Login and registration demo for Lucia authentication system." />
	<meta property="og:title" content="Lucia Login - LinkeunApp" />
	<meta
		property="og:description"
		content="Login and registration demo for Lucia authentication system."
	/>
	<meta property="og:type" content="website" />
</svelte:head>

<div class="flex min-h-screen items-center justify-center">
	<div class="w-full max-w-md">
		<!-- Back to Demo Link -->
		<div class="mb-4 text-center">
			<a
				href="/demo"
				class="text-muted-foreground hover:text-primary inline-flex items-center gap-1 text-sm hover:underline"
			>
				<ArrowLeft class="h-3 w-3" />
				Back to Demos
			</a>
		</div>

		<Card.Root>
			<Card.Header>
				<Card.Title class="text-2xl">Lucia Demo Login</Card.Title>
				<Card.Description>Test the Lucia authentication system</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-6">
				<form method="post" action="?/login" use:enhance class="space-y-4">
					<div class="space-y-2">
						<Label for="username" class="flex items-center gap-2">
							<User class="h-4 w-4" />
							Username
						</Label>
						<Input
							id="username"
							name="username"
							type="text"
							placeholder="Enter username"
							required
						/>
					</div>
					<div class="space-y-2">
						<Label for="password" class="flex items-center gap-2">
							<Lock class="h-4 w-4" />
							Password
						</Label>
						<Input
							id="password"
							name="password"
							type="password"
							placeholder="Enter password"
							required
						/>
					</div>
					<Button type="submit" class="flex w-full items-center gap-2">
						<LogIn class="h-4 w-4" />
						Login
					</Button>
				</form>

				<div class="relative">
					<div class="absolute inset-0 flex items-center">
						<span class="w-full border-t" />
					</div>
					<div class="relative flex justify-center text-xs uppercase">
						<span class="bg-background text-muted-foreground px-2">Or</span>
					</div>
				</div>

				<form method="post" action="?/register" use:enhance>
					<Button variant="outline" type="submit" class="flex w-full items-center gap-2">
						<UserPlus class="h-4 w-4" />
						Create New Account
					</Button>
				</form>

				{#if form?.message}
					<div class="rounded-lg border border-red-200 bg-red-50 p-3">
						<p class="text-sm text-red-800">{form.message}</p>
					</div>
				{/if}

				<div class="text-center">
					<p class="text-muted-foreground text-xs">
						This is a demo of the Lucia authentication system
					</p>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</div>
