<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Textarea } from '$lib/components/ui/textarea';
	import PageContainer from '$lib/components/ui/page-container.svelte';
	import PageHeader from '$lib/components/ui/page-header.svelte';
	import DatabaseIcon from '@lucide/svelte/icons/database';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import RefreshCwIcon from '@lucide/svelte/icons/refresh-cw';
	import DownloadIcon from '@lucide/svelte/icons/download';
	import { toast } from 'svelte-sonner';
	import { faker } from '@faker-js/faker';

	let outputFormat = $state<'json' | 'csv' | 'sql' | 'array'>('json');
	let recordCount = $state(10);
	let includeHeaders = $state(true);
	let tableName = $state('fake_data');
	let generatedData = $state('');

	// Custom fields
	type CustomFieldType = 'text' | 'number' | 'boolean' | 'array' | 'object' | 'function';
	
	interface CustomField {
		id: string;
		name: string;
		type: CustomFieldType;
		value: string;
		enabled: boolean;
		useFaker: boolean;
	}

	const fieldTypeOptions = [
		{ value: 'text', label: 'Text' },
		{ value: 'number', label: 'Number' },
		{ value: 'boolean', label: 'Boolean' },
		{ value: 'array', label: 'Array' },
		{ value: 'object', label: 'Object' },
		{ value: 'function', label: 'Function' }
	] as const;

	let customFields = $state<CustomField[]>([]);
	let newFieldName = $state('');
	let newFieldType = $state<CustomFieldType>('text');
	let newFieldValue = $state('');
	let newFieldUseFaker = $state(true);
	let editingField = $state<string | null>(null);
	let editFieldName = $state('');
	let editFieldType = $state<CustomFieldType>('text');
	let editFieldValue = $state('');
	let editFieldUseFaker = $state(true);

	// Derived trigger content for select components
	const newFieldTypeTrigger = $derived(
		fieldTypeOptions.find((f) => f.value === newFieldType)?.label ?? "Select type"
	);
	
	const editFieldTypeTrigger = $derived(
		fieldTypeOptions.find((f) => f.value === editFieldType)?.label ?? "Select type"
	);

	// Data type selections
	let selectedFields = $state({
		name: true,
		email: true,
		phone: false,
		address: false,
		company: false,
		jobTitle: false,
		age: false,
		gender: false,
		birthdate: false,
		website: false,
		username: false,
		password: false,
		uuid: false,
		creditCard: false,
		iban: false,
		country: false,
		city: false,
		zipCode: false,
		ip: false,
		userAgent: false,
		color: false
	});

	// Configure faker seed for consistent results during a session
	let currentSeed = Date.now();
	
	function setNewSeed(): void {
		currentSeed = Date.now();
		faker.seed(currentSeed);
	}
	
	// Set initial seed
	faker.seed(currentSeed);

	// Custom field management
	function addCustomField(): void {
		if (!newFieldName.trim()) {
			toast.error('Field name is required');
			return;
		}

		if (customFields.some(f => f.name === newFieldName.trim())) {
			toast.error('Field name already exists');
			return;
		}

		const newField: CustomField = {
			id: crypto.randomUUID(),
			name: newFieldName.trim(),
			type: newFieldType,
			value: newFieldValue,
			enabled: true,
			useFaker: newFieldUseFaker
		};

		customFields = [...customFields, newField];
		newFieldName = '';
		newFieldValue = '';
		toast.success('Custom field added');
	}

	function removeCustomField(id: string): void {
		customFields = customFields.filter(f => f.id !== id);
		if (editingField === id) {
			cancelEdit();
		}
		toast.success('Custom field removed');
	}

	function startEdit(field: CustomField): void {
		editingField = field.id;
		editFieldName = field.name;
		editFieldType = field.type;
		editFieldValue = field.value;
		editFieldUseFaker = field.useFaker;
	}

	function cancelEdit(): void {
		editingField = null;
		editFieldName = '';
		editFieldType = 'text';
		editFieldValue = '';
		editFieldUseFaker = true;
	}

	function saveEdit(): void {
		if (!editFieldName.trim()) {
			toast.error('Field name is required');
			return;
		}

		if (customFields.some(f => f.name === editFieldName.trim() && f.id !== editingField)) {
			toast.error('Field name already exists');
			return;
		}

		customFields = customFields.map(field => 
			field.id === editingField 
				? { ...field, name: editFieldName.trim(), type: editFieldType, value: editFieldValue, useFaker: editFieldUseFaker }
				: field
		);

		cancelEdit();
		toast.success('Custom field updated');
	}

	function evaluateCustomField(field: CustomField): any {
		try {
			switch (field.type) {
				case 'text':
					return field.value;
				
				case 'number':
					const num = parseFloat(field.value);
					return isNaN(num) ? 0 : num;
				
				case 'boolean':
					return field.value.toLowerCase() === 'true';
				
				case 'array':
					return JSON.parse(field.value || '[]');
				
				case 'object':
					return JSON.parse(field.value || '{}');
				
				case 'function':
					// Create a safe function evaluation with faker and record context
					const func = new Function('faker', 'record', `return ${field.value}`);
					return func(faker, {});
				
				default:
					return field.value;
			}
		} catch (error) {
			console.warn(`Error evaluating custom field ${field.name}:`, error);
			return null;
		}
	}

	function generateRecord(): Record<string, any> {
		const record: Record<string, any> = {};

		// Generate built-in faker fields
		if (selectedFields.name) record.name = faker.person.fullName();
		if (selectedFields.email) record.email = faker.internet.email();
		if (selectedFields.phone) record.phone = faker.phone.number();
		if (selectedFields.address) record.address = faker.location.streetAddress();
		if (selectedFields.company) record.company = faker.company.name();
		if (selectedFields.jobTitle) record.jobTitle = faker.person.jobTitle();
		if (selectedFields.age) record.age = faker.number.int({ min: 18, max: 80 });
		if (selectedFields.gender) record.gender = faker.person.sex();
		if (selectedFields.birthdate) record.birthdate = faker.date.birthdate().toISOString().split('T')[0];
		if (selectedFields.website) record.website = faker.internet.url();
		if (selectedFields.username) record.username = faker.internet.username();
		if (selectedFields.password) record.password = faker.internet.password({ length: 12 });
		if (selectedFields.uuid) record.uuid = faker.string.uuid();
		if (selectedFields.creditCard) record.creditCard = faker.finance.creditCardNumber();
		if (selectedFields.iban) record.iban = faker.finance.iban();
		if (selectedFields.country) record.country = faker.location.country();
		if (selectedFields.city) record.city = faker.location.city();
		if (selectedFields.zipCode) record.zipCode = faker.location.zipCode();
		if (selectedFields.ip) record.ip = faker.internet.ip();
		if (selectedFields.userAgent) record.userAgent = faker.internet.userAgent();
		if (selectedFields.color) record.color = faker.color.rgb();

		// Generate custom fields
		customFields.forEach(field => {
			if (field.enabled) {
				try {
					// Generate custom fields
					if (field.useFaker && (field.type === 'function' || field.value.includes('faker.'))) {
						const func = new Function('faker', 'record', `return ${field.value}`);
						record[field.name] = func(faker, record);
					} else {
						record[field.name] = evaluateCustomField(field);
					}
				} catch (error) {
					console.warn(`Error generating custom field ${field.name}:`, error);
					record[field.name] = null;
				}
			}
		});

		return record;
	}

	function generateData(): void {
		if (recordCount <= 0) {
			generatedData = '';
			return;
		}

		const records = [];
		for (let i = 0; i < recordCount; i++) {
			records.push(generateRecord());
		}

		switch (outputFormat) {
			case 'json':
				generatedData = JSON.stringify(records, null, 2);
				break;
			
			case 'csv':
				if (records.length === 0) {
					generatedData = '';
					break;
				}
				const headers = Object.keys(records[0]);
				let csv = includeHeaders ? headers.join(',') + '\n' : '';
				csv += records.map(record => 
					headers.map(header => {
						const value = record[header] || '';
						return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
					}).join(',')
				).join('\n');
				generatedData = csv;
				break;

			case 'sql':
				if (records.length === 0) {
					generatedData = '';
					break;
				}
				const headers_sql = Object.keys(records[0]);
				let sql = `-- Generated fake data\n`;
				if (includeHeaders) {
					sql += `CREATE TABLE ${tableName} (\n`;
					sql += headers_sql.map(header => `  ${header} VARCHAR(255)`).join(',\n');
					sql += '\n);\n\n';
				}
				sql += records.map(record => {
					const values = headers_sql.map(header => {
						const value = record[header] || '';
						return typeof value === 'string' ? `'${value.replace(/'/g, "''")}'` : value;
					}).join(', ');
					return `INSERT INTO ${tableName} (${headers_sql.join(', ')}) VALUES (${values});`;
				}).join('\n');
				generatedData = sql;
				break;

			case 'array':
				generatedData = `const fakeData = ${JSON.stringify(records, null, 2)};`;
				break;
		}
	}

	// Generate initial data
	$effect(() => {
		generateData();
	});

	async function copyToClipboard(): Promise<void> {
		if (generatedData) {
			try {
				await navigator.clipboard.writeText(generatedData);
				toast.success('Fake data copied to clipboard!');
			} catch (error) {
				toast.error('Failed to copy to clipboard');
			}
		}
	}

	function regenerate(): void {
		setNewSeed();
		generateData();
		toast.success('New fake data generated!');
	}

	function downloadData(): void {
		if (!generatedData) return;

		const extensions = { json: 'json', csv: 'csv', sql: 'sql', array: 'js' };
		const mimeTypes = { 
			json: 'application/json', 
			csv: 'text/csv', 
			sql: 'application/sql', 
			array: 'application/javascript' 
		};

		const blob = new Blob([generatedData], { type: mimeTypes[outputFormat] });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `fake-data.${extensions[outputFormat]}`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		toast.success('File downloaded successfully!');
	}

	function selectAllFields(): void {
		Object.keys(selectedFields).forEach(key => {
			(selectedFields as any)[key] = true;
		});
	}

	function deselectAllFields(): void {
		Object.keys(selectedFields).forEach(key => {
			(selectedFields as any)[key] = false;
		});
	}

	// Data statistics
	const dataStats = $derived(() => {
		if (!generatedData) return { size: 0, records: 0 };
		
		const size = new Blob([generatedData]).size;
		return { size, records: recordCount };
	});
