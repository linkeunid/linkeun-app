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
	import * as Select from '$lib/components/ui/select/index.js';
	import { Separator } from '$lib/components/ui/separator';
	import { Textarea } from '$lib/components/ui/textarea';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import LockIcon from '@lucide/svelte/icons/lock';
	import UnlockIcon from '@lucide/svelte/icons/unlock';
	import ShieldIcon from '@lucide/svelte/icons/shield';
	import { toast } from 'svelte-sonner';

	// Form state
	let inputText = $state('Hello World!');
	let outputText = $state('');
	let selectedCipher = $state('morse');
	let caesarShift = $state(3);
	let operation = $state<'encrypt' | 'decrypt'>('encrypt');

	// Cipher options
	const cipherOptions = [
		{ value: 'morse', label: 'Morse Code', description: 'International Morse Code' },
		{ value: 'caesar', label: 'Caesar Cipher', description: 'Shift each letter by N positions' },
		{ value: 'rot13', label: 'ROT13', description: 'Rotate letters by 13 positions' },
		{ value: 'binary', label: 'Binary/ASCII', description: 'Convert text to binary representation' },
		{ value: 'atbash', label: 'Atbash Cipher', description: 'Replace A with Z, B with Y, etc.' },
		{ value: 'uesugi', label: 'Uesugi Cipher', description: 'Japanese cryptology from the 1500s to Meiji' },
		{ value: 'iroha', label: 'I-ro-ha Cipher', description: 'Japanese checkerboard cipher using Iroha poem' },
		{ value: 'reverse', label: 'Reverse Text', description: 'Reverse the order of characters' }
	];

	const cipherTriggerContent = $derived(
		cipherOptions.find((c) => c.value === selectedCipher)?.label ?? 'Select cipher'
	);

	// Morse code dictionary
	const morseCode: Record<string, string> = {
		'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
		'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
		'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
		'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
		'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
		'3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
		'8': '---..', '9': '----.', '.': '.-.-.-', ',': '--..--', '?': '..--..',
		"'": '.----.', '!': '-.-.--', '/': '-..-.', '(': '-.--.', ')': '-.--.-',
		'&': '.-...', ':': '---...', ';': '-.-.-.', '=': '-...-', '+': '.-.-.',
		'-': '-....-', '_': '..--.-', '"': '.-..-.', '$': '...-..-', '@': '.--.-.',
		' ': '/'
	};

	const reverseMorseCode = Object.fromEntries(
		Object.entries(morseCode).map(([key, value]) => [value, key])
	);

	// Uesugi cipher dictionary (historical Japanese cryptography)
	// Based on the substitution system used by the Uesugi clan
	const uesugiCode: Record<string, string> = {
		'A': '上', 'B': '下', 'C': '左', 'D': '右', 'E': '前', 'F': '後',
		'G': '東', 'H': '西', 'I': '南', 'J': '北', 'K': '天', 'L': '地',
		'M': '火', 'N': '水', 'O': '木', 'P': '金', 'Q': '土', 'R': '風',
		'S': '雷', 'T': '山', 'U': '川', 'V': '海', 'W': '空', 'X': '雲',
		'Y': '月', 'Z': '日', '0': '零', '1': '一', '2': '二', '3': '三',
		'4': '四', '5': '五', '6': '六', '7': '七', '8': '八', '9': '九',
		'.': '。', ',': '、', '?': '？', '!': '！', ' ': '　',
		':': '：', ';': '；', "'": '「', '"': '」', '(': '（', ')': '）'
	};

	const reverseUesugiCode = Object.fromEntries(
		Object.entries(uesugiCode).map(([key, value]) => [value, key])
	);

	// I-ro-ha checkerboard cipher (traditional Japanese cipher)
	// Based on the Iroha poem arranged in a 7x7 checkerboard
	const irohaCheckerboard = [
		['i', 'ro', 'ha', 'ni', 'ho', 'he', 'to'],
		['chi', 'ri', 'nu', 'ru', 'wo', 'wa', 'ka'],
		['yo', 'ta', 're', 'so', 'tsu', 'ne', 'na'],
		['ra', 'mu', 'u', 'wi', 'no', 'o', 'ku'],
		['ya', 'ma', 'ke', 'fu', 'ko', 'e', 'te'],
		['a', 'sa', 'ki', 'yu', 'me', 'mi', 'shi'],
		['we', 'hi', 'mo', 'se', 'su', 'n', '']
	];

	// Create mapping from syllables to coordinates
	const irohaToCoords: Record<string, string> = {};
	const coordsToIroha: Record<string, string> = {};

	for (let row = 0; row < 7; row++) {
		for (let col = 0; col < 7; col++) {
			const syllable = irohaCheckerboard[row][col];
			if (syllable) {
				const coord = `${row + 1}${col + 1}`;
				irohaToCoords[syllable] = coord;
				coordsToIroha[coord] = syllable;
			}
		}
	}

	// Map English letters to Iroha syllables (simplified romanization)
	const englishToIroha: Record<string, string> = {
		'A': 'a', 'B': 'ha', 'C': 'chi', 'D': 'ta', 'E': 'e', 'F': 'fu',
		'G': 'ka', 'H': 'hi', 'I': 'i', 'J': 'ya', 'K': 'ki', 'L': 'ri',
		'M': 'ma', 'N': 'na', 'O': 'o', 'P': 'ra', 'Q': 'ku', 'R': 'ru',
		'S': 'sa', 'T': 'to', 'U': 'u', 'V': 'wa', 'W': 'we', 'X': 'ko',
		'Y': 'yo', 'Z': 'tsu', ' ': 'n'
	};

	const irohaToEnglish = Object.fromEntries(
		Object.entries(englishToIroha).map(([key, value]) => [value, key])
	);

	// Cipher functions
	function encryptMorse(text: string): string {
		return text
			.toUpperCase()
			.split('')
			.map(char => morseCode[char] || char)
			.join(' ')
			.replace(/\s+/g, ' ')
			.trim();
	}

	function decryptMorse(text: string): string {
		return text
			.split(' ')
			.map(code => reverseMorseCode[code] || code)
			.join('')
			.replace(/\//g, ' ');
	}

	function encryptCaesar(text: string, shift: number): string {
		return text
			.split('')
			.map(char => {
				if (char.match(/[a-z]/i)) {
					const code = char.charCodeAt(0);
					const base = code >= 65 && code <= 90 ? 65 : 97;
					return String.fromCharCode(((code - base + shift) % 26) + base);
				}
				return char;
			})
			.join('');
	}

	function decryptCaesar(text: string, shift: number): string {
		return encryptCaesar(text, -shift);
	}

	function encryptROT13(text: string): string {
		return encryptCaesar(text, 13);
	}

	function decryptROT13(text: string): string {
		return encryptCaesar(text, -13);
	}

	function encryptBinary(text: string): string {
		return text
			.split('')
			.map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
			.join(' ');
	}

	function decryptBinary(text: string): string {
		return text
			.split(' ')
			.filter(binary => binary.length === 8)
			.map(binary => String.fromCharCode(parseInt(binary, 2)))
			.join('');
	}

	function encryptAtbash(text: string): string {
		return text
			.split('')
			.map(char => {
				if (char.match(/[a-z]/i)) {
					const code = char.charCodeAt(0);
					const base = code >= 65 && code <= 90 ? 65 : 97;
					return String.fromCharCode(25 - (code - base) + base);
				}
				return char;
			})
			.join('');
	}

	function decryptAtbash(text: string): string {
		return encryptAtbash(text); // Atbash is its own inverse
	}

	function encryptReverse(text: string): string {
		return text.split('').reverse().join('');
	}

	function decryptReverse(text: string): string {
		return text.split('').reverse().join('');
	}

	function encryptUesugi(text: string): string {
		return text
			.toUpperCase()
			.split('')
			.map(char => uesugiCode[char] || char)
			.join('');
	}

	function decryptUesugi(text: string): string {
		return text
			.split('')
			.map(char => reverseUesugiCode[char] || char)
			.join('');
	}

	function encryptIroha(text: string): string {
		return text
			.toUpperCase()
			.split('')
			.map(char => {
				const iroha = englishToIroha[char];
				if (iroha) {
					const coords = irohaToCoords[iroha];
					return coords || char;
				}
				return char;
			})
			.join(' ')
			.replace(/\s+/g, ' ')
			.trim();
	}

	function decryptIroha(text: string): string {
		return text
			.split(' ')
			.map(coords => {
				if (coords.length === 2 && /^\d\d$/.test(coords)) {
					const iroha = coordsToIroha[coords];
					if (iroha) {
						return irohaToEnglish[iroha] || coords;
					}
				}
				return coords;
			})
			.join('');
	}

	// Main processing function
	function processText(): void {
		if (!inputText.trim()) {
			outputText = '';
			return;
		}

		try {
			switch (selectedCipher) {
				case 'morse':
					outputText = operation === 'encrypt' ? encryptMorse(inputText) : decryptMorse(inputText);
					break;
				case 'caesar':
					outputText = operation === 'encrypt' 
						? encryptCaesar(inputText, caesarShift) 
						: decryptCaesar(inputText, caesarShift);
					break;
				case 'rot13':
					outputText = operation === 'encrypt' ? encryptROT13(inputText) : decryptROT13(inputText);
					break;
				case 'binary':
					outputText = operation === 'encrypt' ? encryptBinary(inputText) : decryptBinary(inputText);
					break;
				case 'atbash':
					outputText = operation === 'encrypt' ? encryptAtbash(inputText) : decryptAtbash(inputText);
					break;
				case 'uesugi':
					outputText = operation === 'encrypt' ? encryptUesugi(inputText) : decryptUesugi(inputText);
					break;
				case 'iroha':
					outputText = operation === 'encrypt' ? encryptIroha(inputText) : decryptIroha(inputText);
					break;
				case 'reverse':
					outputText = operation === 'encrypt' ? encryptReverse(inputText) : decryptReverse(inputText);
					break;
				default:
					outputText = inputText;
			}
		} catch (error) {
			toast.error('Failed to process text. Please check your input.');
			outputText = '';
		}
	}

	// Process text when inputs change
	$effect(() => {
		inputText;
		selectedCipher;
		caesarShift;
		operation;
		processText();
	});

	async function copyOutput(): Promise<void> {
		if (!outputText) return;

		try {
			await navigator.clipboard.writeText(outputText);
			toast.success('Output copied to clipboard!');
		} catch (error) {
			toast.error('Failed to copy to clipboard');
		}
	}

	function swapInputOutput(): void {
		const temp = inputText;
		inputText = outputText;
		outputText = temp;
		operation = operation === 'encrypt' ? 'decrypt' : 'encrypt';
	}

	// Text analysis
	const textStats = $derived(() => {
		if (!inputText) return { characters: 0, words: 0, lines: 0, letters: 0 };
		
		const characters = inputText.length;
		const words = inputText.trim().split(/\s+/).filter(word => word.length > 0).length;
		const lines = inputText.split('\n').length;
		const letters = inputText.replace(/[^a-zA-Z]/g, '').length;
		
		return { characters, words, lines, letters };
	});

	const outputStats = $derived(() => {
		if (!outputText) return { characters: 0, words: 0, lines: 0, letters: 0 };
		
		const characters = outputText.length;
		const words = outputText.trim().split(/\s+/).filter(word => word.length > 0).length;
		const lines = outputText.split('\n').length;
		const letters = outputText.replace(/[^a-zA-Z]/g, '').length;
		
		return { characters, words, lines, letters };
	});

	// Character frequency analysis
	const characterFrequency = $derived(() => {
		if (!inputText) return [];
		
		const frequency: Record<string, number> = {};
		const letters = inputText.toLowerCase().replace(/[^a-z]/g, '');
		
		for (const char of letters) {
			frequency[char] = (frequency[char] || 0) + 1;
		}
		
		return Object.entries(frequency)
			.sort(([,a], [,b]) => b - a)
			.slice(0, 10)
			.map(([char, count]) => ({
				char: char.toUpperCase(),
				count,
				percentage: ((count / letters.length) * 100).toFixed(1)
			}));
	});
</script>

<PageHeader
	title="Text Encryption/Decryption"
	subtitle="Encrypt and decrypt text using various cipher methods including Morse code"
	icon={ShieldIcon}
/>

<PageContainer>
	{#snippet children()}
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
			<div class="space-y-6 lg:col-span-2">
				<Card>
					<CardHeader>
						<CardTitle>Cipher Settings</CardTitle>
						<CardDescription>Choose your encryption method and operation mode</CardDescription>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div class="space-y-2">
								<Label>Cipher Method</Label>
								<Select.Root type="single" name="cipher" bind:value={selectedCipher}>
									<Select.Trigger class="w-full">
										{cipherTriggerContent}
									</Select.Trigger>
									<Select.Content>
										<Select.Group>
											<Select.Label>Cipher Methods</Select.Label>
											{#each cipherOptions as cipher (cipher.value)}
												<Select.Item value={cipher.value} label={cipher.label}>
													<div>
														<div class="font-medium">{cipher.label}</div>
														<div class="text-xs text-muted-foreground">{cipher.description}</div>
													</div>
												</Select.Item>
											{/each}
										</Select.Group>
									</Select.Content>
								</Select.Root>
							</div>

							<div class="space-y-2">
								<Label>Operation</Label>
								<div class="flex space-x-2">
									<Button
										variant={operation === 'encrypt' ? 'default' : 'outline'}
										onclick={() => (operation = 'encrypt')}
										class="flex-1"
									>
										<LockIcon class="mr-2 h-4 w-4" />
										Encrypt
									</Button>
									<Button
										variant={operation === 'decrypt' ? 'default' : 'outline'}
										onclick={() => (operation = 'decrypt')}
										class="flex-1"
									>
										<UnlockIcon class="mr-2 h-4 w-4" />
										Decrypt
									</Button>
								</div>
							</div>
						</div>

						{#if selectedCipher === 'caesar'}
							<div class="space-y-2">
								<Label for="caesar-shift">Caesar Shift (1-25)</Label>
								<Input
									id="caesar-shift"
									type="number"
									bind:value={caesarShift}
									min="1"
									max="25"
									placeholder="Enter shift value"
								/>
								<div class="text-xs text-muted-foreground">
									A shift of {caesarShift} means A becomes {String.fromCharCode(65 + (caesarShift % 26))}
								</div>
							</div>
						{/if}

						<Separator />

						<div class="flex space-x-2">
							<Button onclick={swapInputOutput} variant="outline" disabled={!outputText}>
								↑↓ Swap Input/Output
							</Button>
							<Button onclick={() => { inputText = ''; outputText = ''; }} variant="outline">
								Clear All
							</Button>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Input Text</CardTitle>
						<CardDescription>Enter the text you want to {operation}</CardDescription>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="space-y-2">
							<Label for="input-text">Text to {operation === 'encrypt' ? 'Encrypt' : 'Decrypt'}</Label>
							<Textarea
								id="input-text"
								bind:value={inputText}
								placeholder={operation === 'encrypt' 
									? 'Enter your plain text here...' 
									: selectedCipher === 'morse' 
										? 'Enter Morse code (.- -... -.-.)'
										: selectedCipher === 'binary'
											? 'Enter binary (01001000 01100101...)'
											: selectedCipher === 'iroha'
												? 'Enter coordinates (61 13 12...)'
												: 'Enter encrypted text here...'}
								rows={6}
								class="font-mono text-sm"
							/>
						</div>

						<div class="flex items-center justify-between text-sm text-muted-foreground">
							<span>
								{textStats().characters} characters, {textStats().words} words, {textStats().letters} letters
							</span>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Output Text</CardTitle>
						<CardDescription>
							{operation === 'encrypt' ? 'Encrypted' : 'Decrypted'} result using {cipherTriggerContent}
						</CardDescription>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="space-y-2">
							<Label for="output-text">
								{operation === 'encrypt' ? 'Encrypted' : 'Decrypted'} Text
							</Label>
							<Textarea
								id="output-text"
								bind:value={outputText}
								readonly
								placeholder="Output will appear here..."
								rows={6}
								class="font-mono text-sm"
							/>
						</div>

						<div class="flex items-center justify-between">
							<div class="text-sm text-muted-foreground">
								{outputStats().characters} characters, {outputStats().words} words, {outputStats().letters} letters
							</div>
							<Button onclick={copyOutput} disabled={!outputText} variant="outline" size="sm">
								<CopyIcon class="mr-2 h-3 w-3" />
								Copy Output
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>

			<div class="space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>Cipher Information</CardTitle>
						<CardDescription>Details about the selected cipher method</CardDescription>
					</CardHeader>
					<CardContent>
						{#each cipherOptions as cipher}
							{#if cipher.value === selectedCipher}
								<div class="space-y-3 text-sm">
									<div>
										<h4 class="font-medium">{cipher.label}</h4>
										<p class="text-muted-foreground">{cipher.description}</p>
									</div>

									{#if cipher.value === 'morse'}
										<div>
											<h5 class="font-medium">How it works:</h5>
											<p class="text-muted-foreground">
												Each letter is represented by dots (.) and dashes (-). 
												Words are separated by forward slashes (/).
											</p>
										</div>
									{:else if cipher.value === 'caesar'}
										<div>
											<h5 class="font-medium">How it works:</h5>
											<p class="text-muted-foreground">
												Each letter is shifted by {caesarShift} positions in the alphabet. 
												Numbers and special characters remain unchanged.
											</p>
										</div>
									{:else if cipher.value === 'rot13'}
										<div>
											<h5 class="font-medium">How it works:</h5>
											<p class="text-muted-foreground">
												A special case of Caesar cipher with a shift of 13. 
												Encryption and decryption use the same operation.
											</p>
										</div>
									{:else if cipher.value === 'binary'}
										<div>
											<h5 class="font-medium">How it works:</h5>
											<p class="text-muted-foreground">
												Each character is converted to its 8-bit binary representation 
												based on ASCII values.
											</p>
										</div>
									{:else if cipher.value === 'atbash'}
										<div>
											<h5 class="font-medium">How it works:</h5>
											<p class="text-muted-foreground">
												A substitution cipher where A↔Z, B↔Y, C↔X, etc. 
												One of the oldest known ciphers.
											</p>
										</div>
									{:else if cipher.value === 'uesugi'}
										<div>
											<h5 class="font-medium">How it works:</h5>
											<p class="text-muted-foreground">
												Historical Japanese cipher using kanji characters for substitution. 
												Used by the Uesugi clan during the Sengoku period (1500s-1600s).
											</p>
										</div>
									{:else if cipher.value === 'iroha'}
										<div>
											<h5 class="font-medium">How it works:</h5>
											<p class="text-muted-foreground">
												Traditional Japanese checkerboard cipher using the Iroha poem. 
												Each letter is converted to coordinates (row-column) in a 7×7 grid.
											</p>
										</div>
									{:else if cipher.value === 'reverse'}
										<div>
											<h5 class="font-medium">How it works:</h5>
											<p class="text-muted-foreground">
												Simply reverses the order of all characters in the text. 
												Encryption and decryption are identical.
											</p>
										</div>
									{/if}
								</div>
							{/if}
						{/each}
					</CardContent>
				</Card>

				{#if characterFrequency.length > 0}
					<Card>
						<CardHeader>
							<CardTitle>Character Frequency</CardTitle>
							<CardDescription>Most common letters in input text</CardDescription>
						</CardHeader>
						<CardContent>
							<div class="space-y-2">
								{#each characterFrequency() as { char, count, percentage }}
									<div class="flex items-center justify-between text-sm">
										<span class="font-mono font-medium">{char}</span>
										<div class="flex items-center space-x-2">
											<div class="text-muted-foreground">{count}×</div>
											<div class="w-12 text-right text-muted-foreground">{percentage}%</div>
										</div>
									</div>
								{/each}
							</div>
						</CardContent>
					</Card>
				{/if}

				<Card>
					<CardHeader>
						<CardTitle>Cipher Examples</CardTitle>
						<CardDescription>Quick reference for cipher formats</CardDescription>
					</CardHeader>
					<CardContent class="space-y-3 text-sm">
						<div>
							<h5 class="font-medium">Morse Code</h5>
							<p class="text-muted-foreground font-mono">SOS: ... --- ...</p>
						</div>
						
						<div>
							<h5 class="font-medium">Caesar (shift 3)</h5>
							<p class="text-muted-foreground font-mono">ABC → DEF</p>
						</div>
						
						<div>
							<h5 class="font-medium">ROT13</h5>
							<p class="text-muted-foreground font-mono">HELLO → URYYB</p>
						</div>
						
						<div>
							<h5 class="font-medium">Binary</h5>
							<p class="text-muted-foreground font-mono">A → 01000001</p>
						</div>
						
						<div>
							<h5 class="font-medium">Atbash</h5>
							<p class="text-muted-foreground font-mono">ABC → ZYX</p>
						</div>
						
						<div>
							<h5 class="font-medium">Uesugi</h5>
							<p class="text-muted-foreground font-mono">ABC → 上下左</p>
						</div>
						
						<div>
							<h5 class="font-medium">I-ro-ha</h5>
							<p class="text-muted-foreground font-mono">ABC → 61 13 12</p>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Features</CardTitle>
						<CardDescription>Text encryption capabilities</CardDescription>
					</CardHeader>
					<CardContent>
						<div class="space-y-2 text-sm">
							<p>• Multiple cipher methods</p>
							<p>• Bidirectional encryption/decryption</p>
							<p>• Real-time text processing</p>
							<p>• Character frequency analysis</p>
							<p>• Copy output to clipboard</p>
							<p>• Swap input/output functionality</p>
							<p>• Text statistics and analysis</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	{/snippet}
</PageContainer>