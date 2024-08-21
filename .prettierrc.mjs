/** @type {import("prettier").Config} */
export default {
	plugins: ["prettier-plugin-astro"],
	overrides: [
		{
			files: "*.astro",
			options: {
				parser: "astro",
			},
		},
	],
	printWidth: 80,
	trailingComma: "all",
	jsxBracketSameLine: false,
	semi: false,
	astroSortOrder: "markup | styles",
	astroAllowShorthand: false,
};
