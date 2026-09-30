const BOT_TOKEN = '1503235582:AAFxHecMJGI4KuvDjf6ciF1s4Ug-LFKaWt0';

const screens = [
    {
        text:
            'Доброго времени суток, дорогой коллега 👋\n' +
            'Приглашаем тебя познакомиться с историей создания нашего конкурсного рисунка 🎨\n' +
            'Приятного чтения! 📖',
    },
    {
        text: 'Как рождался шедевр: история одного творческого шторма 🌪️',
        image:
            'https://github.com/aikowocki/tatcabel/blob/main/assets/image1.jpeg?raw=true',
    },
    {
        text:
            '⚡️ Искра\n' +
            'Всё началось с конкурса «Мы — кабельщики». Майя затянула Аделю, Аделя — Марию. Мы планировали просто поучаствовать, но не учли одного: у нас слишком много амбиций.',
        image:
            'https://github.com/aikowocki/tatcabel/blob/main/assets/image1.jpeg?raw=true',
    },
    {
        text:
            '🔍️ Битва смыслов\n' +
            'Мы пытались уместить в один холст и реальность, и будущее, но риск перегрузить его деталями был огромен. Мария была нашим компасом, и её требование «глубокого смысла» стало для нас настоящим вызовом. Мы спорили до хрипоты, отсекая всё лишнее. В приоритете был не просто результат, а совершенство, открывающее путь к победе.',
        image:
            'https://github.com/aikowocki/tatcabel/blob/main/assets/image1.jpeg?raw=true',
    },
    {
        text:
            '🔥 Ночной прорыв\n' +
            'Переломный момент случился вечером, когда офис опустел. Аделя достала свои секретные эскизы, сделанные в моменты самых жарких сомнений. Именно тогда к нам пришло озарение: зачем пытаться совместить две эпохи в один кадр, если можно заявить о самом важном? Мы решили не дробить внимание зрителя, а направить его в одну точку — в саму суть будущего.',
        image:
            'https://github.com/aikowocki/tatcabel/blob/main/assets/image1.jpeg?raw=true',
    },
    {
        text:
            '✨ Магия и цифра\n' +
            'Здесь наше творчество превратилось в слаженный механизм.\n' +
            'Майя создала на холсте безупречные цветовые переходы и буквально вдохнула в него жизнь; Мария придумала, как «продать» шедевр зрителям — не навязчиво, а по-настоящему ценно, а Аделя превратила эту задумку в технологичное приключение, соединив искусство с цифровым миром через QR-код.',
        image:
            'https://github.com/aikowocki/tatcabel/blob/main/assets/image1.jpeg?raw=true',
    },
    {
        text:
            '🌌 Взгляд за горизонт\n' +
            'Мы отказались от попыток запечатлеть настоящее, потому что наш вектор направлен на будущее. Перед вами — наше видение. Масштабная, смелая и яркая вселенная, которую мы создали вместе.',
        image:
            'https://github.com/aikowocki/tatcabel/blob/main/assets/image1.jpeg?raw=true',
    },
    {
        text:
            'Там, где энергия творчества встречается с масштабом ЭКМ Холдинг, рождается истинное искусство. ⚡️\n' +
            '\n' +
            'Спасибо за внимание ✨\n' +
            'Будем рады твоему голосу за нас ❤️',
        image:
            'https://github.com/aikowocki/tatcabel/blob/main/assets/image1.jpeg?raw=true',
    },
];

async function telegram(method, body) {
    const response = await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/${method}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        },
    );

    const result = await response.json();

    console.log(method, result);

    return result;
}

async function sendScreen(chatId, screenIndex) {
    const screen = screens[screenIndex];
    const isFirstScreen = screenIndex === 0;
    const isLastScreen = screenIndex === screens.length - 1;

    // Первый экран — просто текст
    if (isFirstScreen) {
        return telegram('sendMessage', {
            chat_id: chatId,
            text: screen.text,
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: 'Продолжить →',
                            callback_data: `screen:${screenIndex + 1}`,
                        },
                    ],
                ],
            },
        });
    }

    // Последний экран — без кнопки
    if (isLastScreen) {
        return telegram('sendPhoto', {
            chat_id: chatId,
            photo: screen.image,
            caption: screen.text,
        });
    }

    // Обычный экран
    return telegram('sendPhoto', {
        chat_id: chatId,
        photo: screen.image,
        caption: screen.text,
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'Продолжить →',
                        callback_data: `screen:${screenIndex + 1}`,
                    },
                ],
            ],
        },
    });
}

export default {
    async fetch(request) {
        if (request.method !== 'POST') {
            return new Response('OK');
        }

        try {
            const update = await request.json();

            console.log('UPDATE:', JSON.stringify(update));

            // /start
            if (update.message?.text === '/start') {
                await sendScreen(update.message.chat.id, 0);

                return new Response('OK');
            }

            // Нажатие кнопки
            if (update.callback_query) {
                const query = update.callback_query;

                await telegram('answerCallbackQuery', {
                    callback_query_id: query.id,
                });

                const screenIndex = Number(
                    query.data.replace('screen:', ''),
                );

                if (screens[screenIndex]) {
                    await sendScreen(
                        query.message.chat.id,
                        screenIndex,
                    );
                }

                return new Response('OK');
            }

            return new Response('OK');
        } catch (error) {
            console.error(error);

            return new Response('Internal error', {
                status: 500,
            });
        }
    },
};