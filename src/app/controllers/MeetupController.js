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

    const meetups = await Meetup.findAll({
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

    return res.json(meetups);
  }

  async store(req, res) {
    const schema = yup.object().shape({
      title: yup.string().required(),
      description: yup.string().required(),
      location: yup.string().required(),
      date: yup.date().required(),
      banner_id: yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed.' });
    }

    const { title, description, location, date, banner_id } = req.body;

    if (isBefore(parse(date), new Date())) {
      return res.status(401).json({ error: 'Past dates are not allowed.' });
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
      return res.status(400).json({ error: 'Invalid banner.' });
    }
  }

  async update(req, res) {
    const schema = yup.object().shape({
      title: yup.string().required(),
      description: yup.string().required(),
      location: yup.string().required(),
      date: yup.date().required(),
      banner_id: yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed.' });
    }

    const meetup = await Meetup.findByPk(req.params.id);

    if (meetup.user_id !== req.userId) {
      return res
        .status(401)
        .json({ error: "You don't have permission to edit this meetup." });
    }

    if (isPast(parse(meetup.date))) {
      return res
        .status(401)
        .json({ error: "You can't edit meetups that have already happened." });
    }

    const { date } = req.body;

    if (isBefore(parse(date), new Date())) {
      return res.status(401).json({ error: 'Past dates are not allowed.' });
    }

    const meetupUpdated = await meetup.update(req.body);

    return res.json(meetupUpdated);
  }

  async delete(req, res) {
    const meetup = await Meetup.findByPk(req.params.id);

    if (meetup.user_id !== req.userId) {
      return res
        .status(401)
        .json({ error: "You don't have permission to cancel this meetup." });
    }

    if (isBefore(parse(meetup.date), new Date())) {
      return res
        .status(401)
        .json({ error: "You can't cancel events that have already happened." });
    }

    await meetup.destroy();

    return res.json();
  }
}

export default new MeetupController();
