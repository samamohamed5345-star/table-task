(() => {
  "use strict";

  const CONFIG = {
    SHEET_CSV_URL: "",
    CACHE_KEY: "oshot_projects_v2"
  };

  const IMG_EXTS = ["jpg", "jpeg", "png", "webp", "JPG", "JPEG", "PNG", "WEBP", "avif", "gif"];

  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function parseCSV(t) {
    const rows = [];
    let row = [], cur = "", q = false;
    for (let i = 0; i < t.length; i++) {
      const c = t[i];
      if (q) {
        if (c === '"') { if (t[i + 1] === '"') { cur += '"'; i++; } else q = false; }
        else cur += c;
      } else if (c === '"') q = true;
      else if (c === ",") { row.push(cur); cur = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && t[i + 1] === "\n") i++;
        row.push(cur); cur = ""; rows.push(row); row = [];
      } else cur += c;
    }
    if (cur !== "" || row.length) { row.push(cur); rows.push(row); }
    const head = rows.shift().map((h) => h.trim().toLowerCase());
    return rows
      .filter((r) => r.some((x) => x.trim()))
      .map((r) => Object.fromEntries(head.map((h, i) => [h, (r[i] || "").trim()])));
  }

  function media(v) {
    v = (v || "").trim();
    if (!v) return null;
    if (v.startsWith("auto:")) return { t: "auto", base: v.slice(5) };
    if (/vimeo\.com/i.test(v)) {
      const id = (v.match(/(\d{6,})/) || [])[1];
      const h = (v.match(/(?:\/\d+\/|h=)([a-f0-9]{8,})/i) || [])[1] || "";
      return id ? { t: "vimeo", id, h } : null;
    }
    let m = v.match(/^(\d{6,})(?:\/([a-z0-9]+))?$/i);
    if (m) return { t: "vimeo", id: m[1], h: m[2] || "" };
    if (/drive\.google\.com/i.test(v)) {
      m = v.match(/\/folders\/([\w-]+)/);
      if (m) return { t: "folder", id: m[1] };
      m = v.match(/\/d\/([\w-]+)|[?&]id=([\w-]+)/);
      return m ? { t: "drive", id: m[1] || m[2] } : null;
    }
    if (/^[\w-]{20,}$/.test(v)) return { t: "drive", id: v };
    if (/\.(jpe?g|png|webp|gif|avif)(\?.*)?$/i.test(v)) return { t: "img", url: v };
    return { t: "mp4", url: v };
  }

  const probe = (url) => new Promise((res) => {
    const i = new Image();
    i.onload = () => res(true);
    i.onerror = () => res(false);
    i.src = url;
  });

  async function resolveMedia(m) {
    if (!m || m.t !== "auto") return m;
    const hits = await Promise.all(IMG_EXTS.map((ext) => probe(`${m.base}.${ext}`)));
    const i = hits.indexOf(true);
    return i >= 0
      ? { t: "img", url: `${m.base}.${IMG_EXTS[i]}` }
      : { t: "mp4", url: `${m.base}.mp4` };
  }

  const imgUrl = (v) => {
    const m = media(v);
    if (!m) return "";
    return m.t === "drive" ? `https://drive.google.com/thumbnail?id=${m.id}&sz=w1600` : (m.url || "");
  };

  const vurl = (m, q) => `https://player.vimeo.com/video/${m.id}?${m.h ? "h=" + m.h + "&" : ""}${q}`;

  const thumbCache = {};
  async function thumb(m) {
    if (!m) return "";
    if (m.t === "drive") return imgUrl(m.id);
    if (m.t !== "vimeo") return "";
    if (thumbCache[m.id] !== undefined) return thumbCache[m.id];
    try {
      const u = `https://vimeo.com/${m.id}${m.h ? "/" + m.h : ""}`;
      const r = await fetch(`https://vimeo.com/api/oembed.json?width=1280&url=${encodeURIComponent(u)}`);
      thumbCache[m.id] = (await r.json()).thumbnail_url || "";
    } catch { thumbCache[m.id] = ""; }
    return thumbCache[m.id];
  }

  const vids = (n, ext = {}) => {
    if (ext === "auto") ext = { b: "auto", c: "auto", d: "auto" };
    const a = ["a", "b", "c", "d"].map((l) =>
      ext[l] === "auto" ? `auto:assets/work-${n}-${l}` : `assets/work-${n}-${l}.${ext[l] || "mp4"}`);
    return { preview: a[0], film: a[0], extra: a.slice(1).join("|") };
  };

  const TECH = {
    director: "Karim Samhan",
    dop: "Karim Samhan",
    acq: "Sony Cinema Line 4K 120fps High-Speed Tabletop",
    optics: "90mm f/2.8 Macro + 50mm Prime",
    lighting: "Warm Ramadan Golden Key + Specular Spice Texture Backlight"
  };
  const brand = (num, id, title = "Pharma Primes") => ({
    num, cat: "brand", size: "tall", year: "2026",
    title,
    client: title.toUpperCase(),
    ref: title.toUpperCase(),
    lens: title.toUpperCase(),
    preview: "",
    film: `https://drive.google.com/file/d/${id}/view`,
    extra: "",
    poster: "",
    synopsis: "",
    execution: "",
    deliverables: ""
  });
    const fourWays = (num, id) => ({
    num, cat: "brand", size: "tall", year: "2026",
    title: "FOUR WAYS",
    client: "FOUR WAYS",
    ref: "FOUR WAYS — A CLINIC EXPERIENCE",
    lens: "AWARENESS CAMPAIGN",
    sub: "FOUR WAYS - A CLINIC EXPERIENCE",
    preview: "",
    film: `https://drive.google.com/file/d/${id}/view`,
    extra: "",
    poster: "",
    synopsis: "A four-part social media campaign introducing the clinic's services, treatment approach, and patient experience. Through kinetic typography and engaging visual storytelling, the series highlights muscle therapy, physical training, specialized care, and the comfort of the clinic's environment.",
    execution: "A typography-driven visual approach combining kinetic text animation, dynamic transitions, and carefully designed compositions to communicate the clinic's services in a clear, engaging, and accessible way.",
    deliverables: "Kinetic Typography|04 Social Videos|Social Media Campaign"
  });
  const cine = (num, id, title, o = {}) => ({
  num, cat: "cine", size: "tall", year: "2026",
  title,
  client: o.client || title.toUpperCase(),
  ref: o.ref || title.toUpperCase(),
  lens: o.lens || "CINEMATOGRAPHY / DOP",
  sub: o.sub || "CINEMATOGRAPHY / DOP",
  preview: "",
  film: `https://drive.google.com/file/d/${id}/view`,
  extra: "",
  poster: "",
  synopsis: o.synopsis || "",
  execution: o.execution || "",
  deliverables: o.deliverables || "",
  director: o.director,
  dop: o.dop,
  acq: o.acq,
  optics: o.optics,
  lighting: o.lighting
});
const tvc = (num, id, title, o = {}) => ({
  num, cat: "tvc", size: "tall", year: "2026",
  title,
  client: o.client || title.toUpperCase(),
  ref: o.ref || title.toUpperCase(),
  lens: o.lens || "COMMERCIAL TVC",
  sub: o.sub || "COMMERCIAL TVC",
  preview: "",
  film: `https://drive.google.com/file/d/${id}/view`,
  extra: "",
  poster: "",
  synopsis: o.synopsis || "",
  execution: o.execution || "",
  deliverables: o.deliverables || "",
  director: o.director,
  dop: o.dop,
  acq: o.acq,
  optics: o.optics,
  lighting: o.lighting
});
  const product = (num, id) => ({
    num, cat: "product", size: "tall", year: "2026",
    title: "",
    client: "",
    ref: "PRODUCT & MACRO",
    lens: "",
    sub: "",
    img: true,
    preview: "",
    film: `https://drive.google.com/file/d/${id}/view`,
    extra: "",
    poster: "",
    synopsis: "",
    execution: "",
    deliverables: ""
  });
  const PROJECTS = [
    tvc("01", "1QXCkURQrYNk_gtDg2W_eKK-fOKO5IxVh", "BURGER MAKERS - A TASTE OF CHARACTER", {
      client: "BURGER MAKERS",
      lens: "CHARACTER-DRIVEN COMMERCIAL",
      sub: "COMMERCIAL TVC CAMPAIGN",
      synopsis: "A character-driven commercial campaign bringing Burger Makers to life through engaging storytelling, expressive performances, and a distinctive visual identity. Two complementary films built around a creative approach that goes beyond conventional food advertising.",
      execution: "Combining cinematic camera compositions, carefully controlled lighting, expressive food close-ups, and dynamic editing to create an engaging visual experience. Dialogue, subtitles, and visual rhythm work together to strengthen the narrative and brand personality.",
      deliverables: "Commercial Film 01|Commercial Film 02|Cinematic Food Visuals|Vertical Video 9:16",
      dop: "Oshot Production",
      acq: "Character-led Commercial Storytelling",
      optics: "Narrative-driven Commercial Editing",
      lighting: "Cinematic Contrast & Controlled Lighting"
    }),
    tvc("02", "1OCNRuQLRJz5F_0zlkGpbdKUGtncsjg1r", "BURGER MAKERS - A TASTE OF CHARACTER", {
      client: "BURGER MAKERS",
      lens: "CHARACTER-DRIVEN COMMERCIAL",
      sub: "COMMERCIAL TVC CAMPAIGN",
      synopsis: "A character-driven commercial campaign bringing Burger Makers to life through engaging storytelling, expressive performances, and a distinctive visual identity. Two complementary films built around a creative approach that goes beyond conventional food advertising.",
      execution: "Combining cinematic camera compositions, carefully controlled lighting, expressive food close-ups, and dynamic editing to create an engaging visual experience. Dialogue, subtitles, and visual rhythm work together to strengthen the narrative and brand personality.",
      deliverables: "Commercial Film 01|Commercial Film 02|Cinematic Food Visuals|Vertical Video 9:16",
      dop: "Oshot Production",
      acq: "Character-led Commercial Storytelling",
      optics: "Narrative-driven Commercial Editing",
      lighting: "Cinematic Contrast & Controlled Lighting"
    }),

    tvc("03", "10w57--8FI-bFI9dQRxgvGe3cY-1Fbois", "DAJAJ THAHABI - RAMADAN COMMERCIAL", {
      client: "DAJAJ THAHABI",
      lens: "RAMADAN COMMERCIAL",
      sub: "COMMERCIAL TVC",
      synopsis: "A story-driven Ramadan commercial for Dajaj Thahabi, built around family moments and the warmth of sharing a meal. Through relatable characters and cinematic storytelling, the film integrates the brand's products into an engaging narrative centered on family and togetherness.",
      execution: "A cinematic production combining dramatic lighting, expressive performances, dynamic camera compositions, and detailed food cinematography. The visual approach moves between narrative scenes and appetizing product shots, creating a warm and immersive advertising experience.",
      deliverables: "Ramadan Commercial Film|Narrative-driven Brand Advertising|Food & Product Cinematography|Cinematic Editing"
    }),

    tvc("04", "1SFi-1dQAmG_qfnJm_ZAJK4-Ph_HvoKZv", "Vimto - Ramadan TVC"),

    tvc("05", "1MYDFHQyOk7uyWKBiOpm9sBzzbxIA7drB", "ZAEER — A SMARTER WAY FORWARD", {
      client: "ZAEER",
      lens: "MOBILE APPLICATION COMMERCIAL",
      sub: "MOBILE APPLICATION • 02 COMMERCIAL FILMS",
      synopsis: "A character-driven commercial campaign for Zaeer, bringing the mobile application's concept to life through a relatable workplace scenario. Using visual storytelling and expressive performance, the film presents the application within an engaging narrative designed to connect with its audience.",
      execution: "A cinematic production built around performance-driven storytelling, combining carefully composed office scenes, expressive close-ups, dynamic camera framing, and controlled lighting. The visual progression and editing rhythm guide the viewer through the story while keeping the application at the center of the commercial concept.",
      deliverables: "Character-driven Storytelling|02 Commercial Films|Cinematic Editing|Mobile App Advertising",
      acq: "Mobile Application Commercial — Narrative-driven Cinematography",
      optics: "Wide, Medium & Close-up Compositions",
      lighting: "Controlled Office Lighting"
    }),
    tvc("06", "1vhSLmT8l0xc9X8yPmg8U_hEfFaW-lnSq", "ZAEER — A SMARTER WAY FORWARD", {
      client: "ZAEER",
      lens: "MOBILE APPLICATION COMMERCIAL",
      sub: "MOBILE APPLICATION • 02 COMMERCIAL FILMS",
      synopsis: "A character-driven commercial campaign for Zaeer, bringing the mobile application's concept to life through a relatable workplace scenario. Using visual storytelling and expressive performance, the film presents the application within an engaging narrative designed to connect with its audience.",
      execution: "A cinematic production built around performance-driven storytelling, combining carefully composed office scenes, expressive close-ups, dynamic camera framing, and controlled lighting. The visual progression and editing rhythm guide the viewer through the story while keeping the application at the center of the commercial concept.",
      deliverables: "Character-driven Storytelling|02 Commercial Films|Cinematic Editing|Mobile App Advertising",
      acq: "Mobile Application Commercial — Narrative-driven Cinematography",
      optics: "Wide, Medium & Close-up Compositions",
      lighting: "Controlled Office Lighting"
    }),
        brand("07", "1VqLBFsomtNISSA5iey-QqkO6huGICJf2"),
    brand("08", "1QhJscQKeP3iVLpQU0CvIyinFWaWAl7jG"),
    brand("09", "1CNoS4va3fHNj1upNxTIi4j1NQjE8FCZH"),
    brand("10", "1o8GoA8NVdN1djlbDM7EBqRU_299jdxgt"),
    brand("11", "1MRAUDKWNu5mHjxJZMq-O0xf52vVrh9a0"),
    brand("12", "12SQxq-40JYqKp1vhoftGE7rOfY-e85kP"),
        {
      num: "13", cat: "brand", size: "tall", year: "2026",
      title: "GANDOFLY - A TASTE OF TRADITION",
      client: "GANDOFLY",
      ref: "GANDOFLY — A TASTE OF TRADITION",
      lens: "NARRATIVE COMMERCIAL",
      sub: "GANDOFLY SEAFOOD RESTAURANT · COMMERCIAL TVC",
      preview: "",
      film: "https://drive.google.com/file/d/1WkZ0Sp8jNPQ2tdhsLk52E5DhaTbzaB8Q/view",
      extra: "",
      poster: "",
      synopsis: "A narrative-driven commercial for Gandofly Seafood Restaurant, built around a culturally inspired story that brings together local traditions, authentic characters, and the experience of sharing food. The film uses relatable storytelling to introduce the brand in an engaging and memorable way.",
      execution: "A cinematic production combining character-driven scenes, natural outdoor environments, expressive performances, and carefully composed food and lifestyle shots. The visual approach blends authentic atmosphere with cinematic framing and dynamic editing to create a distinctive brand commercial.",
      deliverables: "45-Second Commercial Film|Narrative-driven Brand Advertising|Lifestyle & Food Cinematography|Cinematic Editing"
    },
    {
      num: "14", cat: "brand", size: "tall", year: "2026",
      title: "GANDOFLY - A TASTE OF TRADITION",
      client: "GANDOFLY",
      ref: "GANDOFLY — A TASTE OF TRADITION",
      lens: "NARRATIVE COMMERCIAL",
      sub: "GANDOFLY SEAFOOD RESTAURANT · COMMERCIAL TVC",
      preview: "",
      film: "https://drive.google.com/file/d/1Nl-hZrzL6mLw2SCjiu9oAsD6ruWgW0X8/view",
      extra: "",
      poster: "",
      synopsis: "A narrative-driven commercial for Gandofly Seafood Restaurant, built around a culturally inspired story that brings together local traditions, authentic characters, and the experience of sharing food. The film uses relatable storytelling to introduce the brand in an engaging and memorable way.",
      execution: "A cinematic production combining character-driven scenes, natural outdoor environments, expressive performances, and carefully composed food and lifestyle shots. The visual approach blends authentic atmosphere with cinematic framing and dynamic editing to create a distinctive brand commercial.",
      deliverables: "45-Second Commercial Film|Narrative-driven Brand Advertising|Lifestyle & Food Cinematography|Cinematic Editing"
    },
        {
      num: "15", cat: "brand", size: "tall", year: "2026",
      title: "RASAS - THE ART OF JEWELRY",
      client: "RASAS",
      ref: "RASAS — THE ART OF JEWELRY",
      lens: "JEWELRY COMMERCIAL",
      sub: "RASAS JEWELRY & DESIGN",
      preview: "",
      film: "https://drive.google.com/file/d/1-l3O4yZhzS-NoEMwQr99FUYtQgu6KUSS/view",
      extra: "",
      poster: "",
      synopsis: "A commercial film created for RASAS Jewelry & Design, showcasing the brand's identity and craftsmanship through an elegant visual approach. The film highlights the beauty and character of the jewelry, presenting the brand through a refined advertising experience.",
      execution: "A visually driven production combining detailed product shots, controlled lighting, cinematic compositions, and carefully crafted camera movements. The visual treatment emphasizes the jewelry's details, textures, and design through a polished commercial aesthetic.",
      deliverables: "Brand Commercial Film|Jewelry Product Showcase|Cinematic Product Shots|Commercial Editing"
    },
    {
      num: "16", cat: "brand", size: "tall", year: "2026",
      title: "RASAS - THE ART OF JEWELRY",
      client: "RASAS",
      ref: "RASAS — THE ART OF JEWELRY",
      lens: "JEWELRY COMMERCIAL",
      sub: "RASAS JEWELRY & DESIGN",
      preview: "",
      film: "https://drive.google.com/file/d/1DkhoJB2QBdyAfA_XOji5irGazCrAOG9W/view",
      extra: "",
      poster: "",
      synopsis: "A commercial film created for RASAS Jewelry & Design, showcasing the brand's identity and craftsmanship through an elegant visual approach. The film highlights the beauty and character of the jewelry, presenting the brand through a refined advertising experience.",
      execution: "A visually driven production combining detailed product shots, controlled lighting, cinematic compositions, and carefully crafted camera movements. The visual treatment emphasizes the jewelry's details, textures, and design through a polished commercial aesthetic.",
      deliverables: "Brand Commercial Film|Jewelry Product Showcase|Cinematic Product Shots|Commercial Editing"
    },
        brand("17", "1aweScLhSmzMhVqA8IznToNNkZdm28bMH", "Balouria oriental sweet"),
    brand("18", "1CGK_RwliZ9_uH6zcFqlidrsB2qQxPwjw", "Balouria oriental sweet"),
    brand("19", "1jjO4ddmLAkR1FY_4ASG-3TxWarV0BRPM", "Balouria oriental sweet"),
    brand("20", "1Zam9r-4ZKLBTvV1K3Vpfly_uCSxHdVAn", "Balouria oriental sweet"),
        brand("21", "1zob7Eu5PoFP19zZQawQwpGIHhurLIc8L", "Tawa"),
    brand("22", "1hoycLIaDuswQBGGA0pMdZp7Xtka9j5Dt", "Tawa"),
    brand("23", "1a5WZw9tGZRM25oVDS8k7R3Fo58QZiUa-", "Tawa"),
    brand("24", "1JDxkpOIGA4fCRo4s0jF2Z5eURXs5LK2v", "Tawa"),
        fourWays("25", "109PeNIrQVtt1iBrp7ZDvIFhnpew_iQED"),
    fourWays("26", "107nxK44Ava6rGRL8Pp7PgXI-uGoyQquc"),
    fourWays("27", "1-u3au6DYg2ie9HwGjSdC411wq5kBCDTv"),
    fourWays("28", "1-m2mt4EN7ZMXXKMjtAbcG2NSGA2f8dSC"),
    fourWays("29", "17mxTkMB1SVz_BaTLmligfpYs-8-pJ9Ss"),


    {
      num: "30", cat: "doc", size: "tall", year: "2026",
      title: "QAWN - THE STORY OF DIGITAL INNOVATION",
      client: "AHLI BANK",
      ref: "QAWN - THE STORY OF DIGITAL INNOVATION",
      lens: "AHLI BANK",
      sub: "CORPORATE DOCUMENTARY",
      preview: "",
      film: "https://drive.google.com/file/d/1s27v0f7qQZCLH4tdn5D_18CspwlaYLnl/view?usp=drive_link",
      extra: "",
      poster: "",
      synopsis: "A cinematic corporate documentary exploring the journey behind Qawn, a digital product developed with the support of Ahli Bank Jordan. Through interviews with key contributors, the film captures the vision, collaboration, and process behind bringing the product to life.",
      execution: "A documentary-driven production combining cinematic interviews, authentic workplace interactions, application demonstrations, and branded motion graphics. The visual storytelling connects personal insights with real project details to create an engaging account of digital innovation and collaboration.",
      deliverables: "Corporate Documentary Film|Expert & Team Interviews|Application Demonstration Footage|Branded Motion Graphics|Cinematic Storytelling"
    },
    {
      num: "31", cat: "doc", size: "tall", year: "2026",
      title: "BEYOND CAPITAL - INSIDE THE JOURNEY",
      client: "BEYOND CAPITAL",
      ref: "BEYOND CAPITAL - INSIDE THE JOURNEY",
      lens: "BEYOND CAPITAL",
      sub: "CORPORATE DOCUMENTARY INTERVIEW-BASED FILM",
      preview: "",
      film: "https://drive.google.com/file/d/1wjRh8zv4veNrfS59A2NrkHLRGXeZmIrV/view?usp=drive_link",
      extra: "",
      poster: "",
      synopsis: "A corporate documentary offering an inside look into Beyond Capital, exploring the people, entrepreneurs, and partnerships behind its work. Through authentic interviews and visual storytelling, the film highlights the experiences and perspectives of the individuals shaping its journey.",
      execution: "A cinematic documentary production combining professionally composed interviews, workplace visuals, natural interactions, and carefully crafted compositions. The visual approach balances authentic storytelling with a polished corporate aesthetic.",
      deliverables: "Corporate Documentary Film|Executive & Team Interviews|Entrepreneur Stories|Corporate Visual Storytelling|Cinematic Editing"
    },
    {
      num: "32", cat: "doc", size: "tall", year: "2026",
      title: "MAWARED - BUILDING TOMORROW",
      client: "MAWARED",
      ref: "MAWARED - BUILDING TOMORROW",
      lens: "MAWARED",
      sub: "CORPORATE & INFRASTRUCTURE FILM",
      preview: "",
      film: "https://drive.google.com/file/d/1LBWK8Klujeoi6OR-JFFBzVLtodHu-C5I/view?usp=drive_link",
      extra: "",
      poster: "",
      synopsis: "A corporate film showcasing Mawared's urban development vision through a cinematic presentation of large-scale infrastructure and real estate projects. The film highlights the scale, planning, and development of King Abdullah Bin Abdulaziz City through compelling aerial imagery and informative visual storytelling.",
      execution: "A visually driven production combining aerial cinematography, architectural compositions, wide establishing shots, and motion graphics. The visual approach captures the scale of the development while integrating informative graphics to communicate key project details and create a clear, engaging corporate presentation.",
      deliverables: "Corporate Film|Aerial & Drone Cinematography|Architectural Visuals|Motion Graphics & Infographics|Cinematic Editing"
    },
        cine("33", "1s_dypEZ7GQ9ipWicUOfyFrSE0I_IaXYW", "Aziz Maraka - Concert"),
    cine("34", "1uBOxbG0fJG_8-RYhYfIkVykzE9eY3hvn", "Aziz Maraka - Concert"),
    cine("35", "151YG-xMwPpfmJgyGiA8W_krqevNiD4q5", "Blockchain - Event"),
    cine("36", "1CViNNUuC7f1N77OSXbJnfhnVzj99RVXz", "HuQQabaz - Event"),
    cine("37", "1g8G_Fw07XxoV7OfyiwRXvL9fb-pbzDUT", "IFT - Event"),

    cine("38", "1F60FryQj5BtiAZWqeJA6d1bvglCHpLNT", "ORYX HOTEL AQABA - BEYOND THE STAY", {
      client: "ORYX HOTEL AQABA",
      lens: "HOTEL SHOWCASE FILM",
      sub: "CLIENT: ORYX HOTEL AQABA • HOTEL SHOWCASE FILM",
      synopsis: "A cinematic showcase film capturing the atmosphere, spaces, and hospitality experience of Oryx Hotel Aqaba. Through a carefully curated visual journey, the film highlights the hotel's architecture, interiors, dining experience, and distinctive surroundings.",
      execution: "A visually driven production combining cinematic camera movements, architectural compositions, atmospheric lighting, and detailed shots. The visual approach emphasizes the hotel's character and guest experience through elegant framing and immersive storytelling.",
      deliverables: "Hotel Showcase Film|Architectural & Interior Cinematography|Lifestyle & Hospitality Visuals|Cinematic Editing",
      acq: "Hospitality Showcase — Cinematic Hotel Presentation",
      optics: "Architectural & Lifestyle Cinematography",
      lighting: "Natural & Ambient Lighting"
    }),

    cine("39", "1uoRaSJckCW6uUYax0IdfmudZN55SocZk", "PASCAL JUNIOR - DEAD SEA LIVE EXPERIENCE", {
      client: "PASCAL JUNIOR",
      lens: "EVENT CINEMATIC FILM",
      sub: "EVENT CINEMATIC FILM · PANORAMA DEAD SEA",
      synopsis: "A cinematic event film capturing the energy and atmosphere of Pascal Junior's live performance at Panorama Dead Sea. The film brings together the crowd, music, and venue atmosphere to recreate the excitement of the event through an immersive visual experience.",
      execution: "A dynamic event production combining expressive camera movements, energetic crowd shots, atmospheric lighting, and cinematic compositions. The editing focuses on rhythm, movement, and visual transitions to translate the live experience into an engaging cinematic recap.",
      deliverables: "Event Cinematic Recap|Live Performance Coverage|Crowd & Atmosphere Highlights|Cinematic Event Editing",
      acq: "Live Event Cinematic — Music & Lifestyle Cinematography",
      optics: "Dynamic Camera Movements & Crowd Coverage",
      lighting: "Live Event & Stage Lighting"
    }),

    cine("40", "1Pu875MFDql5k8xhN2AftVCSwGkIMdol3", "Dodge - Cinematic ad"),

    cine("41", "18bD8J9rwTT1p-s-ewgyn7kPk6DLYlQ7A", "LAREINE ARABIA — EXCLUSIVE CONVERSATIONS", {
      client: "LAREINE ARABIA",
      lens: "BRANDED INTERVIEW",
      sub: "BRANDED INTERVIEW • CHAPTER 01",
      synopsis: "An exclusive interview series by LAREINE ARABIA, featuring Khairiah Abulaban in a personal conversation exploring Saudi culture, style, and contemporary perspectives. The project presents the guest through an intimate and elegant interview format.",
      execution: "A refined interview production combining cinematic portrait framing, controlled studio lighting, clean compositions, and a warm visual atmosphere. The production focuses on capturing authentic expressions and natural conversation while maintaining a sophisticated branded aesthetic.",
      deliverables: "Exclusive Interview Episode|Branded Interview Production|Cinematic Portrait Coverage|Interview Editing",
      acq: "Branded Interview — Editorial Interview Cinematography",
      optics: "Cinematic Portrait & Conversation Coverage",
      lighting: "Soft Controlled Interview Lighting"
    }),

    cine("42", "1-JAqsLI5-lzRqxC6l7ZC3RqegMLXNa3V", "Rozz wedding"),

    cine("43", "1vrHacWXPi4fwqOCJLlcHN3eo6yx-qNes", "Al fanny - MUSIC STORE SHOWCASE", {
      client: "AL FANNY",
      lens: "MUSIC STORE SHOWCASE",
      sub: "CINEMATOGRAPHY / DOP",
      synopsis: "A dynamic visual showcase of a musical instruments store, capturing the energy, atmosphere, and character of the space through expressive cinematography and creative visual transitions.",
      execution: "A fast-paced visual treatment combining speed ramps, masking transitions, and energetic camera movements to create a lively and immersive presentation of the store.",
      deliverables: "Store Showcase Film|Speed Ramp Editing|Masking Transitions|Dynamic Visual Montage",
      acq: "Dynamic & Energetic Visual Style",
      optics: "Musical Instruments & Store Interior",
      lighting: "Speed Ramps & Masking Editing"
    }),
    product("44", "1liWPKBujlqdWZ58xU8T3NvwPgdm_-pNP"),
    product("45", "1TEEngFSyFMg14OV2KXbSmItgNwSrK8jE"),
    product("46", "1QLbkhA43Uij9BTsMRDaIR1RiVmJbM5I0"),
    product("47", "19aW4z79rAA0RMTrbo9as72OlKQYd7EzT"),
    product("48", "1Hrfhc_sUrMmCS3ntpXO1NhqXmkopRGm-")
  ];

  async function load() {
    let rows = null;
    try {
      if (!CONFIG.SHEET_CSV_URL) throw 0;
      const r = await fetch(CONFIG.SHEET_CSV_URL, { cache: "no-cache" });
      if (!r.ok) throw 0;
      const txt = await r.text();
      rows = parseCSV(txt);
      try { localStorage.setItem(CONFIG.CACHE_KEY, txt); } catch {}
    } catch {
      try { const c = localStorage.getItem(CONFIG.CACHE_KEY); if (c) rows = parseCSV(c); } catch {}
    }
    const list = (rows && rows.length ? rows : PROJECTS)
      .filter((r) => (r.published || "TRUE").toUpperCase() !== "FALSE")
      .map((r, i) => ({
        num: r.num || String(i + 1).padStart(2, "0"),
        cat: r.cat || "tvc",
        wide: false,
        title: r.title, client: r.client, year: r.year || "2026", lens: r.lens,
        ref: r.ref || r.client || r.title,
        preview: media(r.preview),
        films: [r.film, ...(r.extra || "").split("|")].map(media).filter(Boolean),
        poster: imgUrl(r.poster),
        synopsis: r.synopsis, execution: r.execution,
        deliverables: (r.deliverables || "").split("|").map((s) => s.trim()).filter(Boolean),
        director: r.director || TECH.director,
        dop: r.dop || TECH.dop,
        acq: r.acq || TECH.acq,
        optics: r.optics || TECH.optics,
        lighting: r.lighting || TECH.lighting,
        sub: r.sub,
        img: r.img
      }));

    await Promise.all(list.map(async (p) => {
      p.preview = await resolveMedia(p.preview);
      p.films = await Promise.all(p.films.map(resolveMedia));
    }));
    return list;
  }

  const CAT_LABEL = { tvc: "COMMERCIAL TVC", brand: "BRAND CAMPAIGNS", doc: "DOCUMENTARY & CORPORATE", cine: "CINEMATOGRAPHY / DOP", product: "PRODUCT & MACRO" };

  const st = document.createElement("style");
  st.textContent = `
    .wm-poster{position:absolute;inset:0;background:#1b1b1b center/cover no-repeat;transition:transform .7s cubic-bezier(.2,.7,.2,1)}
    .work-card:hover .wm-poster{transform:scale(1.03)}
    .wm-live{position:absolute;top:50%;left:50%;height:100%;aspect-ratio:16/9;width:auto;transform:translate(-50%,-50%);border:0;object-fit:cover;pointer-events:none;opacity:0;animation:wmIn .5s .25s forwards}
    video.wm-live{width:100%;height:100%;aspect-ratio:auto;transform:none;top:0;left:0}
    @keyframes wmIn{to{opacity:1}}
    .case-thumb img{display:block;width:100%;height:100%;object-fit:cover}
    iframe.case-video{border:0}
    img.case-player{object-fit:contain;cursor:default}
  `;
  document.head.appendChild(st);

  const grid = $("#workGrid");
  const caseEl = $("#caseModal");
  let P = [];

  function makeLive(m) {
    let el;
    if (m.t === "vimeo") {
      el = document.createElement("iframe");
      el.src = vurl(m, "background=1&autoplay=1&loop=1&muted=1");
      el.allow = "autoplay";
      el.tabIndex = -1;
    } else if (m.t === "mp4") {
      el = document.createElement("video");
      Object.assign(el, { src: m.url, autoplay: true, muted: true, loop: true, playsInline: true });
    } else return null;
    el.className = "wm-live";
    return el;
  }

  function renderGrid() {
    if (!P.length) {
      grid.innerHTML = '<p style="grid-column:1/-1;color:#8a8a8a;font-family:var(--font-mono);font-size:12px">CONTENT UNAVAILABLE — CHECK SHEET LINK</p>';
      return;
    }
    grid.innerHTML = P.map((p) => `
      <a class="work-card" href="#" data-cat="${esc(p.cat)}">
        <div class="work-media">
          <div class="wm-poster"></div>
          <span class="work-num">${p.num}</span>
          ${p.img ? "" : `<span class="work-lens">${esc(p.lens)}</span>`}
          <span class="work-arrow">↗</span>
          <span class="work-pill">${p.img ? "VIEW" : "VIEW CASE"}<i class="pill-icon arrow"></i></span>
        </div>
        ${p.img ? "" : `<div class="work-info">
          <div>
            <span class="work-cat">${CAT_LABEL[p.cat] || esc(p.cat)}</span>
            <h3 class="work-name">${esc(p.title)}</h3>
          </div>
          <div class="work-meta"><span>${esc(p.client)}</span><span>${esc(p.year)}</span></div>
        </div>`}
      </a>`).join("");

    const navLink = $('.site-nav a[href="#work"]');
    if (navLink) navLink.textContent = `SELECTED WORK (${P.length})`;

    grid.querySelectorAll(".work-card").forEach((card, i) => {
      const p = P[i];
      const box = $(".work-media", card);
      const poster = $(".wm-poster", card);
      const first = p.preview || p.films[0];
      if (p.poster) poster.style.backgroundImage = `url("${p.poster}")`;
      else if (first && first.t === "img") poster.style.backgroundImage = `url("${first.url}")`;
      else if (first && first.t === "mp4") {
        const v = document.createElement("video");
        Object.assign(v, { src: first.url + "#t=0.5", muted: true, playsInline: true, preload: "metadata" });
        v.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:1";
        poster.appendChild(v);
      } else thumb(first).then((u) => { if (u) poster.style.backgroundImage = `url("${u}")`; });

      card.addEventListener("mousemove", (e) => {
        const r = box.getBoundingClientRect();
        box.style.setProperty("--x", `${e.clientX - r.left}px`);
        box.style.setProperty("--y", `${e.clientY - r.top}px`);
      });

      let live = null;
      const on = () => {
        if (live || !p.preview) return;
        live = makeLive(p.preview);
        if (live) box.insertBefore(live, $(".work-num", box));
      };
      const off = () => { live?.remove(); live = null; };
      card.addEventListener("mouseenter", on);
      card.addEventListener("mouseleave", off);
      if (matchMedia("(hover:none)").matches) {
        new IntersectionObserver(([en]) => (en.isIntersecting ? on() : off()), { threshold: 0.6 }).observe(card);
      }

      card.addEventListener("click", (e) => {
        e.preventDefault();
        openCase(i);
        bootstrap.Modal.getOrCreateInstance(caseEl).show();
      });
    });
  }

  document.querySelectorAll(".work-filter").forEach((btn) => {
    btn.addEventListener("click", () => {
      const f = btn.dataset.filter;
      document.querySelectorAll(".work-filter").forEach((b) => b.classList.toggle("is-active", b === btn));
      grid.querySelectorAll(".work-card").forEach((c) => { c.hidden = f !== "all" && c.dataset.cat !== f; });
      grid.classList.toggle("is-filtered", f !== "all");
    });
  });

  const stage = $("#caseStage");
  const vF = $("#caseFinal");
  const vG = $("#caseFlat");
  const range = $("#caseRange");
  const handle = $("#caseHandle");
  const thumbs = $("#caseThumbs");
  const setText = (id, v) => { $("#" + id).textContent = v || ""; };
  let order = [];
  let eng = null;
  let dragging = false;
  let currentRef = "";

  function setPos(p) {
    const pos = Math.min(98, Math.max(2, p));
    stage.style.setProperty("--pos", `${pos}%`);
    range.value = Math.round(100 - pos);
    range.style.setProperty("--v", `${range.value}%`);
  }
  range.addEventListener("input", () => setPos(100 - Number(range.value)));
  handle.addEventListener("pointerdown", (e) => { e.preventDefault(); dragging = true; handle.setPointerCapture(e.pointerId); });
  handle.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const r = stage.getBoundingClientRect();
    setPos(((e.clientX - r.left) / r.width) * 100);
  });
  ["pointerup", "pointercancel"].forEach((t) => handle.addEventListener(t, () => { dragging = false; }));

  function clearEngine() {
    if (eng) {
      eng.players?.forEach((pl) => pl.destroy().catch(() => {}));
      eng.els.forEach((e) => e.remove());
      eng = null;
    }
    [vF, vG].forEach((v) => { v.pause(); v.removeAttribute("src"); v.load(); v.hidden = true; });
  }

  function mount(m) {
    clearEngine();
    if (!m) return;

    if (m.t === "img") {
      const im = document.createElement("img");
      im.className = "case-player";
      im.alt = "";
      im.src = m.url;
      stage.append(im);
      eng = { els: [im], paused: () => true, play() {}, pause() {} };
      return;
    }

    if (m.t === "mp4") {
      [vF, vG].forEach((v) => { v.hidden = false; v.src = `${m.url}#t=0.5`; });
      vF.ontimeupdate = () => { if (Math.abs(vG.currentTime - vF.currentTime) > 0.15) vG.currentTime = vF.currentTime; };
      eng = {
        els: [],
        paused: () => vF.paused,
        play() { vG.currentTime = vF.currentTime; vF.play().catch(() => {}); vG.play().catch(() => {}); },
        pause() { vF.pause(); vG.pause(); }
      };
      return;
    }

    if (m.t === "drive") {
      const f = document.createElement("iframe");
      f.className = "case-player";
      f.src = `https://drive.google.com/file/d/${m.id}/preview`;
      f.allow = "autoplay; fullscreen";
      stage.append(f);
      eng = { els: [f], paused: () => true, play() {}, pause() {} };
      return;
    }

    if (m.t === "folder") {
      const f = document.createElement("iframe");
      f.className = "case-player";
      f.src = `https://drive.google.com/embeddedfolderview?id=${m.id}#grid`;
      stage.append(f);
      eng = { els: [f], paused: () => true, play() {}, pause() {} };
      return;
    }

    if (!window.Vimeo) return;
    const mk = (muted, cls) => {
      const f = document.createElement("iframe");
      f.className = `case-video ${cls}`;
      f.src = vurl(m, `controls=0&muted=${muted ? 1 : 0}&playsinline=1&dnt=1&title=0&byline=0&portrait=0`);
      f.allow = "autoplay; fullscreen";
      f.style.pointerEvents = "none";
      return f;
    };
    const a = mk(false, "case-final");
    const b = mk(true, "case-flat");
    stage.prepend(a, b);
    const pa = new Vimeo.Player(a);
    const pb = new Vimeo.Player(b);
    let paused = true;
    pa.on("timeupdate", async (d) => {
      const t = await pb.getCurrentTime().catch(() => d.seconds);
      if (Math.abs(t - d.seconds) > 0.3) pb.setCurrentTime(d.seconds).catch(() => {});
    });
    pa.on("ended", () => { paused = true; pb.pause().catch(() => {}); });
    eng = {
      els: [a, b],
      players: [pa, pb],
      paused: () => paused,
      play() { paused = false; pa.play().catch(() => {}); pb.play().catch(() => {}); },
      pause() { paused = true; pa.pause().catch(() => {}); pb.pause().catch(() => {}); }
    };
  }

  function renderThumbs() {
    thumbs.innerHTML = order.slice(1).map((_, i) =>
      `<button type="button" class="case-thumb" data-i="${i + 1}" aria-label="Item ${i + 2}"><img alt=""></button>`).join("");
    thumbs.querySelectorAll(".case-thumb").forEach((b, i) => {
      const m = order[i + 1];
      if (m.t === "img") b.innerHTML = `<img src="${esc(m.url)}" alt="">`;
      else if (m.t === "mp4") b.innerHTML = `<video src="${esc(m.url)}#t=0.5" muted playsinline preload="metadata"></video>`;
      else thumb(m).then((u) => { if (u) b.firstChild.src = u; });
    });
    $(".case-frames").hidden = order.length < 2;
  }

  thumbs.addEventListener("click", (e) => {
    const b = e.target.closest(".case-thumb");
    if (!b) return;
    const i = Number(b.dataset.i);
    [order[0], order[i]] = [order[i], order[0]];
    mount(order[0]);
    renderThumbs();
    eng?.play();
  });

  function openCase(i) {
    const p = P[i];
    currentRef = p.ref;
    setText("caseTag", `CASE STUDY // ${p.num}`);
    caseEl.classList.toggle("is-photo", !!p.img);
    setText("caseClient", p.img ? "" : `${p.client} (${p.year})`);
    setText("caseCat", p.sub || CAT_LABEL[p.cat] || p.cat);
    setText("caseTitle", p.title);
    setText("caseSynopsis", p.synopsis);
    setText("caseExecution", p.execution);
    $("#caseSynopsis").dir = "auto";
    $("#caseExecution").dir = "auto";
    $("#caseExecLabel").hidden = $("#caseExecution").hidden = !p.execution;
    $("#caseSynLabel").hidden = $("#caseSynopsis").hidden = !p.synopsis;
$("#caseDelLabel").hidden = $("#caseChips").hidden = !p.deliverables.length;
    setText("caseDirector", p.director);
    setText("caseDop", p.dop);
    setText("caseAcq", p.acq);
    setText("caseOptics", p.optics);
    setText("caseLighting", p.lighting);
    $("#caseChips").innerHTML = p.deliverables.map((d) => `<span class="case-chip">${esc(d)}</span>`).join("");
    order = [...p.films];
    mount(order[0]);
    renderThumbs();
    setPos(32);
  }

  stage.addEventListener("click", (e) => {
    if (e.target.closest(".case-wipe-handle, .case-slider, .case-player")) return;
    if (!eng) return;
    eng.paused() ? eng.play() : eng.pause();
  });

  caseEl.addEventListener("hidden.bs.modal", clearEngine);

  const cta = $(".case-cta");
  if (cta) {
    cta.addEventListener("click", (e) => {
      e.preventDefault();
      const ref = currentRef;
      caseEl.addEventListener("hidden.bs.modal", () => openBriefWithRef(ref), { once: true });
      bootstrap.Modal.getOrCreateInstance(caseEl).hide();
    });
  }

  document.querySelectorAll(".sv-img").forEach((img) => {
    const base = (img.getAttribute("src") || "").replace(/\.[^./]+$/, "");
    let k = 0;
    const next = () => { if (k < IMG_EXTS.length) img.src = `${base}.${IMG_EXTS[k++]}`; };
    img.addEventListener("error", next);
    img.loading = "eager";
    if (img.complete && img.naturalWidth === 0) next();
  });

  load().then((rows) => { P = rows; renderGrid(); });
})();