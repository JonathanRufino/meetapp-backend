import faker from 'faker';
import { factory } from 'factory-girl';

import User from '../src/app/models/User';
import Meetup from '../src/app/models/Meetup';
import File from '../src/app/models/File';

factory.define('User', User, {
  name: faker.name.findName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
});

factory.define('File', File, {
  name: faker.system.fileName(),
  path: faker.system.filePath(),
});

factory.define('Meetup', Meetup, {
  title: faker.lorem.words(),
  description: faker.lorem.paragraphs().substring(0, 200),
  location: faker.address.streetAddress(),
  date: faker.date.future(),
  banner_id: factory.assoc('File', 'id'),
});

export default factory;
