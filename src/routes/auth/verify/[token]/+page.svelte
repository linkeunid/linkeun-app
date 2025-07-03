<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { ArrowLeft, LogIn, RefreshCw, XCircle } from '@lucide/svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Email Verification - LinkeunApp</title>
	<meta
		name="description"
		content="Verify your email address to activate your LinkeunApp account."
	/>
	<meta property="og:title" content="Email Verification - LinkeunApp" />
	<meta
		property="og:description"
		content="Verify your email address to activate your LinkeunApp account."
	/>
	<meta property="og:type" content="website" />
</svelte:head>

<div class="flex min-h-screen items-center justify-center">
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
			<Card.Header class="text-center">
				<div
					class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100"
				>
					<XCircle class="h-8 w-8 text-red-600" />
				</div>
				<Card.Title class="text-2xl text-red-800">Verification Failed</Card.Title>
				<Card.Description class="text-red-600">
					{data.message}
				</Card.Description>
			</Card.Header>

			<Card.Content class="space-y-4">
				<!-- Error State -->
				<div class="rounded-lg border bg-red-50 p-4">
					<div class="space-y-2 text-sm text-red-700">
						{#if data.statusCode === 401}
							<p>The verification token is invalid or has expired.</p>
							<p>Please request a new verification email.</p>
						{:else if data.statusCode === 500}
							<p>There was a server error processing your verification.</p>
							<p>Please try again or contact support if the problem persists.</p>
						{:else}
							<p>An unexpected error occurred during verification.</p>
						{/if}
					</div>
				</div>

				<div class="flex flex-col gap-2">
					<Button
						onclick={() => window.location.reload()}
						variant="outline"
						class="flex w-full items-center gap-2"
					>
						<RefreshCw class="h-4 w-4" />
						Try Again
					</Button>
					<Button href="/auth/register" variant="outline" class="flex w-full items-center gap-2">
						<LogIn class="h-4 w-4" />
						Register New Account
					</Button>
					<Button href="/" variant="ghost" class="flex w-full items-center gap-2">
						<ArrowLeft class="h-4 w-4" />
						Go to Homepage
					</Button>
				</div>

				<!-- Debug Info (only in development) -->
				{#if data.statusCode}
					<details class="mt-4">
						<summary class="text-muted-foreground cursor-pointer text-xs">Debug Info</summary>
						<div class="text-muted-foreground mt-2 text-xs">
							<p>Status Code: {data.statusCode}</p>
							<p>Success: {data.success}</p>
						</div>
					</details>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
</div>
