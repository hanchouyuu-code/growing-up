/* 课程内容文件：想改词汇、题目、故事，只改这个文件就行。
   Course content: edit the lists below to change the lesson. */
window.COURSE = (function(){
'use strict';
var MODULES=[
  {id:'vocab',n:'1',title:'Vocabulary',sub:'Words for turning 18',min:20,built:true},
  {id:'starting-out',n:'2',title:'Starting out',sub:'Dilemmas about growing up',min:20},
  {id:'reading',n:'3',title:'Reading',sub:'The Age of Majority',min:30},
  {id:'writing',n:'4',title:'Writing',sub:'Responsibilities at 18',min:20},
  {id:'teacher',n:'T',title:'Teacher’s corner',sub:'Guide and answer keys',min:null,teacher:true}
];
var STEPS=[
  {id:'warm',label:'Warm-up',min:3},
  {id:'learn',label:'Learn',min:7},
  {id:'practise',label:'Practise',min:6},
  {id:'sort',label:'Sort',min:3},
  {id:'reflect',label:'Reflect',min:1}
];
var WORDS=[
  {id:'majority',group:'A',word:'the age of majority',pos:'noun phrase',ipa:'/ði ˌeɪdʒ əv məˈdʒɒrəti/',def:'the age at which the law treats you as an adult',zh:'法定成年年龄',ex:'In China, the age of majority is 18.',hl:'age of majority',key:['majority']},
  {id:'milestone',group:'A',word:'milestone',pos:'noun',ipa:'/ˈmaɪlstəʊn/',def:'a very important event or stage in your life',zh:'里程碑；人生中的重要时刻',ex:'Finishing high school is a big milestone for many teenagers.',hl:'milestone',key:['milestone']},
  {id:'ceremony',group:'A',word:'coming-of-age ceremony',pos:'noun',ipa:'/ˌkʌmɪŋ əv ˈeɪdʒ ˈserəməni/',def:'a special event that celebrates young people becoming adults',zh:'成人礼',ex:'Our school holds a coming-of-age ceremony for students who are turning 18.',hl:'coming-of-age ceremony',key:['coming-of-age','coming of age','ceremony']},
  {id:'election',group:'A',word:'general election',pos:'noun',ipa:'/ˌdʒenrəl ɪˈlekʃn/',def:'an election in which people across the whole country vote, for example to choose a new government',zh:'大选；全国性选举',ex:'In the UK, people can vote in a general election from the age of 18.',hl:'general election',key:['election','vote','voting']},
  {id:'licence',group:'A',word:'driving licence',pos:'noun',ipa:'/ˈdraɪvɪŋ ˌlaɪsns/',def:'an official card that shows you are allowed to drive',zh:'驾驶执照；驾照',ex:'He plans to get his driving licence soon after he turns 18.',hl:'driving licence',note:'American English: driver’s license',key:['licence','license']},
  {id:'donation',group:'A',word:'organ donation',pos:'noun',ipa:'/ˈɔːɡən dəʊˌneɪʃn/',def:'agreeing to give a part of your body, such as your heart, to help a sick person, often after you die',zh:'器官捐献',ex:'Some young adults sign up for organ donation because they want to help save lives.',hl:'organ donation',key:['organ','donat']},
  {id:'wage',group:'B',word:'wage',pos:'noun',ipa:'/weɪdʒ/',def:'money you are paid for your work, usually every hour or every week',zh:'工资（通常按小时或按周计算）',ex:'She earns a small wage from her summer job at a café.',hl:'wage',key:['wage']},
  {id:'tax',group:'B',word:'tax',pos:'noun',ipa:'/tæks/',def:'money that people pay to the government to pay for public services',zh:'税；税款',ex:'When you earn enough money, you have to pay tax on it.',hl:'tax',key:['tax']},
  {id:'bill',group:'B',word:'bill',pos:'noun',ipa:'/bɪl/',def:'a piece of paper or a message that tells you how much money you must pay for something',zh:'账单',ex:'Living on your own means paying your own phone and electricity bills.',hl:'bills',key:['bill']},
  {id:'card',group:'B',word:'credit card',pos:'noun',ipa:'/ˈkredɪt kɑːd/',def:'a plastic card that lets you buy things now and pay for them later',zh:'信用卡',ex:'A credit card is easy to use, but you must pay the money back on time.',hl:'credit card',key:['credit card']},
  {id:'loan',group:'B',word:'loan',pos:'noun',ipa:'/ləʊn/',def:'money that you borrow from a bank or a person and must pay back',zh:'贷款；借款',ex:'Some students take out a loan to pay for university.',hl:'loan',key:['loan']},
  {id:'resp',group:'B',word:'responsibility',pos:'noun',ipa:'/rɪˌspɒnsəˈbɪləti/',def:'something that it is your duty to do or to take care of',zh:'责任',ex:'Becoming an adult brings new rights and new responsibilities.',hl:'responsibilities',key:['responsib']}
];
var WARMUP=[
  {q:'Start working at a job',zh:'开始工作',a:16,hint:'It is younger than 18.',fb:'In China, 16 is the minimum legal age for work.'},
  {q:'Apply for a car driving licence',zh:'申请小汽车驾照',a:18,hint:'It is the age when you become a legal adult.',fb:'You can apply for a car driving licence from 18.'},
  {q:'Vote in elections',zh:'参加选举投票',a:18,hint:'Think about when you have your coming-of-age ceremony.',fb:'Citizens can vote from 18. It is one of the rights that come with adulthood.'}
];
var STORY=[
  'Next month Lin Xiao turns 18, which is ',
  {a:'the age of majority',hint:'Look at “turns 18”. Which phrase means the age when the law treats you as an adult?',zh:'中文提示：法定成年年龄'},
  ' in China. Her school is holding a ',
  {a:'coming-of-age ceremony',hint:'This is a special event for students who are becoming adults.',zh:'中文提示：成人礼'},
  ' for her class, and she sees it as an important ',
  {a:'milestone',hint:'Which word means an important stage in your life?',zh:'中文提示：里程碑'},
  ' in her life. She plans to take driving lessons and get her ',
  {a:'driving licence',hint:'What do you need before you can drive on the road?',zh:'中文提示：驾照'},
  '. Lin also works at a bookshop at weekends. Her ',
  {a:'wage',hint:'This is the money she gets for her work.',zh:'中文提示：工资'},
  ' is not high, but she is learning to manage her money. “Soon I’ll be paying my own phone ',
  {a:'bill',hint:'What tells you how much you must pay for your phone each month?',zh:'中文提示：账单'},
  ' every month,” she says. “Being an adult isn’t only about freedom. It’s about ',
  {a:'responsibility',hint:'Freedom and this word go together. It is something you have a duty to do.',zh:'中文提示：责任'},
  ' too.”'
];
var DISTRACTORS=['loan','tax','credit card','general election','organ donation'];
var SORT=[
  {t:'Vote in a general election',a:'right',fb:'Voting is a right. From 18, the law allows you to do it.',hint:'Do you have to do this, or are you allowed to do it?'},
  {t:'Pay tax on the money you earn',a:'resp',fb:'Paying tax is a responsibility. If you earn enough, you must pay it.',hint:'Can you choose not to do this?'},
  {t:'Get a driving licence',a:'right',fb:'It is a right you can choose to use. Once you drive, driving safely becomes your responsibility.',hint:'Does everyone have to do this?'},
  {t:'Pay your bills on time',a:'resp',fb:'This is a responsibility. If you use a service, you must pay for it.',hint:'What happens if you do not do this?'},
  {t:'Register for organ donation',a:'right',fb:'This is a personal choice. Nobody has to do it.',hint:'Must people do this, or may they choose?'},
  {t:'Pay back a loan',a:'resp',fb:'When you borrow money, you must pay it back.',hint:'After you borrow money, is paying it back a choice?'}
];

return {MODULES:MODULES,STEPS:STEPS,WORDS:WORDS,WARMUP:WARMUP,STORY:STORY,DISTRACTORS:DISTRACTORS,SORT:SORT};
})();
