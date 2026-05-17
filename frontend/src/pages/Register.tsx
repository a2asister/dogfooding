import { createSignal, Show } from 'solid-js';
import { useNavigate, A } from '@solidjs/router';
import authStore from '../store/authStore';
import { cn } from '../utils/cn';

export default function Register() {
  const [username, setUsername] = createSignal('');
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [confirmPassword, setConfirmPassword] = createSignal('');
  const [error, setError] = createSignal('');
  const [loading, setLoading] = createSignal(false);

  const { register } = authStore;
  const navigate = useNavigate();

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError('');

    if (password() !== confirmPassword()) {
      setError('两次输入的密码不一致');
      return;
    }

    setLoading(true);

    try {
      await register(username(), email(), password());
      navigate('/');
    } catch (err: any) {
      setError(err.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <div class="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-slate-700/50">
          <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-white mb-2">可视化大屏系统</h1>
            <p class="text-slate-400">创建您的账户</p>
          </div>

          <form onSubmit={handleSubmit} class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">
                用户名
              </label>
              <input
                type="text"
                value={username()}
                onInput={(e) => setUsername(e.target.value)}
                class={cn(
                  'w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg',
                  'text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent',
                  'transition-all duration-200'
                )}
                placeholder="请输入用户名"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">
                邮箱
              </label>
              <input
                type="email"
                value={email()}
                onInput={(e) => setEmail(e.target.value)}
                class={cn(
                  'w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg',
                  'text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent',
                  'transition-all duration-200'
                )}
                placeholder="请输入邮箱"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">
                密码
              </label>
              <input
                type="password"
                value={password()}
                onInput={(e) => setPassword(e.target.value)}
                class={cn(
                  'w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg',
                  'text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent',
                  'transition-all duration-200'
                )}
                placeholder="至少8位，包含大小写字母、数字和特殊字符"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">
                确认密码
              </label>
              <input
                type="password"
                value={confirmPassword()}
                onInput={(e) => setConfirmPassword(e.target.value)}
                class={cn(
                  'w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg',
                  'text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent',
                  'transition-all duration-200'
                )}
                placeholder="请再次输入密码"
                required
              />
            </div>

            <Show when={error()}>
              <div class="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error()}
              </div>
            </Show>

            <button
              type="submit"
              disabled={loading()}
              class={cn(
                'w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg',
                'hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800',
                'transition-all duration-200 transform hover:scale-[1.02]',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
              )}
            >
              {loading() ? '注册中...' : '注册'}
            </button>
          </form>

          <div class="mt-6 text-center">
            <p class="text-slate-400">
              已有账户？{' '}
              <A href="/login" class="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                立即登录
              </A>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
