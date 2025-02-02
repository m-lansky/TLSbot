const TelegramBot = require('node-telegram-bot-api');

// استبدل هذا بالتوكن الخاص بك
const token = '7721343230:AAESLk_hK3m9va8-4LmFO77SvbOtxhRT61E';

// تهيئة البوت
const bot = new TelegramBot(token, { polling: true });

// تخزين حالة المستخدم
let userState = {}; // لتخزين حالة المستخدم (أي مرحلة هو فيها)
let userCreationDate = {}; // لتخزين تاريخ انضمام المستخدم
let userPasswordLength = {}; // لتخزين طول كلمة السر المختارة من قبل المستخدم

// دالة توليد كلمة المرور
const generatePassword = (length) => {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
  let password = "";
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

// استجابة /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  const welcomeMessage = "أهلاً بكم في بوت The Lord PAS 🥷🏻 :\n\nهذا البوت متخصص في إنشاء كلمات سر قوية جاهزة للإستخدام .🛡️\n\n ـ اختر (🔑إنشاء كلمة سر) ليتم توليدها لك فوراً .🔒";
  const options = {
    reply_markup: {
      keyboard: [
        ['🔑 إنشاء كلمة سر'],
        ['👤 الحساب الشخصي']
      ],
      resize_keyboard: true,
      one_time_keyboard: false
    }
  };
  
  bot.sendMessage(chatId, welcomeMessage, options);
  userState[chatId] = 'main'; // تخزين الحالة على أنه في القائمة الرئيسية
});

// استجابة لتوليد كلمة المرور
bot.onText(/🔑 إنشاء كلمة سر/, (msg) => {
  const chatId = msg.chat.id;

  const message = "اختَر طول كلمة السر:";
  const options = {
    reply_markup: {
      keyboard: [
        ['5', '10', '15', '20', '25', '30', '35'],
        ['🔙 العودة']
      ],
      resize_keyboard: true,
      one_time_keyboard: false
    }
  };
  
  bot.sendMessage(chatId, message, options);
  userState[chatId] = 'chooseLength';
});

// استجابة لاختيار طول كلمة السر
bot.onText(/^(5|10|15|20|25|30|35)$/, (msg, match) => {
  const chatId = msg.chat.id;
  const length = parseInt(match[0]);
  const password = generatePassword(length);

  const message = `🔑 كلمة السر:\n\`${password}\``;
  const options = {
    reply_markup: {
      keyboard: [
        ['🔄 إعادة توليد كلمة السر'],
        ['🔙 العودة']
      ],
      resize_keyboard: true,
      one_time_keyboard: false
    }
  };

  // حفظ طول كلمة السر في الذاكرة
  userPasswordLength[chatId] = length;

  bot.sendMessage(chatId, message, { parse_mode: 'Markdown', reply_markup: options.reply_markup });
  userState[chatId] = 'generatedPassword';
});

// استجابة لإعادة توليد كلمة السر
bot.onText(/🔄 إعادة توليد كلمة السر/, (msg) => {
  const chatId = msg.chat.id;
  const state = userState[chatId];

  if (state === 'generatedPassword') {
    const length = userPasswordLength[chatId] || 10; // استخدم الطول المخزن أو 10 إذا لم يكن موجودًا
    const password = generatePassword(length);

    const message = `🔑 كلمة السر:\n\`${password}\``;
    const options = {
      reply_markup: {
        keyboard: [
          ['🔄 إعادة توليد كلمة السر'],
          ['🔙 العودة']
        ],
        resize_keyboard: true,
        one_time_keyboard: false
      }
    };

    bot.sendMessage(chatId, message, { parse_mode: 'Markdown', reply_markup: options.reply_markup });
  }
});

// استجابة زر العودة
bot.onText(/🔙 العودة/, (msg) => {
  const chatId = msg.chat.id;
  const state = userState[chatId];

  if (state === 'chooseLength' || state === 'generatedPassword' || state === 'accountInfo') {
    // العودة إلى الواجهة الرئيسية
    const welcomeMessage = "أهلاً بكم في بوت The Lord PAS 🥷🏻 :\n\nهذا البوت متخصص في إنشاء كلمات سر قوية جاهزة للإستخدام .🛡️\n\n ـ اختر (🔑إنشاء كلمة سر) ليتم توليدها لك فوراً .🔒";
    const options = {
      reply_markup: {
        keyboard: [
          ['🔑 إنشاء كلمة سر'],
          ['👤 الحساب الشخصي']
        ],
        resize_keyboard: true,
        one_time_keyboard: false
      }
    };

    bot.sendMessage(chatId, welcomeMessage, options);
    userState[chatId] = 'main';
  }
});

// استجابة لعرض الحساب الشخصي
bot.onText(/👤 الحساب الشخصي/, (msg) => {
  const chatId = msg.chat.id;

  const message = "🔹 معلومات حسابك:\n\n📅 تاريخ الانضمام للبوت:";
  const options = {
    reply_markup: {
      keyboard: [
        ['📅 عرض تاريخ الانضمام'],
        ['🔙 العودة']
      ],
      resize_keyboard: true,
      one_time_keyboard: false
    }
  };

  bot.sendMessage(chatId, message, options);
  userState[chatId] = 'accountInfo';
});

// استجابة لعرض تاريخ الانضمام
bot.onText(/📅 عرض تاريخ الانضمام/, (msg) => {
  const chatId = msg.chat.id;

  if (userCreationDate[chatId]) {
    const message = `📅 تاريخ انضمامك للبوت هو: ${userCreationDate[chatId]}`;
    bot.sendMessage(chatId, message);
  } else {
    const currentDate = new Date().toLocaleDateString();
    userCreationDate[chatId] = currentDate;
    const message = `📅 تاريخ انضمامك للبوت هو: ${currentDate}`;
    bot.sendMessage(chatId, message);
  }
});
