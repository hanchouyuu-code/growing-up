/* Course content. To change words, sentences or lesson text, edit this file only.
   课程内容：修改单词、例句、课程文字，只需改这个文件。 */
window.GU = window.GU || {};
GU.views = GU.views || {};

GU.BOOK = {
  publisher: "外语教学与研究出版社",
  series: "普通高中教科书",
  subject: "英语",
  volume: "选择性必修 第二册",
  unit: "Unit 1",
  unitTitle: "Growing up"
};

/* Unit overview, adapted from the teacher's book (The Little Prince part removed). */
GU.OVERVIEW = {
  theme: "People and self",
  themeParts: ["Knowing yourself", "Growing as a person", "Becoming your best self"],
  paragraphs: [
    "This unit is about growing up. You’ll start with lines from Rudyard Kipling’s poem <em>If—</em>, then hear how young people of different ages see growing up and becoming an adult. Along the way, you’ll think about your plans for the future and look back on the moments in your life you’ll never forget.",
    "Seen from these different angles, growing up brings meaning and responsibility, and sometimes worry and confusion too. The aim is to help you set clear goals for your life and face it with a positive attitude."
  ],
  objectives: [
    "work out the structure of the passage and find out the meaning of “the age of majority”;",
    "get detailed information by focusing on the speakers’ feelings and the reasons behind them;",
    "be more responsible about “the age of majority”, and be more open-minded and critical about turning eighteen."
  ]
};

/* Lessons and their activities. Each activity counts toward overall progress. */
GU.LESSONS = [
  {
    id: "lesson-1", n: 1, title: "Vocabulary", short: "Words", minutes: 20,
    blurb: "Learn the 30 key words of the unit: hear them, say them and spell them.",
    activities: [
      { id: "group-1", title: "Words 1–10", kind: "group", group: 0 },
      { id: "group-2", title: "Words 11–20", kind: "group", group: 1 },
      { id: "group-3", title: "Words 21–30", kind: "group", group: 2 },
      { id: "match", title: "Matching quiz", kind: "match" },
      { id: "challenge", title: "Listening challenge", kind: "challenge", bonus: true }
    ]
  },
  {
    id: "lesson-2", n: 2, title: "Starting out", short: "Starting out", minutes: 20, soon: true,
    blurb: "Coming-of-age ceremonies and Kipling’s poem <em>If—</em>: what does it take to grow up?"
  },
  {
    id: "lesson-3", n: 3, title: "Reading: The Age of Majority", short: "Reading", minutes: 30, soon: true,
    blurb: "Three young people share what turning 18 means, or meant, to them."
  },
  {
    id: "lesson-4", n: 4, title: "Writing", short: "Writing", minutes: 20, soon: true,
    blurb: "Write about the responsibilities that come with turning 18."
  }
];

GU.TEACHER = {
  id: "teacher", title: "Teacher’s corner",
  blurb: "Lesson plans, answer keys and extra resources for teachers."
};

/* Badges. Growth theme: seed → sprout → tree. */
GU.BADGES = [
  { id: "first-step", name: "First step", desc: "Read the course overview", icon: "steps" },
  { id: "group-1", name: "Seed", desc: "Learn words 1–10", icon: "seed" },
  { id: "group-2", name: "Sprout", desc: "Learn words 11–20", icon: "sprout" },
  { id: "group-3", name: "Young tree", desc: "Learn words 21–30", icon: "tree" },
  { id: "match", name: "Perfect pair", desc: "Finish the matching quiz", icon: "link" },
  { id: "challenge", name: "Sharp ears", desc: "Bonus: finish the listening challenge", icon: "ear", bonus: true },
  { id: "lesson-2", name: "New dawn", desc: "Finish Lesson 2", icon: "sun", soon: true },
  { id: "lesson-3", name: "Close reader", desc: "Finish Lesson 3", icon: "book", soon: true },
  { id: "lesson-4", name: "Own voice", desc: "Finish Lesson 4", icon: "pen", soon: true }
];

/* Vocabulary: the Unit 1 word list up to (not including) "minimum".
   book  = the sentence in the textbook; hl = the part to highlight
   ex    = another example sentence
   tip   = memory tip: parts (word building) and/or pic (picture), plus a note
   alt   = other accepted spellings, with a note */
