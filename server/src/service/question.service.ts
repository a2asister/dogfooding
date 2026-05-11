import { Provide, Scope, ScopeEnum, Init } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../entity/question.entity';

@Provide()
@Scope(ScopeEnum.Singleton)
export class QuestionService {
  @InjectEntityModel(Question)
  questionModel: Repository<Question>;

  @Init()
  async init() {
    const count = await this.questionModel.count();
    if (count === 0) {
      await this.seedQuestions();
    }
  }

  async seedQuestions() {
    const defaultQuestions: Partial<Question>[] = [
      {
        question: 'JavaScript 中，以下哪个方法用于数组遍历并返回新数组？',
        options: ['forEach', 'map', 'filter', 'reduce'],
        answer: 1,
        explanation: 'map() 方法创建一个新数组，其结果是该数组中的每个元素是调用一次提供的函数后的返回值。'
      },
      {
        question: 'CSS 中，flex 容器的主轴方向由哪个属性控制？',
        options: ['flex-wrap', 'flex-direction', 'justify-content', 'align-items'],
        answer: 1,
        explanation: 'flex-direction 属性指定了弹性子元素在父容器中的位置和方向。'
      },
      {
        question: 'Vue 3 中，以下哪个是响应式 API？',
        options: ['ref', 'computed', 'watch', '以上都是'],
        answer: 3,
        explanation: 'ref、computed、watch 都是 Vue 3 中的响应式 API。'
      },
      {
        question: 'TypeScript 中，interface 和 type 的主要区别是？',
        options: ['没有区别', 'interface 可以被扩展，type 不行', 'interface 可以声明合并，type 不行', 'type 更灵活'],
        answer: 2,
        explanation: 'interface 可以被多次声明，并且会自动合并；而 type 只能声明一次。'
      },
      {
        question: 'HTTP 状态码 304 表示什么？',
        options: ['请求成功', '重定向', '未修改', '服务器错误'],
        answer: 2,
        explanation: '304 Not Modified 表示资源未被修改，可以使用缓存的版本。'
      },
      {
        question: 'Node.js 是基于什么引擎构建的？',
        options: ['SpiderMonkey', 'V8', 'JavaScriptCore', 'Chakra'],
        answer: 1,
        explanation: 'Node.js 是基于 Google 的 V8 引擎构建的 JavaScript 运行时环境。'
      },
      {
        question: 'Git 中，查看提交历史的命令是？',
        options: ['git status', 'git log', 'git diff', 'git show'],
        answer: 1,
        explanation: 'git log 命令用于查看提交历史记录。'
      },
      {
        question: '以下哪个不是 JavaScript 的基本数据类型？',
        options: ['String', 'Number', 'Array', 'Boolean'],
        answer: 2,
        explanation: 'Array 是引用类型，不是基本数据类型。JavaScript 的基本数据类型包括：String、Number、Boolean、Null、Undefined、Symbol、BigInt。'
      }
    ];

    await this.questionModel.save(defaultQuestions);
  }

  async getAllQuestions(): Promise<Question[]> {
    return this.questionModel.find();
  }

  async getQuestionById(id: number): Promise<Question | null> {
    return this.questionModel.findOne({ where: { id } });
  }
}
