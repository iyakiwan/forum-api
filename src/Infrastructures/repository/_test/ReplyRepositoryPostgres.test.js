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
        await CommentsTableTestHelper.findCommentsById('comment-123');
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

    // describe('verifyAvailableComment function', () => {
    //   const commentParam = {
    //     commentId: 'comment-123', threadId: 'thread-123', owner: 'user-123',
    //   };
    //   it('should throw NotFoundError when not commentid and threadId available', async () => {
    //     // Arrange
    //     const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

    //     // Action & Assert
    //     await expect(commentRepositoryPostgres.verifyAvailableComment(commentParam))
    //       .rejects.toThrowError(NotFoundError);
    //   });

    //   it('should throw AuthorizationError when owner is not Authorization', async () => {
    //     // Arrange
    //     await UsersTableTestHelper.addUser({ id: 'user-123' });
    //     await UsersTableTestHelper.addUser({ id: 'user-124', username: 'dicoding-1' });
    //     await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
    //     await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-124' });

    //     const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

    //     // Action & Assert
    //     await expect(commentRepositoryPostgres.verifyAvailableComment(commentParam))
    //       .rejects.toThrowError(AuthorizationError);
    //   });

    //   it('should throw InvariantError when comment is deleted', async () => {
    //     // Arrange
    //     await UsersTableTestHelper.addUser({ id: 'user-123' });
    //     await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
    //     await CommentsTableTestHelper.addComment({ id: 'comment-123', isDelete: true });

    //     const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

    //     // Action & Assert
    //     await expect(commentRepositoryPostgres.verifyAvailableComment(commentParam))
    //       .rejects.toThrowError(InvariantError);
    //   });

    //   it('should not throw NotFoundError when id available', async () => {
    //     // Arrange
    //     await UsersTableTestHelper.addUser({ id: 'user-123' });
    //     await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
    //     await CommentsTableTestHelper.addComment({ id: 'comment-123' });

    //     const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

    //     // Action & Assert
    //     await expect(commentRepositoryPostgres.verifyAvailableComment(commentParam))
    //       .resolves.not.toThrowError(InvariantError);
    //   });
    // });

    // describe('deleteComment function', () => {
    //   it('should persist Delete Comment when commentId correctly', async () => {
    //     const commentParam = {
    //       commentId: 'comment-123', threadId: 'thread-123', owner: 'user-123',
    //     };

    //     // Arrange
    //     await UsersTableTestHelper.addUser({ id: 'user-123' });
    //     await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
    //     await CommentsTableTestHelper.addComment({ id: 'comment-123' });

    //     const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

    //     // Action
    //     await commentRepositoryPostgres.verifyAvailableComment(commentParam);
    //     await commentRepositoryPostgres.deleteComment(commentParam.commentId);

    //     // Assert
    //     const findComments = await CommentsTableTestHelper.findCommentsById
    // (commentParam.commentId);

    //     expect(findComments).toHaveLength(1);
    //     expect(findComments[0]).toHaveProperty('is_delete');
    //     expect(findComments[0].is_delete).toEqual(true);
    //   });
    // });

    // describe('verifyComment function', () => {
    //   const commentParam = {
    //     commentId: 'comment-123', threadId: 'thread-123',
    //   };
    //   it('should throw NotFoundError when not commentid and threadId available', async () => {
    //     // Arrange
    //     const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

    //     // Action & Assert
    //     await expect(commentRepositoryPostgres.verifyComment(commentParam))
    //       .rejects.toThrowError(NotFoundError);
    //   });

    //   it('should throw InvariantError when comment is deleted', async () => {
    //     // Arrange
    //     await UsersTableTestHelper.addUser({ id: 'user-123' });
    //     await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
    //     await CommentsTableTestHelper.addComment({ id: 'comment-123', isDelete: true });

    //     const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

    //     // Action & Assert
    //     await expect(commentRepositoryPostgres.verifyComment(commentParam))
    //       .rejects.toThrowError(InvariantError);
    //   });

    //   it('should not throw NotFoundError when id available', async () => {
    //     // Arrange
    //     await UsersTableTestHelper.addUser({ id: 'user-123' });
    //     await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
    //     await CommentsTableTestHelper.addComment({ id: 'comment-123' });

    //     const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

    //     // Action & Assert
    //     await expect(commentRepositoryPostgres.verifyComment(commentParam))
    //       .resolves.not.toThrowError(InvariantError);
    //   });
    // });
  });
});
