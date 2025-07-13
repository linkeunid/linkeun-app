<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import { Switch } from '$lib/components/ui/switch';
	import { Textarea } from '$lib/components/ui/textarea';
	import PageContainer from '$lib/components/ui/page-container.svelte';
	import PageHeader from '$lib/components/ui/page-header.svelte';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import DiffIcon from '@lucide/svelte/icons/diff';
	import DownloadIcon from '@lucide/svelte/icons/download';
	import RefreshCwIcon from '@lucide/svelte/icons/refresh-cw';
	import UploadIcon from '@lucide/svelte/icons/upload';
	import { toast } from 'svelte-sonner';

	let originalText = $state('');
	let modifiedText = $state('');
	let ignoreWhitespace = $state(false);
	let ignoreCase = $state(false);
	let showLineNumbers = $state(true);
	let fileInputOriginal: HTMLInputElement;
	let fileInputModified: HTMLInputElement;

	// Diff result state
	let diffResult = $state<Array<{
		type: 'equal' | 'delete' | 'insert' | 'replace';
		originalLine?: string;
		modifiedLine?: string;
		originalLineNum?: number;
		modifiedLineNum?: number;
	}>>([]);

	let diffStats = $state({
		additions: 0,
		deletions: 0,
		modifications: 0,
		unchanged: 0
	});

	// Simple diff algorithm implementation
	function computeDiff() {
		if (!originalText.trim() && !modifiedText.trim()) {
			diffResult = [];
			resetStats();
			return;
		}

		let original = originalText;
		let modified = modifiedText;

		// Apply preprocessing based on options
		if (ignoreCase) {
			original = original.toLowerCase();
			modified = modified.toLowerCase();
		}

		if (ignoreWhitespace) {
			original = original.replace(/\s+/g, ' ').trim();
			modified = modified.replace(/\s+/g, ' ').trim();
		}

		const originalLines = original.split('\n');
		const modifiedLines = modified.split('\n');

		// Simple line-by-line diff
		const result: typeof diffResult = [];
		const maxLines = Math.max(originalLines.length, modifiedLines.length);
		
		let stats = { additions: 0, deletions: 0, modifications: 0, unchanged: 0 };

		for (let i = 0; i < maxLines; i++) {
			const origLine = originalLines[i];
			const modLine = modifiedLines[i];

			if (origLine !== undefined && modLine !== undefined) {
				if (origLine === modLine) {
					result.push({
						type: 'equal',
						originalLine: originalText.split('\n')[i],
						modifiedLine: modifiedText.split('\n')[i],
						originalLineNum: i + 1,
						modifiedLineNum: i + 1
					});
					stats.unchanged++;
				} else {
					result.push({
						type: 'replace',
						originalLine: originalText.split('\n')[i],
						modifiedLine: modifiedText.split('\n')[i],
						originalLineNum: i + 1,
						modifiedLineNum: i + 1
					});
					stats.modifications++;
				}
			} else if (origLine !== undefined && modLine === undefined) {
				result.push({
					type: 'delete',
					originalLine: originalText.split('\n')[i],
					originalLineNum: i + 1
				});
				stats.deletions++;
			} else if (origLine === undefined && modLine !== undefined) {
				result.push({
					type: 'insert',
					modifiedLine: modifiedText.split('\n')[i],
					modifiedLineNum: i + 1
				});
				stats.additions++;
			}
		}

		diffResult = result;
		diffStats = stats;
	}

	function resetStats() {
		diffStats = { additions: 0, deletions: 0, modifications: 0, unchanged: 0 };
	}

	// Reactive diff computation
	$effect(() => {
		computeDiff();
	});

	function clearAll() {
		originalText = '';
		modifiedText = '';
		diffResult = [];
		resetStats();
	}

	function swapTexts() {
		const temp = originalText;
		originalText = modifiedText;
		modifiedText = temp;
	}

	async function copyDiff() {
		if (diffResult.length === 0) return;

		let diffText = '';
		diffResult.forEach(line => {
			switch (line.type) {
				case 'delete':
					diffText += `- ${line.originalLine}\n`;
					break;
				case 'insert':
					diffText += `+ ${line.modifiedLine}\n`;
					break;
				case 'replace':
					diffText += `- ${line.originalLine}\n`;
					diffText += `+ ${line.modifiedLine}\n`;
					break;
				case 'equal':
					diffText += `  ${line.originalLine}\n`;
					break;
			}
		});

		try {
			await navigator.clipboard.writeText(diffText);
			toast.success('Diff copied to clipboard!');
		} catch (error) {
			toast.error('Failed to copy to clipboard');
		}
	}

	function downloadDiff() {
		if (diffResult.length === 0) return;

		let diffText = '';
		diffResult.forEach(line => {
			switch (line.type) {
				case 'delete':
					diffText += `- ${line.originalLine}\n`;
					break;
				case 'insert':
					diffText += `+ ${line.modifiedLine}\n`;
					break;
				case 'replace':
					diffText += `- ${line.originalLine}\n`;
					diffText += `+ ${line.modifiedLine}\n`;
					break;
				case 'equal':
					diffText += `  ${line.originalLine}\n`;
					break;
			}
		});

		const blob = new Blob([diffText], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'text-diff.txt';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		toast.success('Diff file downloaded successfully!');
	}

	function handleFileUpload(event: Event, isOriginal: boolean) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				const content = e.target?.result as string || '';
				if (isOriginal) {
					originalText = content;
				} else {
					modifiedText = content;
				}
			};
			reader.readAsText(file);
		}
	}

	function getLineClass(type: string): string {
		switch (type) {
			case 'delete': return 'bg-red-50 dark:bg-red-950 border-l-4 border-red-400 text-red-800 dark:text-red-200';
			case 'insert': return 'bg-green-50 dark:bg-green-950 border-l-4 border-green-400 text-green-800 dark:text-green-200';
			case 'replace': return 'bg-yellow-50 dark:bg-yellow-950 border-l-4 border-yellow-400 text-yellow-800 dark:text-yellow-200';
			default: return 'bg-gray-50 dark:bg-gray-800';
		}
	}

	function getLinePrefix(type: string): string {
		switch (type) {
			case 'delete': return '- ';
			case 'insert': return '+ ';
			case 'replace': return '~ ';
			default: return '  ';
		}
	}
