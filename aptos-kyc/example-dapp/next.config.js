/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    env: {
        NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001',
        NEXT_PUBLIC_APTOS_NODE_URL: process.env.NEXT_PUBLIC_APTOS_NODE_URL || 'https://fullnode.testnet.aptoslabs.com/v1',
        NEXT_PUBLIC_APTOS_MODULE_ADDRESS: process.env.NEXT_PUBLIC_APTOS_MODULE_ADDRESS || '0x...',
        NEXT_PUBLIC_APTOS_REGISTRY_ADDRESS: process.env.NEXT_PUBLIC_APTOS_REGISTRY_ADDRESS || '0x...',
    },
}

module.exports = nextConfig
