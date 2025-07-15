<script lang="ts">
	import { DateTime } from 'luxon';
	import { siteConfig } from '../config/site';

	// Get current year dynamically
	const currentYear = DateTime.now().year;
</script>

<footer class="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-t backdrop-blur">
	<div class="container mx-auto px-4 py-6">
		<div class="flex flex-col items-center justify-between gap-4 md:flex-row">
			<!-- Copyright -->
			<div class="text-muted-foreground text-center text-sm md:text-left">
				&copy; {currentYear}
				{siteConfig.siteName}. All rights reserved.
			</div>

			<!-- Made with love section -->
			<!-- <div
				class="text-muted-foreground flex flex-col items-center gap-2 text-center text-sm md:flex-row md:gap-4"
			>
				<div class="flex items-center gap-1">
					Made with
					<b class="font-bold text-red-500">heart</b>
					and
					<span class="font-medium text-[#756656]">Liong Bulan Coffee</span>
					+
					<span class="font-medium text-[#923649]">Signature Kretek</span>
				</div>
			</div> -->

			<!-- Links -->
			<div class="flex flex-wrap justify-center gap-4 text-sm md:justify-end">
				<a
					href={`mailto:${siteConfig.siteEmail}`}
					class="text-muted-foreground hover:text-foreground transition-colors"
				>
					Contact
				</a>
				<a href="/tools" class="text-muted-foreground hover:text-foreground transition-colors">
					Tools
				</a>
				<a href="/links" class="text-muted-foreground hover:text-foreground transition-colors">
					Links
				</a>
				<a
					href={siteConfig.siteGithub}
					target="_blank"
					rel="noopener noreferrer"
					class="text-muted-foreground hover:text-foreground transition-colors"
				>
					GitHub
				</a>
			</div>
		</div>

		<!-- Bottom signature row -->
		<div class="border-border/50 mt-4 border-t pt-4">
			<div class="text-muted-foreground/80 text-center text-xs">
				Crafted with precision • Powered by SvelteKit and <span class="font-medium text-[#756656]"
					>Liong Bulan Coffee</span
				>
				+ <span class="font-medium text-[#923649]">Signature Kretek</span>
			</div>
		</div>
	</div>
</footer>
