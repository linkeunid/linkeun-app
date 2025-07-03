<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Globe, ShieldCheck, Wrench } from '@lucide/svelte';
</script>

<svelte:head>
	<title>Demo - LinkeunApp</title>
	<meta
		name="description"
		content="Explore various demos including Lucia authentication and Paraglide internationalization features."
	/>
	<meta property="og:title" content="Demo - LinkeunApp" />
	<meta
		property="og:description"
		content="Explore various demos including Lucia authentication and Paraglide internationalization features."
	/>
	<meta property="og:type" content="website" />
</svelte:head>

<div class="grid auto-rows-min gap-4 md:grid-cols-2">
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<ShieldCheck class="h-5 w-5" />
				Lucia Authentication Demo
			</Card.Title>
			<Card.Description>
				Test the Lucia authentication system with session management and secure login.
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<p class="text-muted-foreground mb-4 text-sm">
				Explore a complete authentication flow using Lucia for session management.
			</p>
			<Button href="/demo/lucia" class="flex items-center gap-2">
				<ShieldCheck class="h-4 w-4" />
				Try Lucia Demo
			</Button>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<Globe class="h-5 w-5" />
				Paraglide Internationalization
			</Card.Title>
			<Card.Description>
				Experience multi-language support with Paraglide i18n integration.
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<p class="text-muted-foreground mb-4 text-sm">
				See how internationalization works with automatic language detection and switching.
			</p>
			<Button href="/demo/paraglide" variant="outline" class="flex items-center gap-2">
				<Globe class="h-4 w-4" />
				Try Paraglide Demo
			</Button>
		</Card.Content>
	</Card.Root>
</div>

<div class="bg-muted/50 min-h-[40vh] flex-1 rounded-xl p-6">
	<div class="mb-4 flex items-center gap-2">
		<Wrench class="h-5 w-5" />
		<h2 class="text-xl font-semibold">Demo Features</h2>
	</div>
	<div class="text-muted-foreground space-y-3 text-sm">
		<p>• Authentication systems with session management</p>
		<p>• Internationalization and language switching</p>
		<p>• Modern UI components and responsive design</p>
		<p>• Database integration with Drizzle ORM</p>
		<p>• Server-side validation and error handling</p>
	</div>
</div>