</script>

<PageHeader 
	title="Text Diff Analyzer" 
	subtitle="Compare and analyze differences between two text documents" 
	icon={DiffIcon} 
/>

<PageContainer>
	{#snippet children()}

	<div class="space-y-6">
		<Card>
			<CardHeader>
				<CardTitle>Comparison Options</CardTitle>
				<CardDescription>Configure how texts should be compared</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
					<div class="flex items-center space-x-2">
						<Switch id="ignore-whitespace" bind:checked={ignoreWhitespace} />
						<Label for="ignore-whitespace">Ignore Whitespace</Label>
					</div>
					
					<div class="flex items-center space-x-2">
						<Switch id="ignore-case" bind:checked={ignoreCase} />
						<Label for="ignore-case">Ignore Case</Label>
					</div>

					<div class="flex items-center space-x-2">
						<Switch id="show-line-numbers" bind:checked={showLineNumbers} />
						<Label for="show-line-numbers">Show Line Numbers</Label>
					</div>
				</div>

				<Separator />

				<div class="space-y-3">
					<Label>Quick Actions</Label>
					<div class="flex flex-wrap gap-2">
						<Button variant="outline" onclick={() => fileInputOriginal.click()}>
							<UploadIcon class="mr-2 h-4 w-4" />
							Upload Original
						</Button>
						<input
							bind:this={fileInputOriginal}
							type="file"
							accept=".txt,.md,.json,.js,.ts,.css,.html"
							onchange={(e) => handleFileUpload(e, true)}
							class="hidden"
						/>

						<Button variant="outline" onclick={() => fileInputModified.click()}>
							<UploadIcon class="mr-2 h-4 w-4" />
							Upload Modified
						</Button>
						<input
							bind:this={fileInputModified}
							type="file"
							accept=".txt,.md,.json,.js,.ts,.css,.html"
							onchange={(e) => handleFileUpload(e, false)}
							class="hidden"
						/>
						
						<Button variant="outline" onclick={swapTexts} disabled={!originalText && !modifiedText}>
							<RefreshCwIcon class="mr-2 h-4 w-4" />
							Swap Texts
						</Button>
						
						<Button variant="outline" onclick={clearAll} disabled={!originalText && !modifiedText}>
							Clear All
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>

		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<Card>
				<CardHeader>
					<CardTitle>Original Text</CardTitle>
					<CardDescription>The original version of your text</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4">
					<Textarea
						bind:value={originalText}
						placeholder="Paste your original text here..."
						class="min-h-[400px] font-mono"
					/>
					
					{#if originalText}
						<div class="text-sm text-muted-foreground">
							<p>Characters: {originalText.length}</p>
							<p>Lines: {originalText.split('\n').length}</p>
						</div>
					{/if}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Modified Text</CardTitle>
					<CardDescription>The modified version of your text</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4">
					<Textarea
						bind:value={modifiedText}
						placeholder="Paste your modified text here..."
						class="min-h-[400px] font-mono"
					/>
					
					{#if modifiedText}
						<div class="text-sm text-muted-foreground">
							<p>Characters: {modifiedText.length}</p>
							<p>Lines: {modifiedText.split('\n').length}</p>
						</div>
					{/if}
				</CardContent>
			</Card>
		</div>

		{#if diffResult.length > 0}
			<Card>
				<CardHeader>
					<CardTitle>Diff Results</CardTitle>
					<CardDescription>Visual comparison showing additions, deletions, and modifications</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
						<div class="flex items-center gap-2">
							<div class="w-3 h-3 bg-green-400 rounded"></div>
							<span>Additions: {diffStats.additions}</span>
						</div>
						<div class="flex items-center gap-2">
							<div class="w-3 h-3 bg-red-400 rounded"></div>
							<span>Deletions: {diffStats.deletions}</span>
						</div>
						<div class="flex items-center gap-2">
							<div class="w-3 h-3 bg-yellow-400 rounded"></div>
							<span>Modifications: {diffStats.modifications}</span>
						</div>
						<div class="flex items-center gap-2">
							<div class="w-3 h-3 bg-gray-400 rounded"></div>
							<span>Unchanged: {diffStats.unchanged}</span>
						</div>
					</div>

					<Separator />

					<div class="space-y-1 max-h-[600px] overflow-y-auto font-mono text-sm">
						{#each diffResult as line, index}
							<div class="flex {getLineClass(line.type)} px-3 py-1 rounded">
								{#if showLineNumbers}
									<span class="w-12 text-gray-500 dark:text-gray-400 text-right mr-3">
										{line.originalLineNum || line.modifiedLineNum || ''}
									</span>
								{/if}
								<span class="font-medium mr-2">{getLinePrefix(line.type)}</span>
								<span class="flex-1">
									{#if line.type === 'replace'}
										<div class="space-y-1">
											<div class="text-red-700 dark:text-red-300">- {line.originalLine}</div>
											<div class="text-green-700 dark:text-green-300">+ {line.modifiedLine}</div>
										</div>
									{:else}
										{line.originalLine || line.modifiedLine || ''}
									{/if}
								</span>
							</div>
						{/each}
					</div>

					<div class="flex flex-wrap gap-2">
						<Button onclick={copyDiff} disabled={diffResult.length === 0}>
							<CopyIcon class="mr-2 h-4 w-4" />
							Copy Diff
						</Button>

						<Button variant="outline" onclick={downloadDiff} disabled={diffResult.length === 0}>
							<DownloadIcon class="mr-2 h-4 w-4" />
							Download Diff
						</Button>
					</div>
				</CardContent>
			</Card>
		{/if}

		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<Card>
				<CardHeader>
					<CardTitle>Features</CardTitle>
					<CardDescription>Text diff analysis capabilities</CardDescription>
				</CardHeader>
				<CardContent>
					<div class="space-y-2 text-sm">
						<p>• Line-by-line text comparison</p>
						<p>• Visual highlighting of changes</p>
						<p>• Ignore whitespace and case options</p>
						<p>• File upload support</p>
						<p>• Export diff results</p>
						<p>• Real-time comparison</p>
						<p>• Statistics summary</p>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Legend</CardTitle>
					<CardDescription>Understanding the diff output</CardDescription>
				</CardHeader>
				<CardContent>
					<div class="space-y-3 text-sm">
						<div class="flex items-center gap-2">
							<span class="px-2 py-1 bg-green-50 dark:bg-green-950 border-l-4 border-green-400 text-green-800 dark:text-green-200 font-mono">+ Added line</span>
						</div>
						<div class="flex items-center gap-2">
							<span class="px-2 py-1 bg-red-50 dark:bg-red-950 border-l-4 border-red-400 text-red-800 dark:text-red-200 font-mono">- Deleted line</span>
						</div>
						<div class="flex items-center gap-2">
							<span class="px-2 py-1 bg-yellow-50 dark:bg-yellow-950 border-l-4 border-yellow-400 text-yellow-800 dark:text-yellow-200 font-mono">~ Modified line</span>
						</div>
						<div class="flex items-center gap-2">
							<span class="px-2 py-1 bg-gray-50 dark:bg-gray-800 font-mono">  Unchanged line</span>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	</div>

	{/snippet}
</PageContainer>