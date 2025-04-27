export default {
    build: {
        outDir: './',
        emptyOutDir: false,
        rollupOptions: {
            treeshake: false,
            input: './afsonVajeh/index.js',
            output: {
                entryFileNames: 'afsonVajeh.min.js',
                format: 'es'
            }
        }
    }
}