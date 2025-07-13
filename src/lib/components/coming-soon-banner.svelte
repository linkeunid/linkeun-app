<script lang="ts">
	import { Construction, Clock, Rocket } from '@lucide/svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';

	let { 
		title = "Coming Soon",
		description = "This feature is currently under development. We're working hard to bring you the best experience.",
		showBackendNote = true
	}: {
		title?: string;
		description?: string;
		showBackendNote?: boolean;
	} = $props();
</script>

<div class="flex items-center justify-center min-h-[60vh] p-4">
	<Card class="w-full max-w-md text-center">
		<CardHeader class="pb-4">
			<div class="flex justify-center mb-4">
				<div class="p-3 bg-primary/10 rounded-full">
					<Construction class="h-8 w-8 text-primary" />
				</div>
			</div>
			<CardTitle class="text-2xl font-bold">{title}</CardTitle>
			<CardDescription class="text-base">
				{description}
			</CardDescription>
		</CardHeader>
		<CardContent class="pt-0">
			<div class="space-y-4">
				<Badge variant="secondary" class="inline-flex items-center gap-2">
					<Clock class="h-3 w-3" />
					In Development
				</Badge>
				
				{#if showBackendNote}
					<div class="p-3 bg-muted/50 rounded-lg">
						<div class="flex items-center justify-center gap-2 text-sm text-muted-foreground">
							<Rocket class="h-4 w-4" />
							<span>Frontend ready • Backend coming next</span>
						</div>
					</div>
				{/if}
				
				<p class="text-sm text-muted-foreground">
					Thank you for your patience. We'll have this ready soon!
				</p>
			</div>
		</CardContent>
	</Card>
</div>