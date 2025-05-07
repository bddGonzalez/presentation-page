import { r as renderers } from './chunks/internal_BsTt5pTQ.mjs';
import { s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_CvSoi7hX.mjs';
import { manifest } from './manifest_Bc4VwmVv.mjs';
import { createExports } from '@astrojs/netlify/ssr-function.js';

const serverIslandMap = new Map([
	['Navigation', () => import('./chunks/Navigation_nMEqwvP7.mjs')],
]);;

const _page0 = () => import('./pages/es/resume.astro.mjs');
const _page1 = () => import('./pages/es.astro.mjs');
const _page2 = () => import('./pages/resume.astro.mjs');
const _page3 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["src/pages/es/resume.astro", _page0],
    ["src/pages/es/index.astro", _page1],
    ["src/pages/resume.astro", _page2],
    ["src/pages/index.astro", _page3]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./_noop-actions.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "4b237e8e-886d-4c8a-916a-90d9665f0108"
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (_start in serverEntrypointModule) {
	serverEntrypointModule[_start](_manifest, _args);
}

export { __astrojsSsrVirtualEntry as default, pageMap };
