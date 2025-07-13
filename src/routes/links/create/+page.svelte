<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import BackendWarningBanner from '$lib/components/backend-warning-banner.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import PageContainer from '$lib/components/ui/page-container.svelte';
	import PageHeader from '$lib/components/ui/page-header.svelte';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import { useQueryClient } from '@tanstack/svelte-query';
	import { toast } from 'svelte-sonner';
	import type { ActionData, PageData } from './$types';

	const { data, form }: { data: PageData; form: ActionData } = $props();

	const queryClient = useQueryClient();

	let loading = $state(false);
	let originalUrl = $state(form?.data?.original_url || '');
	let customAlias = $state(form?.data?.custom_alias || '');
	let password = $state(form?.data?.password || '');
	let description = $state(form?.data?.description || '');

	$effect(() => {
		if (form?.success) {
			toast.success('Link created successfully!');
			// Invalidate links query to refetch data
			queryClient.invalidateQueries({ queryKey: ['links'] });
			goto('/links');
		}
	});
</script>

<PageHeader
	title="Create New Link"
	subtitle="Create a shortened link for your URL."
	icon={PlusIcon}
/>

<PageContainer>
	{#snippet children()}
		<BackendWarningBanner />

		{#if data.notLoggedIn}
			<div class="mt-6 flex flex-col items-center justify-center py-12">
				<div class="text-center">
					<h2 class="text-foreground mb-2 text-xl font-semibold">Please Login First</h2>
					<p class="text-muted-foreground mb-6">
						You need to be logged in to create shortened links.
					</p>
					<Button href="/auth/login" class="mr-2">Login</Button>
					<Button href="/auth/register" variant="outline">Register</Button>
				</div>
			</div>
		{:else}
			<Card.Root>
				<Card.Header>
					<Card.Title>Link Details</Card.Title>
					<Card.Description>
						Enter the URL you want to shorten and customize with optional settings.
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<form
						method="POST"
						use:enhance={() => {
							loading = true;
							return async ({ update }) => {
								loading = false;
								update();
							};
						}}
					>
						<div class="space-y-6">
							<div class="space-y-2">
								<Label for="original_url">Original URL *</Label>
								<Input
									id="original_url"
									name="original_url"
									type="url"
									placeholder="https://example.com"
									bind:value={originalUrl}
									required
									class="w-full"
								/>
								{#if form?.error}
									<p class="text-sm text-red-600">{form.error}</p>
								{/if}
							</div>

							<div class="space-y-2">
								<Label for="custom_alias">Custom Alias (Optional)</Label>
								<Input
									id="custom_alias"
									name="custom_alias"
									type="text"
									placeholder="my-custom-link"
									bind:value={customAlias}
									class="w-full"
								/>
								<p class="text-muted-foreground text-sm">
									Create a custom short code instead of a randomly generated one.
								</p>
							</div>

							<div class="space-y-2">
								<Label for="description">Description (Optional)</Label>
								<Input
									id="description"
									name="description"
									type="text"
									placeholder="Brief description of your link"
									bind:value={description}
									class="w-full"
								/>
								<p class="text-muted-foreground text-sm">
									Add a description to help you remember what this link is for.
								</p>
							</div>

							<div class="space-y-2">
								<Label for="password">Password (Optional)</Label>
								<Input
									id="password"
									name="password"
									type="password"
									placeholder="Enter password to protect your link"
									bind:value={password}
									class="w-full"
								/>
								<p class="text-muted-foreground text-sm">
									If you set a password, users will need to enter it to access the original URL.
								</p>
							</div>

							<div class="flex gap-4">
								<Button type="submit" disabled={loading} class="flex-1">
									{loading ? 'Creating...' : 'Create Link'}
								</Button>
								<Button type="button" variant="outline" href="/links">Cancel</Button>
							</div>
						</div>
					</form>
				</Card.Content>
			</Card.Root>
		{/if}
	{/snippet}
</PageContainer>
