<script lang="ts">
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
</script>

<div class="flex items-center justify-between space-x-2 py-4">
	<div class="text-muted-foreground flex-1 text-sm">
		<Skeleton class="h-4 w-32" />
	</div>
	<div class="flex items-center space-x-2">
		<div class="flex items-center space-x-2">
			<Skeleton class="h-4 w-20" />
			<Skeleton class="h-8 w-16" />
		</div>
		<div class="flex w-[100px] items-center justify-center text-sm font-medium">
			<Skeleton class="h-4 w-20" />
		</div>
		<div class="flex items-center space-x-2">
			<Skeleton class="h-8 w-12" />
			<Skeleton class="h-8 w-16" />
			<Skeleton class="h-8 w-12" />
			<Skeleton class="h-8 w-12" />
		</div>
	</div>
</div>