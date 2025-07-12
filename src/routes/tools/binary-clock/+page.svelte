<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import PageContainer from '$lib/components/ui/page-container.svelte';
	import PageHeader from '$lib/components/ui/page-header.svelte';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Separator } from '$lib/components/ui/separator';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import ClockIcon from '@lucide/svelte/icons/clock';
	import PauseIcon from '@lucide/svelte/icons/pause';
	import PlayIcon from '@lucide/svelte/icons/play';
	import { onMount, onDestroy } from 'svelte';

	// State
	let currentTime = $state(new Date());
	let isRunning = $state(true);
	let showLabels = $state(true);
	let showSeconds = $state(true);
	let use24Hour = $state(true);
	let dotSize = $state('medium');
	let colorScheme = $state('blue');
	let showBinaryValues = $state(true);
	let showDecimalTime = $state(true);

	// Timer
	let timer: ReturnType<typeof setInterval> | null = null;

	// Options
	const dotSizeOptions = [
		{ value: 'small', label: 'Small' },
		{ value: 'medium', label: 'Medium' },
		{ value: 'large', label: 'Large' }
	];

	const colorSchemeOptions = [
		{ value: 'blue', label: 'Blue', onColor: 'bg-blue-500', offColor: 'bg-blue-100 dark:bg-blue-900/30' },
		{ value: 'green', label: 'Green', onColor: 'bg-green-500', offColor: 'bg-green-100 dark:bg-green-900/30' },
		{ value: 'red', label: 'Red', onColor: 'bg-red-500', offColor: 'bg-red-100 dark:bg-red-900/30' },
		{ value: 'purple', label: 'Purple', onColor: 'bg-purple-500', offColor: 'bg-purple-100 dark:bg-purple-900/30' },
		{ value: 'amber', label: 'Amber', onColor: 'bg-amber-500', offColor: 'bg-amber-100 dark:bg-amber-900/30' },
		{ value: 'cyan', label: 'Cyan', onColor: 'bg-cyan-500', offColor: 'bg-cyan-100 dark:bg-cyan-900/30' }
	];

	const dotSizeTriggerContent = $derived(
		dotSizeOptions.find((s) => s.value === dotSize)?.label ?? 'Select size'
	);

	const colorSchemeTriggerContent = $derived(
		colorSchemeOptions.find((c) => c.value === colorScheme)?.label ?? 'Select color'
	);

	const currentColorScheme = $derived(
		colorSchemeOptions.find((c) => c.value === colorScheme) || colorSchemeOptions[0]
	);

	// Binary conversion functions
	function toBinary(num: number, bits: number): string {
		return num.toString(2).padStart(bits, '0');
	}

	function getBinaryArray(num: number, bits: number): boolean[] {
		const binary = toBinary(num, bits);
		return binary.split('').map(bit => bit === '1');
	}

	// Time calculations
	const timeData = $derived(() => {
		const hours = use24Hour ? currentTime.getHours() : currentTime.getHours() % 12 || 12;
		const minutes = currentTime.getMinutes();
		const seconds = currentTime.getSeconds();

		return {
			hours: {
				value: hours,
				tens: Math.floor(hours / 10),
				ones: hours % 10,
				binary: toBinary(hours, use24Hour ? 5 : 4),
				binaryArray: getBinaryArray(hours, use24Hour ? 5 : 4)
			},
			minutes: {
				value: minutes,
				tens: Math.floor(minutes / 10),
				ones: minutes % 10,
				binary: toBinary(minutes, 6),
				binaryArray: getBinaryArray(minutes, 6)
			},
			seconds: {
				value: seconds,
				tens: Math.floor(seconds / 10),
				ones: seconds % 10,
				binary: toBinary(seconds, 6),
				binaryArray: getBinaryArray(seconds, 6)
			}
		};
	});

	// Decimal time display
	const decimalTimeDisplay = $derived(() => {
		const hours = use24Hour ? currentTime.getHours() : currentTime.getHours() % 12 || 12;
		const minutes = currentTime.getMinutes().toString().padStart(2, '0');
		const seconds = currentTime.getSeconds().toString().padStart(2, '0');
		const ampm = use24Hour ? '' : (currentTime.getHours() >= 12 ? ' PM' : ' AM');
		
		if (showSeconds) {
			return `${hours}:${minutes}:${seconds}${ampm}`;
		} else {
			return `${hours}:${minutes}${ampm}`;
		}
	});

	// Dot size classes
	const dotSizeClasses = $derived(() => {
		switch (dotSize) {
			case 'small':
				return 'w-3 h-3';
			case 'large':
				return 'w-6 h-6';
			default:
				return 'w-4 h-4';
		}
	});

	// Update time
	function updateTime(): void {
		currentTime = new Date();
	}

	function toggleClock(): void {
		isRunning = !isRunning;
		if (isRunning) {
			startTimer();
		} else {
			stopTimer();
		}
	}

	function startTimer(): void {
		if (timer) clearInterval(timer);
		timer = setInterval(updateTime, 1000);
	}

	function stopTimer(): void {
		if (timer) {
			clearInterval(timer);
			timer = null;
		}
	}

	// Lifecycle
	onMount(() => {
		updateTime();
		if (isRunning) {
			startTimer();
		}
	});

	onDestroy(() => {
		stopTimer();
	});


	// Format explanation
	const binaryExplanation = $derived(() => {
		const data = timeData();
		const explanations = [];
		
		explanations.push(`Hours (${data.hours.value}): ${data.hours.binary}`);
		explanations.push(`Minutes (${data.minutes.value}): ${data.minutes.binary}`);
		if (showSeconds) {
			explanations.push(`Seconds (${data.seconds.value}): ${data.seconds.binary}`);
		}
		
		return explanations;
	});
