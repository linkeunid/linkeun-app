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
	import { Separator } from '$lib/components/ui/separator';
	import { Switch } from '$lib/components/ui/switch';
	import { Slider } from '$lib/components/ui/slider/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import PageContainer from '$lib/components/ui/page-container.svelte';
	import PageHeader from '$lib/components/ui/page-header.svelte';
	import CheckIcon from '@lucide/svelte/icons/check';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import KeyIcon from '@lucide/svelte/icons/key';
	import RefreshCwIcon from '@lucide/svelte/icons/refresh-cw';
	import ShieldAlertIcon from '@lucide/svelte/icons/shield-alert';
	import ShieldCheckIcon from '@lucide/svelte/icons/shield-check';
	import XIcon from '@lucide/svelte/icons/x';
	import { useBreachCheck } from '$lib/hooks/breach-check';
	import { toast } from 'svelte-sonner';

	// Password generation settings
	let length = $state(16);
	let includeUppercase = $state(true);
	let includeLowercase = $state(true);
	let includeNumbers = $state(true);
	let includeSymbols = $state(true);
	let excludeSimilar = $state(true);
	let generatedPassword = $state('');

	// Character sets
	const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	const lowercase = 'abcdefghijklmnopqrstuvwxyz';
	const numbers = '0123456789';
	const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
	const similar = 'il1Lo0O';

	// Password strength calculation
	const passwordStrength = $derived(() => {
		if (!generatedPassword) return { score: 0, label: 'None', color: 'text-muted-foreground' };

		let score = 0;
		const password = generatedPassword;

		// Length points
		if (password.length >= 12) score += 2;
		else if (password.length >= 8) score += 1;

		// Character variety points
		if (/[a-z]/.test(password)) score += 1;
		if (/[A-Z]/.test(password)) score += 1;
		if (/[0-9]/.test(password)) score += 1;
		if (/[^a-zA-Z0-9]/.test(password)) score += 1;

		// Bonus for longer passwords
		if (password.length >= 16) score += 1;
		if (password.length >= 20) score += 1;

		if (score <= 2) return { score, label: 'Weak', color: 'text-red-500' };
		if (score <= 4) return { score, label: 'Fair', color: 'text-yellow-500' };
		if (score <= 6) return { score, label: 'Good', color: 'text-blue-500' };
		return { score, label: 'Strong', color: 'text-green-500' };
	});

	// Password validation
	const validation = $derived(() => {
		const checks = [
			{ name: 'At least 8 characters', valid: generatedPassword.length >= 8 },
			{ name: 'Contains uppercase letter', valid: /[A-Z]/.test(generatedPassword) },
			{ name: 'Contains lowercase letter', valid: /[a-z]/.test(generatedPassword) },
			{ name: 'Contains number', valid: /[0-9]/.test(generatedPassword) },
			{ name: 'Contains special character', valid: /[^a-zA-Z0-9]/.test(generatedPassword) }
		];

		return checks;
	});

	// HaveIBeenPwned check using centralized hook
	const breachQuery = $derived.by(() => useBreachCheck({ password: generatedPassword }));

	function generatePassword() {
		let charset = '';

		if (includeUppercase) charset += uppercase;
		if (includeLowercase) charset += lowercase;
		if (includeNumbers) charset += numbers;
		if (includeSymbols) charset += symbols;

		if (excludeSimilar) {
			charset = charset
				.split('')
				.filter((char) => !similar.includes(char))
				.join('');
		}

		if (!charset) {
			generatedPassword = '';
			return;
		}

		let password = '';

		// Ensure at least one character from each selected type
		const required = [];
		if (includeUppercase) required.push(uppercase);
		if (includeLowercase) required.push(lowercase);
		if (includeNumbers) required.push(numbers);
		if (includeSymbols) required.push(symbols);

		// Add one character from each required set
		for (const set of required) {
			let availableChars = set;
			if (excludeSimilar) {
				availableChars = set
					.split('')
					.filter((char) => !similar.includes(char))
					.join('');
			}
			if (availableChars) {
				password += availableChars[Math.floor(Math.random() * availableChars.length)];
			}
		}

		// Fill the rest randomly
		for (let i = password.length; i < length; i++) {
			password += charset[Math.floor(Math.random() * charset.length)];
		}

		// Shuffle the password
		generatedPassword = password
			.split('')
			.sort(() => Math.random() - 0.5)
			.join('');
	}

	async function copyPassword() {
		if (generatedPassword) {
			try {
				await navigator.clipboard.writeText(generatedPassword);
				toast.success('Password copied to clipboard!');
			} catch (error) {
				toast.error('Failed to copy password to clipboard');
			}
		}
	}

	// Generate initial password
	generatePassword();
</script>

<PageHeader 
	title="Password Generator" 
	subtitle="Generate secure passwords with customizable options and breach checking" 
	icon={KeyIcon} 
/>

