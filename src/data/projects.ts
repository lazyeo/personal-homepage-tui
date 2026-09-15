export const projects = [
  {
    slug: "ky01-launcher",
    evidenceNote: "Launcher capture from the physical KY-01L.",
    publicName: "Pocket Home",
    name: "Pocket Home",
    subtitle: "A home screen for a card-sized e-ink phone.",
    category: "Native Android",
    stack: "Java · Android API 25 · No dependencies",
    intro:
      "Pocket Home is a launcher I wrote for the Kyocera KY-01L, a card-sized phone with a 480 x 600 e-ink screen. Its stock launcher will not list or start third-party apps, so a phone running Android could only ever run what shipped on it.",
    problem:
      "The device runs Android, but nothing you install appears on its home screen or can be started from it, so the platform underneath goes to waste. Replacing the launcher is not simply a matter of writing an ordinary one either: the panel is e-ink at 480 x 600 and the firmware is Android 7.1, so a scrolling colour-phone layout does not fit it.",
    contribution:
      "A native Java launcher in a 24 KiB APK, with no runtime libraries, no WebView and no network permission. Favourites and a paged app list of six per page with explicit previous and next instead of scrolling; long press to rename an app, choose one of sixteen monochrome icons, or add a favourite; a light or dark tone. Preferences are keyed by component name, so they survive a process restart and an in-place update.",
    decision:
      "Refuse anything that redraws without being asked. Clock and battery update from broadcasts only while the launcher is resumed, the receiver is unregistered on pause, and the app list refreshes on resume rather than continuously. On e-ink an idle animation is not decoration, it is visible flicker.",
    result:
      "Running as the default home screen on my own device and verified against it: build and signature, the HOME resolver, icon and favourite persistence across a force stop, all three app pages, and both 240 and 280 density. One memory snapshot read 11.5 MB PSS, which is a reading rather than a benchmark. E-ink ghosting and touch feel need physical inspection; a screenshot cannot establish either.",
  },
  {
    slug: "mrsl",
    evidenceNote: "Live MRSL homepage · captured 8 September 2026.",
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
    evidenceNote: "CareerMatch workflow illustration, not an application screenshot.",
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
    evidenceNote: "Illustrative worksheet, not an application screenshot.",
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

// Everything else. The terminal's /projects lists these after the selected
// ones; the homepage does not, because they have no case study and mixing them
// in would dilute the ones that do. Not a claim about age: a current draft
// belongs here just as much as an old coursework project. Copy is carried over from the command's
// previous hard-coded markup, with no claims added.
export const archiveProjects = [
  {
    slug: "nz-immigration-rag",
    name: "NZ Immigration Policy Chat",
    subtitle: "Answers with their sources attached",
    category: "Retrieval system",
    stack: "RAG · Cloudflare Workers · Web",
    link: "https://nz-immigration-chatbot.emcfi2024.workers.dev/",
    intro:
      "A chatbot that answers New Zealand immigration policy questions from a prepared corpus of official sources, and keeps the source trail visible on every answer.",
    note: "Built because an assistant sounds equally assured whether or not it is right, and here being wrong has consequences. Still a draft; the corpus is a snapshot, and it is a research tool rather than immigration advice.",
  },
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
