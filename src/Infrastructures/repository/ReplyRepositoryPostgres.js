const InvariantError = require('../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const AddedReply = require('../../Domains/replies/entities/AddedReply');
const DetailReply = require('../../Domains/replies/entities/DetailReply');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(reply) {
    const {
      content, commentId, owner, date,
    } = reply;
    const id = `reply-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
      values: [id, content, date, commentId, owner, false],
    };

    const result = await this._pool.query(query);

    return new AddedReply({ ...result.rows[0] });
  }

  async verifyAvailableReply(reply) {
    const { replyId, commentId, owner } = reply;
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1 AND comment_id = $2',
      values: [replyId, commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('reply tidak ditemukan');
    }

    if (result.rows[0].owner !== owner) {
      throw new AuthorizationError('Anda tidak memiliki akses untuk menghapus reply ini');
    }

    if (result.rows[0].is_delete === true) {
      throw new InvariantError('reply telah dihapus');
    }
  }

  async deleteReply(replyId) {
    const query = {
      text: 'UPDATE replies SET is_delete = true WHERE id = $1',
      values: [replyId],
    };

    await this._pool.query(query);
  }

  async getReplyByCommentId(commentId) {
    const query = {
      text: `SELECT replies.id , users.username, replies.date, replies.content, replies.is_delete AS "isDelete"
      FROM replies 
      INNER JOIN users ON replies.owner = users.id 
      WHERE replies.comment_id = $1`,
      values: [commentId],
    };

    const result = await this._pool.query(query);
    const replies = result.rows.map((reply) => new DetailReply(reply));

    return replies;
  }
}

module.exports = ReplyRepositoryPostgres;
