const InvariantError = require('../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AddedComment = require('../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(comment) {
    const {
      content, threadId, owner, date,
    } = comment;
    const id = `comment-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
      values: [id, content, date, threadId, owner, false],
    };

    const result = await this._pool.query(query);

    return new AddedComment({ ...result.rows[0] });
  }

  // async verifyAvailableThread(threadId) {
  //   const query = {
  //     text: 'SELECT * FROM threads WHERE id = $1',
  //     values: [threadId],
  //   };

  //   const result = await this._pool.query(query);

  //   if (!result.rowCount) {
  //     throw new NotFoundError('thread tidak ditemukan');
  //   }

  //   return result.rows[0];
  // }

  // async getIdByUsername(username) {
  //   const query = {
  //     text: 'SELECT id FROM users WHERE username = $1',
  //     values: [username],
  //   };

  //   const result = await this._pool.query(query);

  //   if (!result.rowCount) {
  //     throw new InvariantError('user tidak ditemukan');
  //   }

  //   const { id } = result.rows[0];

  //   return id;
  // }
}

module.exports = CommentRepositoryPostgres;
