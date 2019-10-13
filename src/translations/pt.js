export default {
  auth: {
    token_missing: 'Token não informado.',
    invalid_token: 'Token inválido.',
  },

  session: {
    validation_failed: 'Dados informados inválidos.',
    user_not_found: 'Usuário não encontrado.',
    password_dont_match: 'Senha inválida.',
  },

  meetup: {
    validation_failed: 'Dados informados inválidos.',
    past_date_not_allowed: 'Datas passadas não são permitidas.',
    invalid_image: 'Imagem inválida.',
    permission_required_to_edit:
      'Você não possui permissão para alterar este meetup.',
    cant_edit_past_meetup: 'Você não pode alterar meetups que já aconteceram.',
    permission_required_to_cancel:
      'Você não possui permissão para cancelar este meetup.',
    cant_cancel_past_meetup:
      'Você não pode cancelar meetups que já aconteceram.',
  },

  subscription: {
    meetup_not_found: 'Meetup não encontrado.',
    cant_subscribe_to_own_meetup:
      'Você não pode se inscrever no próprio meetup.',
    meetup_ended: 'Este meetup já encerrou.',
    already_subscribed: 'Inscrição já realizada.',
    cant_subscribe_to_meetups_at_same_time:
      'Não é possível se inscrever em dois meetups no mesmo horário.',
    subscription_not_found: 'Inscrição não encontrada',
    permission_required_to_cancel_subscription:
      'Você não possui permissão para cancelar esta inscrição.',
    cant_cancel_past_subscriptions:
      'Você não pode cancelar inscrições de eventos que já aconteceram.',
  },

  user: {
    validation_failed: 'Dados informados inválidos.',
    user_already_exists: 'Usuário já existe.',
    password_dont_match: 'Senha inválida.',
  },
};
