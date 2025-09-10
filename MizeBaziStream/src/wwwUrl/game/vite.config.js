export default {
    build: {
        outDir: './',
        emptyOutDir: false,
        rollupOptions: {
            treeshake: false,
            input: './mafia/index.js',
            output: {
                entryFileNames: 'mafia.min.js',
                format: 'es'
            }
        }
    }
}