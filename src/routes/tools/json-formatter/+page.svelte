<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import { Switch } from '$lib/components/ui/switch';
	import PageContainer from '$lib/components/ui/page-container.svelte';
	import PageHeader from '$lib/components/ui/page-header.svelte';
	import BracesIcon from '@lucide/svelte/icons/braces';
	import CheckIcon from '@lucide/svelte/icons/check';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import DownloadIcon from '@lucide/svelte/icons/download';
	import FileTextIcon from '@lucide/svelte/icons/file-text';
	import IndentIncreaseIcon from '@lucide/svelte/icons/indent-increase';
	import MinusIcon from '@lucide/svelte/icons/minus';
	import RefreshCwIcon from '@lucide/svelte/icons/refresh-cw';
	import UploadIcon from '@lucide/svelte/icons/upload';
	import XIcon from '@lucide/svelte/icons/x';
	import { toast } from 'svelte-sonner';

	let inputJson = $state('');
	let outputJson = $state('');
	let indentSize = $state(2);
	let sortKeys = $state(false);
	let minify = $state(false);
	let fileInput: HTMLInputElement;
	let validationResult = $state<{ isValid: boolean; error?: string; stats?: any }>({ isValid: true });

	// JSON validation and formatting
	$effect(() => {
		if (!inputJson.trim()) {
			outputJson = '';
			validationResult = { isValid: true };
			return;
		}

		try {
			// Parse JSON to validate
			const parsed = JSON.parse(inputJson);
			
			// Calculate statistics
			const stats = analyzeJson(parsed);
			validationResult = { isValid: true, stats };

			// Format output based on settings
			if (minify) {
				outputJson = JSON.stringify(parsed);
			} else {
				if (sortKeys) {
					outputJson = JSON.stringify(sortJsonKeys(parsed), null, indentSize);
				} else {
					outputJson = JSON.stringify(parsed, null, indentSize);
				}
			}
		} catch (error) {
			validationResult = { 
				isValid: false, 
				error: error instanceof Error ? error.message : 'Invalid JSON' 
			};
			outputJson = '';
		}
	});

	function analyzeJson(obj: any): any {
		const stats = {
			type: Array.isArray(obj) ? 'array' : typeof obj,
			size: 0,
			depth: 0,
			keys: 0,
			values: 0
		};

		function analyze(item: any, depth = 0): void {
			stats.depth = Math.max(stats.depth, depth);
			
			if (typeof item === 'object' && item !== null) {
				if (Array.isArray(item)) {
					stats.values += item.length;
					item.forEach(element => analyze(element, depth + 1));
				} else {
					const keys = Object.keys(item);
					stats.keys += keys.length;
					keys.forEach(key => analyze(item[key], depth + 1));
				}
			} else {
				stats.values++;
			}
		}

		analyze(obj);
		stats.size = JSON.stringify(obj).length;
		return stats;
	}

	function sortJsonKeys(obj: any): any {
		if (obj === null || typeof obj !== 'object') {
			return obj;
		}

		if (Array.isArray(obj)) {
			return obj.map(sortJsonKeys);
		}

		const sorted: any = {};
		Object.keys(obj).sort().forEach(key => {
			sorted[key] = sortJsonKeys(obj[key]);
		});
		return sorted;
	}

	function formatJson() {
		// Force re-processing by updating a dependency
		indentSize = indentSize;
	}

	function formatJsonPretty() {
		if (inputJson.trim()) {
			minify = false;
			formatJson();
			toast.success('JSON formatted!');
		}
	}

	function compactJson() {
		if (inputJson.trim()) {
			minify = true;
			formatJson();
			toast.success('JSON compacted!');
		}
	}

	function clearAll() {
		inputJson = '';
		outputJson = '';
		validationResult = { isValid: true };
	}

	async function copyOutput() {
		if (outputJson) {
			try {
				await navigator.clipboard.writeText(outputJson);
				toast.success('Formatted JSON copied to clipboard!');
			} catch (error) {
				toast.error('Failed to copy to clipboard');
			}
		}
	}

	function downloadOutput() {
		if (!outputJson) return;

		const blob = new Blob([outputJson], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = minify ? 'minified.json' : 'formatted.json';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		toast.success('JSON file downloaded successfully!');
	}

	function handleFileUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				inputJson = e.target?.result as string || '';
			};
			reader.readAsText(file);
		}
	}

	// Sample JSON templates
	const templates = {
		object: `{
  "name": "John Doe",
  "age": 30,
  "city": "New York",
  "isEmployed": true,
  "skills": ["JavaScript", "Python", "SQL"]
}`,
		array: `[
  {
    "id": 1,
    "title": "First Item",
    "completed": false
  },
  {
    "id": 2,
    "title": "Second Item",
    "completed": true
  }
]`,
		nested: `{
  "user": {
    "profile": {
      "personal": {
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      "preferences": {
        "theme": "dark",
        "notifications": true
      }
    }
  },
  "data": [1, 2, 3, 4, 5]
}`
	};

	function loadTemplate(template: keyof typeof templates) {
		inputJson = templates[template];
	}

	function handleTabKey(event: KeyboardEvent) {
		if (event.key === 'Tab') {
			event.preventDefault();
			
			const textarea = event.target as HTMLTextAreaElement;
			const start = textarea.selectionStart;
			const end = textarea.selectionEnd;
			
			// Insert tab character at cursor position
			const value = textarea.value;
			textarea.value = value.substring(0, start) + '\t' + value.substring(end);
			
			// Update the bound variable
			if (textarea.placeholder.includes('Paste your JSON')) {
				inputJson = textarea.value;
			}
			
			// Move cursor after the inserted tab
			textarea.selectionStart = textarea.selectionEnd = start + 1;
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		// Handle Ctrl+I for formatting
		if (event.ctrlKey && event.key === 'i' && !event.shiftKey) {
			event.preventDefault();
			formatJsonPretty();
		}
		
		// Handle Ctrl+Shift+I for compacting
		if (event.ctrlKey && event.shiftKey && event.key === 'I') {
			event.preventDefault();
			compactJson();
		}
	}
</script>

<!-- Global keyboard shortcuts listener -->
<svelte:window onkeydown={handleKeydown} />

<PageHeader 
	title="JSON Formatter/Validator" 
	subtitle="Format, validate, and analyze JSON data with advanced options" 
	icon={BracesIcon} 
/>

<PageContainer>
	{#snippet children()}

	<div class="space-y-6">
		<Card>
			<CardHeader>
				<CardTitle>Formatting Options</CardTitle>
				<CardDescription>Configure JSON formatting and validation settings</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="indent">Indent Size</Label>
						<Input
							id="indent"
							type="number"
							bind:value={indentSize}
							min="0"
							max="8"
							step="1"
							class="w-full"
						/>
					</div>
					
					<div class="flex flex-col space-y-3">
						<div class="flex items-center space-x-2">
							<Switch id="sort-keys" bind:checked={sortKeys} />
							<Label for="sort-keys">Sort Keys</Label>
						</div>
						
						<div class="flex items-center space-x-2">
							<Switch id="minify" bind:checked={minify} />
							<Label for="minify">Minify Output</Label>
						</div>
					</div>
				</div>

				<Separator />

				<div class="space-y-3">
					<Label>Quick Actions</Label>
					<div class="flex flex-wrap gap-2">
						<Button variant="outline" onclick={() => fileInput.click()}>
							<UploadIcon class="mr-2 h-4 w-4" />
							Upload JSON
						</Button>
						<input
							bind:this={fileInput}
							type="file"
							accept=".json,.txt"
							onchange={handleFileUpload}
							class="hidden"
						/>
						
						<Button variant="outline" onclick={formatJsonPretty} disabled={!inputJson.trim()}>
							<IndentIncreaseIcon class="mr-2 h-4 w-4" />
							Format (Ctrl+I)
						</Button>
						
						<Button variant="outline" onclick={compactJson} disabled={!inputJson.trim()}>
							<MinusIcon class="mr-2 h-4 w-4" />
							Compact (Ctrl+Shift+I)
						</Button>
						
						<Button variant="outline" onclick={formatJson}>
							<RefreshCwIcon class="mr-2 h-4 w-4" />
							Re-format
						</Button>
						
						<Button variant="outline" onclick={clearAll}>
							Clear All
						</Button>
					</div>
				</div>

				<Separator />

				<div class="space-y-3">
					<Label>Sample Templates</Label>
					<div class="flex flex-wrap gap-2">
						<Button variant="outline" size="sm" onclick={() => loadTemplate('object')}>
							Simple Object
						</Button>
						<Button variant="outline" size="sm" onclick={() => loadTemplate('array')}>
							Array of Objects
						</Button>
						<Button variant="outline" size="sm" onclick={() => loadTemplate('nested')}>
							Nested Structure
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>

		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<Card>
				<CardHeader>
					<CardTitle>Input JSON</CardTitle>
					<CardDescription>Paste or type your JSON data here</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4">
					<textarea
						bind:value={inputJson}
						placeholder="Paste your JSON here..."
						onkeydown={handleTabKey}
						class="min-h-[400px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
					></textarea>
					
					{#if inputJson}
						<div class="text-sm text-muted-foreground">
							<p>Characters: {inputJson.length}</p>
							<p>Lines: {inputJson.split('\n').length}</p>
						</div>
					{/if}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Formatted Output</CardTitle>
					<CardDescription>The validated and formatted JSON result</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4">
					<textarea
						value={outputJson}
						readonly
						placeholder="Formatted JSON will appear here..."
						class="min-h-[400px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
					></textarea>
					
					{#if outputJson}
						<div class="text-sm text-muted-foreground">
							<p>Characters: {outputJson.length}</p>
							<p>Lines: {outputJson.split('\n').length}</p>
						</div>
					{/if}

					<div class="flex flex-wrap gap-2">
						<Button onclick={copyOutput} disabled={!outputJson}>
							<CopyIcon class="mr-2 h-4 w-4" />
							Copy Output
						</Button>

						<Button variant="outline" onclick={downloadOutput} disabled={!outputJson}>
							<DownloadIcon class="mr-2 h-4 w-4" />
							Download JSON
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>

		<div class="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Validation Status</CardTitle>
					<CardDescription>JSON validation results</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="flex items-center gap-2">
						{#if validationResult.isValid}
							<CheckIcon class="h-5 w-5 text-green-500" />
							<span class="text-green-700 font-medium">Valid JSON</span>
						{:else}
							<XIcon class="h-5 w-5 text-red-500" />
							<span class="text-red-700 font-medium">Invalid JSON</span>
						{/if}
					</div>

					{#if validationResult.error}
						<div class="p-3 bg-red-50 border border-red-200 rounded-md">
							<p class="text-sm text-red-800 font-mono">{validationResult.error}</p>
						</div>
					{/if}

					{#if validationResult.stats}
						<div class="space-y-2">
							<h4 class="text-sm font-medium">Statistics</h4>
							<div class="space-y-1 text-sm">
								<div class="flex justify-between">
									<span>Type:</span>
									<span class="font-mono">{validationResult.stats.type}</span>
								</div>
								<div class="flex justify-between">
									<span>Size:</span>
									<span class="font-mono">{validationResult.stats.size} chars</span>
								</div>
								<div class="flex justify-between">
									<span>Depth:</span>
									<span class="font-mono">{validationResult.stats.depth}</span>
								</div>
								<div class="flex justify-between">
									<span>Keys:</span>
									<span class="font-mono">{validationResult.stats.keys}</span>
								</div>
								<div class="flex justify-between">
									<span>Values:</span>
									<span class="font-mono">{validationResult.stats.values}</span>
								</div>
							</div>
						</div>
					{/if}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Features</CardTitle>
					<CardDescription>JSON formatting capabilities</CardDescription>
				</CardHeader>
				<CardContent>
					<div class="space-y-2 text-sm">
						<p>• Real-time validation and formatting</p>
						<p>• Customizable indentation (0-8 spaces)</p>
						<p>• Sort object keys alphabetically</p>
						<p>• Minify JSON for production</p>
						<p>• Upload/download JSON files</p>
						<p>• JSON structure analysis</p>
						<p>• Error detection and reporting</p>
						<p>• Sample templates for quick start</p>
						<p>• Keyboard shortcuts (Ctrl+I/Ctrl+Shift+I)</p>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Common Issues</CardTitle>
					<CardDescription>JSON validation help</CardDescription>
				</CardHeader>
				<CardContent>
					<div class="space-y-3 text-sm">
						<div>
							<h4 class="font-medium">Missing Quotes</h4>
							<p class="text-muted-foreground">Property names must be in double quotes</p>
							<code class="text-xs bg-muted p-1 rounded">&#123;"name": "value"&#125;</code>
						</div>

						<div>
							<h4 class="font-medium">Trailing Commas</h4>
							<p class="text-muted-foreground">Remove commas after the last item</p>
							<code class="text-xs bg-muted p-1 rounded">[1, 2, 3] ✓</code>
						</div>

						<div>
							<h4 class="font-medium">Single Quotes</h4>
							<p class="text-muted-foreground">Use double quotes for strings</p>
							<code class="text-xs bg-muted p-1 rounded">"text" not 'text'</code>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Keyboard Shortcuts</CardTitle>
					<CardDescription>Quick formatting options</CardDescription>
				</CardHeader>
				<CardContent>
					<div class="space-y-3 text-sm">
						<div>
							<h4 class="font-medium">Ctrl + I</h4>
							<p class="text-muted-foreground">Format JSON with proper indentation</p>
						</div>

						<div>
							<h4 class="font-medium">Ctrl + Shift + I</h4>
							<p class="text-muted-foreground">Compact JSON (remove whitespace)</p>
						</div>

						<div>
							<h4 class="font-medium">Tab</h4>
							<p class="text-muted-foreground">Insert tab character in input area</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	</div>

	{/snippet}
</PageContainer>