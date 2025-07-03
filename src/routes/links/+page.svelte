<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button/index.js';
	import {
		FlexRender,
		createSvelteTable,
		renderComponent,
		renderSnippet
	} from '$lib/components/ui/data-table/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import ArrowUpNarrowWideIcon from '@lucide/svelte/icons/arrow-up-narrow-wide';
	import ArrowDownNarrowWideIcon from '@lucide/svelte/icons/arrow-down-narrow-wide';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import {
		type ColumnDef,
		type ColumnFiltersState,
		type PaginationState,
		type RowSelectionState,
		type SortingState,
		type VisibilityState,
		getCoreRowModel,
		getFilteredRowModel,
		getPaginationRowModel,
		getSortedRowModel
	} from '@tanstack/table-core';
	import { createRawSnippet } from 'svelte';
	import DataTableCheckbox from './data-table-checkbox.svelte';
	import DataTableRowActions from './data-table-row-actions.svelte';

	type Link = {
		id: number;
		short_code: string;
		original_url: string;
		custom_alias: string | null;
		description: string | null;
		clicks_count: number;
		is_active: boolean;
		created_at: string;
		updated_at: string;
		user_id: number;
	};

	const { data } = $props<PageData>();

	// Page size options for the select
	const pageSizeOptions = [
		{ value: '5', label: '5' },
		{ value: '10', label: '10' },
		{ value: '20', label: '20' },
		{ value: '30', label: '30' },
		{ value: '40', label: '40' },
		{ value: '50', label: '50' }
	];

	let pageSizeValue = $state('10');

	const pageSizeTriggerContent = $derived(
		pageSizeOptions.find((option) => option.value === pageSizeValue)?.label ?? '10'
	);

	function updateURL(searchParams: Record<string, string | number>) {
		const url = new URL($page.url);
		Object.entries(searchParams).forEach(([key, value]) => {
			if (value) {
				url.searchParams.set(key, value.toString());
			} else {
				url.searchParams.delete(key);
			}
		});
		goto(url.toString(), { replaceState: true });
	}

	const columns: ColumnDef<Link>[] = [
		{
			id: 'select',
			header: ({ table }) =>
				renderComponent(DataTableCheckbox, {
					checked: table.getIsAllPageRowsSelected(),
					indeterminate: table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected(),
					onCheckedChange: (value) => table.toggleAllPageRowsSelected(!!value),
					'aria-label': 'Select all'
				}),
			cell: ({ row }) =>
				renderComponent(DataTableCheckbox, {
					checked: row.getIsSelected(),
					onCheckedChange: (value) => row.toggleSelected(!!value),
					'aria-label': 'Select row'
				}),
			enableSorting: false,
			enableHiding: false
		},
		{
			accessorKey: 'short_code',
			header: ({ column }) => {
				const sortable = createRawSnippet<[]>(() => {
					const sortDirection = column.getIsSorted();
					const iconClass = "ml-2 h-4 w-4";
					let icon = '';
					if (sortDirection === 'asc') {
						icon = '<svg class="' + iconClass + '" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/><path d="M11 12h4"/><path d="M11 16h7"/><path d="M11 20h10"/></svg>';
					} else if (sortDirection === 'desc') {
						icon = '<svg class="' + iconClass + '" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="M11 4h4"/><path d="M11 8h7"/><path d="M11 12h10"/></svg>';
					} else {
						icon = '<svg class="' + iconClass + '" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/></svg>';
					}
					return {
						render: () => `
							<div class="flex items-center hover:text-accent-foreground">
								Short Code
								${icon}
							</div>
						`
					};
				});
				return renderSnippet(sortable, '');
			},
			cell: ({ row }) => {
				const shortCodeSnippet = createRawSnippet<[string]>((getShortCode) => {
					const shortCode = getShortCode();
					return {
						render: () => `
							<div class="flex items-center space-x-2">
								<code class="px-2 py-1 bg-muted text-sm rounded">${shortCode}</code>
								<span class="text-muted-foreground text-xs">http://localhost:3000/${shortCode}</span>
							</div>
						`
					};
				});
				return renderSnippet(shortCodeSnippet, row.getValue('short_code'));
			}
		},
		{
			accessorKey: 'original_url',
			header: ({ column }) => {
				const sortable = createRawSnippet<[]>(() => {
					const sortDirection = column.getIsSorted();
					const iconClass = "ml-2 h-4 w-4";
					let icon = '';
					if (sortDirection === 'asc') {
						icon = '<svg class="' + iconClass + '" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/><path d="M11 12h4"/><path d="M11 16h7"/><path d="M11 20h10"/></svg>';
					} else if (sortDirection === 'desc') {
						icon = '<svg class="' + iconClass + '" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="M11 4h4"/><path d="M11 8h7"/><path d="M11 12h10"/></svg>';
					} else {
						icon = '<svg class="' + iconClass + '" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/></svg>';
					}
					return {
						render: () => `
							<div class="flex items-center hover:text-accent-foreground">
								Original URL
								${icon}
							</div>
						`
					};
				});
				return renderSnippet(sortable, '');
			},
			cell: ({ row }) => {
				const urlSnippet = createRawSnippet<[string]>((getUrl) => {
					const url = getUrl();
					return {
						render: () => `
							<div class="max-w-md truncate">
								<a href="${url}" target="_blank" rel="noopener noreferrer" class="flex items-center space-x-1 text-blue-600 hover:underline">
									<span>${url}</span>
									<svg class="h-3 w-3 opacity-70" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>
								</a>
							</div>
						`
					};
				});
				return renderSnippet(urlSnippet, row.getValue('original_url'));
			}
		},
		{
			accessorKey: 'clicks_count',
			header: ({ column }) => {
				const sortable = createRawSnippet<[]>(() => {
					const sortDirection = column.getIsSorted();
					const iconClass = "ml-2 h-4 w-4";
					let icon = '';
					if (sortDirection === 'asc') {
						icon = '<svg class="' + iconClass + '" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/><path d="M11 12h4"/><path d="M11 16h7"/><path d="M11 20h10"/></svg>';
					} else if (sortDirection === 'desc') {
						icon = '<svg class="' + iconClass + '" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="M11 4h4"/><path d="M11 8h7"/><path d="M11 12h10"/></svg>';
					} else {
						icon = '<svg class="' + iconClass + '" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/></svg>';
					}
					return {
						render: () => `
							<div class="flex items-center hover:text-accent-foreground">
								Clicks
								${icon}
							</div>
						`
					};
				});
				return renderSnippet(sortable, '');
			},
			cell: ({ row }) => {
				const clicksSnippet = createRawSnippet<[number]>((getClicks) => {
					const clicks = getClicks();
					return {
						render: () => `
							<div class="text-center">
								<span class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
									${clicks}
								</span>
							</div>
						`
					};
				});
				return renderSnippet(clicksSnippet, row.getValue('clicks_count'));
			}
		},
		{
			accessorKey: 'is_active',
			header: 'Status',
			cell: ({ row }) => {
				const statusSnippet = createRawSnippet<[boolean]>((getStatus) => {
					const status = getStatus();
					return {
						render: () => `
							<div class="flex items-center">
								<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
									status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
								}">
									${status ? 'Active' : 'Inactive'}
								</span>
							</div>
						`
					};
				});
				return renderSnippet(statusSnippet, row.getValue('is_active'));
			}
		},
		{
			accessorKey: 'created_at',
			header: ({ column }) => {
				const sortable = createRawSnippet<[]>(() => {
					const sortDirection = column.getIsSorted();
					const iconClass = "ml-2 h-4 w-4";
					let icon = '';
					if (sortDirection === 'asc') {
						icon = '<svg class="' + iconClass + '" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/><path d="M11 12h4"/><path d="M11 16h7"/><path d="M11 20h10"/></svg>';
					} else if (sortDirection === 'desc') {
						icon = '<svg class="' + iconClass + '" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="M11 4h4"/><path d="M11 8h7"/><path d="M11 12h10"/></svg>';
					} else {
						icon = '<svg class="' + iconClass + '" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/></svg>';
					}
					return {
						render: () => `
							<div class="flex items-center hover:text-accent-foreground">
								Created
								${icon}
							</div>
						`
					};
				});
				return renderSnippet(sortable, '');
			},
			cell: ({ row }) => {
				const dateSnippet = createRawSnippet<[string]>((getDate) => {
					const date = getDate();
					return {
						render: () => `
							<div class="text-sm text-muted-foreground">
								${new Date(date).toLocaleDateString()}
							</div>
						`
					};
				});
				return renderSnippet(dateSnippet, row.getValue('created_at'));
			}
		},
		{
			id: 'actions',
			enableHiding: false,
			cell: ({ row }) => renderComponent(DataTableRowActions, { link: row.original })
		}
	];

	let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 10 });
	let sorting = $state<SortingState>([]);
	let columnFilters = $state<ColumnFiltersState>([]);
	let rowSelection = $state<RowSelectionState>({});
	let columnVisibility = $state<VisibilityState>({});

	const table = createSvelteTable({
		get data() {
			return data.links.data ?? [];
		},
		columns,
		state: {
			get pagination() {
				return pagination;
			},
			get sorting() {
				return sorting;
			},
			get columnVisibility() {
				return columnVisibility;
			},
			get rowSelection() {
				return rowSelection;
			},
			get columnFilters() {
				return columnFilters;
			}
		},
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onPaginationChange: (updater) => {
			if (typeof updater === 'function') {
				pagination = updater(pagination);
			} else {
				pagination = updater;
			}
		},
		onSortingChange: (updater) => {
			if (typeof updater === 'function') {
				sorting = updater(sorting);
			} else {
				sorting = updater;
			}
		},
		onColumnFiltersChange: (updater) => {
			if (typeof updater === 'function') {
				columnFilters = updater(columnFilters);
			} else {
				columnFilters = updater;
			}
		},
		onColumnVisibilityChange: (updater) => {
			if (typeof updater === 'function') {
				columnVisibility = updater(columnVisibility);
			} else {
				columnVisibility = updater;
			}
		},
		onRowSelectionChange: (updater) => {
			if (typeof updater === 'function') {
				rowSelection = updater(rowSelection);
			} else {
				rowSelection = updater;
			}
		}
	});
