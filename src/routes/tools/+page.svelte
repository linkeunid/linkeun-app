<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import PageContainer from '$lib/components/ui/page-container.svelte';
	import PageHeader from '$lib/components/ui/page-header.svelte';
	import BinaryIcon from '@lucide/svelte/icons/binary';
	import BracesIcon from '@lucide/svelte/icons/braces';
	import ClockIcon from '@lucide/svelte/icons/clock';
	import DatabaseIcon from '@lucide/svelte/icons/database';
	import DiffIcon from '@lucide/svelte/icons/diff';
	import FileTextIcon from '@lucide/svelte/icons/file-text';
	import ImageIcon from '@lucide/svelte/icons/image';
	import KeyIcon from '@lucide/svelte/icons/key';
	import LinkIcon from '@lucide/svelte/icons/link';
	import QrCodeIcon from '@lucide/svelte/icons/qr-code';
	import ScanBarcodeIcon from '@lucide/svelte/icons/scan-barcode';
	import ShareIcon from '@lucide/svelte/icons/share';
	import ShieldIcon from '@lucide/svelte/icons/shield';
	import TableIcon from '@lucide/svelte/icons/table';
	import TypeIcon from '@lucide/svelte/icons/type';
	import WrenchIcon from '@lucide/svelte/icons/wrench';
</script>

<PageHeader title="Tools" subtitle="Useful utilities and tools" icon={WrenchIcon} />

<PageContainer>
	{#snippet children()}
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						<FileTextIcon class="h-5 w-5" />
						Text Counter
					</CardTitle>
					<CardDescription>Count characters, words, and lines in your text</CardDescription>
				</CardHeader>
				<CardContent>
					<Button href="/tools/text-counter" class="w-full">Open Tool</Button>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						<QrCodeIcon class="h-5 w-5" />
						QR Code Generator
					</CardTitle>
					<CardDescription>Generate QR codes with custom watermarks and styling</CardDescription>
				</CardHeader>
				<CardContent>
					<Button href="/tools/qr-generator" class="w-full">Open Tool</Button>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						<KeyIcon class="h-5 w-5" />
						Password Generator
					</CardTitle>
					<CardDescription>Generate secure passwords with breach checking</CardDescription>
				</CardHeader>
				<CardContent>
					<Button href="/tools/password-generator" class="w-full">Open Tool</Button>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						<BinaryIcon class="h-5 w-5" />
						Multi-Format Encoder/Decoder
					</CardTitle>
					<CardDescription>Encode and decode text using Base64, Base32, and Base16 (Hex) formats</CardDescription>
				</CardHeader>
				<CardContent>
					<Button href="/tools/base64" class="w-full">Open Tool</Button>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						<BracesIcon class="h-5 w-5" />
						JSON Formatter/Validator
					</CardTitle>
					<CardDescription
						>Format, validate, and analyze JSON data with advanced options</CardDescription
					>
				</CardHeader>
				<CardContent>
					<Button href="/tools/json-formatter" class="w-full">Open Tool</Button>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						<DiffIcon class="h-5 w-5" />
						Text Diff Analyzer
					</CardTitle>
					<CardDescription
						>Compare and analyze differences between two text documents</CardDescription
					>
				</CardHeader>
				<CardContent>
					<Button href="/tools/text-diff" class="w-full">Open Tool</Button>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						<LinkIcon class="h-5 w-5" />
						URL Encoder/Decoder
					</CardTitle>
					<CardDescription>Encode and decode URLs with component-level control</CardDescription>
				</CardHeader>
				<CardContent>
					<Button href="/tools/url-encoder" class="w-full">Open Tool</Button>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						<ClockIcon class="h-5 w-5" />
						Timestamp Converter
					</CardTitle>
					<CardDescription>Convert between human-readable dates and Unix timestamps</CardDescription
					>
				</CardHeader>
				<CardContent>
					<Button href="/tools/timestamp-converter" class="w-full">Open Tool</Button>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						<TypeIcon class="h-5 w-5" />
						Lorem Ipsum Generator
					</CardTitle>
					<CardDescription>Generate placeholder text for designs and content</CardDescription>
				</CardHeader>
				<CardContent>
					<Button href="/tools/lorem-ipsum" class="w-full">Open Tool</Button>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						<DatabaseIcon class="h-5 w-5" />
						Fake Data Generator
					</CardTitle>
					<CardDescription>Generate realistic test data for development and testing</CardDescription
					>
				</CardHeader>
				<CardContent>
					<Button href="/tools/fake-data" class="w-full">Open Tool</Button>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						<ImageIcon class="h-5 w-5" />
						ASCII Art Generator
					</CardTitle>
					<CardDescription
						>Convert text into beautiful ASCII art with multiple fonts</CardDescription
					>
				</CardHeader>
				<CardContent>
					<Button href="/tools/ascii-art" class="w-full">Open Tool</Button>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						<ShareIcon class="h-5 w-5" />
						Open Graph Generator
					</CardTitle>
					<CardDescription>Generate Open Graph metadata for your website</CardDescription>
				</CardHeader>
				<CardContent>
					<Button href="/tools/open-graph" class="w-full">Open Tool</Button>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						<ScanBarcodeIcon class="h-5 w-5" />
						Barcode Generator
					</CardTitle>
					<CardDescription>Generate various types of barcodes with customizable options</CardDescription>
				</CardHeader>
				<CardContent>
					<Button href="/tools/barcode-generator" class="w-full">Open Tool</Button>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						<TableIcon class="h-5 w-5" />
						CSV/JSON Table Viewer
					</CardTitle>
					<CardDescription>Parse and view CSV/JSON data in a structured table format</CardDescription>
				</CardHeader>
				<CardContent>
					<Button href="/tools/table-viewer" class="w-full">Open Tool</Button>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						<ClockIcon class="h-5 w-5" />
						Binary Clock
					</CardTitle>
					<CardDescription>Display current time in binary format with LED-style indicators</CardDescription>
				</CardHeader>
				<CardContent>
					<Button href="/tools/binary-clock" class="w-full">Open Tool</Button>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						<ShieldIcon class="h-5 w-5" />
						Text Encryption
					</CardTitle>
					<CardDescription>Encrypt and decrypt text using Morse code, Caesar cipher, and more</CardDescription>
				</CardHeader>
				<CardContent>
					<Button href="/tools/text-encrypt" class="w-full">Open Tool</Button>
				</CardContent>
			</Card>

			<!-- WIP: Markdown Editor - temporarily disabled for development
		<Card>
			<CardHeader>
				<CardTitle class="flex items-center gap-2">
					<NotebookPenIcon class="h-5 w-5" />
					Markdown Editor/Preview
				</CardTitle>
				<CardDescription>Live markdown editor with syntax highlighting and HTML export</CardDescription>
			</CardHeader>
			<CardContent>
				<Button href="/tools/markdown-editor" class="w-full">Open Tool</Button>
			</CardContent>
		</Card>
		-->
		</div>
	{/snippet}
</PageContainer>
