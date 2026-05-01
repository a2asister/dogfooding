import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import HelloWorld from './HelloWorld.vue';

describe('HelloWorld Component', () => {
  it('renders properly with props', () => {
    const wrapper = mount(HelloWorld, {
      props: { msg: '测试消息' }
    });
    
    expect(wrapper.text()).toContain('测试消息');
  });

  it('has correct element structure', () => {
    const wrapper = mount(HelloWorld, {
      props: { msg: 'Hello' }
    });
    
    expect(wrapper.find('div.hello').exists()).toBe(true);
    expect(wrapper.find('h1').exists()).toBe(true);
  });

  it('renders different messages', () => {
    const messages = ['欢迎使用', '门店数字化运营', '测试成功'];
    
    messages.forEach(msg => {
      const wrapper = mount(HelloWorld, { props: { msg } });
      expect(wrapper.text()).toContain(msg);
    });
  });
});
