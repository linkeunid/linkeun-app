<script lang="ts">
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';

	let {
		checked = $bindable(),
		indeterminate = false,
		onCheckedChange,
		'aria-label': ariaLabel,
		...restProps
	}: {
		checked?: boolean;
		indeterminate?: boolean;
		onCheckedChange?: (checked: boolean) => void;
		'aria-label'?: string;
		[key: string]: any;
	} = $props();

	function handleCheckedChange(value: boolean | 'indeterminate') {
		const booleanValue = value === true;
		checked = booleanValue;
		onCheckedChange?.(booleanValue);
	}
</script>

<Checkbox
	{...restProps}
	bind:checked
	{indeterminate}
	onCheckedChange={handleCheckedChange}
	aria-label={ariaLabel}
/>