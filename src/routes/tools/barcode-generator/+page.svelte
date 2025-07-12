<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import PageContainer from '$lib/components/ui/page-container.svelte';
	import PageHeader from '$lib/components/ui/page-header.svelte';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Separator } from '$lib/components/ui/separator';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import DownloadIcon from '@lucide/svelte/icons/download';
	import ScanBarcodeIcon from '@lucide/svelte/icons/scan-barcode';
	import { toast } from 'svelte-sonner';
	import { onMount } from 'svelte';

	// Form state
	let inputText = $state('1234567890');
	let selectedFormat = $state('CODE128');
	let width = $state(2);
	let height = $state(100);
	let displayValue = $state(true);
	let fontSize = $state(20);
	let textAlign = $state('center');
	let textPosition = $state('bottom');
	let backgroundColor = $state('#ffffff');
	let lineColor = $state('#000000');

	// Canvas reference
	let canvas: HTMLCanvasElement;
	let JsBarcode: any;

	// Barcode format options
	const formatOptions = [
		{ value: 'CODE128', label: 'CODE128', description: 'Most versatile, supports all characters' },
		{ value: 'CODE39', label: 'CODE39', description: 'Alphanumeric, widely supported' },
		{ value: 'EAN13', label: 'EAN13', description: '13-digit European Article Number' },
		{ value: 'EAN8', label: 'EAN8', description: '8-digit European Article Number' },
		{ value: 'UPC', label: 'UPC-A', description: '12-digit Universal Product Code' },
		{ value: 'ITF14', label: 'ITF-14', description: '14-digit Interleaved 2 of 5' },
		{ value: 'MSI', label: 'MSI', description: 'Modified Plessey, numeric only' },
		{ value: 'pharmacode', label: 'Pharmacode', description: 'Pharmaceutical Binary Code' }
	];

	const textAlignOptions = [
		{ value: 'left', label: 'Left' },
		{ value: 'center', label: 'Center' },
		{ value: 'right', label: 'Right' }
	];

	const textPositionOptions = [
		{ value: 'top', label: 'Top' },
		{ value: 'bottom', label: 'Bottom' }
	];

	const formatTriggerContent = $derived(
		formatOptions.find((f) => f.value === selectedFormat)?.label ?? 'Select format'
	);

	const alignTriggerContent = $derived(
		textAlignOptions.find((a) => a.value === textAlign)?.label ?? 'Select alignment'
	);

	const positionTriggerContent = $derived(
		textPositionOptions.find((p) => p.value === textPosition)?.label ?? 'Select position'
	);

	// Load JsBarcode
	onMount(async () => {
		const module = await import('jsbarcode');
		JsBarcode = module.default;
		generateBarcode();
	});

	function generateBarcode(): void {
		if (!JsBarcode || !canvas || !inputText.trim()) {
			updateStats();
			return;
		}

		try {
			JsBarcode(canvas, inputText, {
				format: selectedFormat,
				width: width,
				height: height,
				displayValue: displayValue,
				fontSize: fontSize,
				textAlign: textAlign,
				textPosition: textPosition,
				background: backgroundColor,
				lineColor: lineColor,
				textMargin: 2,
				margin: 10
			});
			
			// Update statistics after successful generation
			setTimeout(updateStats, 10); // Small delay to ensure canvas is updated
		} catch (error) {
			console.error('Barcode generation error:', error);
			toast.error('Invalid input for selected barcode format');
			updateStats();
		}
	}

	// Generate barcode when inputs change
	$effect(() => {
		// Access all reactive variables to ensure effect triggers on changes
		inputText;
		selectedFormat;
		width;
		height;
		displayValue;
		fontSize;
		textAlign;
		textPosition;
		backgroundColor;
		lineColor;
		
		generateBarcode();
	});

	async function copyBarcode(): Promise<void> {
		if (!canvas) return;

		try {
			canvas.toBlob(async (blob) => {
				if (blob) {
					const item = new ClipboardItem({ 'image/png': blob });
					await navigator.clipboard.write([item]);
					toast.success('Barcode copied to clipboard!');
				}
			});
		} catch (error) {
			toast.error('Failed to copy barcode to clipboard');
		}
	}

	function downloadBarcode(): void {
		if (!canvas) return;

		const link = document.createElement('a');
		link.download = `barcode-${selectedFormat}-${inputText}.png`;
		link.href = canvas.toDataURL();
		link.click();
		toast.success('Barcode downloaded successfully!');
	}

	// Validation helpers
	const isValidInput = $derived(() => {
		if (!inputText.trim()) return false;
		
		switch (selectedFormat) {
			case 'EAN13':
				return /^\d{12,13}$/.test(inputText);
			case 'EAN8':
				return /^\d{7,8}$/.test(inputText);
			case 'UPC':
				return /^\d{11,12}$/.test(inputText);
			case 'CODE39':
				return /^[A-Z0-9\-. $/+%]*$/.test(inputText);
			case 'ITF14':
				return /^\d{13,14}$/.test(inputText);
			case 'MSI':
				return /^\d+$/.test(inputText);
			case 'pharmacode':
				const num = parseInt(inputText);
				return !isNaN(num) && num >= 3 && num <= 131070;
			case 'CODE128':
			default:
				return true;
		}
	});

	const inputValidationMessage = $derived(() => {
		if (!inputText.trim()) return 'Input is required';
		if (!isValidInput()) {
			switch (selectedFormat) {
				case 'EAN13':
					return 'EAN13 requires 12-13 digits';
				case 'EAN8':
					return 'EAN8 requires 7-8 digits';
				case 'UPC':
					return 'UPC-A requires 11-12 digits';
				case 'CODE39':
					return 'CODE39 supports A-Z, 0-9, and -. $/+% characters';
				case 'ITF14':
					return 'ITF-14 requires 13-14 digits';
				case 'MSI':
					return 'MSI supports numeric characters only';
				case 'pharmacode':
					return 'Pharmacode requires a number between 3 and 131070';
				default:
					return 'Invalid input for selected format';
			}
		}
		return '';
	});

	// Barcode statistics - using state to force updates
	let barcodeStats = $state({ width: 0, height: 0, size: 0 });
	
	function updateStats() {
		if (!canvas) {
			barcodeStats = { width: 0, height: 0, size: 0 };
			return;
		}
		
		try {
			const dataUrl = canvas.toDataURL();
			barcodeStats = {
				width: canvas.width,
				height: canvas.height,
				size: Math.round(dataUrl.length * 0.75 / 1024) // Approximate size in KB
			};
		} catch (error) {
			barcodeStats = { width: 0, height: 0, size: 0 };
		}
	}
