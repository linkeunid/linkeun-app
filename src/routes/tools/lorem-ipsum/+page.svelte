<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import { Textarea } from '$lib/components/ui/textarea';
	import PageContainer from '$lib/components/ui/page-container.svelte';
	import PageHeader from '$lib/components/ui/page-header.svelte';
	import TypeIcon from '@lucide/svelte/icons/type';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import RefreshCwIcon from '@lucide/svelte/icons/refresh-cw';
	import { toast } from 'svelte-sonner';

	let generationType = $state<'paragraphs' | 'sentences' | 'words'>('paragraphs');
	let count = $state(3);
	let startWithLorem = $state(true);
	let generatedText = $state('');

	// Lorem ipsum base text
	const loremWords = [
		'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
		'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
		'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
		'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
		'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
		'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
		'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
		'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'at', 'vero', 'eos',
		'accusamus', 'accusantium', 'doloremque', 'laudantium', 'totam', 'rem',
		'aperiam', 'eaque', 'ipsa', 'quae', 'ab', 'illo', 'inventore', 'veritatis',
		'et', 'quasi', 'architecto', 'beatae', 'vitae', 'dicta', 'sunt', 'explicabo',
		'nemo', 'ipsam', 'voluptatem', 'quia', 'voluptas', 'aspernatur', 'aut',
		'odit', 'fugit', 'sed', 'quia', 'consequuntur', 'magni', 'dolores', 'ratione',
		'sequi', 'nesciunt', 'neque', 'porro', 'quisquam', 'dolorem', 'adipisci',
		'numquam', 'eius', 'modi', 'tempora', 'incidunt', 'labore', 'magnam',
		'quaerat', 'voluptatem', 'fuga', 'harum', 'quidem', 'rerum', 'facilis',
		'expedita', 'distinctio', 'nam', 'libero', 'tempore', 'cum', 'soluta',
		'nobis', 'eleifend', 'option', 'congue', 'nihil', 'imperdiet', 'doming',
		'placerat', 'facer', 'possim', 'assum', 'typi', 'non', 'habent', 'claritatem',
		'insitam', 'processus', 'dynamicus', 'sequitur', 'mutationem', 'consuetudium',
		'lectorum', 'mirum', 'notare', 'quam', 'littera', 'gothica', 'putamus',
		'parum', 'claram', 'anteposuerit', 'litterarum', 'formas', 'humanitatis',
		'per', 'seacula', 'quarta', 'decima', 'quinta', 'decima', 'eodem', 'modo'
	];

	function getRandomWord(): string {
		return loremWords[Math.floor(Math.random() * loremWords.length)];
	}

	function generateSentence(minWords: number = 5, maxWords: number = 15): string {
		const wordCount = Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords;
		const words: string[] = [];
		
		for (let i = 0; i < wordCount; i++) {
			words.push(getRandomWord());
		}
		
		// Capitalize first word
		words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
		
		return words.join(' ') + '.';
	}

	function generateParagraph(minSentences: number = 3, maxSentences: number = 7): string {
		const sentenceCount = Math.floor(Math.random() * (maxSentences - minSentences + 1)) + minSentences;
		const sentences: string[] = [];
		
		for (let i = 0; i < sentenceCount; i++) {
			sentences.push(generateSentence());
		}
		
		return sentences.join(' ');
	}

	function generateLorem(): void {
		if (count <= 0) {
			generatedText = '';
			return;
		}

		let result: string[] = [];

		switch (generationType) {
			case 'words':
				const words: string[] = [];
				for (let i = 0; i < count; i++) {
					words.push(getRandomWord());
				}
				if (startWithLorem && words.length > 0) {
					words[0] = 'Lorem';
					if (words.length > 1) words[1] = 'ipsum';
				}
				result = [words.join(' ') + '.'];
				break;

			case 'sentences':
				for (let i = 0; i < count; i++) {
					let sentence = generateSentence();
					if (i === 0 && startWithLorem) {
						sentence = 'Lorem ipsum ' + sentence.substring(sentence.indexOf(' ') + 1);
					}
					result.push(sentence);
				}
				break;

			case 'paragraphs':
				for (let i = 0; i < count; i++) {
					let paragraph = generateParagraph();
					if (i === 0 && startWithLorem) {
						paragraph = 'Lorem ipsum ' + paragraph.substring(paragraph.indexOf(' ') + 1);
					}
					result.push(paragraph);
				}
				break;
		}

		generatedText = result.join('\n\n');
	}

	// Generate initial lorem ipsum
	$effect(() => {
		generateLorem();
	});

	async function copyToClipboard(): Promise<void> {
		if (generatedText) {
			try {
				await navigator.clipboard.writeText(generatedText);
				toast.success('Lorem ipsum copied to clipboard!');
			} catch (error) {
				toast.error('Failed to copy to clipboard');
			}
		}
	}

	function regenerate(): void {
		generateLorem();
		toast.success('New lorem ipsum generated!');
	}

	// Character and word count
	const textStats = $derived(() => {
		if (!generatedText) return { characters: 0, words: 0, paragraphs: 0 };
		
		const characters = generatedText.length;
		const words = generatedText.trim().split(/\s+/).filter(word => word.length > 0).length;
		const paragraphs = generatedText.split('\n\n').filter(p => p.trim().length > 0).length;
		
		return { characters, words, paragraphs };
	});