</script>

<div class="container mx-auto py-10">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">My Links</h1>
			<p class="text-muted-foreground">Manage your shortened links and track their performance.</p>
		</div>
		{#if !data.notLoggedIn}
			<Button href="/create" class="ml-auto">Create New Link</Button>
		{/if}
	</div>

	{#if data.error}
		<div class="mt-4 rounded-md border border-red-200 bg-red-50 p-4">
			<p class="text-red-800">{data.error}</p>
		</div>
	{/if}

	{#if data.notLoggedIn}
		<div class="mt-6 flex flex-col items-center justify-center py-12">
			<div class="text-center">
				<h2 class="text-foreground mb-2 text-xl font-semibold">Please Login First</h2>
				<p class="text-muted-foreground mb-6">
					You need to be logged in to view your shortened links.
				</p>
				<Button href="/auth/login" class="mr-2">Login</Button>
				<Button href="/auth/register" variant="outline">Register</Button>
			</div>
		</div>
	{:else}
		<div class="mt-6 w-full">
			<div class="flex items-center py-4">
				<Input
					placeholder="Filter URLs..."
					value={(table.getColumn('original_url')?.getFilterValue() as string) ?? ''}
					oninput={(e) => {
						table.getColumn('original_url')?.setFilterValue(e.currentTarget.value);
					}}
					class="max-w-sm"
				/>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<Button {...props} variant="outline" class="ml-auto">
								Columns <ChevronDownIcon class="ml-2 size-4" />
							</Button>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="end">
						{#each table.getAllColumns().filter((col) => col.getCanHide()) as column (column.id)}
							<DropdownMenu.CheckboxItem
								class="capitalize"
								checked={column.getIsVisible()}
								onCheckedChange={(v) => column.toggleVisibility(!!v)}
							>
								{column.id}
							</DropdownMenu.CheckboxItem>
						{/each}
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>

			<div class="rounded-md border">
				<Table.Root>
					<Table.Header>
						{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
							<Table.Row>
								{#each headerGroup.headers as header (header.id)}
									<Table.Head class="[&:has([role=checkbox])]:pl-3">
										{#if !header.isPlaceholder}
											{#if header.column.getCanSort()}
												<button
													type="button"
													class="hover:text-accent-foreground focus:ring-ring -m-1 flex items-center space-x-2 rounded-sm p-1 focus:ring-2 focus:ring-offset-2 focus:outline-none"
													onclick={header.column.getToggleSortingHandler()}
													onkeydown={(e) => {
														if (e.key === 'Enter' || e.key === ' ') {
															e.preventDefault();
															header.column.getToggleSortingHandler()?.(e);
														}
													}}
													aria-label={`Sort by ${header.column.id}`}
												>
													<FlexRender
														content={header.column.columnDef.header}
														context={header.getContext()}
													/>
												</button>
											{:else}
												<FlexRender
													content={header.column.columnDef.header}
													context={header.getContext()}
												/>
											{/if}
										{/if}
									</Table.Head>
								{/each}
							</Table.Row>
						{/each}
					</Table.Header>
					<Table.Body>
						{#each table.getRowModel().rows as row (row.id)}
							<Table.Row data-state={row.getIsSelected() && 'selected'}>
								{#each row.getVisibleCells() as cell (cell.id)}
									<Table.Cell class="[&:has([role=checkbox])]:pl-3">
										<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
									</Table.Cell>
								{/each}
							</Table.Row>
						{:else}
							<Table.Row>
								<Table.Cell colspan={columns.length} class="h-24 text-center"
									>No results.</Table.Cell
								>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</div>

			<div class="flex items-center justify-between space-x-2 py-4">
				<div class="text-muted-foreground flex-1 text-sm">
					{table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows
						.length} row(s) selected.
				</div>
				<div class="flex items-center space-x-2">
					<div class="flex items-center space-x-2">
						<p class="text-sm font-medium">Rows per page</p>
						<Select.Root
							type="single"
							bind:value={pageSizeValue}
							onValueChange={(value) => {
								if (value) {
									table.setPageSize(Number(value));
								}
							}}
						>
							<Select.Trigger class="h-8 w-[70px]">
								{pageSizeTriggerContent}
							</Select.Trigger>
							<Select.Content>
								<Select.Group>
									{#each pageSizeOptions as option (option.value)}
										<Select.Item value={option.value} label={option.label}>
											{option.label}
										</Select.Item>
									{/each}
								</Select.Group>
							</Select.Content>
						</Select.Root>
					</div>
					<div class="flex w-[100px] items-center justify-center text-sm font-medium">
						Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
					</div>
					<div class="flex items-center space-x-2">
						<Button
							variant="outline"
							size="sm"
							onclick={() => table.setPageIndex(0)}
							disabled={!table.getCanPreviousPage()}
						>
							First
						</Button>
						<Button
							variant="outline"
							size="sm"
							onclick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}
						>
							Previous
						</Button>
						<Button
							variant="outline"
							size="sm"
							onclick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}
						>
							Next
						</Button>
						<Button
							variant="outline"
							size="sm"
							onclick={() => table.setPageIndex(table.getPageCount() - 1)}
							disabled={!table.getCanNextPage()}
						>
							Last
						</Button>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
