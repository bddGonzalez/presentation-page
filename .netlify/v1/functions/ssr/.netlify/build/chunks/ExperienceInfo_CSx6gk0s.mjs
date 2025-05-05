import { c as createComponent, a as createAstro, m as maybeRenderHead, b as addAttribute, e as renderTemplate, d as renderComponent, F as Fragment, u as unescapeHTML, g as renderSlot } from './astro/server_Chz44DTT.mjs';
import 'kleur/colors';
import '@astrojs/internal-helpers/path';
import '@astrojs/internal-helpers/remote';
import { $ as $$Image } from './_astro_assets_2ulrfmP7.mjs';
import 'clsx';

const MyPicture = new Proxy({"src":"/_astro/my_picture.xJNsAwFX.jpg","width":2556,"height":3408,"format":"jpg"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "C:/Users/brian/work/briangonzalez/src/my_picture.jpg";
							}
							
							return target[name];
						}
					});

const $$Astro$6 = createAstro();
const $$Separator = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$6, $$props, $$slots);
  Astro2.self = $$Separator;
  const { orientation = "horizontal", style } = Astro2.props;
  const separatorStyle = (orientation === "horizontal" ? "border-bottom: 1px solid black;width:100%;" : "border-left:1px solid black;height:100%;") + style;
  return renderTemplate`${maybeRenderHead()}<div${addAttribute(separatorStyle, "style")}></div>`;
}, "C:/Users/brian/work/briangonzalez/src/components/Separator.astro", void 0);

const $$Astro$5 = createAstro();
const $$ResumeHeader = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$5, $$props, $$slots);
  Astro2.self = $$ResumeHeader;
  const { title, subtitle } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<div class="header"> <div class="picture-container"> ${renderComponent($$result, "Image", $$Image, { "src": MyPicture, "alt": "My picture", "height": 100, "width": 80 })} </div> <div class="hero-container"> <h1 class="hero-text">${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result2) => renderTemplate`${unescapeHTML(title)}` })}</h1> ${subtitle && renderTemplate`<p class="hero-subtitle">${subtitle}</p>`} </div> </div> ${renderComponent($$result, "Separator", $$Separator, {})}`;
}, "C:/Users/brian/work/briangonzalez/src/components/resume/ResumeHeader.astro", void 0);

const $$ResumeContainer = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div style="display:grid;grid-template-columns: auto auto 1fr;"> ${renderSlot($$result, $$slots["default"])} </div>`;
}, "C:/Users/brian/work/briangonzalez/src/components/resume/ResumeContainer.astro", void 0);

const $$ResumeAside = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div style="padding:1rem;display:flex;flex-direction:column;gap:1rem 0;"> ${renderSlot($$result, $$slots["default"])} </div>`;
}, "C:/Users/brian/work/briangonzalez/src/components/resume/aside/ResumeAside.astro", void 0);

const $$Astro$4 = createAstro();
const $$ContactInfo = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$4, $$props, $$slots);
  Astro2.self = $$ContactInfo;
  const { title } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<div class="resume-container"> <h2>${title}</h2> <p>+54 9 11 3340-2988</p> <a href="mailto:briandedgonzalez@gmail.com">briandedgonzalez@gmail.com</a> <a href="http://brianddgonzalez.netlify.app" target="_blank">Portfolio website</a> </div>`;
}, "C:/Users/brian/work/briangonzalez/src/components/resume/aside/ContactInfo.astro", void 0);

const $$Astro$3 = createAstro();
const $$LanguagesInfo = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$LanguagesInfo;
  const { title, languages } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<div class="resume-container"> <h2>${title}</h2> ${languages.map((lang) => renderTemplate`<p>${lang}</p>`)} </div>`;
}, "C:/Users/brian/work/briangonzalez/src/components/resume/aside/LanguagesInfo.astro", void 0);

const $$Astro$2 = createAstro();
const $$SkillsInfo = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$SkillsInfo;
  const { title } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<div class="resume-container"> <h2>${title}</h2> <ul class="skills-info"> <li>TypeScript</li> <li>JavaScript</li> <li>Node.js</li> <li>NestJS</li> <li>Next.js</li> <li>PostgreSQL</li> <li>TypeORM</li> <li>Astro</li> <li>React</li> <ul style="padding:0.5rem;"> <li>UI Libraries</li> <li>Axios</li> <li>Tanstack, Redux</li> </ul> <li>CSS</li> <li>Tailwind CSS</li> <li>HTML</li> <li>Jest, Cypress</li> <li>GIT</li> <li>RESTful APIs</li> </ul> </div>`;
}, "C:/Users/brian/work/briangonzalez/src/components/resume/aside/SkillsInfo.astro", void 0);

const $$ResumeBody = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div style="padding:1rem;display:flex;flex-direction:column;gap:1rem 0;"> ${renderSlot($$result, $$slots["default"])} </div>`;
}, "C:/Users/brian/work/briangonzalez/src/components/resume/body/ResumeBody.astro", void 0);

const $$Astro$1 = createAstro();
const $$ProfileInfo = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$ProfileInfo;
  const { title, text } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<div class="resume-container"> <h2>${title}</h2> <p>${text}</p> </div>`;
}, "C:/Users/brian/work/briangonzalez/src/components/resume/body/ProfileInfo.astro", void 0);

const $$Astro = createAstro();
const $$ExperienceInfo = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$ExperienceInfo;
  const { title, experiences } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<div class="resume-container"> <h2>${title}</h2> ${!!experiences.length && renderTemplate`<div> ${experiences.map((exp) => renderTemplate`<h3>${exp.at}</h3>
        <p style="margin-top: 1rem;">${exp.summary}</p>
        <div> ${!!exp.points?.length && renderTemplate`<ul style="padding:1rem;"> ${exp.points.map((point, i) => renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result2) => renderTemplate` <li>${point}</li> ${i !== exp.points.length - 1 ? renderTemplate`${renderComponent($$result2, "Separator", $$Separator, { "style": "margin:1rem 0;" })}` : false}` })}`)} </ul>`} </div>`)} </div>`} </div>`;
}, "C:/Users/brian/work/briangonzalez/src/components/resume/body/ExperienceInfo.astro", void 0);

export { $$ResumeHeader as $, $$ResumeContainer as a, $$ResumeAside as b, $$ContactInfo as c, $$Separator as d, $$LanguagesInfo as e, $$SkillsInfo as f, $$ResumeBody as g, $$ProfileInfo as h, $$ExperienceInfo as i };