</script>

<PageHeader 
	title="Lorem Ipsum Generator" 
	subtitle="Generate placeholder text for your designs and content" 
	icon={TypeIcon} 
/>

<PageContainer>
	{#snippet children()}

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<div class="lg:col-span-2 space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Settings</CardTitle>
					<CardDescription>Configure your lorem ipsum generation</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-2">
						<Label>Generation Type</Label>
						<RadioGroup.Root bind:value={generationType}>
							<div class="flex space-x-6">
								<div class="flex items-center space-x-2">
									<RadioGroup.Item value="paragraphs" id="paragraphs" />
									<Label for="paragraphs" class="text-sm">Paragraphs</Label>
								</div>
								<div class="flex items-center space-x-2">
									<RadioGroup.Item value="sentences" id="sentences" />
									<Label for="sentences" class="text-sm">Sentences</Label>
								</div>
								<div class="flex items-center space-x-2">
									<RadioGroup.Item value="words" id="words" />
									<Label for="words" class="text-sm">Words</Label>
								</div>
							</div>
						</RadioGroup.Root>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label for="count">Number of {generationType}</Label>
							<Input
								id="count"
								type="number"
								bind:value={count}
								min="1"
								max="50"
								placeholder="3"
							/>
						</div>

						<div class="flex items-end">
							<div class="flex items-center space-x-2">
								<Checkbox
									id="start-lorem"
									bind:checked={startWithLorem}
								/>
								<Label for="start-lorem" class="text-sm">Start with "Lorem ipsum"</Label>
							</div>
						</div>
					</div>

					<Separator />

					<div class="flex flex-wrap gap-2">
						<Button onclick={regenerate}>
							<RefreshCwIcon class="mr-2 h-4 w-4" />
							Generate New
						</Button>

						<Button variant="outline" onclick={copyToClipboard} disabled={!generatedText}>
							<CopyIcon class="mr-2 h-4 w-4" />
							Copy Text
						</Button>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Generated Lorem Ipsum</CardTitle>
					<CardDescription>
						{textStats().characters} characters, {textStats().words} words, {textStats().paragraphs} paragraphs
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div class="space-y-4">
						<Textarea
							value={generatedText}
							readonly
							placeholder="Generated lorem ipsum will appear here..."
							class="min-h-[400px] resize-y"
						/>

						<div class="flex justify-between items-center text-sm text-muted-foreground">
							<span>Click to select all text</span>
							<Button
								variant="ghost"
								size="sm"
								onclick={copyToClipboard}
								disabled={!generatedText}
								class="h-8"
							>
								<CopyIcon class="mr-2 h-3 w-3" />
								Copy
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>

		<div class="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Quick Stats</CardTitle>
					<CardDescription>Text statistics</CardDescription>
				</CardHeader>
				<CardContent class="space-y-3">
					<div class="space-y-2 text-sm">
						<div class="flex justify-between">
							<span class="font-medium">Characters:</span>
							<span class="text-muted-foreground">{textStats().characters.toLocaleString()}</span>
						</div>
						<div class="flex justify-between">
							<span class="font-medium">Words:</span>
							<span class="text-muted-foreground">{textStats().words.toLocaleString()}</span>
						</div>
						<div class="flex justify-between">
							<span class="font-medium">Paragraphs:</span>
							<span class="text-muted-foreground">{textStats().paragraphs.toLocaleString()}</span>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>About Lorem Ipsum</CardTitle>
					<CardDescription>What is Lorem Ipsum?</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-3 text-sm">
						<div>
							<h4 class="font-medium">Origins</h4>
							<p class="text-muted-foreground">Lorem Ipsum is simply dummy text of the printing and typesetting industry since the 1500s.</p>
						</div>

						<div>
							<h4 class="font-medium">Purpose</h4>
							<p class="text-muted-foreground">Used as placeholder text to focus on design elements without being distracted by readable content.</p>
						</div>

						<div>
							<h4 class="font-medium">Benefits</h4>
							<ul class="text-muted-foreground list-disc list-inside space-y-1">
								<li>Neutral content</li>
								<li>Standard length</li>
								<li>Widely recognized</li>
								<li>Professional appearance</li>
							</ul>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Common Uses</CardTitle>
					<CardDescription>Where to use Lorem Ipsum</CardDescription>
				</CardHeader>
				<CardContent>
					<div class="space-y-2 text-sm">
						<p>• Website mockups and wireframes</p>
						<p>• Print design layouts</p>
						<p>• Template creation</p>
						<p>• Content management systems</p>
						<p>• Typography testing</p>
						<p>• UI/UX design prototypes</p>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Generation Options</CardTitle>
					<CardDescription>Customize your output</CardDescription>
				</CardHeader>
				<CardContent>
					<div class="space-y-2 text-sm">
						<p><strong>Paragraphs:</strong> Full text blocks with multiple sentences</p>
						<p><strong>Sentences:</strong> Individual sentences ending with periods</p>
						<p><strong>Words:</strong> Space-separated word lists</p>
						<p><strong>Lorem Start:</strong> Begin with classic "Lorem ipsum" opening</p>
					</div>
				</CardContent>
			</Card>
		</div>
	</div>

	{/snippet}
</PageContainer>