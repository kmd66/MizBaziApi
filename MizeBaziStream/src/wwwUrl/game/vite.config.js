export default {
    build: {
        outDir: './',
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