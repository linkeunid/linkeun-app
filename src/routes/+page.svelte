<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import PageContainer from '@/lib/components/ui/page-container.svelte';
	import PageHeader from '@/lib/components/ui/page-header.svelte';
	import { siteConfig } from '@/lib/config/site';
	import {
		BarChart3,
		Clock,
		Code,
		ExternalLink,
		FileText,
		HomeIcon,
		Link,
		LogIn,
		LogOut,
		Plus,
		QrCode,
		Shield,
		User,
		UserPlus,
		Wrench,
		Zap
	} from '@lucide/svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let searchValue = $state('');

	// Quick tools data
	const popularTools = [
		{
			title: 'QR Code Generator',
			description: 'Generate QR codes instantly',
			href: '/tools/qr-generator',
			icon: QrCode,
			color: 'text-blue-600 dark:text-blue-400'
		},
		{
			title: 'Password Generator',
			description: 'Secure password creation',
			href: '/tools/password-generator',
			icon: Shield,
			color: 'text-green-600 dark:text-green-400'
		},
		{
			title: 'Text Counter',
			description: 'Advanced text analysis',
			href: '/tools/text-counter',
			icon: FileText,
			color: 'text-purple-600 dark:text-purple-400'
		},
		{
			title: 'JSON Formatter',
			description: 'Format and validate JSON',
			href: '/tools/json-formatter',
			icon: Code,
			color: 'text-orange-600 dark:text-orange-400'
		}
	];

	const utilityTools = [
		{ title: 'ASCII Art Generator', href: '/tools/ascii-art', icon: Wrench },
		{ title: 'Timestamp Converter', href: '/tools/timestamp-converter', icon: Clock },
		{ title: 'Base64 Encoder', href: '/tools/base64', icon: Code },
		{ title: 'Lorem Ipsum', href: '/tools/lorem-ipsum', icon: FileText },
		{ title: 'Text Diff', href: '/tools/text-diff', icon: FileText },
		{ title: 'Open Graph', href: '/tools/open-graph', icon: ExternalLink }
	];
</script>

<PageHeader title="Home" subtitle={`Welcome to ${siteConfig.siteName}`} icon={HomeIcon} />

