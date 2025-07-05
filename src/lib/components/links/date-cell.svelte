<script lang="ts">
	let { date }: { date: string } = $props();
</script>

<div class="text-sm text-muted-foreground">
	{new Date(date).toLocaleDateString()}
</div>