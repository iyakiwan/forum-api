class NewReply {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      content, threadId, commentId, owner, date,
    } = payload;

    this.content = content;
    this.threadId = threadId;
    this.commentId = commentId;
    this.owner = owner;
    this.date = date;
  }

  _verifyPayload({
    content, threadId, commentId, owner, date,
  }) {
    if (!content || !threadId || !commentId || !owner || !date) {
      throw new Error('NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof content !== 'string' || typeof threadId !== 'string' || typeof commentId !== 'string' || typeof owner !== 'string' || typeof date !== 'string') {
      throw new Error('NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = NewReply;