<PageContainer>
	{#snippet children()}
		{#if data.user}
			<!-- Welcome section for logged in users -->
			<div class="grid auto-rows-min gap-6">
				<!-- Header Card -->
				<Card.Root>
					<Card.Header>
						<Card.Title class="flex items-center gap-2 font-sans">
							<User class="h-5 w-5" />
							Welcome back, {data.user.name}!
						</Card.Title>
						<Card.Description>Here's your dashboard overview</Card.Description>
					</Card.Header>
					<Card.Content>
						<div class="grid gap-4 md:grid-cols-3">
							<div class="space-y-2">
								<p class="text-muted-foreground text-sm">
									<strong>Username:</strong>
									{data.user.username}
								</p>
								<p class="text-muted-foreground text-sm">
									<strong>Email:</strong>
									{data.user.email}
								</p>
							</div>
						</div>
					</Card.Content>
				</Card.Root>

				<!-- Quick Actions Grid -->
				<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					<!-- Create Link -->
					<Card.Root class="transition-shadow hover:shadow-md">
						<Card.Header class="pb-2">
							<Card.Title class="flex items-center gap-2 text-base">
								<Plus class="h-4 w-4 text-blue-600" />
								Create Link
							</Card.Title>
						</Card.Header>
						<Card.Content>
							<p class="text-muted-foreground mb-3 text-sm">Shorten a new URL</p>
							<Button href="/links/create" class="w-full" size="sm">
								<Plus class="mr-2 h-3 w-3" />
								New Link
							</Button>
						</Card.Content>
					</Card.Root>

					<!-- View Links -->
					<Card.Root class="transition-shadow hover:shadow-md">
						<Card.Header class="pb-2">
							<Card.Title class="flex items-center gap-2 text-base">
								<Link class="h-4 w-4 text-green-600" />
								My Links
							</Card.Title>
						</Card.Header>
						<Card.Content>
							<p class="text-muted-foreground mb-3 text-sm">Manage your links</p>
							<Button href="/links" variant="outline" class="w-full" size="sm">
								<BarChart3 class="mr-2 h-3 w-3" />
								View All
							</Button>
						</Card.Content>
					</Card.Root>

					<!-- Tools -->
					<Card.Root class="transition-shadow hover:shadow-md">
						<Card.Header class="pb-2">
							<Card.Title class="flex items-center gap-2 text-base">
								<Wrench class="h-4 w-4 text-purple-600" />
								Dev Tools
							</Card.Title>
						</Card.Header>
						<Card.Content>
							<p class="text-muted-foreground mb-3 text-sm">Utility tools</p>
							<Button href="/tools" variant="outline" class="w-full" size="sm">
								<Zap class="mr-2 h-3 w-3" />
								Browse
							</Button>
						</Card.Content>
					</Card.Root>

					<!-- Account -->
					<Card.Root class="transition-shadow hover:shadow-md">
						<Card.Header class="pb-2">
							<Card.Title class="flex items-center gap-2 text-base">
								<User class="h-4 w-4 text-orange-600" />
								Account
							</Card.Title>
						</Card.Header>
						<Card.Content>
							<p class="text-muted-foreground mb-3 text-sm">Settings & logout</p>
							<div class="flex gap-1">
								<Button href="/settings" variant="outline" size="sm" class="flex-1">
									Settings
								</Button>
								<form method="post" action="?/logout" use:enhance>
									<Button type="submit" variant="ghost" size="sm">
										<LogOut class="h-3 w-3" />
									</Button>
								</form>
							</div>
						</Card.Content>
					</Card.Root>
				</div>

				<!-- Popular Tools -->
				<Card.Root>
					<Card.Header>
						<Card.Title class="flex items-center gap-2">
							<Zap class="h-5 w-5" />
							Popular Tools
						</Card.Title>
						<Card.Description>Most used developer utilities</Card.Description>
					</Card.Header>
					<Card.Content>
						<div class="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
							{#each popularTools as tool}
								{@const Component = tool.icon}
								<Button
									href={tool.href}
									variant="outline"
									class="hover:bg-muted/50 h-auto justify-start p-4"
								>
									<div class="flex items-start gap-3 text-left">
										<Component class="mt-0.5 h-4 w-4 {tool.color}" />
										<div class="space-y-1">
											<div class="text-sm font-medium">{tool.title}</div>
											<div class="text-muted-foreground text-xs">{tool.description}</div>
										</div>
									</div>
								</Button>
							{/each}
						</div>
					</Card.Content>
				</Card.Root>

				<!-- All Tools -->
				<Card.Root>
					<Card.Header>
						<Card.Title class="flex items-center gap-2">
							<Wrench class="h-5 w-5" />
							All Developer Tools
						</Card.Title>
						<Card.Description>Complete toolkit for developers</Card.Description>
					</Card.Header>
					<Card.Content>
						<div class="grid gap-2 md:grid-cols-3 lg:grid-cols-6">
							{#each utilityTools as tool}
								{@const Component = tool.icon}
								<Button href={tool.href} variant="ghost" size="sm" class="h-auto justify-start p-2">
									<Component class="mr-2 h-3 w-3" />
									<span class="truncate text-xs">{tool.title}</span>
								</Button>
							{/each}
						</div>
						<div class="mt-4 border-t pt-4">
							<Button href="/tools" class="w-full">
								View All Tools
								<ExternalLink class="ml-2 h-3 w-3" />
							</Button>
						</div>
					</Card.Content>
				</Card.Root>
			</div>
		{:else}
			<!-- Welcome section for guests -->
			<div class="grid auto-rows-min gap-6">
				<!-- Hero Section -->
				<Card.Root
					class="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-100 dark:border-blue-800 dark:from-blue-950/50 dark:to-indigo-950/50"
				>
					<Card.Header class="pb-4 text-center">
						<Card.Title class="font-sans text-2xl font-bold"
							>Welcome to {siteConfig.siteName}</Card.Title
						>
						<Card.Description class="text-lg">
							Your all-in-one platform for link management and developer tools
						</Card.Description>
					</Card.Header>
					<Card.Content class="text-center">
						<div class="mb-6 flex justify-center gap-3">
							<Button href="/auth/login" size="lg" class="flex items-center gap-2">
								<LogIn class="h-4 w-4" />
								Get Started
							</Button>
							<Button
								href="/auth/register"
								variant="outline"
								size="lg"
								class="flex items-center gap-2"
							>
								<UserPlus class="h-4 w-4" />
								Create Account
							</Button>
						</div>
						<p class="text-muted-foreground text-sm">
							Sign up to access link management, analytics • Use our 16+ developer tools for free.
						</p>
					</Card.Content>
				</Card.Root>

				<!-- Features Grid -->
				<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					<Card.Root>
						<Card.Header>
							<Card.Title class="flex items-center gap-2">
								<Link class="h-5 w-5 text-blue-600" />
								Link Management
							</Card.Title>
						</Card.Header>
						<Card.Content>
							<p class="text-muted-foreground text-sm">
								Shorten URLs, track clicks, and manage your links with advanced analytics.
							</p>
						</Card.Content>
					</Card.Root>

					<Card.Root>
						<Card.Header>
							<Card.Title class="flex items-center gap-2">
								<Wrench class="h-5 w-5 text-green-600" />
								Developer Tools
							</Card.Title>
						</Card.Header>
						<Card.Content>
							<p class="text-muted-foreground text-sm">
								16+ utilities including QR generators, JSON formatters, and text analyzers.
							</p>
						</Card.Content>
					</Card.Root>

					<Card.Root>
						<Card.Header>
							<Card.Title class="flex items-center gap-2">
								<BarChart3 class="h-5 w-5 text-purple-600" />
								Analytics
							</Card.Title>
						</Card.Header>
						<Card.Content>
							<p class="text-muted-foreground text-sm">
								Track performance with detailed click analytics and usage statistics.
							</p>
						</Card.Content>
					</Card.Root>
				</div>

				<!-- Preview Tools -->
				<Card.Root>
					<Card.Header>
						<Card.Title>Try Our Tools</Card.Title>
						<Card.Description>Get a preview of our developer utilities</Card.Description>
					</Card.Header>
					<Card.Content>
						<div class="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
							{#each popularTools as tool}
								{@const Component = tool.icon}
								<Button
									href={tool.href}
									variant="outline"
									class="hover:bg-muted/50 h-auto justify-start p-4"
								>
									<div class="flex items-start gap-3 text-left">
										<Component class="mt-0.5 h-4 w-4 {tool.color}" />
										<div class="space-y-1">
											<div class="text-sm font-medium">{tool.title}</div>
											<div class="text-muted-foreground text-xs">{tool.description}</div>
										</div>
									</div>
								</Button>
							{/each}
						</div>
						<div class="mt-4 border-t pt-4 text-center">
							<Button href="/tools" variant="outline">
								Explore All Tools
								<ExternalLink class="ml-2 h-3 w-3" />
							</Button>
						</div>
					</Card.Content>
				</Card.Root>
			</div>
		{/if}

		<!-- Footer Documentation -->
		<Card.Root class="mt-6">
			<Card.Header>
				<Card.Title>Documentation & Support</Card.Title>
				<Card.Description>Learn more about the platform</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="flex flex-wrap gap-4">
					<Button href="/tools" variant="outline" size="sm">
						<Wrench class="mr-2 h-3 w-3" />
						Tools Overview
					</Button>
					<Button
						href="https://svelte.dev/docs/kit"
						target="_blank"
						variant="outline"
						size="sm"
						class="text-primary"
					>
						SvelteKit Docs
						<ExternalLink class="ml-2 h-3 w-3" />
					</Button>
				</div>
			</Card.Content>
		</Card.Root>
	{/snippet}
</PageContainer>
