export default {
    build: {
        outDir: './rangOraz/dist',
        emptyOutDir: true,
        rollupOptions: {
            input: './rangOraz/index.js',
            output: {
                entryFileNames: 'bundle.js',
                format: 'es'
            }
        }
    }
}