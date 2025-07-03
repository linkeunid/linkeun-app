<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import { setLocale } from '$lib/paraglide/runtime';
</script>

<svelte:head>
	<title>Paraglide Demo - LinkeunApp</title>
	<meta
		name="description"
		content="Internationalization demo using Paraglide for multi-language support with real-time language switching."
	/>
	<meta property="og:title" content="Paraglide Demo - LinkeunApp" />
	<meta
		property="og:description"
		content="Internationalization demo using Paraglide for multi-language support with real-time language switching."
	/>
	<meta property="og:type" content="website" />
</svelte:head>

<h1>{m.hello_world({ name: 'SvelteKit User' })}</h1>
<div>
	<button onclick={() => setLocale('en')}>en</button>
	<button onclick={() => setLocale('id')}>id</button>
	<button onclick={() => setLocale('jp')}>jp</button>
</div>
<p>
	If you use VSCode, install the <a
		href="https://marketplace.visualstudio.com/items?itemName=inlang.vs-code-extension"
		target="_blank">Sherlock i18n extension</a
	> for a better i18n experience.
</p>
