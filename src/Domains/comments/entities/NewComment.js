class NewThread {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      content, threadId, owner, date,
    } = payload;

    this.content = content;
    this.threadId = threadId;
    this.owner = owner;
    this.date = date;
  }

  _verifyPayload({
    content, threadId, owner, date,
  }) {
    if (!content || !threadId || !owner || !date) {
      throw new Error('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof content !== 'string' || typeof threadId !== 'string' || typeof owner !== 'string' || typeof date !== 'string') {
      throw new Error('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = NewThread;
