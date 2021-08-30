class DetailReply {
  constructor(payload) {
    DetailReply.DELETED_CONTENT_REPLY = '**balasan telah dihapus**';

    this._verifyPayload(payload);

    const {
      id, content, date, username, isDelete,
    } = payload;

    this.id = id;
    this.content = (isDelete) ? DetailReply.DELETED_CONTENT_REPLY : content;
    this.date = date;
    this.username = username;
  }

  // static get DELETED_CONTENT_REPLY() { return '**balasan telah dihapus**'; }

  _verifyPayload(payload) {
    if (this._isPayloadNotContainNeededProperty(payload)) {
      throw new Error('DETAIL_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (this._isPayloadNotMeetDataTypeSpecification(payload)) {
      throw new Error('DETAIL_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }

  _isPayloadNotContainNeededProperty({
    id, content, date, username, isDelete,
  }) {
    return !id || !content || !date || !username || isDelete === undefined;
  }

  _isPayloadNotMeetDataTypeSpecification({
    id, content, date, username, isDelete,
  }) {
    return typeof id !== 'string'
      || typeof content !== 'string'
      || typeof date !== 'string'
      || typeof username !== 'string'
      || typeof isDelete !== 'boolean';
  }
}

module.exports = DetailReply;
