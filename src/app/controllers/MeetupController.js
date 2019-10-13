import { isBefore, parse, startOfDay, endOfDay, isPast } from 'date-fns';
import * as yup from 'yup';
import { Op } from 'sequelize';

import Meetup from '../models/Meetup';
import File from '../models/File';
import User from '../models/User';

class MeetupController {
  async index(req, res) {
    const where = {};
    const page = req.query.page || 1;

    if (req.query.date) {
      const searchDate = parse(req.query.date);

      where.date = {
        [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
      };
    }

    const meetups = await Meetup.findAndCountAll({
      where,
      limit: 10,
      offset: (page - 1) * 10,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: File,
          as: 'banner',
        },
      ],
    });

    res.set('x-total-count', meetups.count);

    return res.json(meetups.rows);
  }

  async store(req, res) {
    const { polyglot } = req;
    const schema = yup.object().shape({
      title: yup.string().required(),
      description: yup.string().required(),
      location: yup.string().required(),
      date: yup.date().required(),
      banner_id: yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res
        .status(400)
        .json({ error: polyglot.t('meetup.validation_failed') });
    }

    const { title, description, location, date, banner_id } = req.body;

    if (isBefore(parse(date), new Date())) {
      return res
        .status(401)
        .json({ error: polyglot.t('meetup.past_date_not_allowed') });
    }

    try {
      const meetup = await Meetup.create({
        title,
        description,
        location,
        date,
        banner_id,
        user_id: req.userId,
      });

      return res.json(meetup);
    } catch (err) {
      return res
        .status(400)
        .json({ error: polyglot.t('meetup.invalid_image') });
    }
  }

  async update(req, res) {
    const { polyglot } = req;
    const schema = yup.object().shape({
      title: yup.string().required(),
      description: yup.string().required(),
      location: yup.string().required(),
      date: yup.date().required(),
      banner_id: yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res
        .status(400)
        .json({ error: polyglot.t('meetup.validation_failed') });
    }

    // TODO: Check if banner_id is a valid banner

    const meetup = await Meetup.findByPk(req.params.id);

    if (meetup.user_id !== req.userId) {
      return res
        .status(401)
        .json({ error: polyglot.t('meetup.permission_required_to_edit') });
    }

    if (isPast(parse(meetup.date))) {
      return res
        .status(401)
        .json({ error: polyglot.t('meetup.cant_edit_past_meetup') });
    }

    const { date } = req.body;

    if (isBefore(parse(date), new Date())) {
      return res
        .status(401)
        .json({ error: polyglot.t('meetup.past_date_not_allowed') });
    }

    const meetupUpdated = await meetup.update(req.body);

    return res.json(meetupUpdated);
  }

  async delete(req, res) {
    const { polyglot } = req;
    const meetup = await Meetup.findByPk(req.params.id);

    if (meetup.user_id !== req.userId) {
      return res
        .status(401)
        .json({ error: polyglot.t('meetup.permission_required_to_cancel') });
    }

    if (isBefore(parse(meetup.date), new Date())) {
      return res
        .status(401)
        .json({ error: polyglot.t('meetup.cant_cancel_past_meetup') });
    }

    await meetup.destroy();

    return res.json();
  }
}

export default new MeetupController();
