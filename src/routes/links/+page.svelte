<script lang="ts">
	import { env } from '$env/dynamic/public';
	import ClicksCell from '$lib/components/links/clicks-cell.svelte';
	import CustomAliasCell from '$lib/components/links/custom-alias-cell.svelte';
	import DataTableCheckbox from '$lib/components/links/data-table-checkbox.svelte';
	import DataTableRowActions from '$lib/components/links/data-table-row-actions.svelte';
	import DateCell from '$lib/components/links/date-cell.svelte';
	import DescriptionCell from '$lib/components/links/description-cell.svelte';
	import PrivacyCell from '$lib/components/links/privacy-cell.svelte';
	import ShortCodeCell from '$lib/components/links/short-code-cell.svelte';
	import { PaginationSkeleton, TableSkeleton } from '$lib/components/links/skeleton/index.js';
	import StatusCell from '$lib/components/links/status-cell.svelte';
	import UrlCell from '$lib/components/links/url-cell.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import {
		FlexRender,
		createSvelteTable,
		renderComponent
	} from '$lib/components/ui/data-table/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { useLinks } from '@/lib/hooks/useLinks';
	import ArrowDownNarrowWideIcon from '@lucide/svelte/icons/arrow-down-narrow-wide';
	import ArrowUpDownIcon from '@lucide/svelte/icons/arrow-up-down';
	import ArrowUpNarrowWideIcon from '@lucide/svelte/icons/arrow-up-narrow-wide';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import {
		type ColumnDef,
		type ColumnFiltersState,
		type PaginationState,
		type RowSelectionState,
		type SortingState,
		type VisibilityState,
		getCoreRowModel
	} from '@tanstack/table-core';
	import { toast } from 'svelte-sonner';
	import type { Link } from './types/links.type';

	type PageData = {
		notLoggedIn: boolean;
		sessionToken: string | null;
	};

	const { data }: { data: PageData } = $props();

	// Get base URL for short links
	const baseUrl = env.PUBLIC_API_BASE_URL || 'http://localhost:3000';

	// Client-side search state
	let searchValue = $state('');
	let debouncedSearchValue = $state('');

	// Use a regular variable for timeout to avoid reactivity loop
	let debounceTimer: ReturnType<typeof setTimeout> | undefined;

	$effect(() => {
		// console.log('searchValue changed to:', searchValue);
		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}

		debounceTimer = setTimeout(() => {
			debouncedSearchValue = searchValue;
			// console.log('Updated debouncedSearchValue to:', searchValue);
		}, 300);

		return () => {
			if (debounceTimer) {
				clearTimeout(debounceTimer);
			}
		};
	});

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

	// Client-side pagination state
	let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 10 });
	let sorting = $state<SortingState>([]);
	let columnFilters = $state<ColumnFiltersState>([]);
	let rowSelection = $state<RowSelectionState>({});
	let columnVisibility = $state<VisibilityState>({});

	const linksQuery = $derived.by(() =>
		useLinks(
			{
				search: debouncedSearchValue,
				page: pagination.pageIndex + 1,
				per_page: pagination.pageSize,
				sortBy: sorting[0]?.id ?? 'updated_at',
				sort: sorting[0]?.desc ? 'asc' : 'desc'
			},
			data.sessionToken!
		)
	);

	// Show toast for errors
	$effect(() => {
		// console.log($testQuery.data, 'testQuery');
		if ($linksQuery.error) {
			const errorMessage =
				$linksQuery.error?.response?.data?.message ||
				$linksQuery.error?.message ||
				'Failed to load links';
			toast.error(errorMessage);
		}
	});

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
			header: 'Short Code',
			cell: ({ row }) =>
				renderComponent(ShortCodeCell, {
					shortCode: row.getValue('short_code') as string,
					baseUrl
				})
		},
		{
			accessorKey: 'original_url',
			header: 'Original URL',
			cell: ({ row }) =>
				renderComponent(UrlCell, {
					url: row.getValue('original_url') as string
				})
		},
		{
			accessorKey: 'custom_alias',
			header: 'Custom Alias',
			cell: ({ row }) =>
				renderComponent(CustomAliasCell, {
					customAlias: row.getValue('custom_alias') as string | null
				})
		},
		{
			accessorKey: 'description',
			header: 'Description',
			cell: ({ row }) =>
				renderComponent(DescriptionCell, {
					description: row.getValue('description') as string | null
				})
		},
		{
			accessorKey: 'clicks_count',
			header: 'Clicks',
			cell: ({ row }) =>
				renderComponent(ClicksCell, {
					clicks: row.getValue('clicks_count') as number
				})
		},
		{
			accessorKey: 'is_active',
			header: 'Status',
			cell: ({ row }) =>
				renderComponent(StatusCell, {
					isActive: row.getValue('is_active') as boolean
				})
		},
		{
			accessorKey: 'is_private',
			header: 'Privacy',
			cell: ({ row }) =>
				renderComponent(PrivacyCell, {
					isPrivate: row.getValue('is_private') as boolean
				})
		},
		{
			accessorKey: 'created_at',
			header: 'Created',
			cell: ({ row }) =>
				renderComponent(DateCell, {
					date: row.getValue('created_at') as string
				})
		},
		{
			accessorKey: 'updated_at',
			header: 'Updated',
			cell: ({ row }) =>
				renderComponent(DateCell, {
					date: row.getValue('updated_at') as string
				})
		},
		{
			id: 'actions',
			enableHiding: false,
			cell: ({ row }) =>
				renderComponent(DataTableRowActions, {
					link: row.original,
					baseUrl,
					sessionToken: data.sessionToken!
				})
		}
	];

	const table = $derived(
		createSvelteTable({
			manualPagination: true,
			pageCount: $linksQuery?.data?.meta?.last_page ?? -1,
			get data() {
				if (
					$linksQuery.isSuccess &&
					$linksQuery.data?.code === 200 &&
					Array.isArray($linksQuery.data.data)
				) {
					return $linksQuery.data.data as Link[];
				}
				return [];
			},
			columns,
			getCoreRowModel: getCoreRowModel(),
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
		})
	);
