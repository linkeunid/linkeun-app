<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import MoreHorizontalIcon from '@lucide/svelte/icons/more-horizontal';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import EditIcon from '@lucide/svelte/icons/edit';
	import TrashIcon from '@lucide/svelte/icons/trash';
	import { toast } from "svelte-sonner";

	let {
		link,
		baseUrl
	}: {
		link: {
			id: number;
			short_code: string;
			original_url: string;
			is_active: boolean;
		};
		baseUrl: string;
	} = $props();

	async function copyShortUrl() {
		try {
			const shortUrl = `${baseUrl}/api/s/${link.short_code}`;
			await navigator.clipboard.writeText(shortUrl);
			toast.success("Short URL copied!", {
				description: shortUrl
			});
		} catch (err) {
			console.error('Failed to copy: ', err);
			toast.error("Failed to copy", {
				description: "Unable to copy short URL to clipboard"
			});
		}
	}

	function editLink() {
		// TODO: Implement edit functionality
		console.log('Edit link:', link.id);
	}

	function deleteLink() {
		// TODO: Implement delete functionality
		console.log('Delete link:', link.id);
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="ghost" class="h-8 w-8 p-0">
				<span class="sr-only">Open menu</span>
				<MoreHorizontalIcon class="h-4 w-4" />
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Label>Actions</DropdownMenu.Label>
		<DropdownMenu.Item onclick={copyShortUrl}>
			<CopyIcon class="mr-2 h-4 w-4" />
			<span>Copy short URL</span>
		</DropdownMenu.Item>
		<DropdownMenu.Separator />
		<DropdownMenu.Item onclick={() => window.open(link.original_url, '_blank')}>
			<ExternalLinkIcon class="mr-2 h-4 w-4" />
			<span>Visit original URL</span>
		</DropdownMenu.Item>
		<DropdownMenu.Separator />
		<DropdownMenu.Item onclick={editLink}>
			<EditIcon class="mr-2 h-4 w-4" />
			<span>Edit</span>
		</DropdownMenu.Item>
		<DropdownMenu.Item onclick={deleteLink} class="text-red-600">
			<TrashIcon class="mr-2 h-4 w-4" />
			<span>Delete</span>
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
