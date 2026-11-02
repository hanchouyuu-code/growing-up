/* Course content. To change words, sentences or lesson text, edit this file only.
   课程内容：修改单词、例句、课程文字，只需改这个文件。 */
window.GU = window.GU || {};
GU.views = GU.views || {};

GU.BOOK = {
  zh: {
    publisher: "外语教学与研究出版社",
    title: "普通高中教科书 英语 选择性必修 第二册"
  },
  en: {
    publisher: "Foreign Language Teaching and Research Press (FLTRP)",
    title: "Senior High School Textbook: English, Selective Compulsory Course, Book 2"
  },
  unit: "Unit 1",
  unitTitle: "Growing up"
};

GU.OVERVIEW = {
  lede: "A 90-minute online course on the age of majority: the milestone that marks the start of adulthood, and the new freedoms and responsibilities it brings.",
  theme: "People and Self",
  themeZh: "人与自我",
  themeParts: ["Knowing Yourself", "Enriching Yourself", "Improving Yourself"],
  /* Adapted from the teacher's book. The Little Prince section has been removed. */
  paragraphs: [
    "This unit explores the theme of growing up. It begins with lines from Rudyard Kipling’s poem <em>If—</em> and moves on to how students of different ages understand growing up and adulthood. It then turns to plans for the future and memorable moments in life.",
    "By viewing growing up from these different angles, students come to understand its meaning and the responsibilities it brings, and are encouraged to talk about its worries and confusion. The unit aims to help students set firm goals in life and develop a positive attitude towards it."
  ],
  objectives: [
    "work out the structure of the passage and find out the meaning of “the age of majority”;",
    "get detailed information by focusing on the speakers’ feelings and the reasons behind them;",
    "be more responsible about “the age of majority”, and be more open-minded and critical about turning eighteen."
  ]
};

/* Introduction video recorded by the teacher.
   To replace it, put a new file in assets/video/ and change src (and poster). */
GU.INTRO_VIDEO = {
  src: "assets/video/intro.mp4",
  poster: "assets/video/intro-poster.jpg",
  embed: "",
  length: "44 seconds"
};

GU.LESSONS = [
  {
    id: "lesson-1", n: 1, title: "Vocabulary", short: "Vocabulary", minutes: 20,
    blurb: "Thirty key words of the unit, each studied through listening, pronunciation, spelling and a set read-along.",
    activities: [
      { id: "group-1", title: "Word Set 1", range: "Words 1–10", kind: "group", group: 0 },
      { id: "group-2", title: "Word Set 2", range: "Words 11–20", kind: "group", group: 1 },
      { id: "group-3", title: "Word Set 3", range: "Words 21–30", kind: "group", group: 2 },
      { id: "match", title: "Word–Meaning Matching", kind: "match" },
      { id: "challenge", title: "Dictation Challenge", kind: "challenge", bonus: true }
    ]
  },
  {
    id: "lesson-2", n: 2, title: "Starting Out", short: "Starting Out", minutes: 20,
    blurb: "Coming-of-age ceremonies around the world and Rudyard Kipling’s poem <em>If—</em>, with a choice of three learning paths.",
    activities: [
      { id: "l2-video", title: "Video Time: Coming-of-Age Ceremonies", short: "Video Time", kind: "l2video", minutes: 10, label: "Activity 1", steps: ["l2v-warm", "l2v-watch", "l2v-q1", "l2v-q2"] },
      { id: "l2-poem", title: "Poetry Reading: Rudyard Kipling’s If—", short: "Poetry Reading", kind: "l2poem", minutes: 10, label: "Activity 2", steps: ["l2p-listen", "l2p-q1", "l2p-q2", "l2p-q3"] }
    ],
    paths: [
      { id: "video", name: "Video Path", acts: ["l2-video"], minutes: 10, desc: "Activity 1 only: coming-of-age ceremonies around the world." },
      { id: "poem", name: "Poetry Path", acts: ["l2-poem"], minutes: 10, desc: "Activity 2 only: Rudyard Kipling’s poem <em>If—</em>." },
      { id: "both", name: "Complete Path", acts: ["l2-video", "l2-poem"], minutes: 20, desc: "Activities 1 and 2: the full Starting Out section.", recommended: true }
    ]
  },
  {
    id: "lesson-3", n: 3, title: "Reading: The Age of Majority", short: "Reading", minutes: 30, soon: true,
    blurb: "Three young people explain what turning 18 means, or meant, to them."
  },
  {
    id: "lesson-4", n: 4, title: "Writing", short: "Writing", minutes: 20, soon: true,
    blurb: "A short written response on the responsibilities that come with turning 18."
  }
];

