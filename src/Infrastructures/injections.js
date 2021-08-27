/* istanbul ignore file */

// external agency
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const Jwt = require('@hapi/jwt');
const pool = require('./database/postgres/pool');

// service (repository, helper, manager, etc)
const UserRepositoryPostgres = require('./repository/UserRepositoryPostgres');
const AuthenticationRepositoryPostgres = require('./repository/AuthenticationRepositoryPostgres');
const ThreadRepositoryPostgres = require('./repository/ThreadRepositoryPostgres');
const CommentRepositoryPostgres = require('./repository/CommentRepositoryPostgres');
const ReplyRepositoryPostgres = require('./repository/ReplyRepositoryPostgres');
const BcryptEncryptionHelper = require('./security/BcryptEncryptionHelper');
const JwtTokenManager = require('./security/JwtTokenManager');

// use case
// -- User
const AddUserUseCase = require('../Applications/use_case/users/AddUserUseCase');
const LoginUserUseCase = require('../Applications/use_case/authentications/LoginUserUseCase');
const RefreshAuthenticationUseCase = require('../Applications/use_case/authentications/RefreshAuthenticationUseCase');
const LogoutUserUseCase = require('../Applications/use_case/authentications/LogoutUserUseCase');
// -- Thread
const AddThreadUseCase = require('../Applications/use_case/threads/AddThreadUseCase');
const GetThreadUseCase = require('../Applications/use_case/threads/GetThreadUseCase');
// -- Comment
const AddCommentUseCase = require('../Applications/use_case/comments/AddCommentUseCase');
const DeleteCommentUseCase = require('../Applications/use_case/comments/DeleteCommentUseCase');
// -- Reply
const AddReplyUseCase = require('../Applications/use_case/replies/AddReplyUseCase');
const DeleteReplyUseCase = require('../Applications/use_case/replies/DeleteReplyUseCase');

const serviceInstanceContainer = {
  encryptionHelper: new BcryptEncryptionHelper(bcrypt),
  authenticationTokenManager: new JwtTokenManager(Jwt.token),
  userRepository: new UserRepositoryPostgres(pool, nanoid),
  authenticationRepository: new AuthenticationRepositoryPostgres(pool),
  threadRepository: new ThreadRepositoryPostgres(pool, nanoid),
  commentRepository: new CommentRepositoryPostgres(pool, nanoid),
  replyRepository: new ReplyRepositoryPostgres(pool, nanoid),
};

const useCaseInstanceContainer = {
  // User
  addUserUseCase: new AddUserUseCase({
    userRepository: serviceInstanceContainer.userRepository,
    encryptionHelper: serviceInstanceContainer.encryptionHelper,
  }),
  // Auth
  loginUserUseCase: new LoginUserUseCase({
    authenticationRepository: serviceInstanceContainer.authenticationRepository,
    authenticationTokenManager: serviceInstanceContainer.authenticationTokenManager,
    userRepository: serviceInstanceContainer.userRepository,
    encryptionHelper: serviceInstanceContainer.encryptionHelper,
  }),
  refreshAuthenticationUseCase: new RefreshAuthenticationUseCase({
    authenticationRepository: serviceInstanceContainer.authenticationRepository,
    authenticationTokenManager: serviceInstanceContainer.authenticationTokenManager,
  }),
  logoutUserUseCase: new LogoutUserUseCase({
    authenticationRepository: serviceInstanceContainer.authenticationRepository,
  }),
  // Thread
  addThreadUseCase: new AddThreadUseCase({
    threadRepository: serviceInstanceContainer.threadRepository,
  }),
  getThreadUseCase: new GetThreadUseCase({
    threadRepository: serviceInstanceContainer.threadRepository,
    commentRepository: serviceInstanceContainer.commentRepository,
    replyRepository: serviceInstanceContainer.replyRepository,
  }),
  // Comment
  addCommentUseCase: new AddCommentUseCase({
    commentRepository: serviceInstanceContainer.commentRepository,
    threadRepository: serviceInstanceContainer.threadRepository,
  }),
  deleteCommentUseCase: new DeleteCommentUseCase({
    commentRepository: serviceInstanceContainer.commentRepository,
  }),
  // Reply
  addReplyUseCase: new AddReplyUseCase({
    replyRepository: serviceInstanceContainer.replyRepository,
    commentRepository: serviceInstanceContainer.commentRepository,
  }),
  deleteReplyUseCase: new DeleteReplyUseCase({
    replyRepository: serviceInstanceContainer.replyRepository,
  }),
};

// export all instance
module.exports = {
  ...serviceInstanceContainer,
  ...useCaseInstanceContainer,
};
