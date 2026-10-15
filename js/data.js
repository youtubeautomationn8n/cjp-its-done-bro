/* ================= DATA ================= */
const MODES = {
  cjp: {
    name: "CJP — TROLL MODE 📢", accent: "#14b8a6",
    tag: "Pop the protest excuses!",
    lines: [
      "Protest is my full-time job 📢",
      "Article 19 goes brrr",
      "13 crore votes vanished (source: vibes)",
      "Dictatorship! (posted from my iPhone)",
      "Jantar Mantar is my second home",
      "Constitution in hand, facts optional 📕",
      "Foreign funding? Never heard of FCRA",
      "Inquilab Zindabad, logic murdabad",
      "Detained = famous now 🎥",
      "Tiranga lehrao, questions later 🚩",
      "Hisaab hoga… date not decided",
      "Peaceful protest* (*T&C apply)",
      "Candle march at 6, dinner at 8 🕯️",
      "My placard has more research than me",
      "Tiranga in hand, narrative in pocket",
      "My protest got more views than my degree",
      "Prime-time debut loading…",
      "We demand answers (we won't listen)",
      "Hashtag today, forgotten tomorrow",
      "My DMs are open for foreign media",
      "Section 144 is just a suggestion",
      "Arrest me = trending",
      "Democracy khatre mein hai (from 5-star)"
    ],
    ranks: [[2600,"🏆 CERTIFIED ANDOLANJEEVI"],[1600,"🥈 TOOLKIT GANG MEMBER"],[800,"🥉 DHARNA PROFESSIONAL"],[0,"🎈 CANDLE MARCH INTERN"]]
  },
  cong: {
    name: "CONGRESS — TROLL MODE 🗳️", accent: "#e8e8e8",
    tag: "Pop the excuses!",
    lines: [
      "I never see BJP as development 🙈",
      "We close our eyes when BJP does good 🙈",
      "EVM hacked… only when we lose",
      "Vote chori! Proof? Trust me bro",
      "My leader vacations abroad after every loss ✈️",
      "Andhbhakt! (says the dynasty fan)",
      "GDP is fake, my feelings are real",
      "70 saal ka hisaab? Never heard of it",
      "Freebies = development, Expressway = jumla",
      "Godi media! (except when they praise us)",
      "Unemployment data: WhatsApp University",
      "Paper leak = BJP; paper leak fixed = coincidence",
      "Chaiwala jibe from 2013 still in drafts",
      "We lost, but morally we won",
      "Press conference? Only friendly anchors",
      "Dynasty = democracy, trust me",
      "We discovered poverty in 2024",
      "Nyay will come… eventually",
      "Our IT cell runs on nostalgia",
      "Blame the EVM, not the campaign",
      "Version 2.0 loading since 2014"
    ],
    ranks: [[2600,"🏆 CERTIFIED ANDHNAMAZI"],[1600,"🥈 CHAMCHA SUPREMO"],[800,"🥉 EVM RONA CHAMPION"],[0,"🎈 TUKDE-TUKDE TRAINEE"]]
  },
  bjp: {
    name: "BJP — DEFEND MODE 🛡️", accent: "#ff9933",
    tag: "Shoot down the fake narratives!",
    taunts: [
      ["Jumla! 🗣️", "Vande Bharat trains now run across the country"],
      ["No vikas anywhere! 🙈", "India's expressway network is expanding at record pace"],
      ["Suit-boot ki sarkar! 🧥", "Free ration reaches 80 crore+ people"],
      ["EVM hack! 🔌", "EC: EVMs stand secure — hackathon challenge still open"],
      ["Democracy is dead! ⚰️", "India still conducts the world's largest elections, on time"],
      ["Farmers ignored! 🌾", "PM-KISAN sends direct cash support to farmers"],
      ["Youth has no future! 😤", "India is home to 100+ startups turned unicorns"],
      ["Digital India failed! 📵", "UPI is the world's biggest real-time payment network"],
      ["Nothing built! 🧱", "Statue of Unity: the world's tallest statue"],
      ["Bridges? Where? 🌉", "Chenab rail bridge: the world's highest"],
      ["Only jumlas, no jobs! 💼", "Metro rail now runs in 20+ Indian cities"],
      ["India is backward! 🐌", "India: world's 4th-largest economy and climbing"],
      ["Vikas is a myth! 🦄", "Vande Bharat: 100+ services and counting"],
      ["Roads are broken! 🕳️", "National highways: 1.4 lakh+ km network"],
      ["Nobody uses UPI! 📵", "UPI: billions of transactions every month"],
      ["Airports? Which airports? ✈️", "Operational airports doubled in a decade"],
      ["Make in India = flop! 🏭", "India: world's 2nd-largest mobile phone maker"],
      ["No water in taps! 🚰", "Jal Jeevan: tap water to crores of rural homes"],
      ["Power cuts everywhere! 💡", "Saubhagya: electricity to crores of homes"],
      ["MSP is a jumla! 🌾", "PM-KISAN: Rs 6,000/year straight to farmers"]
    ],
    ranks: [[2600,"🛡️ Vikas Warrior"],[1600,"🎯 Fact-Check Commando"],[800,"🧱 Narrative Defender"],[0,"🌱 Trainee Chowkidar"]]
  }
};
const BALLOON_COLORS = ["#ff4d6d","#4da6ff","#4dd27a","#b366ff","#ff9f2e","#ff6ee7","#3ee6d2","#ffe14d"];
