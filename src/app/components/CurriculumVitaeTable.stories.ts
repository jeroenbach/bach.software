import type { Meta, StoryObj } from '@storybook/vue3-vite';

import CurriculumVitaeTable from '~/components/CurriculumVitaeTable.vue';

const curriculumVitae: CurriculumVitaeItem[] = [
  {
    title: 'Software Engineer | Team Lead',
    company: 'Bach.Software',
    date: 'Jul 2018 - Present',
    description: 'As freelancer I delivered a wide range of full-stack solutions for both public and private sector clients, with a strong focus on scalable, secure and maintainable architectures. Highlights include:\n- Built a secure data management portal for cross-border investigations, using Kubernetes, Vue 3, .NET 8, and Azure DevOps, for a large European Institution.\n- Designed and developed several modern e-commerce platforms for B2C and B2B clients, using Vue.js, React, Node.js, and Salesforce.\n Projects included implementing server-side rendering, containerized deployments, and CI/CD on Azure.\n- Led a cross-functional team of 8, including developers, testers and UX specialist, to deliver a full-featured webshop and customer portal tailored for business users.',
    technologies: [
      'Vue.js',
      'React.js',
      'TypeScript',
      '.NET',
      'Node.js',
      'Kubernetes',
      'Azure DevOps',
      'HTML & CSS',
    ],
  },
  {
    title: 'Co-Founder | Developer',
    company: 'Sofia Vera',
    date: 'Dec 2021 - Jul 2023',
    description: 'Co-founded a luxury women\'s fashion brand. Led brand identity development, e-commerce implementation, and online marketing strategy. Built and maintained the website and infrastructure. Key contributions:\n\n- Created a performant and secure Prestashop-based e-commerce site.\n- Implemented scalable hosting with Azure Kubernetes Service and Cloudflare Workers.',
    technologies: [
      'Prestashop',
      'Azure Kubernetes Service',
      'Cloudflare Workers',
      'HTML & CSS',
    ],
  },
  {
    title: 'Team Lead Microsoft .NET Development',
    company: 'PVH (Tommy Hilfiger, Calvin Klein & others)',
    date: 'Aug 2017 - Jun 2018',
    description: 'Led a 12-person development team at PVH, responsible for hiring, performance management, and aligning individual growth with business goals. Key project:\n\n- Customer Management Portal:\n Developed a portal to support onboarding of new customers into SAP, handling tasks like credit checks and insurance requests.\n Built with React.js, Redux, and .NET, with integrations to SAP.',
    technologies: [
      'React.js',
      'Redux',
      '.NET',
      'C#',
      'SAP Integration',
    ],
  },
  {
    title: 'Senior Microsoft .NET Developer',
    company: 'PVH (Tommy Hilfiger, Calvin Klein & others)',
    date: 'Jun 2014 - Jul 2017',
    description: 'Delivered a variety of employee portals and internal applications within the Microsoft Development team, including:\n\n- SAP Customer Setup, Chargebacks, Trade Discount, and Store Master Data management portals.\n\n Worked across the full stack using .NET Forms & MVC, C#, JavaScript (with jQuery, React.js, Knockout.js), and SharePoint. Built workflows with NINTEX, and handled data flows with SQL Server and SQL Server Integration Services (SSIS).',
    technologies: [
      '.NET',
      'C#',
      'JavaScript',
      'jQuery',
      'React.js',
      'Knockout.js',
      'SharePoint',
      'NINTEX Workflows',
      'SQL Server',
      'SSIS',
    ],
  },
  {
    title: 'Software Developer / Consultant',
    company: 'Avanade',
    date: 'Aug 2007 - Aug 2008 & Feb 2010 - May 2014',
    description: 'Delivered enterprise-grade software solutions across multiple industries, including insurance, banking, music licensing, and government. Key projects included:\n\n- Achmea - Portal Factory:\n Led one of two scrum teams to build a reusable component and portal factory to streamline development of customer portals across multiple insurance brands. Acted as Team Lead and Solution Architect, designing and implementing components using C#, .NET, and WCF integrated via SOAP services.\n\n- BUMA/STEMRA - Customer Portal:\n Built a data-rich portal allowing music rights holders to manage licenses and usage information. Used ASP.NET Ajax, jQuery, and WCF to integrate with ERP and data warehouse systems.\n\n- KIWA / AFM / Friesland Bank / Centraal Beheer / ING / PWN:\n Developed portals using ASP.NET, SharePoint, BizTalk, WCF, CRM, and front-end tech (HTML, CSS, JavaScript/jQuery) to automate product ordering and customer workflows.\n\n Projects spanned the full stack, often integrating complex backend systems with responsive, user-focused front ends.',
    technologies: [
      'C#',
      'ASP.NET',
      'WCF',
      'SOAP',
      'jQuery',
      'HTML',
      'CSS',
      'JavaScript',
      'SharePoint',
      'BizTalk',
      'Microsoft CRM',
      'SQL Server',
    ],
  },
  {
    title: 'Co-founder / Developer',
    company: 'Eludus',
    date: 'Jan 2007 - Dec 2013 (part-time)',
    description: 'Co-founded Eludus with two friends as a side project, originally intended to build a tournament platform.\nThe company evolved into a small digital agency delivering websites, webshops, and custom backend systems for SMEs.',
    technologies: [
      'C#',
      '.NET',
      'PHP',
      'JavaScript',
      'HTML',
      'CSS',
      'WordPress',
      'Magento',
      'Flash',
    ],
  },
];
const meta = {
  title: 'Components/CurriculumVitaeTable',
  component: CurriculumVitaeTable,
  args: {
    curriculumVitae,
  },
  render: args => ({
    components: { CurriculumVitaeTable },
    setup() {
      return { args };
    },
    template: `<CurriculumVitaeTable v-bind="args" />`,
  }),
} satisfies Meta<typeof CurriculumVitaeTable>;

export default meta;
export type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {} as Story['args'],
};
