<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import PageContainer from '@/lib/components/ui/page-container.svelte';
	import PageHeader from '@/lib/components/ui/page-header.svelte';
	import BackendWarningBanner from '$lib/components/backend-warning-banner.svelte';
	import { siteConfig } from '@/lib/config/site';
	import { ArrowLeft, Loader2, Lock, LogIn, User } from '@lucide/svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	let loading = $state(false);
</script>

<PageHeader
	title="Login"
	subtitle={`Sign in to your ${siteConfig.siteName} account`}
	icon={LogIn}
/>

<PageContainer>
	{#snippet children()}
		<BackendWarningBanner />
		<div class="flex items-center justify-center">
			<div class="w-full max-w-sm">
				<!-- Back to Home Link -->
				<div class="mb-4 text-center">
					<a
						href="/"
						class="text-muted-foreground hover:text-primary inline-flex items-center gap-1 text-sm hover:underline"
					>
						<ArrowLeft class="h-3 w-3" />
						Back to Home
					</a>
				</div>

				<Card.Root>
					<Card.Header>
						<Card.Title class="text-2xl">Login</Card.Title>
						<Card.Description>Enter your username below to login to your account.</Card.Description>
					</Card.Header>
					<Card.Content class="grid gap-4">
						<form method="post" action="?/login" use:enhance class="grid gap-4">
							<div class="grid gap-2">
								<Label for="username" class="flex items-center gap-2">
									<User class="h-4 w-4" />
									Username
								</Label>
								<Input
									id="username"
									name="username"
									type="text"
									placeholder="hanivanrizky"
									value={form?.values?.username ?? ''}
									required
								/>
							</div>
							<div class="grid gap-2">
								<Label for="password" class="flex items-center gap-2">
									<Lock class="h-4 w-4" />
									Password
								</Label>
								<Input id="password" name="password" type="password" required />
							</div>
							{#if form?.error}
								<p class="text-destructive text-sm font-medium">{form.error}</p>
							{/if}
							<Button type="submit" class="flex w-full items-center gap-2" disabled={loading}>
								{#if loading}
									<Loader2 class="h-4 w-4 animate-spin" />
								{:else}
									<LogIn class="h-4 w-4" />
								{/if}
								{loading ? 'Please wait' : 'Login'}
							</Button>
							<div class="text-center">
								<p class="text-muted-foreground text-sm">
									Don't have an account?
									<a href="/auth/register" class="text-primary hover:underline">Register here</a>
								</p>
							</div>
						</form>
					</Card.Content>
				</Card.Root>
			</div>
		</div>
	{/snippet}
</PageContainer>
