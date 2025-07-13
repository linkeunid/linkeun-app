<script lang="ts">
	import { Info, Server } from '@lucide/svelte';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
</script>

<Alert class="mb-6 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
	<Server class="h-4 w-4 text-amber-600 dark:text-amber-400" />
	<AlertDescription class="text-amber-800 dark:text-amber-200">
		<strong>Backend Not Connected:</strong> This feature requires backend API integration which is not yet deployed. 
		Frontend interface is ready for when the backend (Golang) is available.
	</AlertDescription>
</Alert>