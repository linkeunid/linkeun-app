<script lang="ts">
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';

	let { url }: { url: string } = $props();
</script>

<div class="max-w-md truncate">
	<a
		href={url}
		target="_blank"
		rel="noopener noreferrer"
		class="flex items-center space-x-1 text-blue-600 hover:underline"
	>
		<span>{url}</span>
		<ExternalLinkIcon class="h-3 w-3 opacity-70" />
	</a>
</div>