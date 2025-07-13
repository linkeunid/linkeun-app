<script lang="ts">
	import { siteConfig } from '@/lib/config/site';
	import type { Component, Snippet } from 'svelte';

	interface Props {
		title: string;
		subtitle?: string;
		icon?: Component;
		actions?: Snippet;
	}

	let { title, subtitle, icon, actions }: Props = $props();
</script>

<svelte:head>
	<title>{title} - {siteConfig.siteName}</title>
	<meta
		name="description"
		content={subtitle ??
			'Welcome to {siteConfig.siteName} - A modern SvelteKit application with link management and developer tools.'}
	/>
	<meta property="og:title" content={`${title} - {siteConfig.siteName}`} />
	<meta
		property="og:description"
		content={subtitle ??
			`Welcome to ${siteConfig.siteName} - A modern SvelteKit application with link management and developer tools.`}
	/>
	<meta property="og:type" content="website" />
</svelte:head>

<div class="container mx-auto pt-10 pb-0">
	<div class="flex items-center justify-between">
		<div>
			<div class="mb-2 flex items-center gap-2">
				{#if icon}
					<svelte:component this={icon} class="h-6 w-6" />
				{/if}
				<h1 class="text-3xl font-bold tracking-tight">{title}</h1>
			</div>
			{#if subtitle}
				<p class="text-muted-foreground">{subtitle}</p>
			{/if}
		</div>
		{#if actions}
			<div class="ml-auto">
				{@render actions()}
			</div>
		{/if}
	</div>
</div>
