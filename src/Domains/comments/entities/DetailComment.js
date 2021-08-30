class DetailComment {
  constructor(payload) {
    DetailComment.DELETED_CONTENT_COMMENT = '**komentar telah dihapus**';

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

  // static get DELETED_CONTENT_COMMENT() { return '**komentar telah dihapus**'; }

  _verifyPayload(payload) {
    if (this._isPayloadNotContainNeededProperty(payload)) {
      throw new Error('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (this._isPayloadNotMeetDataTypeSpecification(payload)) {
      throw new Error('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }

  _isPayloadNotContainNeededProperty({
    id, content, date, username, isDelete, replies,
  }) {
    return !id || !content || !date || !username || isDelete === undefined || !replies;
  }

  _isPayloadNotMeetDataTypeSpecification({
    id, content, date, username, isDelete, replies,
  }) {
    return typeof id !== 'string'
      || typeof content !== 'string'
      || typeof date !== 'string'
      || typeof username !== 'string'
      || typeof isDelete !== 'boolean'
      || !(replies instanceof Array);
  }
}

module.exports = DetailComment;
