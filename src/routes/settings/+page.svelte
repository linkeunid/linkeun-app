<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { AlertCircle, CheckCircle, Eye, EyeOff, Loader2, Lock, Save, User } from '@lucide/svelte';
	import type { PageData } from './$types';

	let {
		data,
		form
	}: {
		data: PageData;
		form: {
			profileError?: string;
			profileSuccess?: string;
			profileValues?: { name: unknown; username: unknown };
			passwordError?: string;
			passwordSuccess?: string;
		} | null;
	} = $props();

	let profileLoading = $state(false);
	let passwordLoading = $state(false);
	let showCurrentPassword = $state(false);
	let showNewPassword = $state(false);
	let showConfirmPassword = $state(false);
</script>

<svelte:head>
	<title>Settings - LinkeunApp</title>
	<meta name="description" content="Manage your account settings and preferences." />
	<meta property="og:title" content="Settings - LinkeunApp" />
	<meta property="og:description" content="Manage your account settings and preferences." />
	<meta property="og:type" content="website" />
</svelte:head>

<div class="grid auto-rows-min gap-6 md:grid-cols-2">
	<!-- Profile Settings -->
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<User class="h-5 w-5" />
				Profile Information
			</Card.Title>
			<Card.Description>Update your personal information and account details.</Card.Description>
		</Card.Header>
		<Card.Content>
			<form
				method="post"
				action="?/updateProfile"
				use:enhance={() => {
					profileLoading = true;
					return async ({ update }) => {
						profileLoading = false;
						await update();
					};
				}}
				class="space-y-4"
			>
				<div class="space-y-2">
					<Label for="name" class="flex items-center gap-2">
						<User class="h-4 w-4" />
						Full Name
					</Label>
					<Input
						id="name"
						name="name"
						type="text"
						placeholder="Enter your full name"
						value={form?.profileValues?.name ?? data.user?.name ?? ''}
						required
					/>
				</div>

				<div class="space-y-2">
					<Label for="username" class="flex items-center gap-2">
						<User class="h-4 w-4" />
						Username
					</Label>
					<Input
						id="username"
						name="username"
						type="text"
						placeholder="Enter your username"
						value={form?.profileValues?.username ?? data.user?.username ?? ''}
						required
					/>
				</div>

				{#if form?.profileError}
					<div class="rounded-lg border border-red-200 bg-red-50 p-3">
						<div class="flex items-center gap-2">
							<AlertCircle class="h-4 w-4 text-red-600" />
							<p class="text-sm text-red-800">{form.profileError}</p>
						</div>
					</div>
				{/if}

				{#if form?.profileSuccess}
					<div class="rounded-lg border border-green-200 bg-green-50 p-3">
						<div class="flex items-center gap-2">
							<CheckCircle class="h-4 w-4 text-green-600" />
							<p class="text-sm text-green-800">{form.profileSuccess}</p>
						</div>
					</div>
				{/if}

				<Button type="submit" class="flex w-full items-center gap-2" disabled={profileLoading}>
					{#if profileLoading}
						<Loader2 class="h-4 w-4 animate-spin" />
					{:else}
						<Save class="h-4 w-4" />
					{/if}
					{profileLoading ? 'Saving...' : 'Save Changes'}
				</Button>
			</form>
		</Card.Content>
	</Card.Root>

	<!-- Password Settings -->
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<Lock class="h-5 w-5" />
				Change Password
			</Card.Title>
			<Card.Description>Update your password to keep your account secure.</Card.Description>
		</Card.Header>
		<Card.Content>
			<form
				method="post"
				action="?/updatePassword"
				use:enhance={() => {
					passwordLoading = true;
					return async ({ update }) => {
						passwordLoading = false;
						await update();
					};
				}}
				class="space-y-4"
			>
				<div class="space-y-2">
					<Label for="currentPassword" class="flex items-center gap-2">
						<Lock class="h-4 w-4" />
						Current Password
					</Label>
					<div class="relative">
						<Input
							id="currentPassword"
							name="currentPassword"
							type={showCurrentPassword ? 'text' : 'password'}
							placeholder="Enter your current password"
							required
						/>
						<button
							type="button"
							onclick={() => (showCurrentPassword = !showCurrentPassword)}
							class="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700"
						>
							{#if showCurrentPassword}
								<EyeOff class="h-4 w-4" />
							{:else}
								<Eye class="h-4 w-4" />
							{/if}
						</button>
					</div>
				</div>

				<div class="space-y-2">
					<Label for="newPassword" class="flex items-center gap-2">
						<Lock class="h-4 w-4" />
						New Password
					</Label>
					<div class="relative">
						<Input
							id="newPassword"
							name="newPassword"
							type={showNewPassword ? 'text' : 'password'}
							placeholder="Enter your new password"
							required
						/>
						<button
							type="button"
							onclick={() => (showNewPassword = !showNewPassword)}
							class="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700"
						>
							{#if showNewPassword}
								<EyeOff class="h-4 w-4" />
							{:else}
								<Eye class="h-4 w-4" />
							{/if}
						</button>
					</div>
				</div>

				<div class="space-y-2">
					<Label for="confirmPassword" class="flex items-center gap-2">
						<Lock class="h-4 w-4" />
						Confirm New Password
					</Label>
					<div class="relative">
						<Input
							id="confirmPassword"
							name="confirmPassword"
							type={showConfirmPassword ? 'text' : 'password'}
							placeholder="Confirm your new password"
							required
						/>
						<button
							type="button"
							onclick={() => (showConfirmPassword = !showConfirmPassword)}
							class="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700"
						>
							{#if showConfirmPassword}
								<EyeOff class="h-4 w-4" />
							{:else}
								<Eye class="h-4 w-4" />
							{/if}
						</button>
					</div>
				</div>

				{#if form?.passwordError}
					<div class="rounded-lg border border-red-200 bg-red-50 p-3">
						<div class="flex items-center gap-2">
							<AlertCircle class="h-4 w-4 text-red-600" />
							<p class="text-sm text-red-800">{form.passwordError}</p>
						</div>
					</div>
				{/if}

				{#if form?.passwordSuccess}
					<div class="rounded-lg border border-green-200 bg-green-50 p-3">
						<div class="flex items-center gap-2">
							<CheckCircle class="h-4 w-4 text-green-600" />
							<p class="text-sm text-green-800">{form.passwordSuccess}</p>
						</div>
					</div>
				{/if}

				<Button type="submit" class="flex w-full items-center gap-2" disabled={passwordLoading}>
					{#if passwordLoading}
						<Loader2 class="h-4 w-4 animate-spin" />
					{:else}
						<Lock class="h-4 w-4" />
					{/if}
					{passwordLoading ? 'Updating...' : 'Update Password'}
				</Button>
			</form>
		</Card.Content>
	</Card.Root>
</div>

<!-- Account Information -->
<div class="bg-muted/50 rounded-xl p-6">
	<h2 class="mb-4 text-xl font-semibold">Account Information</h2>
	<div class="grid gap-4 md:grid-cols-3">
		<div>
			<p class="text-muted-foreground text-sm font-medium">Email Address</p>
			<p class="text-sm">{data.user?.email ?? 'Not available'}</p>
		</div>
		<div>
			<p class="text-muted-foreground text-sm font-medium">Account Created</p>
			<p class="text-sm">
				{data.user?.created_at
					? new Date(data.user.created_at).toLocaleDateString()
					: 'Not available'}
			</p>
		</div>
		<div>
			<p class="text-muted-foreground text-sm font-medium">Last Updated</p>
			<p class="text-sm">
				{data.user?.updated_at
					? new Date(data.user.updated_at).toLocaleDateString()
					: 'Not available'}
			</p>
		</div>
	</div>
</div>
