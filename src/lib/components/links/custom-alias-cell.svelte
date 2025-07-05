<script lang="ts">
	let { customAlias }: { customAlias: string | null } = $props();
</script>

<div class="flex items-center">
	{#if customAlias}
		<span class="text-blue-600 font-medium">{customAlias}</span>
	{:else}
		<span class="text-muted-foreground">-</span>
	{/if}
</div>