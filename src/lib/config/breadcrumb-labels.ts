// Configuration for route labels
export const routeLabels: Record<string, string> = {
	demo: 'Demos',
	lucia: 'Lucia Auth',
	auth: 'Authentication',
	login: 'Login',
	register: 'Register',
	verify: 'Verify Account',
	paraglide: 'Paraglide i18n',
	settings: 'Settings'
};

// Configuration for dynamic route patterns
export const dynamicRouteLabels: Record<string, string> = {
	'[token]': 'Token Verification',
	'[id]': 'Details',
	'[slug]': 'Item',
	'[...rest]': 'Path'
};

// Function to convert segment to readable label
export function segmentToLabel(segment: string): string {
	// Check if it's a configured route
	if (routeLabels[segment]) {
		return routeLabels[segment];
	}

	// Check if it's a dynamic route
	if (segment.startsWith('[') && segment.endsWith(']')) {
		return dynamicRouteLabels[segment] || 'Details';
	}

	// Default transformation: kebab-case to Title Case
	return segment
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}
