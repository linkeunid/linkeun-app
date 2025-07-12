<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import PageContainer from '$lib/components/ui/page-container.svelte';
	import PageHeader from '$lib/components/ui/page-header.svelte';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Separator } from '$lib/components/ui/separator';
	import { Textarea } from '$lib/components/ui/textarea';
	import SortDescIcon from '@lucide/svelte/icons/arrow-down';
	import SortAscIcon from '@lucide/svelte/icons/arrow-up';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import SearchIcon from '@lucide/svelte/icons/search';
	import TableIcon from '@lucide/svelte/icons/table';
	import { toast } from 'svelte-sonner';

	// Form state
	let inputData = $state(`name,age,city,country
John Doe,25,New York,USA
Jane Smith,30,London,UK
Bob Johnson,35,Tokyo,Japan
Alice Brown,28,Sydney,Australia
Charlie Wilson,32,Paris,France`);
	let inputFormat = $state('csv');
	let csvDelimiter = $state(',');
	let hasHeaders = $state(true);
	let searchTerm = $state('');
	let sortColumn = $state('');
	let sortDirection = $state<'asc' | 'desc'>('asc');
	let selectedColumns = $state<string[]>([]);
	let currentPage = $state(1);
	let rowsPerPage = $state('10');

	// Parsed data
	let parsedData = $state<any[]>([]);
	let columns = $state<string[]>([]);
	let error = $state('');

	// Format options
	const formatOptions = [
		{ value: 'csv', label: 'CSV', description: 'Comma-separated values' },
		{ value: 'json', label: 'JSON', description: 'JavaScript Object Notation' },
		{ value: 'tsv', label: 'TSV', description: 'Tab-separated values' }
	];

	const delimiterOptions = [
		{ value: ',', label: 'Comma (,)' },
		{ value: ';', label: 'Semicolon (;)' },
		{ value: '\t', label: 'Tab' },
		{ value: '|', label: 'Pipe (|)' }
	];

	const rowsPerPageOptions = [
		{ value: '10', label: '10 rows' },
		{ value: '25', label: '25 rows' },
		{ value: '50', label: '50 rows' },
		{ value: '100', label: '100 rows' },
		{ value: 'all', label: 'All rows' }
	];

	const formatTriggerContent = $derived(
		formatOptions.find((f) => f.value === inputFormat)?.label ?? 'Select format'
	);

	const delimiterTriggerContent = $derived(
		delimiterOptions.find((d) => d.value === csvDelimiter)?.label ?? 'Select delimiter'
	);

	const rowsPerPageTriggerContent = $derived(
		rowsPerPageOptions.find((r) => r.value === rowsPerPage.toString())?.label ?? 'Select rows'
	);

	// Derived visible columns for consistent use across the component
	const visibleColumns = $derived(() => {
		// Always use selectedColumns - it represents what user has chosen to show
		return selectedColumns;
	});

	function parseCSV(text: string, delimiter: string): any[] {
		const lines = text.trim().split('\n');
		if (lines.length === 0) return [];

		const headers = hasHeaders
			? lines[0].split(delimiter).map((h) => h.trim().replace(/^"|"$/g, ''))
			: Array.from({ length: lines[0].split(delimiter).length }, (_, i) => `Column ${i + 1}`);

		const dataLines = hasHeaders ? lines.slice(1) : lines;

		return dataLines.map((line) => {
			const values = line.split(delimiter).map((v) => v.trim().replace(/^"|"$/g, ''));
			const row: any = {};
			headers.forEach((header, index) => {
				row[header] = values[index] || '';
			});
			return row;
		});
	}

	function parseJSON(text: string): any[] {
		try {
			const parsed = JSON.parse(text);
			if (Array.isArray(parsed)) {
				return parsed;
			} else if (typeof parsed === 'object' && parsed !== null) {
				return [parsed];
			}
			throw new Error('Invalid JSON format');
		} catch (err) {
			throw new Error('Invalid JSON: ' + (err as Error).message);
		}
	}

	function parseData(): void {
		error = '';

		try {
			if (!inputData.trim()) {
				parsedData = [];
				columns = [];
				return;
			}

			let data: any[];

			switch (inputFormat) {
				case 'csv':
					data = parseCSV(inputData, csvDelimiter);
					break;
				case 'tsv':
					data = parseCSV(inputData, '\t');
					break;
				case 'json':
					data = parseJSON(inputData);
					break;
				default:
					throw new Error('Unsupported format');
			}

			if (data.length === 0) {
				parsedData = [];
				columns = [];
				return;
			}

			// Extract columns from first row
			const allColumns = Object.keys(data[0]);
			columns = allColumns;
			parsedData = data;

			// Reset selected columns to match new data columns
			selectedColumns = [...allColumns];

			currentPage = 1; // Reset to first page
		} catch (err) {
			error = (err as Error).message;
			parsedData = [];
			columns = [];
		}
	}

	// Parse data when inputs change
	$effect(() => {
		inputData;
		inputFormat;
		csvDelimiter;
		hasHeaders;
		parseData();
	});

	// Filtered and sorted data
	const filteredData = $derived(() => {
		let data = parsedData;

		// Apply search filter
		if (searchTerm.trim()) {
			const term = searchTerm.toLowerCase();
			data = data.filter((row) =>
				Object.values(row).some((value) => String(value).toLowerCase().includes(term))
			);
		}

		// Apply column filter - only show data for visible columns if not all columns are selected
		const currentVisibleColumns = visibleColumns();
		if (currentVisibleColumns.length < columns.length) {
			data = data.map((row) => {
				const filteredRow: any = {};
				currentVisibleColumns.forEach((col) => {
					filteredRow[col] = row[col];
				});
				return filteredRow;
			});
		}

		// Apply sorting
		if (sortColumn) {
			data = [...data].sort((a, b) => {
				const aVal = a[sortColumn];
				const bVal = b[sortColumn];

				// Try to parse as numbers
				const aNum = parseFloat(aVal);
				const bNum = parseFloat(bVal);

				let comparison = 0;
				if (!isNaN(aNum) && !isNaN(bNum)) {
					comparison = aNum - bNum;
				} else {
					comparison = String(aVal).localeCompare(String(bVal));
				}

				return sortDirection === 'asc' ? comparison : -comparison;
			});
		}

		return data;
	});

	// Paginated data
	const paginatedData = $derived(() => {
		if (rowsPerPage === 'all') return filteredData();

		const rowsPerPageNum = parseInt(rowsPerPage);
		const start = (currentPage - 1) * rowsPerPageNum;
		const end = start + rowsPerPageNum;
		return filteredData().slice(start, end);
	});

	const totalPages = $derived(() => {
		if (rowsPerPage === 'all') return 1;
		return Math.ceil(filteredData().length / parseInt(rowsPerPage));
	});

	function handleSort(column: string): void {
		if (sortColumn === column) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortColumn = column;
			sortDirection = 'asc';
		}
	}

	function toggleColumn(column: string): void {
		if (selectedColumns.includes(column)) {
			selectedColumns = selectedColumns.filter((col) => col !== column);
		} else {
			selectedColumns = [...selectedColumns, column];
		}
	}

	function selectAllColumns(): void {
		selectedColumns = [...columns];
	}

	function deselectAllColumns(): void {
		selectedColumns = [];
	}

	async function handleFileUpload(event: Event): Promise<void> {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (file) {
			try {
				const text = await file.text();
				inputData = text;

				// Auto-detect format based on file extension
				const extension = file.name.split('.').pop()?.toLowerCase();
				if (extension === 'json') {
					inputFormat = 'json';
				} else if (extension === 'tsv' || extension === 'txt') {
					inputFormat = 'tsv';
				} else {
					inputFormat = 'csv';
				}

				toast.success('File uploaded successfully!');
			} catch (err) {
				toast.error('Failed to read file');
			}
		}
	}

	function exportData(format: 'csv' | 'json' | 'html'): void {
		const data = filteredData();
		if (data.length === 0) {
			toast.error('No data to export');
			return;
		}

		let content = '';
		let mimeType = '';
		let extension = '';

		switch (format) {
			case 'csv':
				const headers = visibleColumns().length > 0 ? visibleColumns() : Object.keys(data[0]);
				content = headers.join(',') + '\n';
				content += data
					.map((row) =>
						headers
							.map((header) => {
								const value = String(row[header] || '');
								return value.includes(',') ? `"${value}"` : value;
							})
							.join(',')
					)
					.join('\n');
				mimeType = 'text/csv';
				extension = 'csv';
				break;

			case 'json':
				content = JSON.stringify(data, null, 2);
				mimeType = 'application/json';
				extension = 'json';
				break;

			case 'html':
				const tableHeaders = visibleColumns().length > 0 ? visibleColumns() : Object.keys(data[0]);
				content = `<!DOCTYPE html>
<html>
<head>
	<title>Table Data</title>
	<style>
		table { border-collapse: collapse; width: 100%; }
		th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
		th { background-color: #f2f2f2; font-weight: bold; }
		tr:nth-child(even) { background-color: #f9f9f9; }
	</style>
</head>
<body>
	<table>
		<thead>
			<tr>${tableHeaders.map((h) => `<th>${h}</th>`).join('')}</tr>
		</thead>
		<tbody>
			${data
				.map((row) => `<tr>${tableHeaders.map((h) => `<td>${row[h] || ''}</td>`).join('')}</tr>`)
				.join('')}
		</tbody>
	</table>
</body>
</html>`;
				mimeType = 'text/html';
				extension = 'html';
				break;
		}

		const blob = new Blob([content], { type: mimeType });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `table-data.${extension}`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);

		toast.success(`Data exported as ${format.toUpperCase()}`);
	}

	async function copyTableData(): Promise<void> {
		const data = filteredData();
		if (data.length === 0) {
			toast.error('No data to copy');
			return;
		}

		try {
			const headers = visibleColumns().length > 0 ? visibleColumns() : Object.keys(data[0]);
			const csvContent =
				headers.join('\t') +
				'\n' +
				data.map((row) => headers.map((header) => row[header] || '').join('\t')).join('\n');

			await navigator.clipboard.writeText(csvContent);
			toast.success('Table data copied to clipboard!');
		} catch (error) {
			toast.error('Failed to copy to clipboard');
		}
	}

	// Handle tab key for JSON indentation
	function handleTextareaKeydown(event: KeyboardEvent): void {
		if (inputFormat === 'json' && event.key === 'Tab') {
			event.preventDefault();

			const textarea = event.target as HTMLTextAreaElement;
			const start = textarea.selectionStart;
			const end = textarea.selectionEnd;

			// Insert tab character at cursor position
			const value = textarea.value;
			const newValue = value.substring(0, start) + '\t' + value.substring(end);

			// Update the input data
			inputData = newValue;

			// Restore cursor position after the inserted tab
			setTimeout(() => {
				textarea.selectionStart = textarea.selectionEnd = start + 1;
			}, 0);
		}
	}

	// Data statistics
	const dataStats = $derived(() => {
		const data = filteredData();
		return {
			totalRows: parsedData.length,
			filteredRows: data.length,
			totalColumns: columns.length,
			visibleColumns: visibleColumns().length
		};
	});

	// Column statistics
	const columnStats = $derived(() => {
		const data = filteredData();
		const stats: Record<string, any> = {};

		visibleColumns().forEach((column) => {
			const values = data
				.map((row) => row[column])
				.filter((val) => val !== null && val !== undefined && val !== '');
			const numericValues = values
				.map((val) => parseFloat(String(val)))
				.filter((val) => !isNaN(val));

			stats[column] = {
				total: data.length,
				filled: values.length,
				empty: data.length - values.length,
				unique: new Set(values).size,
				isNumeric: numericValues.length > 0,
				min: numericValues.length > 0 ? Math.min(...numericValues) : null,
				max: numericValues.length > 0 ? Math.max(...numericValues) : null,
				avg:
					numericValues.length > 0
						? numericValues.reduce((a, b) => a + b, 0) / numericValues.length
						: null
			};
		});

		return stats;
	});
