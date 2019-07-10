import { isBefore, parse } from 'date-fns';

import Meetup from '../models/Meetup';
import Subscription from '../models/Subscription';

class SubscriptionController {
  async store(req, res) {
    const { userId } = req;

    const meetup = await Meetup.findByPk(req.params.meetupId);

    if (!meetup) {
      return res.status(400).json({ error: 'Meetup not found.' });
    }

    if (meetup.user_id === userId) {
      return res
        .status(401)
        .json({ error: "Can't subscribe to your own meetup." });
    }

    if (isBefore(parse(meetup.date), new Date())) {
      return res.status(401).json({ error: 'This meetup has already ended.' });
    }

    const hasSubscription = await Subscription.findOne({
      where: { user_id: userId, meetup_id: meetup.id },
    });

    if (hasSubscription) {
      return res
        .status(401)
        .json({ error: 'Already subscribed for this meetup.' });
    }

    const hasSubscriptionSameTime = await Subscription.findOne({
      where: { user_id: userId },
      include: [
        {
          model: Meetup,
          as: 'meetup',
          required: true,
          where: { date: meetup.date },
        },
      ],
    });

    if (hasSubscriptionSameTime) {
      return res.status(401).json({
        error: "Can't subscribe to two meetups at the same time",
      });
    }

    const subscription = await Subscription.create({
      user_id: userId,
      meetup_id: meetup.id,
    });

    return res.json(subscription);
  }
}

export default new SubscriptionController();
