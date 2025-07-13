<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import PageContainer from '@/lib/components/ui/page-container.svelte';
	import PageHeader from '@/lib/components/ui/page-header.svelte';
	import { siteConfig } from '@/lib/config/site';
	import {
		ArrowLeft,
		CheckCircle,
		Loader2,
		Lock,
		LogIn,
		Mail,
		User,
		UserPlus
	} from '@lucide/svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	let loading = $state(false);
</script>

<PageHeader
	title="Register"
	subtitle={`Create a new ${siteConfig.siteName} account`}
	icon={UserPlus}
/>

<PageContainer>
	{#snippet children()}
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
						<Card.Title class="text-2xl">Register</Card.Title>
						<Card.Description>Create a new account to get started.</Card.Description>
					</Card.Header>
					<Card.Content class="grid gap-4">
						{#if form?.success}
							<div class="rounded-lg border border-green-200 bg-green-50 p-4">
								<div class="mb-2 flex items-center gap-2">
									<CheckCircle class="h-5 w-5 text-green-600" />
									<p class="text-sm font-medium text-green-800">{form.message}</p>
								</div>
								<div class="mt-3">
									<Button href="/auth/login" class="flex w-full items-center gap-2">
										<LogIn class="h-4 w-4" />
										Go to Login
									</Button>
								</div>
							</div>
						{:else}
							<form
								method="post"
								action="?/register"
								use:enhance={() => {
									loading = true;
									return async ({ update }) => {
										loading = false;
										await update();
									};
								}}
								class="grid gap-4"
							>
								<div class="grid gap-2">
									<Label for="email" class="flex items-center gap-2">
										<Mail class="h-4 w-4" />
										Email
									</Label>
									<Input
										id="email"
										name="email"
										type="email"
										placeholder="test@example.com"
										value={form?.values?.email ?? ''}
										required
									/>
								</div>
								<div class="grid gap-2">
									<Label for="username" class="flex items-center gap-2">
										<User class="h-4 w-4" />
										Username
									</Label>
									<Input
										id="username"
										name="username"
										type="text"
										placeholder="johndoe"
										value={form?.values?.username ?? ''}
										required
									/>
								</div>
								<div class="grid gap-2">
									<Label for="name" class="flex items-center gap-2">
										<User class="h-4 w-4" />
										Full Name
									</Label>
									<Input
										id="name"
										name="name"
										type="text"
										placeholder="John Doe"
										value={form?.values?.name ?? ''}
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
										<UserPlus class="h-4 w-4" />
									{/if}
									{loading ? 'Please wait' : 'Register'}
								</Button>
								<div class="text-center">
									<p class="text-muted-foreground text-sm">
										Already have an account?
										<a href="/auth/login" class="text-primary hover:underline">Login here</a>
									</p>
								</div>
							</form>
						{/if}
					</Card.Content>
				</Card.Root>
			</div>
		</div>
	{/snippet}
</PageContainer>
