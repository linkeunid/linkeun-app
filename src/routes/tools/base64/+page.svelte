<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group';
	import { Separator } from '$lib/components/ui/separator';
	import { Switch } from '$lib/components/ui/switch';
	import { Textarea } from '$lib/components/ui/textarea';
	import PageContainer from '$lib/components/ui/page-container.svelte';
	import PageHeader from '$lib/components/ui/page-header.svelte';
	import BinaryIcon from '@lucide/svelte/icons/binary';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import DownloadIcon from '@lucide/svelte/icons/download';
	import RefreshCwIcon from '@lucide/svelte/icons/refresh-cw';
	import UploadIcon from '@lucide/svelte/icons/upload';
	import { toast } from 'svelte-sonner';

	let inputText = $state('');
	let outputText = $state('');
	let mode = $state<'encode' | 'decode'>('encode');
	let format = $state<'base64' | 'base32' | 'base16'>('base64');
	let urlSafe = $state(false);
	let fileInput: HTMLInputElement;
	let outputAsFile = $state(false);

	// Real-time encoding/decoding
	$effect(() => {
		if (!inputText.trim()) {
			outputText = '';
			return;
		}

		try {
			if (mode === 'encode') {
				if (format === 'base64') {
					// Encode to Base64
					const encoded = btoa(new TextEncoder().encode(inputText).reduce((str, byte) => str + String.fromCharCode(byte), ''));
					outputText = urlSafe ? encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '') : encoded;
				} else if (format === 'base32') {
					outputText = encodeBase32(inputText);
				} else if (format === 'base16') {
					outputText = Array.from(new TextEncoder().encode(inputText))
						.map(byte => byte.toString(16).padStart(2, '0'))
						.join('')
						.toUpperCase();
				}
			} else {
				if (format === 'base64') {
					// Decode from Base64
					let input = inputText;
					if (urlSafe) {
						// Convert URL-safe back to standard Base64
						input = input.replace(/-/g, '+').replace(/_/g, '/');
						// Add padding if needed
						while (input.length % 4) {
							input += '=';
						}
					}
					const decoded = atob(input);
					outputText = new TextDecoder().decode(new Uint8Array([...decoded].map(char => char.charCodeAt(0))));
				} else if (format === 'base32') {
					outputText = decodeBase32(inputText);
				} else if (format === 'base16') {
					const bytes = inputText.replace(/\s/g, '').match(/.{1,2}/g)?.map(hex => parseInt(hex, 16)) || [];
					outputText = new TextDecoder().decode(new Uint8Array(bytes));
				}
			}
		} catch (error) {
			outputText = mode === 'decode' ? `Invalid ${format.toUpperCase()} input` : '';
		}
	});

	function switchMode() {
		const temp = inputText;
		inputText = outputText;
		outputText = temp;
		mode = mode === 'encode' ? 'decode' : 'encode';
	}

	function clearAll() {
		inputText = '';
		outputText = '';
	}

	async function copyOutput() {
		if (outputText) {
			try {
				await navigator.clipboard.writeText(outputText);
				toast.success('Output copied to clipboard!');
			} catch (error) {
				toast.error('Failed to copy to clipboard');
			}
		}
	}

	function downloadOutput() {
		if (!outputText) return;

		const blob = new Blob([outputText], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = mode === 'encode' ? `encoded_${format}.txt` : `decoded_${format}.txt`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		toast.success('File downloaded successfully!');
	}

	function handleFileUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		
		if (file) {
			if (outputAsFile) {
				// Read file as binary for encoding
				const reader = new FileReader();
				reader.onload = (e) => {
					const arrayBuffer = e.target?.result as ArrayBuffer;
					const bytes = new Uint8Array(arrayBuffer);
					const binaryString = Array.from(bytes, byte => String.fromCharCode(byte)).join('');
					const encoded = btoa(binaryString);
					inputText = urlSafe ? encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '') : encoded;
					mode = 'decode'; // Switch to decode mode to show the binary data info
				};
				reader.readAsArrayBuffer(file);
			} else {
				// Read file as text
				const reader = new FileReader();
				reader.onload = (e) => {
					inputText = e.target?.result as string || '';
				};
				reader.readAsText(file);
			}
		}
	}

	// Base32 encoding/decoding functions
	function encodeBase32(input: string): string {
		const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
		const bytes = new TextEncoder().encode(input);
		let result = '';
		let buffer = 0;
		let bitsLeft = 0;

		for (const byte of bytes) {
			buffer = (buffer << 8) | byte;
			bitsLeft += 8;

			while (bitsLeft >= 5) {
				result += alphabet[(buffer >> (bitsLeft - 5)) & 31];
				bitsLeft -= 5;
			}
		}

		if (bitsLeft > 0) {
			result += alphabet[(buffer << (5 - bitsLeft)) & 31];
		}

		// Add padding
		while (result.length % 8 !== 0) {
			result += '=';
		}

		return result;
	}

	function decodeBase32(input: string): string {
		const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
		const cleanInput = input.replace(/=/g, '').toUpperCase();
		const bytes: number[] = [];
		let buffer = 0;
		let bitsLeft = 0;

		for (const char of cleanInput) {
			const index = alphabet.indexOf(char);
			if (index === -1) throw new Error('Invalid Base32 character');

			buffer = (buffer << 5) | index;
			bitsLeft += 5;

			if (bitsLeft >= 8) {
				bytes.push((buffer >> (bitsLeft - 8)) & 255);
				bitsLeft -= 8;
			}
		}

		return new TextDecoder().decode(new Uint8Array(bytes));
	}

	// Input validation for decode mode
	const isValidInput = $derived(() => {
		if (mode !== 'decode' || !inputText.trim()) return true;
		
		try {
			const input = inputText.trim();
			if (format === 'base64') {
				let testInput = input;
				if (urlSafe) {
					testInput = input.replace(/-/g, '+').replace(/_/g, '/');
					while (testInput.length % 4) {
						testInput += '=';
					}
				}
				return /^[A-Za-z0-9+/]*={0,2}$/.test(testInput);
			} else if (format === 'base32') {
				return /^[A-Z2-7=]*$/.test(input.toUpperCase());
			} else if (format === 'base16') {
				return /^[0-9A-Fa-f\s]*$/.test(input) && input.replace(/\s/g, '').length % 2 === 0;
			}
			return true;
		} catch {
			return false;
		}
	});
