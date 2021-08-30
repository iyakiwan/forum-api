const InvariantError = require('../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const AddedComment = require('../../Domains/comments/entities/AddedComment');
const DetailComment = require('../../Domains/comments/entities/DetailComment');
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

  async verifyAvailableComment(comment) {
    const { commentId, threadId, owner } = comment;
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1 AND thread_id = $2',
      values: [commentId, threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Comment tidak ditemukan');
    }

    if (result.rows[0].owner !== owner) {
      throw new AuthorizationError('Anda tidak memiliki akses untuk menghapus comment ini');
    }

    if (result.rows[0].is_delete === true) {
      throw new InvariantError('Comment telah dihapus');
    }
  }

  async deleteComment(commentId) {
    const query = {
      text: 'UPDATE comments SET is_delete = true WHERE id = $1',
      values: [commentId],
    };

    await this._pool.query(query);
  }

  async verifyComment(comment) {
    const { commentId, threadId } = comment;
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1 AND thread_id = $2',
      values: [commentId, threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Comment tidak ditemukan');
    }

    if (result.rows[0].is_delete === true) {
      throw new InvariantError('Comment telah dihapus');
    }
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: `SELECT comments.id, users.username, comments.date, comments.content, comments.is_delete AS "isDelete"
      FROM comments 
      INNER JOIN users ON comments.owner = users.id 
      WHERE comments.thread_id = $1
      ORDER BY comments.date`,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return result.rows.map((comment) => new DetailComment({ ...comment, replies: [] }));
  }

  async verifyLikeInComment(comment) {
    const { commentId, userId } = comment;
    const query = {
      text: 'SELECT * FROM likes WHERE comment_id = $1 AND user_id = $2',
      values: [commentId, userId],
    };

    const result = await this._pool.query(query);

    if (result.rowCount) {
      return true;
    }

    return false;
  }

  async addLikeInComment(comment) {
    const { commentId, userId } = comment;
    const id = `like-${this._idGenerator()}`;
    const query = {
      text: 'INSERT INTO likes VALUES($1, $2, $3)',
      values: [id, commentId, userId],
    };

    await this._pool.query(query);
  }

  async deleteLikeInComment(comment) {
    const { commentId, userId } = comment;
    const query = {
      text: 'DELETE FROM likes WHERE comment_id = $1 AND user_id = $2',
      values: [commentId, userId],
    };

    await this._pool.query(query);
  }

  async getCountLikesbyCommentId(commentId) {
    const query = {
      text: 'SELECT * FROM likes WHERE comment_id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    return result.rowCount;
  }
}

module.exports = CommentRepositoryPostgres;
