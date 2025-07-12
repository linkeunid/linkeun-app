<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import { Switch } from '$lib/components/ui/switch';
	import PageContainer from '$lib/components/ui/page-container.svelte';
	import PageHeader from '$lib/components/ui/page-header.svelte';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import DownloadIcon from '@lucide/svelte/icons/download';
	import LinkIcon from '@lucide/svelte/icons/link';
	import RefreshCwIcon from '@lucide/svelte/icons/refresh-cw';
	import UploadIcon from '@lucide/svelte/icons/upload';
	import { toast } from 'svelte-sonner';

	let inputText = $state('https://example.com/path with spaces?param=value with spaces&other=special chars!@#$%^&*()');
	let outputText = $state('');
	let mode = $state<'encode' | 'decode'>('encode');
	let encodeComponents = $state(false);
	let fileInput: HTMLInputElement;

	// Real-time encoding/decoding
	$effect(() => {
		if (!inputText.trim()) {
			outputText = '';
			return;
		}

		try {
			if (mode === 'encode') {
				if (encodeComponents) {
					// Encode each component separately
					outputText = encodeURIComponent(inputText);
				} else {
					// Encode the entire URL
					outputText = encodeURI(inputText);
				}
			} else {
				// Decode URL
				if (encodeComponents) {
					outputText = decodeURIComponent(inputText);
				} else {
					outputText = decodeURI(inputText);
				}
			}
		} catch (error) {
			outputText = 'Error: Invalid URL encoding';
		}
	});

	function swapInputOutput() {
		const temp = inputText;
		inputText = outputText;
		outputText = temp;
		mode = mode === 'encode' ? 'decode' : 'encode';
	}

	function clearAll() {
		inputText = '';
		outputText = '';
	}

	async function copyInput() {
		if (inputText) {
			try {
				await navigator.clipboard.writeText(inputText);
				toast.success('Input copied to clipboard!');
			} catch (error) {
				toast.error('Failed to copy to clipboard');
			}
		}
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
		a.download = `url-${mode}d.txt`;
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
			const reader = new FileReader();
			reader.onload = (e) => {
				inputText = e.target?.result as string || '';
			};
			reader.readAsText(file);
		}
	}

	function validateURL(url: string): boolean {
		try {
			new URL(url);
			return true;
		} catch {
			return false;
		}
	}

	// URL analysis
	let urlAnalysis = $derived.by(() => {
		if (!inputText.trim()) return null;
		
		try {
			const url = new URL(inputText);
			return {
				protocol: url.protocol,
				hostname: url.hostname,
				port: url.port || 'default',
				pathname: url.pathname,
				search: url.search,
				hash: url.hash,
				isValid: true
			};
		} catch {
			return { isValid: false };
		}
	});
</script>

<PageHeader 
	title="URL Encoder/Decoder" 
	subtitle="Encode and decode URLs with component-level control" 
	icon={LinkIcon} 
/>

