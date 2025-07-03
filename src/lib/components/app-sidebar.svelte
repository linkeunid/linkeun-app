<script lang="ts" module>
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
	import { LayoutDashboard, Link2Icon, Nut } from '@lucide/svelte';
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
