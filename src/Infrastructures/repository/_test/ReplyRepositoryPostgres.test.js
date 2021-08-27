const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const NewReply = require('../../../Domains/replies/entities/NewReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');

describe('ReplyRepositoryPostgres', () => {
  it('should be instance of CommentRepository domain', () => {
    const replyRepositoryPostgres = new ReplyRepositoryPostgres({}, {}); // dummy dependency

    expect(replyRepositoryPostgres).toBeInstanceOf(ReplyRepository);
  });

  describe('behavior test', () => {
    afterEach(async () => {
      await RepliesTableTestHelper.cleanTable();
      await CommentsTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
      await UsersTableTestHelper.cleanTable();
    });

    afterAll(async () => {
      await pool.end();
    });

    describe('addReply function', () => {
      it('should persist new reply and return added reply correctly', async () => {
        // Arrange
        await UsersTableTestHelper.addUser({ id: 'user-123' });
        await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
        await CommentsTableTestHelper.addComment({ id: 'comment-123' });
        const newReply = new NewReply({
          content: 'sebuah reply',
          threadId: 'thread-123',
          commentId: 'comment-123',
          owner: 'user-123',
          date: '2021-08-26',
        });

        const fakeIdGenerator = () => '123'; // stub!
        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

        // Action
        const addedReply = await replyRepositoryPostgres.addReply(newReply);

        // Assert
        const findReplies = await RepliesTableTestHelper.findRepliesById('reply-123');
        expect(addedReply).toStrictEqual(new AddedReply({
          id: 'reply-123',
          content: 'sebuah reply',
          owner: 'user-123',
        }));
        expect(findReplies).toHaveLength(1);
      });
    });

    describe('verifyAvailableReply function', () => {
      const replyParam = {
        replyId: 'reply-123', commentId: 'comment-123', threadId: 'thread-123', owner: 'user-123',
      };
      it('should throw NotFoundError when replyId, commentid, and threadId is not available', async () => {
        // Arrange
        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

        // Action & Assert
        await expect(replyRepositoryPostgres.verifyAvailableReply(replyParam))
          .rejects.toThrowError(NotFoundError);
      });

      it('should throw AuthorizationError when owner is not Authorization', async () => {
        // Arrange
        await UsersTableTestHelper.addUser({ id: 'user-123' });
        await UsersTableTestHelper.addUser({ id: 'user-124', username: 'dicoding-1' });
        await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
        await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123' });
        await RepliesTableTestHelper.addReply({ id: 'reply-123', owner: 'user-124' });

        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

        // Action & Assert
        await expect(replyRepositoryPostgres.verifyAvailableReply(replyParam))
          .rejects.toThrowError(AuthorizationError);
      });

      it('should throw InvariantError when comment is deleted', async () => {
        // Arrange
        await UsersTableTestHelper.addUser({ id: 'user-123' });
        await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
        await CommentsTableTestHelper.addComment({ id: 'comment-123' });
        await RepliesTableTestHelper.addReply({ id: 'reply-123', isDelete: true });

        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

        // Action & Assert
        await expect(replyRepositoryPostgres.verifyAvailableReply(replyParam))
          .rejects.toThrowError(InvariantError);
      });

      it('should not throw InvariantError when id available', async () => {
        // Arrange
        await UsersTableTestHelper.addUser({ id: 'user-123' });
        await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
        await CommentsTableTestHelper.addComment({ id: 'comment-123' });
        await RepliesTableTestHelper.addReply({ id: 'reply-123' });

        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

        // Action & Assert
        await expect(replyRepositoryPostgres.verifyAvailableReply(replyParam))
          .resolves.not.toThrowError(InvariantError);
      });
    });

    describe('deleteReply function', () => {
      it('should persist Delete Reply when commentId correctly', async () => {
        const replyParam = {
          replyId: 'reply-123', commentId: 'comment-123', threadId: 'thread-123', owner: 'user-123',
        };

        // Arrange
        await UsersTableTestHelper.addUser({ id: 'user-123' });
        await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
        await CommentsTableTestHelper.addComment({ id: 'comment-123' });
        await RepliesTableTestHelper.addReply({ id: 'reply-123' });

        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

        // Action
        await replyRepositoryPostgres.verifyAvailableReply(replyParam);
        await replyRepositoryPostgres.deleteReply(replyParam.replyId);

        // Assert
        const findReplies = await RepliesTableTestHelper.findRepliesById(replyParam.replyId);

        expect(findReplies).toHaveLength(1);
        expect(findReplies[0]).toHaveProperty('is_delete');
        expect(findReplies[0].is_delete).toEqual(true);
      });
    });

    describe('getReplyByCommentId function', () => {
      it('should persist get Reply when commentId correctly', async () => {
        const replyParam = {
          replyId: 'reply-123', commentId: 'comment-123', threadId: 'thread-123', owner: 'user-123',
        };

        // Arrange
        await UsersTableTestHelper.addUser({ id: 'user-123' });
        await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
        await CommentsTableTestHelper.addComment({ id: 'comment-123' });
        await RepliesTableTestHelper.addReply({ id: 'reply-123', isDelete: true });
        await RepliesTableTestHelper.addReply({ id: 'reply-124' });

        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

        // Action

        const replies = await replyRepositoryPostgres.getReplyByCommentId('comment-123');

        // Assert
        expect(replies[0]).toHaveProperty('id');
        expect(replies[0]).toHaveProperty('content');
        expect(replies[0]).toHaveProperty('date');
        expect(replies[0]).toHaveProperty('username');
      });
    });
  });
});
