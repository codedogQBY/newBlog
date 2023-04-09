import { Controller } from 'egg';
import { Configuration, OpenAIApi } from 'openai';

export default class CommonController extends Controller {
  // chatGPT回复接口
  public async getAnswer() {
    const ctx = this.ctx;
    try {
      const { prompt } = ctx.request.body;
      const apiKey = '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';
      const configuration = new Configuration({
        apiKey,
      });
      const openai = new OpenAIApi(configuration);
      const res = await openai.createChatCompletion(
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        },
        {
          timeout: 100000,
        },
      );
      const content = res.data.choices[0].message;
      ctx.helper.response.handleSuccess({ ctx, data: { content }, msg: '获取chatGPT回复成功' });
    } catch (e) {
      console.error(e);
      ctx.helper.response.handleError({ ctx, msg: '获取chatGPT回复失败' });
    }
  }
}
