<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import { Switch } from '$lib/components/ui/switch';
	import PageContainer from '$lib/components/ui/page-container.svelte';
	import PageHeader from '$lib/components/ui/page-header.svelte';
	import BinaryIcon from '@lucide/svelte/icons/binary';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import DownloadIcon from '@lucide/svelte/icons/download';
	import FileIcon from '@lucide/svelte/icons/file';
	import RefreshCwIcon from '@lucide/svelte/icons/refresh-cw';
	import UploadIcon from '@lucide/svelte/icons/upload';
	import { toast } from 'svelte-sonner';

	let inputText = $state('');
	let outputText = $state('');
	let mode = $state<'encode' | 'decode'>('encode');
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
				// Encode to Base64
				const encoded = btoa(unescape(encodeURIComponent(inputText)));
				outputText = urlSafe ? encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '') : encoded;
			} else {
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
				const decoded = decodeURIComponent(escape(atob(input)));
				outputText = decoded;
			}
		} catch (error) {
			outputText = mode === 'decode' ? 'Invalid Base64 input' : '';
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
		a.download = mode === 'encode' ? 'encoded.txt' : 'decoded.txt';
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

	// Input validation for decode mode
	const isValidBase64 = $derived(() => {
		if (mode !== 'decode' || !inputText.trim()) return true;
		
		try {
			let input = inputText.trim();
			if (urlSafe) {
				input = input.replace(/-/g, '+').replace(/_/g, '/');
				while (input.length % 4) {
					input += '=';
				}
			}
			// Check if it's valid Base64
			return /^[A-Za-z0-9+/]*={0,2}$/.test(input);
		} catch {
			return false;
		}
	});
</script>

<PageHeader 
	title="Base64 Encoder/Decoder" 
	subtitle="Encode and decode Base64 strings with support for URL-safe encoding" 
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
					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label>Mode</Label>
							<div class="flex items-center space-x-4">
								<label class="flex items-center space-x-2">
									<input type="radio" bind:group={mode} value="encode" />
									<span class="text-sm">Encode</span>
								</label>
								<label class="flex items-center space-x-2">
									<input type="radio" bind:group={mode} value="decode" />
									<span class="text-sm">Decode</span>
								</label>
							</div>
						</div>

						<div class="flex items-center space-x-2">
							<Switch id="url-safe" bind:checked={urlSafe} />
							<Label for="url-safe">URL-Safe Base64</Label>
						</div>
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
					<CardTitle>Input ({mode === 'encode' ? 'Plain Text' : 'Base64'})</CardTitle>
					<CardDescription>
						{mode === 'encode' 
							? 'Enter the text you want to encode to Base64' 
							: 'Enter the Base64 string you want to decode'}
					</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-2">
						<textarea
							bind:value={inputText}
							placeholder={mode === 'encode' 
								? 'Enter plain text to encode...' 
								: 'Enter Base64 string to decode...'}
							class="min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
						></textarea>
						
						{#if mode === 'decode' && inputText && !isValidBase64()}
							<p class="text-sm text-red-600">Invalid Base64 format</p>
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
					<CardTitle>Output ({mode === 'encode' ? 'Base64' : 'Plain Text'})</CardTitle>
					<CardDescription>
						{mode === 'encode' 
							? 'The Base64 encoded result' 
							: 'The decoded plain text result'}
					</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-2">
						<textarea
							value={outputText}
							readonly
							placeholder={mode === 'encode' 
								? 'Base64 encoded text will appear here...' 
								: 'Decoded plain text will appear here...'}
							class="min-h-[200px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
						></textarea>
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
					<CardDescription>About Base64 encoding</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-3 text-sm">
						<div>
							<h4 class="font-medium">What is Base64?</h4>
							<p class="text-muted-foreground">Base64 is a binary-to-text encoding scheme that represents binary data in ASCII string format using 64 printable characters.</p>
						</div>

						<div>
							<h4 class="font-medium">URL-Safe Base64</h4>
							<p class="text-muted-foreground">Replaces + with -, / with _, and removes padding (=) to make it safe for URLs and filenames.</p>
						</div>

						<div>
							<h4 class="font-medium">Common Uses</h4>
							<ul class="text-muted-foreground list-disc list-inside space-y-1">
								<li>Email attachments (MIME)</li>
								<li>Data URLs in web pages</li>
								<li>API authentication tokens</li>
								<li>Storing binary data in text formats</li>
							</ul>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Examples</CardTitle>
					<CardDescription>Common Base64 examples</CardDescription>
				</CardHeader>
				<CardContent>
					<div class="space-y-3 text-sm">
						<div>
							<p class="font-medium">Text: "Hello, World!"</p>
							<p class="text-muted-foreground font-mono">SGVsbG8sIFdvcmxkIQ==</p>
						</div>

						<div>
							<p class="font-medium">Text: "Base64"</p>
							<p class="text-muted-foreground font-mono">QmFzZTY0</p>
						</div>

						<div>
							<p class="font-medium">URL-Safe: "Hello?"</p>
							<p class="text-muted-foreground font-mono">SGVsbG8_</p>
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
						<p>• Base64 increases data size by ~33%</p>
						<p>• Use URL-safe for web applications</p>
						<p>• Binary files can be encoded for text storage</p>
						<p>• Decoding validates input format</p>
						<p>• Copy/paste or upload files for conversion</p>
					</div>
				</CardContent>
			</Card>
		</div>
	</div>

	{/snippet}
</PageContainer>