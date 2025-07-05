<script lang="ts">
	import { page } from '$app/stores';
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import ThemeSwitcher from '$lib/components/theme-switcher.svelte';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { segmentToLabel } from '$lib/config/breadcrumb-labels';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '$lib/components/ui/sonner';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import '../app.css';

	// Create QueryClient instance
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 5 * 60 * 1000, // 5 minutes
				refetchOnWindowFocus: false,
			},
		},
	});

	let { children, data } = $props();

	// Function to generate breadcrumbs from the current path
	function generateBreadcrumbs(pathname: string) {
		const segments = pathname.split('/').filter(Boolean);
		const breadcrumbs: Array<{
			href?: string;
			label: string;
			isHome: boolean;
			isLast?: boolean;
		}> = [
			{
				href: '/',
				label: 'Dashboard',
				isHome: true
			}
		];

		let currentPath = '';
		for (let i = 0; i < segments.length; i++) {
			currentPath += `/${segments[i]}`;
			const segment = segments[i];
			const isLast = i === segments.length - 1;

			const label = segmentToLabel(segment);

			breadcrumbs.push({
				href: isLast ? undefined : currentPath,
				label,
				isHome: false,
				isLast
			});
		}

		// If we're on the home page, show "Dashboard" as the current page
		// if (pathname === '/') {
		// breadcrumbs.push({
		// 	href: undefined,
		// 	label: 'Dashboard',
		// 	isHome: false,
		// 	isLast: true
		// });
		// }

		return breadcrumbs;
	}

	const breadcrumbs = $derived(generateBreadcrumbs($page.url.pathname));
</script>

<svelte:head>
	<title>LinkeunApp</title>
</svelte:head>

<ModeWatcher />
<QueryClientProvider client={queryClient}>
	<Sidebar.Provider>
		<AppSidebar user={data.user} />
		<Sidebar.Inset>
			<header
				class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
			>
				<div class="flex flex-1 items-center gap-2 px-4">
					<Sidebar.Trigger class="-ml-1" />
					<Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
					<Breadcrumb.Root>
						<Breadcrumb.List>
							{#each breadcrumbs as crumb, index}
								{#if index > 0}
									<Breadcrumb.Separator class="hidden md:block" />
								{/if}
								<Breadcrumb.Item class={crumb.isHome ? 'hidden md:block' : ''}>
									{#if crumb.href}
										<Breadcrumb.Link href={crumb.href}>{crumb.label}</Breadcrumb.Link>
									{:else}
										<Breadcrumb.Page>{crumb.label}</Breadcrumb.Page>
									{/if}
								</Breadcrumb.Item>
							{/each}
						</Breadcrumb.List>
					</Breadcrumb.Root>
				</div>
				<div class="flex items-center gap-2 px-4">
					<ThemeSwitcher />
				</div>
			</header>
			<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
				{@render children()}
			</div>
		</Sidebar.Inset>
	</Sidebar.Provider>
</QueryClientProvider>
<Toaster />
