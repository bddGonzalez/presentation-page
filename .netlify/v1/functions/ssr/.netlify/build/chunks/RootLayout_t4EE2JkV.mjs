import { A as AstroError, h as MissingLocale, c as createComponent, s as spreadAttributes, u as unescapeHTML, e as renderTemplate, a as createAstro, d as renderComponent, i as renderScript, m as maybeRenderHead, b as addAttribute, g as renderSlot } from './astro/server_Chz44DTT.mjs';
import 'kleur/colors';
import { appendForwardSlash, joinPaths } from '@astrojs/internal-helpers/path';
import 'clsx';
/* empty css                         */

function shouldAppendForwardSlash(trailingSlash, buildFormat) {
  switch (trailingSlash) {
    case "always":
      return true;
    case "never":
      return false;
    case "ignore": {
      switch (buildFormat) {
        case "directory":
          return true;
        case "preserve":
        case "file":
          return false;
      }
    }
  }
}

function getLocaleRelativeUrl({
  locale,
  base,
  locales: _locales,
  trailingSlash,
  format,
  path,
  prependWith,
  normalizeLocale = true,
  strategy = "pathname-prefix-other-locales",
  defaultLocale
}) {
  const codeToUse = peekCodePathToUse(_locales, locale);
  if (!codeToUse) {
    throw new AstroError({
      ...MissingLocale,
      message: MissingLocale.message(locale)
    });
  }
  const pathsToJoin = [base, prependWith];
  const normalizedLocale = normalizeLocale ? normalizeTheLocale(codeToUse) : codeToUse;
  if (strategy === "pathname-prefix-always" || strategy === "pathname-prefix-always-no-redirect" || strategy === "domains-prefix-always" || strategy === "domains-prefix-always-no-redirect") {
    pathsToJoin.push(normalizedLocale);
  } else if (locale !== defaultLocale) {
    pathsToJoin.push(normalizedLocale);
  }
  pathsToJoin.push(path);
  let relativePath;
  if (shouldAppendForwardSlash(trailingSlash, format)) {
    relativePath = appendForwardSlash(joinPaths(...pathsToJoin));
  } else {
    relativePath = joinPaths(...pathsToJoin);
  }
  if (relativePath === "") {
    return "/";
  }
  return relativePath;
}
function normalizeTheLocale(locale) {
  return locale.replaceAll("_", "-").toLowerCase();
}
function peekCodePathToUse(locales, locale) {
  for (const loopLocale of locales) {
    if (typeof loopLocale === "string") {
      if (loopLocale === locale) {
        return loopLocale;
      }
    } else {
      for (const code of loopLocale.codes) {
        if (code === locale) {
          return loopLocale.path;
        }
      }
    }
  }
  return void 0;
}

function toRoutingStrategy(routing, domains) {
  let strategy;
  const hasDomains = domains ? Object.keys(domains).length > 0 : false;
  if (routing === "manual") {
    strategy = "manual";
  } else {
    if (!hasDomains) {
      {
        strategy = "pathname-prefix-other-locales";
      }
    } else {
      {
        strategy = "domains-prefix-other-locales";
      }
    }
  }
  return strategy;
}

var define_ASTRO_INTERNAL_I18N_CONFIG_default = { format: "directory", trailingSlash: "ignore", i18n: { defaultLocale: "en", locales: ["es", "en"], routing: { } }};
const { trailingSlash, format, i18n} = (
  // @ts-expect-error
  define_ASTRO_INTERNAL_I18N_CONFIG_default
);
const { defaultLocale, locales, domains, routing } = i18n;
const base = "/";
let strategy = toRoutingStrategy(routing, domains);
const getRelativeLocaleUrl = (locale, path, options) => getLocaleRelativeUrl({
  locale,
  path,
  base,
  trailingSlash,
  format,
  defaultLocale,
  locales,
  strategy,
  ...options
});

