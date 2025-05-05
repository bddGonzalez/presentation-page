import { c as createComponent, a as createAstro, b as addAttribute, r as renderHead, d as renderComponent, e as renderTemplate } from '../chunks/astro/server_Chz44DTT.mjs';
import 'kleur/colors';
/* empty css                                 */
/* empty css                                  */
import { $ as $$RootLayout } from '../chunks/RootLayout_t4EE2JkV.mjs';
import { $ as $$ResumeHeader, a as $$ResumeContainer, b as $$ResumeAside, c as $$ContactInfo, d as $$Separator, e as $$LanguagesInfo, f as $$SkillsInfo, g as $$ResumeBody, h as $$ProfileInfo, i as $$ExperienceInfo } from '../chunks/ExperienceInfo_CSx6gk0s.mjs';
export { r as renderers } from '../chunks/internal_BsTt5pTQ.mjs';

const $$Astro = createAstro();
const $$Resume = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Resume;
  return renderTemplate`<html lang="en"> <head><meta charset="utf-8"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="generator"${addAttribute(Astro2.generator, "content")}><title>Brian Gonzalez | Full-Stack Developer</title>${renderHead()}</head> <body> ${renderComponent($$result, "RootLayout", $$RootLayout, {}, { "default": ($$result2) => renderTemplate` <main> ${renderComponent($$result2, "ResumeHeader", $$ResumeHeader, { "title": "Brian Gonzalez", "subtitle": "Full-Stack Developer" })} ${renderComponent($$result2, "ResumeContainer", $$ResumeContainer, {}, { "default": ($$result3) => renderTemplate` ${renderComponent($$result3, "ResumeAside", $$ResumeAside, {}, { "default": ($$result4) => renderTemplate` ${renderComponent($$result4, "ContactInfo", $$ContactInfo, { "title": "Contact" })} ${renderComponent($$result4, "Separator", $$Separator, {})} ${renderComponent($$result4, "LanguagesInfo", $$LanguagesInfo, { "title": "Languages", "languages": ["Spanish", "English"] })} ${renderComponent($$result4, "Separator", $$Separator, {})} ${renderComponent($$result4, "SkillsInfo", $$SkillsInfo, { "title": "Skills" })} ` })} ${renderComponent($$result3, "Separator", $$Separator, { "orientation": "vertical" })} ${renderComponent($$result3, "ResumeBody", $$ResumeBody, {}, { "default": ($$result4) => renderTemplate` ${renderComponent($$result4, "ProfileInfo", $$ProfileInfo, { "title": "Profile", "text": "Versatile Full-Stack Developer proficient in building scalable web applications with a strong emphasis on clean code and efficient problem-solving." })} ${renderComponent($$result4, "Separator", $$Separator, {})} ${renderComponent($$result4, "ExperienceInfo", $$ExperienceInfo, { "title": "Work Experience", "experiences": [
    {
      at: "Junior Full-Stack Developer, Binks, October 2023 \u2013 Present",
      summary: "My experience at Binks provided a strong foundation in full-stack development and Clean Code best practices. These skills have been directly applied and further developed in the following projects, demonstrating my ability to successfully tackle complex technical challenges to deliver project goals.",
      points: [
        "Developed and maintained a specialized construction management system with complex requirements for a medium-sized enterprise. As a key member of a small team, I contributed extensively to both the client-side (TypeScript, Next.js, Ant Design, Zod, React Hook Form, Redux Toolkit Query) and the server-side (TypeScript, NestJS, TypeORM, PostgreSQL). A significant challenge involved designing and implementing the back-end logic to calculate, parse, and generate massive PDF files containing employee paychecks, ensuring accuracy and performance for a large volume of data. I also proactively identified, diagnosed, and resolved several critical production issues, ensuring system stability and minimizing user impact.",
        "As a Full-Stack Developer within a small team, I was instrumental in building a multi-tenant SaaS platform for construction management. My responsibilities encompassed the entire technology stack, from developing the user-facing control panel and application front-ends (utilizing TypeScript, React-based libraries like Shadcn UI and TanStack Query, Axios, and Socket.IO Client) to architecting a complex NestJS back-end with TypeORM and PostgreSQL. Key backend contributions included implementing intricate CORS logic, a singleton pattern for managing dynamic tenant database connections, and the automated provisioning of new tenant databases with associated data migration. I also integrated Redis for caching, Socket.IO for real-time gateways, and a third-party mailing library for invitations."
      ]
    }
  ] })} ` })} ` })} </main> ` })} </body></html>`;
}, "C:/Users/brian/work/briangonzalez/src/pages/resume.astro", void 0);

const $$file = "C:/Users/brian/work/briangonzalez/src/pages/resume.astro";
const $$url = "/resume";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Resume,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
