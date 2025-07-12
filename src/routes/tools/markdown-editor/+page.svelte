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
	import { Separator } from '$lib/components/ui/separator';
	import { Switch } from '$lib/components/ui/switch';
	import CodeIcon from '@lucide/svelte/icons/code';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import DownloadIcon from '@lucide/svelte/icons/download';
	import EyeIcon from '@lucide/svelte/icons/eye';
	import FileTextIcon from '@lucide/svelte/icons/file-text';
	import UploadIcon from '@lucide/svelte/icons/upload';
	import MarkdownIt from 'markdown-it';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	let markdownText = $state(`# Welcome to Markdown Editor

This is a **live preview** markdown editor with syntax highlighting support!

## Features

- Live preview as you type
- Syntax highlighting for code blocks
- Export to HTML
- File upload/download
- Developer-friendly

### Code Example

\`\`\`javascript
function greet(name) {
    console.log(\`Hello, \${name}!\`);
    return \`Welcome \${name}\`;
}

greet('Developer');
\`\`\`

### Lists

- [x] Live preview
- [x] Syntax highlighting  
- [x] Export functionality
- [ ] Advanced features

> **Note**: This editor supports all standard markdown features!

**Bold text** and *italic text* should work properly.
`);

	let htmlOutput = $state('');
	let enableSyntaxHighlighting = $state(true);
	let showLineNumbers = $state(true);
	let enableTableOfContents = $state(false);
	let fileInput: HTMLInputElement;
	let previewMode = $state<'split' | 'preview' | 'editor'>('split');

	// Dynamic imports for markdown-it and highlight.js
	let md: MarkdownIt | null = null;
	let hljs: any = null;

	onMount(async () => {
		// Import markdown-it
		const MarkdownItModule = await import('markdown-it');
		md = new MarkdownItModule.default({
			html: true,
			linkify: true,
			typographer: true,
			breaks: false, // We handle paragraph breaks manually
			highlight: function (code: string, lang: string) {
				if (!enableSyntaxHighlighting || !hljs) return '';

				if (lang && hljs.getLanguage(lang)) {
					try {
						return hljs.highlight(code, { language: lang }).value;
					} catch (err) {}
				}

				try {
					return hljs.highlightAuto(code).value;
				} catch (err) {
					return '';
				}
			}
		});

		// Import highlight.js
		const hljsModule = await import('highlight.js');
		hljs = hljsModule.default;

		// Import highlight.js CSS
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href =
			'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css';
		document.head.appendChild(link);

		// Trigger initial render
		renderMarkdown();
	});

	// Reactive markdown rendering
	$effect(() => {
		// Track markdownText changes explicitly
		markdownText;
		enableSyntaxHighlighting;
		enableTableOfContents;

		if (md) {
			renderMarkdown();
		}
	});

	function renderMarkdown() {
		if (!md || markdownText === undefined) return;

		try {
			let markdown = markdownText;

			// Simple approach: Replace single newlines with double newlines for paragraph breaks
			// But preserve code blocks and existing double newlines
			let inCodeBlock = false;
			const lines = markdown.split('\n');
			const processedLines: string[] = [];

			for (let i = 0; i < lines.length; i++) {
				const line = lines[i];
				const nextLine = lines[i + 1];

				// Track code blocks
				if (line.trim().startsWith('```')) {
					inCodeBlock = !inCodeBlock;
				}

				processedLines.push(line);

				// Add extra newline between non-empty lines (creating paragraph breaks)
				// But only if:
				// 1. Not in a code block
				// 2. Current line is not empty
				// 3. Next line exists and is not empty
				// 4. Next line is not already separated by an empty line
				// 5. Current or next line is not a special markdown element
				if (
					!inCodeBlock &&
					line.trim() !== '' &&
					nextLine !== undefined &&
					nextLine.trim() !== '' &&
					!line.match(/^(#{1,6}\s|[-*+]\s|>\s|\d+\.\s|```|\s*$)/) &&
					!nextLine.match(/^(#{1,6}\s|[-*+]\s|>\s|\d+\.\s|```)/)
				) {
					processedLines.push('');
				}
			}

			markdown = processedLines.join('\n');

			// Add table of contents if enabled
			if (enableTableOfContents) {
				const tocLines: string[] = [];
				const lines = markdown.split('\n');

				lines.forEach((line) => {
					const match = line.match(/^(#{1,6})\s+(.+)/);
					if (match) {
						const level = match[1].length;
						const text = match[2];
						const anchor = text
							.toLowerCase()
							.replace(/[^\w\s-]/g, '')
							.replace(/\s+/g, '-');
						const indent = '  '.repeat(level - 1);
						tocLines.push(`${indent}- [${text}](#${anchor})`);
					}
				});

				if (tocLines.length > 0) {
					markdown = `## Table of Contents\n\n${tocLines.join('\n')}\n\n${markdown}`;
				}
			}

			const result = md.render(markdown);
			htmlOutput = result;
		} catch (error) {
			htmlOutput = '<p>Error parsing markdown</p>';
		}
	}

	function clearAll() {
		markdownText = '';
		htmlOutput = '';
	}

	async function copyMarkdown() {
		if (markdownText) {
			try {
				await navigator.clipboard.writeText(markdownText);
				toast.success('Markdown copied to clipboard!');
			} catch (error) {
				toast.error('Failed to copy to clipboard');
			}
		}
	}

	async function copyHTML() {
		if (htmlOutput) {
			try {
				await navigator.clipboard.writeText(htmlOutput);
				toast.success('HTML copied to clipboard!');
			} catch (error) {
				toast.error('Failed to copy to clipboard');
			}
		}
	}

	function downloadMarkdown() {
		if (!markdownText) return;

		const blob = new Blob([markdownText], { type: 'text/markdown' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'document.md';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		toast.success('Markdown file downloaded!');
	}

	function downloadHTML() {
		if (!htmlOutput) return;

		const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown Document</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            color: #333;
        }
        code {
            background: #f6f8fa;
            padding: 0.2em 0.4em;
            border-radius: 3px;
            font-size: 85%;
        }
        pre {
            background: #f6f8fa;
            padding: 1rem;
            border-radius: 6px;
            overflow-x: auto;
        }
        pre code {
            background: none;
            padding: 0;
        }
        blockquote {
            border-left: 4px solid #dfe2e5;
            padding-left: 1rem;
            margin-left: 0;
            color: #6a737d;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 1rem 0;
        }
        th, td {
            border: 1px solid #dfe2e5;
            padding: 0.5rem 1rem;
            text-align: left;
        }
        th {
            background: #f6f8fa;
            font-weight: 600;
        }
    </style>
</head>
<body>
${htmlOutput}
</body>
</html>`;

		const blob = new Blob([fullHTML], { type: 'text/html' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'document.html';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		toast.success('HTML file downloaded!');
	}

	function handleFileUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				markdownText = (e.target?.result as string) || '';
			};
			reader.readAsText(file);
		}
	}

	function insertMarkdown(syntax: string) {
		const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
		if (!textarea) return;

		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const selectedText = markdownText.substring(start, end);

		let newText = '';
		switch (syntax) {
			case 'bold':
				newText = `**${selectedText || 'bold text'}**`;
				break;
			case 'italic':
				newText = `*${selectedText || 'italic text'}*`;
				break;
			case 'code':
				newText = `\`${selectedText || 'code'}\``;
				break;
			case 'link':
				newText = `[${selectedText || 'link text'}](url)`;
				break;
			case 'header':
				newText = `# ${selectedText || 'Header'}`;
				break;
			case 'list':
				newText = `- ${selectedText || 'List item'}`;
				break;
			case 'quote':
				newText = `> ${selectedText || 'Quote'}`;
				break;
			case 'codeblock':
				newText = `\`\`\`javascript\n${selectedText || '// Your code here'}\n\`\`\``;
				break;
		}

		const newMarkdown = markdownText.substring(0, start) + newText + markdownText.substring(end);
		markdownText = newMarkdown;

		// Restore focus and set cursor position
		setTimeout(() => {
			textarea.focus();
			textarea.setSelectionRange(start + newText.length, start + newText.length);
		}, 0);
	}

	// Keyboard shortcuts
	function handleKeydown(event: KeyboardEvent) {
		if (event.ctrlKey || event.metaKey) {
			switch (event.key) {
				case 'b':
					event.preventDefault();
					insertMarkdown('bold');
					break;
				case 'i':
					event.preventDefault();
					insertMarkdown('italic');
					break;
				case 'k':
					event.preventDefault();
					insertMarkdown('link');
					break;
			}
		}
	}
</script>

<!-- Global keyboard shortcuts listener -->
<svelte:window onkeydown={handleKeydown} />

<PageHeader
	title="Markdown Editor/Preview"
	subtitle="Live markdown editor with syntax highlighting and HTML export"
	icon={FileTextIcon}
/>

<PageContainer>
	{#snippet children()}
		<div class="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Editor Options</CardTitle>
					<CardDescription>Configure markdown editing and preview settings</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
						<div class="flex items-center space-x-2">
							<Switch id="syntax-highlighting" bind:checked={enableSyntaxHighlighting} />
							<Label for="syntax-highlighting">Syntax Highlighting</Label>
						</div>

						<div class="flex items-center space-x-2">
							<Switch id="line-numbers" bind:checked={showLineNumbers} />
							<Label for="line-numbers">Line Numbers</Label>
						</div>

						<div class="flex items-center space-x-2">
							<Switch id="table-of-contents" bind:checked={enableTableOfContents} />
							<Label for="table-of-contents">Table of Contents</Label>
						</div>

						<div class="space-y-2">
							<Label for="preview-mode">View Mode</Label>
							<select
								id="preview-mode"
								bind:value={previewMode}
								class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
							>
								<option value="split">Split View</option>
								<option value="editor">Editor Only</option>
								<option value="preview">Preview Only</option>
							</select>
						</div>
					</div>

					<Separator />

					<div class="space-y-3">
						<Label>Quick Actions</Label>
						<div class="flex flex-wrap gap-2">
							<Button variant="outline" onclick={() => fileInput.click()}>
								<UploadIcon class="mr-2 h-4 w-4" />
								Upload Markdown
							</Button>
							<input
								bind:this={fileInput}
								type="file"
								accept=".md,.markdown,.txt"
								onchange={handleFileUpload}
								class="hidden"
							/>

							<Button variant="outline" onclick={downloadMarkdown} disabled={!markdownText}>
								<DownloadIcon class="mr-2 h-4 w-4" />
								Download MD
							</Button>

							<Button variant="outline" onclick={downloadHTML} disabled={!htmlOutput}>
								<DownloadIcon class="mr-2 h-4 w-4" />
								Download HTML
							</Button>

							<Button variant="outline" onclick={clearAll} disabled={!markdownText}>
								Clear All
							</Button>
						</div>
					</div>

					<Separator />

					<div class="space-y-3">
						<Label>Markdown Shortcuts</Label>
						<div class="flex flex-wrap gap-2">
							<Button variant="outline" size="sm" onclick={() => insertMarkdown('bold')}>
								**Bold** (Ctrl+B)
							</Button>
							<Button variant="outline" size="sm" onclick={() => insertMarkdown('italic')}>
								*Italic* (Ctrl+I)
							</Button>
							<Button variant="outline" size="sm" onclick={() => insertMarkdown('code')}>
								`Code`
							</Button>
							<Button variant="outline" size="sm" onclick={() => insertMarkdown('link')}>
								Link (Ctrl+K)
							</Button>
							<Button variant="outline" size="sm" onclick={() => insertMarkdown('header')}>
								# Header
							</Button>
							<Button variant="outline" size="sm" onclick={() => insertMarkdown('list')}>
								- List
							</Button>
							<Button variant="outline" size="sm" onclick={() => insertMarkdown('quote')}>
								> Quote
							</Button>
							<Button variant="outline" size="sm" onclick={() => insertMarkdown('codeblock')}>
								```Code Block```
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			{#if previewMode === 'split'}
				<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
					<Card>
						<CardHeader>
							<CardTitle class="flex items-center gap-2">
								<CodeIcon class="h-5 w-5" />
								Markdown Editor
							</CardTitle>
							<CardDescription>Write your markdown here</CardDescription>
						</CardHeader>
						<CardContent class="space-y-4">
							<textarea
								bind:value={markdownText}
								oninput={(e) => {
									markdownText = (e.target as HTMLTextAreaElement).value;
								}}
								placeholder="# Start writing your markdown here..."
								class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring min-h-[500px] w-full rounded-md border px-3 py-2 font-mono text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
							></textarea>

							<div class="text-muted-foreground flex justify-between text-sm">
								<span>Characters: {markdownText.length}</span>
								<span>Lines: {markdownText.split('\n').length}</span>
							</div>

							<div class="flex flex-wrap gap-2">
								<Button onclick={copyMarkdown} disabled={!markdownText} size="sm">
									<CopyIcon class="mr-2 h-4 w-4" />
									Copy Markdown
								</Button>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle class="flex items-center gap-2">
								<EyeIcon class="h-5 w-5" />
								Live Preview
							</CardTitle>
							<CardDescription>See how your markdown will look</CardDescription>
						</CardHeader>
						<CardContent class="space-y-4">
							<div
								class="prose prose-sm dark:prose-invert bg-background prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-code:text-foreground prose-pre:bg-muted min-h-[500px] w-full max-w-none overflow-auto rounded-md border p-4"
							>
								{@html htmlOutput}
							</div>

							<div class="flex flex-wrap gap-2">
								<Button onclick={copyHTML} disabled={!htmlOutput} size="sm">
									<CopyIcon class="mr-2 h-4 w-4" />
									Copy HTML
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			{:else if previewMode === 'editor'}
				<Card>
					<CardHeader>
						<CardTitle class="flex items-center gap-2">
							<CodeIcon class="h-5 w-5" />
							Markdown Editor
						</CardTitle>
						<CardDescription>Write your markdown here</CardDescription>
					</CardHeader>
					<CardContent class="space-y-4">
						<textarea
							bind:value={markdownText}
							oninput={(e) => {
								markdownText = (e.target as HTMLTextAreaElement).value;
							}}
							placeholder="# Start writing your markdown here..."
							class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring min-h-[600px] w-full rounded-md border px-3 py-2 font-mono text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
						></textarea>

						<div class="text-muted-foreground flex justify-between text-sm">
							<span>Characters: {markdownText.length}</span>
							<span>Lines: {markdownText.split('\n').length}</span>
						</div>

						<div class="flex flex-wrap gap-2">
							<Button onclick={copyMarkdown} disabled={!markdownText}>
								<CopyIcon class="mr-2 h-4 w-4" />
								Copy Markdown
							</Button>
						</div>
					</CardContent>
				</Card>
			{:else if previewMode === 'preview'}
				<Card>
					<CardHeader>
						<CardTitle class="flex items-center gap-2">
							<EyeIcon class="h-5 w-5" />
							Live Preview
						</CardTitle>
						<CardDescription>See how your markdown will look</CardDescription>
					</CardHeader>
					<CardContent class="space-y-4">
						<div
							class="prose prose-sm dark:prose-invert bg-background prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-code:text-foreground prose-pre:bg-muted min-h-[600px] w-full max-w-none overflow-auto rounded-md border p-6"
						>
							{@html htmlOutput}
						</div>

						<div class="flex flex-wrap gap-2">
							<Button onclick={copyHTML} disabled={!htmlOutput}>
								<CopyIcon class="mr-2 h-4 w-4" />
								Copy HTML
							</Button>
						</div>
					</CardContent>
				</Card>
			{/if}

			<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Features</CardTitle>
						<CardDescription>Markdown editor capabilities</CardDescription>
					</CardHeader>
					<CardContent>
						<div class="space-y-2 text-sm">
							<p>• Live preview as you type</p>
							<p>• Syntax highlighting for code blocks</p>
							<p>• Export to HTML with styling</p>
							<p>• File upload/download support</p>
							<p>• Keyboard shortcuts (Ctrl+B, Ctrl+I, Ctrl+K)</p>
							<p>• Multiple view modes</p>
							<p>• Table of contents generation</p>
							<p>• GitHub Flavored Markdown support</p>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Keyboard Shortcuts</CardTitle>
						<CardDescription>Quick formatting options</CardDescription>
					</CardHeader>
					<CardContent>
						<div class="space-y-3 text-sm">
							<div>
								<h4 class="font-medium">Ctrl + B</h4>
								<p class="text-muted-foreground">Make selected text bold</p>
							</div>

							<div>
								<h4 class="font-medium">Ctrl + I</h4>
								<p class="text-muted-foreground">Make selected text italic</p>
							</div>

							<div>
								<h4 class="font-medium">Ctrl + K</h4>
								<p class="text-muted-foreground">Insert link</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	{/snippet}
</PageContainer>
