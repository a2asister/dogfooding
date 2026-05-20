import * as Blockly from 'blockly';

export const initTheme = () => {
  Blockly.Themes.define('kids', {
    base: Blockly.Themes.Classic,
    componentStyles: {
      workspaceBackgroundColour: '#F8F9FA',
      toolboxBackgroundColour: '#FFFFFF',
      toolboxForegroundColour: '#333333',
      flyoutBackgroundColour: '#FFFFFF',
      flyoutForegroundColour: '#333333',
      flyoutOpacity: 1,
      scrollbarColour: '#CCCCCC',
      scrollbarOpacity: 0.8,
      insertionMarkerColour: '#5C6BC0',
      insertionMarkerOpacity: 0.3,
      fieldColour: '#FFFFFF',
      fieldBorderColour: '#DDDDDD',
      fieldTextColour: '#333333',
    },
    fontStyles: {
      family: "'Microsoft YaHei', 'PingFang SC', sans-serif",
      weight: 'normal',
      size: 14,
    },
    startHats: true,
  });
};

export const blocklyOptions = {
  theme: 'kids',
  grid: {
    spacing: 20,
    length: 3,
    colour: '#E0E0E0',
    snap: true,
  },
  zoom: {
    controls: true,
    wheel: true,
    startScale: 1.0,
    maxScale: 3,
    minScale: 0.5,
    scaleSpeed: 1.2,
  },
  trashcan: true,
  move: {
    scrollbars: true,
    drag: true,
    wheel: false,
  },
  renderer: 'zelos',
};
