<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import PageHeader from '$lib/components/ui/page-header.svelte';
	import BackendWarningBanner from '@/lib/components/backend-warning-banner.svelte';
	import PageContainer from '@/lib/components/ui/page-container.svelte';
	import { siteConfig } from '@/lib/config/site';
	import EditIcon from '@lucide/svelte/icons/edit';
	import { useQueryClient } from '@tanstack/svelte-query';
	import { toast } from 'svelte-sonner';
	import type { ActionData, PageData } from './$types';

	const { data, form }: { data: PageData; form: ActionData } = $props();

	const queryClient = useQueryClient();

	let loading = $state(false);
	let passwordEditEnabled = $state(false);
	let originalUrl = $state(form?.data?.original_url || data.link?.original_url || '');
	let customAlias = $state(form?.data?.custom_alias || data.link?.custom_alias || '');
	let password = $state(form?.data?.password || '');
	let description = $state(form?.data?.description || data.link?.description || '');

	$effect(() => {
		if (form?.success) {
			toast.success('Link updated successfully!');
			// Invalidate links query to refetch data
			queryClient.invalidateQueries({ queryKey: ['links'] });
			goto('/links');
		}
	});
</script>

<svelte:head>
	<title>Update Link - {siteConfig.siteName}</title>
	<meta name="description" content="Update your shortened link settings and configuration." />
</svelte:head>

<PageHeader
	title="Update Link"
	subtitle="Modify your shortened link settings and configuration."
	icon={EditIcon}
/>

<PageContainer>
	{#snippet children()}
		<BackendWarningBanner />

		{#if data.notLoggedIn}
			<div class="mt-6 flex flex-col items-center justify-center py-12">
				<div class="text-center">
					<h2 class="text-foreground mb-2 text-xl font-semibold">Please Login First</h2>
					<p class="text-muted-foreground mb-6">You need to be logged in to update links.</p>
					<Button href="/auth/login" class="mr-2">Login</Button>
					<Button href="/auth/register" variant="outline">Register</Button>
				</div>
			</div>
		{:else if data.error}
			<div class="mt-6 flex flex-col items-center justify-center py-12">
				<div class="text-center">
					<h2 class="text-foreground mb-2 text-xl font-semibold">Error Loading Link</h2>
					<p class="text-muted-foreground mb-6">{data.error}</p>
					<Button href="/links">Back to Links</Button>
				</div>
			</div>
		{:else if !data.link}
			<div class="mt-6 flex flex-col items-center justify-center py-12">
				<div class="text-center">
					<h2 class="text-foreground mb-2 text-xl font-semibold">Link Not Found</h2>
					<p class="text-muted-foreground mb-6">The requested link could not be found.</p>
					<Button href="/links">Back to Links</Button>
				</div>
			</div>
		{:else}
			<Card.Root>
				<Card.Header>
					<Card.Title>Link Details</Card.Title>
					<Card.Description>Update your link settings and configuration options.</Card.Description>
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
								<Label for="custom_alias">Custom Alias</Label>
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
								<Label for="description">Description</Label>
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
								<div class="flex items-center justify-between">
									<Label for="password">Password Protection</Label>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onclick={() => {
											passwordEditEnabled = !passwordEditEnabled;
											if (!passwordEditEnabled) {
												password = ''; // Clear password when disabling
											}
										}}
									>
										{passwordEditEnabled ? 'Cancel' : 'Change Password'}
									</Button>
								</div>

								{#if passwordEditEnabled}
									<Input
										id="password"
										name="password"
										type="password"
										placeholder="Enter new password to protect your link"
										bind:value={password}
										class="w-full"
									/>
									<p class="text-muted-foreground text-sm">
										Enter a new password to protect your link, or leave empty to remove password
										protection.
									</p>
								{:else}
									<div class="bg-background rounded-md border border-dashed border-gray-300 p-3">
										<p class="text-muted-foreground text-sm">
											{data.link?.is_private
												? 'This link is currently password protected.'
												: 'This link is not password protected.'}
											Click "Change Password" to modify password settings.
										</p>
									</div>
									<!-- Hidden input to preserve form structure when password editing is disabled -->
									<input type="hidden" name="password" value="" />
								{/if}
							</div>

							<div class="flex gap-4">
								<Button type="submit" disabled={loading} class="flex-1">
									{loading ? 'Updating...' : 'Update Link'}
								</Button>
								<Button type="button" variant="outline" href="/links">Cancel</Button>
							</div>
						</div>
					</form>

					{#if data.link}
						<div class="mt-6 border-t pt-6">
							<h3 class="mb-4 text-lg font-semibold">Link Information</h3>
							<div class="grid grid-cols-2 gap-4 text-sm">
								<div>
									<p class="text-muted-foreground">Short Code:</p>
									<p class="font-mono">{data.link.short_code}</p>
								</div>
								<div>
									<p class="text-muted-foreground">Clicks:</p>
									<p class="font-semibold">{data.link.clicks_count}</p>
								</div>
								<div>
									<p class="text-muted-foreground">Created:</p>
									<p>{new Date(data.link.created_at).toLocaleDateString()}</p>
								</div>
								<div>
									<p class="text-muted-foreground">Updated:</p>
									<p>{new Date(data.link.updated_at).toLocaleDateString()}</p>
								</div>
							</div>
						</div>
					{/if}
				</Card.Content>
			</Card.Root>
		{/if}
	{/snippet}
</PageContainer>
