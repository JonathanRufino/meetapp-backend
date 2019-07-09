import { isBefore, parse } from 'date-fns';
import * as yup from 'yup';

import Meetup from '../models/Meetup';

class MeetupController {
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

    const meetup = await Meetup.create({
      title,
      description,
      location,
      date,
      banner_id,
      user_id: req.userId,
    });

    return res.json(meetup);
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

    const { title, description, location, date, banner_id } = req.body;

    if (isBefore(parse(date), new Date())) {
      return res.status(401).json({ error: 'Past dates are not allowed.' });
    }

    const meetupUpdated = await Meetup.create({
      title,
      description,
      location,
      date,
      banner_id,
      user_id: req.userId,
    });

    return res.json(meetupUpdated);
  }
}

export default new MeetupController();
