<script lang="ts">
	import { goto } from '$app/navigation';
	import { createApiClient } from '$lib/api/client.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import EditIcon from '@lucide/svelte/icons/edit';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import MoreHorizontalIcon from '@lucide/svelte/icons/more-horizontal';
	import TrashIcon from '@lucide/svelte/icons/trash';
	import { useQueryClient } from '@tanstack/svelte-query';
	import { toast } from 'svelte-sonner';

	let {
		link,
		baseUrl,
		sessionToken
	}: {
		link: {
			id: number;
			short_code: string;
			original_url: string;
			is_active: boolean;
		};
		baseUrl: string;
		sessionToken: string;
	} = $props();

	const queryClient = useQueryClient();

	async function copyShortUrl() {
		try {
			const shortUrl = `${baseUrl}/api/s/${link.short_code}`;
			await navigator.clipboard.writeText(shortUrl);
			toast.success('Short URL copied!', {
				description: shortUrl
			});
		} catch (err) {
			console.error('Failed to copy: ', err);
			toast.error('Failed to copy', {
				description: 'Unable to copy short URL to clipboard'
			});
		}
	}

	function editLink() {
		goto(`/links/${link.short_code}/update`);
	}

	async function confirmDelete() {
		try {
			const apiClient = createApiClient(sessionToken);
			await apiClient.delete(`/api/s/${link.short_code}`);

			// Show success message
			toast.success('Link deleted successfully!', {
				description: `Short code: ${link.short_code}`
			});

			// Invalidate the links query to refresh the data
			queryClient.invalidateQueries({ queryKey: ['links'] });
		} catch (error: any) {
			console.error('Failed to delete link:', error);

			// Show error message
			const errorMessage =
				error?.response?.data?.message || error?.message || 'Failed to delete link';
			toast.error('Delete failed', {
				description: errorMessage
			});
		}
	}
</script>

<AlertDialog.Root>
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
			<AlertDialog.Trigger>
				{#snippet child({ props })}
					<DropdownMenu.Item {...props} class="text-red-600">
						<TrashIcon class="mr-2 h-4 w-4" />
						<span>Delete</span>
					</DropdownMenu.Item>
				{/snippet}
			</AlertDialog.Trigger>
		</DropdownMenu.Content>
	</DropdownMenu.Root>

	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
			<AlertDialog.Description>
				This action cannot be undone. This will permanently delete your link and remove all
				associated data.
				<br /><br />
				<strong>Short Code:</strong>
				{link.short_code}<br />
				<strong>Original URL:</strong>
				{link.original_url}
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action onclick={confirmDelete} class="bg-red-600 hover:bg-red-700">
				Delete Link
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
