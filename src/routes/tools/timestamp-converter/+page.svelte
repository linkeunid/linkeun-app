<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import * as Command from '$lib/components/ui/command';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import PageContainer from '$lib/components/ui/page-container.svelte';
	import PageHeader from '$lib/components/ui/page-header.svelte';
	import * as Popover from '$lib/components/ui/popover';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import { Separator } from '$lib/components/ui/separator';
	import { cn } from '$lib/utils';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import CheckIcon from '@lucide/svelte/icons/check';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import ClockIcon from '@lucide/svelte/icons/clock';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import RefreshCwIcon from '@lucide/svelte/icons/refresh-cw';
	import { DateTime } from 'luxon';
	import { tick } from 'svelte';
	import { toast } from 'svelte-sonner';
	import * as chrono from 'chrono-node';

	let timestampInput = $state('');
	let dateTimeInput = $state('');
	let timestampResult = $state('');
	let dateTimeResult = $state('');
	let timestampUnit = $state<'seconds' | 'milliseconds' | 'microseconds' | 'nanoseconds'>(
		'seconds'
	);
	let timezone = $state('UTC');
	let userTimezone = $state(Intl.DateTimeFormat().resolvedOptions().timeZone);
	let dateFormat = $state('yyyy-MM-dd HH:mm:ss');
	let currentTime = $state(Date.now());

	// Get all available timezones from Intl API
	const timezones = Intl.supportedValuesOf('timeZone')
		.sort()
		.map((tz) => ({
			value: tz,
			label: tz
		}));

	// Timezone combobox state
	let timezoneOpen = $state(false);
	let timezoneTriggerRef = $state<HTMLButtonElement>(null!);

	const selectedTimezone = $derived(timezones.find((tz) => tz.value === timezone)?.label);

	function closeTimezoneAndFocus() {
		timezoneOpen = false;
		tick().then(() => {
			timezoneTriggerRef?.focus();
		});
	}

	const formats = [
		'yyyy-MM-dd HH:mm:ss',
		"yyyy-MM-dd'T'HH:mm:ss",
		"yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
		'MM/dd/yyyy HH:mm:ss',
		'dd/MM/yyyy HH:mm:ss',
		'yyyy-MM-dd',
		'MM/dd/yyyy',
		'dd/MM/yyyy',
		'cccc, MMMM d, yyyy H:mm:ss',
		'cccc, MMMM d, yyyy h:mm:ss a'
	];

	// Convert timestamp to milliseconds based on unit
	function timestampToMillis(timestamp: number): number {
		switch (timestampUnit) {
			case 'seconds':
				return timestamp * 1000;
			case 'milliseconds':
				return timestamp;
			case 'microseconds':
				return timestamp / 1000;
			case 'nanoseconds':
				return timestamp / 1000000;
			default:
				return timestamp;
		}
	}

	// Convert milliseconds to timestamp based on unit
	function millisToTimestamp(millis: number): number {
		switch (timestampUnit) {
			case 'seconds':
				return Math.floor(millis / 1000);
			case 'milliseconds':
				return millis;
			case 'microseconds':
				return millis * 1000;
			case 'nanoseconds':
				return millis * 1000000;
			default:
				return millis;
		}
	}

	// Parse natural language dates using chrono-node
	function parseNaturalLanguage(input: string, fallbackTz: string): { dt: DateTime | null, hasTimezone: boolean } {
		try {
			// Use chrono to parse natural language
			const results = chrono.parse(input, new Date());
			
			if (results.length > 0) {
				const parsedResult = results[0];
				const parsedDate = parsedResult.start.date();
				
				// Check if the original input contains timezone information
				const hasTimezoneInfo = /GMT[+-]\d+|UTC[+-]\d+|[A-Z]{3,4}$/i.test(input.trim()) || 
										parsedResult.start.get('timezoneOffset') !== undefined;
				
				if (hasTimezoneInfo) {
					// If timezone is specified in input, respect it
					return { dt: DateTime.fromJSDate(parsedDate), hasTimezone: true };
				} else {
					// If no timezone in input, apply the selected timezone
					return { dt: DateTime.fromJSDate(parsedDate, { zone: fallbackTz }), hasTimezone: false };
				}
			}
			
			return { dt: null, hasTimezone: false };
		} catch (error) {
			return { dt: null, hasTimezone: false };
		}
	}

	// Convert timestamp to datetime with multiple formats
	const timestampConversion = $derived(() => {
		const input = timestampInput.trim();
		if (!input) {
			return null;
		}

		// Check if input contains only digits (and optional decimal point for microseconds/nanoseconds)
		if (!/^\d+(\.\d+)?$/.test(input)) {
			return { error: 'Invalid timestamp format' };
		}

		try {
			const timestamp = parseFloat(input);
			if (isNaN(timestamp) || timestamp < 0) {
				return { error: 'Invalid timestamp' };
			}

			// Validate timestamp range based on unit
			const actualTimestamp = timestampToMillis(timestamp);

			// Check if the resulting timestamp is reasonable (between 1970 and 2100)
			if (actualTimestamp < 0 || actualTimestamp > 4102444800000) {
				return { error: 'Timestamp out of valid range' };
			}

			const gmtTime = DateTime.fromMillis(actualTimestamp, { zone: 'UTC' });
			const userTime = DateTime.fromMillis(actualTimestamp, { zone: userTimezone });
			const selectedTime = DateTime.fromMillis(actualTimestamp, { zone: timezone });

			if (!gmtTime.isValid) {
				return { error: 'Invalid timestamp' };
			}

			return {
				gmt: gmtTime.toFormat('cccc, MMMM d, yyyy h:mm:ss a') + ' GMT',
				userTz: userTime.toFormat('cccc, MMMM d, yyyy h:mm:ss a') + ' ' + userTime.toFormat('ZZZZ'),
				selected: selectedTime.toFormat(dateFormat),
				relative: gmtTime.toRelative(),
				seconds: Math.floor(actualTimestamp / 1000),
				milliseconds: actualTimestamp,
				microseconds: actualTimestamp * 1000,
				nanoseconds: actualTimestamp * 1000000
			};
		} catch (error) {
			return { error: 'Invalid timestamp' };
		}
	});

	// Update dateTimeResult for the input field
	$effect(() => {
		const result = timestampConversion();
		if (!result) {
			dateTimeResult = '';
		} else if (result.error) {
			dateTimeResult = result.error;
		} else {
			dateTimeResult = result.selected || '';
		}
	});

	// Detect format and convert datetime to timestamp
	const datetimeConversion = $derived(() => {
		const input = dateTimeInput.trim();
		if (!input) {
			return { result: '', detectedFormat: null };
		}

		try {
			let dt: DateTime | null = null;
			let detectedFormat: string | null = null;

			// First try the selected format
			dt = DateTime.fromFormat(input, dateFormat, { zone: timezone });
			if (dt.isValid) {
				detectedFormat = dateFormat;
			}

			if (!dt.isValid) {
				// Try all available formats and detect which one works
				for (const format of formats) {
					dt = DateTime.fromFormat(input, format, { zone: timezone });
					if (dt.isValid) {
						detectedFormat = format;
						break;
					}
				}
			}

			if (!dt.isValid) {
				// Try ISO format
				dt = DateTime.fromISO(input, { zone: timezone });
				if (dt.isValid) {
					detectedFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'";
				}
			}

			if (!dt?.isValid) {
				// Try natural language parsing with relative dates
				const naturalResult = parseNaturalLanguage(input, timezone);
				if (naturalResult.dt && naturalResult.dt.isValid) {
					dt = naturalResult.dt;
					detectedFormat = naturalResult.hasTimezone 
						? 'Natural language (with timezone)' 
						: 'Natural language';
				}
			}

			if (!dt?.isValid) {
				// Try JavaScript Date parsing as a final fallback
				const jsDate = new Date(input);
				if (!isNaN(jsDate.getTime())) {
					const jsDt = DateTime.fromJSDate(jsDate, { zone: timezone });
					if (jsDt.isValid) {
						dt = jsDt;
						detectedFormat = 'Natural language';
					}
				}
			}

			if (!dt?.isValid) {
				return { result: 'Invalid date format', detectedFormat: null };
			}

			const timestamp = millisToTimestamp(dt.toMillis());
			return { result: timestamp.toString(), detectedFormat };
		} catch (error) {
			return { result: 'Invalid date format', detectedFormat: null };
		}
	});

	// Auto-update date format when a valid format is detected
	$effect(() => {
		const conversion = datetimeConversion();
		if (conversion.detectedFormat && 
			!conversion.detectedFormat.includes('Natural language') && 
			formats.includes(conversion.detectedFormat) &&
			conversion.detectedFormat !== dateFormat) {
			dateFormat = conversion.detectedFormat;
		}
	});

	// Update timestampResult for the input field
	$effect(() => {
		timestampResult = datetimeConversion().result;
	});

	function setCurrentTimestamp() {
		const now = DateTime.now();
		const timestamp = millisToTimestamp(now.toMillis());
		timestampInput = timestamp.toString();
	}

	function setCurrentDateTime() {
		const now = DateTime.now().setZone(timezone);
		dateTimeInput = now.toFormat(dateFormat);
	}

	function clearAll() {
		timestampInput = '';
		dateTimeInput = '';
		timestampResult = '';
		dateTimeResult = '';
	}


	async function copyValue(value: string | number, label: string) {
		try {
			await navigator.clipboard.writeText(value.toString());
			toast.success(`${label} copied to clipboard!`);
		} catch (error) {
			toast.error('Failed to copy to clipboard');
		}
	}

	function swapInputs() {
		const tempTimestamp = timestampInput;
		const tempDateTime = dateTimeInput;
		timestampInput = timestampResult;
		dateTimeInput = dateTimeResult;
		timestampResult = tempTimestamp;
		dateTimeResult = tempDateTime;
	}

	// Update current time every second
	$effect(() => {
		const interval = setInterval(() => {
			currentTime = Date.now();
		}, 1000);

		return () => clearInterval(interval);
	});

	// Current time info with multiple timezones
	const currentInfo = $derived(() => {
		const nowUTC = DateTime.fromMillis(currentTime, { zone: 'UTC' });
		const nowLocal = DateTime.fromMillis(currentTime, { zone: userTimezone });
		const nowSelected = DateTime.fromMillis(currentTime, { zone: timezone });
		
		return {
			unix: Math.floor(nowUTC.toMillis() / 1000),
			unixMs: nowUTC.toMillis(),
			iso: nowUTC.toISO(),
			utc: {
				formatted: nowUTC.toFormat('cccc, MMMM d, yyyy h:mm:ss a') + ' GMT',
				short: nowUTC.toFormat(dateFormat)
			},
			local: {
				formatted: nowLocal.toFormat('cccc, MMMM d, yyyy h:mm:ss a') + ' ' + nowLocal.toFormat('ZZZZ'),
				short: nowLocal.toFormat(dateFormat),
				timezone: userTimezone
			},
			selected: {
				formatted: nowSelected.toFormat('cccc, MMMM d, yyyy h:mm:ss a') + ' ' + nowSelected.toFormat('ZZZZ'),
				short: nowSelected.toFormat(dateFormat),
				timezone: timezone
			},
			relative: 'now (live updating)'
		};
	});
