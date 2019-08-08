import { isBefore, parse } from 'date-fns';
import { Op } from 'sequelize';

import SubscriptionMail from '../jobs/SubscriptionMail';
import Queue from '../../lib/Queue';

import User from '../models/User';
import Meetup from '../models/Meetup';
import Subscription from '../models/Subscription';
import File from '../models/File';

class SubscriptionController {
  async index(req, res) {
    const subscriptions = await Subscription.findAll({
      where: {
        user_id: req.userId,
      },
      attributes: ['id'],
      include: [
        {
          model: Meetup,
          as: 'meetup',
          attributes: ['id', 'title', 'description', 'location', 'date'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['name'],
            },
            {
              model: File,
              as: 'banner',
              attributes: ['id', 'url', 'path'],
            },
          ],
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

  async delete(req, res) {
    const subscription = await Subscription.findByPk(req.params.id, {
      include: [
        {
          model: Meetup,
          as: 'meetup',
          attributes: ['date'],
        },
      ],
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    if (subscription.user_id !== req.userId) {
      return res.status(401).json({
        error: "You don't have permission to cancel this subscription.",
      });
    }

    if (isBefore(parse(subscription.meetup.date), new Date())) {
      return res.status(401).json({
        error:
          "You can't cancel subscriptions to events that have already happened.",
      });
    }

    await subscription.destroy();

    return res.json({});
  }
}

export default new SubscriptionController();
