const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('CommentRepositoryPostgres', () => {
  it('should be instance of CommentRepository domain', () => {
    const commentRepositoryPostgres = new CommentRepositoryPostgres({}, {}); // dummy dependency

    expect(commentRepositoryPostgres).toBeInstanceOf(CommentRepository);
  });

  describe('behavior test', () => {
    afterEach(async () => {
      await LikesTableTestHelper.cleanTable();
      await CommentsTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
      await UsersTableTestHelper.cleanTable();
    });

    afterAll(async () => {
      await pool.end();
    });

    describe('addComment function', () => {
      it('should persist new comment and return added comment correctly', async () => {
        // Arrange
        await UsersTableTestHelper.addUser({ id: 'user-123' });
        await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
        const newComment = new NewComment({
          content: 'sebuah comment',
          threadId: 'thread-123',
          owner: 'user-123',
          date: '2021-08-26',
        });

        const fakeIdGenerator = () => '123'; // stub!
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

        // Action
        const addedComment = await commentRepositoryPostgres.addComment(newComment);

        // Assert
        const findComments = await CommentsTableTestHelper.findCommentsById('comment-123');
        expect(addedComment).toStrictEqual(new AddedComment({
          id: 'comment-123',
          content: 'sebuah comment',
          owner: 'user-123',
        }));
        expect(findComments).toHaveLength(1);
      });
    });

    describe('verifyAvailableComment function', () => {
      const commentParam = {
        commentId: 'comment-123', threadId: 'thread-123', owner: 'user-123',
      };
      it('should throw NotFoundError when not commentid and threadId available', async () => {
        // Arrange
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

        // Action & Assert
        await expect(commentRepositoryPostgres.verifyAvailableComment(commentParam))
          .rejects.toThrowError(NotFoundError);
      });

      it('should throw AuthorizationError when owner is not Authorization', async () => {
        // Arrange
        await UsersTableTestHelper.addUser({ id: 'user-123' });
        await UsersTableTestHelper.addUser({ id: 'user-124', username: 'dicoding-1' });
        await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
        await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-124' });

        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

        // Action & Assert
        await expect(commentRepositoryPostgres.verifyAvailableComment(commentParam))
          .rejects.toThrowError(AuthorizationError);
      });

      it('should throw InvariantError when comment is deleted', async () => {
        // Arrange
        await UsersTableTestHelper.addUser({ id: 'user-123' });
        await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
        await CommentsTableTestHelper.addComment({ id: 'comment-123', isDelete: true });

        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

        // Action & Assert
        await expect(commentRepositoryPostgres.verifyAvailableComment(commentParam))
          .rejects.toThrowError(InvariantError);
      });

      it('should not throw NotFoundError when id available', async () => {
        // Arrange
        await UsersTableTestHelper.addUser({ id: 'user-123' });
        await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
        await CommentsTableTestHelper.addComment({ id: 'comment-123' });

        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

        // Action & Assert
        await expect(commentRepositoryPostgres.verifyAvailableComment(commentParam))
          .resolves.not.toThrowError(InvariantError);
      });
    });

    describe('deleteComment function', () => {
      it('should persist Delete Comment when commentId correctly', async () => {
        const commentParam = {
          commentId: 'comment-123', threadId: 'thread-123', owner: 'user-123',
        };

        // Arrange
        await UsersTableTestHelper.addUser({ id: 'user-123' });
        await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
        await CommentsTableTestHelper.addComment({ id: 'comment-123' });

        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

        // Action
        await commentRepositoryPostgres.verifyAvailableComment(commentParam);
        await commentRepositoryPostgres.deleteComment(commentParam.commentId);

        // Assert
        const findComments = await CommentsTableTestHelper.findCommentsById(commentParam.commentId);

        expect(findComments).toHaveLength(1);
        expect(findComments[0]).toHaveProperty('is_delete');
        expect(findComments[0].is_delete).toEqual(true);
      });
    });

    describe('verifyComment function', () => {
      const commentParam = {
        commentId: 'comment-123', threadId: 'thread-123',
      };
      it('should throw NotFoundError when not commentid and threadId available', async () => {
        // Arrange
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

        // Action & Assert
        await expect(commentRepositoryPostgres.verifyComment(commentParam))
          .rejects.toThrowError(NotFoundError);
      });

      it('should throw InvariantError when comment is deleted', async () => {
        // Arrange
        await UsersTableTestHelper.addUser({ id: 'user-123' });
        await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
        await CommentsTableTestHelper.addComment({ id: 'comment-123', isDelete: true });

        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

        // Action & Assert
        await expect(commentRepositoryPostgres.verifyComment(commentParam))
          .rejects.toThrowError(InvariantError);
      });

      it('should not throw NotFoundError when id available', async () => {
        // Arrange
        await UsersTableTestHelper.addUser({ id: 'user-123' });
        await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
        await CommentsTableTestHelper.addComment({ id: 'comment-123' });

        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

        // Action & Assert
        await expect(commentRepositoryPostgres.verifyComment(commentParam))
          .resolves.not.toThrowError(InvariantError);
      });
    });

    describe('getCommentsByThreadId function', () => {
      it('should persist get Comment when threadId correctly', async () => {
        // Arrange
        await UsersTableTestHelper.addUser({ id: 'user-123' });
        await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
        await CommentsTableTestHelper.addComment({ id: 'comment-123', isDelete: true });
        await CommentsTableTestHelper.addComment({ id: 'comment-124' });

        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

        // Action
        const comments = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');

        // Assert
        expect(comments[0]).toHaveProperty('id');
        expect(comments[0]).toHaveProperty('content');
        expect(comments[0]).toHaveProperty('date');
        expect(comments[0]).toHaveProperty('username');
        expect(comments[0]).toHaveProperty('replies');
      });
    });

    describe('verifyLikeInComment function', () => {
      const commentParam = {
        commentId: 'comment-123', userId: 'user-123',
      };
      it('should false when commentId and userId is not Liked', async () => {
        // Arrange
        await UsersTableTestHelper.addUser({ id: 'user-123' });
        await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
        await CommentsTableTestHelper.addComment({ id: 'comment-123' });

        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

        // Action
        const verify = await commentRepositoryPostgres.verifyLikeInComment(commentParam);

        // Assert
        const likes = await LikesTableTestHelper.findCommentsByCommentidAndUserId(commentParam);
        expect(verify).toEqual(false);
        expect(likes).toHaveLength(0);
      });

      it('should true when commentId and userId is Liked', async () => {
        // Arrange
        await UsersTableTestHelper.addUser({ id: 'user-123' });
        await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
        await CommentsTableTestHelper.addComment({ id: 'comment-123' });
        await LikesTableTestHelper.addLikes({ id: 'like-123' });

        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

        // Action
        const verify = await commentRepositoryPostgres.verifyLikeInComment(commentParam);

        // Assert
        const likes = await LikesTableTestHelper.findCommentsByCommentidAndUserId(commentParam);
        expect(verify).toEqual(true);
        expect(likes).toHaveLength(1);
      });
    });

    describe('addLikeInComment function', () => {
      it('should persist new like and return added thread correctly', async () => {
        const commentParam = {
          commentId: 'comment-123', userId: 'user-123',
        };
        // Arrange
        await UsersTableTestHelper.addUser({ id: 'user-123' });
        await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
        await CommentsTableTestHelper.addComment({ id: 'comment-123' });

        const fakeIdGenerator = () => '123'; // stub!
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

        // Action
        await commentRepositoryPostgres.addLikeInComment(commentParam);

        // Assert
        const likes = await LikesTableTestHelper.findCommentsByCommentidAndUserId(commentParam);
        expect(likes).toHaveLength(1);
        expect(likes[0]).toStrictEqual({
          id: 'like-123',
          comment_id: 'comment-123',
          user_id: 'user-123',
        });
      });
    });

    describe('deleteLikeInComment function', () => {
      it('should persist delete likes when commendId and userId is correctly', async () => {
        const commentParam = {
          commentId: 'comment-123', userId: 'user-123',
        };
        // Arrange
        await UsersTableTestHelper.addUser({ id: 'user-123' });
        await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
        await CommentsTableTestHelper.addComment({ id: 'comment-123' });
        await LikesTableTestHelper.addLikes({ id: 'like-123' });

        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

        // Action
        await commentRepositoryPostgres.deleteLikeInComment(commentParam);

        // Assert
        const likes = await LikesTableTestHelper.findCommentsByCommentidAndUserId(commentParam);
        expect(likes).toHaveLength(0);
      });
    });
  });
});
