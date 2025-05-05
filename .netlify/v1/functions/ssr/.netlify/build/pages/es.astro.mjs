import { c as createComponent, a as createAstro, b as addAttribute, r as renderHead, d as renderComponent, e as renderTemplate } from '../chunks/astro/server_Chz44DTT.mjs';
import 'kleur/colors';
/* empty css                                 */
/* empty css                                 */
import { $ as $$RootLayout } from '../chunks/RootLayout_t4EE2JkV.mjs';
import { $ as $$Hero, a as $$Contact, b as $$CoreTechnologies, c as $$NextJSIcon, d as $$NestJSIcon, e as $$PostgreSQLIcon, f as $$TypeScriptIcon, g as $$AboutSkills } from '../chunks/AboutSkills_CrjIjB32.mjs';
export { r as renderers } from '../chunks/internal_BsTt5pTQ.mjs';

const $$Astro = createAstro();
const $$Index = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const skills = [
    {
      src: $$NextJSIcon,
      name: "Next.js",
      description: "Cuento con experiencia en el desarrollo de aplicaciones front-end de alto rendimiento, implementando renderizado del lado del servidor y generaci\xF3n de sitios est\xE1ticos."
    },
    {
      src: $$NestJSIcon,
      name: "NestJS",
      description: "Amplia experiencia en la arquitectura y el desarrollo de soluciones de back-end escalables con NestJS, aplicando su conjunto integral de herramientas para el desarrollo de APIs y sistemas complejos."
    },
    {
      src: $$PostgreSQLIcon,
      name: "PostgreSQL",
      description: "Competente en el dise\xF1o y administraci\xF3n de bases de datos relacionales, la elaboraci\xF3n de consultas eficientes y el aseguramiento de la integridad de los datos."
    },
    {
      src: $$TypeScriptIcon,
      name: "TypeScript",
      description: "S\xF3lida experiencia en el uso de TypeScript para mejorar la calidad del c\xF3digo y la mantenibilidad en proyectos tanto de front-end como de back-end."
    }
  ];
  return renderTemplate`<html lang="es"> <head><meta charset="utf-8"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="generator"${addAttribute(Astro2.generator, "content")}><title>Brian Gonzalez | Full-Stack Developer</title>${renderHead()}</head> <body> ${renderComponent($$result, "RootLayout", $$RootLayout, {}, { "default": ($$result2) => renderTemplate` <main> ${renderComponent($$result2, "Hero", $$Hero, { "title": `Saludos. Soy Brian.<br /> Desarollador Full-Stack`, "secondary": "Creando experiencias digitales fluidas a trav\xE9s de soluciones front-end reflexivas y back-end escalables." })} ${renderComponent($$result2, "Contact", $$Contact, { "title": "Contacto" })} ${renderComponent($$result2, "CoreTechnologies", $$CoreTechnologies, { "title": "Core technologies", "summary": "A lo largo de mis dos a\xF1os como desarrollador web, aprovech\xE9 al m\xE1ximo las tecnolog\xEDas resaltadas para contribuir a la edificaci\xF3n y la conservaci\xF3n de aplicaciones web internas orientadas a la optimizaci\xF3n de los procesos operativos en grandes compa\xF1\xEDas.", "skills": skills })} ${renderComponent($$result2, "AboutSkills", $$AboutSkills, { "aboutMeTitle": "Mas all\xE1 del codigo", "aboutMe": "Una fascinaci\xF3n por crear soluciones web funcionales y elegantes ha impulsado mi incursi\xF3n en el desarrollo web, un viaje incre\xEDblemente provechoso. M\xE1s all\xE1 de las tecnolog\xEDas con las que trabajo, considero cruciales mis s\xF3lidas habilidades de resoluci\xF3n de problemas para abordar eficazmente desaf\xEDos de desarrollo complejos. Tambi\xE9n valoro la comunicaci\xF3n clara y la colaboraci\xF3n en equipo, aspectos que he desarrollado en un entorno \xE1gil, asegurando flujos de trabajo de proyectos fluidos y \xE9xito compartido.", "problemSolving": "Mi enfoque ante los desaf\xEDos de desarrollo es met\xF3dico, centr\xE1ndome en entender el problema principal y encontrar soluciones pr\xE1cticas. La experiencia ha consolidado mi capacidad para analizar problemas, solucionar errores con eficacia e implementar arreglos confiables. Valoro el proceso de dar con soluciones claras y l\xF3gicas a los problemas t\xE9cnicos." })} </main> ` })} </body></html>`;
}, "C:/Users/brian/work/briangonzalez/src/pages/es/index.astro", void 0);

const $$file = "C:/Users/brian/work/briangonzalez/src/pages/es/index.astro";
const $$url = "/es";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
