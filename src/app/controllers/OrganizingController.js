import Meetup from '../models/Meetup';
import File from '../models/File';

class OrganizingController {
  async index(req, res) {
    const page = req.query.page || 1;

    const userMeetups = await Meetup.findAndCountAll({
      where: { user_id: req.userId },
      limit: 10,
      offset: (page - 1) * 10,
      attributes: ['id', 'title', 'description', 'location', 'date'],
      include: [
        {
          model: File,
          as: 'banner',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    res.set('x-total-count', userMeetups.count);

    return res.json(userMeetups.rows);
  }
}

export default new OrganizingController();
