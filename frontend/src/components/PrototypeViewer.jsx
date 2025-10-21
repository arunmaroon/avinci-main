import React, { useRef, useEffect, useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  MinusIcon, 
  PlusIcon,
  ArrowsPointingOutIcon,
  ArrowLeftIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const PrototypeViewer = ({ ast, prototypeName, onClose }) => {
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [currentScreen, setCurrentScreen] = useState(0);

  const screens = ast?.filter(node => node.type === 'FRAME') || [];

  // Handle zoom
  const handleZoom = (direction) => {
    const newZoom = direction === 'in' 
      ? Math.min(zoom * 1.2, 3) 
      : Math.max(zoom / 1.2, 0.1);
    setZoom(newZoom);
  };

  // Reset view
  const resetView = () => {
    setZoom(1);
  };

  // Navigate screens
  const nextScreen = () => {
    if (currentScreen < screens.length - 1) {
      setCurrentScreen(currentScreen + 1);
    }
  };

  const prevScreen = () => {
    if (currentScreen > 0) {
      setCurrentScreen(currentScreen - 1);
    }
  };

  // Render Figma node as HTML
  const renderNode = (node, parentX = 0, parentY = 0) => {
    if (!node) return null;

    const x = (node.layout?.x || 0) + parentX;
    const y = (node.layout?.y || 0) + parentY;
    const width = node.layout?.width || 100;
    const height = node.layout?.height || 100;

    // Get fill color
    const fillColor = node.styles?.fills?.[0]?.color;
    const colorString = fillColor 
      ? `rgba(${Math.round(fillColor.r * 255)}, ${Math.round(fillColor.g * 255)}, ${Math.round(fillColor.b * 255)}, ${fillColor.a || 1})`
      : 'rgba(255, 255, 255, 1)';

    // Get corner radius
    const cornerRadius = node.styles?.cornerRadius || 0;

    const style = {
      position: 'absolute',
      left: x,
      top: y,
      width,
      height,
      backgroundColor: colorString,
      border: '1px solid #ddd',
      borderRadius: cornerRadius,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      overflow: 'hidden'
    };

    if (node.type === 'TEXT' && node.text) {
      const textColor = node.styles?.fills?.[0]?.color 
        ? `rgba(${Math.round(node.styles.fills[0].color.r * 255)}, ${Math.round(node.styles.fills[0].color.g * 255)}, ${Math.round(node.styles.fills[0].color.b * 255)}, ${node.styles.fills[0].color.a || 1})`
        : '#000';

      return (
        <div
          key={node.id}
          style={{
            ...style,
            display: 'flex',
            alignItems: 'center',
            padding: '8px',
            fontSize: node.fontSize || 16,
            fontFamily: node.fontFamily || 'Inter, sans-serif',
            color: textColor,
            textAlign: node.textAlign || 'left'
          }}
        >
          {node.text}
        </div>
      );
    }

    return (
      <div key={node.id} style={style}>
        {node.children?.map(child => renderNode(child, x, y))}
      </div>
    );
  };

  if (!ast || screens.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-gray-400 text-2xl">?</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No prototype data</h3>
          <p className="text-sm text-gray-500">Unable to load prototype structure</p>
        </div>
      </div>
    );
  }

  const currentScreenData = screens[currentScreen];

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {prototypeName || 'Prototype Viewer'}
          </h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>Screen {currentScreen + 1} of {screens.length}</span>
            {currentScreenData?.name && (
              <span>• {currentScreenData.name}</span>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Screen Navigation */}
          <div className="flex items-center space-x-1">
            <button
              onClick={prevScreen}
              disabled={currentScreen === 0}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeftIcon className="w-4 h-4" />
            </button>
            <button
              onClick={nextScreen}
              disabled={currentScreen === screens.length - 1}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center space-x-1 border-l border-gray-200 pl-4">
            <button
              onClick={() => handleZoom('out')}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <MinusIcon className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600 min-w-[3rem] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => handleZoom('in')}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
            <button
              onClick={resetView}
              className="p-2 text-gray-400 hover:text-gray-600"
              title="Reset view"
            >
              <ArrowsPointingOutIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Canvas Container */}
      <div 
        ref={containerRef}
        className="flex-1 relative overflow-auto bg-gray-100 p-4"
        style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
      >
        <div className="relative bg-white shadow-lg mx-auto" style={{ 
          width: currentScreenData?.layout?.width || 375,
          height: currentScreenData?.layout?.height || 812,
          minWidth: currentScreenData?.layout?.width || 375,
          minHeight: currentScreenData?.layout?.height || 812
        }}>
          {/* Render current screen */}
          {currentScreenData && renderNode(currentScreenData)}
        </div>
      </div>

      {/* Screen Thumbnails */}
      {screens.length > 1 && (
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex space-x-2 overflow-x-auto">
            {screens.map((screen, index) => (
              <button
                key={screen.id}
                onClick={() => setCurrentScreen(index)}
                className={`flex-shrink-0 w-16 h-12 rounded border-2 transition-colors ${
                  index === currentScreen
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">
                    {index + 1}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PrototypeViewer;
