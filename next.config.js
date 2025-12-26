/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        // ⚠️ Ignorar errores de TypeScript durante el build
        ignoreBuildErrors: true,
    },
    eslint: {
        // ⚠️ Ignorar errores de ESLint durante el build
        ignoreDuringBuilds: true,
    },
}

module.exports = nextConfig
