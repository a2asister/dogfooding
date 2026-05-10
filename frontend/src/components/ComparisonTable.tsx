import { Component, For, createMemo } from 'solid-js';
import { Product } from '../types';

interface ComparisonTableProps {
  products: Product[];
}

const ComparisonTable: Component<ComparisonTableProps> = (props) => {
  const allProperties = createMemo(() => {
    const keys = new Set<string>();
    for (const product of props.products) {
      for (const key of Object.keys(product.properties)) {
        keys.add(key);
      }
    }
    return Array.from(keys);
  });

  const isDifferent = (propertyKey: string) => {
    if (props.products.length < 2) return false;
    const values = props.products.map(p => p.properties[propertyKey] ?? '');
    return !values.every(v => v === values[0]);
  };

  if (props.products.length < 2) {
    return (
      <div class="empty-state" style="padding: 60px 20px">
        <div class="empty-state-icon">📊</div>
        <div class="empty-state-text">
          <p>选择至少2个商品进行对比</p>
          <p style="margin-top: 8px; font-size: 0.9rem; color: #aaa">
            差异项将自动高亮显示
          </p>
        </div>
      </div>
    );
  }

  return (
    <div class="comparison-table-container">
      <table class="comparison-table">
        <thead>
          <tr>
            <th class="property-label">属性</th>
            <For each={props.products}>
              {(product) => (
                <th>{product.name}</th>
              )}
            </For>
          </tr>
        </thead>
        <tbody>
          <For each={allProperties()}>
            {(propKey, index) => {
              const hasDiff = isDifferent(propKey);
              return (
                <tr
                  class={hasDiff ? 'different' : ''}
                  style={{
                    'animation-delay': `${index() * 0.08}s`
                  }}
                >
                  <td class="property-label">{propKey}</td>
                  <For each={props.products}>
                    {(product) => (
                      <td
                        class={`property-value ${hasDiff ? 'different' : ''}`}
                      >
                        {product.properties[propKey] ?? '-'}
                      </td>
                    )}
                  </For>
                </tr>
              );
            }}
          </For>
        </tbody>
      </table>
    </div>
  );
};

export default ComparisonTable;
