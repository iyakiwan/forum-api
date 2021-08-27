/* istanbul ignore file */
const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const injections = require('../../injections');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments/{commentId} endpoint', () => {
  let tokenAuth;
  let threadId;
  let commentId;
  let replyId;

  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
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

    const responseReply = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments/${commentId}/replies`,
      payload: { content: 'sebuah Reply' },
      headers: { Authorization: `Bearer ${tokenAuth}` },
    });

    const responseJsonReply = JSON.parse(responseReply.payload);
    replyId = responseJsonReply.data.addedReply.id;
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 201 and persisted replies', async () => {
      // Arrange
      const requestPayload = {
        content: 'sebuah reply',
      };
      // eslint-disable-next-line no-undef
      const server = await createServer(injections);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${tokenAuth}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {};
      const server = await createServer(injections);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${tokenAuth}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat reply baru karena properti yang dibutuhkan tidak ada');
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
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${tokenAuth}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat reply baru karena tipe data tidak sesuai');
    });

    it('should response 400 when comment already deleted', async () => {
      const server = await createServer(injections);
      await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: { Authorization: `Bearer ${tokenAuth}` },
      });

      const requestPayload = {
        content: 'sebuah reply',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${tokenAuth}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.message).toEqual('Comment telah dihapus');
    });

    it('should response 401 when request without Authorization', async () => {
      const requestPayload = {
        content: 'sebuah reply',
      };
      const server = await createServer(injections);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 when threadId or commentId not found', async () => {
      const requestPayload = {
        content: 'sebuah reply',
      };
      const server = await createServer(injections);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/xxx/comments/xxx/replies',
        payload: requestPayload,
        headers: { Authorization: `Bearer ${tokenAuth}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Comment tidak ditemukan');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 200 and deleted comments', async () => {
      const server = await createServer(injections);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: { Authorization: `Bearer ${tokenAuth}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 400 when reply already deleted', async () => {
      const server = await createServer(injections);
      await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: { Authorization: `Bearer ${tokenAuth}` },
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: { Authorization: `Bearer ${tokenAuth}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.message).toEqual('reply telah dihapus');
    });

    it('should response 401 when request without Authorization', async () => {
      const server = await createServer(injections);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
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
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: { Authorization: `Bearer ${newtokenAuth}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Anda tidak memiliki akses untuk menghapus reply ini');
    });

    it('should response 404 when threadId and commentId not found', async () => {
      const server = await createServer(injections);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/xxx/comments/xxx/replies/xxx',
        headers: { Authorization: `Bearer ${tokenAuth}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('reply tidak ditemukan');
    });
  });
});
