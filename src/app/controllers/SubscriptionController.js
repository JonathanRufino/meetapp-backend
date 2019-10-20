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
    const page = req.query.page || 1;

    const subscriptions = await Subscription.findAndCountAll({
      where: {
        user_id: req.userId,
      },
      limit: 10,
      offset: (page - 1) * 10,
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

    res.set('x-total-count', subscriptions.count);

    return res.json(subscriptions.rows);
  }

  async store(req, res) {
    const { polyglot } = req;
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
      return res
        .status(404)
        .json({ error: polyglot.t('subscription.meetup_not_found') });
    }

    if (meetup.user_id === user.id) {
      return res.status(400).json({
        error: polyglot.t('subscription.cant_subscribe_to_own_meetup'),
      });
    }

    if (isBefore(parse(meetup.date), new Date())) {
      return res
        .status(400)
        .json({ error: polyglot.t('subscription.meetup_ended') });
    }

    const hasSubscription = await Subscription.findOne({
      where: { user_id: user.id, meetup_id: meetup.id },
    });

    if (hasSubscription) {
      return res
        .status(409)
        .json({ error: polyglot.t('subscription.already_subscribed') });
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
      return res.status(400).json({
        error: polyglot.t(
          'subscription.cant_subscribe_to_meetups_at_same_time'
        ),
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

    return res.status(201).json(subscription);
  }

  async delete(req, res) {
    const { polyglot } = req;
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
      return res
        .status(404)
        .json({ error: polyglot.t('subscription.subscription_not_found') });
    }

    if (subscription.user_id !== req.userId) {
      return res.status(401).json({
        error: polyglot.t(
          'subscription.permission_required_to_cancel_subscription'
        ),
      });
    }

    if (isBefore(parse(subscription.meetup.date), new Date())) {
      return res.status(401).json({
        error: polyglot.t('subscription.cant_cancel_past_subscriptions'),
      });
    }

    await subscription.destroy();

    return res.json({});
  }
}

export default new SubscriptionController();
