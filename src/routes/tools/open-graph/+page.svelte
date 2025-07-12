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
	import { Textarea } from '$lib/components/ui/textarea';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import ShareIcon from '@lucide/svelte/icons/share';
	import { toast } from 'svelte-sonner';

	// Form state
	let title = $state('Amazing Website Title');
	let description = $state(
		'This is an amazing website with great content that you should definitely check out. It has everything you need and more!'
	);
	let url = $state('https://example.com');
	let imageUrl = $state('https://placehold.co/1200x630/0066cc/ffffff?text=Open+Graph+Image');
	let siteName = $state('My Website');
	let type = $state('website');
	let locale = $state('en_US');
	let twitterCard = $state('summary_large_image');
	let twitterSite = $state('@mywebsite');
	let twitterCreator = $state('@creator');

	// Type options
	const typeOptions = [
		{ value: 'website', label: 'Website' },
		{ value: 'article', label: 'Article' },
		{ value: 'blog', label: 'Blog' },
		{ value: 'book', label: 'Book' },
		{ value: 'profile', label: 'Profile' },
		{ value: 'music.song', label: 'Music Song' },
		{ value: 'music.album', label: 'Music Album' },
		{ value: 'video.movie', label: 'Video Movie' },
		{ value: 'video.episode', label: 'Video Episode' }
	];

	const twitterCardOptions = [
		{ value: 'summary', label: 'Summary' },
		{ value: 'summary_large_image', label: 'Summary Large Image' },
		{ value: 'app', label: 'App' },
		{ value: 'player', label: 'Player' }
	];

	const typeTriggerContent = $derived(
		typeOptions.find((t) => t.value === type)?.label ?? 'Select type'
	);

	const cardTriggerContent = $derived(
		twitterCardOptions.find((c) => c.value === twitterCard)?.label ?? 'Select card type'
	);

	// Generated meta tags
	const generatedTags = $derived(() => {
		const tags = [
			// Basic Open Graph
			`<meta property="og:title" content="${title}" />`,
			`<meta property="og:description" content="${description}" />`,
			`<meta property="og:url" content="${url}" />`,
			`<meta property="og:image" content="${imageUrl}" />`,
			`<meta property="og:site_name" content="${siteName}" />`,
			`<meta property="og:type" content="${type}" />`,
			`<meta property="og:locale" content="${locale}" />`,
			'',
			// Twitter Cards
			`<meta name="twitter:card" content="${twitterCard}" />`,
			`<meta name="twitter:title" content="${title}" />`,
			`<meta name="twitter:description" content="${description}" />`,
			`<meta name="twitter:image" content="${imageUrl}" />`,
			`<meta name="twitter:site" content="${twitterSite}" />`,
			`<meta name="twitter:creator" content="${twitterCreator}" />`,
			'',
			// Additional SEO
			`<meta name="description" content="${description}" />`,
			`<title>${title}</title>`
		];

		return tags.join('\n');
	});

	async function copyTags(): Promise<void> {
		try {
			await navigator.clipboard.writeText(generatedTags());
			toast.success('Meta tags copied to clipboard!');
		} catch (error) {
			toast.error('Failed to copy to clipboard');
		}
	}

	function previewUrl(platform: string): string {
		const encodedUrl = encodeURIComponent(url);
		switch (platform) {
			case 'facebook':
				return `https://developers.facebook.com/tools/debug/?q=${encodedUrl}`;
			case 'twitter':
				return `https://cards-dev.twitter.com/validator?url=${encodedUrl}`;
			case 'linkedin':
				return `https://www.linkedin.com/post-inspector/inspect/${encodedUrl}`;
			default:
				return '#';
		}
	}

	// Character count helpers
	const titleLength = $derived(title.length);
	const descriptionLength = $derived(description.length);
	const isOptimalTitle = $derived(titleLength >= 30 && titleLength <= 60);
	const isOptimalDescription = $derived(descriptionLength >= 120 && descriptionLength <= 160);
</script>

<PageHeader
	title="Open Graph Generator"
	subtitle="Create and preview Open Graph meta tags for social media sharing"
	icon={ShareIcon}
/>

