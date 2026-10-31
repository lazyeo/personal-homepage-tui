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
    slug: "nimpression-ops",
    evidenceNote: "Live demo payslip · captured 23 October 2026 · generated data.",
    name: "Nimpression Ops",
    subtitle: "Fleet operations that stay correct when the connection does not.",
    category: "Full-stack system",
    stack: "C# · .NET 10 · ASP.NET Core · EF Core · PostgreSQL · Angular",
    link: "https://nimpression.a-dobe.club/",
    linkLabel: "Try the live demo",
    repo: "https://github.com/lazyeo/nimpression-ops",
    intro:
      "Nimpression Ops runs dispatch, timesheets, payroll and compliance for a small New Zealand freight fleet, in C# on .NET 10 with an Angular front end. I rebuilt it from a system described in a university capstone report; it is not work for the company.",
    problem:
      "The report described the system well, but not how it should behave when things go wrong: a dropped realtime connection, a pay rule at the edge of the law, personal data that must be protected and later forgotten.",
    contribution:
      "A .NET 10 Minimal API in Clean Architecture layers, with CQRS through MediatR, EF Core on PostgreSQL and SignalR. Payroll compares hourly and per-trip pay and tops up to the minimum wage; personal fields are encrypted with AES-256-GCM; a transactional outbox commits domain events with their data.",
    decision:
      "Let the realtime channel carry nothing that matters. A SignalR message only says what changed and the client refetches over HTTP, so a lost message costs one extra request, never a wrong record. Likewise fines and payslips share no key: NZ law bars taking a fine from wages without written consent, so the code cannot.",
    result:
      "A public repository and a live demo with administrator, dispatcher and driver accounts. 683 xUnit test methods, the integration suite on real PostgreSQL via Testcontainers; CI passed on the deployed commit. The demo data is generated; the demo is a showcase, not a production service.",
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
    slug: "alma-android",
    evidenceNote:
      "App screenshot from the public repository · unfolded layout · synthetic fixture data.",
    name: "Alma Android",
    subtitle: "Your desktop AI agent, carried in a pocket.",
    category: "Open-source Android app",
    stack: "TypeScript · React · Capacitor",
    link: "https://github.com/lazyeo/alma-android/releases",
    linkLabel: "Download the APK",
    repo: "https://github.com/lazyeo/alma-android",
    intro:
      "An unofficial Android client for Alma Desktop, the AI agent on my Mac. Pair a phone with one or more desktops and keep working with threads, agents and files away from the keyboard. MIT, v0.1.4, October 2026.",
    problem:
      "A desktop agent is no use once you stand up. I wanted to follow a task, answer its question or approve a step from a phone, with no third-party server in between.",
    contribution:
      "TypeScript and React in Capacitor: QR pairing, an end-to-end encrypted relay with LAN direct on shared Wi-Fi, streaming replies with tool calls and approvals, file diffs, foldable two-pane layouts, English and Chinese, SHA-256-verified in-app updates.",
    decision:
      "Built the way the product works: Alma and its agent crew plan, code, test and release while I steer and test on real devices. No push service, so alerts are local and only live with the connection.",
    result:
      "A public repository with releases and a changelog, used daily on my phone and foldable, tests in CI. The screenshot is the unfolded layout on synthetic fixture data: no real conversations or credentials.",
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
