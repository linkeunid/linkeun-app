<script lang="ts">
	let { isPrivate }: { isPrivate: boolean } = $props();
</script>

<div class="flex items-center">
	<span
		class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {isPrivate
			? 'bg-gray-100 text-gray-800'
			: 'bg-green-100 text-green-800'}"
	>
		{isPrivate ? 'Private' : 'Public'}
	</span>
</div>