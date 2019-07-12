import { isBefore, parse } from 'date-fns';
import { Op } from 'sequelize';

import SubscriptionMail from '../jobs/SubscriptionMail';
import Queue from '../../lib/Queue';

import User from '../models/User';
import Meetup from '../models/Meetup';
import Subscription from '../models/Subscription';

class SubscriptionController {
  async index(req, res) {
    const subscriptions = await Subscription.findAll({
      where: {
        user_id: req.userId,
      },
      include: [
        {
          model: Meetup,
          as: 'meetup',
          where: {
            date: {
              [Op.gt]: new Date(),
            },
          },
          required: true,
        },
      ],
      order: [['meetup', 'date']],
    });

    return res.json(subscriptions);
  }

  async store(req, res) {
    const user = await User.findByPk(req.userId);

    const meetup = await Meetup.findByPk(req.params.meetupId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email'],
        },
      ],
    });

    if (!meetup) {
      return res.status(400).json({ error: 'Meetup not found.' });
    }

    if (meetup.user_id === user.id) {
      return res
        .status(401)
        .json({ error: "Can't subscribe to your own meetup." });
    }

    if (isBefore(parse(meetup.date), new Date())) {
      return res.status(401).json({ error: 'This meetup has already ended.' });
    }

    const hasSubscription = await Subscription.findOne({
      where: { user_id: user.id, meetup_id: meetup.id },
    });

    if (hasSubscription) {
      return res
        .status(401)
        .json({ error: 'Already subscribed for this meetup.' });
    }

    const hasSubscriptionSameTime = await Subscription.findOne({
      where: { user_id: user.id },
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
      user_id: user.id,
      meetup_id: meetup.id,
    });

    await Queue.add(SubscriptionMail.key, {
      meetup,
      user,
    });

    return res.json(subscription);
  }
}

export default new SubscriptionController();
