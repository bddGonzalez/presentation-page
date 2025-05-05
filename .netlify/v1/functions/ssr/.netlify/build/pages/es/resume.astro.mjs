import { c as createComponent, a as createAstro, b as addAttribute, r as renderHead, d as renderComponent, e as renderTemplate } from '../../chunks/astro/server_Chz44DTT.mjs';
import 'kleur/colors';
/* empty css                                    */
/* empty css                                     */
import { $ as $$RootLayout } from '../../chunks/RootLayout_t4EE2JkV.mjs';
import { $ as $$ResumeHeader, a as $$ResumeContainer, b as $$ResumeAside, c as $$ContactInfo, d as $$Separator, e as $$LanguagesInfo, f as $$SkillsInfo, g as $$ResumeBody, h as $$ProfileInfo, i as $$ExperienceInfo } from '../../chunks/ExperienceInfo_CSx6gk0s.mjs';
export { r as renderers } from '../../chunks/internal_BsTt5pTQ.mjs';

const $$Astro = createAstro();
const $$Resume = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Resume;
  return renderTemplate`<html lang="en"> <head><meta charset="utf-8"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="generator"${addAttribute(Astro2.generator, "content")}><title>Brian Gonzalez | Full-Stack Developer</title>${renderHead()}</head> <body> ${renderComponent($$result, "RootLayout", $$RootLayout, {}, { "default": ($$result2) => renderTemplate` <main> ${renderComponent($$result2, "ResumeHeader", $$ResumeHeader, { "title": "Brian Gonzalez", "subtitle": "Full-Stack Developer" })} ${renderComponent($$result2, "ResumeContainer", $$ResumeContainer, {}, { "default": ($$result3) => renderTemplate` ${renderComponent($$result3, "ResumeAside", $$ResumeAside, {}, { "default": ($$result4) => renderTemplate` ${renderComponent($$result4, "ContactInfo", $$ContactInfo, { "title": "Contacto" })} ${renderComponent($$result4, "Separator", $$Separator, {})} ${renderComponent($$result4, "LanguagesInfo", $$LanguagesInfo, { "title": "Idiomas", "languages": ["Espa\xF1ol", "Ingles"] })} ${renderComponent($$result4, "Separator", $$Separator, {})} ${renderComponent($$result4, "SkillsInfo", $$SkillsInfo, { "title": "Habilidades" })} ` })} ${renderComponent($$result3, "Separator", $$Separator, { "orientation": "vertical" })} ${renderComponent($$result3, "ResumeBody", $$ResumeBody, {}, { "default": ($$result4) => renderTemplate` ${renderComponent($$result4, "ProfileInfo", $$ProfileInfo, { "title": "Perfil", "text": "Vers\xE1til Desarrollador Full-Stack competente en la construcci\xF3n de aplicaciones web escalables con un fuerte \xE9nfasis en el c\xF3digo limpio y la resoluci\xF3n eficiente de problemas." })} ${renderComponent($$result4, "Separator", $$Separator, {})} ${renderComponent($$result4, "ExperienceInfo", $$ExperienceInfo, { "title": "Experiencia", "experiences": [
    {
      at: "Junior Full-Stack Developer, Binks, Octubre 2023 \u2013 Actualidad",
      summary: "Mi experiencia en Binks proporcion\xF3 una base s\xF3lida en el desarrollo Full-Stack y las mejores pr\xE1cticas de Clean Code. Estas habilidades se han aplicado directamente y desarrollado en los siguientes proyectos.",
      points: [
        "Desarroll\xE9 y mantuve un sistema especializado de gesti\xF3n de la construcci\xF3n con requisitos complejos para una empresa mediana. Como miembro clave de un equipo peque\xF1o, contribu\xED ampliamente tanto al lado del cliente como al lado del servidor. Un desaf\xEDo importante consisti\xF3 en dise\xF1ar e implementar la l\xF3gica de back-end para calcular, analizar y generar archivos PDF masivos que contienen cheques de pago de los empleados, asegurando la precisi\xF3n y el rendimiento de un gran volumen de datos. Tambi\xE9n identifiqu\xE9 y resolv\xED proactivamente varios problemas cr\xEDticos de producci\xF3n, asegurando la estabilidad del sistema y minimizando el impacto del usuario.",
        "Como desarrollador de Full-Stack dentro de un peque\xF1o equipo, fui fundamental en la construcci\xF3n de una plataforma SaaS multi-tenant para la gesti\xF3n de la construcci\xF3n. Mis responsabilidades abarcaron toda la pila de tecnolog\xEDa, desde el desarrollo del panel de control orientado al usuario y los front-ends de las aplicaciones hasta la creaci\xF3n de un complejo back-end NestJS. Las contribuciones clave del backend incluyeron la implementaci\xF3n de una intrincada l\xF3gica CORS, un patr\xF3n de singleton para administrar conexiones din\xE1micas de bases de datos de tenants y el aprovisionamiento automatizado de nuevas bases de datos de tenants con migraci\xF3n de datos asociada."
      ]
    }
  ] })} ` })} ` })} </main> ` })} </body></html>`;
}, "C:/Users/brian/work/briangonzalez/src/pages/es/resume.astro", void 0);

const $$file = "C:/Users/brian/work/briangonzalez/src/pages/es/resume.astro";
const $$url = "/es/resume";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Resume,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