function createSvgComponent({ meta, attributes, children }) {
  const Component = createComponent((_, props) => {
    const normalizedProps = normalizeProps(attributes, props);
    return renderTemplate`<svg${spreadAttributes(normalizedProps)}>${unescapeHTML(children)}</svg>`;
  });
  return Object.assign(Component, meta);
}
const ATTRS_TO_DROP = ["xmlns", "xmlns:xlink", "version"];
const DEFAULT_ATTRS = {};
function dropAttributes(attributes) {
  for (const attr of ATTRS_TO_DROP) {
    delete attributes[attr];
  }
  return attributes;
}
function normalizeProps(attributes, props) {
  return dropAttributes({ ...DEFAULT_ATTRS, ...attributes, ...props });
}

const Cross = createSvgComponent({"meta":{"src":"/_astro/cross.BrxILM0v.svg","width":800,"height":800,"format":"svg"},"attributes":{"width":"800px","height":"800px","viewBox":"0 -0.5 25 25","fill":"none"},"children":"\r\n<path d=\"M6.96967 16.4697C6.67678 16.7626 6.67678 17.2374 6.96967 17.5303C7.26256 17.8232 7.73744 17.8232 8.03033 17.5303L6.96967 16.4697ZM13.0303 12.5303C13.3232 12.2374 13.3232 11.7626 13.0303 11.4697C12.7374 11.1768 12.2626 11.1768 11.9697 11.4697L13.0303 12.5303ZM11.9697 11.4697C11.6768 11.7626 11.6768 12.2374 11.9697 12.5303C12.2626 12.8232 12.7374 12.8232 13.0303 12.5303L11.9697 11.4697ZM18.0303 7.53033C18.3232 7.23744 18.3232 6.76256 18.0303 6.46967C17.7374 6.17678 17.2626 6.17678 16.9697 6.46967L18.0303 7.53033ZM13.0303 11.4697C12.7374 11.1768 12.2626 11.1768 11.9697 11.4697C11.6768 11.7626 11.6768 12.2374 11.9697 12.5303L13.0303 11.4697ZM16.9697 17.5303C17.2626 17.8232 17.7374 17.8232 18.0303 17.5303C18.3232 17.2374 18.3232 16.7626 18.0303 16.4697L16.9697 17.5303ZM11.9697 12.5303C12.2626 12.8232 12.7374 12.8232 13.0303 12.5303C13.3232 12.2374 13.3232 11.7626 13.0303 11.4697L11.9697 12.5303ZM8.03033 6.46967C7.73744 6.17678 7.26256 6.17678 6.96967 6.46967C6.67678 6.76256 6.67678 7.23744 6.96967 7.53033L8.03033 6.46967ZM8.03033 17.5303L13.0303 12.5303L11.9697 11.4697L6.96967 16.4697L8.03033 17.5303ZM13.0303 12.5303L18.0303 7.53033L16.9697 6.46967L11.9697 11.4697L13.0303 12.5303ZM11.9697 12.5303L16.9697 17.5303L18.0303 16.4697L13.0303 11.4697L11.9697 12.5303ZM13.0303 11.4697L8.03033 6.46967L6.96967 7.53033L11.9697 12.5303L13.0303 11.4697Z\" fill=\"#000000\" />\r\n"});

const $$Astro$2 = createAstro();
const $$CrossIcon = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$CrossIcon;
  const { width, height } = Astro2.props;
  return renderTemplate`${renderComponent($$result, "Cross", Cross, { "width": width ?? 50, "height": height ?? 50 })}`;
}, "C:/Users/brian/work/briangonzalez/src/components/icons/CrossIcon.astro", void 0);