</script>

<PageHeader
	title="CSV/JSON Table Viewer"
	subtitle="Parse, view, and analyze CSV and JSON data in a structured table format"
	icon={TableIcon}
/>

<PageContainer>
	{#snippet children()}
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-4">
			<div class="space-y-6 lg:col-span-3">
				<Card>
					<CardHeader>
						<CardTitle>Data Input</CardTitle>
						<CardDescription>Paste your CSV or JSON data, or upload a file</CardDescription>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
							<div class="space-y-2">
								<Label>Input Format</Label>
								<Select.Root type="single" name="inputFormat" bind:value={inputFormat}>
									<Select.Trigger class="w-full">
										{formatTriggerContent}
									</Select.Trigger>
									<Select.Content>
										<Select.Group>
											<Select.Label>Data Formats</Select.Label>
											{#each formatOptions as format (format.value)}
												<Select.Item value={format.value} label={format.label}>
													<div>
														<div class="font-medium">{format.label}</div>
														<div class="text-muted-foreground text-xs">{format.description}</div>
													</div>
												</Select.Item>
											{/each}
										</Select.Group>
									</Select.Content>
								</Select.Root>
							</div>

							{#if inputFormat === 'csv'}
								<div class="space-y-2">
									<Label>Delimiter</Label>
									<Select.Root type="single" name="csvDelimiter" bind:value={csvDelimiter}>
										<Select.Trigger class="w-full">
											{delimiterTriggerContent}
										</Select.Trigger>
										<Select.Content>
											<Select.Group>
												<Select.Label>Delimiters</Select.Label>
												{#each delimiterOptions as delimiter (delimiter.value)}
													<Select.Item value={delimiter.value} label={delimiter.label}>
														{delimiter.label}
													</Select.Item>
												{/each}
											</Select.Group>
										</Select.Content>
									</Select.Root>
								</div>
							{/if}

							<div class="space-y-2">
								<Label for="file-upload">Upload File</Label>
								<Input
									id="file-upload"
									type="file"
									accept=".csv,.json,.tsv,.txt"
									onchange={handleFileUpload}
									class="cursor-pointer"
								/>
							</div>
						</div>

						{#if inputFormat !== 'json'}
							<div class="flex items-center space-x-2">
								<Checkbox bind:checked={hasHeaders} id="has-headers" />
								<Label for="has-headers">First row contains headers</Label>
							</div>
						{/if}

						<div class="space-y-2">
							<Label for="input-data">Data Input</Label>
							<Textarea
								id="input-data"
								bind:value={inputData}
								placeholder={inputFormat === 'json'
									? '[{"name": "John", "age": 25}, {"name": "Jane", "age": 30}]'
									: 'name,age,city\nJohn,25,New York\nJane,30,London'}
								rows={8}
								class="font-mono text-sm"
								onkeydown={handleTextareaKeydown}
							/>
							{#if inputFormat === 'json'}
								<div class="text-muted-foreground text-xs">
									💡 <strong>Tip:</strong> Press Tab to add indentation for better JSON formatting
								</div>
							{/if}
						</div>

						{#if error}
							<div
								class="rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20"
							>
								<div class="flex items-start space-x-2">
									<div class="mt-0.5 text-red-600 dark:text-red-400">⚠️</div>
									<div class="text-sm text-red-800 dark:text-red-200">
										<strong>Parse Error:</strong>
										{error}
									</div>
								</div>
							</div>
						{/if}
					</CardContent>
				</Card>

				{#if parsedData.length > 0}
					<Card>
						<CardHeader>
							<CardTitle>Table Controls</CardTitle>
							<CardDescription>Filter, search, and customize your table view</CardDescription>
						</CardHeader>
						<CardContent class="space-y-4">
							<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
								<div class="space-y-2">
									<Label for="search">Search</Label>
									<div class="relative">
										<SearchIcon class="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
										<Input
											id="search"
											type="text"
											bind:value={searchTerm}
											placeholder="Search in all columns..."
											class="pl-8"
										/>
									</div>
								</div>

								<div class="space-y-2">
									<Label>Rows per page</Label>
									<Select.Root type="single" name="rowsPerPage" bind:value={rowsPerPage}>
										<Select.Trigger class="w-full">
											{rowsPerPageTriggerContent}
										</Select.Trigger>
										<Select.Content>
											<Select.Group>
												<Select.Label>Rows per page</Select.Label>
												{#each rowsPerPageOptions as option (option.value)}
													<Select.Item value={option.value} label={option.label}>
														{option.label}
													</Select.Item>
												{/each}
											</Select.Group>
										</Select.Content>
									</Select.Root>
								</div>

								<div class="space-y-2">
									<Label>Export</Label>
									<div class="flex space-x-2">
										<Button size="sm" variant="outline" onclick={() => exportData('csv')}>
											CSV
										</Button>
										<Button size="sm" variant="outline" onclick={() => exportData('json')}>
											JSON
										</Button>
										<Button size="sm" variant="outline" onclick={() => exportData('html')}>
											HTML
										</Button>
									</div>
								</div>
							</div>

							<Separator />

							<div class="space-y-3">
								<div class="flex items-center justify-between">
									<Label>Visible Columns</Label>
									<div class="space-x-2">
										<Button size="sm" variant="outline" onclick={selectAllColumns}
											>Select All</Button
										>
										<Button size="sm" variant="outline" onclick={deselectAllColumns}
											>Clear All</Button
										>
									</div>
								</div>

								<div class="grid grid-cols-2 gap-2 md:grid-cols-4">
									{#each columns as column}
										<div class="flex items-center space-x-2">
											<Checkbox
												checked={selectedColumns.includes(column)}
												id={`col-${column}`}
												onCheckedChange={() => toggleColumn(column)}
											/>
											<Label for={`col-${column}`} class="truncate text-sm">
												{column}
											</Label>
										</div>
									{/each}
								</div>
							</div>

							<Separator />

							<div class="flex items-center justify-between">
								<div class="text-muted-foreground text-sm">
									Showing {paginatedData().length} of {filteredData().length} rows
									{#if filteredData().length !== parsedData.length}
										(filtered from {parsedData.length} total)
									{/if}
								</div>
								<div class="flex space-x-2">
									<Button size="sm" variant="outline" onclick={copyTableData}>
										<CopyIcon class="mr-2 h-3 w-3" />
										Copy
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Data Table</CardTitle>
							<CardDescription>
								{dataStats().filteredRows} rows × {dataStats().visibleColumns} columns
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div class="space-y-4">
								<div class="border-border overflow-x-auto rounded-lg border">
									<table class="w-full text-sm">
										<thead class="bg-muted/50">
											<tr>
												{#each visibleColumns() as column}
													<th class="border-border border-b px-3 py-2 text-left font-medium">
														<button
															class="hover:text-primary flex items-center space-x-1"
															onclick={() => handleSort(column)}
														>
															<span class="truncate">{column}</span>
															{#if sortColumn === column}
																{#if sortDirection === 'asc'}
																	<SortAscIcon class="h-3 w-3" />
																{:else}
																	<SortDescIcon class="h-3 w-3" />
																{/if}
															{/if}
														</button>
													</th>
												{/each}
											</tr>
										</thead>
										<tbody>
											{#each paginatedData() as row, index}
												<tr class={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
													{#each visibleColumns() as column}
														<td class="border-border/50 border-b px-3 py-2">
															<div class="max-w-xs truncate" title={String(row[column] || '')}>
																{row[column] || ''}
															</div>
														</td>
													{/each}
												</tr>
											{/each}
										</tbody>
									</table>
								</div>

								{#if totalPages() > 1}
									<div class="flex justify-center space-x-2">
										<Button
											size="sm"
											variant="outline"
											disabled={currentPage === 1}
											onclick={() => (currentPage = Math.max(1, currentPage - 1))}
										>
											Previous
										</Button>

										<div class="flex items-center space-x-2">
											<span class="text-muted-foreground text-sm">
												Page {currentPage} of {totalPages()}
											</span>
										</div>

										<Button
											size="sm"
											variant="outline"
											disabled={currentPage === totalPages()}
											onclick={() => (currentPage = Math.min(totalPages(), currentPage + 1))}
										>
											Next
										</Button>
									</div>
								{/if}
							</div>
						</CardContent>
					</Card>
				{/if}
			</div>

			<div class="space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>Data Statistics</CardTitle>
						<CardDescription>Overview of your dataset</CardDescription>
					</CardHeader>
					<CardContent class="space-y-3">
						<div class="space-y-2 text-sm">
							<div class="flex justify-between">
								<span class="font-medium">Total Rows:</span>
								<span class="text-muted-foreground">{dataStats().totalRows.toLocaleString()}</span>
							</div>
							<div class="flex justify-between">
								<span class="font-medium">Filtered Rows:</span>
								<span class="text-muted-foreground"
									>{dataStats().filteredRows.toLocaleString()}</span
								>
							</div>
							<div class="flex justify-between">
								<span class="font-medium">Total Columns:</span>
								<span class="text-muted-foreground">{dataStats().totalColumns}</span>
							</div>
							<div class="flex justify-between">
								<span class="font-medium">Visible Columns:</span>
								<span class="text-muted-foreground">{dataStats().visibleColumns}</span>
							</div>
							{#if searchTerm}
								<div class="flex justify-between">
									<span class="font-medium">Search Term:</span>
									<span class="text-muted-foreground truncate">{searchTerm}</span>
								</div>
							{/if}
							{#if sortColumn}
								<div class="flex justify-between">
									<span class="font-medium">Sort:</span>
									<span class="text-muted-foreground">{sortColumn} ({sortDirection})</span>
								</div>
							{/if}
						</div>
					</CardContent>
				</Card>

				{#if Object.keys(columnStats()).length > 0}
					<Card>
						<CardHeader>
							<CardTitle>Column Analysis</CardTitle>
							<CardDescription>Statistical analysis of your data columns</CardDescription>
						</CardHeader>
						<CardContent class="space-y-4">
							{#each Object.entries(columnStats()) as [column, stats]}
								<div class="space-y-2">
									<h4 class="text-sm font-medium">{column}</h4>
									<div class="text-muted-foreground space-y-1 text-xs">
										<div class="flex justify-between">
											<span>Filled:</span>
											<span>{stats.filled}/{stats.total}</span>
										</div>
										<div class="flex justify-between">
											<span>Unique:</span>
											<span>{stats.unique}</span>
										</div>
										{#if stats.isNumeric && stats.min !== null}
											<div class="flex justify-between">
												<span>Range:</span>
												<span>{stats.min.toFixed(2)} - {stats.max.toFixed(2)}</span>
											</div>
											<div class="flex justify-between">
												<span>Average:</span>
												<span>{stats.avg.toFixed(2)}</span>
											</div>
										{/if}
									</div>
								</div>
								{#if column !== Object.keys(columnStats())[Object.keys(columnStats()).length - 1]}
									<Separator />
								{/if}
							{/each}
						</CardContent>
					</Card>
				{/if}

				<Card>
					<CardHeader>
						<CardTitle>Supported Formats</CardTitle>
						<CardDescription>Input data formats</CardDescription>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="space-y-3 text-sm">
							<div>
								<h4 class="font-medium">CSV</h4>
								<p class="text-muted-foreground">Comma-separated values with custom delimiters</p>
							</div>

							<div>
								<h4 class="font-medium">TSV</h4>
								<p class="text-muted-foreground">Tab-separated values for cleaner data</p>
							</div>

							<div>
								<h4 class="font-medium">JSON</h4>
								<p class="text-muted-foreground">Array of objects or single object</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Features</CardTitle>
						<CardDescription>Table viewer capabilities</CardDescription>
					</CardHeader>
					<CardContent>
						<div class="space-y-2 text-sm">
							<p>• Parse CSV, JSON, and TSV formats</p>
							<p>• Sort columns by clicking headers</p>
							<p>• Search across all data</p>
							<p>• Filter visible columns</p>
							<p>• Pagination for large datasets</p>
							<p>• Export to CSV, JSON, or HTML</p>
							<p>• Column statistics and analysis</p>
							<p>• Copy data to clipboard</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	{/snippet}
</PageContainer>
