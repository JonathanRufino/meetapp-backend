export default {
  auth: {
    token_missing: 'Token not provided.',
    invalid_token: 'Invalid token.',
  },

  session: {
    validation_failed: 'Invalid data entered.',
    user_not_found: 'User not found.',
    password_dont_match: 'Password does not match.',
  },

  meetup: {
    validation_failed: 'Invalid data entered.',
    past_date_not_allowed: 'Past dates are not allowed.',
    invalid_image: 'Invalid banner.',
    permission_required_to_edit:
      "You don't have permission to edit this meetup.",
    cant_edit_past_meetup: "You can't edit meetups that have already happened.",
    permission_required_to_cancel:
      "You don't have permission to cancel this meetup.",
    cant_cancel_past_meetup:
      "You can't cancel events that have already happened.",
  },

  subscription: {
    meetup_not_found: 'Meetup not found.',
    cant_subscribe_to_own_meetup: "Can't subscribe to your own meetup.",
    meetup_ended: 'This meetup has already ended.',
    already_subscribed: 'Already subscribed for this meetup.',
    cant_subscribe_to_meetups_at_same_time:
      "Can't subscribe to two meetups at the same time",
    subscription_not_found: 'Subscription not found.',
    permission_required_to_cancel_subscription:
      "You don't have permission to cancel this subscription.",
    cant_cancel_past_subscriptions:
      "You can't cancel subscriptions to events that have already happened.",
  },

  user: {
    validation_failed: 'Invalid data entered.',
    user_already_exists: 'User already exists.',
    password_dont_match: 'Password does not match.',
  },
};
