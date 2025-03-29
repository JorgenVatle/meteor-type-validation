import pc from 'picocolors';
import { defineConfig, type Options } from 'tsup';

type Plugin = Required<Options>['esbuildPlugins'][number];

export default defineConfig({
    entry: {
        index: 'src/index.ts',
        client: 'src/client/index.ts',
        types: 'src/types/index.ts',
    },
    outDir: 'dist',
    format: ['esm', 'cjs'],
    dts: true,
    external: [],
    platform: 'node',
    target: ['es2022'],
    skipNodeModulesBundle: true,
    sourcemap: true,
    treeshake: true,
    splitting: false,
    clean: true,
    noExternal: ['lodash-es', 'meteor'],
    esbuildPlugins: [
        meteorImportStubs({
            'meteor': (symbol) => `export const Meteor = ${symbol}.Meteor || globalThis.Meteor`,
            'mongo': (symbol) => `export const Mongo = ${symbol}.Mongo || globalThis.Mongo`,
        })
    ]
})

function meteorImportStubs(packages: {
    [key in string]: (symbol: string) => string;
}): Plugin {
    const filter = /^meteor\//;
    let stubId = 0;
    return {
        name: 'meteor-import-stubs',
        setup(build) {
            build.onResolve({ filter }, (args) => {
                return { path: args.path.replace(filter, '') , namespace: 'meteor' }
            })
            
            build.onLoad({ filter: /.*/, namespace: 'meteor' }, (args) => {
                console.log(pc.cyan(`Stubbing Meteor package import: '${pc.green(args.path)}'`));
                
                const [packageName] = args.path.split('/');
                const stubFunction = packages[packageName];
                
                if (!stubFunction) {
                    throw new Error('Meteor package is missing stubs: ' + pc.yellow(args.path));
                }
                
                const stubSymbol = `PackageStub_${stubId++}`;
                return {
                    contents: `
                        const ${stubSymbol} = globalThis.Package?.[${JSON.stringify(packageName)}];
                        ${stubFunction(stubSymbol)}
                    `
                }
            })
        }
    } satisfies Plugin;
}