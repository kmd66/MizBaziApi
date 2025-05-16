export default {
    build: {
        outDir: './',
        emptyOutDir: false,
        rollupOptions: {
            treeshake: false,
            input: './nabardKhande/index.js',
            output: {
                entryFileNames: 'nabardKhande.min.js',
                format: 'es'
            }
        }
    }
}