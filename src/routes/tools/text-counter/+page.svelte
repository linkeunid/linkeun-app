<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import PageContainer from '$lib/components/ui/page-container.svelte';
	import PageHeader from '$lib/components/ui/page-header.svelte';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import DownloadIcon from '@lucide/svelte/icons/download';
	import FileTextIcon from '@lucide/svelte/icons/file-text';
	import RotateCcwIcon from '@lucide/svelte/icons/rotate-ccw';
	import UploadIcon from '@lucide/svelte/icons/upload';
	import { toast } from 'svelte-sonner';

	let text = $state('');
	let fileInput: HTMLInputElement;

	const stats = $derived({
		characters: text.length,
		charactersNoSpaces: text.replace(/\s/g, '').length,
		words: text.trim() === '' ? 0 : text.trim().split(/\s+/).length,
		lines: text === '' ? 0 : text.split('\n').length,
		paragraphs: text.trim() === '' ? 0 : text.split(/\n\s*\n/).filter(p => p.trim() !== '').length,
		sentences: text.trim() === '' ? 0 : text.split(/[.!?]+/).filter(s => s.trim() !== '').length
	});

	function handleFileUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		
		if (file && file.type === 'text/plain') {
			const reader = new FileReader();
			reader.onload = (e) => {
				text = e.target?.result as string || '';
			};
			reader.readAsText(file);
		}
	}

	async function copyText() {
		try {
			await navigator.clipboard.writeText(text);
			toast.success('Text copied to clipboard!');
		} catch (error) {
			toast.error('Failed to copy text to clipboard');
		}
	}

	function downloadText() {
		const blob = new Blob([text], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'text-counter-export.txt';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	function clearText() {
		text = '';
	}
</script>

<PageHeader 
	title="Text Counter" 
	subtitle="Count characters, words, lines, and more in your text" 
	icon={FileTextIcon} 
/>

<PageContainer>
	{#snippet children()}

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<div class="lg:col-span-2">
			<Card>
				<CardHeader>
					<CardTitle>Text Input</CardTitle>
					<CardDescription>Type or paste your text below to analyze it</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-2">
						<Label for="text-input">Enter your text:</Label>
						<textarea
							id="text-input"
							bind:value={text}
							placeholder="Start typing or paste your text here..."
							class="min-h-[300px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						></textarea>
					</div>

					<div class="flex flex-wrap gap-2">
						<Button variant="outline" onclick={() => fileInput.click()}>
							<UploadIcon class="mr-2 h-4 w-4" />
							Upload File
						</Button>
						<input
							bind:this={fileInput}
							type="file"
							accept=".txt"
							onchange={handleFileUpload}
							class="hidden"
						/>

						<Button variant="outline" onclick={copyText} disabled={!text}>
							<CopyIcon class="mr-2 h-4 w-4" />
							Copy Text
						</Button>

						<Button variant="outline" onclick={downloadText} disabled={!text}>
							<DownloadIcon class="mr-2 h-4 w-4" />
							Download
						</Button>

						<Button variant="outline" onclick={clearText} disabled={!text}>
							<RotateCcwIcon class="mr-2 h-4 w-4" />
							Clear
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>

		<div>
			<Card>
				<CardHeader>
					<CardTitle>Statistics</CardTitle>
					<CardDescription>Real-time text analysis</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-3">
						<div class="flex justify-between">
							<span class="text-sm font-medium">Characters:</span>
							<span class="text-sm text-muted-foreground">{stats.characters.toLocaleString()}</span>
						</div>

						<div class="flex justify-between">
							<span class="text-sm font-medium">Characters (no spaces):</span>
							<span class="text-sm text-muted-foreground">{stats.charactersNoSpaces.toLocaleString()}</span>
						</div>

						<Separator />

						<div class="flex justify-between">
							<span class="text-sm font-medium">Words:</span>
							<span class="text-sm text-muted-foreground">{stats.words.toLocaleString()}</span>
						</div>

						<div class="flex justify-between">
							<span class="text-sm font-medium">Lines:</span>
							<span class="text-sm text-muted-foreground">{stats.lines.toLocaleString()}</span>
						</div>

						<div class="flex justify-between">
							<span class="text-sm font-medium">Paragraphs:</span>
							<span class="text-sm text-muted-foreground">{stats.paragraphs.toLocaleString()}</span>
						</div>

						<div class="flex justify-between">
							<span class="text-sm font-medium">Sentences:</span>
							<span class="text-sm text-muted-foreground">{stats.sentences.toLocaleString()}</span>
						</div>
					</div>

					{#if text}
						<Separator />
						<div class="space-y-2">
							<h4 class="text-sm font-medium">Reading Time</h4>
							<div class="text-xs text-muted-foreground">
								<div>~{Math.ceil(stats.words / 200)} min (slow)</div>
								<div>~{Math.ceil(stats.words / 250)} min (average)</div>
								<div>~{Math.ceil(stats.words / 300)} min (fast)</div>
							</div>
						</div>
					{/if}
				</CardContent>
			</Card>
		</div>
	</div>

	{/snippet}
</PageContainer>