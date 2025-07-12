<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Label } from '$lib/components/ui/label';
	import PageContainer from '$lib/components/ui/page-container.svelte';
	import PageHeader from '$lib/components/ui/page-header.svelte';
	import * as RadioGroup from '$lib/components/ui/radio-group/index.js';
	import { Separator } from '$lib/components/ui/separator';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Textarea } from '$lib/components/ui/textarea';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import DownloadIcon from '@lucide/svelte/icons/download';
	import FileTextIcon from '@lucide/svelte/icons/file-text';
	import RotateCcwIcon from '@lucide/svelte/icons/rotate-ccw';
	import UploadIcon from '@lucide/svelte/icons/upload';
	import { toast } from 'svelte-sonner';

	let text = $state('');
	let fileInput: HTMLInputElement;
	let showAdvancedStats = $state(false);
	let countMode = $state('all');
	let caseSensitive = $state(false);
	let includeNumbers = $state(true);
	let includePunctuation = $state(true);

	const stats = $derived(() => {
		// Ensure all reactive dependencies are accessed
		const currentText = text;
		const currentCountMode = countMode;
		const currentCaseSensitive = caseSensitive;
		const currentIncludeNumbers = includeNumbers;
		const currentIncludePunctuation = includePunctuation;
		
		let processedText = currentText;

		// Apply filters based on settings
		if (!currentIncludeNumbers) {
			processedText = processedText.replace(/\d/g, '');
		}

		if (!currentIncludePunctuation) {
			processedText = processedText.replace(/[^\w\s]/g, '');
		}

		// Apply count mode filtering for character counting
		let textToAnalyze = processedText;
		let charactersToCount = processedText;
		
		if (currentCountMode === 'letters') {
			charactersToCount = processedText.replace(/[^a-zA-Z]/g, '');
		} else if (currentCountMode === 'words') {
			charactersToCount = processedText.replace(/[^\w]/g, '');
		}

		// Basic stats - use appropriate text for different counts
		const characters = currentCountMode === 'all' ? textToAnalyze.length : charactersToCount.length;
		const charactersNoSpaces = currentCountMode === 'all' ? textToAnalyze.replace(/\s/g, '').length : charactersToCount.length;
		const words = textToAnalyze.trim() === '' ? 0 : textToAnalyze.trim().split(/\s+/).length;
		const lines = textToAnalyze === '' ? 0 : textToAnalyze.split('\n').length;
		const paragraphs =
			textToAnalyze.trim() === '' ? 0 : textToAnalyze.split(/\n\s*\n/).filter((p) => p.trim() !== '').length;
		const sentences =
			textToAnalyze.trim() === '' ? 0 : textToAnalyze.split(/[.!?]+/).filter((s) => s.trim() !== '').length;

		// Advanced stats - use processed text
		const wordsForAnalysis = currentCaseSensitive ? textToAnalyze : textToAnalyze.toLowerCase();
		const uniqueWords =
			textToAnalyze.trim() === ''
				? 0
				: new Set(
						wordsForAnalysis
							.split(/\s+/)
							.filter((w) => w.length > 0)
							.map(w => w.replace(/[^\w]/g, ''))
							.filter(w => w.length > 0)
					).size;
		const averageWordsPerSentence = sentences > 0 ? Math.round((words / sentences) * 10) / 10 : 0;
		const averageCharactersPerWord =
			words > 0 ? Math.round((charactersNoSpaces / words) * 10) / 10 : 0;
		const readingTimeMinutes = Math.ceil(words / 250);

		// Character frequency - use appropriate text based on count mode
		const charFrequency: Record<string, number> = {};
		const textForCharFreq = currentCaseSensitive ? charactersToCount : charactersToCount.toLowerCase();
		
		for (const char of textForCharFreq) {
			charFrequency[char] = (charFrequency[char] || 0) + 1;
		}

		const topCharacters = Object.entries(charFrequency)
			.sort(([, a], [, b]) => b - a)
			.slice(0, 5)
			.map(([char, count]) => ({
				char,
				count,
				percentage: charactersToCount.length > 0 ? ((count / charactersToCount.length) * 100).toFixed(1) : '0'
			}));

		// Word frequency - use processed text and respect settings
		const wordFrequency: Record<string, number> = {};
		const textForWordFreq = currentCaseSensitive ? textToAnalyze : textToAnalyze.toLowerCase();
		const wordsArray = textForWordFreq
			.split(/\s+/)
			.filter((w) => w.length > 0);
		
		for (const word of wordsArray) {
			let cleanWord = word;
			if (!currentIncludePunctuation) {
				cleanWord = word.replace(/[^\w]/g, '');
			}
			if (!currentIncludeNumbers) {
				cleanWord = cleanWord.replace(/\d/g, '');
			}
			
			if (cleanWord.length > 0) {
				wordFrequency[cleanWord] = (wordFrequency[cleanWord] || 0) + 1;
			}
		}

		const topWords = Object.entries(wordFrequency)
			.sort(([, a], [, b]) => b - a)
			.slice(0, 5)
			.map(([word, count]) => ({ 
				word, 
				count, 
				percentage: words > 0 ? ((count / words) * 100).toFixed(1) : '0'
			}));

		return {
			characters,
			charactersNoSpaces,
			words,
			lines,
			paragraphs,
			sentences,
			uniqueWords,
			averageWordsPerSentence,
			averageCharactersPerWord,
			readingTimeMinutes,
			topCharacters,
			topWords
		};
	});

	function handleFileUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (file && file.type === 'text/plain') {
			const reader = new FileReader();
			reader.onload = (e) => {
				text = (e.target?.result as string) || '';
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
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
			<div class="space-y-6 lg:col-span-2">
				<Card>
					<CardHeader>
						<CardTitle>Text Input</CardTitle>
						<CardDescription>Type or paste your text below to analyze it</CardDescription>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="space-y-2">
							<Label for="text-input">Enter your text:</Label>
							<Textarea
								id="text-input"
								bind:value={text}
								placeholder="Start typing or paste your text here..."
								rows={12}
								class="resize-none"
							/>
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

				<Card>
					<CardHeader>
						<CardTitle>Analysis Options</CardTitle>
						<CardDescription>Customize how text is analyzed</CardDescription>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="space-y-4">
							<div class="space-y-3">
								<Label>Count Mode:</Label>
								<RadioGroup.Root bind:value={countMode} class="flex flex-col space-y-2">
									<div class="flex items-center space-x-2">
										<RadioGroup.Item value="all" id="r1" />
										<Label for="r1">Count everything</Label>
									</div>
									<div class="flex items-center space-x-2">
										<RadioGroup.Item value="letters" id="r2" />
										<Label for="r2">Letters only</Label>
									</div>
									<div class="flex items-center space-x-2">
										<RadioGroup.Item value="words" id="r3" />
										<Label for="r3">Words only</Label>
									</div>
								</RadioGroup.Root>
							</div>

							<Separator />

							<div class="space-y-3">
								<Label>Options:</Label>
								<div class="space-y-2">
									<div class="flex items-center space-x-2">
										<Checkbox bind:checked={caseSensitive} id="case-sensitive" />
										<Label for="case-sensitive">Case sensitive analysis</Label>
									</div>
									<div class="flex items-center space-x-2">
										<Checkbox bind:checked={includeNumbers} id="include-numbers" />
										<Label for="include-numbers">Include numbers</Label>
									</div>
									<div class="flex items-center space-x-2">
										<Checkbox bind:checked={includePunctuation} id="include-punctuation" />
										<Label for="include-punctuation">Include punctuation</Label>
									</div>
									<div class="flex items-center space-x-2">
										<Checkbox bind:checked={showAdvancedStats} id="show-advanced" />
										<Label for="show-advanced">Show advanced statistics</Label>
									</div>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<div class="space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>Basic Statistics</CardTitle>
						<CardDescription>Real-time text analysis</CardDescription>
					</CardHeader>
					<CardContent>
						<Table.Root>
							<Table.Body>
								<Table.Row>
									<Table.Cell class="font-medium">Characters</Table.Cell>
									<Table.Cell class="text-right">{stats().characters.toLocaleString()}</Table.Cell>
								</Table.Row>
								<Table.Row>
									<Table.Cell class="font-medium">Characters (no spaces)</Table.Cell>
									<Table.Cell class="text-right"
										>{stats().charactersNoSpaces.toLocaleString()}</Table.Cell
									>
								</Table.Row>
								<Table.Row>
									<Table.Cell class="font-medium">Words</Table.Cell>
									<Table.Cell class="text-right">{stats().words.toLocaleString()}</Table.Cell>
								</Table.Row>
								<Table.Row>
									<Table.Cell class="font-medium">Lines</Table.Cell>
									<Table.Cell class="text-right">{stats().lines.toLocaleString()}</Table.Cell>
								</Table.Row>
								<Table.Row>
									<Table.Cell class="font-medium">Paragraphs</Table.Cell>
									<Table.Cell class="text-right">{stats().paragraphs.toLocaleString()}</Table.Cell>
								</Table.Row>
								<Table.Row>
									<Table.Cell class="font-medium">Sentences</Table.Cell>
									<Table.Cell class="text-right">{stats().sentences.toLocaleString()}</Table.Cell>
								</Table.Row>
							</Table.Body>
						</Table.Root>
					</CardContent>
				</Card>

				{#if showAdvancedStats && text}
					<Card>
						<CardHeader>
							<CardTitle>Advanced Statistics</CardTitle>
							<CardDescription>Detailed text analysis</CardDescription>
						</CardHeader>
						<CardContent>
							<Table.Root>
								<Table.Body>
									<Table.Row>
										<Table.Cell class="font-medium">Unique Words</Table.Cell>
										<Table.Cell class="text-right"
											>{stats().uniqueWords.toLocaleString()}</Table.Cell
										>
									</Table.Row>
									<Table.Row>
										<Table.Cell class="font-medium">Avg Words per Sentence</Table.Cell>
										<Table.Cell class="text-right">{stats().averageWordsPerSentence}</Table.Cell>
									</Table.Row>
									<Table.Row>
										<Table.Cell class="font-medium">Avg Characters per Word</Table.Cell>
										<Table.Cell class="text-right">{stats().averageCharactersPerWord}</Table.Cell>
									</Table.Row>
									<Table.Row>
										<Table.Cell class="font-medium">Reading Time</Table.Cell>
										<Table.Cell class="text-right">{stats().readingTimeMinutes} min</Table.Cell>
									</Table.Row>
								</Table.Body>
							</Table.Root>
						</CardContent>
					</Card>

					{#if stats().topCharacters.length > 0}
						<Card>
							<CardHeader>
								<CardTitle>Character Frequency</CardTitle>
								<CardDescription>Most common characters</CardDescription>
							</CardHeader>
							<CardContent>
								<Table.Root>
									<Table.Header>
										<Table.Row>
											<Table.Head>Character</Table.Head>
											<Table.Head class="text-right">Count</Table.Head>
											<Table.Head class="text-right">%</Table.Head>
										</Table.Row>
									</Table.Header>
									<Table.Body>
										{#each stats().topCharacters as { char, count, percentage }}
											<Table.Row>
												<Table.Cell class="font-mono font-medium">{char.toUpperCase()}</Table.Cell>
												<Table.Cell class="text-right">{count}</Table.Cell>
												<Table.Cell class="text-right">{percentage}%</Table.Cell>
											</Table.Row>
										{/each}
									</Table.Body>
								</Table.Root>
							</CardContent>
						</Card>
					{/if}

					{#if stats().topWords.length > 0}
						<Card>
							<CardHeader>
								<CardTitle>Word Frequency</CardTitle>
								<CardDescription>Most common words</CardDescription>
							</CardHeader>
							<CardContent>
								<Table.Root>
									<Table.Header>
										<Table.Row>
											<Table.Head>Word</Table.Head>
											<Table.Head class="text-right">Count</Table.Head>
											<Table.Head class="text-right">%</Table.Head>
										</Table.Row>
									</Table.Header>
									<Table.Body>
										{#each stats().topWords as { word, count, percentage }}
											<Table.Row>
												<Table.Cell class="font-medium">{word}</Table.Cell>
												<Table.Cell class="text-right">{count}</Table.Cell>
												<Table.Cell class="text-right">{percentage}%</Table.Cell>
											</Table.Row>
										{/each}
									</Table.Body>
								</Table.Root>
							</CardContent>
						</Card>
					{/if}
				{/if}

				{#if text && !showAdvancedStats}
					<Card>
						<CardHeader>
							<CardTitle>Reading Time</CardTitle>
							<CardDescription>Estimated reading duration</CardDescription>
						</CardHeader>
						<CardContent>
							<Table.Root>
								<Table.Body>
									<Table.Row>
										<Table.Cell class="font-medium">Slow (200 WPM)</Table.Cell>
										<Table.Cell class="text-right">{Math.ceil(stats().words / 200)} min</Table.Cell>
									</Table.Row>
									<Table.Row>
										<Table.Cell class="font-medium">Average (250 WPM)</Table.Cell>
										<Table.Cell class="text-right">{Math.ceil(stats().words / 250)} min</Table.Cell>
									</Table.Row>
									<Table.Row>
										<Table.Cell class="font-medium">Fast (300 WPM)</Table.Cell>
										<Table.Cell class="text-right">{Math.ceil(stats().words / 300)} min</Table.Cell>
									</Table.Row>
								</Table.Body>
							</Table.Root>
						</CardContent>
					</Card>
				{/if}
			</div>
		</div>
	{/snippet}
</PageContainer>