GU.WORDS = [
  /* ---------- Words 1–10 ---------- */
  { id: "integrity", word: "integrity", ipa: "/ɪnˈteɡrɪti/", pos: "n.", zh: "正直诚实", zhShort: "正直诚实",
    def: "the quality of being honest and having strong moral principles",
    book: "self-belief, confidence, modesty, integrity, honesty, kindness, pride, patience", hl: "integrity",
    src: "Starting out, Activity 2: qualities in the poem",
    ex: "She showed real integrity when she handed in the wallet she found.",
    tip: { parts: [["integr", "whole 完整"], ["ity", "noun 名词"]],
      note: "Think of an <b>integer</b>, a whole number. A person with integrity is whole: what they say and what they do match." } },
  { id: "virtue", word: "virtue", ipa: "/ˈvɜːtʃuː/", pos: "n.", zh: "美德", zhShort: "美德",
    def: "a good quality in someone’s character",
    book: "If you can talk with crowds and keep your virtue,", hl: "virtue",
    src: "Starting out, the poem If— by Rudyard Kipling",
    ex: "Patience is a virtue, especially when you’re learning something new.",
    tip: { pic: "🌟", note: "Honesty, patience and kindness are all virtues. Adjective: <b>virtuous</b>." } },
  { id: "licence", word: "licence", ipa: "/ˈlaɪs(ə)ns/", pos: "n.", zh: "执照", zhShort: "执照",
    def: "an official document that shows you are allowed to do something",
    book: "Get a driver’s licence.", hl: "licence",
    src: "Understanding ideas, Activity 1",
    ex: "You need a licence to open a restaurant.",
    alt: { license: "Correct in American English. The book uses the British spelling: <b>licence</b>." },
    tip: { pic: "🪪", note: "British English: <b>licence</b> (noun). American English: <b>license</b>." } },
  { id: "loan", word: "loan", ipa: "/ləʊn/", pos: "n.", zh: "（银行等的）贷款", zhShort: "贷款",
    def: "money that you borrow, usually from a bank, and pay back later",
    book: "Get a bank loan.", hl: "loan",
    src: "Understanding ideas, Activity 1",
    ex: "He took out a loan to pay for university.",
    tip: { pic: "🏦 → 💰 → 🏦", note: "Borrow now, pay back later. <b>take out</b> a loan, <b>pay back</b> a loan." } },
  { id: "adulthood", word: "adulthood", ipa: "/ˈædʌlthʊd/", pos: "n.", zh: "成年", zhShort: "成年",
    def: "the time of your life when you are an adult",
    book: "In most countries, turning 18 marks the start of adulthood.", hl: "adulthood",
    src: "The Age of Majority, introduction",
    ex: "The move from childhood to adulthood can feel exciting and scary at the same time.",
    tip: { parts: [["adult", "成年人"], ["hood", "a time or state 时期，状态"]],
      note: "Same pattern: <b>childhood</b>, <b>neighbourhood</b>." } },
  { id: "milestone", word: "milestone", ipa: "/ˈmaɪlstəʊn/", pos: "n.", zh: "重大事件，里程碑", zhShort: "里程碑",
    def: "a very important event or stage in your life",
    book: "But what does reaching this milestone, the age of majority, really mean?", hl: "milestone",
    src: "The Age of Majority, introduction",
    ex: "Getting her first job was an important milestone for her.",
    tip: { parts: [["mile", "英里"], ["stone", "石头"]], pic: "🪨",
      note: "Stones by the road used to mark every mile. Today a milestone is any big step in life." } },
  { id: "election", word: "election", ipa: "/ɪˈlekʃ(ə)n/", pos: "n.", zh: "选举", zhShort: "选举",
    def: "a time when people vote to choose someone for an official position",
    book: "…I won’t be voting in the next general election.", hl: "election",
    src: "Bethany, paragraph 1",
    ex: "Our class held an election to choose a new monitor.",
    tip: { parts: [["elect", "to choose by voting 选举"], ["ion", "noun 名词"]], pic: "🗳️",
      note: "<b>a general election</b> = 大选" } },
  { id: "wage", word: "wage", ipa: "/weɪdʒ/", pos: "n.", zh: "（按小时、日或周计算的）工资，薪金", zhShort: "工资，薪金",
    def: "money you earn for work, usually paid by the hour, day or week",
    book: "…if you’re old enough to earn a wage and pay taxes…", hl: "wage",
    src: "Bethany, paragraph 1",
    ex: "The café pays a wage of 25 yuan an hour.",
    tip: { pic: "⏱️ 💵", note: "A <b>wage</b> is paid by the hour, day or week. A <b>salary</b> is paid every month or year." } },
  { id: "tax", word: "tax", ipa: "/tæks/", pos: "n.", zh: "税", zhShort: "税",
    def: "money that you must pay to the government",
    book: "…if you’re old enough to earn a wage and pay taxes…", hl: "taxes",
    src: "Bethany, paragraph 1",
    ex: "Part of every worker’s income goes to tax.",
    tip: { pic: "🧾 🏛️", note: "<b>pay taxes</b>. income tax = 个人所得税" } },
  { id: "have-a-say", word: "have a say", ipa: "", pos: "phrase", zh: "有发言权", zhShort: "有发言权",
    def: "to have the right to give your opinion and help decide something",
    book: "…you should be allowed to have a say on how the government spends them!", hl: "have a say",
    src: "Bethany, paragraph 1",
    ex: "Students should have a say in the school rules.",
    tip: { pic: "🙋 💬", note: "Here <b>say</b> is a noun: the right to give your opinion. <b>have a say in / on</b> something." } },

  /* ---------- Words 11–20 ---------- */
  { id: "behind-the-wheel", word: "behind the wheel", ipa: "", pos: "phrase", zh: "在驾驶汽车", zhShort: "在驾驶汽车",
    def: "driving a car",
    book: "My mum worries about me being behind the wheel.", hl: "behind the wheel",
    src: "Bethany, paragraph 1",
    ex: "Never use your phone when you’re behind the wheel.",
    tip: { pic: "🚗", note: "The <b>wheel</b> is the steering wheel (方向盘). If you’re behind it, you’re driving." } },
  { id: "ambulance", word: "ambulance", ipa: "/ˈæmbjʊləns/", pos: "n.", zh: "救护车", zhShort: "救护车",
    def: "a vehicle that takes sick or injured people to hospital",
    book: "As an ambulance driver, she’s seen a lot of car accidents involving teenagers…", hl: "ambulance",
    src: "Bethany, paragraph 1",
    ex: "Call an ambulance! Someone has been hurt.",
    tip: { pic: "🚑", note: "On the front of many ambulances the word is written backwards, so drivers ahead can read it in their mirrors." } },
  { id: "legal", word: "legal", ipa: "/ˈliːɡ(ə)l/", pos: "adj.", zh: "合法的", zhShort: "合法的",
    def: "allowed by law",
    book: "…the legal age for getting a driving licence should be 21.", hl: "legal",
    src: "Bethany, paragraph 1",
    ex: "It isn’t legal to drive without a licence.",
    tip: { pic: "⚖️", note: "Opposite: <b>illegal</b> (il- = not). <b>the legal age</b> = 法定年龄" } },
  { id: "mature", word: "mature", ipa: "/məˈtʃʊə/", pos: "adj.", zh: "成熟的，明白事理的", zhShort: "成熟的",
    def: "behaving in a sensible way, like an adult",
    book: "But I think I’m already mature enough to understand that driving a car also means taking responsibility…", hl: "mature",
    src: "Bethany, paragraph 1",
    ex: "He’s only 16, but he’s very mature for his age.",
    tip: { pic: "🍎", note: "Fruit can be mature (ripe) too. Opposite: <b>immature</b>. Noun: <b>maturity</b>." } },
  { id: "instantly", word: "instantly", ipa: "/ˈɪnstəntli/", pos: "adv.", zh: "立即，马上", zhShort: "立即，马上",
    def: "immediately; at once",
    book: "I expected to feel instantly different…", hl: "instantly",
    src: "Lin Ning, paragraph 2",
    ex: "She recognised her old friend instantly.",
    tip: { parts: [["instant", "立即的"], ["ly", "adverb 副词"]], pic: "🍜",
      note: "Like <b>instant</b> noodles: ready right away." } },
  { id: "childhood", word: "childhood", ipa: "/ˈtʃaɪldhʊd/", pos: "n.", zh: "童年，儿童时代", zhShort: "童年",
    def: "the time of your life when you are a child",
    book: "…as if I had closed the door on my childhood and stepped into a whole new adult world.", hl: "childhood",
    src: "Lin Ning, paragraph 2",
    ex: "She spent her childhood in a small village by the sea.",
    tip: { parts: [["child", "孩子"], ["hood", "a time or state 时期，状态"]],
      note: "Learn it as a pair: <b>childhood</b> and <b>adulthood</b>." } },
  { id: "obey", word: "obey", ipa: "/əʊˈbeɪ/", pos: "v.", zh: "服从；遵守", zhShort: "服从；遵守",
    def: "to do what a rule, law or person tells you to do",
    book: "When I woke up the next day, there were still rules to obey and lessons to attend.", hl: "obey",
    src: "Lin Ning, paragraph 2",
    ex: "All drivers must obey the traffic rules.",
    tip: { pic: "🚦", note: "<b>obey</b> the rules / the law. Opposite: <b>disobey</b>." } },
  { id: "subtle", word: "subtle", ipa: "/ˈsʌtl/", pos: "adj.", zh: "难以察觉的；微妙的", zhShort: "微妙的",
    def: "small and not easy to notice",
    book: "In fact, the change has been more subtle and gradual than I imagined.", hl: "subtle",
    src: "Lin Ning, paragraph 2",
    ex: "There’s a subtle difference between these two words.",
    tip: { pic: "🤫", note: "The <b>b</b> is silent: you say /ˈsʌtl/ but write su<b>b</b>tle." } },
  { id: "gradual", word: "gradual", ipa: "/ˈɡrædʒuəl/", pos: "adj.", zh: "逐渐的，逐步的", zhShort: "逐渐的",
    def: "happening slowly, over a period of time",
    book: "In fact, the change has been more subtle and gradual than I imagined.", hl: "gradual",
    src: "Lin Ning, paragraph 2",
    ex: "Learning a language is a gradual process.",
    tip: { parts: [["grad", "step 步"], ["ual", "adjective 形容词"]], pic: "📶",
      note: "Like grades at school: one step at a time. Adverb: <b>gradually</b>." } },
  { id: "selfish", word: "selfish", ipa: "/ˈselfɪʃ/", pos: "adj.", zh: "自私的", zhShort: "自私的",
    def: "caring only about yourself and not about other people",
    book: "Instead of being the selfish teenager I used to be, I have begun to feel more aware of other people…", hl: "selfish",
    src: "Lin Ning, paragraph 2",
    ex: "It was selfish of him to eat the whole cake.",
    tip: { parts: [["self", "自己"], ["ish", "having the quality of …的"]],
      note: "Opposite: <b>unselfish</b>." } },

  /* ---------- Words 21–30 ---------- */
  { id: "organ-donation", word: "organ donation", ipa: "", pos: "phrase", zh: "器官捐献", zhShort: "器官捐献",
    def: "giving a part of your body, such as your heart or kidneys, to help someone else",
    book: "…I will be signing an organ donation agreement this time tomorrow.", hl: "organ donation",
    src: "Lin Ning, paragraph 2",
    ex: "Organ donation can save many lives.",
    tip: { parts: [["organ", "器官"], ["donation", "捐献"]], pic: "❤️",
      note: "Verb: <b>donate</b>. donate blood, donate organs." } },
  { id: "approval", word: "approval", ipa: "/əˈpruːvəl/", pos: "n.", zh: "赞成，同意", zhShort: "赞成，同意",
    def: "agreement that something is good or acceptable",
    book: "Of course I asked my parents for their approval first.", hl: "approval",
    src: "Lin Ning, paragraph 2",
    ex: "You need your teacher’s approval to leave class early.",
    tip: { parts: [["approv(e)", "赞成"], ["al", "noun 名词"]], pic: "👍",
      note: "Drop the <b>e</b>: approve → approval. Same pattern: arrive → arrival." } },
  { id: "steady", word: "steady", ipa: "/ˈstedi/", pos: "adj.", zh: "稳定的", zhShort: "稳定的",
    def: "regular and not changing much",
    book: "…I currently don’t have a steady income…", hl: "steady",
    src: "Lin Ning, paragraph 2",
    ex: "After university, she found a steady job at a bank.",
    tip: { pic: "📈", note: "<b>a steady job</b>, <b>a steady income</b>. Adverb: <b>steadily</b>." } },
  { id: "tempt", word: "tempt", ipa: "/tempt/", pos: "v.", zh: "诱惑，引诱", zhShort: "诱惑，引诱",
    def: "to make someone want to do something, especially something they shouldn’t do",
    book: "…getting a credit card might tempt me to spend more money than I have!", hl: "tempt",
    src: "Lin Ning, paragraph 2",
    ex: "The smell of fresh bread tempted me into the shop.",
    tip: { pic: "🍰", note: "Noun: <b>temptation</b>. Adjective: <b>tempting</b>, as in “That cake looks tempting!”" } },
  { id: "librarian", word: "librarian", ipa: "/laɪˈbreəriən/", pos: "n.", zh: "图书馆管理员", zhShort: "图书馆管理员",
    def: "a person who works in a library",
    book: "My librarian’s salary means that I’ll be living at home with my parents for a while longer.", hl: "librarian",
    src: "Morgan, paragraph 3",
    ex: "The librarian helped me find a book about space.",
    tip: { parts: [["librar(y)", "图书馆"], ["ian", "person 人"]], pic: "📚",
      note: "Same pattern: music → musician, history → historian." } },
  { id: "household", word: "household", ipa: "/ˈhaʊshəʊld/", pos: "adj.", zh: "家庭的", zhShort: "家庭的",
    def: "connected with a home and the people who live in it",
    book: "Because I contribute to the household bills…", hl: "household",
    src: "Morgan, paragraph 3",
    ex: "Everyone in our family shares the household chores.",
    tip: { parts: [["house", "房子"], ["hold", "to hold 容纳"]], pic: "🏠",
      note: "<b>household bills</b>, <b>household chores</b> (家务)." } },
  { id: "commute", word: "commute", ipa: "/kəˈmjuːt/", pos: "n.", zh: "每天上班的路程", zhShort: "每天上班的路程",
    def: "the journey you make to work or school every day",
    book: "…my commute to work is quite expensive…", hl: "commute",
    src: "Morgan, paragraph 3",
    ex: "My dad has a long commute: over an hour each way.",
    tip: { pic: "🏠 ⇄ 🏢", note: "Home to work and back, every day. A person who commutes is a <b>commuter</b>." } },
  { id: "deposit", word: "deposit", ipa: "/dɪˈpɒzɪt/", pos: "n.", zh: "订金", zhShort: "订金",
    def: "the first part of a payment, which shows you will pay the rest",
    book: "I know I could get a bank loan to pay the deposit on my very own apartment…", hl: "deposit",
    src: "Morgan, paragraph 3",
    ex: "We paid a deposit to book the hotel room.",
    tip: { parts: [["de", "down 向下"], ["posit", "put 放"]], pic: "🔑",
      note: "Money you put down first to hold something for you." } },
  { id: "commitment", word: "commitment", ipa: "/kəˈmɪtmənt/", pos: "n.", zh: "投入，花费", zhShort: "投入，花费",
    def: "something you have agreed to do that takes your time or money",
    book: "…but I don’t feel ready to make that kind of commitment…", hl: "commitment",
    src: "Morgan, paragraph 3",
    ex: "Learning to play the piano takes time and commitment.",
    tip: { parts: [["commit", "承诺，投入"], ["ment", "noun 名词"]],
      note: "Spelling: commi<b>tt</b>ment has a double <b>t</b>, but only one <b>m</b> in the middle." } },
  { id: "suitable", word: "suitable", ipa: "/ˈsuːtəb(ə)l/", pos: "adj.", zh: "合适的", zhShort: "合适的",
    def: "right for a particular purpose or situation",
    book: "Choose another suitable title for the passage and give your reasons.", hl: "suitable",
    src: "Understanding ideas, Activity 3",
    ex: "These shoes aren’t suitable for running.",
    tip: { parts: [["suit", "to be right for 适合"], ["able", "adjective 形容词"]],
      note: "<b>be suitable for</b> something." } }
];

GU.GROUP_SIZE = 10;
GU.groupWords = function (g) { return GU.WORDS.slice(g * GU.GROUP_SIZE, (g + 1) * GU.GROUP_SIZE); };
