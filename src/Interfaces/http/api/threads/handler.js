class ThreadsHandler {
  constructor({ addThreadUseCase }) {
    this._addThreadUseCase = addThreadUseCase;

    this.postThreadHandler = this.postThreadHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const { title, body } = request.payload;
    const { id: owner } = request.auth.credentials;
    const date = new Date().toISOString();
    const newThread = {
      title, body, owner, date,
    };

    const addedThread = await this._addThreadUseCase.execute(newThread);

    const response = h.response({
      status: 'success',
      data: {
        addedThread,
      },
    });
    response.code(201);
    return response;
  }
}

module.exports = ThreadsHandler;