</script>

<PageHeader
	title="Barcode Generator"
	subtitle="Generate various types of barcodes with customizable options"
	icon={ScanBarcodeIcon}
/>

<PageContainer>
	{#snippet children()}
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
			<div class="space-y-6 lg:col-span-2">
				<Card>
					<CardHeader>
						<CardTitle>Barcode Settings</CardTitle>
						<CardDescription>Configure your barcode generation options</CardDescription>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="space-y-2">
							<Label for="input-text">Text/Number to Encode</Label>
							<Input
								id="input-text"
								type="text"
								bind:value={inputText}
								placeholder="Enter text or number"
								class={!isValidInput() && inputText.trim() ? 'border-red-500 dark:border-red-400' : ''}
							/>
							<div class="text-xs text-muted-foreground">
								{#if inputValidationMessage()}
									<span class="text-red-600 dark:text-red-400">{inputValidationMessage()}</span>
								{:else}
									<span class="text-green-600 dark:text-green-400">✓ Valid input for {selectedFormat}</span>
								{/if}
							</div>
						</div>

						<div class="space-y-2">
							<Label>Barcode Format</Label>
							<Select.Root type="single" name="barcodeFormat" bind:value={selectedFormat}>
								<Select.Trigger class="w-full">
									{formatTriggerContent}
								</Select.Trigger>
								<Select.Content>
									<Select.Group>
										<Select.Label>Barcode Formats</Select.Label>
										{#each formatOptions as format (format.value)}
											<Select.Item value={format.value} label={format.label}>
												<div>
													<div class="font-medium">{format.label}</div>
													<div class="text-xs text-muted-foreground">{format.description}</div>
												</div>
											</Select.Item>
										{/each}
									</Select.Group>
								</Select.Content>
							</Select.Root>
						</div>

						<div class="grid grid-cols-2 gap-4">
							<div class="space-y-2">
								<Label for="width">Bar Width</Label>
								<Input
									id="width"
									type="number"
									bind:value={width}
									min="1"
									max="5"
									step="0.5"
								/>
							</div>
							<div class="space-y-2">
								<Label for="height">Bar Height</Label>
								<Input
									id="height"
									type="number"
									bind:value={height}
									min="20"
									max="200"
									step="10"
								/>
							</div>
						</div>

						<Separator />

						<div class="space-y-4">
							<div class="flex items-center space-x-2">
								<Checkbox bind:checked={displayValue} id="display-value" />
								<Label for="display-value">Show text below barcode</Label>
							</div>

							{#if displayValue}
								<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div class="space-y-2">
										<Label for="font-size">Font Size</Label>
										<Input
											id="font-size"
											type="number"
											bind:value={fontSize}
											min="8"
											max="40"
											step="2"
										/>
									</div>
									<div class="space-y-2">
										<Label>Text Alignment</Label>
										<Select.Root type="single" name="textAlign" bind:value={textAlign}>
											<Select.Trigger class="w-full">
												{alignTriggerContent}
											</Select.Trigger>
											<Select.Content>
												<Select.Group>
													<Select.Label>Text Alignment</Select.Label>
													{#each textAlignOptions as align (align.value)}
														<Select.Item value={align.value} label={align.label}>
															{align.label}
														</Select.Item>
													{/each}
												</Select.Group>
											</Select.Content>
										</Select.Root>
									</div>
									<div class="space-y-2">
										<Label>Text Position</Label>
										<Select.Root type="single" name="textPosition" bind:value={textPosition}>
											<Select.Trigger class="w-full">
												{positionTriggerContent}
											</Select.Trigger>
											<Select.Content>
												<Select.Group>
													<Select.Label>Text Position</Select.Label>
													{#each textPositionOptions as position (position.value)}
														<Select.Item value={position.value} label={position.label}>
															{position.label}
														</Select.Item>
													{/each}
												</Select.Group>
											</Select.Content>
										</Select.Root>
									</div>
								</div>
							{/if}
						</div>

						<Separator />

						<div class="grid grid-cols-2 gap-4">
							<div class="space-y-2">
								<Label for="bg-color">Background Color</Label>
								<div class="flex space-x-2">
									<Input
										id="bg-color"
										type="color"
										bind:value={backgroundColor}
										class="w-16 h-10 p-1 border rounded"
									/>
									<Input
										type="text"
										bind:value={backgroundColor}
										placeholder="#ffffff"
										class="flex-1"
									/>
								</div>
							</div>
							<div class="space-y-2">
								<Label for="line-color">Bar Color</Label>
								<div class="flex space-x-2">
									<Input
										id="line-color"
										type="color"
										bind:value={lineColor}
										class="w-16 h-10 p-1 border rounded"
									/>
									<Input
										type="text"
										bind:value={lineColor}
										placeholder="#000000"
										class="flex-1"
									/>
								</div>
							</div>
						</div>

						<Separator />

						<div class="flex flex-wrap gap-2">
							<Button onclick={copyBarcode} disabled={!isValidInput()}>
								<CopyIcon class="mr-2 h-4 w-4" />
								Copy Barcode
							</Button>
							<Button variant="outline" onclick={downloadBarcode} disabled={!isValidInput()}>
								<DownloadIcon class="mr-2 h-4 w-4" />
								Download PNG
							</Button>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Generated Barcode</CardTitle>
						<CardDescription>
							{barcodeStats.width}×{barcodeStats.height}px, ~{barcodeStats.size}KB
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div class="space-y-4">
							<div class="flex justify-center border border-border rounded-lg p-4 bg-white">
								<canvas
									bind:this={canvas}
									class="max-w-full h-auto"
									style="image-rendering: crisp-edges;"
								></canvas>
							</div>

							<div class="flex items-center justify-between text-sm text-muted-foreground">
								<span>Format: {selectedFormat}</span>
								<div class="flex gap-2">
									<Button
										variant="ghost"
										size="sm"
										onclick={copyBarcode}
										disabled={!isValidInput()}
										class="h-8"
									>
										<CopyIcon class="mr-2 h-3 w-3" />
										Copy
									</Button>
									<Button
										variant="ghost"
										size="sm"
										onclick={downloadBarcode}
										disabled={!isValidInput()}
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
						<CardTitle>Barcode Statistics</CardTitle>
						<CardDescription>Generated barcode information</CardDescription>
					</CardHeader>
					<CardContent class="space-y-3">
						<div class="space-y-2 text-sm">
							<div class="flex justify-between">
								<span class="font-medium">Format:</span>
								<span class="text-muted-foreground">{selectedFormat}</span>
							</div>
							<div class="flex justify-between">
								<span class="font-medium">Dimensions:</span>
								<span class="text-muted-foreground">{barcodeStats.width}×{barcodeStats.height}px</span>
							</div>
							<div class="flex justify-between">
								<span class="font-medium">File Size:</span>
								<span class="text-muted-foreground">~{barcodeStats.size}KB</span>
							</div>
							<div class="flex justify-between">
								<span class="font-medium">Bar Width:</span>
								<span class="text-muted-foreground">{width}px</span>
							</div>
							<div class="flex justify-between">
								<span class="font-medium">Bar Height:</span>
								<span class="text-muted-foreground">{height}px</span>
							</div>
							<div class="flex justify-between">
								<span class="font-medium">Text Display:</span>
								<span class="text-muted-foreground">{displayValue ? 'Enabled' : 'Disabled'}</span>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Format Information</CardTitle>
						<CardDescription>Selected barcode format details</CardDescription>
					</CardHeader>
					<CardContent>
						{#each formatOptions as format}
							{#if format.value === selectedFormat}
								<div class="space-y-2 text-sm">
									<h4 class="font-medium">{format.label}</h4>
									<p class="text-muted-foreground">{format.description}</p>
									
									{#if format.value === 'CODE128'}
										<p class="text-muted-foreground">Supports all ASCII characters. Most versatile format.</p>
									{:else if format.value === 'CODE39'}
										<p class="text-muted-foreground">Supports A-Z, 0-9, and special characters: - . $ / + %</p>
									{:else if format.value === 'EAN13'}
										<p class="text-muted-foreground">Standard product barcode. Requires 12-13 digits.</p>
									{:else if format.value === 'EAN8'}
										<p class="text-muted-foreground">Compact product barcode. Requires 7-8 digits.</p>
									{:else if format.value === 'UPC'}
										<p class="text-muted-foreground">North American product code. Requires 11-12 digits.</p>
									{:else if format.value === 'ITF14'}
										<p class="text-muted-foreground">Shipping container code. Requires 13-14 digits.</p>
									{:else if format.value === 'MSI'}
										<p class="text-muted-foreground">Inventory management. Numeric only.</p>
									{:else if format.value === 'pharmacode'}
										<p class="text-muted-foreground">Pharmaceutical packaging. Number 3-131070.</p>
									{/if}
								</div>
							{/if}
						{/each}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Barcode Formats</CardTitle>
						<CardDescription>Available barcode types</CardDescription>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="space-y-3 text-sm">
							<div>
								<h4 class="font-medium">Linear Barcodes</h4>
								<p class="text-muted-foreground">1D barcodes for various applications</p>
							</div>

							<div>
								<h4 class="font-medium">Retail & Products</h4>
								<p class="text-muted-foreground">EAN13, EAN8, UPC-A for product identification</p>
							</div>

							<div>
								<h4 class="font-medium">Industrial & Shipping</h4>
								<p class="text-muted-foreground">CODE128, CODE39, ITF-14 for logistics</p>
							</div>

							<div>
								<h4 class="font-medium">Specialized</h4>
								<p class="text-muted-foreground">MSI for inventory, Pharmacode for pharmaceuticals</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Usage Tips</CardTitle>
						<CardDescription>Best practices for barcode generation</CardDescription>
					</CardHeader>
					<CardContent>
						<div class="space-y-2 text-sm">
							<p>• Choose the right format for your application</p>
							<p>• Ensure sufficient contrast between bars and background</p>
							<p>• Test scannability with your target devices</p>
							<p>• Use appropriate sizing for printing resolution</p>
							<p>• Validate input data for the selected format</p>
							<p>• Consider quiet zones (margins) around barcodes</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	{/snippet}
</PageContainer>