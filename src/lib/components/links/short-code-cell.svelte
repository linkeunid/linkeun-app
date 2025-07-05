<script lang="ts">
	import { toast } from "svelte-sonner";

	let { shortCode, baseUrl }: { shortCode: string; baseUrl: string } = $props();

	async function copyToClipboard() {
		try {
			const fullUrl = `${baseUrl}/api/s/${shortCode}`;
			await navigator.clipboard.writeText(fullUrl);
			toast.success("Short URL copied!", {
				description: fullUrl
			});
		} catch (err) {
			console.error('Failed to copy text: ', err);
			toast.error("Failed to copy", {
				description: "Unable to copy short URL to clipboard"
			});
		}
	}
</script>

<div class="flex items-center">
	<button 
		type="button"
		class="px-2 py-1 bg-muted text-sm rounded cursor-pointer hover:bg-muted/80 transition-colors font-mono"
		onclick={copyToClipboard}
		title="Click to copy short code"
	>
		{shortCode}
	</button>
</div>