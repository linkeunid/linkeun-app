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
	import * as Select from '$lib/components/ui/select';
	import { Separator } from '$lib/components/ui/separator';
	import PageContainer from '$lib/components/ui/page-container.svelte';
	import PageHeader from '$lib/components/ui/page-header.svelte';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import DownloadIcon from '@lucide/svelte/icons/download';
	import QrCodeIcon from '@lucide/svelte/icons/qr-code';
	import UploadIcon from '@lucide/svelte/icons/upload';
	import { createQrPngDataUrl } from '@svelte-put/qr';
	import { toast } from 'svelte-sonner';

	let text = $state('https://example.com');
	let size = $state(200);
	let errorCorrectionLevel = $state<'L' | 'M' | 'Q' | 'H'>('M');
	let foregroundColor = $state('#000000');
	let backgroundColor = $state('#ffffff');
	let watermarkFile: File | null = $state(null);
	let watermarkUrl = $state('');
	let watermarkSize = $state(75);
	let fileInput: HTMLInputElement;
	let qrDataUrl = $state('');

	const errorLevels = [
		{ value: 'L', label: 'Low (~7%)' },
		{ value: 'M', label: 'Medium (~15%)' },
		{ value: 'Q', label: 'Quartile (~25%)' },
		{ value: 'H', label: 'High (~30%)' }
	];

	const triggerContent = $derived(
		errorLevels.find((l) => l.value === errorCorrectionLevel)?.label ?? 'Select error correction'
	);

	$effect(() => {
		async function generateQr() {
			qrDataUrl = await createQrPngDataUrl({
				data: text,
				width: size,
				height: size,
				correction: errorCorrectionLevel,
				backgroundFill: backgroundColor,
				moduleFill: foregroundColor,
				anchorOuterFill: foregroundColor,
				anchorInnerFill: foregroundColor,
				logo: watermarkUrl || undefined,
				logoRatio: watermarkUrl ? watermarkSize / 100 : undefined
			});
		}

		generateQr();
	});

	function handleWatermarkUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (file && file.type.startsWith('image/')) {
			watermarkFile = file;

			const reader = new FileReader();
			reader.onload = (e) => {
				watermarkUrl = (e.target?.result as string) || '';
				toast.success('Watermark image uploaded successfully!');
			};
			reader.readAsDataURL(file);
		} else {
			watermarkFile = null;
			watermarkUrl = '';
			if (file) {
				toast.error('Please select a valid image file');
			}
		}
	}

	function downloadQR() {
		if (!qrDataUrl) return;

		const link = document.createElement('a');
		link.download = 'qr-code.png';
		link.href = qrDataUrl;
		link.click();
		toast.success('QR code downloaded successfully!');
	}

	async function copyQRToClipboard() {
		if (!qrDataUrl) return;

		try {
			const response = await fetch(qrDataUrl);
			const blob = await response.blob();
			const item = new ClipboardItem({ 'image/png': blob });
			await navigator.clipboard.write([item]);
			toast.success('QR code copied to clipboard!');
		} catch (error) {
			console.error('Failed to copy QR code:', error);
			toast.error('Failed to copy QR code to clipboard');
		}
	}
</script>

<PageHeader 
	title="QR Code Generator" 
	subtitle="Generate QR codes with custom watermarks and styling" 
	icon={QrCodeIcon} 
/>

<PageContainer>
	{#snippet children()}

	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<div class="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Content</CardTitle>
					<CardDescription>Enter the text or URL for your QR code</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-2">
						<Label for="qr-text">Text/URL</Label>
						<Input id="qr-text" bind:value={text} placeholder="Enter text or URL to encode" />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Styling</CardTitle>
					<CardDescription>Customize the appearance of your QR code</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label for="size">Size (px)</Label>
							<Input id="size" type="number" bind:value={size} min="100" max="800" step="50" />
						</div>
						<div class="space-y-2">
							<Label for="error-level">Error Correction</Label>
							<Select.Root type="single" name="errorLevel" bind:value={errorCorrectionLevel}>
								<Select.Trigger class="w-full">
									{triggerContent}
								</Select.Trigger>
								<Select.Content>
									<Select.Group>
										{#each errorLevels as level (level.value)}
											<Select.Item value={level.value} label={level.label}>
												{level.label}
											</Select.Item>
										{/each}
									</Select.Group>
								</Select.Content>
							</Select.Root>
						</div>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label for="fg-color">Foreground Color</Label>
							<div class="flex gap-2">
								<Input
									id="fg-color"
									type="color"
									bind:value={foregroundColor}
									class="h-10 w-16 p-1"
								/>
								<Input bind:value={foregroundColor} placeholder="#000000" class="flex-1" />
							</div>
						</div>
						<div class="space-y-2">
							<Label for="bg-color">Background Color</Label>
							<div class="flex gap-2">
								<Input
									id="bg-color"
									type="color"
									bind:value={backgroundColor}
									class="h-10 w-16 p-1"
								/>
								<Input bind:value={backgroundColor} placeholder="#ffffff" class="flex-1" />
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Watermark</CardTitle>
					<CardDescription>Add a logo or image to the center of your QR code</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-2">
						<Label>Upload Watermark Image</Label>
						<Button variant="outline" onclick={() => fileInput.click()}>
							<UploadIcon class="mr-2 h-4 w-4" />
							Choose Image
						</Button>
						<input
							bind:this={fileInput}
							type="file"
							accept="image/*"
							onchange={handleWatermarkUpload}
							class="hidden"
						/>
						{#if watermarkFile}
							<p class="text-muted-foreground text-sm">Selected: {watermarkFile.name}</p>
						{/if}
					</div>

					{#if watermarkFile}
						<div class="space-y-2">
							<Label for="watermark-size">Watermark Size (%)</Label>
							<Input
								id="watermark-size"
								type="range"
								bind:value={watermarkSize}
								min="10"
								max="100"
								step="5"
								class="w-full"
							/>
							<div class="text-muted-foreground text-center text-sm">{watermarkSize}%</div>
						</div>
					{/if}
				</CardContent>
			</Card>
		</div>

		<div>
			<Card>
				<CardHeader>
					<CardTitle>Preview</CardTitle>
					<CardDescription>Your generated QR code</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="flex justify-center">
						{#if qrDataUrl}
							<img
								src={qrDataUrl}
								alt="QR Code"
								class="rounded-lg border"
								width={size}
								height={size}
							/>
						{/if}
					</div>

					<Separator />

					<div class="flex flex-wrap gap-2">
						<Button onclick={downloadQR} disabled={!text}>
							<DownloadIcon class="mr-2 h-4 w-4" />
							Download
						</Button>

						<Button variant="outline" onclick={copyQRToClipboard} disabled={!text}>
							<CopyIcon class="mr-2 h-4 w-4" />
							Copy
						</Button>
					</div>

					<div class="text-muted-foreground text-xs">
						<p>
							<strong>Tip:</strong> Higher error correction levels allow for larger watermarks but make
							the QR code more dense.
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	</div>

	{/snippet}
</PageContainer>
