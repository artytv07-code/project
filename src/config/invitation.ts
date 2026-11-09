import type { ImageKey } from '../data/images';

export type DetailFrameConfig = {
  image: ImageKey;
  text: string;
};

export type InvitationConfig = {
  siteName: string;
  storyLabel: string;
  signature: string;
  city: string;
  weekday: string;
  weekdayAccusative: string;
  date: string | null;
  time: string | null;
  place: string | null;
  messenger: {
    url: string;
    message: string;
  };
  audio: {
    src: string;
    volume: number;
  };
  assets: {
    intro: ImageKey;
    city: ImageKey[];
    intrigue: ImageKey;
    invitation: ImageKey;
    panel: ImageKey;
    final: ImageKey;
  };
  photoLabels: Record<string, string>;
  texts: {
    intro: {
      wordmark: string;
      label: string;
      title: string;
      subtitle: string;
      cta: string;
    };
    city: {
      lines: string[];
      cta: string;
    };
    details: {
      frames: DetailFrameConfig[];
      ending: string;
      cta: string;
      skip: string;
    };
    intrigue: {
      lines: string[];
      cta: string;
    };
    invitation: {
      eyebrow: string;
      title: string;
      question: string;
      body: string[];
      tagline: string;
      primary: string;
      secondary: string;
    };
    panel: {
      eyebrow: string;
      title: string;
      intro: string;
      whenQuestion: string;
      whereQuestion: string;
      whatQuestion: string;
      whatAnswer: string;
      closing: string;
      cta: string;
      credits: string;
    };
    final: {
      kicker: string;
      line1: string;
      line2: string;
      signoff: string;
      signature: string;
      messageCta: string;
      restart: string;
      credits: string;
    };
  };
  creditsEnabled: boolean;
};

/**
 * Единая точка настройки приглашения.
 *
 * Дата, время и место по умолчанию не заданы — сайт не подставляет
 * текущую среду и не выдумывает адрес. Впишите свои значения сюда.
 */
export const invitation: InvitationConfig = {
  siteName: 'Один особенный вечер',
  storyLabel: 'Небольшая история',
  signature: 'Гомель · Среда · Вечер',
  city: 'Гомель',
  weekday: 'Среда',
  weekdayAccusative: 'среду',
  date: null,
  time: null,
  place: null,

  messenger: {
    // Например: https://t.me/your_nickname или https://wa.me/375XXXXXXXXX
    url: '',
    message: 'Привет! Я согласна на вечернюю прогулку в среду.',
  },

  audio: {
    src: '/audio/evening-theme.mp3',
    volume: 0.55,
  },

  assets: {
    intro: 'bridge',
    city: ['lenin', 'embankment2', 'river'],
    intrigue: 'embankment1',
    invitation: 'bridge',
    panel: 'palace',
    final: 'embankment2',
  },

  photoLabels: {
    bridge: 'Мост через Сож',
    river: 'Река Сож',
    embankment1: 'Вечерняя набережная',
    embankment2: 'Набережная после дождя',
    lighthouse: 'Светящиеся фонари',
    fountain: 'Фонтан у цирка',
    palace: 'Дворец Румянцевых и Паскевичей',
    lenin: 'Улица Ленина',
    cafe: 'Кофейня A-Caffe',
  },

  texts: {
    intro: {
      wordmark: 'Один особенный вечер',
      label: 'Небольшая история',
      title: 'У каждого вечера есть своя атмосфера…',
      subtitle: 'Иногда её хочется разделить с кем-то',
      cta: 'Посмотреть, что дальше',
    },
    city: {
      lines: [
        'Представь…',
        'Вечерний город. Красивые улицы. Огни в окнах.',
        'Никуда не нужно спешить.',
      ],
      cta: 'Дальше',
    },
    details: {
      frames: [
        { image: 'cafe', text: 'Найти уютное место…' },
        { image: 'embankment2', text: 'Немного побродить без маршрута…' },
        { image: 'lighthouse', text: 'Полюбоваться огнями города…' },
        { image: 'fountain', text: 'И просто наслаждаться моментом' },
      ],
      ending: 'Звучит неплохо, правда?',
      cta: 'Продолжить',
      skip: 'Пропустить',
    },
    intrigue: {
      lines: [
        'Вообще-то…',
        'Я придумал кое-что интересное',
        'И хотел бы кое-кого пригласить',
      ],
      cta: 'Кажется, я догадываюсь…',
    },
    invitation: {
      eyebrow: 'Итак, у меня есть один вопрос…',
      title: 'Как насчёт вечерней прогулки?',
      question: 'В эту среду?',
      body: [
        'Хочется провести этот вечер вместе с тобой.',
        'Прогуляться по красивым улицам, посмотреть на вечерний город, поболтать и просто хорошо провести время.',
      ],
      tagline: 'Среда · Вечер · Прогулка',
      primary: 'С удовольствием! ♡',
      secondary: 'Расскажи подробнее',
    },
    panel: {
      eyebrow: 'Вот что я предлагаю',
      title: 'Вечер без строгого плана',
      intro: 'Никаких обязательных пунктов. Только город, разговоры и немного тепла.',
      whenQuestion: 'Когда?',
      whereQuestion: 'Где?',
      whatQuestion: 'Что будем делать?',
      whatAnswer:
        'Гулять, разговаривать, наслаждаться вечерним городом. А если захочется — заглянем куда-нибудь на кофе.',
      closing: 'Главное — хорошая компания. Остальное придумаем вместе.',
      cta: 'Мне нравится эта идея ♡',
      credits: 'Фотографии Гомеля',
    },
    final: {
      kicker: 'Тогда договорились ♡',
      line1: 'Кажется, у этой среды появились планы',
      line2: 'Буду очень рад провести этот вечер с тобой',
      signoff: 'До встречи!',
      signature: 'Гомель · Среда · Вечер',
      messageCta: 'Написать мне',
      restart: 'Посмотреть ещё раз',
      credits: 'Фотографии Гомеля',
    },
  },

  creditsEnabled: true,
};

export function getWhenAnswer(): string {
  const { date, time, weekdayAccusative } = invitation;
  if (date && time) return `${date}, ${time}`;
  if (date) return `${date}, вечером`;
  if (time) return `В ${weekdayAccusative}, ${time}`;
  return `В ${weekdayAccusative} вечером. Точное время можем согласовать вместе.`;
}

export function getWhereAnswer(): string {
  return (
    invitation.place ??
    'В Гомеле. Выберем красивое и удобное место для встречи.'
  );
}

export function getMessengerHref(): string | null {
  const url = invitation.messenger.url.trim();
  if (!url) return null;
  const message = invitation.messenger.message.trim();
  if (!message) return url;
  return `${url}${url.includes('?') ? '&' : '?'}text=${encodeURIComponent(message)}`;
}
