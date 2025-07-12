<script lang="ts" module>
	import { Link2Icon, Nut, WrenchIcon } from '@lucide/svelte';
	// This is sample data.
	const data = {
		teams: [
			// 	{
			// 		name: 'Acme Inc',
			// 		logo: GalleryVerticalEndIcon,
			// 		plan: 'Enterprise'
			// 	},
			// 	{
			// 		name: 'Acme Corp.',
			// 		logo: AudioWaveformIcon,
			// 		plan: 'Startup'
			// 	},
			{
				name: 'Linkeun Mono.',
				logo: Nut,
				plan: 'Free'
			}
		],
		navMain: [
			{
				title: 'Short Link',
				url: '#',
				icon: Link2Icon,
				isActive: false,
				items: [
					{
						title: 'My Links',
						url: '/links'
					},
					{
						title: 'Create Link',
						url: '/links/create'
					}
				]
			},
			{
				title: 'Tools',
				url: '#',
				icon: WrenchIcon,
				isActive: false,
				items: [
					{
						title: 'All Tools',
						url: '/tools'
					},
					{
						title: 'Text Counter',
						url: '/tools/text-counter'
					},
					{
						title: 'QR Generator',
						url: '/tools/qr-generator'
					},
					{
						title: 'Password Generator',
						url: '/tools/password-generator'
					},
					{
						title: 'Base64 Encoder/Decoder',
						url: '/tools/base64'
					},
					{
						title: 'JSON Formatter',
						url: '/tools/json-formatter'
					},
					{
						title: 'Text Diff Analyzer',
						url: '/tools/text-diff'
					},
					{
						title: 'URL Encoder/Decoder',
						url: '/tools/url-encoder'
					},
					{
						title: 'Timestamp Converter',
						url: '/tools/timestamp-converter'
					},
					{
						title: 'Lorem Ipsum Generator',
						url: '/tools/lorem-ipsum'
					},
					{
						title: 'Fake Data Generator',
						url: '/tools/fake-data'
					},
					{
						title: 'ASCII Art Generator',
						url: '/tools/ascii-art'
					},
					{
						title: 'Open Graph Generator',
						url: '/tools/open-graph'
					},
					{
						title: 'Barcode Generator',
						url: '/tools/barcode-generator'
					},
					{
						title: 'Table Viewer',
						url: '/tools/table-viewer'
					},
					{
						title: 'Binary Clock',
						url: '/tools/binary-clock'
					},
					{
						title: 'Text Encryption',
						url: '/tools/text-encrypt'
					}
					// WIP: Markdown Editor - temporarily disabled for development
					// {
					//		title: 'Markdown Editor',
					//		url: '/tools/markdown-editor'
					// }
				]
			}
			// {
			// 	title: 'Models',
			// 	url: '#',
			// 	icon: BotIcon,
			// 	items: [
			// 		{
			// 			title: 'Genesis',
			// 			url: '#'
			// 		},
			// 		{
			// 			title: 'Explorer',
			// 			url: '#'
			// 		},
			// 		{
			// 			title: 'Quantum',
			// 			url: '#'
			// 		}
			// 	]
			// },
			// {
			// 	title: 'Documentation',
			// 	url: '#',
			// 	icon: BookOpenIcon,
			// 	items: [
			// 		{
			// 			title: 'Introduction',
			// 			url: '#'
			// 		},
			// 		{
			// 			title: 'Get Started',
			// 			url: '#'
			// 		},
			// 		{
			// 			title: 'Tutorials',
			// 			url: '#'
			// 		},
			// 		{
			// 			title: 'Changelog',
			// 			url: '#'
			// 		}
			// 	]
			// },
			// {
			// 	title: 'Settings',
			// 	url: '#',
			// 	icon: Settings2Icon,
			// 	items: [
			// 		{
			// 			title: 'General',
			// 			url: '#'
			// 		},
			// 		{
			// 			title: 'Team',
			// 			url: '#'
			// 		},
			// 		{
			// 			title: 'Billing',
			// 			url: '#'
			// 		},
			// 		{
			// 			title: 'Limits',
			// 			url: '#'
			// 		}
			// 	]
			// }
		],
		projects: [
			{
				name: 'Dashboard',
				url: '/',
				icon: LayoutDashboard
			}
			// {
			// 	name: 'Sales & Marketing',
			// 	url: '#',
			// 	icon: ChartPieIcon
			// },
			// {
			// 	name: 'Travel',
			// 	url: '#',
			// 	icon: MapIcon
			// }
		]
	};
</script>

<script lang="ts">
	import type { User } from '$lib/../types/user-auth.type';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { LayoutDashboard } from '@lucide/svelte';
	import type { ComponentProps } from 'svelte';
	import NavMain from './nav-main.svelte';
	import NavProjects from './nav-projects.svelte';
	import NavUser from './nav-user.svelte';
	import TeamSwitcher from './team-switcher.svelte';

	let {
		user,
		ref = $bindable(null),
		collapsible = 'icon',
		...restProps
	}: ComponentProps<typeof Sidebar.Root> & { user: User | null } = $props();
</script>

<Sidebar.Root {collapsible} {...restProps}>
	<Sidebar.Header>
		<TeamSwitcher teams={data.teams} />
	</Sidebar.Header>
	<Sidebar.Content>
		<NavProjects projects={data.projects} />
		<NavMain items={data.navMain} />
	</Sidebar.Content>
	<Sidebar.Footer>
		<NavUser {user} />
	</Sidebar.Footer>
	<Sidebar.Rail />
</Sidebar.Root>
