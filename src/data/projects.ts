export const projects = [
  {
    slug: "mrsl",
    name: "MRSL",
    subtitle: "A considered home for a property business.",
    category: "Client website",
    stack: "Astro · TypeScript · Wix",
    link: "https://www.mrsl.nz/",
    intro:
      "A website rebuild for My Rental Specialists, a Christchurch property-management business. Bringing property listings, business information and enquiry journeys into a coherent web experience.",
    problem:
      "Help a local property-management business present its services clearly, make homes easy to explore and give owners and tenants a straightforward way to get in touch.",
    contribution:
      "Website rebuild using Astro and TypeScript with Wix CMS and SDK integration. The implementation includes rental listing and detail pages, enquiry forms and content-driven services.",
    decision:
      "Separate the public-facing experience from content management, so a tailored website can work with the business’s Wix content and services.",
    result:
      "A public website at mrsl.nz. The homepage screenshot was captured from the live site on 8 September 2026; it documents the interface, not a measured business outcome.",
  },
  {
    slug: "careermatch",
    name: "CareerMatch AI",
    subtitle: "A little clarity in the job search.",
    category: "AI product",
    stack: "LLM workflows · Supabase · Web",
    link: "https://cvto.work/",
    intro:
      "An AI-assisted tool that grew out of my own job search: understanding a role, finding relevant experience and preparing a more thoughtful application.",
    problem:
      "Job descriptions and personal experience rarely line up neatly. Repeatedly translating between them makes applying for suitable roles slow and difficult.",
    contribution:
      "Designed and built a workflow for resume and job-description matching, structured gap analysis, and tailored CV and cover-letter recommendations.",
    decision:
      "Start with the candidate’s actual background and the requirements of a specific role. Organize the output around useful application decisions, with the person reviewing the result.",
    result:
      "A productized personal workflow for job-fit analysis and application preparation. The portfolio illustration summarizes the workflow; it is not a screenshot or a measured outcome.",
  },
  {
    slug: "kids-worksheets",
    publicName: "Kids Worksheet Generator",
    name: "Little tools, big curiosity.",
    subtitle: "Learning that leaves the screen.",
    category: "Personal product",
    stack: "Print workflows · AI images · Web",
    link: "https://kids.a-dobe.club/",
    intro:
      "Kids Worksheet Generator creates printable maths, writing exercises and AI coloring pages. It started with a simple wish: more useful learning materials for my son, with less screen time.",
    problem:
      "Preparing fresh practice by hand takes time. I wanted a simple way to make materials for learning together away from a screen.",
    contribution:
      "Built a web application for printable exercises and added AI-generated coloring pages, handling the product workflow, implementation and deployment.",
    decision:
      "Make paper the final interface. The digital tool helps parents prepare; the learning experience happens with a pencil and a printed page.",
    result:
      "A usable tool built around a real family need. The worksheet on this portfolio is an illustrative sample, not a screenshot of the application.",
  },
];

// Earlier work. The terminal's /projects lists it after the selected projects;
// the homepage does not, because these have no case study and mixing them in
// would dilute the three that do. Copy is carried over from the command's
// previous hard-coded markup, with no claims added.
export const archiveProjects = [
  {
    slug: "smart-canvas",
    name: "Smart Canvas",
    subtitle: "AI flowchart generator",
    category: "AI tool",
    stack: "LLM workflows · Web",
    link: "https://smart-canvas-brown.vercel.app/",
    intro:
      "A tool that builds flowcharts through a conversational interface.",
    note: "In early development, still iterating on core functionality.",
  },
  {
    slug: "lcc-issue-tracker",
    name: "LCC Issue Tracker",
    subtitle: "Issue management with role-based access",
    category: "Full-stack project",
    stack: "Python · Flask · MySQL",
    link: "https://github.com/Shun-Zhang-1163127/LCC_Issue_Tracker",
    intro: "A full-stack web application for managing issues.",
    note: "Three-tier role-based access control: visitor, helper and admin.",
  },
  {
    slug: "ml-lending-analysis",
    name: "ML Lending Data Analysis",
    subtitle: "Loan risk models over Lending Club data",
    category: "Data project",
    stack: "Python · Machine learning",
    link: "https://github.com/Shun-Zhang-1163127/1163127",
    intro:
      "Predictive models over Lending Club data from 2007 to 2018.",
    note: "Loan risk assessment with feature engineering.",
  },
];