</script>

<PageHeader
	title="Timestamp Converter"
	subtitle="Convert between Unix timestamps and human-readable dates"
	icon={ClockIcon}
/>

<PageContainer>
	{#snippet children()}
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
			<div class="space-y-6 lg:col-span-2">
				<Card>
					<CardHeader>
						<CardTitle>Settings</CardTitle>
						<CardDescription>Configure conversion options</CardDescription>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="space-y-2">
							<Label for="timezone">Timezone</Label>
							<Popover.Root bind:open={timezoneOpen}>
								<Popover.Trigger bind:ref={timezoneTriggerRef}>
									{#snippet child({ props })}
										<Button
											{...props}
											variant="outline"
											class="w-full justify-between"
											role="combobox"
											aria-expanded={timezoneOpen}
										>
											{selectedTimezone || 'Select timezone...'}
											<ChevronsUpDownIcon class="h-4 w-4 opacity-50" />
										</Button>
									{/snippet}
								</Popover.Trigger>
								<Popover.Content class="w-full p-0">
									<Command.Root>
										<Command.Input placeholder="Search timezone..." />
										<Command.List>
											<Command.Empty>No timezone found.</Command.Empty>
											<Command.Group>
												{#each timezones as tz (tz.value)}
													<Command.Item
														value={tz.value}
														onSelect={() => {
															timezone = tz.value;
															closeTimezoneAndFocus();
														}}
													>
														<CheckIcon
															class={cn(
																'mr-2 h-4 w-4',
																timezone !== tz.value && 'text-transparent'
															)}
														/>
														{tz.label}
													</Command.Item>
												{/each}
											</Command.Group>
										</Command.List>
									</Command.Root>
								</Popover.Content>
							</Popover.Root>
						</div>

						<div class="space-y-2">
							<Label>Timestamp Unit</Label>
							<RadioGroup.Root bind:value={timestampUnit}>
								<div class="grid grid-cols-2 gap-2">
									<div class="flex items-center space-x-2">
										<RadioGroup.Item value="seconds" id="seconds" />
										<Label for="seconds" class="text-sm">Seconds</Label>
									</div>
									<div class="flex items-center space-x-2">
										<RadioGroup.Item value="milliseconds" id="milliseconds" />
										<Label for="milliseconds" class="text-sm">Milliseconds</Label>
									</div>
									<div class="flex items-center space-x-2">
										<RadioGroup.Item value="microseconds" id="microseconds" />
										<Label for="microseconds" class="text-sm">Microseconds</Label>
									</div>
									<div class="flex items-center space-x-2">
										<RadioGroup.Item value="nanoseconds" id="nanoseconds" />
										<Label for="nanoseconds" class="text-sm">Nanoseconds</Label>
									</div>
								</div>
							</RadioGroup.Root>
						</div>

						<Separator />

						<div class="flex flex-wrap gap-2">
							<Button onclick={setCurrentTimestamp}>
								<ClockIcon class="mr-2 h-4 w-4" />
								Current Timestamp
							</Button>

							<Button onclick={setCurrentDateTime}>
								<CalendarIcon class="mr-2 h-4 w-4" />
								Current Date/Time
							</Button>

							<Button
								variant="outline"
								onclick={swapInputs}
								disabled={!timestampResult && !dateTimeResult}
							>
								<RefreshCwIcon class="mr-2 h-4 w-4" />
								Swap Results
							</Button>

							<Button
								variant="outline"
								onclick={clearAll}
								disabled={!timestampInput && !dateTimeInput}
							>
								Clear All
							</Button>
						</div>
					</CardContent>
				</Card>

				<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
					<Card>
						<CardHeader>
							<CardTitle>Timestamp to Date</CardTitle>
							<CardDescription>Convert Unix timestamp to human-readable date</CardDescription>
						</CardHeader>
						<CardContent class="space-y-4">
							<div class="space-y-2">
								<Label for="timestamp-input">Unix Timestamp ({timestampUnit})</Label>
								<Input
									id="timestamp-input"
									bind:value={timestampInput}
									placeholder={timestampUnit === 'seconds'
										? '1710000000'
										: timestampUnit === 'milliseconds'
											? '1710000000000'
											: timestampUnit === 'microseconds'
												? '1710000000000000'
												: '1710000000000000000'}
									type="text"
									autocomplete="off"
									class={timestampInput && timestampConversion()?.error
										? 'border-red-500'
										: timestampInput && timestampConversion() && !timestampConversion()?.error
											? 'border-green-500'
											: ''}
								/>
								{#if timestampInput && timestampConversion()?.error}
									<p class="text-sm text-red-600">{timestampConversion()?.error}</p>
								{/if}
							</div>

							{#if timestampConversion()}
								{@const result = timestampConversion()}
								{#if result && !result.error}
									<div class="bg-muted space-y-3 rounded-lg p-4">
										<div class="space-y-2">
											<div>
												<p class="text-sm font-medium">GMT:</p>
												<p class="text-muted-foreground text-sm">{result.gmt}</p>
											</div>

											<div>
												<p class="text-sm font-medium">Your time zone:</p>
												<p class="text-muted-foreground text-sm">{result.userTz}</p>
											</div>

											<div>
												<p class="text-sm font-medium">Relative:</p>
												<p class="text-muted-foreground text-sm">{result.relative}</p>
											</div>
										</div>

										<Separator />

										<div class="grid grid-cols-2 gap-4 text-sm">
											<div class="flex items-center justify-between">
												<div>
													<p class="font-medium">Seconds:</p>
													<p class="text-muted-foreground font-mono">{result.seconds}</p>
												</div>
												<Button
													variant="ghost"
													size="sm"
													onclick={() => copyValue(result.seconds || 0, 'Seconds')}
													class="h-6 w-6 p-0"
												>
													<CopyIcon class="h-3 w-3" />
												</Button>
											</div>
											<div class="flex items-center justify-between">
												<div>
													<p class="font-medium">Milliseconds:</p>
													<p class="text-muted-foreground font-mono">{result.milliseconds}</p>
												</div>
												<Button
													variant="ghost"
													size="sm"
													onclick={() => copyValue(result.milliseconds || 0, 'Milliseconds')}
													class="h-6 w-6 p-0"
												>
													<CopyIcon class="h-3 w-3" />
												</Button>
											</div>
											<div class="flex items-center justify-between">
												<div>
													<p class="font-medium">Microseconds:</p>
													<p class="text-muted-foreground font-mono">
														{Math.floor(result.microseconds || 0)}
													</p>
												</div>
												<Button
													variant="ghost"
													size="sm"
													onclick={() =>
														copyValue(Math.floor(result.microseconds || 0), 'Microseconds')}
													class="h-6 w-6 p-0"
												>
													<CopyIcon class="h-3 w-3" />
												</Button>
											</div>
											<div class="flex items-center justify-between">
												<div>
													<p class="font-medium">Nanoseconds:</p>
													<p class="text-muted-foreground font-mono">
														{Math.floor(result.nanoseconds || 0)}
													</p>
												</div>
												<Button
													variant="ghost"
													size="sm"
													onclick={() =>
														copyValue(Math.floor(result.nanoseconds || 0), 'Nanoseconds')}
													class="h-6 w-6 p-0"
												>
													<CopyIcon class="h-3 w-3" />
												</Button>
											</div>
										</div>
									</div>
								{:else if result?.error}
									<div class="rounded-lg border border-red-200 bg-red-50 p-4">
										<p class="text-sm text-red-600">{result.error}</p>
									</div>
								{/if}
							{/if}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Date to Timestamp</CardTitle>
							<CardDescription>Convert human-readable date to Unix timestamp with smart format detection</CardDescription>
						</CardHeader>
						<CardContent class="space-y-4">
							<div class="space-y-2">
								<Label for="datetime-input">Date/Time Input</Label>
								<Input 
									id="datetime-input" 
									bind:value={dateTimeInput} 
									placeholder="tomorrow, in 3 days, 2025-07-12 14:34:28, Saturday July 12 2025"
									class={dateTimeInput && datetimeConversion().detectedFormat && datetimeConversion().result !== 'Invalid date format' ? 'border-green-500' : 
										   dateTimeInput && datetimeConversion().result === 'Invalid date format' ? 'border-red-500' : ''}
								/>
							</div>

							{#if dateTimeInput}
								{@const conversion = datetimeConversion()}
								{#if conversion.result !== 'Invalid date format' && conversion.detectedFormat}
									<div class="bg-muted space-y-3 rounded-lg p-4">
										<div class="space-y-2">
											<div>
												<p class="text-sm font-medium">Detected Format:</p>
												<p class="text-sm text-muted-foreground">
													{conversion.detectedFormat?.includes('Natural language') ? 
														(conversion.detectedFormat.includes('timezone') ? '🧠 Natural language (timezone aware)' : '🧠 Natural language parsing') 
														: `📝 ${conversion.detectedFormat}`}
												</p>
											</div>
											
											<div>
												<p class="text-sm font-medium">Parsed Date:</p>
												<p class="text-sm text-muted-foreground">
													{DateTime.fromMillis(millisToTimestamp(parseFloat(conversion.result)) * (timestampUnit === 'seconds' ? 1000 : timestampUnit === 'milliseconds' ? 1 : timestampUnit === 'microseconds' ? 0.001 : 0.000001)).toFormat('cccc, MMMM d, yyyy h:mm:ss a ZZZZ')}
												</p>
											</div>

											<div>
												<p class="text-sm font-medium">Timezone Source:</p>
												<p class="text-sm text-muted-foreground">
													{conversion.detectedFormat?.includes('timezone') ? 
														'🌍 Detected from input text' : 
														`⚙️ Applied from settings (${timezone})`}
												</p>
											</div>
										</div>
										
										<Separator />
										
										<div class="flex justify-between items-center">
											<div>
												<p class="text-sm font-medium">Generated Timestamp ({timestampUnit}):</p>
												<p class="text-sm text-muted-foreground font-mono">{conversion.result}</p>
											</div>
											<Button
												variant="ghost"
												size="sm"
												onclick={() => copyValue(conversion.result, 'Timestamp')}
												class="h-6 w-6 p-0"
											>
												<CopyIcon class="h-3 w-3" />
											</Button>
										</div>
									</div>
								{:else if conversion.result === 'Invalid date format'}
									<div class="rounded-lg border border-red-200 bg-red-50 p-4">
										<p class="text-sm text-red-600 mb-2">✗ Could not parse the date format</p>
										<p class="text-xs text-red-500">Try formats like:</p>
										<ul class="text-xs text-red-500 mt-1 ml-4 list-disc">
											<li>Natural: "tomorrow", "in 3 days", "next week"</li>
											<li>Standard: "2025-07-12 14:34:28"</li>
											<li>Readable: "Saturday, July 12, 2025 2:34:28"</li>
											<li>US format: "07/12/2025 14:34:28"</li>
										</ul>
									</div>
								{/if}
							{:else}
								<div class="bg-muted rounded-lg p-4">
									<p class="text-sm text-muted-foreground mb-2">💡 Smart format detection supports:</p>
									<ul class="text-xs text-muted-foreground ml-4 list-disc space-y-1">
										<li><strong>Natural language:</strong> "tomorrow", "in 3 days", "next Friday"</li>
										<li><strong>ISO format:</strong> "2025-07-12T14:34:28Z"</li>
										<li><strong>Human readable:</strong> "Saturday, July 12, 2025 2:34:28"</li>
										<li><strong>Standard formats:</strong> "2025-07-12 14:34:28", "07/12/2025"</li>
										<li><strong>And many more...</strong> Just type and it will auto-detect!</li>
									</ul>
								</div>
							{/if}
						</CardContent>
					</Card>
				</div>
			</div>

			<div class="space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>Current Time</CardTitle>
						<CardDescription>Live current time information</CardDescription>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="space-y-3 text-sm">
							<div class="flex justify-between items-center">
								<div>
									<p class="font-medium">Unix Timestamp (seconds)</p>
									<p class="text-muted-foreground font-mono">{currentInfo().unix}</p>
								</div>
								<Button
									variant="ghost"
									size="sm"
									onclick={() => copyValue(currentInfo().unix, 'Unix timestamp (seconds)')}
									class="h-6 w-6 p-0"
								>
									<CopyIcon class="h-3 w-3" />
								</Button>
							</div>

							<div class="flex justify-between items-center">
								<div>
									<p class="font-medium">Unix Timestamp (milliseconds)</p>
									<p class="text-muted-foreground font-mono">{currentInfo().unixMs}</p>
								</div>
								<Button
									variant="ghost"
									size="sm"
									onclick={() => copyValue(currentInfo().unixMs, 'Unix timestamp (milliseconds)')}
									class="h-6 w-6 p-0"
								>
									<CopyIcon class="h-3 w-3" />
								</Button>
							</div>

							<div class="flex justify-between items-center">
								<div class="flex-1">
									<p class="font-medium">ISO 8601 (UTC)</p>
									<p class="text-muted-foreground font-mono break-all">{currentInfo().iso}</p>
								</div>
								<Button
									variant="ghost"
									size="sm"
									onclick={() => copyValue(currentInfo().iso || '', 'ISO 8601')}
									class="h-6 w-6 p-0 ml-2"
								>
									<CopyIcon class="h-3 w-3" />
								</Button>
							</div>
						</div>

						<Separator />

						<div class="space-y-3 text-sm">
							<div class="flex justify-between items-start">
								<div class="flex-1">
									<p class="font-medium flex items-center gap-2">
										<span>GMT/UTC</span>
										<span class="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">UTC</span>
									</p>
									<p class="text-muted-foreground">{currentInfo().utc.formatted}</p>
								</div>
								<Button
									variant="ghost"
									size="sm"
									onclick={() => copyValue(currentInfo().utc.formatted, 'GMT/UTC time')}
									class="h-6 w-6 p-0"
								>
									<CopyIcon class="h-3 w-3" />
								</Button>
							</div>

							<div class="flex justify-between items-start">
								<div class="flex-1">
									<p class="font-medium flex items-center gap-2">
										<span>Your Local Time</span>
										<span class="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">{currentInfo().local.timezone}</span>
									</p>
									<p class="text-muted-foreground">{currentInfo().local.formatted}</p>
								</div>
								<Button
									variant="ghost"
									size="sm"
									onclick={() => copyValue(currentInfo().local.formatted, 'Local time')}
									class="h-6 w-6 p-0"
								>
									<CopyIcon class="h-3 w-3" />
								</Button>
							</div>

							{#if timezone !== 'UTC' && timezone !== userTimezone}
								<div class="flex justify-between items-start">
									<div class="flex-1">
										<p class="font-medium flex items-center gap-2">
											<span>Selected Timezone</span>
											<span class="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">{currentInfo().selected.timezone}</span>
										</p>
										<p class="text-muted-foreground">{currentInfo().selected.formatted}</p>
									</div>
									<Button
										variant="ghost"
										size="sm"
										onclick={() => copyValue(currentInfo().selected.formatted, 'Selected timezone time')}
										class="h-6 w-6 p-0"
									>
										<CopyIcon class="h-3 w-3" />
									</Button>
								</div>
							{/if}

							<div>
								<p class="font-medium">Relative</p>
								<p class="text-muted-foreground">{currentInfo().relative}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Information</CardTitle>
						<CardDescription>About Unix timestamps</CardDescription>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="space-y-3 text-sm">
							<div>
								<h4 class="font-medium">What is Unix Time?</h4>
								<p class="text-muted-foreground">
									Unix time is the number of seconds (or milliseconds) since January 1, 1970,
									00:00:00 UTC.
								</p>
							</div>

							<div>
								<h4 class="font-medium">Common Uses</h4>
								<ul class="text-muted-foreground list-inside list-disc space-y-1">
									<li>Database timestamps</li>
									<li>API responses</li>
									<li>Log files</li>
									<li>System events</li>
									<li>Expiration times</li>
								</ul>
							</div>

							<div>
								<h4 class="font-medium">Formats</h4>
								<p class="text-muted-foreground">Seconds: 10 digits, Milliseconds: 13 digits</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Examples</CardTitle>
						<CardDescription>Common timestamp examples</CardDescription>
					</CardHeader>
					<CardContent>
						<div class="space-y-3 text-sm">
							<div>
								<p class="font-medium">Unix Epoch</p>
								<p class="text-muted-foreground">0 = 1970-01-01 00:00:00 UTC</p>
							</div>

							<div>
								<p class="font-medium">Y2K</p>
								<p class="text-muted-foreground">946684800 = 2000-01-01 00:00:00 UTC</p>
							</div>

							<div>
								<p class="font-medium">Current Era</p>
								<p class="text-muted-foreground">1700000000 ≈ 2023-11-14</p>
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
							<p>• Timestamps are timezone-independent</p>
							<p>• Choose appropriate precision (seconds vs milliseconds)</p>
							<p>• Consider timezone when displaying to users</p>
							<p>• Use ISO 8601 for data exchange</p>
							<p>• Validate timestamp ranges for your use case</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	{/snippet}
</PageContainer>
