<script lang="ts">
	let { isActive }: { isActive: boolean } = $props();
</script>

<div class="flex items-center">
	<span
		class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {isActive
			? 'bg-green-100 text-green-800'
			: 'bg-red-100 text-red-800'}"
	>
		{isActive ? 'Active' : 'Inactive'}
	</span>
</div>