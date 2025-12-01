import { resolve } from 'path';

export default function NotificationsPlugin() {
    const pluginPath = resolve(__dirname);

    return {
        name: 'notifications-plugin',
        config: () => ({
            build: {
                rollupOptions: {
                    input: {
                        'notifications': resolve(pluginPath, 'resources/js/app.ts'),
                    },
                    output: {
                        entryFileNames: 'js/[name].js',
                        chunkFileNames: 'js/[name].js',
                        assetFileNames: (assetInfo) => {
                            if (assetInfo.name.endsWith('.css')) {
                                return 'css/[name][extname]';
                            }
                            return 'assets/[name][extname]';
                        },
                    },
                },
                outDir: resolve(pluginPath, 'dist'),
                emptyOutDir: true,
            },
        }),
    };
}
