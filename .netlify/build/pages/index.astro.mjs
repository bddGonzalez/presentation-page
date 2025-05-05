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
      description: "Experienced in building performant front-end applications with server-side rendering and static site generation."
    },
    {
      src: $$NestJSIcon,
      name: "NestJS",
      description: "Extensive experience in architecting and developing scalable back-end solutions with NestJS, applying its comprehensive suite of tools for API development and complex systems."
    },
    {
      src: $$PostgreSQLIcon,
      name: "PostgreSQL",
      description: "Proficient in designing and managing relational databases, writing efficient queries, and ensuring data integrity."
    },
    {
      src: $$TypeScriptIcon,
      name: "TypeScript",
      description: "Strongly experienced in using TypeScript to enhance code quality and maintainability across both front-end and back-end projects."
    }
  ];
  return renderTemplate`<html lang="en"> <head><meta charset="utf-8"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="generator"${addAttribute(Astro2.generator, "content")}><title>Brian Gonzalez | Full-Stack Developer</title>${renderHead()}</head> <body> ${renderComponent($$result, "RootLayout", $$RootLayout, {}, { "default": ($$result2) => renderTemplate` <main> ${renderComponent($$result2, "Hero", $$Hero, { "title": `Salutations. I'm Brian.<br /> A full-stack developer.`, "secondary": "Creating seamless digital experiences through thoughtful front-end and scalable back-end solutions." })} ${renderComponent($$result2, "Contact", $$Contact, { "title": "Contact" })} ${renderComponent($$result2, "CoreTechnologies", $$CoreTechnologies, { "title": "Core Technologies", "summary": "During my two years as a web developer, I heavily utilized the technologies highlighted above to contribute to building and maintaining internal web applications focused on streamlining operational workflows within large companies.", "skills": skills })} ${renderComponent($$result2, "AboutSkills", $$AboutSkills, { "aboutMeTitle": "More Than Just Code", "aboutMe": "Driven by a fascination with creating functional and elegant web solutions, my journey into web development has been incredibly rewarding. Beyond the specific technologies I work with, I believe my strong problem-solving abilities are crucial in tackling complex development challenges effectively. I also value clear communication and collaboration within a team, honed through my experience in a fast-paced environment, ensuring smooth project workflows and shared success.", "problemSolving": "I approach development challenges methodically, focusing on understanding the core issue and identifying practical solutions. My experience has strengthened my ability to analyze problems, troubleshoot effectively, and implement reliable fixes. I value the process of finding clear and logical solutions to technical problems." })} </main> ` })} </body></html>`;
}, "C:/Users/brian/work/briangonzalez/src/pages/index.astro", void 0);

const $$file = "C:/Users/brian/work/briangonzalez/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
