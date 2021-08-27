class DetailComment {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, content, date, username, isDelete, replies,
    } = payload;

    this.id = id;
    this.content = (isDelete) ? DetailComment.DELETED_CONTENT_COMMENT : content;
    this.date = date;
    this.username = username;
    this.replies = replies;
  }

  static get DELETED_CONTENT_COMMENT() { return '**komentar telah dihapus**'; }

  _verifyPayload({
    id, content, date, username, isDelete, replies,
  }) {
    if (!id || !content || !date || !username || isDelete === undefined || !replies) {
      throw new Error('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string' || typeof content !== 'string' || typeof date !== 'string' || typeof username !== 'string' || typeof isDelete !== 'boolean' || !(replies instanceof Array)) {
      throw new Error('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DetailComment;
