<script lang="ts">
	let { clicks }: { clicks: number } = $props();
</script>

<div class="text-center">
	<span class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
		{clicks}
	</span>
</div>