import { format, parse } from 'date-fns';
import pt from 'date-fns/locale/pt';

import Mail from '../lib/Mail';

class SubscriptionMail {
  get key() {
    return 'SubscriptionMail';
  }

  async handle({ data }) {
    const { meetup, user } = data;

    await Mail.sendMail({
      to: `${meetup.user.name} <${meetup.user.email}>`,
      subject: 'Nova inscrição',
      template: 'subscription',
      context: {
        meetup: {
          title: meetup.title,
          user: meetup.user.name,
          date: format(parse(meetup.date), 'DD [de] MMMM[, às] H:mm[h]', {
            locale: pt,
          }),
        },
        subscriber: {
          name: user.name,
          email: user.email,
        },
      },
    });
  }
}

export default new SubscriptionMail();
