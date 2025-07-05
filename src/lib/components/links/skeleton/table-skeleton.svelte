<script lang="ts">
	import * as Table from '$lib/components/ui/table/index.js';
	import TableRowSkeleton from './table-row-skeleton.svelte';

	const { rows = 5 } = $props<{ rows?: number }>();
</script>

<div class="rounded-md border">
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head class="[&:has([role=checkbox])]:pl-3">
					<div class="h-4 w-4"></div>
				</Table.Head>
				<Table.Head>Short Code</Table.Head>
				<Table.Head>Original URL</Table.Head>
				<Table.Head>Custom Alias</Table.Head>
				<Table.Head>Description</Table.Head>
				<Table.Head>Clicks</Table.Head>
				<Table.Head>Status</Table.Head>
				<Table.Head>Privacy</Table.Head>
				<Table.Head>Created</Table.Head>
				<Table.Head>Updated</Table.Head>
				<Table.Head></Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each Array(rows) as _, i (i)}
				<TableRowSkeleton />
			{/each}
		</Table.Body>
	</Table.Root>
</div>