</script>

<div class="container mx-auto py-10">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">My Links</h1>
			<p class="text-muted-foreground">Manage your shortened links and track their performance.</p>
		</div>
		{#if !data.notLoggedIn}
			<Button href="/links/create" class="ml-auto">Create New Link</Button>
		{/if}
	</div>

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
				<Input placeholder="Filter URLs..." bind:value={searchValue} class="max-w-sm" />
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

			{#if $linksQuery.isPending}
				<TableSkeleton rows={pagination.pageSize} />
				<PaginationSkeleton />
			{:else if $linksQuery.isSuccess}
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
														{#if header.column.getIsSorted() === 'asc'}
															<ArrowUpNarrowWideIcon class="ml-2 h-4 w-4" />
														{:else if header.column.getIsSorted() === 'desc'}
															<ArrowDownNarrowWideIcon class="ml-2 h-4 w-4" />
														{:else}
															<ArrowUpDownIcon class="ml-2 h-4 w-4" />
														{/if}
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
											<FlexRender
												content={cell.column.columnDef.cell}
												context={cell.getContext()}
											/>
										</Table.Cell>
									{/each}
								</Table.Row>
							{:else}
								<Table.Row>
									<Table.Cell colspan={columns.length} class="h-24 text-center">
										{$linksQuery.isLoading ? 'Loading...' : 'No results.'}
									</Table.Cell>
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
										pagination.pageSize = Number(value);
										pagination.pageIndex = 0; // Reset to first page
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
			{:else if $linksQuery.isError}
				<div class="rounded-md border p-8 text-center">
					<p class="text-muted-foreground">Failed to load links. Please try again.</p>
				</div>
			{/if}
		</div>
	{/if}
</div>
