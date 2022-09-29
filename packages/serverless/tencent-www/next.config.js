const path = require('path')
/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
  output: 'standalone',
  outputFileTracing: true,
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../../../')
  }
}

module.exports = nextConfig