const HamburgerMenu = createSvgComponent({"meta":{"src":"/_astro/hamburger-menu.DksBxu9w.svg","width":800,"height":800,"format":"svg"},"attributes":{"width":"800px","height":"800px","viewBox":"0 0 24 24","fill":"none"},"children":"\r\n<path d=\"M20 7L4 7\" stroke=\"#1C274C\" stroke-width=\"1.5\" stroke-linecap=\"round\" />\r\n<path d=\"M20 12L4 12\" stroke=\"#1C274C\" stroke-width=\"1.5\" stroke-linecap=\"round\" />\r\n<path d=\"M20 17L4 17\" stroke=\"#1C274C\" stroke-width=\"1.5\" stroke-linecap=\"round\" />\r\n"});

const $$Astro$1 = createAstro();
const $$HamburgerMenuIcon = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$HamburgerMenuIcon;
  const { width, height } = Astro2.props;
  return renderTemplate`${renderComponent($$result, "HamburgerMenu", HamburgerMenu, { "width": width ?? 50, "height": height ?? 50 })}`;
}, "C:/Users/brian/work/briangonzalez/src/components/icons/HamburgerMenuIcon.astro", void 0);

const $$Astro = createAstro();
const $$Navigation = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Navigation;
  const links = [
    {
      href: getRelativeLocaleUrl(Astro2.currentLocale ?? "en", "resume"),
      label: "Resume"
    }
  ];
  const pushedLinks = [
    /* {
      href: "https://www.linkedin.com/in/brian-gonzalez-a96a38359/",
      Icon: LinkedInIcon,
    },
    { href: "mailto:briandedgonzalez@gmail.com", Icon: EmailIcon },
    {
      href: "https://github.com/bddGonzalez",
      Icon: GithubIcon,
      extraProps: { width: 40, height: 40 },
    }, */
  ];
  const prefersSpanishAndIsInEn = Astro2.preferredLocale === "es" && !Astro2.originPathname.includes("/es");
  const pathname = Astro2.originPathname.replace("/es", "");
  return renderTemplate`${prefersSpanishAndIsInEn && renderTemplate`${maybeRenderHead()}<div style="width:100%;background-color:#e8e8e8;padding:1rem;font-weight: 900;display:flex;gap:20px;" id="language-change-prompt">
¿Cambiar a español?${" "}<a style="color: #1F3760; text-decoration:underline;"${addAttribute(getRelativeLocaleUrl("es", pathname), "href")}>
Si
</a><button id="reject-language-change" style="color: #1F3760; text-decoration:underline;">
No
</button></div>`}<nav> <button id="btn-open" class="nav-open" aria-expanded="false">${renderComponent($$result, "HamburgerMenuIcon", $$HamburgerMenuIcon, {})}</button> <div class="nav-overlay"></div> <div class="nav-content"> <button id="btn-close" class="nav-close">${renderComponent($$result, "CrossIcon", $$CrossIcon, {})}</button> <ul class="nav-links"> ${links.map(({ href, label, Icon, extraProps }) => renderTemplate`<li style="list-style: none !important;"> <a${addAttribute(href, "href")} style="font-weight:bolder;"> ${label && renderTemplate`<p>${label}</p>`} ${Icon && renderTemplate`${renderComponent($$result, "Icon", Icon, { ...extraProps })}`} </a> </li>`)} <div class="pushed-links"> ${pushedLinks.map(({ href, label, Icon, extraProps }) => renderTemplate`<li> <a${addAttribute(href, "href")} style="font-weight:bolder;" target="_blank"> ${label && renderTemplate`<p>${label}</p>`} ${Icon && renderTemplate`${renderComponent($$result, "Icon", Icon, { ...extraProps })}`} </a> </li>`)} </div> </ul> </div> </nav> ${renderScript($$result, "C:/Users/brian/work/briangonzalez/src/components/Navigation.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/brian/work/briangonzalez/src/components/Navigation.astro", void 0);

const $$RootLayout = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Navigation", $$Navigation, {})} ${renderSlot($$result, $$slots["default"])}`;
}, "C:/Users/brian/work/briangonzalez/src/layouts/RootLayout.astro", void 0);

export { $$RootLayout as $, createSvgComponent as c };
