import { Resolver, Query, Mutation, Args, Subscription, ID } from '@nestjs/graphql';
import { Task, TaskStatus } from './task.entity';
import { TaskService } from './task.service';
import { CreateTaskInput } from './dto/create-task.input';
import { UpdateTaskInput } from './dto/update-task.input';
import { Inject } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';

const PUB_SUB = 'PUB_SUB';

@Resolver(() => Task)
export class TaskResolver {
  constructor(
    private readonly taskService: TaskService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  @Query(() => [Task], { name: 'tasks' })
  findAll() {
    return this.taskService.findAll();
  }

  @Query(() => Task, { name: 'task' })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.taskService.findOne(id);
  }

  @Query(() => [Task], { name: 'tasksByStatus' })
  findByStatus(@Args('status', { type: () => TaskStatus }) status: TaskStatus) {
    return this.taskService.findByStatus(status);
  }

  @Mutation(() => Task)
  async createTask(@Args('createTaskInput') createTaskInput: CreateTaskInput) {
    const task = await this.taskService.create(createTaskInput);
    this.pubSub.publish('taskCreated', { taskCreated: task });
    return task;
  }

  @Mutation(() => Task)
  async updateTask(@Args('updateTaskInput') updateTaskInput: UpdateTaskInput) {
    const task = await this.taskService.update(updateTaskInput.id, updateTaskInput);
    this.pubSub.publish('taskUpdated', { taskUpdated: task });
    return task;
  }

  @Mutation(() => Task)
  async removeTask(@Args('id', { type: () => ID }) id: string) {
    const task = await this.taskService.remove(id);
    this.pubSub.publish('taskDeleted', { taskDeleted: task });
    return task;
  }

  @Subscription(() => Task)
  taskCreated() {
    return this.pubSub.asyncIterator('taskCreated');
  }

  @Subscription(() => Task)
  taskUpdated() {
    return this.pubSub.asyncIterator('taskUpdated');
  }

  @Subscription(() => Task)
  taskDeleted() {
    return this.pubSub.asyncIterator('taskDeleted');
  }
}
