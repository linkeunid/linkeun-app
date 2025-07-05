<script lang="ts">
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
</script>

<Table.Row>
	<Table.Cell class="[&:has([role=checkbox])]:pl-3">
		<Skeleton class="h-4 w-4" />
	</Table.Cell>
	<Table.Cell>
		<Skeleton class="h-4 w-24" />
	</Table.Cell>
	<Table.Cell>
		<Skeleton class="h-4 w-48" />
	</Table.Cell>
	<Table.Cell>
		<Skeleton class="h-4 w-20" />
	</Table.Cell>
	<Table.Cell>
		<Skeleton class="h-4 w-32" />
	</Table.Cell>
	<Table.Cell>
		<Skeleton class="h-4 w-12" />
	</Table.Cell>
	<Table.Cell>
		<Skeleton class="h-4 w-16" />
	</Table.Cell>
	<Table.Cell>
		<Skeleton class="h-4 w-16" />
	</Table.Cell>
	<Table.Cell>
		<Skeleton class="h-4 w-20" />
	</Table.Cell>
	<Table.Cell>
		<Skeleton class="h-4 w-20" />
	</Table.Cell>
	<Table.Cell>
		<Skeleton class="h-8 w-8" />
	</Table.Cell>
</Table.Row>