<PageContainer>
	{#snippet children()}

	<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
		<div class="space-y-6 lg:col-span-2">
			<Card>
				<CardHeader>
					<CardTitle>Password Options</CardTitle>
					<CardDescription>Customize your password generation settings</CardDescription>
				</CardHeader>
				<CardContent class="space-y-6">
					<div class="space-y-2">
						<Label for="length">Password Length: {length}</Label>
						<Slider
							type="single"
							bind:value={length}
							min={8}
							max={128}
							step={1}
							class="w-full"
							onValueChange={(value: number) => {
								length = value;
								generatePassword();
							}}
						/>
						<div class="text-muted-foreground flex justify-between text-sm">
							<span>8</span>
							<span>128</span>
						</div>
					</div>

					<Separator />

					<div class="space-y-4">
						<h4 class="text-sm font-medium">Character Types</h4>

						<div class="flex items-center space-x-2">
							<Switch 
								id="uppercase" 
								bind:checked={includeUppercase} 
								onCheckedChange={() => generatePassword()}
							/>
							<Label for="uppercase">Uppercase Letters (A-Z)</Label>
						</div>

						<div class="flex items-center space-x-2">
							<Switch 
								id="lowercase" 
								bind:checked={includeLowercase}
								onCheckedChange={() => generatePassword()}
							/>
							<Label for="lowercase">Lowercase Letters (a-z)</Label>
						</div>

						<div class="flex items-center space-x-2">
							<Switch 
								id="numbers" 
								bind:checked={includeNumbers}
								onCheckedChange={() => generatePassword()}
							/>
							<Label for="numbers">Numbers (0-9)</Label>
						</div>

						<div class="flex items-center space-x-2">
							<Switch 
								id="symbols" 
								bind:checked={includeSymbols}
								onCheckedChange={() => generatePassword()}
							/>
							<Label for="symbols">Symbols (!@#$%^&*)</Label>
						</div>

						<Separator />

						<div class="flex items-center space-x-2">
							<Switch 
								id="exclude-similar" 
								bind:checked={excludeSimilar}
								onCheckedChange={() => generatePassword()}
							/>
							<Label for="exclude-similar">Exclude Similar Characters (i, l, 1, L, o, 0, O)</Label>
						</div>
					</div>

					<Button onclick={generatePassword} class="w-full">
						<RefreshCwIcon class="mr-2 h-4 w-4" />
						Generate New Password
					</Button>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Generated Password</CardTitle>
					<CardDescription>Your secure password</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="flex gap-2">
						<Input
							value={generatedPassword}
							readonly
							class="font-mono"
							placeholder="Click 'Generate New Password' to create a password"
						/>
						<Button variant="outline" onclick={copyPassword} disabled={!generatedPassword}>
							<CopyIcon class="h-4 w-4" />
						</Button>
					</div>

					{#if generatedPassword}
						<div class="space-y-2">
							<div class="flex items-center justify-between">
								<span class="text-sm font-medium">Strength:</span>
								<span class="text-sm font-medium {passwordStrength().color}">
									{passwordStrength().label}
								</span>
							</div>
							<Progress 
								value={(passwordStrength().score / 8) * 100} 
								class="w-full [&>div]:transition-all [&>div]:{passwordStrength().color.replace('text-', 'bg-')}"
							/>
						</div>
					{/if}
				</CardContent>
			</Card>
		</div>

		<div class="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Security Check</CardTitle>
					<CardDescription>Password validation and breach detection</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-3">
						<h4 class="text-sm font-medium">Requirements</h4>
						{#each validation() as check}
							<div class="flex items-center gap-2 text-sm">
								{#if check.valid}
									<CheckIcon class="h-4 w-4 text-green-500" />
								{:else}
									<XIcon class="h-4 w-4 text-red-500" />
								{/if}
								<span class={check.valid ? 'text-green-700' : 'text-red-700'}>
									{check.name}
								</span>
							</div>
						{/each}
					</div>

					<Separator />

					<div class="space-y-3">
						<h4 class="text-sm font-medium">Breach Check</h4>
						{#if $breachQuery.isPending}
							<div class="flex items-center gap-2 text-sm">
								<RefreshCwIcon class="h-4 w-4 animate-spin text-blue-500" />
								<span>Checking for breaches...</span>
							</div>
						{:else if $breachQuery.isError}
							<div class="flex items-center gap-2 text-sm">
								<ShieldAlertIcon class="h-4 w-4 text-yellow-500" />
								<span class="text-yellow-700">Could not check for breaches</span>
							</div>
						{:else if $breachQuery.data !== undefined}
							{#if $breachQuery.data === 0}
								<div class="flex items-center gap-2 text-sm">
									<ShieldCheckIcon class="h-4 w-4 text-green-500" />
									<span class="text-green-700">No known breaches</span>
								</div>
							{:else}
								<div class="flex items-center gap-2 text-sm">
									<ShieldAlertIcon class="h-4 w-4 text-red-500" />
									<span class="text-red-700">
										Found in {$breachQuery.data.toLocaleString()} breach{$breachQuery.data === 1
											? ''
											: 'es'}
									</span>
								</div>
							{/if}
						{/if}
					</div>

					<div class="text-muted-foreground text-xs">
						<p>
							<strong>Powered by HaveIBeenPwned:</strong> This service checks if your password has appeared
							in known data breaches. Your password is never sent in full - only a partial hash is used.
						</p>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Tips</CardTitle>
					<CardDescription>Password security best practices</CardDescription>
				</CardHeader>
				<CardContent>
					<div class="space-y-2 text-sm">
						<p>• Use unique passwords for each account</p>
						<p>• Consider using a password manager</p>
						<p>• Enable two-factor authentication when available</p>
						<p>• Avoid personal information in passwords</p>
						<p>• Update passwords regularly for sensitive accounts</p>
					</div>
				</CardContent>
			</Card>
		</div>
	</div>

	{/snippet}
</PageContainer>
