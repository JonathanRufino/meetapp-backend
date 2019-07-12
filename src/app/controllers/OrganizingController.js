import Meetup from '../models/Meetup';

class OrganizingController {
  async index(req, res) {
    const userMeetups = await Meetup.findAll({
      where: { user_id: req.userId },
    });

    return res.json(userMeetups);
  }
}

export default new OrganizingController();