<PageContainer>
	{#snippet children()}

	<div class="space-y-6">
		<Card>
			<CardHeader>
				<CardTitle>Encoding Options</CardTitle>
				<CardDescription>Configure URL encoding and decoding behavior</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
					<div class="space-y-2">
						<Label for="mode">Mode</Label>
						<select
							id="mode"
							bind:value={mode}
							class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						>
							<option value="encode">Encode URL</option>
							<option value="decode">Decode URL</option>
						</select>
					</div>
					
					<div class="flex items-center space-x-2">
						<Switch id="encode-components" bind:checked={encodeComponents} />
						<Label for="encode-components">Component Mode</Label>
					</div>
				</div>

				<div class="text-sm text-muted-foreground">
					<p><strong>Component Mode:</strong> {encodeComponents ? 'encodeURIComponent() - Encodes all special characters including /, ?, &' : 'encodeURI() - Preserves URL structure characters like /, ?, &'}</p>
				</div>

				<Separator />

				<div class="space-y-3">
					<Label>Quick Actions</Label>
					<div class="flex flex-wrap gap-2">
						<Button variant="outline" onclick={() => fileInput.click()}>
							<UploadIcon class="mr-2 h-4 w-4" />
							Upload File
						</Button>
						<input
							bind:this={fileInput}
							type="file"
							accept=".txt,.url"
							onchange={handleFileUpload}
							class="hidden"
						/>

						<Button variant="outline" onclick={swapInputOutput} disabled={!inputText || !outputText}>
							<RefreshCwIcon class="mr-2 h-4 w-4" />
							Swap & Toggle Mode
						</Button>
						
						<Button variant="outline" onclick={clearAll} disabled={!inputText && !outputText}>
							Clear All
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>

		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<Card>
				<CardHeader>
					<CardTitle>Input ({mode === 'encode' ? 'Original URL' : 'Encoded URL'})</CardTitle>
					<CardDescription>Enter your {mode === 'encode' ? 'original' : 'encoded'} URL here</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4">
					<textarea
						bind:value={inputText}
						placeholder={mode === 'encode' ? 'https://example.com/path with spaces?param=value' : 'https%3A//example.com/path%20with%20spaces%3Fparam%3Dvalue'}
						class="min-h-[300px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
					></textarea>
					
					{#if inputText}
						<div class="space-y-2 text-sm text-muted-foreground">
							<p>Characters: {inputText.length}</p>
							{#if mode === 'encode' && urlAnalysis}
								{#if urlAnalysis.isValid}
									<div class="text-green-600 dark:text-green-400">✓ Valid URL format</div>
								{:else}
									<div class="text-amber-600 dark:text-amber-400">⚠ Not a complete URL (will still encode)</div>
								{/if}
							{/if}
						</div>
					{/if}

					<div class="flex flex-wrap gap-2">
						<Button onclick={copyInput} disabled={!inputText} size="sm">
							<CopyIcon class="mr-2 h-4 w-4" />
							Copy Input
						</Button>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Output ({mode === 'encode' ? 'Encoded URL' : 'Decoded URL'})</CardTitle>
					<CardDescription>The {mode === 'encode' ? 'encoded' : 'decoded'} result</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4">
					<textarea
						bind:value={outputText}
						readonly
						placeholder="Result will appear here..."
						class="min-h-[300px] w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
					></textarea>
					
					{#if outputText}
						<div class="space-y-2 text-sm text-muted-foreground">
							<p>Characters: {outputText.length}</p>
							{#if mode === 'decode'}
								{#if validateURL(outputText)}
									<div class="text-green-600 dark:text-green-400">✓ Valid URL format</div>
								{:else}
									<div class="text-amber-600 dark:text-amber-400">⚠ Not a complete URL</div>
								{/if}
							{/if}
						</div>
					{/if}

					<div class="flex flex-wrap gap-2">
						<Button onclick={copyOutput} disabled={!outputText} size="sm">
							<CopyIcon class="mr-2 h-4 w-4" />
							Copy Output
						</Button>

						<Button variant="outline" onclick={downloadOutput} disabled={!outputText} size="sm">
							<DownloadIcon class="mr-2 h-4 w-4" />
							Download
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>

		{#if urlAnalysis && urlAnalysis.isValid && mode === 'encode'}
			<Card>
				<CardHeader>
					<CardTitle>URL Analysis</CardTitle>
					<CardDescription>Breakdown of the input URL components</CardDescription>
				</CardHeader>
				<CardContent>
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
						<div>
							<p class="font-medium text-muted-foreground">Protocol</p>
							<p class="font-mono">{urlAnalysis.protocol}</p>
						</div>
						<div>
							<p class="font-medium text-muted-foreground">Hostname</p>
							<p class="font-mono">{urlAnalysis.hostname}</p>
						</div>
						<div>
							<p class="font-medium text-muted-foreground">Port</p>
							<p class="font-mono">{urlAnalysis.port}</p>
						</div>
						<div>
							<p class="font-medium text-muted-foreground">Path</p>
							<p class="font-mono">{urlAnalysis.pathname || '/'}</p>
						</div>
						<div>
							<p class="font-medium text-muted-foreground">Query String</p>
							<p class="font-mono">{urlAnalysis.search || 'none'}</p>
						</div>
						<div>
							<p class="font-medium text-muted-foreground">Fragment</p>
							<p class="font-mono">{urlAnalysis.hash || 'none'}</p>
						</div>
					</div>
				</CardContent>
			</Card>
		{/if}

		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<Card>
				<CardHeader>
					<CardTitle>Features</CardTitle>
					<CardDescription>URL encoding/decoding capabilities</CardDescription>
				</CardHeader>
				<CardContent>
					<div class="space-y-2 text-sm">
						<p>• Real-time URL encoding and decoding</p>
						<p>• Support for both encodeURI and encodeURIComponent</p>
						<p>• URL structure analysis and validation</p>
						<p>• File upload/download support</p>
						<p>• Swap input/output with mode toggle</p>
						<p>• Copy results to clipboard</p>
						<p>• Component-level encoding control</p>
						<p>• Error handling for invalid encoding</p>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Encoding Guide</CardTitle>
					<CardDescription>Understanding the encoding modes</CardDescription>
				</CardHeader>
				<CardContent>
					<div class="space-y-3 text-sm">
						<div>
							<h4 class="font-medium">encodeURI() - Standard Mode</h4>
							<p class="text-muted-foreground">Preserves URL structure. Encodes spaces and special characters but keeps /, ?, &, =, # for URL functionality.</p>
						</div>

						<div>
							<h4 class="font-medium">encodeURIComponent() - Component Mode</h4>
							<p class="text-muted-foreground">Encodes all special characters including URL structure characters. Use for query parameters and URL parts.</p>
						</div>

						<div>
							<h4 class="font-medium">Common Use Cases</h4>
							<p class="text-muted-foreground">Standard: Full URLs | Component: Query parameters, form data, API parameters</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	</div>

	{/snippet}
</PageContainer>