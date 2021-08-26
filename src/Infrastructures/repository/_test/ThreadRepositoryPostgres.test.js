const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

describe('ThreadRepositoryPostgres', () => {
  it('should be instance of ThreadRepository domain', () => {
    const threadRepositoryPostgres = new ThreadRepositoryPostgres({}, {}); // dummy dependency

    expect(threadRepositoryPostgres).toBeInstanceOf(ThreadRepository);
  });

  describe('behavior test', () => {
    afterEach(async () => {
      await ThreadsTableTestHelper.cleanTable();
      await UsersTableTestHelper.cleanTable();
    });

    afterAll(async () => {
      await pool.end();
    });

    describe('addThread function', () => {
      it('should persist new thread and return added thread correctly', async () => {
        // Arrange
        await UsersTableTestHelper.addUser({ id: 'user-123' });
        const newThread = new NewThread({
          title: 'sebuah thread',
          body: 'sebuah body thread',
          owner: 'user-123',
          date: '2021-08-26',
        });

        const fakeIdGenerator = () => '123'; // stub!
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

        // Action
        const addedThread = await threadRepositoryPostgres.addThread(newThread);

        // Assert
        const findThreads = await ThreadsTableTestHelper.findThreadsById('thread-123');
        expect(addedThread).toStrictEqual(new AddedThread({
          id: 'thread-123',
          title: 'sebuah thread',
          owner: 'user-123',
        }));
        expect(findThreads).toHaveLength(1);
      });
    });

    describe('verifyAvailableThread function', () => {
      it('should throw NotFoundError when id not available', async () => {
        // Arrange
        await UsersTableTestHelper.addUser({ id: 'user-123' });
        const newThread = new NewThread({
          title: 'sebuah thread',
          body: 'sebuah body thread',
          owner: 'user-123',
          date: '2021-08-26',
        });

        const fakeIdGenerator = () => '123'; // stub!
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

        // Action
        const addedThread = await threadRepositoryPostgres.addThread(newThread);

        // Assert
        const findThreads = await ThreadsTableTestHelper.findThreadsById('thread-123');
        expect(addedThread).toStrictEqual(new AddedThread({
          id: 'thread-123',
          title: 'sebuah thread',
          owner: 'user-123',
        }));
        expect(findThreads).toHaveLength(1);
      });

      it('should throw NotFoundError when not id available', async () => {
        // Arrange
        await UsersTableTestHelper.addUser({ id: 'user-123' });
        await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });

        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

        // Action & Assert
        await expect(threadRepositoryPostgres.verifyAvailableThread('thread-123')).resolves.not.toThrowError(NotFoundError);
      });

      it('should not throw NotFoundError when id available', async () => {
        // Arrange
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

        // Action & Assert
        await expect(threadRepositoryPostgres.verifyAvailableThread('thread-123')).rejects.toThrowError(NotFoundError);
      });
    });
  });
});
