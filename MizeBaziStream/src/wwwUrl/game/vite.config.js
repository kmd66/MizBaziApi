export default {
    build: {
        outDir: './rangOraz',
        emptyOutDir: false,
        rollupOptions: {
            treeshake: false,
            input: './rangOraz/index.js',
            output: {
                entryFileNames: 'index.min.js',
                format: 'es'
            }
        }
    }
}