GU.COMMUNITY = {
  title: "Learning Community",
  blurb: "Compete with classmates in timed word battles, and ask the AI Tutor about any word in the unit.",
  items: [
    { id: "battle", title: "Word Battle and Leaderboard", short: "Word Battle" },
    { id: "tutor", title: "AI Tutor", short: "AI Tutor" }
  ]
};

GU.TEACHER = {
  id: "teacher", title: "Teacher’s Corner",
  blurb: "Lesson plans, answer keys and supplementary resources for teachers."
};

/* Badges: a growth sequence from seed to coming of age. */
GU.BADGES = [
  { id: "first-step", name: "Seed", desc: "Completion of the Course Overview", icon: "seed" },
  { id: "group-1", name: "Sprout", desc: "Completion of Word Set 1", icon: "sprout" },
  { id: "group-2", name: "Sapling", desc: "Completion of Word Set 2", icon: "sapling" },
  { id: "group-3", name: "Young Tree", desc: "Completion of Word Set 3", icon: "tree" },
  { id: "match", name: "Firm Roots", desc: "Completion of the Word–Meaning Matching", icon: "roots" },
  { id: "challenge", name: "Keen Ear", desc: "Bonus: Completion of the Dictation Challenge", icon: "ear", bonus: true },
  { id: "battle", name: "Word Champion", desc: "Bonus: Completion of a Word Battle", icon: "trophy", bonus: true },
  { id: "lesson-2", name: "Branching Out", desc: "Completion of the chosen path in Lesson 2", icon: "sun" },
  { id: "lesson-3", name: "In Full Leaf", desc: "Completion of Lesson 3", icon: "book", soon: true },
  { id: "lesson-4", name: "Coming of Age", desc: "Completion of Lesson 4", icon: "pen", soon: true }
];

var OALD = "Oxford Advanced Learner’s Dictionary";
var OXU = "https://www.oxfordlearnersdictionaries.com/definition/english/";

/* Vocabulary: the Unit 1 word list up to (not including) "minimum".
   book  = sentence in the textbook (hl = part to highlight), src = where it appears
   dict  = [example sentence, dictionary, entry link, part to highlight]
   pic   = picture: emoji, shown as large Twemoji images
   tip   = memory aid: word parts and/or a note
   alt   = other accepted spellings, with a note
   audio = optional local recording, e.g. "audio/words/integrity.mp3" */
