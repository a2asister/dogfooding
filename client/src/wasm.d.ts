declare module '/wasm/*' {
  import type { PhysicsWasmModule } from './types';

  const init: () => Promise<PhysicsWasmModule>;
  export default init;
}