</script>

<PageHeader
	title="Binary Clock"
	subtitle="Display current time in binary format with customizable LED-style indicators"
	icon={ClockIcon}
/>

<PageContainer>
	{#snippet children()}
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
			<div class="space-y-6 lg:col-span-2">
				<!-- Digital Time Display -->
				{#if showDecimalTime}
					<Card>
						<CardHeader>
							<CardTitle>Current Time</CardTitle>
							<CardDescription>Standard digital time display</CardDescription>
						</CardHeader>
						<CardContent>
							<div class="text-center">
								<div class="text-4xl md:text-6xl font-mono font-bold text-primary">
									{decimalTimeDisplay()}
								</div>
								<div class="text-sm text-muted-foreground mt-2">
									{currentTime.toLocaleDateString('en-US', { 
										weekday: 'long', 
										year: 'numeric', 
										month: 'long', 
										day: 'numeric' 
									})}
								</div>
							</div>
						</CardContent>
					</Card>
				{/if}

				<!-- Binary Clock Display -->
				<Card>
					<CardHeader>
						<CardTitle>Binary Clock</CardTitle>
						<CardDescription>Time displayed in binary format</CardDescription>
					</CardHeader>
					<CardContent>
						<div class="space-y-6">
							<!-- Binary Time Display -->
							<div class="bg-black dark:bg-gray-900 rounded-lg p-6">
								<div class="flex justify-center items-center space-x-8">
									<!-- Hours -->
									<div class="text-center">
										{#if showLabels}
											<div class="text-xs text-gray-400 mb-2 font-mono">
												HOURS ({timeData().hours.value})
											</div>
										{/if}
										<div class="flex flex-col space-y-2">
											{#each Array(timeData().hours.binaryArray.length) as _, bitIndex}
												<div 
													class="{dotSizeClasses()} {timeData().hours.binaryArray[bitIndex] ? currentColorScheme.onColor : currentColorScheme.offColor} rounded-full transition-all duration-200"
												></div>
											{/each}
										</div>
										{#if showBinaryValues}
											<div class="text-xs text-gray-400 mt-2 font-mono">
												{timeData().hours.binary}
											</div>
										{/if}
									</div>

									<!-- Separator -->
									<div class="flex flex-col space-y-2">
										{#each Array(2) as _}
											<div class="w-2 h-2 bg-gray-600 rounded-full"></div>
										{/each}
									</div>

									<!-- Minutes -->
									<div class="text-center">
										{#if showLabels}
											<div class="text-xs text-gray-400 mb-2 font-mono">
												MINUTES ({timeData().minutes.value})
											</div>
										{/if}
										<div class="flex flex-col space-y-2">
											{#each Array(timeData().minutes.binaryArray.length) as _, bitIndex}
												<div 
													class="{dotSizeClasses()} {timeData().minutes.binaryArray[bitIndex] ? currentColorScheme.onColor : currentColorScheme.offColor} rounded-full transition-all duration-200"
												></div>
											{/each}
										</div>
										{#if showBinaryValues}
											<div class="text-xs text-gray-400 mt-2 font-mono">
												{timeData().minutes.binary}
											</div>
										{/if}
									</div>

									{#if showSeconds}
										<!-- Separator -->
										<div class="flex flex-col space-y-2">
											{#each Array(2) as _}
												<div class="w-2 h-2 bg-gray-600 rounded-full"></div>
											{/each}
										</div>

										<!-- Seconds -->
										<div class="text-center">
											{#if showLabels}
												<div class="text-xs text-gray-400 mb-2 font-mono">
													SECONDS ({timeData().seconds.value})
												</div>
											{/if}
											<div class="flex flex-col space-y-2">
												{#each Array(timeData().seconds.binaryArray.length) as _, bitIndex}
													<div 
														class="{dotSizeClasses()} {timeData().seconds.binaryArray[bitIndex] ? currentColorScheme.onColor : currentColorScheme.offColor} rounded-full transition-all duration-200"
													></div>
												{/each}
											</div>
											{#if showBinaryValues}
												<div class="text-xs text-gray-400 mt-2 font-mono">
													{timeData().seconds.binary}
												</div>
											{/if}
										</div>
									{/if}
								</div>
							</div>

							<!-- Binary Explanation -->
							{#if showBinaryValues}
								<div class="bg-muted/50 rounded-lg p-4">
									<h4 class="font-medium mb-2">Binary Representation</h4>
									<div class="space-y-1 text-sm font-mono">
										{#each binaryExplanation() as explanation}
											<div class="text-muted-foreground">{explanation}</div>
										{/each}
									</div>
								</div>
							{/if}

							<!-- Control Buttons -->
							<div class="flex justify-center space-x-4">
								<Button onclick={toggleClock} variant="outline">
									{#if isRunning}
										<PauseIcon class="mr-2 h-4 w-4" />
										Pause
									{:else}
										<PlayIcon class="mr-2 h-4 w-4" />
										Start
									{/if}
								</Button>
								<Button onclick={updateTime} variant="outline" disabled={isRunning}>
									Update Now
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>

				<!-- Settings -->
				<Card>
					<CardHeader>
						<CardTitle>Clock Settings</CardTitle>
						<CardDescription>Customize the binary clock appearance and behavior</CardDescription>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div class="space-y-2">
								<Label>Dot Size</Label>
								<Select.Root type="single" name="dotSize" bind:value={dotSize}>
									<Select.Trigger class="w-full">
										{dotSizeTriggerContent}
									</Select.Trigger>
									<Select.Content>
										<Select.Group>
											<Select.Label>Dot Sizes</Select.Label>
											{#each dotSizeOptions as size (size.value)}
												<Select.Item value={size.value} label={size.label}>
													{size.label}
												</Select.Item>
											{/each}
										</Select.Group>
									</Select.Content>
								</Select.Root>
							</div>

							<div class="space-y-2">
								<Label>Color Scheme</Label>
								<Select.Root type="single" name="colorScheme" bind:value={colorScheme}>
									<Select.Trigger class="w-full">
										{colorSchemeTriggerContent}
									</Select.Trigger>
									<Select.Content>
										<Select.Group>
											<Select.Label>Colors</Select.Label>
											{#each colorSchemeOptions as color (color.value)}
												<Select.Item value={color.value} label={color.label}>
													<div class="flex items-center space-x-2">
														<div class="w-3 h-3 rounded-full {color.onColor}"></div>
														<span>{color.label}</span>
													</div>
												</Select.Item>
											{/each}
										</Select.Group>
									</Select.Content>
								</Select.Root>
							</div>
						</div>

						<Separator />

						<div class="space-y-3">
							<div class="flex items-center space-x-2">
								<Checkbox bind:checked={use24Hour} id="use-24-hour" />
								<Label for="use-24-hour">Use 24-hour format</Label>
							</div>

							<div class="flex items-center space-x-2">
								<Checkbox bind:checked={showSeconds} id="show-seconds" />
								<Label for="show-seconds">Show seconds</Label>
							</div>

							<div class="flex items-center space-x-2">
								<Checkbox bind:checked={showLabels} id="show-labels" />
								<Label for="show-labels">Show time unit labels</Label>
							</div>

							<div class="flex items-center space-x-2">
								<Checkbox bind:checked={showBinaryValues} id="show-binary-values" />
								<Label for="show-binary-values">Show binary values</Label>
							</div>

							<div class="flex items-center space-x-2">
								<Checkbox bind:checked={showDecimalTime} id="show-decimal-time" />
								<Label for="show-decimal-time">Show digital time</Label>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<div class="space-y-6">
				<!-- How Binary Clock Works -->
				<Card>
					<CardHeader>
						<CardTitle>How It Works</CardTitle>
						<CardDescription>Understanding binary time representation</CardDescription>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="space-y-3 text-sm">
							<div>
								<h4 class="font-medium">Binary System</h4>
								<p class="text-muted-foreground">
									Each time unit (hours, minutes, seconds) is converted to binary (base-2) representation using only 0s and 1s.
								</p>
							</div>

							<div>
								<h4 class="font-medium">LED Display</h4>
								<p class="text-muted-foreground">
									Lit dots represent "1" bits, dark dots represent "0" bits. Read from top to bottom for each time unit.
								</p>
							</div>

							<div>
								<h4 class="font-medium">Bit Layout</h4>
								<p class="text-muted-foreground">
									Hours: {use24Hour ? '5' : '4'} bits (0-{use24Hour ? '23' : '12'})<br>
									Minutes: 6 bits (0-59)<br>
									Seconds: 6 bits (0-59)
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<!-- Binary Reference -->
				<Card>
					<CardHeader>
						<CardTitle>Binary Reference</CardTitle>
						<CardDescription>Common time values in binary</CardDescription>
					</CardHeader>
					<CardContent>
						<div class="space-y-2 text-sm font-mono">
							<div class="grid grid-cols-2 gap-4">
								<div>
									<h5 class="font-medium text-xs mb-1">DECIMAL</h5>
									<div class="space-y-1">
										<div>0</div>
										<div>1</div>
										<div>5</div>
										<div>10</div>
										<div>15</div>
										<div>30</div>
										<div>59</div>
									</div>
								</div>
								<div>
									<h5 class="font-medium text-xs mb-1">BINARY</h5>
									<div class="space-y-1 text-muted-foreground">
										<div>000000</div>
										<div>000001</div>
										<div>000101</div>
										<div>001010</div>
										<div>001111</div>
										<div>011110</div>
										<div>111011</div>
									</div>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				<!-- Features -->
				<Card>
					<CardHeader>
						<CardTitle>Features</CardTitle>
						<CardDescription>Binary clock capabilities</CardDescription>
					</CardHeader>
					<CardContent>
						<div class="space-y-2 text-sm">
							<p>• Real-time binary time display</p>
							<p>• Multiple color schemes</p>
							<p>• Adjustable dot sizes</p>
							<p>• 12/24 hour format support</p>
							<p>• Optional seconds display</p>
							<p>• Binary value explanations</p>
							<p>• Pause/resume functionality</p>
							<p>• Customizable labels and indicators</p>
						</div>
					</CardContent>
				</Card>

				<!-- Use Cases -->
				<Card>
					<CardHeader>
						<CardTitle>Use Cases</CardTitle>
						<CardDescription>When to use a binary clock</CardDescription>
					</CardHeader>
					<CardContent>
						<div class="space-y-2 text-sm">
							<p>• Learning binary number system</p>
							<p>• Computer science education</p>
							<p>• Geek/tech enthusiast displays</p>
							<p>• Unique desktop wallpapers</p>
							<p>• Programming practice projects</p>
							<p>• Digital art installations</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	{/snippet}
</PageContainer>