<PageContainer>
	{#snippet children()}
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
			<div class="space-y-6 lg:col-span-2">
				<Card>
					<CardHeader>
						<CardTitle>Open Graph Settings</CardTitle>
						<CardDescription>Configure your website's social media appearance</CardDescription>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div class="space-y-2">
								<Label for="title">Title</Label>
								<Input
									id="title"
									type="text"
									bind:value={title}
									placeholder="Enter page title"
									maxlength={60}
								/>
								<div class="text-muted-foreground text-xs">
									{titleLength}/60 characters
									{#if isOptimalTitle}
										<span class="text-green-600 dark:text-green-400">✓ Optimal length</span>
									{:else if titleLength < 30}
										<span class="text-amber-600 dark:text-amber-400">⚠ Consider longer title</span>
									{:else}
										<span class="text-red-600 dark:text-red-400">⚠ Too long</span>
									{/if}
								</div>
							</div>

							<div class="space-y-2">
								<Label for="site-name">Site Name</Label>
								<Input
									id="site-name"
									type="text"
									bind:value={siteName}
									placeholder="Your website name"
								/>
							</div>
						</div>

						<div class="space-y-2">
							<Label for="description">Description</Label>
							<Textarea
								id="description"
								bind:value={description}
								placeholder="Enter page description"
								rows={3}
								maxlength={200}
							/>
							<div class="text-muted-foreground text-xs">
								{descriptionLength}/200 characters
								{#if isOptimalDescription}
									<span class="text-green-600 dark:text-green-400">✓ Optimal length</span>
								{:else if descriptionLength < 120}
									<span class="text-amber-600 dark:text-amber-400"
										>⚠ Consider longer description</span
									>
								{:else}
									<span class="text-red-600 dark:text-red-400">⚠ Too long</span>
								{/if}
							</div>
						</div>

						<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div class="space-y-2">
								<Label for="url">URL</Label>
								<Input id="url" type="url" bind:value={url} placeholder="https://example.com" />
							</div>

							<div class="space-y-2">
								<Label for="image-url">Image URL</Label>
								<Input
									id="image-url"
									type="url"
									bind:value={imageUrl}
									placeholder="https://example.com/image.jpg"
								/>
								<div class="text-muted-foreground text-xs">
									Recommended: 1200x630px (1.91:1 ratio)
								</div>
							</div>
						</div>

						<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
							<div class="space-y-2">
								<Label>Content Type</Label>
								<Select.Root type="single" name="contentType" bind:value={type}>
									<Select.Trigger class="w-full">
										{typeTriggerContent}
									</Select.Trigger>
									<Select.Content>
										<Select.Group>
											<Select.Label>Content Types</Select.Label>
											{#each typeOptions as option (option.value)}
												<Select.Item value={option.value} label={option.label}>
													{option.label}
												</Select.Item>
											{/each}
										</Select.Group>
									</Select.Content>
								</Select.Root>
							</div>

							<div class="space-y-2">
								<Label for="locale">Locale</Label>
								<Input id="locale" type="text" bind:value={locale} placeholder="en_US" />
							</div>

							<div class="space-y-2">
								<Label>Twitter Card Type</Label>
								<Select.Root type="single" name="twitterCard" bind:value={twitterCard}>
									<Select.Trigger class="w-full">
										{cardTriggerContent}
									</Select.Trigger>
									<Select.Content>
										<Select.Group>
											<Select.Label>Card Types</Select.Label>
											{#each twitterCardOptions as option (option.value)}
												<Select.Item value={option.value} label={option.label}>
													{option.label}
												</Select.Item>
											{/each}
										</Select.Group>
									</Select.Content>
								</Select.Root>
							</div>
						</div>

						<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div class="space-y-2">
								<Label for="twitter-site">Twitter Site</Label>
								<Input
									id="twitter-site"
									type="text"
									bind:value={twitterSite}
									placeholder="@mywebsite"
								/>
							</div>

							<div class="space-y-2">
								<Label for="twitter-creator">Twitter Creator</Label>
								<Input
									id="twitter-creator"
									type="text"
									bind:value={twitterCreator}
									placeholder="@creator"
								/>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Preview</CardTitle>
						<CardDescription>How your content will appear on social media</CardDescription>
					</CardHeader>
					<CardContent class="space-y-6">
						<!-- Facebook Preview -->
						<div class="space-y-3">
							<h3 class="text-sm font-medium text-blue-600 dark:text-blue-400">Facebook</h3>
							<div class="border-border bg-card max-w-lg overflow-hidden rounded-lg border">
								<div class="bg-muted flex aspect-[1.91/1] items-center justify-center">
									{#if imageUrl}
										<img src={imageUrl} alt="Preview" class="h-full w-full object-cover" />
									{:else}
										<div class="text-muted-foreground text-sm">No image</div>
									{/if}
								</div>
								<div class="space-y-1 p-3">
									<div class="text-muted-foreground text-xs uppercase">{new URL(url).hostname}</div>
									<div class="line-clamp-2 text-sm font-medium">{title}</div>
									<div class="text-muted-foreground line-clamp-2 text-sm">{description}</div>
								</div>
							</div>
						</div>

						<!-- Twitter Preview -->
						<div class="space-y-3">
							<h3 class="text-sm font-medium text-sky-500 dark:text-sky-400">Twitter</h3>
							<div class="border-border bg-card max-w-lg overflow-hidden rounded-lg border">
								<div class="bg-muted flex aspect-[2/1] items-center justify-center">
									{#if imageUrl}
										<img src={imageUrl} alt="Preview" class="h-full w-full object-cover" />
									{:else}
										<div class="text-muted-foreground text-sm">No image</div>
									{/if}
								</div>
								<div class="space-y-1 p-3">
									<div class="line-clamp-1 text-sm font-medium">{title}</div>
									<div class="text-muted-foreground line-clamp-2 text-sm">{description}</div>
									<div class="text-muted-foreground text-xs">{new URL(url).hostname}</div>
								</div>
							</div>
						</div>

						<!-- LinkedIn Preview -->
						<div class="space-y-3">
							<h3 class="text-sm font-medium text-blue-700 dark:text-blue-300">LinkedIn</h3>
							<div class="border-border bg-card max-w-lg overflow-hidden rounded-lg border">
								<div class="bg-muted flex aspect-[1.91/1] items-center justify-center">
									{#if imageUrl}
										<img src={imageUrl} alt="Preview" class="h-full w-full object-cover" />
									{:else}
										<div class="text-muted-foreground text-sm">No image</div>
									{/if}
								</div>
								<div class="space-y-1 p-3">
									<div class="line-clamp-2 text-sm font-medium">{title}</div>
									<div class="text-muted-foreground text-xs">{new URL(url).hostname}</div>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Generated Meta Tags</CardTitle>
						<CardDescription>Copy these tags to your HTML head section</CardDescription>
					</CardHeader>
					<CardContent>
						<div class="space-y-4">
							<textarea
								value={generatedTags()}
								readonly
								placeholder="Generated meta tags will appear here..."
								class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring min-h-[300px] w-full resize-y rounded-md border px-3 py-2 font-mono text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
							></textarea>

							<div class="flex items-center justify-between">
								<span class="text-muted-foreground text-sm"
									>{generatedTags().split('\n').length} meta tags</span
								>
								<Button onclick={() => copyTags()}>
									<CopyIcon class="mr-2 h-4 w-4" />
									Copy Meta Tags
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<div class="space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>Validation Tools</CardTitle>
						<CardDescription>Test your Open Graph tags</CardDescription>
					</CardHeader>
					<CardContent class="space-y-3">
						<Button
							variant="outline"
							class="w-full justify-start"
							onclick={() => window.open(previewUrl('facebook'), '_blank')}
						>
							<ExternalLinkIcon class="mr-2 h-4 w-4" />
							Facebook Debugger
						</Button>
						<Button
							variant="outline"
							class="w-full justify-start"
							onclick={() => window.open(previewUrl('twitter'), '_blank')}
						>
							<ExternalLinkIcon class="mr-2 h-4 w-4" />
							Twitter Card Validator
						</Button>
						<Button
							variant="outline"
							class="w-full justify-start"
							onclick={() => window.open(previewUrl('linkedin'), '_blank')}
						>
							<ExternalLinkIcon class="mr-2 h-4 w-4" />
							LinkedIn Inspector
						</Button>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Best Practices</CardTitle>
						<CardDescription>Open Graph optimization tips</CardDescription>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="space-y-3 text-sm">
							<div>
								<h4 class="font-medium">Title Guidelines</h4>
								<p class="text-muted-foreground">
									30-60 characters for optimal display across platforms
								</p>
							</div>

							<div>
								<h4 class="font-medium">Description Guidelines</h4>
								<p class="text-muted-foreground">120-160 characters, compelling and informative</p>
							</div>

							<div>
								<h4 class="font-medium">Image Requirements</h4>
								<p class="text-muted-foreground">
									1200x630px (1.91:1 ratio), high quality, relevant content
								</p>
							</div>

							<div>
								<h4 class="font-medium">URL Format</h4>
								<p class="text-muted-foreground">
									Use canonical URLs, include https://, avoid tracking parameters
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Content Types</CardTitle>
						<CardDescription>Available Open Graph types</CardDescription>
					</CardHeader>
					<CardContent>
						<div class="space-y-2 text-sm">
							<p><strong>Website:</strong> General web pages and landing pages</p>
							<p><strong>Article:</strong> News articles, blog posts, and editorial content</p>
							<p><strong>Blog:</strong> Blog homepages and category pages</p>
							<p><strong>Profile:</strong> Personal or company profile pages</p>
							<p><strong>Music/Video:</strong> Media content with rich metadata</p>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Platform Features</CardTitle>
						<CardDescription>Social media platform specifics</CardDescription>
					</CardHeader>
					<CardContent>
						<div class="space-y-2 text-sm">
							<p><strong>Facebook:</strong> Supports all Open Graph tags, rich media previews</p>
							<p><strong>Twitter:</strong> Uses Twitter Cards with fallback to Open Graph</p>
							<p>
								<strong>LinkedIn:</strong> Professional network, emphasizes titles and company info
							</p>
							<p><strong>WhatsApp:</strong> Uses Open Graph for link previews</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	{/snippet}
</PageContainer>

<style>
	.line-clamp-1 {
		display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
