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
	import PageContainer from '$lib/components/ui/page-container.svelte';
	import PageHeader from '$lib/components/ui/page-header.svelte';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Separator } from '$lib/components/ui/separator';
	import { Textarea } from '$lib/components/ui/textarea';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import DownloadIcon from '@lucide/svelte/icons/download';
	import TypeIcon from '@lucide/svelte/icons/type';
	import { toast } from 'svelte-sonner';

	let inputText = $state('HELLO');
	let selectedFont = $state('block');

	// Font options for Select component
	const fontOptions = [
		{ value: 'block', label: 'Block' },
		{ value: 'small', label: 'Small' },
		{ value: 'bubble', label: 'Bubble' }
	];

	const triggerContent = $derived(
		fontOptions.find((f) => f.value === selectedFont)?.label ?? 'Select font'
	);
	let selectedStyle = $state('standard');
	let generatedArt = $state('');

	// ASCII art fonts - simplified implementations
	const fonts = {
		block: {
			name: 'Block',
			chars: {
				A: ['███', '█ █', '███', '█ █', '█ █'],
				B: ['██ ', '█ █', '██ ', '█ █', '██ '],
				C: ['███', '█  ', '█  ', '█  ', '███'],
				D: ['██ ', '█ █', '█ █', '█ █', '██ '],
				E: ['███', '█  ', '██ ', '█  ', '███'],
				F: ['███', '█  ', '██ ', '█  ', '█  '],
				G: ['███', '█  ', '█ █', '█ █', '███'],
				H: ['█ █', '█ █', '███', '█ █', '█ █'],
				I: ['███', ' █ ', ' █ ', ' █ ', '███'],
				J: ['███', '  █', '  █', '█ █', '███'],
				K: ['█ █', '██ ', '█  ', '██ ', '█ █'],
				L: ['█  ', '█  ', '█  ', '█  ', '███'],
				M: ['█ █', '███', '█ █', '█ █', '█ █'],
				N: ['█ █', '███', '███', '███', '█ █'],
				O: ['███', '█ █', '█ █', '█ █', '███'],
				P: ['██ ', '█ █', '██ ', '█  ', '█  '],
				Q: ['███', '█ █', '█ █', '███', '  █'],
				R: ['██ ', '█ █', '██ ', '█ █', '█ █'],
				S: ['███', '█  ', '███', '  █', '███'],
				T: ['███', ' █ ', ' █ ', ' █ ', ' █ '],
				U: ['█ █', '█ █', '█ █', '█ █', '███'],
				V: ['█ █', '█ █', '█ █', '█ █', ' █ '],
				W: ['█ █', '█ █', '█ █', '███', '█ █'],
				X: ['█ █', ' █ ', ' █ ', ' █ ', '█ █'],
				Y: ['█ █', '█ █', ' █ ', ' █ ', ' █ '],
				Z: ['███', '  █', ' █ ', '█  ', '███'],
				'0': ['███', '█ █', '█ █', '█ █', '███'],
				'1': [' █ ', '██ ', ' █ ', ' █ ', '███'],
				'2': ['███', '  █', '███', '█  ', '███'],
				'3': ['███', '  █', '███', '  █', '███'],
				'4': ['█ █', '█ █', '███', '  █', '  █'],
				'5': ['███', '█  ', '███', '  █', '███'],
				'6': ['███', '█  ', '███', '█ █', '███'],
				'7': ['███', '  █', '  █', '  █', '  █'],
				'8': ['███', '█ █', '███', '█ █', '███'],
				'9': ['███', '█ █', '███', '  █', '███'],
				' ': ['   ', '   ', '   ', '   ', '   ']
			}
		},
		small: {
			name: 'Small',
			chars: {
				A: ['▄▀█', '█▄▄'],
				B: ['█▄▄', '█▄█'],
				C: ['▄▀█', '▀▄▄'],
				D: ['█▄▄', '█▄█'],
				E: ['█▀▀', '█▄▄'],
				F: ['█▀▀', '█▀ '],
				G: ['▄▀█', '▀▄█'],
				H: ['█ █', '█▀█'],
				I: ['█', '█'],
				J: ['  █', '▄▄█'],
				K: ['█ █', '██ '],
				L: ['█  ', '█▄▄'],
				M: ['█▄█', '█▀█'],
				N: ['█▄█', '█▀█'],
				O: ['▄▀█', '▀▄▀'],
				P: ['█▀▄', '█▀ '],
				Q: ['▄▀█', '▀▄█'],
				R: ['█▀▄', '█▀▄'],
				S: ['▄▀▀', '▄▄▀'],
				T: ['▀█▀', ' █ '],
				U: ['█ █', '▀▄▀'],
				V: ['█ █', ' ▀ '],
				W: ['█ █', '▀▄▀'],
				X: ['▀▄▀', '▄▀▄'],
				Y: ['▀▄▀', ' █ '],
				Z: ['▀▀▄', '▄▀▀'],
				'0': ['▄▀▄', '▀▄▀'],
				'1': [' █', ' █'],
				'2': ['▀▀▄', '▄▀▀'],
				'3': ['▀▀▄', '▄▄▀'],
				'4': ['▄▀▄', ' ▄▀'],
				'5': ['▄▀▀', '▀▀▄'],
				'6': ['▄▀▀', '▀▄▀'],
				'7': ['▀▀▄', '  ▀'],
				'8': ['▄▀▄', '▀▄▀'],
				'9': ['▄▀▄', '▀▀▄'],
				' ': [' ', ' ']
			}
		},
		bubble: {
			name: 'Bubble',
			chars: {
				A: ['░█████╗░', '██╔══██╗', '███████║', '██╔══██║', '██║░░██║'],
				B: ['██████╗░', '██╔══██╗', '██████╦╝', '██╔══██╗', '██████╦╝'],
				C: ['░█████╗░', '██╔══██╗', '██║░░╚═╝', '██║░░██╗', '╚█████╔╝'],
				D: ['██████╗░', '██╔══██╗', '██║░░██║', '██║░░██║', '██████╔╝'],
				E: ['███████╗', '██╔════╝', '█████╗░░', '██╔══╝░░', '███████╗'],
				F: ['███████╗', '██╔════╝', '█████╗░░', '██╔══╝░░', '██║░░░░░'],
				G: ['░██████╗░', '██╔════╝░', '██║░░██╗░', '██║░░╚██╗', '╚██████╔╝'],
				H: ['██╗░░██╗', '██║░░██║', '███████║', '██╔══██║', '██║░░██║'],
				I: ['██╗', '██║', '██║', '██║', '██║'],
				J: ['░░░░░██╗', '░░░░░██║', '░░░░░██║', '██╗░░██║', '╚█████╔╝'],
				K: ['██╗░░██╗', '██║░██╔╝', '█████╔╝░', '██╔═██╗░', '██║░░██╗'],
				L: ['██╗░░░░░', '██║░░░░░', '██║░░░░░', '██║░░░░░', '███████╗'],
				M: ['███╗░░░███╗', '████╗░████║', '██╔████╔██║', '██║╚██╔╝██║', '██║░╚═╝░██║'],
				N: ['███╗░░██╗', '████╗░██║', '██╔██╗██║', '██║╚████║', '██║░╚███║'],
				O: ['░█████╗░', '██╔══██╗', '██║░░██║', '██║░░██║', '╚█████╔╝'],
				P: ['██████╗░', '██╔══██╗', '██████╔╝', '██╔═══╝░', '██║░░░░░'],
				Q: ['░██████╗░', '██╔═══██╗', '██║██╗██║', '╚██████╔╝', '░╚═██╔═╝░'],
				R: ['██████╗░', '██╔══██╗', '██████╔╝', '██╔══██╗', '██║░░██║'],
				S: ['░██████╗', '██╔════╝', '╚█████╗░', '░╚═══██╗', '██████╔╝'],
				T: ['████████╗', '╚══██╔══╝', '░░░██║░░░', '░░░██║░░░', '░░░██║░░░'],
				U: ['██╗░░░██╗', '██║░░░██║', '██║░░░██║', '██║░░░██║', '╚██████╔╝'],
				V: ['██╗░░░██╗', '██║░░░██║', '╚██╗░██╔╝', '░╚████╔╝░', '░░╚██╔╝░░'],
				W: [
					'██╗░░░██╗░░░██╗',
					'██║░░░██║░░░██║',
					'██║░░░██║░░░██║',
					'╚██╗░██╔╝░██╔╝░',
					'░╚████╔╝██╔╝░░░'
				],
				X: ['██╗░░██╗', '╚██╗██╔╝', '░╚███╔╝░', '░██╔██╗░', '██╔╝░██╗'],
				Y: ['██╗░░░██╗', '╚██╗░██╔╝', '░╚████╔╝░', '░░╚██╔╝░░', '░░░██║░░░'],
				Z: ['███████╗', '╚════██║', '░░░░██╔╝', '░░░██╔╝░', '░░██╔═══╝'],
				'0': ['░█████╗░', '██╔══██╗', '██║░░██║', '██║░░██║', '╚█████╔╝'],
				'1': ['░░███╗░░', '░████║░░', '██╔██║░░', '╚═╝██║░░', '███████╗'],
				'2': ['██████╗░', '╚════██╗', '░░░░██╔╝', '░░░██╔╝░', '░░██╔═══╝'],
				'3': ['██████╗░', '╚════██╗', '░█████╔╝', '░╚═══██╗', '██████╔╝'],
				'4': ['░░██╗██╗', '░██╔╝██║', '██╔╝░██║', '███████║', '╚════██║'],
				'5': ['███████╗', '██╔════╝', '██████╗░', '╚════██╗', '██████╔╝'],
				'6': ['░█████╗░', '██╔═══╝░', '██████╗░', '██╔══██╗', '╚█████╔╝'],
				'7': ['███████╗', '░░░░░██║', '░░░░██╔╝', '░░░██╔╝░', '░░██╔╝░░'],
				'8': ['░█████╗░', '██╔══██╗', '╚█████╔╝', '██╔══██╗', '╚█████╔╝'],
				'9': ['░█████╗░', '██╔══██╗', '╚██████║', '░╚═══██║', '░█████╔╝'],
				' ': ['░░░░░░░░', '░░░░░░░░', '░░░░░░░░', '░░░░░░░░', '░░░░░░░░']
			}
		}
	};

	type Style = 'standard' | 'shadow' | 'double' | 'neon' | 'gradient' | 'outline' | 'retro' | 'matrix';

	const styles: Record<Style, { name: string; description: string }> = {
		standard: { name: 'Standard', description: 'Clean ASCII art' },
		shadow: { name: 'Shadow', description: 'Drop shadow effect' },
		double: { name: 'Double', description: 'Double-line thickness' },
		neon: { name: 'Neon', description: 'Glowing neon style' },
		gradient: { name: 'Gradient', description: 'Fading gradient effect' },
		outline: { name: 'Outline', description: 'Outlined border style' },
		retro: { name: 'Retro', description: 'Vintage computer terminal style' },
		matrix: { name: 'Matrix', description: 'Digital matrix style' }
	};

	function generateAsciiArt(): void {
		if (!inputText.trim()) {
			generatedArt = '';
			return;
		}

		const font = fonts[selectedFont as keyof typeof fonts];
		const text = inputText.toUpperCase();
		const lines: string[] = [];

		// Initialize lines based on font height
		const height = font.chars.A.length;
		for (let i = 0; i < height; i++) {
			lines[i] = '';
		}

		// Generate each character
		for (let charIndex = 0; charIndex < text.length; charIndex++) {
			const char = text[charIndex];
			const charLines = font.chars[char as keyof typeof font.chars] || font.chars[' '];

			for (let lineIndex = 0; lineIndex < height; lineIndex++) {
				if (charIndex > 0) {
					lines[lineIndex] += ' '; // Add space between characters
				}
				lines[lineIndex] += charLines[lineIndex] || '';
			}
		}

		// Apply style effects
		let result = applyStyleEffect(lines, selectedStyle as Style);
		generatedArt = result;
	}

	function applyStyleEffect(lines: string[], style: Style): string {
		switch (style) {
			case 'standard':
				return lines.join('\n');

			case 'shadow':
				// Enhanced shadow with proper depth
				const shadowLines = lines.map((line) => ' ' + line.replace(/[^\s]/g, '▓'));
				const shadowResult: string[] = [];
				for (let i = 0; i < lines.length; i++) {
					shadowResult.push(lines[i]);
				}
				shadowResult.push(''); // Add spacing
				for (let i = 0; i < shadowLines.length; i++) {
					shadowResult.push(shadowLines[i]);
				}
				return shadowResult.join('\n');

			case 'double':
				// Thicker appearance by duplicating characters
				return lines.map((line) => 
					line.replace(/[^\s]/g, (char) => char + char)
				).join('\n');

			case 'neon':
				// Neon glow effect with surrounding dots
				const neonLines: string[] = [];
				// Top border
				neonLines.push('.' + '.'.repeat(Math.max(...lines.map(l => l.length)) + 2) + '.');
				for (const line of lines) {
					neonLines.push('.' + ' ' + line + ' ' + '.');
				}
				// Bottom border
				neonLines.push('.' + '.'.repeat(Math.max(...lines.map(l => l.length)) + 2) + '.');
				return neonLines.join('\n');

			case 'gradient':
				// Gradient effect using different intensity characters
				const gradientChars = ['░', '▒', '▓', '█'];
				return lines.map((line, lineIndex) => {
					const intensity = Math.floor((lineIndex / lines.length) * gradientChars.length);
					const gradientChar = gradientChars[Math.min(intensity, gradientChars.length - 1)];
					return line.replace(/[^\s]/g, gradientChar);
				}).join('\n');

			case 'outline':
				// Outlined effect with borders
				const outlineLines: string[] = [];
				const outlineMaxWidth = Math.max(...lines.map(l => l.length));
				
				// Top border
				outlineLines.push('╔' + '═'.repeat(outlineMaxWidth + 2) + '╗');
				
				// Content with side borders
				for (const line of lines) {
					const paddedLine = line.padEnd(outlineMaxWidth);
					outlineLines.push('║ ' + paddedLine + ' ║');
				}
				
				// Bottom border
				outlineLines.push('╚' + '═'.repeat(outlineMaxWidth + 2) + '╝');
				return outlineLines.join('\n');

			case 'retro':
				// Retro computer terminal style with classic characters
				const retroResult: string[] = [];
				const retroMaxWidth = Math.max(...lines.map(l => l.length));
				
				// Add retro terminal header
				retroResult.push('┌' + '─'.repeat(retroMaxWidth + 4) + '┐');
				retroResult.push('│  ' + ' '.repeat(retroMaxWidth) + '  │');
				
				// Add content with retro styling using hash characters
				for (const line of lines) {
					const retroLine = line.replace(/[^\s]/g, '#');
					const paddedLine = retroLine.padEnd(retroMaxWidth);
					retroResult.push('│  ' + paddedLine + '  │');
				}
				
				// Add retro terminal footer
				retroResult.push('│  ' + ' '.repeat(retroMaxWidth) + '  │');
				retroResult.push('└' + '─'.repeat(retroMaxWidth + 4) + '┘');
				
				// Add retro prompt line
				retroResult.push('');
				retroResult.push('> READY_');
				
				return retroResult.join('\n');

			case 'matrix':
				// Matrix digital rain effect
				const matrixChars = ['0', '1', '｡', '｢', '｣', 'ﾊ', 'ﾐ', 'ﾋ', 'ｰ', 'ｳ'];
				return lines.map((line) => {
					return line.replace(/[^\s]/g, () => {
						return matrixChars[Math.floor(Math.random() * matrixChars.length)];
					});
				}).join('\n');

			default:
				return lines.join('\n');
		}
	}

	// Generate initial ASCII art
	$effect(() => {
		generateAsciiArt();
	});

	async function copyToClipboard(): Promise<void> {
		if (generatedArt) {
			try {
				await navigator.clipboard.writeText(generatedArt);
				toast.success('ASCII art copied to clipboard!');
			} catch (error) {
				toast.error('Failed to copy to clipboard');
			}
		}
	}

	function downloadArt(): void {
		if (!generatedArt) return;

		const blob = new Blob([generatedArt], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `ascii-art-${inputText.toLowerCase().replace(/\s+/g, '-')}.txt`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		toast.success('ASCII art downloaded!');
	}

	// Art statistics
	const artStats = $derived(() => {
		if (!generatedArt) return { lines: 0, characters: 0, width: 0 };

		const lines = generatedArt.split('\n');
		const lineCount = lines.length;
		const characters = generatedArt.length;
		const width = Math.max(...lines.map((line) => line.length));

		return { lines: lineCount, characters, width };
	});
</script>

<PageHeader
	title="ASCII Art Generator"
	subtitle="Convert text into beautiful ASCII art with multiple fonts and styles"
	icon={TypeIcon}
/>

<PageContainer>
	{#snippet children()}
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
			<div class="space-y-6 lg:col-span-2">
				<Card>
					<CardHeader>
						<CardTitle>Settings</CardTitle>
						<CardDescription>Configure your ASCII art generation</CardDescription>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="space-y-2">
							<Label for="input-text">Text to Convert</Label>
							<Input
								id="input-text"
								type="text"
								bind:value={inputText}
								placeholder="Enter your text here"
								maxlength={20}
								class="text-lg"
							/>
							<div class="text-muted-foreground text-xs">
								💡 <strong>Tip:</strong> Keep text short (max 20 characters) for best results. Use A-Z,
								0-9, and spaces.
							</div>
						</div>

						<div class="grid grid-cols-2 gap-4">
							<div class="space-y-2">
								<Label>ASCII Font</Label>
								<Select.Root type="single" name="asciiFont" bind:value={selectedFont}>
									<Select.Trigger class="w-full">
										{triggerContent}
									</Select.Trigger>
									<Select.Content>
										<Select.Group>
											<Select.Label>ASCII Fonts</Select.Label>
											{#each fontOptions as font (font.value)}
												<Select.Item value={font.value} label={font.label}>
													{font.label}
												</Select.Item>
											{/each}
										</Select.Group>
									</Select.Content>
								</Select.Root>
							</div>

							<div class="space-y-2">
								<Label>Style Effect</Label>
								<RadioGroup.Root bind:value={selectedStyle}>
									<div class="grid grid-cols-2 gap-2">
										{#each Object.entries(styles) as [key, style]}
											<div class="flex items-center space-x-2">
												<RadioGroup.Item value={key} id={key} />
												<Label for={key} class="text-sm">{style.name}</Label>
											</div>
										{/each}
									</div>
								</RadioGroup.Root>
							</div>
						</div>

						<Separator />

						<div class="flex flex-wrap gap-2">
							<Button variant="outline" onclick={() => copyToClipboard()} disabled={!generatedArt}>
								<CopyIcon class="mr-2 h-4 w-4" />
								Copy Art
							</Button>

							<Button variant="outline" onclick={() => downloadArt()} disabled={!generatedArt}>
								<DownloadIcon class="mr-2 h-4 w-4" />
								Download
							</Button>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Generated ASCII Art</CardTitle>
						<CardDescription>
							{artStats().lines} lines, {artStats().characters} characters, {artStats().width} width
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div class="space-y-4">
							<Textarea
								value={generatedArt}
								readonly
								placeholder="Your ASCII art will appear here..."
								class="min-h-[400px] resize-y font-mono"
							/>

							<div class="text-muted-foreground flex items-center justify-between text-sm">
								<span>ASCII art preview</span>
								<div class="flex gap-2">
									<Button
										variant="ghost"
										size="sm"
										onclick={() => copyToClipboard()}
										disabled={!generatedArt}
										class="h-8"
									>
										<CopyIcon class="mr-2 h-3 w-3" />
										Copy
									</Button>
									<Button
										variant="ghost"
										size="sm"
										onclick={() => downloadArt()}
										disabled={!generatedArt}
										class="h-8"
									>
										<DownloadIcon class="mr-2 h-3 w-3" />
										Download
									</Button>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<div class="space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>Art Statistics</CardTitle>
						<CardDescription>ASCII art information</CardDescription>
					</CardHeader>
					<CardContent class="space-y-3">
						<div class="space-y-2 text-sm">
							<div class="flex justify-between">
								<span class="font-medium">Lines:</span>
								<span class="text-muted-foreground">{artStats().lines}</span>
							</div>
							<div class="flex justify-between">
								<span class="font-medium">Characters:</span>
								<span class="text-muted-foreground">{artStats().characters.toLocaleString()}</span>
							</div>
							<div class="flex justify-between">
								<span class="font-medium">Width:</span>
								<span class="text-muted-foreground">{artStats().width} chars</span>
							</div>
							<div class="flex justify-between">
								<span class="font-medium">Font:</span>
								<span class="text-muted-foreground"
									>{fonts[selectedFont as keyof typeof fonts]?.name || selectedFont}</span
								>
							</div>
							<div class="flex justify-between">
								<span class="font-medium">Style:</span>
								<span class="text-muted-foreground">{styles[selectedStyle as Style].name}</span>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Available Fonts</CardTitle>
						<CardDescription>ASCII art font styles</CardDescription>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="space-y-3 text-sm">
							<div>
								<h4 class="font-medium">Block</h4>
								<p class="text-muted-foreground">Classic block letters with solid fills</p>
							</div>

							<div>
								<h4 class="font-medium">Small</h4>
								<p class="text-muted-foreground">Compact style using Unicode characters</p>
							</div>

							<div>
								<h4 class="font-medium">Bubble</h4>
								<p class="text-muted-foreground">Decorative outlined style with borders</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Style Effects</CardTitle>
						<CardDescription>Visual enhancement options</CardDescription>
					</CardHeader>
					<CardContent>
						<div class="space-y-2 text-sm">
							<p><strong>Standard:</strong> Clean, basic ASCII art output</p>
							<p><strong>Shadow:</strong> Adds depth with drop shadow effects</p>
							<p><strong>Double:</strong> Creates thick, bold appearance</p>
							<p><strong>Neon:</strong> Glowing outline effect with borders</p>
							<p><strong>Gradient:</strong> Fading intensity from light to dark</p>
							<p><strong>Outline:</strong> Professional border frame styling</p>
							<p><strong>Retro:</strong> Vintage computer terminal with prompt</p>
							<p><strong>Matrix:</strong> Digital code rain effect</p>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Use Cases</CardTitle>
						<CardDescription>Where to use ASCII art</CardDescription>
					</CardHeader>
					<CardContent>
						<div class="space-y-2 text-sm">
							<p>• Terminal and console applications</p>
							<p>• Email signatures and text messages</p>
							<p>• Code comments and documentation</p>
							<p>• Social media posts and forums</p>
							<p>• Text-based banners and headers</p>
							<p>• Retro-style user interfaces</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	{/snippet}
</PageContainer>
