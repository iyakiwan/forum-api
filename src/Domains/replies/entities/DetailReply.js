class DetailReply {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, content, date, username, isDelete,
    } = payload;

    this.id = id;
    this.content = (isDelete) ? DetailReply.DELETED_CONTENT_REPLY : content;
    this.date = date;
    this.username = username;
  }

  static get DELETED_CONTENT_REPLY() { return '**balasan telah dihapus**'; }

  _verifyPayload({
    id, content, date, username, isDelete,
  }) {
    if (!id || !content || !date || !username || isDelete === undefined) {
      throw new Error('DETAIL_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string' || typeof content !== 'string' || typeof date !== 'string' || typeof username !== 'string' || typeof isDelete !== 'boolean') {
      throw new Error('DETAIL_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DetailReply;