</script>

<PageHeader 
	title="Fake Data Generator" 
	subtitle="Generate realistic test data for development and testing" 
	icon={DatabaseIcon} 
/>

<PageContainer>
	{#snippet children()}

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<div class="lg:col-span-2 space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Configuration</CardTitle>
					<CardDescription>Configure your fake data generation settings</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label>Output Format</Label>
							<RadioGroup.Root bind:value={outputFormat}>
								<div class="grid grid-cols-2 gap-2">
									<div class="flex items-center space-x-2">
										<RadioGroup.Item value="json" id="json" />
										<Label for="json" class="text-sm">JSON</Label>
									</div>
									<div class="flex items-center space-x-2">
										<RadioGroup.Item value="csv" id="csv" />
										<Label for="csv" class="text-sm">CSV</Label>
									</div>
									<div class="flex items-center space-x-2">
										<RadioGroup.Item value="sql" id="sql" />
										<Label for="sql" class="text-sm">SQL</Label>
									</div>
									<div class="flex items-center space-x-2">
										<RadioGroup.Item value="array" id="array" />
										<Label for="array" class="text-sm">JS Array</Label>
									</div>
								</div>
							</RadioGroup.Root>
						</div>

						<div class="space-y-2">
							<Label for="record-count">Number of Records</Label>
							<Input
								id="record-count"
								type="number"
								bind:value={recordCount}
								min="1"
								max="999999"
								placeholder="10"
								maxlength={6}
								oninput={(e) => {
									const target = e.target as HTMLInputElement;
									if (!target) return;
									
									const value = target.value;
									if (value.length > 6) {
										target.value = value.slice(0, 6);
										recordCount = parseInt(target.value) || 1;
									}
									if (parseInt(value) > 999999) {
										target.value = '999999';
										recordCount = 999999;
									}
								}}
							/>
							<div class="text-xs text-muted-foreground">
								💡 <strong>Tip:</strong> Large datasets (>10k records) may slow down your browser. Max: 999,999 records.
							</div>
						</div>
					</div>

					{#if recordCount > 10000}
						<div class="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
							<div class="flex items-start space-x-2">
								<div class="text-amber-600 dark:text-amber-400 mt-0.5">⚠️</div>
								<div class="text-sm text-amber-800 dark:text-amber-200">
									<strong>Performance Warning:</strong> Generating {recordCount.toLocaleString()} records may slow down your browser. Consider using smaller batches for better performance.
								</div>
							</div>
						</div>
					{/if}

					{#if outputFormat === 'sql'}
						<div class="space-y-2">
							<Label for="table-name">Table Name</Label>
							<Input
								id="table-name"
								type="text"
								bind:value={tableName}
								placeholder="fake_data"
							/>
						</div>
					{/if}

					<div class="flex items-center space-x-2">
						<Checkbox
							id="include-headers"
							bind:checked={includeHeaders}
						/>
						<Label for="include-headers" class="text-sm">Include headers/schema</Label>
					</div>

					<Separator />

					<div class="space-y-3">
						<div class="flex justify-between items-center">
							<Label>Built-in Data Fields</Label>
							<div class="space-x-2">
								<Button variant="outline" size="sm" onclick={selectAllFields}>Select All</Button>
								<Button variant="outline" size="sm" onclick={deselectAllFields}>Deselect All</Button>
							</div>
						</div>

						<div class="grid grid-cols-2 md:grid-cols-3 gap-3">
							{#each Object.entries(selectedFields) as [field]}
								<div class="flex items-center space-x-2">
									<Checkbox
										id={field}
										bind:checked={(selectedFields as any)[field]}
									/>
									<Label for={field} class="text-sm capitalize">
										{field.replace(/([A-Z])/g, ' $1').toLowerCase()}
									</Label>
								</div>
							{/each}
						</div>
					</div>

					<Separator />

					<div class="space-y-4">
						<div class="flex justify-between items-center">
							<Label>Custom Fields</Label>
							<span class="text-sm text-muted-foreground">{customFields.length} fields</span>
						</div>

						<div class="grid grid-cols-1 md:grid-cols-4 gap-2">
							<Input
								type="text"
								bind:value={newFieldName}
								placeholder="Field name"
								class="text-sm"
							/>
							<Select.Root type="single" bind:value={newFieldType}>
								<Select.Trigger class="w-full text-sm">
									{newFieldTypeTrigger}
								</Select.Trigger>
								<Select.Content>
									{#each fieldTypeOptions as option (option.value)}
										<Select.Item value={option.value} label={option.label}>
											{option.label}
										</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
							<Input
								type="text"
								bind:value={newFieldValue}
								placeholder={newFieldType === 'function' ? 'faker.person.firstName()' : newFieldType === 'array' ? '["item1", "item2"]' : newFieldType === 'object' ? '{"key": "value"}' : newFieldType === 'boolean' ? 'true' : newFieldType === 'number' ? '42' : 'Static text'}
								class="text-sm"
							/>
							<Button size="sm" onclick={addCustomField} disabled={!newFieldName.trim()}>Add</Button>
						</div>

						{#if customFields.length > 0}
							<div class="space-y-2">
								{#each customFields as field}
									{#if editingField === field.id}
										<!-- Edit Mode -->
										<div class="p-3 border border-border rounded-md bg-muted/30 dark:bg-muted/20">
											<div class="space-y-3">
												<div class="grid grid-cols-1 md:grid-cols-5 gap-2">
													<Input
														type="text"
														bind:value={editFieldName}
														placeholder="Field name"
														class="text-sm"
													/>
													<Select.Root type="single" bind:value={editFieldType}>
														<Select.Trigger class="w-full text-sm">
															{editFieldTypeTrigger}
														</Select.Trigger>
														<Select.Content>
															{#each fieldTypeOptions as option (option.value)}
																<Select.Item value={option.value} label={option.label}>
																	{option.label}
																</Select.Item>
															{/each}
														</Select.Content>
													</Select.Root>
													<div class="flex items-center space-x-2">
														<Checkbox bind:checked={editFieldUseFaker} id={`edit-use-faker-${field.id}`} />
														<Label for={`edit-use-faker-${field.id}`} class="text-xs whitespace-nowrap">Use Faker</Label>
													</div>
													<Input
														type="text"
														bind:value={editFieldValue}
														placeholder={editFieldUseFaker ? (editFieldType === 'function' ? 'faker.person.firstName()' : 'faker.datatype.uuid()') : (editFieldType === 'array' ? '["item1", "item2"]' : editFieldType === 'object' ? '{"key": "value"}' : editFieldType === 'boolean' ? 'true' : editFieldType === 'number' ? '42' : 'Static text')}
														class="text-sm"
													/>
													<div class="flex space-x-1">
														<Button size="sm" onclick={saveEdit} disabled={!editFieldName.trim()}>Save</Button>
														<Button size="sm" variant="outline" onclick={cancelEdit}>Cancel</Button>
													</div>
												</div>
											</div>
										</div>
									{:else}
										<!-- View Mode -->
										<div class="flex items-center justify-between p-2 border border-border rounded-md bg-card">
											<div class="flex items-center space-x-2 flex-1">
												<Checkbox
													bind:checked={field.enabled}
												/>
												<div class="flex-1">
													<div class="text-sm font-medium">{field.name}</div>
													<div class="text-xs text-muted-foreground">
														<span class="font-mono bg-muted text-muted-foreground px-1 rounded text-xs">{field.type}</span>
														{#if field.useFaker}
															<span class="font-mono bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-1 rounded ml-1 text-xs">faker</span>
														{:else}
															<span class="font-mono bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 px-1 rounded ml-1 text-xs">static</span>
														{/if}
														{field.value.length > 25 ? field.value.substring(0, 25) + '...' : field.value}
													</div>
												</div>
											</div>
											<div class="flex space-x-1">
												<Button size="sm" variant="ghost" onclick={() => startEdit(field)} class="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
													Edit
												</Button>
												<Button size="sm" variant="ghost" onclick={() => removeCustomField(field.id)} class="text-destructive hover:text-destructive/80 dark:text-red-400 dark:hover:text-red-300">
													×
												</Button>
											</div>
										</div>
									{/if}
								{/each}
							</div>
						{/if}

						<div class="text-xs text-muted-foreground space-y-1">
							<p><strong>Examples:</strong></p>
							<p>• <strong>Faker Function:</strong> faker.datatype.uuid(), faker.person.firstName()</p>
							<p>• <strong>Static Function:</strong> Math.random(), new Date().getTime()</p>
							<p>• <strong>Array:</strong> ["option1", "option2", "option3"]</p>
							<p>• <strong>Object:</strong> {"{\"status\": \"active\", \"priority\": 1}"}</p>
							<p>• <strong>Boolean:</strong> true or false</p>
							<p class="pt-1">
								<strong>📖 Reference:</strong> 
								<a href="https://fakerjs.dev/api/" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline">
									Faker.js API Documentation
								</a>
							</p>
						</div>
					</div>

					<Separator />

					<div class="flex flex-wrap gap-2">
						<Button onclick={regenerate}>
							<RefreshCwIcon class="mr-2 h-4 w-4" />
							Generate New
						</Button>

						<Button variant="outline" onclick={copyToClipboard} disabled={!generatedData}>
							<CopyIcon class="mr-2 h-4 w-4" />
							Copy Data
						</Button>

						<Button variant="outline" onclick={downloadData} disabled={!generatedData}>
							<DownloadIcon class="mr-2 h-4 w-4" />
							Download
						</Button>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Generated Data</CardTitle>
					<CardDescription>
						{dataStats().records} records, {(dataStats().size / 1024).toFixed(1)} KB
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div class="space-y-4">
						<Textarea
							value={generatedData}
							readonly
							placeholder="Generated fake data will appear here..."
							class="min-h-[500px] resize-y font-mono"
						/>

						<div class="flex justify-between items-center text-sm text-muted-foreground">
							<span>Generated {outputFormat.toUpperCase()} format</span>
							<div class="flex gap-2">
								<Button
									variant="ghost"
									size="sm"
									onclick={copyToClipboard}
									disabled={!generatedData}
									class="h-8"
								>
									<CopyIcon class="mr-2 h-3 w-3" />
									Copy
								</Button>
								<Button
									variant="ghost"
									size="sm"
									onclick={downloadData}
									disabled={!generatedData}
									class="h-8"
								>
									<DownloadIcon class="mr-2 h-3 w-3" />
									Download
								</Button>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>

		<div class="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Data Statistics</CardTitle>
					<CardDescription>Generated data information</CardDescription>
				</CardHeader>
				<CardContent class="space-y-3">
					<div class="space-y-2 text-sm">
						<div class="flex justify-between">
							<span class="font-medium">Records:</span>
							<span class="text-muted-foreground">{dataStats().records.toLocaleString()}</span>
						</div>
						<div class="flex justify-between">
							<span class="font-medium">File Size:</span>
							<span class="text-muted-foreground">{(dataStats().size / 1024).toFixed(1)} KB</span>
						</div>
						<div class="flex justify-between">
							<span class="font-medium">Format:</span>
							<span class="text-muted-foreground">{outputFormat.toUpperCase()}</span>
						</div>
						<div class="flex justify-between">
							<span class="font-medium">Built-in Fields:</span>
							<span class="text-muted-foreground">{Object.values(selectedFields).filter(Boolean).length}</span>
						</div>
						<div class="flex justify-between">
							<span class="font-medium">Custom Fields:</span>
							<span class="text-muted-foreground">{customFields.filter(f => f.enabled).length}</span>
						</div>
						<div class="flex justify-between">
							<span class="font-medium">Total Fields:</span>
							<span class="text-muted-foreground">{Object.values(selectedFields).filter(Boolean).length + customFields.filter(f => f.enabled).length}</span>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Available Fields</CardTitle>
					<CardDescription>Types of fake data you can generate</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-3 text-sm">
						<div>
							<h4 class="font-medium">Personal Data</h4>
							<p class="text-muted-foreground">Name, email, phone, age, gender, birthdate</p>
						</div>

						<div>
							<h4 class="font-medium">Contact Info</h4>
							<p class="text-muted-foreground">Address, city, country, zip code, website</p>
						</div>

						<div>
							<h4 class="font-medium">Professional</h4>
							<p class="text-muted-foreground">Company, job title, username, password</p>
						</div>

						<div>
							<h4 class="font-medium">Technical</h4>
							<p class="text-muted-foreground">UUID, IP address, user agent, color</p>
						</div>

						<div>
							<h4 class="font-medium">Financial</h4>
							<p class="text-muted-foreground">Credit card, IBAN</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Output Formats</CardTitle>
					<CardDescription>Supported export formats</CardDescription>
				</CardHeader>
				<CardContent>
					<div class="space-y-2 text-sm">
						<p><strong>JSON:</strong> Structured data for APIs and applications</p>
						<p><strong>CSV:</strong> Spreadsheet-compatible comma-separated values</p>
						<p><strong>SQL:</strong> Database INSERT statements with optional schema</p>
						<p><strong>JS Array:</strong> JavaScript array constant for development</p>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Use Cases</CardTitle>
					<CardDescription>When to use fake data</CardDescription>
				</CardHeader>
				<CardContent>
					<div class="space-y-2 text-sm">
						<p>• Testing applications with realistic data</p>
						<p>• Populating development databases</p>
						<p>• Creating demos and prototypes</p>
						<p>• Load testing with sample data</p>
						<p>• Training machine learning models</p>
						<p>• Design mockups and wireframes</p>
					</div>
				</CardContent>
			</Card>
		</div>
	</div>

	{/snippet}
</PageContainer>