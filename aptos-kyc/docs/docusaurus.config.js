// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

/** @type {import('@docusaurus/types').Config} */
const config = {
    title: 'Aptos KYC SDK',
    tagline: 'Complete identity and KYC infrastructure for Aptos blockchain',
    favicon: 'img/favicon.ico',

    url: 'https://aptos-kyc.cognifyr.com',
    baseUrl: '/',

    organizationName: 'cognifyr',
    projectName: 'aptos-kyc',

    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',

    i18n: {
        defaultLocale: 'en',
        locales: ['en'],
    },

    presets: [
        [
            'classic',
            /** @type {import('@docusaurus/preset-classic').Options} */
            ({
                docs: {
                    sidebarPath: require.resolve('./sidebars.js'),
                    editUrl: 'https://github.com/cognifyr/aptos-kyc/tree/main/docs/',
                },
                blog: false,
                theme: {
                    customCss: require.resolve('./src/css/custom.css'),
                },
            }),
        ],
    ],

    themeConfig:
        /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
        ({
            navbar: {
                title: 'Aptos KYC SDK',
                logo: {
                    alt: 'Aptos KYC Logo',
                    src: 'img/logo.svg',
                },
                items: [
                    {
                        type: 'docSidebar',
                        sidebarId: 'tutorialSidebar',
                        position: 'left',
                        label: 'Documentation',
                    },
                    {
                        href: 'https://github.com/cognifyr/aptos-kyc',
                        label: 'GitHub',
                        position: 'right',
                    },
                ],
            },
            footer: {
                style: 'dark',
                links: [
                    {
                        title: 'Documentation',
                        items: [
                            {
                                label: 'Introduction',
                                to: '/docs/intro',
                            },
                            {
                                label: 'Quickstart',
                                to: '/docs/quickstart',
                            },
                        ],
                    },
                    {
                        title: 'Community',
                        items: [
                            {
                                label: 'Discord',
                                href: 'https://discord.gg/aptos',
                            },
                            {
                                label: 'Twitter',
                                href: 'https://twitter.com/cognifyr',
                            },
                        ],
                    },
                    {
                        title: 'More',
                        items: [
                            {
                                label: 'GitHub',
                                href: 'https://github.com/cognifyr/aptos-kyc',
                            },
                            {
                                label: 'Aptos',
                                href: 'https://aptos.dev',
                            },
                        ],
                    },
                ],
                copyright: `Copyright © ${new Date().getFullYear()} Cognifyr. Built with Docusaurus.`,
            },
            prism: {
                theme: require('prism-react-renderer').themes.github,
                darkTheme: require('prism-react-renderer').themes.dracula,
                additionalLanguages: ['move', 'bash', 'json'],
            },
        }),
};

module.exports = config;
