class NewThread {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      title, body, owner, date,
    } = payload;

    this.title = title;
    this.body = body;
    this.owner = owner;
    this.date = date;
  }

  _verifyPayload({
    title, body, owner, date,
  }) {
    if (!title || !body || !owner || !date) {
      throw new Error('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof title !== 'string' || typeof body !== 'string' || typeof owner !== 'string' || typeof date !== 'string') {
      throw new Error('NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = NewThread;
