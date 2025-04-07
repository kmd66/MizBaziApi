export default {
    build: {
        outDir: './dist',
        emptyOutDir: false,
        rollupOptions: {
            treeshake: false,
            input: './rangOraz/index.js',
            output: {
                entryFileNames: 'rangOraz.min.js',
                format: 'es'
            }
        }
    }
}