GU.WORDS = [
  /* ---------- Word Set 1 ---------- */
  { id: "integrity", word: "integrity", ipa: "/ɪnˈteɡrɪti/", pos: "n.", zh: "正直诚实", zhShort: "正直诚实",
    def: "the quality of being honest and having strong moral principles",
    book: "self-belief, confidence, modesty, integrity, honesty, kindness, pride, patience", hl: "integrity",
    src: "Starting Out, Activity 2: qualities named in the poem",
    dict: ["She behaved with absolute integrity.", OALD, OXU + "integrity", "integrity"],
    pic: "🤝",
    tip: { parts: [["integr", "whole 完整"], ["ity", "noun suffix 名词后缀"]],
      note: "Compare <b>integer</b>, a whole number. A person of integrity is whole: words and actions match." } },
  { id: "virtue", word: "virtue", ipa: "/ˈvɜːtʃuː/", pos: "n.", zh: "美德", zhShort: "美德",
    def: "a particular good quality or habit",
    book: "If you can talk with crowds and keep your virtue,", hl: "virtue",
    src: "Starting Out, the poem If— by Rudyard Kipling",
    dict: ["Patience is not one of her virtues, I’m afraid.", OALD, OXU + "virtue", "virtues"],
    pic: "🌟",
    tip: { note: "Honesty, patience and kindness are all virtues. Adjective: <b>virtuous</b>." } },
  { id: "licence", word: "licence", ipa: "/ˈlaɪs(ə)ns/", pos: "n.", zh: "执照", zhShort: "执照",
    def: "an official document that shows permission has been given to do, own or use something",
    book: "Get a driver’s licence.", hl: "licence",
    src: "Understanding Ideas, Activity 1",
    dict: ["He was caught driving a car without a licence.", OALD, OXU + "licence", "licence"],
    pic: "🪪 🚗",
    alt: { license: "Correct in American English. The textbook uses the British spelling: <b>licence</b>." },
    tip: { note: "British English: <b>licence</b> (noun). American English: <b>license</b>." } },
  { id: "loan", word: "loan", ipa: "/ləʊn/", pos: "n.", zh: "（银行等的）贷款", zhShort: "贷款",
    def: "money that an organization such as a bank lends and somebody borrows",
    book: "Get a bank loan.", hl: "loan",
    src: "Understanding Ideas, Activity 1",
    dict: ["She took out an $8 000 personal loan.", OALD, OXU + "loan_1", "loan"],
    pic: "🏦 → 💰",
    tip: { note: "Borrow now, pay back later: <b>take out</b> a loan, <b>repay</b> a loan." } },
  { id: "adulthood", word: "adulthood", ipa: "/ˈædʌlthʊd/", pos: "n.", zh: "成年", zhShort: "成年",
    def: "the state of being an adult",
    book: "In most countries, turning 18 marks the start of adulthood.", hl: "adulthood",
    src: "The Age of Majority, introduction",
    dict: ["Her childhood problems persisted into adulthood.", OALD, OXU + "adulthood", "adulthood"],
    pic: "🧒 → 🧑",
    tip: { parts: [["adult", "成年人"], ["hood", "state or period 状态，时期"]],
      note: "Same pattern: <b>childhood</b>, <b>neighbourhood</b>." } },
  { id: "milestone", word: "milestone", ipa: "/ˈmaɪlstəʊn/", pos: "n.", zh: "重大事件，里程碑", zhShort: "里程碑",
    def: "a very important stage or event in the development of something",
    book: "But what does reaching this milestone, the age of majority, really mean?", hl: "milestone",
    src: "The Age of Majority, introduction",
    dict: ["This voyage marked an important milestone in the history of exploration.", OALD, OXU + "milestone", "milestone"],
    pic: "🎂",
    tip: { parts: [["mile", "英里"], ["stone", "石头"]],
      note: "Stones by the road once marked each mile. A milestone is now any important stage in life." } },
  { id: "election", word: "election", ipa: "/ɪˈlekʃ(ə)n/", pos: "n.", zh: "选举", zhShort: "选举",
    def: "the process of choosing a person or group of people for a position by voting",
    book: "…I won’t be voting in the next general election.", hl: "election",
    src: "Bethany, paragraph 1",
    dict: ["Elections will be held later this year.", OALD, OXU + "election", "Elections"],
    pic: "🗳️",
    tip: { parts: [["elect", "to choose by voting 选举"], ["ion", "noun suffix 名词后缀"]],
      note: "<b>a general election</b> = 大选" } },
  { id: "wage", word: "wage", ipa: "/weɪdʒ/", pos: "n.", zh: "（按小时、日或周计算的）工资，薪金", zhShort: "工资，薪金",
    def: "a regular amount of money that you earn for work, usually paid weekly",
    book: "…if you’re old enough to earn a wage and pay taxes…", hl: "wage",
    src: "Bethany, paragraph 1",
    dict: ["We all hope we can find a job that pays a decent wage.", OALD, OXU + "wage_1", "wage"],
    pic: "⏱️ 💵",
    tip: { note: "A <b>wage</b> is usually paid by the hour, day or week. A <b>salary</b> is paid every month." } },
  { id: "tax", word: "tax", ipa: "/tæks/", pos: "n.", zh: "税", zhShort: "税",
    def: "money that you have to pay to the government so that it can pay for public services",
    book: "…if you’re old enough to earn a wage and pay taxes…", hl: "taxes",
    src: "Bethany, paragraph 1",
    dict: ["Income tax will be deducted by your employer.", OALD, OXU + "tax_1", "tax"],
    pic: "🧾 🏛️",
    tip: { note: "<b>pay taxes</b>; <b>income tax</b> = 个人所得税" } },
  { id: "have-a-say", word: "have a say", ipa: "", pos: "phr.", zh: "有发言权", zhShort: "有发言权",
    def: "to have the right to influence something by giving your opinion",
    book: "…you should be allowed to have a say on how the government spends them!", hl: "have a say",
    src: "Bethany, paragraph 1",
    dict: ["We had no say in the decision to sell the company.", OALD, OXU + "say_2", "had no say"],
    pic: "🙋 💬",
    tip: { note: "Here <b>say</b> is a noun: the right to give your opinion. <b>have a say in / on</b> something." } },

  /* ---------- Word Set 2 ---------- */
  { id: "behind-the-wheel", word: "behind the wheel", ipa: "", pos: "phr.", zh: "在驾驶汽车", zhShort: "在驾驶汽车",
    def: "driving a car",
    book: "My mum worries about me being behind the wheel.", hl: "behind the wheel",
    src: "Bethany, paragraph 1",
    dict: ["Never get behind the wheel if you’re too tired.", OALD, OXU + "wheel_1", "behind the wheel"],
    pic: "🚗",
    tip: { note: "The <b>wheel</b> is the steering wheel (方向盘). The person behind it is driving." } },
  { id: "ambulance", word: "ambulance", ipa: "/ˈæmbjʊləns/", pos: "n.", zh: "救护车", zhShort: "救护车",
    def: "a vehicle with special equipment for taking sick or injured people to hospital",
    book: "As an ambulance driver, she’s seen a lot of car accidents involving teenagers…", hl: "ambulance",
    src: "Bethany, paragraph 1",
    dict: ["The ambulance crew rushed her to the hospital.", OALD, OXU + "ambulance", "ambulance"],
    pic: "🚑",
    tip: { note: "On the front of many ambulances the word is written backwards, so that drivers ahead can read it in their mirrors." } },
  { id: "legal", word: "legal", ipa: "/ˈliːɡ(ə)l/", pos: "adj.", zh: "合法的", zhShort: "合法的",
    def: "allowed or required by law",
    book: "…the legal age for getting a driving licence should be 21.", hl: "legal",
    src: "Bethany, paragraph 1",
    dict: ["The legal age for drinking alcohol in the US is 21.", OALD, OXU + "legal-age", "legal age"],
    pic: "⚖️",
    tip: { note: "Opposite: <b>illegal</b> (il- = not). <b>the legal age</b> = 法定年龄" } },
  { id: "mature", word: "mature", ipa: "/məˈtʃʊə/", pos: "adj.", zh: "成熟的，明白事理的", zhShort: "成熟的",
    def: "(of a young person) behaving in a sensible way, like an adult",
    book: "But I think I’m already mature enough to understand that driving a car also means taking responsibility…", hl: "mature",
    src: "Bethany, paragraph 1",
    dict: ["Jane is very mature for her age.", OALD, OXU + "mature_1", "mature"],
    pic: "🍎",
    tip: { note: "Fruit can be mature (ripe) too. Opposite: <b>immature</b>. Noun: <b>maturity</b>." } },
  { id: "instantly", word: "instantly", ipa: "/ˈɪnstəntli/", pos: "adv.", zh: "立即，马上", zhShort: "立即，马上",
    def: "immediately",
    book: "I expected to feel instantly different…", hl: "instantly",
    src: "Lin Ning, paragraph 2",
    dict: ["Her voice is instantly recognizable.", OALD, OXU + "instantly", "instantly"],
    pic: "⚡ 🍜",
    tip: { parts: [["instant", "立即的"], ["ly", "adverb suffix 副词后缀"]],
      note: "Like <b>instant</b> noodles: ready at once." } },
  { id: "childhood", word: "childhood", ipa: "/ˈtʃaɪldhʊd/", pos: "n.", zh: "童年，儿童时代", zhShort: "童年",
    def: "the period of somebody’s life when they are a child",
    book: "…as if I had closed the door on my childhood and stepped into a whole new adult world.", hl: "childhood",
    src: "Lin Ning, paragraph 2",
    dict: ["She had a happy childhood.", OALD, OXU + "childhood", "childhood"],
    pic: "🧸",
    tip: { parts: [["child", "孩子"], ["hood", "state or period 状态，时期"]],
      note: "Learn it as a pair: <b>childhood</b> and <b>adulthood</b>." } },
  { id: "obey", word: "obey", ipa: "/əʊˈbeɪ/", pos: "v.", zh: "服从；遵守", zhShort: "服从；遵守",
    def: "to do what you are told or expected to do",
    book: "When I woke up the next day, there were still rules to obey and lessons to attend.", hl: "obey",
    src: "Lin Ning, paragraph 2",
    dict: ["People have a moral duty to obey the law.", OALD, OXU + "obey", "obey"],
    pic: "🚦",
    tip: { note: "<b>obey</b> the rules / the law. Opposite: <b>disobey</b>. Noun: <b>obedience</b>." } },
  { id: "subtle", word: "subtle", ipa: "/ˈsʌtl/", pos: "adj.", zh: "难以察觉的；微妙的", zhShort: "微妙的",
    def: "not very obvious or easy to notice",
    book: "In fact, the change has been more subtle and gradual than I imagined.", hl: "subtle",
    src: "Lin Ning, paragraph 2",
    dict: ["There are subtle differences between the two versions.", OALD, OXU + "subtle", "subtle"],
    pic: "🤫",
    tip: { note: "The <b>b</b> is silent: you say /ˈsʌtl/ but write su<b>b</b>tle." } },
  { id: "gradual", word: "gradual", ipa: "/ˈɡrædʒuəl/", pos: "adj.", zh: "逐渐的，逐步的", zhShort: "逐渐的",
    def: "happening slowly over a long period; not sudden",
    book: "In fact, the change has been more subtle and gradual than I imagined.", hl: "gradual",
    src: "Lin Ning, paragraph 2",
    dict: ["Recovery from the disease is very gradual.", OALD, OXU + "gradual", "gradual"],
    pic: "🌱 → 🌳",
    tip: { parts: [["grad", "step 步"], ["ual", "adjective suffix 形容词后缀"]],
      note: "From Latin <i>gradus</i>, a step: one step at a time. Adverb: <b>gradually</b>." } },
  { id: "selfish", word: "selfish", ipa: "/ˈselfɪʃ/", pos: "adj.", zh: "自私的", zhShort: "自私的",
    def: "caring only about yourself rather than about other people",
    book: "Instead of being the selfish teenager I used to be, I have begun to feel more aware of other people…", hl: "selfish",
    src: "Lin Ning, paragraph 2",
    dict: ["It was selfish of him to leave all the work to you.", OALD, OXU + "selfish", "selfish"],
    pic: "🙅",
    tip: { parts: [["self", "自己"], ["ish", "having the quality of …的"]],
      note: "Opposite: <b>unselfish</b> or <b>selfless</b>." } },

  /* ---------- Word Set 3 ---------- */
  { id: "organ-donation", word: "organ donation", ipa: "", pos: "phr.", zh: "器官捐献", zhShort: "器官捐献",
    def: "giving permission for a part of your body to be used to replace someone else’s organ",
    book: "…I will be signing an organ donation agreement this time tomorrow.", hl: "organ donation",
    src: "Lin Ning, paragraph 2",
    dict: ["The number of patients awaiting organ donations has soared.", "Cambridge Advanced Learner’s Dictionary",
      "https://dictionary.cambridge.org/dictionary/english/organ-donation", "organ donations"],
    pic: "🫀",
    tip: { parts: [["organ", "器官"], ["donation", "捐献"]],
      note: "Verb: <b>donate</b>. A person who donates is a <b>donor</b>." } },
  { id: "approval", word: "approval", ipa: "/əˈpruːvəl/", pos: "n.", zh: "赞成，同意", zhShort: "赞成，同意",
    def: "agreement to, or permission for, something",
    book: "Of course I asked my parents for their approval first.", hl: "approval",
    src: "Lin Ning, paragraph 2",
    dict: ["She desperately wanted to win her parents’ approval.", OALD, OXU + "approval", "approval"],
    pic: "👍",
    tip: { parts: [["approv(e)", "赞成"], ["al", "noun suffix 名词后缀"]],
      note: "Drop the <b>e</b>: approve → approval. Same pattern: arrive → arrival." } },
  { id: "steady", word: "steady", ipa: "/ˈstedi/", pos: "adj.", zh: "稳定的", zhShort: "稳定的",
    def: "not changing and not interrupted; regular",
    book: "…I currently don’t have a steady income…", hl: "steady",
    src: "Lin Ning, paragraph 2",
    dict: ["The new position would provide him with a steady income.", OALD, OXU + "steady_1", "steady"],
    pic: "📈",
    tip: { note: "<b>a steady job</b>, <b>a steady income</b>. Adverb: <b>steadily</b>." } },
  { id: "tempt", word: "tempt", ipa: "/tempt/", pos: "v.", zh: "诱惑，引诱", zhShort: "诱惑，引诱",
    def: "to make somebody want to do or have something, even if they know it is wrong",
    book: "…getting a credit card might tempt me to spend more money than I have!", hl: "tempt",
    src: "Lin Ning, paragraph 2",
    dict: ["I was tempted to take the day off.", OALD, OXU + "tempt", "tempted"],
    pic: "💳 🛍️",
    tip: { note: "Noun: <b>temptation</b>. Adjective: <b>tempting</b>. <b>tempt somebody to do</b> something." } },
  { id: "librarian", word: "librarian", ipa: "/laɪˈbreəriən/", pos: "n.", zh: "图书馆管理员", zhShort: "图书馆管理员",
    def: "a person who is in charge of or works in a library",
    book: "My librarian’s salary means that I’ll be living at home with my parents for a while longer.", hl: "librarian",
    src: "Morgan, paragraph 3",
    dict: ["He worked as librarian at the University of Hull from 1955…", OALD + " (entry: Philip Larkin)",
      "https://www.oxfordlearnersdictionaries.com/us/definition/english/philip-larkin", "librarian"],
    pic: "🧑 📚",
    tip: { parts: [["librar(y)", "图书馆"], ["ian", "person 人"]],
      note: "Same pattern: music → musician, history → historian." } },
  { id: "household", word: "household", ipa: "/ˈhaʊshəʊld/", pos: "adj.", zh: "家庭的", zhShort: "家庭的",
    def: "connected with looking after a house and the people living in it",
    book: "Because I contribute to the household bills…", hl: "household",
    src: "Morgan, paragraph 3",
    dict: ["household bills / chores / goods", "Oxford Advanced American Dictionary",
      "https://www.oxfordlearnersdictionaries.com/definition/american_english/household", "household"],
    pic: "🏠 🧾",
    tip: { parts: [["house", "房子"], ["hold", "to hold 容纳"]],
      note: "<b>household bills</b>, <b>household chores</b> (家务)." } },
  { id: "commute", word: "commute", ipa: "/kəˈmjuːt/", pos: "n.", zh: "每天上班的路程", zhShort: "每天上班的路程",
    def: "the journey that a person makes when they travel to work",
    book: "…my commute to work is quite expensive…", hl: "commute",
    src: "Morgan, paragraph 3",
    dict: ["I have only a short commute to work.", OALD, "https://www.oxfordlearnersdictionaries.com/us/definition/english/commute_2", "commute"],
    pic: "🏠 ⇄ 🏢",
    tip: { note: "Also a verb: to <b>commute</b> to work. A person who commutes is a <b>commuter</b>." } },
  { id: "deposit", word: "deposit", ipa: "/dɪˈpɒzɪt/", pos: "n.", zh: "订金", zhShort: "订金",
    def: "a sum of money that is given as the first part of a larger payment",
    book: "I know I could get a bank loan to pay the deposit on my very own apartment…", hl: "deposit",
    src: "Morgan, paragraph 3",
    dict: ["We’ve put down a 5 per cent deposit on the house.", OALD, OXU + "deposit_1", "deposit"],
    pic: "🔑 💰",
    tip: { parts: [["de", "down 向下"], ["posit", "put 放"]],
      note: "Money you <b>put down</b> first to secure something." } },
  { id: "commitment", word: "commitment", ipa: "/kəˈmɪtmənt/", pos: "n.", zh: "投入，花费", zhShort: "投入，花费",
    def: "a thing that you have promised or agreed to do, or that you have to do",
    book: "…but I don’t feel ready to make that kind of commitment…", hl: "commitment",
    src: "Morgan, paragraph 3",
    dict: ["I don’t want to take on any more commitments.", OALD, "https://www.oxfordlearnersdictionaries.com/us/definition/english/commitment", "commitments"],
    pic: "📝",
    tip: { parts: [["commit", "承诺，投入"], ["ment", "noun suffix 名词后缀"]],
      note: "Spelling: commi<b>tt</b>ment has a double <b>t</b> but a single <b>m</b> in the middle." } },
  { id: "suitable", word: "suitable", ipa: "/ˈsuːtəb(ə)l/", pos: "adj.", zh: "合适的", zhShort: "合适的",
    def: "right or appropriate for a particular purpose or occasion",
    book: "Choose another suitable title for the passage and give your reasons.", hl: "suitable",
    src: "Understanding Ideas, Activity 3",
    dict: ["This programme is not suitable for children.", OALD, OXU + "suitable", "suitable"],
    pic: "👔",
    tip: { parts: [["suit", "to be right for 适合"], ["able", "adjective suffix 形容词后缀"]],
      note: "<b>be suitable for</b> somebody or something." } }
];