</script>

<PageHeader 
	title="Multi-Format Encoder/Decoder" 
	subtitle="Encode and decode text using Base64, Base32, and Base16 (Hex) formats" 
	icon={BinaryIcon} 
/>

<PageContainer>
	{#snippet children()}

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<div class="lg:col-span-2 space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Settings</CardTitle>
					<CardDescription>Configure encoding/decoding options</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-4">
						<div class="grid grid-cols-2 gap-4">
							<div class="space-y-2">
								<Label>Mode</Label>
								<RadioGroup bind:value={mode} class="flex items-center space-x-4">
									<div class="flex items-center space-x-2">
										<RadioGroupItem value="encode" id="encode" />
										<Label for="encode" class="text-sm">Encode</Label>
									</div>
									<div class="flex items-center space-x-2">
										<RadioGroupItem value="decode" id="decode" />
										<Label for="decode" class="text-sm">Decode</Label>
									</div>
								</RadioGroup>
							</div>

							<div class="space-y-2">
								<Label>Format</Label>
								<RadioGroup bind:value={format} class="flex items-center space-x-4">
									<div class="flex items-center space-x-2">
										<RadioGroupItem value="base64" id="base64" />
										<Label for="base64" class="text-sm">Base64</Label>
									</div>
									<div class="flex items-center space-x-2">
										<RadioGroupItem value="base32" id="base32" />
										<Label for="base32" class="text-sm">Base32</Label>
									</div>
									<div class="flex items-center space-x-2">
										<RadioGroupItem value="base16" id="base16" />
										<Label for="base16" class="text-sm">Base16 (Hex)</Label>
									</div>
								</RadioGroup>
							</div>
						</div>

						{#if format === 'base64'}
							<div class="flex items-center space-x-2">
								<Switch id="url-safe" bind:checked={urlSafe} />
								<Label for="url-safe">URL-Safe Base64</Label>
							</div>
						{/if}
					</div>

					<Separator />

					<div class="space-y-3">
						<Label>File Upload Options</Label>
						<div class="flex items-center space-x-2">
							<Switch id="output-as-file" bind:checked={outputAsFile} />
							<Label for="output-as-file">Upload file as binary (for encoding)</Label>
						</div>
						
						<Button variant="outline" onclick={() => fileInput.click()}>
							<UploadIcon class="mr-2 h-4 w-4" />
							Upload {outputAsFile ? 'Binary File' : 'Text File'}
						</Button>
						<input
							bind:this={fileInput}
							type="file"
							accept={outputAsFile ? "*/*" : ".txt,.json,.xml,.csv"}
							onchange={handleFileUpload}
							class="hidden"
						/>
					</div>

					<div class="flex flex-wrap gap-2">
						<Button onclick={switchMode} disabled={!inputText && !outputText}>
							<RefreshCwIcon class="mr-2 h-4 w-4" />
							Switch Mode
						</Button>

						<Button variant="outline" onclick={clearAll} disabled={!inputText && !outputText}>
							Clear All
						</Button>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Input ({mode === 'encode' ? 'Plain Text' : format.toUpperCase()})</CardTitle>
					<CardDescription>
						{mode === 'encode' 
							? `Enter the text you want to encode to ${format.toUpperCase()}` 
							: `Enter the ${format.toUpperCase()} string you want to decode`}
					</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-2">
						<Textarea
							bind:value={inputText}
							placeholder={mode === 'encode' 
								? 'Enter plain text to encode...' 
								: `Enter ${format.toUpperCase()} string to decode...`}
							class="min-h-[200px] font-mono"
						/>
						
						{#if mode === 'decode' && inputText && !isValidInput()}
							<p class="text-sm text-red-600">Invalid {format.toUpperCase()} format</p>
						{/if}
					</div>

					{#if inputText}
						<div class="text-sm text-muted-foreground">
							<p>Length: {inputText.length} characters</p>
							{#if mode === 'encode'}
								<p>Bytes: {new TextEncoder().encode(inputText).length}</p>
							{/if}
						</div>
					{/if}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Output ({mode === 'encode' ? format.toUpperCase() : 'Plain Text'})</CardTitle>
					<CardDescription>
						{mode === 'encode' 
							? `The ${format.toUpperCase()} encoded result` 
							: 'The decoded plain text result'}
					</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-2">
						<Textarea
							value={outputText}
							readonly
							placeholder={mode === 'encode' 
								? `${format.toUpperCase()} encoded text will appear here...` 
								: 'Decoded plain text will appear here...'}
							class="min-h-[200px] bg-muted font-mono"
						/>
					</div>

					{#if outputText}
						<div class="text-sm text-muted-foreground">
							<p>Length: {outputText.length} characters</p>
							{#if mode === 'decode'}
								<p>Bytes: {new TextEncoder().encode(outputText).length}</p>
							{/if}
						</div>
					{/if}

					<div class="flex flex-wrap gap-2">
						<Button onclick={copyOutput} disabled={!outputText}>
							<CopyIcon class="mr-2 h-4 w-4" />
							Copy Output
						</Button>

						<Button variant="outline" onclick={downloadOutput} disabled={!outputText}>
							<DownloadIcon class="mr-2 h-4 w-4" />
							Download
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>

		<div class="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Information</CardTitle>
					<CardDescription>About encoding formats</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-3 text-sm">
						<div>
							<h4 class="font-medium">Base64</h4>
							<p class="text-muted-foreground">Uses 64 characters (A-Z, a-z, 0-9, +, /) to encode binary data. Commonly used for email attachments and data URLs.</p>
						</div>

						<div>
							<h4 class="font-medium">Base32</h4>
							<p class="text-muted-foreground">Uses 32 characters (A-Z, 2-7) for better human readability. Often used in TOTP authentication codes.</p>
						</div>

						<div>
							<h4 class="font-medium">Base16 (Hex)</h4>
							<p class="text-muted-foreground">Uses hexadecimal (0-9, A-F) to represent each byte as two characters. Simple and widely supported.</p>
						</div>

						<div>
							<h4 class="font-medium">URL-Safe Base64</h4>
							<p class="text-muted-foreground">Replaces + with -, / with _, and removes padding (=) to make it safe for URLs and filenames.</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Examples</CardTitle>
					<CardDescription>Encoding examples for "Hello"</CardDescription>
				</CardHeader>
				<CardContent>
					<div class="space-y-3 text-sm">
						<div>
							<p class="font-medium">Base64</p>
							<p class="text-muted-foreground font-mono">SGVsbG8=</p>
						</div>

						<div>
							<p class="font-medium">Base32</p>
							<p class="text-muted-foreground font-mono">JBSWY3DP</p>
						</div>

						<div>
							<p class="font-medium">Base16 (Hex)</p>
							<p class="text-muted-foreground font-mono">48656C6C6F</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Tips</CardTitle>
					<CardDescription>Usage guidelines</CardDescription>
				</CardHeader>
				<CardContent>
					<div class="space-y-2 text-sm">
						<p>• Base64: ~33% size increase, widely supported</p>
						<p>• Base32: ~60% size increase, human-friendly</p>
						<p>• Base16: 100% size increase, simple format</p>
						<p>• Use URL-safe Base64 for web applications</p>
						<p>• Upload files or paste text for conversion</p>
					</div>
				</CardContent>
			</Card>
		</div>
	</div>

	{/snippet}
</PageContainer>