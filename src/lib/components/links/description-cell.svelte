<script lang="ts">
	let { description }: { description: string | null } = $props();
</script>

<div class="max-w-xs truncate">
	{#if description}
		<span class="text-sm text-foreground" title={description}>{description}</span>
	{:else}
		<span class="text-muted-foreground">-</span>
	{/if}
</div>