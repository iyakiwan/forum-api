const InvariantError = require('../../Commons/exceptions/InvariantError');
const AddedThread = require('../../Domains/threads/entities/AddedThread');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(thread) {
    const {
      title, body, owner, date,
    } = thread;
    const id = `thread-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5) RETURNING id, title, owner',
      values: [id, title, body, date, owner],
    };

    const result = await this._pool.query(query);

    return new AddedThread({ ...result.rows[0] });
  }

  // async getPasswordByUsername(username) {
  //   const query = {
  //     text: 'SELECT password FROM users WHERE username = $1',
  //     values: [username],
  //   };

  //   const result = await this._pool.query(query);

  //   if (!result.rowCount) {
  //     throw new InvariantError('username tidak ditemukan');
  //   }

  //   return result.rows[0].password;
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

module.exports = ThreadRepositoryPostgres;