GU.GROUP_SIZE = 10;
GU.groupWords = function (g) { return GU.WORDS.slice(g * GU.GROUP_SIZE, (g + 1) * GU.GROUP_SIZE); };
GU.wordById = function (id) { for (var i = 0; i < GU.WORDS.length; i++) if (GU.WORDS[i].id === id) return GU.WORDS[i]; return null; };

/* ---------------- Lesson 2: Starting Out ---------------- */
GU.L2 = {
  /* Photos from Wikimedia Commons (Creative Commons Attribution 2.0). */
  photos: [
    { file: "2003-01-13_Coming_of_Age_Day_at_Atsuta_Shrine.jpg", place: "Japan", caption: "Coming of Age Day at a shrine in Nagoya", short: "Coming of Age Day",
      credit: "Bruce Dailey", licence: "CC BY 2.0", emoji: "👘" },
    { file: "Quinceañera._Santa_Fe_(14369403262).jpg", place: "Latin America", caption: "Girls celebrating a quinceañera", short: "A quinceañera at fifteen",
      credit: "Christopher Michel", licence: "CC BY 2.0", emoji: "👗" },
    { file: "Michael's_Bar_Mitzvah_6.jpg", place: "Jewish tradition", caption: "A boy reading the Torah at his bar mitzvah", short: "A bar mitzvah at thirteen",
      credit: "Eli", licence: "CC BY 2.0", emoji: "📜" }
  ],
  warmupPrompts: [
    "Which coming-of-age celebrations in different countries do you know? How do people celebrate them?",
    "What does a coming-of-age ceremony mean to you?"
  ],
  warmupStarters: ["In …, young people celebrate coming of age by …", "To me, a coming-of-age ceremony means …", "I think the ceremony is important because …"],
  warmupExample: "In China, many senior high schools hold a coming-of-age ceremony for students who are turning 18. Students take an oath and thank their parents and teachers. To me, the ceremony means that I should start taking responsibility for my own choices.",

  video: {
    bvid: "BV1zL7a6PEhg",
    url: "https://www.bilibili.com/video/BV1zL7a6PEhg/",
    title: "Coming-of-Age Ceremony (FLTRP pre-class video)",
    length: "about 3 minutes"
  },
  q1: {
    prompt: "How do people celebrate in the video? Complete the table.",
    /* A "How" cell is correct if a word in the answer starts with one of the keys, or differs from a key of
       five or more letters by one letter. An "Age" cell is correct if every number in it is one of the ages. */
    rows: [
      { place: "Ancient China", span: 2, age: "20", ages: ["20", "twenty"], how: "Capping ceremony", keys: ["capping", "cap", "capped", "hat"] },
      { age: "15", ages: ["15", "fifteen"], how: "Hair-pinning ceremony", keys: ["hair", "hairpin", "hairpinning", "pinning"] },
      { place: "South Pacific Island", age: "9/10", ages: ["9", "10", "nine", "ten"], how: "Land diving (陆跳)", keys: ["land", "diving", "dive", "jump", "jumping"] },
      { place: "The US", age: "16", ages: ["16", "sixteen"], how: "Party", keys: ["party", "parties", "sweet"] }
    ],
    model: "In Ancient China, people held a “capping ceremony” for a man at the age of 20 and a “hair-pinning ceremony” for a woman around her 15th birthday. On the South Pacific island of Pentecost, boys of nine or ten take part in land diving. In the US, young people celebrate their 16th birthday with a party."
  },
  q2: {
    prompt: "Which celebration makes the greatest impression on you? Why?",
    choices: ["Capping and hair-pinning ceremonies (Ancient China)", "Land diving (Pentecost Island)", "Sixteenth birthday celebration (the US)"],
    starters: ["The … makes the greatest impression on me because …", "I find … impressive, since …"],
    example: "Land diving makes the greatest impression on me because the boys must be brave enough to jump from a high tower. It shows that growing up takes courage."
  },

  poem: {
    title: "If—",
    author: "Rudyard Kipling",
    note: "<em>If—</em> by Rudyard Kipling (1910), in the public domain. Chinese translation prepared for this course.",
    /* Audio recitation. Put the file in assets/audio/ and set audio to its path; cues are the start time
       (in seconds) of each of the 32 lines and drive the line highlighting. With no audio file,
       the poem is read line by line instead. */
    recording: { audio: "", reader: "Sir Michael Caine", cues: [] },
    /* The textbook prints stanzas 1 and 4. Stanzas 2 and 3 are shown so that the full recitation can be followed. */
    excerpt: [0, 3],
    stanzas: [
      [
        ["If you can keep your head when all about you", "如果在你周围的人都惊慌失措、"],
        ["Are losing theirs and blaming it on you;", "还把过错推给你时，你仍能保持冷静；"],
        ["If you can trust yourself when all men doubt you,", "如果在所有人都怀疑你时，你仍能相信自己，"],
        ["But make allowance for their doubting too;", "同时也体谅他们的怀疑；"],
        ["If you can wait and not be tired by waiting,", "如果你能耐心等待，而不因等待而厌倦，"],
        ["Or, being lied about, don’t deal in lies,", "或者，遭人诋毁时，不以谎言回击，"],
        ["Or, being hated, don’t give way to hating,", "或者，遭人憎恨时，不让自己心生憎恨，"],
        ["And yet don’t look too good, nor talk too wise;", "却又不显得过分完美，也不自作聪明地高谈阔论；"]
      ],
      [
        ["If you can dream – and not make dreams your master;", "如果你能怀有梦想，却不被梦想所主宰；"],
        ["If you can think – and not make thoughts your aim;", "如果你能深入思考，却不把思考当作目的；"],
        ["If you can meet with Triumph and Disaster", "如果你能坦然面对成功与灾难，"],
        ["And treat those two impostors just the same;", "并对这两个“骗子”一视同仁；"],
        ["If you can bear to hear the truth you’ve spoken", "如果你能忍受你说出的真话"],
        ["Twisted by knaves to make a trap for fools,", "被无赖歪曲，成为愚弄傻瓜的陷阱，"],
        ["Or watch the things you gave your life to, broken,", "或者眼看你倾注一生的事业毁于一旦，"],
        ["And stoop and build ’em up with worn-out tools;", "仍能俯下身，用破旧的工具把它重建；"]
      ],
      [
        ["If you can make one heap of all your winnings", "如果你能把赢得的一切堆在一起，"],
        ["And risk it on one turn of pitch-and-toss,", "押在一次掷硬币的输赢上，"],
        ["And lose, and start again at your beginnings", "输了，就从头再来，"],
        ["And never breathe a word about your loss;", "并且对损失只字不提；"],
        ["If you can force your heart and nerve and sinew", "如果你能迫使你的心力、勇气和筋骨"],
        ["To serve your turn long after they are gone,", "在早已耗尽之后仍为你效力，"],
        ["And so hold on when there is nothing in you", "在你内心一无所有时依然坚持，"],
        ["Except the Will which says to them: ‘Hold on!’", "只剩下意志对它们说：“坚持住！”"]
      ],
      [
        ["If you can talk with crowds and keep your virtue,", "如果你能与众人交谈而不失美德，"],
        ["Or walk with kings – nor lose the common touch;", "或与君王同行而不失平易近人；"],
        ["If neither foes nor loving friends can hurt you;", "如果敌人和挚友都无法伤害你；"],
        ["If all men count with you, but none too much;", "如果你重视每一个人，却不过分依赖任何人；"],
        ["If you can fill the unforgiving minute", "如果你能把无情流逝的每一分钟"],
        ["With sixty seconds’ worth of distance run –", "都用六十秒的奔跑来填满——"],
        ["Yours is the Earth and everything that’s in it,", "那么大地和其中的一切都属于你，"],
        ["And – which is more – you’ll be a Man, my son!", "而且——更重要的是——孩子，你将成为真正的男子汉！"]
      ]
    ]
  },
  pq1: {
    prompt: "What is the poem about?",
    starters: ["The poem is about …", "In the poem, a father …"],
    reference: "The poem is a father’s advice to his son about the qualities needed to become a virtuous or good man.",
    points: [
      { label: "a father (the speaker) talking to his son", any: ["father", "dad", "parent", "son ", "sons", "his son", "child"] },
      { label: "giving advice", any: ["advice", "advis", "tell", "teach", "guid", "suggest", "lesson", "instruct", "encourag", "hope", "expect", "wish"] },
      { label: "the qualities needed to become a good or virtuous man", any: ["qualit", "virtu", "good man", "good person", "character", "grow", "become a man", "be a man", "mature", "adult", "real man"] }
    ]
  },
  pq2: {
    /* line = line number in the full poem (1–32) */
    prompt: "According to Kipling, what qualities does his son need to “be a Man”? Tick those mentioned in the poem.",
    reference: "The qualities mentioned in the poem: self-belief, honesty, confidence, kindness, modesty, integrity, patience.",
    options: [
      { q: "self-belief", ok: true, line: 3, why: "“If you can trust yourself when all men doubt you”" },
      { q: "confidence", ok: true, line: 1, why: "“If you can keep your head when all about you / Are losing theirs”" },
      { q: "modesty", ok: true, line: 8, why: "“And yet don’t look too good, nor talk too wise”" },
      { q: "integrity", ok: true, line: 25, why: "“If you can talk with crowds and keep your virtue”" },
      { q: "honesty", ok: true, line: 6, why: "“Or, being lied about, don’t deal in lies”" },
      { q: "kindness", ok: true, line: 4, why: "“But make allowance for their doubting too”; “being hated, don’t give way to hating”" },
      { q: "pride", ok: false, line: 8, why: "Not mentioned. The poem warns against looking “too good”, which is the opposite of pride." },
      { q: "patience", ok: true, line: 5, why: "“If you can wait and not be tired by waiting”" }
    ]
  },
  pq3: {
    prompt: "Which of these qualities are most important to you as you grow up?",
    choices: ["self-belief", "confidence", "modesty", "integrity", "honesty", "kindness", "patience"],
    maxChoices: 2,
    starters: ["… is the most important quality to me because …", "As I grow up, I want to develop … because …"],
    example: "Patience is the most important quality to me. Growing up is a gradual process, and many changes do not happen instantly, so I need to wait and keep working."
  }
};
