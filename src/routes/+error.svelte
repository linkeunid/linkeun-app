<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Home } from '@lucide/svelte';
</script>

<div class="flex h-screen items-center justify-center">
	<Card.Root class="w-[420px]">
		<Card.Header class="text-center">
			<Card.Title class="text-7xl">404</Card.Title>
			<Card.Description>{page.error?.message}</Card.Description>
		</Card.Header>
		<Card.Content class="text-center">
			<p>We can't seem to find the page you are looking for.</p>
		</Card.Content>
		<Card.Footer>
			<Button class="w-full" href="/">
				<Home class="mr-2 h-4 w-4" />
				Go to Homepage
			</Button>
		</Card.Footer>
	</Card.Root>
</div>
