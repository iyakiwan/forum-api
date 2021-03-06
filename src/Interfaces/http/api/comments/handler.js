class CommentsHandler {
  constructor({ addCommentUseCase, deleteCommentUseCase, updateLikeCommentUseCase }) {
    this._addCommentUseCase = addCommentUseCase;
    this._deleteCommentUseCase = deleteCommentUseCase;
    this._updateLikeCommentUseCase = updateLikeCommentUseCase;

    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
    this.putLikeCommentHandler = this.putLikeCommentHandler.bind(this);
  }

  async postCommentHandler(request, h) {
    const { content } = request.payload;
    const { id: owner } = request.auth.credentials;
    const { threadId } = request.params;
    const date = new Date().toISOString();

    const newComment = {
      content, threadId, owner, date,
    };

    const addedComment = await this._addCommentUseCase.execute(newComment);

    const response = h.response({
      status: 'success',
      data: {
        addedComment,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCommentHandler(request, h) {
    const { id: owner } = request.auth.credentials;
    const { threadId, commentId } = request.params;

    const deleteComment = {
      commentId, threadId, owner,
    };

    await this._deleteCommentUseCase.execute(deleteComment);

    const response = h.response({
      status: 'success',
    });

    response.code(200);
    return response;
  }

  async putLikeCommentHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { threadId, commentId } = request.params;

    const updateLikeComment = {
      commentId, threadId, userId,
    };

    await this._updateLikeCommentUseCase.execute(updateLikeComment);

    const response = h.response({
      status: 'success',
    });

    response.code(200);
    return response;
  }
}

module.exports = CommentsHandler;
