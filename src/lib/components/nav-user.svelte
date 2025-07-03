<script lang="ts">
	import { enhance } from '$app/forms';
	import type { User } from '$lib/../types/user-auth.type';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { useSidebar } from '$lib/components/ui/sidebar/index.js';
	import { LogInIcon, Settings2Icon } from '@lucide/svelte';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import LogOutIcon from '@lucide/svelte/icons/log-out';
	import UserIcon from '@lucide/svelte/icons/user';

	let { user }: { user: User | null } = $props();
	const sidebar = useSidebar();

	// Generate user initials for avatar fallback
	function getUserInitials(name: string): string {
		return name
			.split(' ')
			.map((word) => word.charAt(0).toUpperCase())
			.slice(0, 2)
			.join('');
	}

	// If no user is logged in, show login prompt
	if (!user) {
		// You could render a login button or redirect to login page
		// For now, we'll render nothing or a placeholder
	}
</script>

{#if user}
	<Sidebar.Menu>
		<Sidebar.MenuItem>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<Sidebar.MenuButton
							size="lg"
							class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
							{...props}
						>
							<Avatar.Root class="size-8 rounded-lg">
								<Avatar.Image src="" alt={user.name} />
								<Avatar.Fallback class="rounded-lg">{getUserInitials(user.name)}</Avatar.Fallback>
							</Avatar.Root>
							<div class="grid flex-1 text-left text-sm leading-tight">
								<span class="truncate font-medium">{user.name}</span>
								<span class="truncate text-xs">{user.email}</span>
							</div>
							<ChevronsUpDownIcon class="ml-auto size-4" />
						</Sidebar.MenuButton>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content
					class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg"
					side={sidebar.isMobile ? 'bottom' : 'right'}
					align="end"
					sideOffset={4}
				>
					<DropdownMenu.Label class="p-0 font-normal">
						<div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
							<Avatar.Root class="size-8 rounded-lg">
								<Avatar.Image src="" alt={user.name} />
								<Avatar.Fallback class="rounded-lg">{getUserInitials(user.name)}</Avatar.Fallback>
							</Avatar.Root>
							<div class="grid flex-1 text-left text-sm leading-tight">
								<span class="truncate font-medium">{user.name}</span>
								<span class="truncate text-xs">{user.email}</span>
							</div>
						</div>
					</DropdownMenu.Label>
					<DropdownMenu.Separator />
					<DropdownMenu.Group>
						<a href="/settings">
							<DropdownMenu.Item>
								<Settings2Icon />
								Settings
							</DropdownMenu.Item>
						</a>
					</DropdownMenu.Group>
					<DropdownMenu.Separator />
					<form method="post" action="/?/logout" use:enhance>
						<DropdownMenu.Item>
							<button type="submit" class="flex w-full items-center gap-2 text-left">
								<LogOutIcon />
								Log out
							</button>
						</DropdownMenu.Item>
					</form>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</Sidebar.MenuItem>
	</Sidebar.Menu>
{:else}
	<Sidebar.Menu>
		<Sidebar.MenuItem>
			<Sidebar.MenuButton
				size="lg"
				class="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
			>
				{#snippet child({ props })}
					<a href="/auth/login" class="flex w-full items-center gap-3" {...props}>
						<Avatar.Root class="size-8 rounded-lg">
							<Avatar.Image src="" alt="Guest" />
							<Avatar.Fallback class="rounded-lg">
								<UserIcon class="size-4" />
							</Avatar.Fallback>
						</Avatar.Root>
						<div class="grid flex-1 text-left text-sm leading-tight">
							<span class="truncate font-medium">Guest</span>
							<span class="truncate text-xs">Click to login</span>
						</div>
						<LogInIcon class="text-muted-foreground ml-auto size-4" />
					</a>
				{/snippet}
			</Sidebar.MenuButton>
		</Sidebar.MenuItem>
	</Sidebar.Menu>
{/if}
