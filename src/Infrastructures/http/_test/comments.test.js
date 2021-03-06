/* istanbul ignore file */
const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const injections = require('../../injections');
const createServer = require('../createServer');

describe('/threads/{threadId} endpoint', () => {
  let tokenAuth;
  let threadId;
  let commentId;

  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  beforeEach(async () => {
    const server = await createServer(injections);

    // add user
    await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      },
    });

    // login user
    const responseAuth = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username: 'dicoding',
        password: 'secret',
      },
    });

    const responseJsonAuth = JSON.parse(responseAuth.payload);
    tokenAuth = responseJsonAuth.data.accessToken;

    const responseThread = await server.inject({
      method: 'POST',
      url: '/threads',
      payload: {
        title: 'sebuah thread',
        body: 'sebuah body thread',
      },
      headers: { Authorization: `Bearer ${tokenAuth}` },
    });

    const responseJsonThread = JSON.parse(responseThread.payload);
    threadId = responseJsonThread.data.addedThread.id;

    const responseComment = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments`,
      payload: { content: 'sebuah comment' },
      headers: { Authorization: `Bearer ${tokenAuth}` },
    });

    const responseJsonComment = JSON.parse(responseComment.payload);
    commentId = responseJsonComment.data.addedComment.id;
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and persisted comments', async () => {
      // Arrange
      const requestPayload = {
        content: 'sebuah comment',
      };
      // eslint-disable-next-line no-undef
      const server = await createServer(injections);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${tokenAuth}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {};
      const server = await createServer(injections);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${tokenAuth}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        content: {},
      };
      const server = await createServer(injections);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${tokenAuth}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena tipe data tidak sesuai');
    });

    it('should response 401 when request without Authorization', async () => {
      const requestPayload = {
        content: 'sebuah comment',
      };
      const server = await createServer(injections);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 when threadId not found', async () => {
      const requestPayload = {
        content: 'sebuah comment',
      };
      const server = await createServer(injections);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/xxx/comments',
        payload: requestPayload,
        headers: { Authorization: `Bearer ${tokenAuth}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 200 and deleted comments', async () => {
      const server = await createServer(injections);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: { Authorization: `Bearer ${tokenAuth}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 400 when comment already deleted', async () => {
      const server = await createServer(injections);
      await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: { Authorization: `Bearer ${tokenAuth}` },
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: { Authorization: `Bearer ${tokenAuth}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.message).toEqual('Comment telah dihapus');
    });

    it('should response 401 when request without Authorization', async () => {
      const server = await createServer(injections);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 403 when owner is not Authorization', async () => {
      const server = await createServer(injections);
      // create other user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'muftialies',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      // login user
      const responseAuth = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'muftialies',
          password: 'secret',
        },
      });

      const responseJsonAuthNew = JSON.parse(responseAuth.payload);
      const newtokenAuth = responseJsonAuthNew.data.accessToken;

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: { Authorization: `Bearer ${newtokenAuth}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Anda tidak memiliki akses untuk menghapus comment ini');
    });

    it('should response 404 when threadId and commentId not found', async () => {
      const server = await createServer(injections);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/xxx/comments/xxx',
        headers: { Authorization: `Bearer ${tokenAuth}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Comment tidak ditemukan');
    });
  });

  describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    it('should response 200 and comments is likes', async () => {
      const server = await createServer(injections);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: { Authorization: `Bearer ${tokenAuth}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 400 when comment already deleted', async () => {
      const server = await createServer(injections);
      await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: { Authorization: `Bearer ${tokenAuth}` },
      });

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: { Authorization: `Bearer ${tokenAuth}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.message).toEqual('Comment telah dihapus');
    });

    it('should response 401 when request without Authorization', async () => {
      const server = await createServer(injections);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 when threadId and commentId not found', async () => {
      const server = await createServer(injections);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: '/threads/xxx/comments/xxx/likes',
        headers: { Authorization: `Bearer ${tokenAuth}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Comment tidak ditemukan');
    });
  });
});
